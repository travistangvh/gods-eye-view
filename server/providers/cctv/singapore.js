import { CCTV_SOURCE_FETCH_TIMEOUT_MS, SG_IMAGE_ORIGIN } from './constants.js';
import {
  cameraDisplayCode,
  fallbackHeadingFromId,
  pinnedCameraUrl,
  prioritizeSources,
  toFiniteNumber,
} from './normalize.js';
import { readResponseTextCapped } from '../common/http.js';

/** data.gov.sg real-time traffic images (LTA expressway and checkpoint
 * cameras): keyless JSON, one JPEG per camera. Adding `?date_time=` returns
 * the snapshot nearest that time, which this pack does not use. */
export const SG_TRAFFIC_IMAGES_URL =
  'https://api.data.gov.sg/v1/transport/traffic-images';
/** A snapshot of the whole network is a few KB (8 cameras on 2026-10-24, about
 * 90 before July 2026); the ceiling only stops an unbounded upstream. */
export const SG_MAX_CATALOG_BYTES = 1024 * 1024;
const DEFAULT_SG_MAX_SOURCES = 120;

/** Prioritization anchors: the two land crossings that the feed carries today,
 * then the city core, so a lowered cap still spans the island if the full
 * network returns. */
export const SG_ANCHORS = [
  { lat: 1.4455, lon: 103.769 }, // Woodlands Causeway
  { lat: 1.265, lon: 103.636 }, // Tuas Second Link
  { lat: 1.2819, lon: 103.852 }, // Central
];

/** Singapore main island with slack for the coast and Tuas. */
export function isLikelySingaporeCoordinate(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= 1.15 &&
    lat <= 1.5 &&
    lon >= 103.55 &&
    lon <= 104.1
  );
}

/**
 * Pin a published frame URL to the data.gov.sg traffic-image directory.
 *
 * @param {string|null|undefined} raw
 * @returns {?string}
 */
export function normalizeSgImageUrl(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  return pinnedCameraUrl(parsed.toString(), SG_IMAGE_ORIGIN);
}

/**
 * Pull the camera rows out of a traffic-images payload. The feed returns a
 * list of timestamped snapshots; the first is the current one.
 *
 * @param {unknown} payload
 * @returns {Array<object>}
 */
export function parseSgTrafficImages(payload) {
  const cameras = payload?.items?.[0]?.cameras;
  return Array.isArray(cameras) ? cameras : [];
}

/**
 * One published camera row -> one catalog source, or null.
 *
 * The feed names no road and gives no facing, so the label is the camera
 * number and headings use the shared id-hash fallback at low confidence
 * (correct them with the calibration gizmo).
 *
 * @param {object} record
 * @returns {?object}
 */
export function sgCameraToSource(record) {
  if (!record || typeof record !== 'object') return null;
  const number = String(record.camera_id ?? '').trim();
  if (!/^[A-Za-z0-9-]{1,16}$/.test(number)) return null;
  const lat = toFiniteNumber(record.location?.latitude);
  const lon = toFiniteNumber(record.location?.longitude);
  if (!isLikelySingaporeCoordinate(lat, lon)) return null;
  const imageUrl = normalizeSgImageUrl(record.image);
  if (!imageUrl) return null;

  const cameraId = `sg-lta-${number.toLowerCase()}`;
  const name = `LTA traffic camera ${number}`;
  return {
    id: cameraId,
    name,
    city: 'Singapore',
    cityId: 'sg',
    provider: 'Land Transport Authority / data.gov.sg',
    lat,
    lon,
    headingDeg: fallbackHeadingFromId(cameraId),
    headingConfidence: 'low',
    pitchDeg: -18,
    fovDeg: 44,
    rangeM: 145,
    mountHeightM: 8,
    // Low-lying island prior; the client's one-shot ground snap corrects.
    groundElevationM: 10,
    feedType: 'image',
    url: imageUrl,
    snapshotUrl: imageUrl,
    sourceKind: 'sg-lta-data-gov',
    license:
      'Singapore Open Data Licence v1.0 (LTA via data.gov.sg), attribution required',
    code: cameraDisplayCode(`SG ${number}`),
  };
}

function sgSourceCap() {
  const raw = Number(process.env.CCTV_SG_MAX_SOURCES || DEFAULT_SG_MAX_SOURCES);
  return Number.isFinite(raw)
    ? Math.max(1, Math.min(500, Math.floor(raw)))
    : DEFAULT_SG_MAX_SOURCES;
}

/**
 * Fetch Singapore traffic cameras from the keyless data.gov.sg feed. One
 * bounded request per shared catalog refresh; any failure contributes an
 * empty pack and the catalog keeps serving its last good list.
 *
 * @returns {Promise<Array<object>>}
 */
export async function loadSgSourcesFromOpenData() {
  try {
    const signal = AbortSignal.timeout(CCTV_SOURCE_FETCH_TIMEOUT_MS);
    const response = await fetch(
      process.env.CCTV_SG_URL || SG_TRAFFIC_IMAGES_URL,
      {
        headers: { Accept: 'application/json' },
        redirect: 'manual',
        signal,
      },
    );
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      console.warn(
        response.status >= 300 && response.status < 400
          ? '[CCTV] Singapore catalog redirected; redirects are not followed'
          : `[CCTV] Singapore camera download failed: ${response.status}`,
      );
      return [];
    }
    let payload;
    try {
      payload = JSON.parse(
        await readResponseTextCapped(response, SG_MAX_CATALOG_BYTES, signal),
      );
    } catch (error) {
      if (error?.code === 'RESPONSE_TOO_LARGE') {
        console.warn('[CCTV] Singapore catalog body exceeded byte ceiling');
        return [];
      }
      throw error;
    }
    const cameras = new Map();
    for (const record of parseSgTrafficImages(payload)) {
      const camera = sgCameraToSource(record);
      if (camera && !cameras.has(camera.id)) cameras.set(camera.id, camera);
    }
    const sources = prioritizeSources(
      [...cameras.values()],
      sgSourceCap(),
      SG_ANCHORS,
    );
    console.log(
      `[CCTV] Loaded Singapore camera sources: ${cameras.size} (using ${sources.length})`,
    );
    return sources;
  } catch (error) {
    console.warn(
      '[CCTV] Singapore camera download error:',
      error?.message || error,
    );
    return [];
  }
}
