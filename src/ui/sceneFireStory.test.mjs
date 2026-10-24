import assert from 'node:assert/strict';
import test from 'node:test';
import {
  beatSeconds,
  buildFireTimeline,
  dailyCounts,
  dateAfter,
  dayIndex,
  flameSites,
  sampleFireTimeline,
  selectFires,
} from './sceneFireStory.js';
import { SCENE_RECIPES } from '../scenes/recipes.js';

test('days count from the data start in UTC', () => {
  assert.equal(dayIndex('2026-07-01', '2026-07-09'), 8);
  assert.equal(dateAfter('2026-07-01', 31), '2026-08-01');
});

test('the ticker speeds up and beats start on their dates, overlapping', () => {
  const timeline = buildFireTimeline(
    {
      from: '2026-07-01',
      to: '2026-07-17',
      seconds: 8,
      ease: 2,
      delay: 1,
      beats: [
        { date: '2026-07-05', clip: { seconds: 6 } },
        { date: '2026-07-17', hold: 3 },
        { at: 0.5 },
      ],
    },
    '2026-07-01',
  );
  // Day 4 of 16 with ease 2 is reached at sqrt(1/4) of the run: 1 + 4 s.
  assert.deepEqual(timeline.beats, [
    { start: 5, end: 11 },
    { start: 9, end: 12 },
    { start: 0.5, end: 4.5 },
  ]);
  assert.equal(timeline.total, 12);
  assert.deepEqual(sampleFireTimeline(timeline, 0.5), { day: 0, started: [2], playing: [2] });
  // Halfway through the run, a quarter of the days have passed.
  assert.equal(sampleFireTimeline(timeline, 5).day, 4);
  assert.deepEqual(sampleFireTimeline(timeline, 10), {
    day: 16,
    started: [0, 1, 2],
    playing: [0, 1],
  });
  assert.equal(sampleFireTimeline(timeline, 100).day, 16);
});

test('a beat lasts for its clip, or its hold', () => {
  assert.equal(beatSeconds({ clip: { seconds: 6 } }), 6);
  assert.equal(beatSeconds({ hold: 3 }), 3);
  assert.equal(beatSeconds({}), 4);
});

test('fires are filtered to a box and merged per cell and day', () => {
  const fires = [
    [-2.01, 113.01, 3, 10],
    [-2.04, 113.03, 3, 40],
    [-2.01, 113.01, 4, 5],
    [5, 100, 3, 9],
  ];
  const box = [112, -3, 114, -1];
  assert.equal(selectFires(fires, { bbox: box }).length, 3);
  const merged = selectFires(fires, { bbox: box, cell: 0.1 });
  assert.deepEqual(merged, [
    [-2, 113, 3, 40],
    [-2, 113, 4, 5],
  ]);
  assert.deepEqual([...dailyCounts(fires, box)], [[3, 2], [4, 1]]);
});

test('every haze fire story has clips with an exact length', () => {
  const recipe = SCENE_RECIPES.find((r) => r.id === 'singapore-haze-2026');
  const stories = recipe.cameraPath.filter((shot) => shot.fireStory);
  assert.ok(stories.length >= 4);
  for (const { fireStory } of stories)
    for (const beat of fireStory.beats)
      if (beat.clip) {
        assert.match(beat.clip.videoId, /^[A-Za-z0-9_-]{11}$/);
        assert.ok(beat.clip.seconds > 0 && beat.clip.seconds <= 10);
      }
});

test('flames burn at the newest nearby detections, nearest first', () => {
  const fires = [
    [-2.15, 113.8, 10, 5], // here, today
    [-2.16, 113.8, 9, 5], // ~1 km, yesterday
    [-2.15, 113.8, 7, 5], // here, but out by now
    [-2.5, 113.8, 10, 5], // ~39 km away
    [-2.151, 113.8, 11, 5], // tomorrow
  ];
  const sites = flameSites(fires, 10, { lat: -2.15, lon: 113.8, radiusKm: 5, max: 5 });
  assert.deepEqual(sites, [fires[0], fires[1]]);
  assert.equal(flameSites(fires, 10, { lat: -2.15, lon: 113.8, max: 1 }).length, 1);
});
