import assert from 'node:assert/strict';
import test from 'node:test';
import { overlayScale, zoomOf, zoomOverlay } from './sceneOverlayScale.js';

test('landscape viewports keep overlays at their designed size', () => {
  assert.equal(overlayScale(1920, 1080), 1);
  assert.equal(overlayScale(1440, 900), 1);
  assert.equal(overlayScale(1000, 1000), 1);
});

test('a vertical render is laid out like a phone screen, then zoomed', () => {
  assert.equal(overlayScale(1080, 1920), 2.5);
  // A real phone is already phone-sized.
  assert.equal(overlayScale(390, 844), 1);
  assert.equal(overlayScale(2160, 3840), 3);
});

test('missing sizes fall back to 1', () => {
  assert.equal(overlayScale(undefined, undefined), 1);
  assert.equal(overlayScale(0, 100), 1);
});

test('zoom is set on the node and read back', () => {
  const node = { style: {} };
  zoomOverlay(node, 2.5);
  assert.equal(zoomOf(node), 2.5);
  zoomOverlay(node, 1);
  assert.equal(node.style.zoom, '');
  assert.equal(zoomOf(node), 1);
});
