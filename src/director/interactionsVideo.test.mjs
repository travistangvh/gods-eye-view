import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSceneDocument } from './document.js';

function documentWith(video) {
  return {
    version: 6,
    scenes: [
      {
        id: 'scene',
        title: 'Scene',
        dataPacks: [
          {
            id: 'videos',
            version: 1,
            format: 'geojson',
            source: { adapter: 'assets', path: 'scene/videos.geojson' },
            attribution: { text: 'Authored', license: 'Authored' },
            placement: { altitudeReference: 'ellipsoid' },
          },
        ],
        shots: [
          {
            id: 'shot',
            title: 'Shot',
            durationSec: 4,
            holdSec: 1,
            camera: { lat: 1.3, lon: 103.8, alt: 5000, heading: 0, pitch: -40 },
            dataPackIds: ['videos'],
            interactions: [
              {
                id: 'watch',
                label: 'Play a video',
                target: { packId: 'videos', featureId: 'clip' },
                action: {
                  type: 'card',
                  text: 'A news clip.',
                  url: 'https://youtu.be/3voBLOxD55Y',
                  ...(video === undefined ? {} : { video }),
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

test('a card accepts a YouTube video by ID', () => {
  assert.doesNotThrow(() =>
    validateSceneDocument(
      documentWith({ provider: 'youtube', id: '3voBLOxD55Y' }),
    ),
  );
  assert.doesNotThrow(() => validateSceneDocument(documentWith(undefined)));
});

test('a card refuses other providers, malformed IDs and extra fields', () => {
  for (const video of [
    { provider: 'vimeo', id: '3voBLOxD55Y' },
    { provider: 'youtube', id: 'short' },
    { provider: 'youtube', id: '3voBLOxD55Y/../x' },
    { provider: 'youtube', id: '3voBLOxD55Y&autoplay=1' },
    { provider: 'youtube', id: '3voBLOxD55Y', src: 'https://evil.test/' },
    { provider: 'youtube' },
    'https://www.youtube.com/watch?v=3voBLOxD55Y',
  ]) {
    assert.throws(
      () => validateSceneDocument(documentWith(video)),
      undefined,
      JSON.stringify(video),
    );
  }
});
