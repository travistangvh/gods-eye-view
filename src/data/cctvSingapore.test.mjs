import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLikelySingaporeCoordinate,
  loadSgSourcesFromOpenData,
  normalizeSgImageUrl,
  parseSgTrafficImages,
  sgCameraToSource,
  SG_ANCHORS,
  SG_MAX_CATALOG_BYTES,
  SG_TRAFFIC_IMAGES_URL,
} from '../../server/providers/cctv/singapore.js';
import { createCctvCatalog } from '../../server/providers/cctv/catalog.js';
import { fetchCctvImageFromUpstream } from '../../server/providers/cctv/media.js';

// Settings that would steer the loader or the catalog away from the mocks.
const ISOLATED_ENV = [
  'CCTV_SOURCES_FILE',
  'CCTV_SOURCES_JSON',
  'CCTV_PREFER_AUSTIN',
  'CCTV_FORCE_AUSTIN',
  'CCTV_SG_ENABLED',
  'CCTV_SG_URL',
  'CCTV_SG_MAX_SOURCES',
];

let savedEnv = {};

beforeEach(() => {
  savedEnv = Object.fromEntries(
    ISOLATED_ENV.map((key) => [key, process.env[key]]),
  );
  for (const key of ISOLATED_ENV) delete process.env[key];
});

afterEach(() => {
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const IMAGE =
  'https://images.data.gov.sg/api/traffic-images/2026/10/a7e2fec8-6219-4569-89b8-c230a41f3305.jpg';

function row({
  id = '2701',
  image = IMAGE,
  latitude = 1.447023728,
  longitude = 103.7716543,
} = {}) {
  return {
    timestamp: '2026-10-24T11:15:25+08:00',
    image,
    location: { latitude, longitude },
    camera_id: id,
    image_metadata: { height: 1080, width: 1920, md5: 'abc' },
  };
}

function payload(...cameras) {
  return { items: [{ timestamp: '2026-10-24T11:18:25+08:00', cameras }] };
}

test('maps a published row to a pinned Singapore still', () => {
  const camera = sgCameraToSource(row());
  assert.equal(camera.id, 'sg-lta-2701');
  assert.equal(camera.cityId, 'sg');
  assert.equal(camera.feedType, 'image');
  assert.equal(camera.lat, 1.447023728);
  assert.equal(camera.lon, 103.7716543);
  assert.equal(camera.url, IMAGE);
  assert.equal(camera.snapshotUrl, IMAGE);
  assert.equal(camera.headingConfidence, 'low');
  assert.equal(camera.sourceKind, 'sg-lta-data-gov');
  assert.match(camera.license, /Singapore Open Data Licence/);
});

test('reads the current snapshot and tolerates a malformed payload', () => {
  assert.equal(parseSgTrafficImages(payload(row(), row({ id: '2702' }))).length, 2);
  for (const bad of [null, {}, { items: [] }, { items: [{}] }, 'x', []]) {
    assert.deepEqual(parseSgTrafficImages(bad), []);
  }
});

test('frames off the pinned host or directory never enter the proxy registry', () => {
  for (const image of [
    'http://images.data.gov.sg/api/traffic-images/2026/10/a.jpg',
    'https://images.data.gov.sg.evil.test/api/traffic-images/2026/10/a.jpg',
    'https://images.data.gov.sg/other/a.jpg',
    'https://images.data.gov.sg/api/traffic-images/..%2fsecret.jpg',
    'https://user:pass@images.data.gov.sg/api/traffic-images/a.jpg',
    'https://images.data.gov.sg:8443/api/traffic-images/a.jpg',
    'http://127.0.0.1/private',
    '',
    null,
  ]) {
    assert.equal(normalizeSgImageUrl(image), null, String(image));
    assert.equal(sgCameraToSource(row({ image })), null, String(image));
  }
});

test('bad camera numbers and coordinates outside Singapore are rejected', () => {
  for (const id of ['', '../x', 'a b', 'x'.repeat(40), null]) {
    assert.equal(sgCameraToSource(row({ id })), null, String(id));
  }
  for (const [latitude, longitude] of [
    [103.77, 1.44], // swapped
    [3.139, 101.686], // Kuala Lumpur
    [0, 0],
    [null, null],
    ['NaN', 103.8],
  ]) {
    assert.equal(
      sgCameraToSource(row({ latitude, longitude })),
      null,
      `${latitude},${longitude}`,
    );
  }
  assert.equal(sgCameraToSource(null), null);
  assert.equal(isLikelySingaporeCoordinate(1.3521, 103.8198), true);
});

test('every anchor lies inside Singapore', () => {
  for (const { lat, lon } of SG_ANCHORS) {
    assert.equal(isLikelySingaporeCoordinate(lat, lon), true, `${lat},${lon}`);
  }
});

function mockFeed(t, body, init) {
  const requested = [];
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requested.push(String(url));
    if (String(url) === SG_TRAFFIC_IMAGES_URL) {
      assert.equal(options.redirect, 'manual');
      return new Response(JSON.stringify(body), init);
    }
    return Response.json([]);
  });
  return requested;
}

