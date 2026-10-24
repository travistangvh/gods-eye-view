import * as Cesium from 'cesium';
import { sampleWeather, weatherStepAt } from './sceneHaze.js';

/**
 * More pieces a scene story can draw, all timed by the story clock:
 * - `cities`: pins whose PM2.5 counters follow the modelled haze and turn
 *   amber, then red, as it thickens;
 * - `compare`: a card that sweeps a line across two photos of the same
 *   place, before and during the haze;
 * - `arcs`: lines that grow from one place to another, with a label.
 */

/** Colour for a PM2.5 reading (µg/m³), on the US AQI breakpoints. */
export function pm25Colour(value) {
  if (value >= 150) return '#ff4d3a';
  if (value >= 55) return '#ffae42';
  if (value >= 35) return '#ffe066';
  return '#9be38b';
}

/** Which compare pair shows at `seconds`, and how far its line has swept (0-1). */
export function compareFrame(compare, seconds) {
  const each = Number(compare.seconds) || 5;
  const local = seconds - (Number(compare.at) || 0);
  if (local < 0) return null;
  const index = Math.floor(local / each);
  if (index >= compare.pairs.length) return null;
  const phase = (local - index * each) / each;
  // The line rests on "before", sweeps across, then holds on "during".
  const sweep = Math.min(1, Math.max(0, (phase - 0.15) / 0.55));
  return { index, sweep: sweep * sweep * (3 - 2 * sweep) };
}

/**
 * @param {object} viewer - Cesium viewer
 * @param {Document} doc
 * @param {HTMLElement} root - the story's overlay element
 * @param {object} story
 * @param {?object} weather - parsed weather.json, for city counters
 */
