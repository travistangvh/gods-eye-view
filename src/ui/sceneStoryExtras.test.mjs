import assert from 'node:assert/strict';
import test from 'node:test';
import { compareFrame, pm25Colour } from './sceneStoryExtras.js';
import { SCENE_RECIPES } from '../scenes/recipes.js';

test('PM2.5 colours step up at the AQI breakpoints', () => {
  assert.equal(pm25Colour(20), '#9be38b');
  assert.equal(pm25Colour(40), '#ffe066');
  assert.equal(pm25Colour(80), '#ffae42');
  assert.equal(pm25Colour(229), '#ff4d3a');
});

test('the before/after card rests, sweeps, then holds for each pair', () => {
  const compare = { at: 2, seconds: 4, pairs: [{}, {}] };
  assert.equal(compareFrame(compare, 1), null);
  assert.deepEqual(compareFrame(compare, 2.2), { index: 0, sweep: 0 });
  assert.equal(compareFrame(compare, 5.5).sweep, 1);
  assert.equal(compareFrame(compare, 6.1).index, 1);
  assert.equal(compareFrame(compare, 10.1), null);
});

test('the haze scene compares real camera frames that exist', async () => {
  const { existsSync } = await import('node:fs');
  const recipe = SCENE_RECIPES.find((r) => r.id === 'singapore-haze-2026');
  const pairs = recipe.cameraPath.flatMap((shot) => shot.fireStory?.compare?.pairs || []);
  assert.ok(pairs.length >= 2);
  for (const pair of pairs)
    for (const image of [pair.before, pair.during])
      assert.ok(existsSync(new URL(`../../public${image}`, import.meta.url)), image);
});
