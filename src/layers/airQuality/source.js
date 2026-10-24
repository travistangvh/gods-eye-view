import { readResponseJsonCapped } from '../../sources/httpBody.js';
import {
  normalizeAqhiStations,
  normalizeAqhiObservations,
  normalizeNeaPsi,
} from './model.js';

// A portable export (package.json): no i18n here. Failures stay English data;
// the Layers panel and the Weather card show them translated.
const msg = (text) => text;

const COLLECTIONS_ROOT = 'https://api.weather.gc.ca/collections';
const STATIONS_URL = `${COLLECTIONS_ROOT}/aqhi-stations/items`;
const OBSERVATIONS_URL = `${COLLECTIONS_ROOT}/aqhi-observations-realtime/items`;

/** Comfortably above Canada's ~134 stations without inviting a huge page. */
const STATION_LIMIT = 500;
const OBSERVATION_LIMIT = 500;
/** Station geometry is near-static — a few changes a year. Refetch twice a day. */
const STATION_TTL_MS = 12 * 60 * 60 * 1000;
/** A full 500-row GeoJSON page is a few hundred KB; anything past this is not a page. */
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

/**
 * Request and validate a complete ECCC AQHI snapshot before it can replace
 * displayed readings. The first registered air-quality provider.
 *
 * Two collections are involved. `aqhi-stations` is the catalog — it supplies
 * every reading its coordinates and is cached for twelve hours because it
 * barely changes. `aqhi-observations-realtime` is the hourly reading feed,
 * requested with `latest=true` so the response is current values rather than
 * the full observation history, which is roughly 2,000 rows nationally.
 *
 * The station catalog is only replaced when a refresh actually returns
 * stations, so a transient empty response cannot blank the layer.
 *
 * @param {object} [options]
 * @param {Function} [options.fetchImpl] - Injected fetch, for tests.
 * @param {() => number} [options.now] - Clock seam, for tests.
 * @param {number} [options.timeoutMs=15000] - Deadline for each request.
 * @returns {{getSnapshot: Function}}
 */
export function createEcccAirQualitySource({
  fetchImpl = (...args) => globalThis.fetch(...args),
  now = () => Date.now(),
  timeoutMs = 15_000,
} = {}) {
  /** @type {Map<string, object>} */
  let stations = new Map();
  let stationsFetchedAt = 0;

  /** One bounded GeoJSON page: deadline, caller abort, byte cap, row cap. */
  const getJson = async (url, limit, signal) => {
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(
      () => controller.abort(new Error(msg('ECCC request timed out'))),
      timeoutMs,
    );
    try {
      signal?.throwIfAborted();
      const response = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`ECCC HTTP ${response.status}`);
      const payload = await readResponseJsonCapped(
        response,
        MAX_RESPONSE_BYTES,
        controller.signal,
      );
      // The server's `limit` is a request, not a guarantee.
      if (Array.isArray(payload?.features) && payload.features.length > limit)
        return { ...payload, features: payload.features.slice(0, limit) };
      return payload;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  };

  return {
    async getSnapshot({ signal } = {}) {
      const clock = now();
      if (stations.size === 0 || clock - stationsFetchedAt > STATION_TTL_MS) {
        const payload = await getJson(
          `${STATIONS_URL}?f=json&limit=${STATION_LIMIT}`,
          STATION_LIMIT,
          signal,
        );
        const next = normalizeAqhiStations(payload);
        if (!next) throw new Error(msg('Malformed AQHI station response'));
        // An empty refresh must not wipe a good catalog.
        if (next.size > 0) {
          stations = next;
          stationsFetchedAt = clock;
        }
      }
      if (stations.size === 0)
        throw new Error(msg('No AQHI stations available'));

      const payload = await getJson(
        `${OBSERVATIONS_URL}?f=json&latest=true&limit=${OBSERVATION_LIMIT}`,
        OBSERVATION_LIMIT,
        signal,
      );
      const readings = normalizeAqhiObservations(payload, stations, clock);
      if (!readings)
        throw new Error(msg('Malformed AQHI observation response'));
      return readings;
    },
  };
}

const NEA_PSI_URL = 'https://api.data.gov.sg/v1/environment/psi';
/** The feed is a few KB; anything past this is not the PSI response. */
const NEA_MAX_RESPONSE_BYTES = 256 * 1024;

/**
 * Request and validate the NEA (Singapore) 24-hour PSI before it can replace
 * displayed readings. Keyless; the data.gov.sg API allows browser requests.
 *
 * @param {object} [options]
 * @param {Function} [options.fetchImpl] - Injected fetch, for tests.
 * @param {() => number} [options.now] - Clock seam, for tests.
 * @param {number} [options.timeoutMs=15000] - Request deadline.
 * @returns {{getSnapshot: Function}}
 */
export function createNeaAirQualitySource({
  fetchImpl = (...args) => globalThis.fetch(...args),
  now = () => Date.now(),
  timeoutMs = 15_000,
} = {}) {
  return {
    async getSnapshot({ signal } = {}) {
      const controller = new AbortController();
      const abort = () => controller.abort(signal.reason);
      signal?.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(
        () => controller.abort(new Error(msg('NEA request timed out'))),
        timeoutMs,
      );
      try {
        signal?.throwIfAborted();
        const response = await fetchImpl(NEA_PSI_URL, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`NEA HTTP ${response.status}`);
        const payload = await readResponseJsonCapped(
          response,
          NEA_MAX_RESPONSE_BYTES,
          controller.signal,
        );
        const readings = normalizeNeaPsi(payload, now());
        if (!readings) throw new Error(msg('Malformed NEA PSI response'));
        return readings;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
      }
    },
  };
}

/**
 * Merge several air-quality networks into one snapshot. A network that fails
 * is left out while another answers; if every network fails, the first error
 * is thrown so the layer reports it rather than showing an empty feed as live.
 *
 * @param {Array<{getSnapshot: Function}>} sources
 * @returns {{getSnapshot: Function}}
 */
export function createCombinedAirQualitySource(sources) {
  return {
    async getSnapshot(options) {
      const results = await Promise.allSettled(
        sources.map((source) => source.getSnapshot(options)),
      );
      options?.signal?.throwIfAborted();
      const ok = results.filter((result) => result.status === 'fulfilled');
      if (ok.length === 0) throw results[0].reason;
      return ok
        .flatMap((result) => result.value)
        .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
    },
  };
}
