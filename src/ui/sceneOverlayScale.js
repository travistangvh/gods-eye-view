/**
 * How much to enlarge scene overlays for the viewport.
 *
 * Overlays are sized in pixels for a landscape screen. A portrait viewport,
 * such as a 1080 x 1920 vertical render, is watched on a phone, so overlays
 * are laid out as if the screen were a phone `PHONE_WIDTH` CSS pixels wide
 * and then zoomed up to fill it. Landscape viewports are left at 1.
 */
export const PHONE_WIDTH = 432;
const MAX_SCALE = 3;

/** Overlay zoom for a `width` x `height` viewport (1 when landscape). */
export function overlayScale(width, height) {
  if (!(width > 0 && height > width)) return 1;
  return Math.min(MAX_SCALE, Math.max(1, width / PHONE_WIDTH));
}

/** Overlay zoom for the current window. */
export function viewportOverlayScale(win = globalThis) {
  return overlayScale(win?.innerWidth, win?.innerHeight);
}

/**
 * Zoom `node` by `scale`. CSS zoom also multiplies the node's own left and
 * top, so callers that pin it to a screen point divide by `zoomOf(node)`.
 */
export function zoomOverlay(node, scale) {
  node.style.zoom = scale === 1 ? '' : String(scale);
  return node;
}

/** The zoom set on `node` by `zoomOverlay`, or 1. */
export function zoomOf(node) {
  return Number(node.style.zoom) || 1;
}
