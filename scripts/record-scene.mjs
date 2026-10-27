#!/usr/bin/env node
/**
 * record-scene.mjs — render a director scene to a smooth mp4, frame by frame.
 *
 * A screen recording keeps every stutter of a slow machine. This instead
 * takes over the page's clock (performance.now, Date, requestAnimationFrame,
 * timers, CSS animations and <video> playback) and advances it exactly one
 * frame at a time. Before each screenshot it waits for the photoreal tiles
 * and every playing clip to catch up, so the video is smooth however long a
 * frame takes to draw. Frames are piped into ffmpeg; nothing is played live.
 *
 * Usage: node scripts/record-scene.mjs [options]
 *   --url http://127.0.0.1:42003   a running dev server
 *   --scene singapore-haze-2026    scene id
 *   --from 1 --to 12               1-based shot range (default: all)
 *   --fps 30 --width 1920 --height 1080
 *   --out recordings/<scene>.mp4
 *   --hud                          keep the tactical HUD
 *   --scope                        keep the round scope mask
 *   --no-titles                    hide the shot-title caption
 *   --fov 75                       field of view in degrees across the longer
 *                                  side (default 60; 75 for portrait, so wide
 *                                  shots still reach across the region)
 *   --chrome <path>                Chrome binary (default: installed Google Chrome)
 * Writes <out> and <out>.frames.json (one entry per frame, for checking).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index < 0 ? fallback : args[index + 1];
};
const flag = (name) => args.includes(`--${name}`);
const url = option('url', 'http://127.0.0.1:42003');
const sceneId = option('scene', 'singapore-haze-2026');
const fps = Number(option('fps', 30));
const width = Number(option('width', 1920));
const height = Number(option('height', 1080));
const from = Number(option('from', 1));
const to = option('to') ? Number(option('to')) : null;
const out = path.resolve(option('out', `recordings/${sceneId}.mp4`));
// Cesium's field of view spans the longer side, which in a portrait frame is
// the height, leaving it narrow across; widen it so wide shots still fit.
const fov = Number(option('fov', height > width ? 75 : 60));
const chrome = option(
  'chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
);
// Longest a single frame may wait for tiles and clips before it is taken anyway.
const MAX_FRAME_WAIT_MS = 20000;

/** Installed before any page script: a clock that can be switched to virtual. */
function installVirtualClock() {
  const real = {
    now: performance.now.bind(performance),
    dateNow: Date.now,
    Date,
    raf: window.requestAnimationFrame.bind(window),
    caf: window.cancelAnimationFrame.bind(window),
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window),
    play: HTMLMediaElement.prototype.play,
    pause: HTMLMediaElement.prototype.pause,
  };
  const clock = {
    virtual: false,
    now: 0,
    dateBase: 0,
    frames: new Map(),
    timers: new Map(),
    nextId: 1e9,
    animations: new WeakMap(),
  };
  performance.now = () => (clock.virtual ? clock.now : real.now());
  const dateNow = () =>
    clock.virtual ? Math.round(clock.dateBase + clock.now) : real.dateNow();
  function VirtualDate(...parts) {
    if (!new.target) return new real.Date(dateNow()).toString();
    return parts.length ? new real.Date(...parts) : new real.Date(dateNow());
  }
  VirtualDate.prototype = real.Date.prototype;
  VirtualDate.now = dateNow;
  VirtualDate.parse = real.Date.parse;
  VirtualDate.UTC = real.Date.UTC;
  window.Date = VirtualDate;

  window.requestAnimationFrame = (callback) => {
    if (!clock.virtual) return real.raf(callback);
    const id = clock.nextId++;
    clock.frames.set(id, callback);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    if (!clock.frames.delete(id)) real.caf(id);
  };
  const schedule = (callback, delay, repeat, extra) => {
    if (!clock.virtual)
      return (repeat ? real.setInterval : real.setTimeout)(callback, delay, ...extra);
    const id = clock.nextId++;
    const ms = Math.max(0, Number(delay) || 0);
    clock.timers.set(id, { callback, extra, at: clock.now + ms, every: repeat ? Math.max(1, ms) : 0 });
    return id;
  };
  window.setTimeout = (callback, delay, ...extra) => schedule(callback, delay, false, extra);
  window.setInterval = (callback, delay, ...extra) => schedule(callback, delay, true, extra);
  window.clearTimeout = (id) => {
    if (!clock.timers.delete(id)) real.clearTimeout(id);
  };
  window.clearInterval = (id) => {
    if (!clock.timers.delete(id)) real.clearInterval(id);
  };

  // Clips: while virtual, a "playing" video stays paused and is seeked to
  // where it would be, frame by frame.
  HTMLMediaElement.prototype.play = function play() {
    if (!clock.virtual) return real.play.call(this);
    if (!this.__virtualPlaying) {
      this.__virtualPlaying = true;
      this.__virtualStart = clock.now;
      this.__virtualBase = this.currentTime;
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
    }
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function pause() {
    if (this.__virtualPlaying) {
      this.__virtualBase = this.__virtualTime ?? this.currentTime;
      this.__virtualPlaying = false;
    }
    return real.pause.call(this);
  };

  function runTimers() {
    for (let guard = 0; guard < 10000; guard++) {
      let next = null;
      for (const [id, timer] of clock.timers)
        if (timer.at <= clock.now && (!next || timer.at < next[1].at)) next = [id, timer];
      if (!next) return;
      const [id, timer] = next;
      if (timer.every) timer.at += timer.every;
      else clock.timers.delete(id);
      try {
        if (typeof timer.callback === 'function') timer.callback(...timer.extra);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function syncAnimations() {
    for (const animation of document.getAnimations()) {
      let start = clock.animations.get(animation);
      if (start === undefined) {
        start = clock.now - (Number(animation.currentTime) || 0);
        clock.animations.set(animation, start);
        animation.pause();
      }
      const timing = animation.effect?.getComputedTiming?.();
      const elapsed = clock.now - start;
      if (timing && Number.isFinite(timing.endTime) && elapsed >= timing.endTime)
        animation.finish();
      else animation.currentTime = elapsed;
    }
  }

  async function syncVideos() {
    const seeks = [];
    for (const video of document.querySelectorAll('video')) {
      // A clip that started on its own (autoplay) is taken over here.
      if (!video.paused && !video.__virtualPlaying) {
        real.pause.call(video);
        video.__virtualPlaying = true;
        video.__virtualStart = clock.now;
        video.__virtualBase = video.currentTime;
      }
      if (!video.__virtualPlaying) continue;
      let time = video.__virtualBase + ((clock.now - video.__virtualStart) / 1000) * (video.playbackRate || 1);
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        if (video.loop) time %= duration;
        else time = Math.min(time, duration - 0.001);
      }
      video.__virtualTime = time;
      if (video.readyState < 1) {
        seeks.push(new Promise((resolve) => video.addEventListener('loadedmetadata', resolve, { once: true })));
        continue;
      }
      if (Math.abs(video.currentTime - time) < 0.0005 && video.readyState >= 2) continue;
      seeks.push(new Promise((resolve) => {
        video.addEventListener('seeked', resolve, { once: true });
        video.currentTime = time;
      }));
    }
    await Promise.race([Promise.all(seeks), new Promise((resolve) => real.setTimeout(resolve, 3000))]);
    return seeks.length;
  }

  window.__virtualClock = {
    start() {
      clock.now = real.now();
      clock.dateBase = real.dateNow() - clock.now;
      clock.virtual = true;
    },
    get now() {
      return clock.now;
    },
    /** Advance `ms`, run due timers, then one animation frame. */
    step(ms) {
      clock.now += ms;
      runTimers();
      syncAnimations();
      const frames = [...clock.frames];
      clock.frames.clear();
      for (const [, callback] of frames) {
        try {
          callback(clock.now);
        } catch (error) {
          console.error(error);
        }
      }
      runTimers();
    },
    syncVideos,
    realDelay: (ms) => new Promise((resolve) => real.setTimeout(resolve, ms)),
  };
}

async function main() {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: [
      '--no-sandbox',
      '--use-angle=metal',
      '--ignore-gpu-blocklist',
      '--autoplay-policy=no-user-gesture-required',
      `--window-size=${width},${height}`,
    ],
  });
  const ffmpeg = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffmpegDone = new Promise((resolve, reject) =>
    ffmpeg.on('close', (code) => (code ? reject(new Error(`ffmpeg exited ${code}`)) : resolve())));

  try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => console.warn('[page]', error.message.slice(0, 200)));
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(installVirtualClock);
    await page.goto(`${url}/?welcome=0`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => window.__godsEyeView?.sceneDirector &&
        document.getElementById('loading-screen')?.classList.contains('hidden'),
      { timeout: 240000 },
    );

    // Put the camera where the first recorded shot starts and let its tiles load.
    const range = await page.evaluate((sceneId, from, to) => {
      const director = window.__godsEyeView.sceneDirector;
      const scene = director._project.scenes.find(({ id }) => id === sceneId);
      if (!scene) throw new Error(`No scene ${sceneId}`);
      const shots = scene.shots;
      const first = Math.max(0, from - 1);
      const last = Math.min(shots.length - 1, (to ?? shots.length) - 1);
      director.styleManager.applyCameraState(shots[Math.max(0, first - 1)].camera, 0.2);
      return {
        titles: shots.slice(first, last + 1).map(({ title }) => title),
        afterShotId: first > 0 ? shots[first - 1].id : null,
        stopShotId: shots[last + 1]?.id ?? null,
        seconds: shots.slice(first, last + 1).reduce(
          (sum, shot) => sum + (shot.durationSec || 0) + (shot.holdSec || 0), 0),
      };
    }, sceneId, from, to);
    console.log(`Recording ${range.titles.length} shots, about ${Math.round(range.seconds)} s:`);
    for (const title of range.titles) console.log(`  ${title}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.waitForFunction(() => window.__godsEyeView.tileset?.tilesLoaded !== false, { timeout: 60000 }).catch(() => {});

    // Shots turn the HUD back on as they load, so it is hidden by style.
    await page.addStyleTag({
      content: `#safe-frame-overlay, #world-overlay-actions, .gev-screen-whiteboard${flag('hud') ? '' : ', #intel-hud'}${flag('no-titles') ? ', [data-scene-caption]' : ''} { display: none !important; }`,
    });
    await page.evaluate((degrees) => {
      window.__godsEyeView.viewer.camera.frustum.fov = (degrees * Math.PI) / 180;
    }, fov);
    if (!flag('scope'))
      await page.evaluate(async () => (await import('/src/scopeMask.js')).setScopeMaskEnabled(false));

    // From here on the page only moves when we step its clock.
    await page.evaluate((sceneId, afterShotId) => {
      window.__virtualClock.start();
      const director = window.__godsEyeView.sceneDirector;
      window.__recordRun = director.startScene(sceneId, { single: true, afterShotId });
    }, sceneId, range.afterShotId);

    const frameMs = 1000 / fps;
    const log = [];
    const started = Date.now();
    const maxFrames = Math.ceil((range.seconds + 30) * fps);
    for (let frame = 0; frame < maxFrames; frame++) {
      const state = await page.evaluate(async (frameMs, stopShotId, maxWait) => {
        const clock = window.__virtualClock;
        const director = window.__godsEyeView.sceneDirector;
        const tileset = window.__godsEyeView.tileset;
        clock.step(frameMs);
        let waited = 0;
        let seeks = await clock.syncVideos();
        // Redraw only the map at this instant until its tiles are in. The
        // story's own frame callbacks must not run again: the wind trails
        // fade a little on every one of them.
        const scene = window.__godsEyeView.viewer.scene;
        const time = window.__godsEyeView.viewer.clock.currentTime;
        while (tileset && !tileset.tilesLoaded && waited < maxWait) {
          await clock.realDelay(40);
          waited += 40;
          scene.render(time);
        }
        seeks += await clock.syncVideos();
        const status = director.getPlaybackStatus();
        return {
          t: clock.now,
          waited,
          seeks,
          shot: status.selectedShotId,
          done: !status.running || (stopShotId && status.selectedShotId === stopShotId),
          ticker: document.querySelector('[data-scene-fire-story]')?.textContent?.slice(0, 80) ?? '',
        };
      }, frameMs, range.stopShotId, MAX_FRAME_WAIT_MS);
      if (state.done) break;
      const jpeg = await page.screenshot({ type: 'jpeg', quality: 92, optimizeForSpeed: true });
      if (!ffmpeg.stdin.write(jpeg)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
      log.push({ frame, ...state });
      if (frame % fps === 0) {
        const rate = (frame + 1) / ((Date.now() - started) / 1000);
        console.log(`${(frame / fps).toFixed(0).padStart(4)} s  ${rate.toFixed(2)} frames/s  ${state.ticker.slice(0, 60)}`);
      }
    }
    fs.writeFileSync(`${out}.frames.json`, JSON.stringify(log));
    await page.evaluate(() => window.__godsEyeView.sceneDirector.stopScene?.('Recording finished'));
    console.log(`${log.length} frames (${(log.length / fps).toFixed(1)} s) in ${((Date.now() - started) / 60000).toFixed(1)} min`);
  } finally {
    ffmpeg.stdin.end();
    await ffmpegDone.catch((error) => console.error(error.message));
    await browser.close();
  }
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
}

await main();
