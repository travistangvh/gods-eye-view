import * as Cesium from 'cesium';
import { formatDate, t } from '../i18n/index.js';
import { createSceneClipPlayer } from './sceneClips.js';
import { createSceneHaze } from './sceneHaze.js';

/**
 * A shot's fire story: satellite fire detections light up day by day under a
 * date ticker that speeds up as it runs, and "beats" — labelled places whose
 * clips play in glowing cards pinned to them — start on their dates and may
 * overlap. A `plunge` beat's card grows from its pin to fill the screen, as
 * if the camera dived into the footage, then shrinks back into the map.
 * Close views can ask for `flames`: Cesium particle flames and smoke rising
 * from the burning detections nearest a place, drawn on the 3D map itself.
 * A `haze` block adds satellite smoke, wind trails, the PM2.5 cloud and a haze
 * tint (see sceneHaze.js), and its `readout` replaces the detection count.
 *
 * Detections come from a file written by `npm run fires:fetch`:
 * { start: 'YYYY-MM-DD', fires: [[lat, lon, day, frp], ...] }, sorted by day.
 * A detection is bright on its day, orange for two more, an ember for three
 * weeks, then a faint scar, so new fires stand out from old ones.
 */

const DAY_MS = 86400000;
const BRIGHT = Cesium.Color.fromCssColorString('#ffe9a3');
const BRIGHT_GLOW = Cesium.Color.fromCssColorString('#ff8a1e').withAlpha(0.55);
const ORANGE = Cesium.Color.fromCssColorString('#ff7a1a').withAlpha(0.95);
const EMBER = Cesium.Color.fromCssColorString('#c0301c').withAlpha(0.55);
const SCAR = Cesium.Color.fromCssColorString('#7a1c12').withAlpha(0.25);
/** Days after which a detection is drawn as a faint scar and never changes. */
const SCAR_AFTER_DAYS = 21;
const GLOW_STYLE_ID = 'scene-fire-story-style';
/** Seconds a beat without a clip keeps its card-less label highlighted. */
const DEFAULT_BEAT_SECONDS = 4;
/** Ticker easing exponent: above 1 the days pass faster and faster. */
const DEFAULT_EASE = 1.6;

const FLAME_DAYS = 2;
const dataCache = new Map();
const selectionCache = new Map();

/** Day index of an ISO date relative to the data's start date. */
export function dayIndex(start, date) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS);
}

