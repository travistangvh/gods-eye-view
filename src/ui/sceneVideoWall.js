import * as Cesium from 'cesium';
import { t } from '../i18n/index.js';

/** Muted YouTube clips around the map, each joined by a line to its place. */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const LINE_COLOR = 'rgba(255, 140, 60, 0.9)';

/**
 * Split clips into a west column and an east column, each ordered north to
 * south, so lines from the tiles to their places do not cross.
 *
 * @param {Array<{lon: number, lat: number}>} items
 * @returns {{west: Array<object>, east: Array<object>}}
 */
export function splitVideoWallColumns(items) {
  const byLon = [...items].sort((a, b) => a.lon - b.lon);
  const half = Math.ceil(byLon.length / 2);
  const northFirst = (a, b) => b.lat - a.lat;
  return {
    west: byLon.slice(0, half).sort(northFirst),
    east: byLon.slice(half).sort(northFirst),
  };
}

/**
 * Privacy-enhanced embed URL that starts muted at `start` seconds.
 *
 * @param {string} id
 * @param {number} [start]
 * @returns {string}
 */
export function videoWallEmbedUrl(id, start = 0) {
  if (!VIDEO_ID.test(String(id))) throw new Error('Invalid YouTube video ID');
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    rel: '0',
    playsinline: '1',
    start: String(Math.max(0, Math.floor(Number(start) || 0))),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

/**
 * Create the wall. Without a document or a Cesium scene every call is a
 * no-op, so headless directors can hold one.
 *
 * @param {object} viewer - Cesium viewer
 * @param {Document} [doc]
 * @returns {{show: (items: Array<object>) => void, hide: () => void, destroy: () => void}}
 */
export function createSceneVideoWall(viewer, doc = globalThis.document) {
  let root = null;
  let removePostRender = null;
  const scratch = new Cesium.Cartesian2();

  function hide() {
    removePostRender?.();
    removePostRender = null;
    root?.remove();
    root = null;
  }

  function column(side, entries) {
    const box = doc.createElement('div');
    Object.assign(box.style, {
      position: 'absolute',
      [side]: '16px',
      top: '96px',
      bottom: '150px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '8px',
    });
    for (const entry of entries) box.append(entry.tile);
    return box;
  }

  function tile(item) {
    const box = doc.createElement('figure');
    Object.assign(box.style, {
      margin: '0',
      width: 'min(24vw, 360px, calc((100vh - 330px) / 3 * 16 / 9))',
      background: '#000',
      border: `1px solid ${LINE_COLOR}`,
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
    });
    const frame = doc.createElement('iframe');
    frame.src = videoWallEmbedUrl(item.videoId, item.start);
    frame.title = item.label;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-presentation',
    );
    Object.assign(frame.style, {
      display: 'block',
      width: '100%',
      aspectRatio: '16 / 9',
      border: '0',
    });
    const caption = doc.createElement('figcaption');
    caption.textContent = item.label;
    Object.assign(caption.style, {
      padding: '3px 8px',
      background: 'rgba(6, 12, 20, 0.9)',
      color: '#ffd9bf',
      font: '600 12px/1.3 system-ui, sans-serif',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });
    box.append(frame, caption);
    return box;
  }

  function svgElement(name, attributes) {
    const node = doc.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, value);
    return node;
  }

  /** Redraw each line from its tile's inner edge to its place on screen. */
  function drawLines(entries) {
    const scene = viewer.scene;
    const canvas = scene.canvas.getBoundingClientRect();
    const occluder = new Cesium.EllipsoidalOccluder(
      Cesium.Ellipsoid.WGS84,
      scene.camera.positionWC,
    );
    for (const entry of entries) {
      const screen =
        occluder.isPointVisible(entry.position) &&
        Cesium.SceneTransforms.worldToWindowCoordinates(
          scene,
          entry.position,
          scratch,
        );
      const visible = Boolean(screen);
      entry.line.style.display = visible ? '' : 'none';
      entry.dot.style.display = visible ? '' : 'none';
      if (!visible) continue;
      const x = canvas.left + screen.x;
      const y = canvas.top + screen.y;
      const box = entry.tile.getBoundingClientRect();
      const fromX = entry.side === 'left' ? box.right : box.left;
      const fromY = box.top + box.height / 2;
      entry.line.setAttribute('x1', fromX);
      entry.line.setAttribute('y1', fromY);
      entry.line.setAttribute('x2', x);
      entry.line.setAttribute('y2', y);
      entry.dot.setAttribute('cx', x);
      entry.dot.setAttribute('cy', y);
    }
  }

  return {
    show(items = []) {
      hide();
      if (!items.length || !doc?.body || !viewer?.scene) return;
      root = doc.createElement('div');
      root.dataset.sceneVideoWall = '';
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', t('Fire footage by location'));
      Object.assign(root.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        // Above the side panels (100-110), below the command dock (145).
        // The wall ignores the pointer, so the panels stay usable.
        zIndex: '120',
      });
      const svg = svgElement('svg', { width: '100%', height: '100%' });
      Object.assign(svg.style, { position: 'absolute', inset: '0' });
      root.append(svg);

      const { west, east } = splitVideoWallColumns(items);
      const entries = [];
      for (const [side, group] of [
        ['left', west],
        ['right', east],
      ]) {
        const columnEntries = group.map((item) => {
          const entry = {
            side,
            tile: tile(item),
            position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat),
            line: svgElement('line', {
              stroke: LINE_COLOR,
              'stroke-width': '1.5',
            }),
            dot: svgElement('circle', {
              r: '5',
              fill: LINE_COLOR,
              stroke: '#fff',
              'stroke-width': '1.5',
            }),
          };
          svg.append(entry.line, entry.dot);
          return entry;
        });
        entries.push(...columnEntries);
        root.append(column(side, columnEntries));
      }
      doc.body.append(root);
      drawLines(entries);
      removePostRender = viewer.scene.postRender.addEventListener(() =>
        drawLines(entries),
      );
    },
    hide,
    destroy: hide,
  };
}
