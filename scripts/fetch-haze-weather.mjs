/**
 * fetch-haze-weather.mjs — save the wind and PM2.5 the haze scene animates.
 *
 * Wind is Open-Meteo's historical forecast at 850 hPa (about 1.5 km up, the
 * height the smoke travels); PM2.5 is Open-Meteo's CAMS air-quality model at
 * the surface. Both are sampled every 3 hours on a 1-degree grid from
 * Sumatra and Java to Borneo and the southern Philippines. Keyless. Writes
 * public/scene-assets/singapore-haze-2026/weather.json as
 * { start, stepHours, lons, lats, steps: [{ u, v, pm25 }] } where each array
 * is row-major, north to south, west to east; u and v are m/s x 10 and pm25
 * is µg/m³. Usage: npm run weather:fetch [-- 2026-09-01 2026-10-23]
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [from = '2026-09-01', to = '2026-10-23'] = process.argv.slice(2);
const STEP_HOURS = 3;
const lons = Array.from({ length: 26 }, (_, i) => 95 + i);
const lats = Array.from({ length: 23 }, (_, i) => 15 - i);
const points = lats.flatMap((lat) => lons.map((lon) => [lat, lon]));
const BATCH = 100;

async function hourly(base, variables, extra = '') {
  const series = [];
  for (let i = 0; i < points.length; i += BATCH) {
    const batch = points.slice(i, i + BATCH);
    const url =
      `${base}?latitude=${batch.map((p) => p[0]).join(',')}` +
      `&longitude=${batch.map((p) => p[1]).join(',')}` +
      `&start_date=${from}&end_date=${to}&hourly=${variables.join(',')}${extra}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${base}: HTTP ${response.status}`);
    const body = await response.json();
    series.push(...(Array.isArray(body) ? body : [body]).map((entry) => entry.hourly));
    console.log(`${base.split('/')[2]} ${i + batch.length}/${points.length}`);
  }
  return series;
}

const wind = await hourly(
  'https://historical-forecast-api.open-meteo.com/v1/forecast',
  ['wind_speed_850hPa', 'wind_direction_850hPa'],
  '&wind_speed_unit=ms',
);
const air = await hourly('https://air-quality-api.open-meteo.com/v1/air-quality', ['pm2_5']);

const hours = wind[0].time.length;
const steps = [];
for (let hour = 0; hour < hours; hour += STEP_HOURS) {
  const u = [];
  const v = [];
  const pm25 = [];
  points.forEach((_, index) => {
    const speed = wind[index].wind_speed_850hPa[hour] ?? 0;
    // Direction is where the wind blows from; u/v point where it goes.
    const toward = (((wind[index].wind_direction_850hPa[hour] ?? 0) + 180) * Math.PI) / 180;
    u.push(Math.round(speed * Math.sin(toward) * 10));
    v.push(Math.round(speed * Math.cos(toward) * 10));
    pm25.push(Math.round(air[index].pm2_5[hour] ?? 0));
  });
  steps.push({ u, v, pm25 });
}
const output = path.join(root, 'public', 'scene-assets', 'singapore-haze-2026', 'weather.json');
writeFileSync(
  output,
  JSON.stringify({
    source:
      'Open-Meteo historical forecast (wind at 850 hPa) and CAMS air quality (surface PM2.5)',
    start: `${from}T00:00:00Z`,
    stepHours: STEP_HOURS,
    lons,
    lats,
    steps,
  }),
);
console.log(`${steps.length} steps written to ${path.relative(root, output)}`);