/** ISO date `days` after `start`. */
export function dateAfter(start, days) {
  return new Date(Date.parse(`${start}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * Time a story. After an optional `delay`, the ticker runs from `from` to `to`
 * over `seconds`, accelerating (`ease` > 1). Each beat starts when the ticker
 * reaches its date, or at `at` seconds when it has no date, and lasts for its
 * clip; beats may overlap.
 *
 * @returns {{fromDay: number, toDay: number, delay: number, seconds: number, ease: number, beats: Array<{start: number, end: number}>, total: number}}
 */
export function buildFireTimeline(story, dataStart) {
  const fromDay = dayIndex(dataStart, story.from);
  const toDay = Math.max(fromDay, dayIndex(dataStart, story.to ?? story.from));
  const delay = Math.max(0, Number(story.delay) || 0);
  const seconds = Math.max(0.1, Number(story.seconds) || 10);
  const ease = Math.max(0.2, Number(story.ease) || DEFAULT_EASE);
  const span = Math.max(1, toDay - fromDay);
  const beats = (story.beats || []).map((beat) => {
    const start = beat.date
      ? delay +
        seconds *
          Math.min(1, Math.max(0, (dayIndex(dataStart, beat.date) - fromDay) / span)) **
            (1 / ease)
      : Math.max(0, Number(beat.at) || 0);
    return { start, end: start + beatSeconds(beat) };
  });
  const total = Math.max(delay + seconds, ...beats.map((beat) => beat.end));
  return { fromDay, toDay, delay, seconds, ease, beats, total };
}

/** Seconds a beat lasts: its clip, or its `hold`. */
export function beatSeconds(beat) {
  return Number(beat.clip?.seconds) || Number(beat.hold) || DEFAULT_BEAT_SECONDS;
}

/**
 * Where the story is at `seconds`: the fractional day shown, which beats have
 * started, and which are playing. Past the end it stays on the last day.
 */
export function sampleFireTimeline(timeline, seconds) {
  const progress = Math.min(
    1,
    Math.max(0, (seconds - timeline.delay) / timeline.seconds),
  );
  const day =
    timeline.fromDay + (timeline.toDay - timeline.fromDay) * progress ** timeline.ease;
  const started = [];
  const playing = [];
  timeline.beats.forEach((beat, index) => {
    if (seconds >= beat.start) started.push(index);
    if (seconds >= beat.start && seconds < beat.end) playing.push(index);
  });
  return { day, started, playing };
}

/**
 * Detections inside `bbox` ([west, south, east, north]), optionally merged to
 * one per `cell`-degree square per day so wide views stay light.
 */
export function selectFires(fires, { bbox = null, cell = 0 } = {}) {
  const inside = bbox
    ? ([lat, lon]) => lon >= bbox[0] && lat >= bbox[1] && lon <= bbox[2] && lat <= bbox[3]
    : () => true;
  if (!cell) return fires.filter(inside);
  const merged = new Map();
  for (const fire of fires) {
    if (!inside(fire)) continue;
    const lat = Math.round(fire[0] / cell) * cell;
    const lon = Math.round(fire[1] / cell) * cell;
    const key = `${lat.toFixed(3)},${lon.toFixed(3)},${fire[2]}`;
    const known = merged.get(key);
    if (known) known[3] = Math.max(known[3], fire[3]);
    else merged.set(key, [lat, lon, fire[2], fire[3]]);
  }
  return [...merged.values()].sort((a, b) => a[2] - b[2]);
}

/** Detections per day inside `bbox`, before any merging. */
export function dailyCounts(fires, bbox = null) {
  const counts = new Map();
  for (const [lat, lon, day] of fires) {
    if (bbox && !(lon >= bbox[0] && lat >= bbox[1] && lon <= bbox[2] && lat <= bbox[3])) continue;
    counts.set(day, (counts.get(day) || 0) + 1);
  }
  return counts;
}

function loadFires(url) {
  if (!dataCache.has(url))
    dataCache.set(
      url,
      fetch(url).then((response) => {
        if (!response.ok) throw new Error(`Fire data ${response.status}`);
        return response.json();
      }),
    );
  return dataCache.get(url);
}

function injectStyle(doc) {
  if (doc.getElementById(GLOW_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = GLOW_STYLE_ID;
  style.textContent = `
@keyframes scene-fire-glow {
  0%, 100% { box-shadow: 0 0 14px 3px rgba(255, 120, 30, 0.55); }
  50% { box-shadow: 0 0 30px 9px rgba(255, 170, 60, 0.9); }
}
@keyframes scene-fire-ring {
  0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.95; }
  100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
}`;
  doc.head.append(style);
}

/**
 * Burning detections to draw flames at: those at most `FLAME_DAYS` old
 * within `radiusKm` of a place, nearest first, at most `max` of them.
 */
export function flameSites(fires, today, { lat, lon, radiusKm = 6, max = 40 }) {
  const kmPerDegree = 111.32;
  const cos = Math.cos((lat * Math.PI) / 180);
  return fires
    .filter(([, , day]) => day <= today && today - day < FLAME_DAYS)
    .map((fire) => ({
      fire,
      km: Math.hypot((fire[0] - lat) * kmPerDegree, (fire[1] - lon) * kmPerDegree * cos),
    }))
    .filter(({ km }) => km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, max)
    .map(({ fire }) => fire);
}

/** A soft round sprite for particles, drawn once. */
function sprite(doc, stops) {
  const canvas = doc.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return canvas;
}

/** Particle flames and smoke at burning sites; returns an updater. */
function createFlames(viewer, doc) {
  const C = Cesium;
  const fire = sprite(doc, [
    [0, 'rgba(255, 250, 220, 1)'],
    [0.35, 'rgba(255, 170, 40, 0.9)'],
    [1, 'rgba(255, 60, 0, 0)'],
  ]);
  const smoke = sprite(doc, [
    [0, 'rgba(120, 112, 104, 0.85)'],
    [1, 'rgba(120, 112, 104, 0)'],
  ]);
  const systems = new Map();
  const drift = new C.Cartesian3();
  const clock = viewer.clock;
  const previous = { animate: clock?.shouldAnimate, multiplier: clock?.multiplier };
  // Particles advance with the scene clock, which the app leaves stopped.
  if (clock) {
    clock.shouldAnimate = true;
    clock.multiplier = 1;
  }

  function add(key, lat, lon, height) {
    const matrix = C.Transforms.eastNorthUpToFixedFrame(
      C.Cartesian3.fromDegrees(lon, lat, height),
    );
    // Smoke leans downwind as it rises; flames stay low and bright.
    const wind = C.Matrix4.multiplyByPointAsVector(
      matrix,
      new C.Cartesian3(-3, 4, 0),
      new C.Cartesian3(),
    );
    // Settle onto the 3D map's actual surface once its tiles can answer;
    // until then the guessed height keeps the fire visible above the canopy.
    viewer.scene
      .clampToHeightMostDetailed?.([C.Cartesian3.fromDegrees(lon, lat, height)])
      .then(([surface]) => {
        const pair = systems.get(key);
        if (!surface || !pair) return;
        const grounded = C.Transforms.eastNorthUpToFixedFrame(surface);
        for (const system of pair) system.modelMatrix = grounded;
      })
      .catch(() => {});
    const flames = new C.ParticleSystem({
      image: fire,
      modelMatrix: matrix,
      emitter: new C.CircleEmitter(90),
      emissionRate: 90,
      startColor: C.Color.fromCssColorString('#ffd27a').withAlpha(0.95),
      endColor: C.Color.fromCssColorString('#ff3c00').withAlpha(0),
      startScale: 1,
      endScale: 2.6,
      minimumParticleLife: 0.6,
      maximumParticleLife: 1.6,
      minimumSpeed: 12,
      maximumSpeed: 32,
      sizeInMeters: true,
      minimumImageSize: new C.Cartesian2(55, 55),
      maximumImageSize: new C.Cartesian2(120, 120),
    });
    const plume = new C.ParticleSystem({
      image: smoke,
      modelMatrix: matrix,
      emitter: new C.CircleEmitter(110),
      emissionRate: 10,
      startColor: C.Color.fromCssColorString('#5c5650').withAlpha(0.6),
      endColor: C.Color.fromCssColorString('#a39c94').withAlpha(0),
      startScale: 1,
      endScale: 6,
      minimumParticleLife: 6,
      maximumParticleLife: 10,
      minimumSpeed: 15,
      maximumSpeed: 35,
      sizeInMeters: true,
      minimumImageSize: new C.Cartesian2(120, 120),
      maximumImageSize: new C.Cartesian2(220, 220),
      updateCallback: (particle, dt) => {
        C.Cartesian3.multiplyByScalar(wind, dt, drift);
        C.Cartesian3.add(particle.velocity, drift, particle.velocity);
      },
    });
    const primitives = viewer.scene.primitives;
    systems.set(key, [primitives.add(flames), primitives.add(plume)]);
  }

  return {
    /** Keep flames at exactly these sites. */
    set(sites) {
      const wanted = new Map(sites.map((site) => [`${site[0]},${site[1]}`, site]));
      for (const [key, pair] of systems)
        if (!wanted.has(key)) {
          for (const system of pair) viewer.scene.primitives.remove(system);
          systems.delete(key);
        }
      for (const [key, [lat, lon]] of wanted) {
        if (systems.has(key)) continue;
        const ground = viewer.scene.sampleHeight?.(C.Cartographic.fromDegrees(lon, lat));
        add(key, lat, lon, Number.isFinite(ground) ? ground : 90);
      }
    },
    get active() {
      return systems.size > 0;
    },
    destroy() {
      this.set([]);
      if (clock) {
        clock.shouldAnimate = previous.animate;
        clock.multiplier = previous.multiplier;
      }
    },
  };
}

/**
 * @param {object} viewer - Cesium viewer
 * @param {Document} [doc]
 * @returns {{show: (story: ?object) => void, hide: () => void, destroy: () => void}}
 */
export function createSceneFireStory(viewer, doc = globalThis.document) {
  let run = null;
  const scratch = new Cesium.Cartesian2();

  function hide() {
    if (!run) return;
    run.cancelled = true;
    cancelAnimationFrame(run.frame);
    run.root.remove();
    if (run.points && !viewer.isDestroyed?.())
      viewer.scene.primitives.remove(run.points);
    run.flames?.destroy();
    run.haze?.destroy();
    viewer.scene?.requestRender?.();
    run = null;
  }

  function element(tag, style, text) {
    const node = doc.createElement(tag);
    Object.assign(node.style, style);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildTicker(root) {
    const box = element('div', {
      position: 'absolute',
      top: '64px',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      color: '#ffe9c7',
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
      font: '700 30px/1.1 system-ui, sans-serif',
      letterSpacing: '0.04em',
    });
    const date = element('div', {});
    const count = element('div', {
      font: '500 14px/1.4 system-ui, sans-serif',
      letterSpacing: '0',
      color: '#ffc58f',
    });
    box.append(date, count);
    root.append(box);
    return { date, count };
  }

  function buildMarker(root, beat) {
    const marker = element('div', {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      opacity: '0',
      transition: 'opacity 0.6s',
    });
    const ring = element('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '26px',
      height: '26px',
      borderRadius: '50%',
      border: '2px solid #ffb04a',
      animation: 'scene-fire-ring 1.6s ease-out infinite',
    });
    const dot = element('div', {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#ffd27a',
      boxShadow: '0 0 10px 3px rgba(255, 150, 40, 0.9)',
    });
    const label = element('div', {
      position: 'absolute',
      left: '14px',
      top: '-8px',
      whiteSpace: 'nowrap',
      color: '#fff3e0',
      textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)',
      font: '700 15px/1.2 system-ui, sans-serif',
    }, beat.label);
    if (beat.sub)
      label.append(
        element('div', { font: '500 12px/1.3 system-ui, sans-serif', color: '#ffc58f' }, beat.sub),
      );
    marker.append(ring, dot, label);
    root.append(marker);
    return marker;
  }

  /** A clip that grows from its pin to fill the screen, and back. */
  function buildPlunge(root, beat, anchor) {
    const card = element('figure', {
      position: 'fixed',
      margin: '0',
      left: `${anchor.x - 20}px`,
      top: `${anchor.y - 20}px`,
      width: '40px',
      height: '40px',
      background: '#000',
      borderRadius: '50%',
      overflow: 'hidden',
      opacity: '0.2',
      transition:
        'left 0.9s cubic-bezier(0.7, 0, 0.3, 1), top 0.9s cubic-bezier(0.7, 0, 0.3, 1), width 0.9s cubic-bezier(0.7, 0, 0.3, 1), height 0.9s cubic-bezier(0.7, 0, 0.3, 1), border-radius 0.9s, opacity 0.4s',
    });
    const video = createSceneClipPlayer(doc, {
      videoId: beat.clip.videoId,
      start: beat.clip.start,
      seconds: beat.clip.seconds,
      title: beat.clip.credit || beat.label,
      autoplay: true,
    });
    video.loop = false;
    Object.assign(video.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      // A vertical phone or drone clip keeps its whole frame.
      objectFit: beat.clip.portrait ? 'contain' : 'cover',
      background: '#000',
    });
    const caption = element('figcaption', {
      position: 'absolute',
      left: '0',
      right: '0',
      bottom: '0',
      padding: '14px 20px 18px',
      background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.85))',
      color: '#ffe9c7',
      font: '600 15px/1.35 system-ui, sans-serif',
      textAlign: 'center',
    }, [beat.label, beat.sub, beat.clip.credit].filter(Boolean).join(' · '));
    card.append(video, caption);
    root.append(card);
    requestAnimationFrame(() =>
      Object.assign(card.style, {
        left: '0px',
        top: '0px',
        width: '100vw',
        height: '100vh',
        borderRadius: '0',
        opacity: '1',
      }),
    );
    card.plunge = true;
    return card;
  }

  function buildCard(root, beat) {
    const portrait = !!beat.clip.portrait;
    // Sized so two or three can share the screen while they overlap.
    const card = element('figure', {
      position: 'absolute',
      margin: '0',
      width: portrait ? 'min(14vw, calc(36vh * 9 / 16))' : 'min(24vw, 360px)',
      background: '#000',
      border: '1px solid rgba(255, 170, 70, 0.9)',
      borderRadius: '6px',
      overflow: 'hidden',
      opacity: '0',
      transform: 'scale(0.85)',
      transition: 'opacity 0.5s, transform 0.5s',
      animation: 'scene-fire-glow 1.8s ease-in-out infinite',
    });
    const video = createSceneClipPlayer(doc, {
      videoId: beat.clip.videoId,
      start: beat.clip.start,
      seconds: beat.clip.seconds,
      title: beat.clip.credit || beat.label,
      autoplay: true,
    });
    video.loop = false;
    Object.assign(video.style, {
      display: 'block',
      width: '100%',
      aspectRatio: portrait ? '9 / 16' : '16 / 9',
      objectFit: 'cover',
      background: '#000',
    });
    const caption = element('figcaption', {
      padding: '4px 8px',
      background: 'rgba(8, 6, 4, 0.9)',
      color: '#ffd9bf',
      font: '600 12px/1.3 system-ui, sans-serif',
    }, beat.clip.credit || '');
    card.append(video, caption);
    root.append(card);
    requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });
    return card;
  }

  /** Place a pinned element at a globe position; false when it is not visible. */
  function place(node, position, occluder, offsetX = 0, offsetY = 0) {
    const scene = viewer.scene;
    const screen =
      occluder.isPointVisible(position) &&
      Cesium.SceneTransforms.worldToWindowCoordinates(scene, position, scratch);
    if (!screen) {
      node.style.display = 'none';
      return null;
    }
    const canvas = scene.canvas.getBoundingClientRect();
    const x = canvas.left + screen.x;
    const y = canvas.top + screen.y;
    node.style.display = '';
    node.style.left = `${x + offsetX}px`;
    node.style.top = `${y + offsetY}px`;
    return { x, y };
  }

  /**
   * Card above its place, on the side `preferRight` asks for when it fits, so
   * overlapping cards for neighbouring places alternate sides.
   */
  function placeCard(card, anchor, preferRight) {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const fitsRight = anchor.x + 28 + width < innerWidth - 16;
    const fitsLeft = anchor.x - 28 - width > 16;
    const right = preferRight ? fitsRight || !fitsLeft : !fitsLeft;
    const left = right ? anchor.x + 28 : anchor.x - 28 - width;
    // Below the date ticker, above the caption and dock.
    const top = Math.min(innerHeight - 150 - height, Math.max(132, anchor.y - height - 24));
    card.style.left = `${Math.max(16, left)}px`;
    card.style.top = `${top}px`;
  }

  /**
   * Colour, size and glow of a detection `age` days old. With `embers` off
   * only fires burning in the last three days show, so smoke can lead.
   */
  function styleFor(age, base, embers = true) {
    if (age < 1) return [BRIGHT, base + 3, 3];
    if (age < 3) return [ORANGE, base + 1, 0];
    if (!embers) return [Cesium.Color.TRANSPARENT, 1, 0];
    if (age < SCAR_AFTER_DAYS) return [EMBER, base, 0];
    return [SCAR, Math.max(2, base - 1), 0];
  }

  async function start(story) {
    const current = (run = {
      cancelled: false,
      frame: 0,
      root: element('div', {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        // Above the side panels, below the command dock.
        zIndex: '125',
      }),
    });
    current.root.dataset.sceneFireStory = '';
    doc.body.append(current.root);
    injectStyle(doc);
    const [data, weather] = await Promise.all([
      loadFires(story.data),
      story.haze ? loadFires(story.haze.data) : null,
    ]);
    if (current.cancelled) return;

    const key = JSON.stringify([story.data, story.bbox, story.cell]);
    if (!selectionCache.has(key))
      selectionCache.set(key, {
        fires: selectFires(data.fires, { bbox: story.bbox, cell: story.cell }),
        counts: dailyCounts(data.fires, story.bbox),
      });
    const { fires, counts } = selectionCache.get(key);
    const timeline = buildFireTimeline(story, data.start);
    const points = new Cesium.PointPrimitiveCollection({
      blendOption: Cesium.BlendOption.TRANSLUCENT,
    });
    // Merged wide views use small points; close views ask for larger ones,
    // which also grow as the camera nears the ground.
    const base = Number(story.size) || (story.cell ? 2.5 : 5);
    const nearScale = base > 6 ? new Cesium.NearFarScalar(800, 1.6, 40000, 0.8) : undefined;
    for (const [lat, lon] of fires)
      points.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 60),
        pixelSize: base,
        color: BRIGHT,
        outlineColor: BRIGHT_GLOW,
        outlineWidth: 0,
        show: false,
        scaleByDistance: nearScale,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    viewer.scene.primitives.add(points);
    current.points = points;
    const ticker = buildTicker(current.root);
    if (story.flames) current.flames = createFlames(viewer, doc);
    if (weather) current.haze = createSceneHaze(viewer, doc, current.root, story.haze, weather);
    const startMs = Date.parse(`${data.start}T00:00:00Z`);
    // Story seconds per real second while the ticker runs, to pace the wind.
    const compression =
      ((timeline.toDay - timeline.fromDay) * DAY_MS) / 1000 / timeline.seconds;
    const beats = (story.beats || []).map((beat) => ({
      beat,
      position: Cesium.Cartesian3.fromDegrees(beat.lon, beat.lat),
      marker: buildMarker(current.root, beat),
      card: null,
    }));

    // Points are sorted by day, so each age step is a moving cursor: only the
    // points crossing a step on a new day are restyled. Restyling every
    // recent point each day made Cesium re-upload the whole buffer and lag.
    let shown = 0;
    const steps = [1, 3, SCAR_AFTER_DAYS].map((age) => ({ age, cursor: 0 }));
    let lastDay = -1;
    const restyle = (index, age) => {
      const point = points.get(index);
      [point.color, point.pixelSize, point.outlineWidth] = styleFor(age, base, story.embers !== false);
    };
    const began = performance.now();

    const tick = () => {
      if (current.cancelled) return;
      const seconds = (performance.now() - began) / 1000;
      const { day, started, playing } = sampleFireTimeline(timeline, seconds);
      const today = Math.floor(day);
      if (today > lastDay) {
        lastDay = today;
        while (shown < fires.length && fires[shown][2] <= today) {
          points.get(shown).show = true;
          restyle(shown, today - fires[shown][2]);
          shown++;
        }
        for (const step of steps)
          while (step.cursor < shown && fires[step.cursor][2] <= today - step.age) {
            restyle(step.cursor, today - fires[step.cursor][2]);
            step.cursor++;
          }
        current.flames?.set(flameSites(fires, today, story.flames));
        const dateLabel = formatDate(new Date(`${dateAfter(data.start, today)}T00:00:00Z`), {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        });
        ticker.date.textContent = dateLabel;
        if (!story.haze?.readout)
          ticker.count.textContent = t('{count} fire detections that day · NASA VIIRS', {
            count: (counts.get(today) || 0).toLocaleString(),
          });
        viewer.scene.requestRender?.();
      }
      const reading = current.haze?.update(startMs + day * DAY_MS, compression);
      if (story.haze?.readout && Number.isFinite(reading))
        ticker.count.textContent = t('PM2.5 in {place}: {value} µg/m³ · CAMS model', {
          place: story.haze.readout.label,
          value: Math.round(reading),
        });
      const occluder = new Cesium.EllipsoidalOccluder(
        Cesium.Ellipsoid.WGS84,
        viewer.scene.camera.positionWC,
      );
      let plunging = false;
      beats.forEach((entry, index) => {
        const live = playing.includes(index);
        entry.marker.style.opacity = started.includes(index) ? (live ? '1' : '0.7') : '0';
        const anchor = place(entry.marker, entry.position, occluder);
        if (live && entry.beat.clip && !entry.card)
          entry.card = entry.beat.plunge
            ? buildPlunge(current.root, entry.beat, anchor ?? { x: innerWidth / 2, y: innerHeight / 2 })
            : buildCard(current.root, entry.beat);
        if (entry.card) {
          if (!live) {
            const card = entry.card;
            entry.card = null;
            if (card.plunge && anchor)
              Object.assign(card.style, {
                left: `${anchor.x - 20}px`,
                top: `${anchor.y - 20}px`,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                opacity: '0',
              });
            else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.85)';
            }
            setTimeout(() => card.remove(), 900);
          } else if (entry.card.plunge) plunging = true;
          else if (anchor) placeCard(entry.card, anchor, index % 2 === 0);
        }
      });
      // A full-screen plunge covers the command dock too.
      current.root.style.zIndex = plunging ? '150' : '125';
      // Particles only draw when the scene renders.
      if (current.flames?.active) viewer.scene.requestRender?.();
      current.frame = requestAnimationFrame(tick);
    };
    tick();
  }

  return {
    show(story) {
      hide();
      if (!story || !doc?.body || !viewer?.scene) return;
      start(story).catch((error) => {
        console.warn('[scene] fire story unavailable:', error?.message || error);
      });
    },
    hide,
    destroy: hide,
  };
}
