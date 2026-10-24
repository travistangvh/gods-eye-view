import * as Cesium from 'cesium';
import { t } from '../i18n/index.js';
import { createSceneClipPlayer } from './sceneClips.js';

/**
 * Muted YouTube clips over the map, each joined by a line to its place:
 * either a wall of small tiles down both sides, or one featured clip with a
 * title and a short summary of what is happening there.
 */

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
 * Create the overlay. Without a document or a Cesium scene every call is a
 * no-op, so headless directors can hold one.
 *
 * @param {object} viewer - Cesium viewer
 * @param {Document} [doc]
 * @returns {{show: (content?: {wall?: Array<object>, feature?: ?object}) => void, hide: () => void, destroy: () => void}}
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

  function frame(item) {
    const node = createSceneClipPlayer(doc, {
      videoId: item.videoId,
      start: item.start,
      title: item.label,
      autoplay: true,
    });
    Object.assign(node.style, {
      display: 'block',
      width: '100%',
      aspectRatio: '16 / 9',
      border: '0',
      objectFit: 'cover',
      background: '#000',
    });
    return node;
  }

  function panel(width) {
    const box = doc.createElement('figure');
    Object.assign(box.style, {
      margin: '0',
      width,
      background: '#000',
      border: `1px solid ${LINE_COLOR}`,
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
    });
    return box;
  }

  function text(tag, value, style) {
    const node = doc.createElement(tag);
    node.textContent = value;
    Object.assign(node.style, { margin: '0', ...style });
    return node;
  }

  function tile(item) {
    const box = panel('min(24vw, 360px, calc((100vh - 330px) / 3 * 16 / 9))');
    const caption = text('figcaption', item.label, {
      padding: '3px 8px',
      background: 'rgba(6, 12, 20, 0.9)',
      color: '#ffd9bf',
      font: '600 12px/1.3 system-ui, sans-serif',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });
    box.append(frame(item), caption);
    return box;
  }

  /**
   * One clip with its title, summary, optional bullet points and source. A
   * panel without a clip is text only; a full-screen one covers the map.
   */
  function featurePanel(item) {
    const box = panel(
      item.fullscreen
        ? '100%'
        : !item.videoId
          ? 'min(44vw, 620px)'
          : item.points?.length
            ? // Leave room under a smaller clip for the list; the overlay
              // ignores the pointer, so the panel cannot be scrolled.
              'min(46vw, 700px, calc((100vh - 560px) * 16 / 9))'
            : 'min(52vw, 820px, calc((100vh - 360px) * 16 / 9))',
    );
    const caption = doc.createElement('figcaption');
    Object.assign(caption.style, {
      padding: '10px 14px 12px',
      background: 'rgba(6, 12, 20, 0.92)',
      color: '#f2fbff',
      font: '14px/1.4 system-ui, sans-serif',
    });
    caption.append(
      text('h2', item.title, {
        color: '#ffd9bf',
        font: '700 20px/1.25 system-ui, sans-serif',
      }),
      text('p', item.summary, { marginTop: '6px' }),
    );
    if (item.points?.length) {
      const list = doc.createElement('ul');
      Object.assign(list.style, { margin: '8px 0 0', paddingLeft: '18px' });
      for (const point of item.points)
        list.append(text('li', point, { marginTop: '4px' }));
      caption.append(list);
    }
    caption.append(
      text('p', item.label, {
        marginTop: '8px',
        color: '#9fb8c4',
        font: '12px/1.3 system-ui, sans-serif',
      }),
    );
    if (item.videoId) {
      const clip = frame(item);
      if (item.fullscreen)
        Object.assign(clip.style, {
          flex: '1',
          minHeight: '0',
          aspectRatio: 'auto',
        });
      box.append(clip);
    }
    box.append(caption);
    return box;
  }

  function placeColumn(box, side) {
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
    return box;
  }

  function svgElement(name, attributes) {
    const node = doc.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, value);
    return node;
  }

  /** A line and a pin from one panel to its place on the globe. */
  function link(svg, item, side, box) {
    const entry = {
      side,
      box,
      position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat),
      line: svgElement('line', { stroke: LINE_COLOR, 'stroke-width': '1.5' }),
      dot: svgElement('circle', {
        r: '5',
        fill: LINE_COLOR,
        stroke: '#fff',
        'stroke-width': '1.5',
      }),
    };
    svg.append(entry.line, entry.dot);
    return entry;
  }

  /** Redraw each line from its panel's inner edge to its place on screen. */
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
      const box = entry.box.getBoundingClientRect();
      const fromX = entry.side === 'left' ? box.right : box.left;
      const fromY = box.top + Math.min(box.height / 2, 160);
      entry.line.setAttribute('x1', fromX);
      entry.line.setAttribute('y1', fromY);
      entry.line.setAttribute('x2', x);
      entry.line.setAttribute('y2', y);
      entry.dot.setAttribute('cx', x);
      entry.dot.setAttribute('cy', y);
    }
  }

  return {
    show({ wall = [], feature = null } = {}) {
      hide();
      if ((!wall.length && !feature) || !doc?.body || !viewer?.scene) return;
      root = doc.createElement('div');
      root.dataset.sceneVideoWall = '';
      root.setAttribute('role', 'group');
      root.setAttribute(
        'aria-label',
        feature ? feature.title : t('Fire footage by location'),
      );
      Object.assign(root.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        // Above the side panels (100-110), below the command dock (145);
        // a full-screen clip covers the dock too. The overlay ignores the
        // pointer, so the panels stay usable.
        zIndex: feature?.fullscreen ? '150' : '120',
      });
      const svg = svgElement('svg', { width: '100%', height: '100%' });
      Object.assign(svg.style, { position: 'absolute', inset: '0' });
      root.append(svg);

      const entries = [];
      if (feature) {
        const box = featurePanel(feature);
        Object.assign(
          box.style,
          feature.fullscreen
            ? {
                position: 'absolute',
                inset: '0',
                display: 'flex',
                flexDirection: 'column',
                border: '0',
                borderRadius: '0',
              }
            : {
                position: 'absolute',
                right: '16px',
                top: '90px',
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                // The panel alone takes the pointer, so a long list scrolls.
                pointerEvents: 'auto',
              },
        );
        // A featured clip about a whole region has no single place to pin.
        if (Number.isFinite(feature.lat) && Number.isFinite(feature.lon))
          entries.push(link(svg, feature, 'right', box));
        root.append(box);
      } else {
        const { west, east } = splitVideoWallColumns(wall);
        for (const [side, group] of [
          ['left', west],
          ['right', east],
        ]) {
          const column = placeColumn(doc.createElement('div'), side);
          for (const item of group) {
            const box = tile(item);
            entries.push(link(svg, item, side, box));
            column.append(box);
          }
          root.append(column);
        }
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