export function createStoryExtras(viewer, doc, root, story, weather) {
  const C = Cesium;
  const scene = viewer.scene;
  const scratch = new C.Cartesian2();
  const nodes = [];
  const element = (tag, style, text) => {
    const node = doc.createElement(tag);
    Object.assign(node.style, style);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const project = (lat, lon, occluder) => {
    const position = C.Cartesian3.fromDegrees(lon, lat);
    if (!occluder.isPointVisible(position)) return null;
    const screen = C.SceneTransforms.worldToWindowCoordinates(scene, position, scratch);
    if (!screen) return null;
    const canvas = scene.canvas.getBoundingClientRect();
    return { x: canvas.left + screen.x, y: canvas.top + screen.y };
  };

  // --- city counters ---------------------------------------------------------
  const cities = (story.cities || []).map((city) => {
    const pin = element('div', {
      position: 'absolute',
      transform: 'translate(-6px, -6px)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      whiteSpace: 'nowrap',
      font: '600 13px/1.2 system-ui, sans-serif',
      color: '#f4f7fa',
      textShadow: '0 1px 4px rgba(0, 0, 0, 0.95)',
    });
    const dot = element('span', {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      boxShadow: '0 0 10px 2px rgba(0, 0, 0, 0.4)',
      transition: 'background 0.4s',
    });
    const name = element('span', {}, city.label);
    const value = element('span', { font: '700 15px/1.2 system-ui, sans-serif' });
    pin.append(dot, name, value);
    root.append(pin);
    nodes.push(pin);
    return { city, pin, dot, value };
  });

  // --- before/after card -----------------------------------------------------
  let compare = null;
  if (story.compare) {
    const card = element('figure', {
      position: 'absolute',
      right: '16px',
      top: '110px',
      margin: '0',
      width: 'min(46vw, 640px)',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 190, 120, 0.8)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
      background: '#000',
      opacity: '0',
      transition: 'opacity 0.5s',
    });
    const frame = element('div', { position: 'relative' });
    const before = element('img', { display: 'block', width: '100%' });
    const during = element('img', {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
    const line = element('div', {
      position: 'absolute',
      top: '0',
      bottom: '0',
      width: '3px',
      marginLeft: '-1px',
      background: '#fff',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
    });
    const tag = (side) =>
      element('span', {
        position: 'absolute',
        top: '8px',
        [side]: '8px',
        padding: '2px 8px',
        borderRadius: '4px',
        background: 'rgba(0, 0, 0, 0.72)',
        color: '#fff',
        font: '600 13px/1.4 system-ui, sans-serif',
      });
    const beforeTag = tag('left');
    const duringTag = tag('right');
    frame.append(before, during, line, beforeTag, duringTag);
    const caption = element('figcaption', {
      padding: '6px 10px',
      background: 'rgba(8, 10, 14, 0.92)',
      color: '#ffe3c4',
      font: '600 13px/1.4 system-ui, sans-serif',
    });
    card.append(frame, caption);
    root.append(card);
    nodes.push(card);
    compare = { card, before, during, line, beforeTag, duringTag, caption, shown: -1 };
  }

  // --- arcs ------------------------------------------------------------------
  const arcCanvas = story.arcs?.length ? element('canvas', {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
  }) : null;
  if (arcCanvas) {
    root.prepend(arcCanvas);
    nodes.push(arcCanvas);
  }
  const arcLabels = (story.arcs || []).map((arc) => {
    const label = element('div', {
      position: 'absolute',
      transform: 'translate(-50%, -130%)',
      padding: '3px 8px',
      borderRadius: '4px',
      background: 'rgba(10, 12, 16, 0.85)',
      border: '1px solid rgba(255, 170, 70, 0.8)',
      color: '#ffe3c4',
      font: '600 13px/1.3 system-ui, sans-serif',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 0.4s',
    }, arc.label);
    root.append(label);
    nodes.push(label);
    return label;
  });

  function drawArcs(seconds, occluder) {
    const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
    const width = Math.round(arcCanvas.clientWidth * ratio);
    const height = Math.round(arcCanvas.clientHeight * ratio);
    if (arcCanvas.width !== width || arcCanvas.height !== height) {
      arcCanvas.width = width;
      arcCanvas.height = height;
    }
    const ctx = arcCanvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const box = arcCanvas.getBoundingClientRect();
    story.arcs.forEach((arc, index) => {
      const grow = Math.min(1, Math.max(0, (seconds - arc.at) / 1.4));
      const label = arcLabels[index];
      const start = project(arc.from.lat, arc.from.lon, occluder);
      const end = project(arc.to.lat, arc.to.lon, occluder);
      if (!grow || !start || !end) {
        label.style.opacity = '0';
        return;
      }
      const a = { x: start.x - box.left, y: start.y - box.top };
      const b = { x: end.x - box.left, y: end.y - box.top };
      const lift = Math.hypot(b.x - a.x, b.y - a.y) * 0.25;
      const control = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - lift };
      const point = (t) => ({
        x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * control.x + t * t * b.x,
        y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * control.y + t * t * b.y,
      });
      ctx.strokeStyle = 'rgba(255, 170, 70, 0.95)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(255, 120, 40, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let t = 0.05; t <= grow + 1e-9; t += 0.05) {
        const p = point(Math.min(t, grow));
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      const tip = point(grow);
      ctx.fillStyle = '#ffd08a';
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
      ctx.fill();
      label.style.left = `${box.left + tip.x}px`;
      label.style.top = `${box.top + tip.y}px`;
      label.style.opacity = grow >= 1 ? '1' : '0';
    });
  }

  return {
    /**
     * @param {number} seconds - story seconds since the shot began
     * @param {number} ms - the story's current date and time
     */
    update(seconds, ms) {
      const occluder = new C.EllipsoidalOccluder(C.Ellipsoid.WGS84, scene.camera.positionWC);
      if (cities.length && weather) {
        const step = weatherStepAt(weather, ms);
        for (const entry of cities) {
          const at = project(entry.city.lat, entry.city.lon, occluder);
          entry.pin.style.display = at ? 'flex' : 'none';
          if (!at) continue;
          entry.pin.style.left = `${at.x}px`;
          entry.pin.style.top = `${at.y}px`;
          const value = sampleWeather(weather, 'pm25', entry.city.lat, entry.city.lon, step);
          if (value === null) continue;
          entry.value.textContent = String(Math.round(value));
          entry.value.style.color = pm25Colour(value);
          entry.dot.style.background = pm25Colour(value);
        }
      }
      if (compare) {
        const frame = compareFrame(story.compare, seconds);
        compare.card.style.opacity = frame ? '1' : '0';
        if (frame) {
          const pair = story.compare.pairs[frame.index];
          if (compare.shown !== frame.index) {
            compare.shown = frame.index;
            compare.before.src = pair.before;
            compare.during.src = pair.during;
            compare.beforeTag.textContent = pair.beforeLabel;
            compare.duringTag.textContent = pair.duringLabel;
            compare.caption.textContent = pair.label;
          }
          // "Before" stays left of the line and "during" right of it; the
          // line sweeps from the right edge to the left as the haze takes over.
          const edge = (100 - frame.sweep * 100).toFixed(1);
          compare.during.style.clipPath = `inset(0 0 0 ${edge}%)`;
          compare.line.style.left = `${edge}%`;
        }
      }
      if (arcCanvas) drawArcs(seconds, occluder);
    },
    destroy() {
      for (const node of nodes) node.remove();
    },
  };
}
