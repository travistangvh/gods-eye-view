import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSceneVideoWall,
  splitVideoWallColumns,
  videoWallEmbedUrl,
} from './sceneVideoWall.js';
import { SCENE_RECIPES } from '../scenes/recipes.js';

test('clips split west and east, each column north first', () => {
  const { west, east } = splitVideoWallColumns([
    { id: 'kalimantan-south', lon: 113, lat: -3 },
    { id: 'sumatra-north', lon: 102, lat: 0.4 },
    { id: 'kalimantan-north', lon: 116, lat: -1 },
    { id: 'sumatra-south', lon: 105, lat: -3.3 },
  ]);
  assert.deepEqual(
    west.map((item) => item.id),
    ['sumatra-north', 'sumatra-south'],
  );
  assert.deepEqual(
    east.map((item) => item.id),
    ['kalimantan-north', 'kalimantan-south'],
  );
});

test('embed URL is muted autoplay from the start second', () => {
  const url = new URL(videoWallEmbedUrl('mll1VmKZ18U', 10.7));
  assert.equal(url.origin, 'https://www.youtube-nocookie.com');
  assert.equal(url.pathname, '/embed/mll1VmKZ18U');
  assert.equal(url.searchParams.get('autoplay'), '1');
  assert.equal(url.searchParams.get('mute'), '1');
  assert.equal(url.searchParams.get('start'), '10');
  assert.throws(() => videoWallEmbedUrl('../x'), /Invalid YouTube video ID/);
});

test('without a document or scene the wall is a no-op', () => {
  const wall = createSceneVideoWall({}, null);
  wall.show([{ videoId: 'mll1VmKZ18U', lat: 0, lon: 0, label: 'x' }]);
  wall.hide();
  wall.destroy();
});

test('the haze scene has one fire wall with valid clips', () => {
  const recipe = SCENE_RECIPES.find((r) => r.id === 'singapore-haze-2026');
  const walls = recipe.cameraPath.filter((shot) => shot.videoWall);
  assert.equal(walls.length, 1);
  assert.equal(walls[0].videoWall.length, 6);
  for (const clip of walls[0].videoWall) {
    assert.match(clip.videoId, /^[A-Za-z0-9_-]{11}$/);
    assert.ok(Number.isFinite(clip.lat) && Number.isFinite(clip.lon));
    assert.ok(clip.label.length > 0);
  }
});
