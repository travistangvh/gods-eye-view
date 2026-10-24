import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AIR_QUALITY_PROVIDERS,
  bandForValue,
  normalizeNeaPsi,
} from './model.js';
import {
  createCombinedAirQualitySource,
  createNeaAirQualitySource,
} from './source.js';

const NOW = Date.parse('2026-10-24T11:30:00+08:00');

function payload(overrides = {}) {
  return {
    region_metadata: [
      { name: 'central', label_location: { latitude: 1.35735, longitude: 103.82 } },
      { name: 'west', label_location: { latitude: 1.35735, longitude: 103.7 } },
      { name: 'north', label_location: { latitude: 1.41803, longitude: 103.82 } },
    ],
    items: [
      {
        timestamp: '2026-10-24T11:00:00+08:00',
        update_timestamp: '2026-10-24T11:00:43+08:00',
        readings: {
          psi_twenty_four_hourly: { central: 140, west: 150, north: 124 },
          pm25_twenty_four_hourly: { central: 93, west: 103, north: 78 },
        },
      },
    ],
    ...overrides,
  };
}

test('PSI bands follow the published descriptors', () => {
  assert.equal(bandForValue('nea', 50), 'good');
  assert.equal(bandForValue('nea', 51), 'moderate');
  assert.equal(bandForValue('nea', 100), 'moderate');
  assert.equal(bandForValue('nea', 101), 'unhealthy');
  assert.equal(bandForValue('nea', 200), 'unhealthy');
  assert.equal(bandForValue('nea', 201), 'very-unhealthy');
  assert.equal(bandForValue('nea', 300), 'very-unhealthy');
  assert.equal(bandForValue('nea', 301), 'hazardous');
  assert.match(AIR_QUALITY_PROVIDERS.nea.coverage, /Singapore only/);
});

test('one reading per region, worst first, with the PM2.5 note', () => {
  const readings = normalizeNeaPsi(payload(), NOW);
  assert.deepEqual(
    readings.map((r) => [r.id, r.value, r.band]),
    [
      ['nea:west', 150, 'unhealthy'],
      ['nea:central', 140, 'unhealthy'],
      ['nea:north', 124, 'unhealthy'],
    ],
  );
  const [west] = readings;
  assert.equal(west.name, 'Singapore West');
  assert.equal(west.scale, 'PSI');
  assert.equal(west.lat, 1.35735);
  assert.equal(west.lon, 103.7);
  assert.equal(west.label, '150');
  assert.equal(west.note, 'PM2.5 103 µg/m³ (24-hour)');
  assert.equal(west.observedMs, Date.parse('2026-10-24T11:00:00+08:00'));
});

test('malformed responses are refused, unusable regions skipped', () => {
  for (const bad of [null, {}, { region_metadata: [] }, { items: [] }]) {
    assert.equal(normalizeNeaPsi(bad, NOW), null);
  }
  const noReadings = payload();
  delete noReadings.items[0].readings.psi_twenty_four_hourly;
  assert.equal(normalizeNeaPsi(noReadings, NOW), null);
  const skipped = payload();
  skipped.items[0].readings.psi_twenty_four_hourly.west = null;
  skipped.region_metadata[2].label_location.latitude = 'x';
  assert.deepEqual(
    normalizeNeaPsi(skipped, NOW).map((r) => r.id),
    ['nea:central'],
  );
});

test('a snapshot older than six hours yields no readings', () => {
  assert.deepEqual(
    normalizeNeaPsi(payload(), NOW + 7 * 60 * 60 * 1000),
    [],
  );
  assert.deepEqual(normalizeNeaPsi(payload({ items: [] }), NOW), []);
});

test('the NEA source requests the keyless PSI feed and validates it', async () => {
  const requested = [];
  const source = createNeaAirQualitySource({
    now: () => NOW,
    fetchImpl: async (url) => {
      requested.push(String(url));
      return Response.json(payload());
    },
  });
  const readings = await source.getSnapshot();
  assert.deepEqual(requested, ['https://api.data.gov.sg/v1/environment/psi']);
  assert.equal(readings.length, 3);

  const failing = (response) =>
    createNeaAirQualitySource({ now: () => NOW, fetchImpl: async () => response });
  await assert.rejects(
    failing(new Response('nope', { status: 503 })).getSnapshot(),
    /NEA HTTP 503/,
  );
  await assert.rejects(
    failing(Response.json({ unexpected: true })).getSnapshot(),
    /Malformed NEA PSI response/,
  );
});

test('the combined source keeps the networks that answer', async () => {
  const canada = { getSnapshot: async () => [{ id: 'eccc:a', value: 3 }] };
  const singapore = { getSnapshot: async () => [{ id: 'nea:west', value: 150 }] };
  const broken = {
    getSnapshot: async () => {
      throw new Error('down');
    },
  };
  assert.deepEqual(
    (await createCombinedAirQualitySource([canada, singapore]).getSnapshot()).map(
      (r) => r.id,
    ),
    ['nea:west', 'eccc:a'],
  );
  assert.deepEqual(
    (await createCombinedAirQualitySource([broken, singapore]).getSnapshot()).map(
      (r) => r.id,
    ),
    ['nea:west'],
  );
  await assert.rejects(
    createCombinedAirQualitySource([broken, broken]).getSnapshot(),
    /down/,
  );
});