test('loader deduplicates and drops unusable rows', async (t) => {
  mockFeed(
    t,
    payload(
      row(),
      row({ id: '2701' }),
      row({ id: '2702', latitude: 1.445, longitude: 103.768 }),
      row({ id: '9999', image: 'https://evil.test/a.jpg' }),
    ),
  );
  const ids = (await loadSgSourcesFromOpenData()).map((c) => c.id).sort();
  assert.deepEqual(ids, ['sg-lta-2701', 'sg-lta-2702']);
});

test('CCTV_SG_MAX_SOURCES caps the pack', async (t) => {
  mockFeed(
    t,
    payload(row(), row({ id: '2702', latitude: 1.445, longitude: 103.768 })),
  );
  process.env.CCTV_SG_MAX_SOURCES = '1';
  assert.equal((await loadSgSourcesFromOpenData()).length, 1);
});

test('a redirected, failed or oversized feed contributes an empty pack', async (t) => {
  t.mock.method(console, 'warn', () => {});
  for (const init of [
    { status: 302, headers: { location: 'https://evil.test/' } },
    { status: 503 },
  ]) {
    t.mock.method(
      globalThis,
      'fetch',
      async () => new Response(JSON.stringify(payload(row())), init),
    );
    assert.deepEqual(await loadSgSourcesFromOpenData(), []);
  }
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(
        JSON.stringify({ ...payload(row()), pad: 'x'.repeat(SG_MAX_CATALOG_BYTES) }),
      ),
  );
  assert.deepEqual(await loadSgSourcesFromOpenData(), []);
  t.mock.method(globalThis, 'fetch', async () => new Response('not json'));
  assert.deepEqual(await loadSgSourcesFromOpenData(), []);
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('network down');
  });
  assert.deepEqual(await loadSgSourcesFromOpenData(), []);
});

async function runCatalogWithSgFlag(t, flag) {
  const requested = mockFeed(t, payload(row()));
  if (flag !== undefined) process.env.CCTV_SG_ENABLED = flag;
  const sources = await createCctvCatalog({ sourceRoot: '/nonexistent' })();
  return { requested, sources };
}

test('the Singapore pack is in the catalog by default', async (t) => {
  const { sources } = await runCatalogWithSgFlag(t, undefined);
  assert.equal(sources.find((c) => c.id === 'sg-lta-2701')?.cityId, 'sg');
});

test('CCTV_SG_ENABLED=0 makes no data.gov.sg request', async (t) => {
  const { requested, sources } = await runCatalogWithSgFlag(t, '0');
  assert.ok(requested.length > 0, 'the other packs still refreshed');
  assert.equal(
    requested.some((href) => href.includes('data.gov.sg')),
    false,
  );
  assert.ok(!sources.some((c) => c.cityId === 'sg'));
});

const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a]);

function octetStream(bytes) {
  return async () =>
    new Response(bytes, {
      headers: { 'content-type': 'application/octet-stream' },
    });
}

test('the frame proxy accepts octet-stream JPEGs from the Singapore directory only', async () => {
  const ok = await fetchCctvImageFromUpstream(IMAGE, {
    fetchImpl: octetStream(JPEG_BYTES),
  });
  assert.equal(ok?.contentType, 'image/jpeg');
  assert.deepEqual([...ok.body], [...JPEG_BYTES]);

  // Not a JPEG: refused even on the Singapore directory.
  assert.equal(
    await fetchCctvImageFromUpstream(IMAGE, {
      fetchImpl: octetStream(Buffer.from('<html>nope</html>')),
    }),
    null,
  );
  // Another host still needs a real image type.
  assert.equal(
    await fetchCctvImageFromUpstream('https://example.test/a.jpg', {
      fetchImpl: octetStream(JPEG_BYTES),
    }),
    null,
  );
});
