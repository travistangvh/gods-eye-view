import assert from 'node:assert/strict';
import test from 'node:test';
import {
  beatSeconds,
  buildFireTimeline,
  dailyCounts,
  dateAfter,
  dayIndex,
  sampleFireTimeline,
  selectFires,
} from './sceneFireStory.js';
import { SCENE_RECIPES } from '../scenes/recipes.js';

test('days count from the data start in UTC', () => {
  assert.equal(dayIndex('2026-07-01', '2026-07-09'), 8);
  assert.equal(dateAfter('2026-07-01', 31), '2026-08-01');
});

test('the ticker advances, pauses for each beat, then finishes', () => {
  const timeline = buildFireTimeline(
    {
      from: '2026-07-01',
      to: '2026-07-21',
      daysPerSecond: 2,
      delay: 1,
      beats: [
        { date: '2026-07-05', clip: { seconds: 6 } },
        { hold: 3 },
        { date: '2026-07-11', hold: 2 },
      ],
    },
    '2026-07-01',
  );
  // delay 1 + 4 days at 2/s + beat 7 + beat 4 + 6 days + beat 3 + 10 days
  assert.equal(timeline.total, 1 + 2 + 7 + 4 + 3 + 3 + 5);
  assert.deepEqual(sampleFireTimeline(timeline, 0.5), { day: 0, beat: null });
  assert.deepEqual(sampleFireTimeline(timeline, 2), { day: 2, beat: null });
  assert.deepEqual(sampleFireTimeline(timeline, 4), { day: 4, beat: 0 });
  assert.deepEqual(sampleFireTimeline(timeline, 11), { day: 4, beat: 1 });
  assert.deepEqual(sampleFireTimeline(timeline, 100), { day: 20, beat: null });
});

test('a beat holds for its clip plus a moment to settle', () => {
  assert.equal(beatSeconds({ clip: { seconds: 6 } }), 7);
  assert.equal(beatSeconds({ hold: 4 }), 5);
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
