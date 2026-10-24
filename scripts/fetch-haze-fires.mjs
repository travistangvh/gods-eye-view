/**
 * fetch-haze-fires.mjs — save the 2026 fire season over Sumatra and
 * Kalimantan as one compact file the haze scene animates day by day.
 *
 * Source: NASA FIRMS, VIIRS (Suomi NPP) near-real-time detections, which
 * FIRMS keeps from 2026-07-01; days Suomi NPP missed come from NOAA-20. Needs FIRMS_MAP_KEY in the environment or in
 * pinokio/ENVIRONMENT. Writes
 * public/scene-assets/singapore-haze-2026/fires-viirs.json as
 * { start, days, fires: [[lat, lon, day, frp], ...] } with `day` counted
 * from `start`. Usage: npm run fires:fetch [-- 2026-07-01 2026-10-24]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'VIIRS_SNPP_NRT';
const FALLBACK_SOURCE = 'VIIRS_NOAA20_NRT';
// Sumatra, Kalimantan and the seas between them.
const AREA = '95,-6.5,119.5,6.5';
const DAYS_PER_REQUEST = 5;

function mapKey() {
  if (process.env.FIRMS_MAP_KEY) return process.env.FIRMS_MAP_KEY.trim();
  const file = path.join(root, 'pinokio', 'ENVIRONMENT');
  if (!existsSync(file)) return '';
  const line = readFileSync(file, 'utf8')
    .split('\n')
    .find((entry) => entry.startsWith('FIRMS_MAP_KEY='));
  return line ? line.slice('FIRMS_MAP_KEY='.length).trim().replace(/^['"]|['"]$/g, '') : '';
}

const day = 86400000;
const [startArg = '2026-07-01', endArg = new Date().toISOString().slice(0, 10)] =
  process.argv.slice(2);
const start = Date.parse(`${startArg}T00:00:00Z`);
const end = Date.parse(`${endArg}T00:00:00Z`);
const key = mapKey();
if (!key) {
  console.error('FIRMS_MAP_KEY is not set (environment or pinokio/ENVIRONMENT)');
  process.exit(1);
}

const fires = [];
const seen = new Set();

/** Add one request's detections; returns the day indexes it covered. */
async function collect(source, from, range) {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${source}/${AREA}/${range}/${from}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`FIRMS ${source} ${from}: HTTP ${response.status}`);
  const [header, ...rows] = (await response.text()).trim().split('\n');
  const columns = header.split(',');
  const at = (name) => columns.indexOf(name);
  const [lat, lon, date, time, frp, confidence] = [
    'latitude',
    'longitude',
    'acq_date',
    'acq_time',
    'frp',
    'confidence',
  ].map(at);
  for (const row of rows) {
    const cells = row.split(',');
    if (cells[confidence] === 'l') continue; // drop low-confidence pixels
    const index = Math.round((Date.parse(`${cells[date]}T00:00:00Z`) - start) / day);
    if (index < 0) continue;
    const id = `${cells[lat]},${cells[lon]},${cells[date]},${cells[time]}`;
    if (seen.has(id)) continue;
    seen.add(id);
    fires.push([
      Number(Number(cells[lat]).toFixed(3)),
      Number(Number(cells[lon]).toFixed(3)),
      index,
      Math.round(Number(cells[frp]) || 0),
    ]);
  }
  console.log(`${source} ${from} +${range - 1}d: ${rows.length} rows`);
}

for (let first = start; first <= end; first += DAYS_PER_REQUEST * day) {
  const range = Math.min(DAYS_PER_REQUEST, Math.round((end - first) / day) + 1);
  // A range runs forward from its date.
  await collect(SOURCE, new Date(first).toISOString().slice(0, 10), range);
}
// Fill days the primary satellite missed with its twin instrument on NOAA-20.
const covered = new Set(fires.map((fire) => fire[2]));
for (let index = 0; start + index * day <= end; index++) {
  if (covered.has(index)) continue;
  await collect(FALLBACK_SOURCE, new Date(start + index * day).toISOString().slice(0, 10), 1);
}
fires.sort((a, b) => a[2] - b[2]);
const output = path.join(
  root,
  'public',
  'scene-assets',
  'singapore-haze-2026',
  'fires-viirs.json',
);
writeFileSync(
  output,
  JSON.stringify({
    source: 'NASA FIRMS VIIRS Suomi NPP, gaps filled from NOAA-20 (near real time), nominal and high confidence',
    area: AREA,
    start: startArg,
    days: Math.round((end - start) / day) + 1,
    fires,
  }),
);
console.log(`${fires.length} detections written to ${path.relative(root, output)}`);
