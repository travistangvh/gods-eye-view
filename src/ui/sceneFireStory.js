import * as Cesium from 'cesium';
import { formatDate, t } from '../i18n/index.js';
import { createSceneClipPlayer } from './sceneClips.js';

/**
 * A shot's fire story: satellite fire detections light up day by day under a
 * date ticker, and the ticker pauses on "beats" — a labelled place whose clip
 * plays in a glowing card pinned to it, one beat at a time.
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
/** Seconds a beat holds beyond its clip, for the card to settle and leave. */
const BEAT_PADDING_SECONDS = 1;

const dataCache = new Map();

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
 * Turn a story into timed segments. The ticker advances from `from` to `to`
 * at `daysPerSecond`, after an optional `delay`; it stops at each dated beat
 * for that beat's length. A beat without a date follows the previous one.
 *
 * @returns {{segments: Array<{start: number, end: number, fromDay: number, toDay: number, beat?: number}>, total: number}}
 */
export function buildFireTimeline(story, dataStart) {
  const rate = Math.max(0.01, Number(story.daysPerSecond) || 2);
  const segments = [];
  let time = Math.max(0, Number(story.delay) || 0);
  let day = dayIndex(dataStart, story.from);
  const last = dayIndex(dataStart, story.to ?? story.from);
  if (time > 0) segments.push({ start: 0, end: time, fromDay: day, toDay: day });
  (story.beats || []).forEach((beat, index) => {
    if (beat.date) {
      const target = Math.max(day, dayIndex(dataStart, beat.date));
      if (target > day) {
        const end = time + (target - day) / rate;
        segments.push({ start: time, end, fromDay: day, toDay: target });
        time = end;
        day = target;
      }
    }
    const length = beatSeconds(beat);
    segments.push({ start: time, end: time + length, fromDay: day, toDay: day, beat: index });
    time += length;
  });
  if (last > day) {
    const end = time + (last - day) / rate;
    segments.push({ start: time, end, fromDay: day, toDay: last });
    time = end;
  }
  return { segments, total: time };
}

/** Seconds a beat holds the ticker. */
export function beatSeconds(beat) {
  return (Number(beat.clip?.seconds) || Number(beat.hold) || 4) + BEAT_PADDING_SECONDS;
}

/**
 * Where the story is at `seconds`: the fractional day shown and the beat
 * playing, if any. Past the end it stays on the last day.
 */
export function sampleFireTimeline(timeline, seconds) {
  const { segments } = timeline;
  if (!segments.length) return { day: 0, beat: null };
  const segment =
    segments.find((entry) => seconds < entry.end) ?? segments[segments.length - 1];
  const span = segment.end - segment.start;
  const amount = span > 0 ? Math.min(1, Math.max(0, (seconds - segment.start) / span)) : 1;
  return {
    day: segment.fromDay + (segment.toDay - segment.fromDay) * amount,
    beat: seconds < segment.end && segment.beat !== undefined ? segment.beat : null,
  };
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

  function buildCard(root, beat) {
    const portrait = !!beat.clip.portrait;
    const card = element('figure', {
      position: 'absolute',
      margin: '0',
      width: portrait ? 'min(18vw, calc(44vh * 9 / 16))' : 'min(30vw, 460px)',
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

  /** Card above and to the side of its place, kept on screen. */
  function placeCard(card, anchor) {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const right = anchor.x + 28 + width < innerWidth - 16;
    const left = right ? anchor.x + 28 : anchor.x - 28 - width;
    // Below the date ticker, above the caption and dock.
    const top = Math.min(innerHeight - 150 - height, Math.max(132, anchor.y - height - 24));
    card.style.left = `${Math.max(16, left)}px`;
    card.style.top = `${top}px`;
  }

  /** Colour, size and glow of a detection `age` days old. */
  function styleFor(age, base) {
    if (age < 1) return [BRIGHT, base + 3, 3];
    if (age < 3) return [ORANGE, base + 1, 0];
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
    const data = await loadFires(story.data);
    if (current.cancelled) return;

    const fires = selectFires(data.fires, { bbox: story.bbox, cell: story.cell });
    const counts = dailyCounts(data.fires, story.bbox);
    const timeline = buildFireTimeline(story, data.start);
    const points = new Cesium.PointPrimitiveCollection();
    // Merged wide views use small points; close views can ask for larger ones.
    const base = Number(story.size) || (story.cell ? 2.5 : 5);
    for (const [lat, lon] of fires)
      points.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 60),
        pixelSize: base,
        color: BRIGHT,
        outlineColor: BRIGHT_GLOW,
        outlineWidth: 0,
        show: false,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    viewer.scene.primitives.add(points);
    current.points = points;
    const ticker = buildTicker(current.root);
    const beats = (story.beats || []).map((beat) => ({
      beat,
      position: Cesium.Cartesian3.fromDegrees(beat.lon, beat.lat),
      marker: buildMarker(current.root, beat),
      card: null,
    }));

    // Points are sorted by day; `shown` counts those already visible, and
    // `settled` those already drawn as scars.
    let shown = 0;
    let settled = 0;
    let lastDay = -1;
    const began = performance.now();

    const tick = () => {
      if (current.cancelled) return;
      const seconds = (performance.now() - began) / 1000;
      const { day, beat: playing } = sampleFireTimeline(timeline, seconds);
      const today = Math.floor(day);
      if (today !== lastDay) {
        lastDay = today;
        while (shown < fires.length && fires[shown][2] <= today) {
          const point = points.get(shown);
          point.show = true;
          shown++;
        }
        for (let i = settled; i < shown; i++) {
          const age = today - fires[i][2];
          const point = points.get(i);
          [point.color, point.pixelSize, point.outlineWidth] = styleFor(age, base);
          if (age >= SCAR_AFTER_DAYS && i === settled) settled++;
        }
        ticker.date.textContent = formatDate(new Date(`${dateAfter(data.start, today)}T00:00:00Z`), {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        });
        ticker.count.textContent = t('{count} fire detections that day · NASA VIIRS', {
          count: (counts.get(today) || 0).toLocaleString(),
        });
        viewer.scene.requestRender?.();
      }
      const occluder = new Cesium.EllipsoidalOccluder(
        Cesium.Ellipsoid.WGS84,
        viewer.scene.camera.positionWC,
      );
      beats.forEach((entry, index) => {
        const segment = timeline.segments.find((item) => item.beat === index);
        const revealed = segment && seconds >= segment.start;
        entry.marker.style.opacity = revealed ? (playing === index ? '1' : '0.75') : '0';
        const anchor = place(entry.marker, entry.position, occluder);
        if (playing === index && entry.beat.clip && !entry.card)
          entry.card = buildCard(current.root, entry.beat);
        if (entry.card) {
          if (playing !== index) {
            const card = entry.card;
            entry.card = null;
            card.style.opacity = '0';
            card.style.transform = 'scale(0.85)';
            setTimeout(() => card.remove(), 600);
          } else if (anchor) placeCard(entry.card, anchor);
        }
      });
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
