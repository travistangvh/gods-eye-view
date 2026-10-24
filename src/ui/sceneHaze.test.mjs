import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleWeather, satelliteFrameUrl, weatherStepAt } from './sceneHaze.js';

const weather = {
  start: '2026-10-01T00:00:00Z',
  stepHours: 3,
  lats: [2, 1, 0],
  lons: [100, 101],
  steps: [
    { u: [0, 10, 20, 30, 40, 50], v: [0, 0, 0, 0, 0, 0], pm25: [10, 10, 10, 10, 10, 10] },
    { u: [0, 0, 0, 0, 0, 0], v: [0, 0, 0, 0, 0, 0], pm25: [50, 50, 50, 50, 50, 50] },
  ],
};

test('weather steps follow the clock and stay inside the data', () => {
  assert.equal(weatherStepAt(weather, Date.parse('2026-10-01T01:30:00Z')), 0.5);
  assert.equal(weatherStepAt(weather, Date.parse('2026-09-01T00:00:00Z')), 0);
  assert.equal(weatherStepAt(weather, Date.parse('2026-12-01T00:00:00Z')), 1);
});

test('weather is bilinear in space, linear in time and null outside', () => {
  // Rows run north to south: lat 1.5, lon 100.5 sits between u 0, 10, 20, 30.
  assert.equal(sampleWeather(weather, 'u', 1.5, 100.5, 0), 15);
  assert.equal(sampleWeather(weather, 'pm25', 1, 100, 0.25), 20);
  assert.equal(sampleWeather(weather, 'u', 5, 100, 0), null);
});

test('satellite frames ask GIBS for one late-morning image over the box', () => {
  const url = new URL(satelliteFrameUrl('2026-10-14', [95, -7, 120, 8], 1000));
  assert.equal(url.origin, 'https://gibs.earthdata.nasa.gov');
  assert.equal(url.searchParams.get('TIME'), '2026-10-14T03:00:00Z');
  assert.equal(url.searchParams.get('BBOX'), '-7,95,8,120');
  assert.equal(url.searchParams.get('HEIGHT'), '600');
});
