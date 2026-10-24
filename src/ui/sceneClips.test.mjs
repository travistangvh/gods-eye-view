import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CARD_CLIP_SECONDS,
  OVERLAY_CLIP_SECONDS,
  collectSceneClips,
  createSceneClipPlayer,
  sceneClipFileName,
} from './sceneClips.js';
import { SCENE_RECIPES } from '../scenes/recipes.js';

test('clip files are named by video and start second', () => {
  assert.equal(sceneClipFileName('mll1VmKZ18U', 10.9), 'mll1VmKZ18U-10s.mp4');
  assert.equal(sceneClipFileName('mll1VmKZ18U'), 'mll1VmKZ18U-0s.mp4');
});

test('a recipe lists each wall, featured and card clip once', () => {
  const clips = collectSceneClips({
    cameraPath: [
      {
        videoWall: [
          { videoId: 'aaaaaaaaaaa', start: 5 },
          { videoId: 'aaaaaaaaaaa', start: 5 },
        ],
      },
      { videoFeature: { videoId: 'bbbbbbbbbbb', start: 20 } },
      {
        interactions: [
          { action: { type: 'card', video: { provider: 'youtube', id: 'ccccccccccc' } } },
          { action: { type: 'card', text: 'no video' } },
        ],
      },
    ],
  });
  assert.deepEqual(
    clips.map(({ file, seconds }) => [file, seconds]),
    [
      ['aaaaaaaaaaa-5s.mp4', OVERLAY_CLIP_SECONDS],
      ['bbbbbbbbbbb-20s.mp4', OVERLAY_CLIP_SECONDS],
      ['ccccccccccc-0s.mp4', CARD_CLIP_SECONDS],
    ],
  );
});

test('the haze scene has clips to fetch', () => {
  const recipe = SCENE_RECIPES.find((r) => r.id === 'singapore-haze-2026');
  assert.ok(collectSceneClips(recipe).length >= 13);
});

function fakeDocument() {
  const make = (tag) => {
    const listeners = {};
    return {
      tag,
      style: {},
      addEventListener: (type, fn) => (listeners[type] = fn),
      fire: (type) => listeners[type]?.(),
      replaceWith(node) {
        this.replacedBy = node;
      },
      setAttribute() {},
    };
  };
  return { createElement: make };
}

test('overlay clips play the local file muted and looping', () => {
  const video = createSceneClipPlayer(fakeDocument(), {
    videoId: 'mll1VmKZ18U',
    start: 10,
    title: 'clip',
    autoplay: true,
  });
  assert.equal(video.tag, 'video');
  assert.equal(video.src, '/scene-assets/clips/mll1VmKZ18U-10s.mp4');
  assert.equal(video.muted && video.autoplay && video.loop, true);
  assert.equal(video.controls, undefined);
});

test('a missing local file falls back to the YouTube player', () => {
  const video = createSceneClipPlayer(fakeDocument(), {
    videoId: 'mll1VmKZ18U',
    start: 10,
    title: 'clip',
  });
  assert.equal(video.controls, true);
  video.fire('error');
  assert.equal(video.replacedBy.tag, 'iframe');
  assert.match(video.replacedBy.src, /youtube-nocookie\.com\/embed\/mll1VmKZ18U/);
});
