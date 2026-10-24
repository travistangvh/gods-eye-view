import * as Cesium from 'cesium';

/**
 * Haze layers for a scene story, all driven by one clock time:
 * - `satellite`: daily Himawari-9 visible frames from NASA GIBS, with dark
 *   land and sea made transparent so only smoke and cloud lie on the globe;
 * - `wind`: particle trails advected by the historical 850 hPa wind;
 * - `cloud`: the modelled surface PM2.5 as a soft brown cloud;
 * - `tint`: a haze wash over the view, as thick as the PM2.5 at the camera;
 * - `readout`: PM2.5 at one place, for the story's counter.
 * Weather comes from `npm run weather:fetch`.
 */

const HOUR_MS = 3600000;
const GIBS_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
const SATELLITE_LAYER = 'Himawari_AHI_Band3_Red_Visible_1km';
/** UTC hour of the daily frame: late morning in western Indonesia. */
const SATELLITE_HOUR = 3;
const PARTICLES = 1100;
const TRAIL = 5;
/** Wind made the subject of a shot: denser, longer and brighter trails. */
const HERO = { particles: 2400, trail: 9, width: 2, alpha: 0.95 };
/** Satellite frames by URL, kept across shots so the next shot has them ready. */
const frameCache = new Map();
/** Fastest the wind may run, as story seconds per real second. */
const MAX_WIND_COMPRESSION = 14000;

/** Fractional weather step for a time, clamped to the data. */
export function weatherStepAt(weather, ms) {
  const start = Date.parse(weather.start);
  const step = (ms - start) / (weather.stepHours * HOUR_MS);
  return Math.min(weather.steps.length - 1, Math.max(0, step));
}

/**
 * One weather value at a place and time, bilinear in space and linear in
 * time. `key` is 'u', 'v' (m/s x 10) or 'pm25'. Outside the grid returns null.
 */
export function sampleWeather(weather, key, lat, lon, step) {
  const { lats, lons, steps } = weather;
  const y = (lats[0] - lat) / (lats[0] - lats[1]);
  const x = (lon - lons[0]) / (lons[1] - lons[0]);
  if (x < 0 || y < 0 || x > lons.length - 1 || y > lats.length - 1) return null;
  const x0 = Math.min(lons.length - 2, Math.floor(x));
  const y0 = Math.min(lats.length - 2, Math.floor(y));
  const tx = x - x0;
  const ty = y - y0;
  const at = (grid) => {
    const row = y0 * lons.length;
    const next = row + lons.length;
    return (
      (grid[row + x0] * (1 - tx) + grid[row + x0 + 1] * tx) * (1 - ty) +
      (grid[next + x0] * (1 - tx) + grid[next + x0 + 1] * tx) * ty
    );
  };
  const s0 = Math.floor(step);
  const s1 = Math.min(steps.length - 1, s0 + 1);
  const ts = step - s0;
  return at(steps[s0][key]) * (1 - ts) + at(steps[s1][key]) * ts;
}

/** The GIBS image URL for one day's satellite frame over a box. */
export function satelliteFrameUrl(day, [west, south, east, north], width = 1000) {
  const height = Math.round((width * (north - south)) / (east - west));
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.3.0',
    LAYERS: SATELLITE_LAYER,
    CRS: 'EPSG:4326',
    BBOX: `${south},${west},${north},${east}`,
    WIDTH: String(width),
    HEIGHT: String(height),
    FORMAT: 'image/png',
    TIME: `${day}T${String(SATELLITE_HOUR).padStart(2, '0')}:00:00Z`,
  });
  return `${GIBS_WMS}?${params}`;
}

/** Load a frame and keep only its bright smoke and cloud. */
function loadSatelliteFrame(doc, url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = doc.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data;
      for (let i = 0; i < data.length; i += 4) {
        const light = data[i] / 255;
        // Land and sea are dark in the visible band; smoke is a mid grey, so
        // it keeps most of its strength while the darkest ground drops out.
        data[i + 3] = Math.max(0, Math.min(255, (light - 0.12) * 2.8 * 255));
      }
      ctx.putImageData(pixels, 0, 0);
      resolve(canvas);
    };
    image.onerror = () => reject(new Error('Satellite frame unavailable'));
    image.src = url;
  });
}

/**
 * @param {object} viewer - Cesium viewer
 * @param {Document} doc
 * @param {HTMLElement} root - the story's overlay element
 * @param {object} spec - the story's `haze` options
 * @param {object} weather - parsed weather.json
 */
export function createSceneHaze(viewer, doc, root, spec, weather) {
  const C = Cesium;
  const scene = viewer.scene;
  const box = spec.bbox || [95, -7, 120, 8];
  const scratch = new C.Cartesian2();
  const cleanups = [];

  // --- satellite frames: two rectangles crossfading between days -----------
  const hero = typeof spec.wind === 'object' && spec.wind?.hero;
  const trailLength = hero ? HERO.trail : TRAIL;
  const began = performance.now();
  /** 0 to 1 over the shot's `fadeIn` seconds, so haze builds up gradually. */
  const fadeIn = () =>
    spec.fadeIn ? Math.min(1, (performance.now() - began) / 1000 / spec.fadeIn) : 1;
  const slots = [];
  if (spec.satellite) {
    const rectangle = C.Rectangle.fromDegrees(...box);
    for (let i = 0; i < 2; i++) {
      const material = C.Material.fromType('Image', {
        image: C.Material.DefaultImageId,
        // A warm tint reads as smoke rather than cloud.
        color: new C.Color(1, 0.9, 0.78, 0),
      });
      const primitive = scene.primitives.add(
        new C.Primitive({
          geometryInstances: new C.GeometryInstance({
            geometry: new C.RectangleGeometry({
              rectangle,
              height: spec.satelliteHeight ?? 3000,
              vertexFormat: C.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat,
            }),
          }),
          appearance: new C.MaterialAppearance({
            material,
            translucent: true,
            materialSupport: C.MaterialAppearance.MaterialSupport.TEXTURED,
          }),
          asynchronous: false,
        }),
      );
      slots.push({ primitive, material, day: null });
      cleanups.push(() => scene.primitives.remove(primitive));
    }
  }
  function frame(day) {
    const url = satelliteFrameUrl(day, box);
    if (!frameCache.has(url))
      frameCache.set(url, loadSatelliteFrame(doc, url).catch(() => null));
    return frameCache.get(url);
  }
  function showFrame(slot, day, alpha) {
    if (slot.day !== day) {
      slot.day = day;
      slot.ready = false;
      frame(day).then((canvas) => {
        if (slot.day !== day || !canvas) return;
        slot.material.uniforms.image = canvas;
        slot.ready = true;
      });
    }
    slot.material.uniforms.color.alpha = slot.ready ? alpha : 0;
  }

  // --- overlay canvases: haze cloud under wind trails -----------------------
  const canvas = (filter) => {
    const node = doc.createElement('canvas');
    Object.assign(node.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      filter,
    });
    root.prepend(node);
    return node;
  };
  const cloudCanvas = spec.cloud ? canvas('blur(14px)') : null;
  const windCanvas = spec.wind ? canvas('none') : null;
  const tint = spec.tint ? doc.createElement('div') : null;
  if (tint) {
    Object.assign(tint.style, {
      position: 'absolute',
      inset: '0',
      background:
        'linear-gradient(to bottom, rgba(186, 160, 120, 0.85), rgba(150, 120, 85, 0.6))',
      opacity: '0',
      transition: 'opacity 0.4s',
    });
    root.prepend(tint);
  }

  const particles = Array.from(
    { length: spec.wind ? (hero ? HERO.particles : PARTICLES) : 0 },
    () => spawn(),
  );
  function spawn(particle = {}) {
    particle.lon = box[0] + Math.random() * (box[2] - box[0]);
    particle.lat = box[1] + Math.random() * (box[3] - box[1]);
    particle.age = 0;
    particle.life = 1.5 + Math.random() * 2.5;
    particle.trail = [];
    return particle;
  }

  function project(lat, lon, occluder) {
    const position = C.Cartesian3.fromDegrees(lon, lat);
    if (!occluder.isPointVisible(position)) return null;
    return C.SceneTransforms.worldToWindowCoordinates(scene, position, scratch)
      ? { x: scratch.x, y: scratch.y }
      : null;
  }

  function fit(node) {
    const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
    const width = Math.round(node.clientWidth * ratio);
    const height = Math.round(node.clientHeight * ratio);
    if (node.width !== width || node.height !== height) {
      node.width = width;
      node.height = height;
    }
    const ctx = node.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return ctx;
  }

  function drawCloud(step, occluder) {
    const ctx = fit(cloudCanvas);
    const { lats, lons } = weather;
    const nodes = lats.map((lat) => lons.map((lon) => project(lat, lon, occluder)));
    const values = weather.steps;
    const s0 = Math.floor(step);
    const s1 = Math.min(values.length - 1, s0 + 1);
    const ts = step - s0;
    for (let y = 0; y < lats.length - 1; y++)
      for (let x = 0; x < lons.length - 1; x++) {
        const corners = [nodes[y][x], nodes[y][x + 1], nodes[y + 1][x + 1], nodes[y + 1][x]];
        if (corners.some((corner) => !corner)) continue;
        const index = y * lons.length + x;
        const pm = values[s0].pm25[index] * (1 - ts) + values[s1].pm25[index] * ts;
        const alpha = Math.min(0.8, Math.max(0, (pm - 25) / 140));
        if (alpha <= 0.02) continue;
        ctx.fillStyle = `rgba(176, 132, 86, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (const corner of corners.slice(1)) ctx.lineTo(corner.x, corner.y);
        ctx.closePath();
        ctx.fill();
      }
  }

  function drawWind(step, seconds, compression, occluder) {
    const ctx = fit(windCanvas);
    ctx.lineWidth = hero ? HERO.width : 1.1;
    ctx.lineCap = 'round';
    for (const particle of particles) {
      particle.age += seconds;
      const u = sampleWeather(weather, 'u', particle.lat, particle.lon, step);
      const v = sampleWeather(weather, 'v', particle.lat, particle.lon, step);
      if (u === null || v === null || particle.age > particle.life) {
        spawn(particle);
        continue;
      }
      const metres = seconds * compression;
      particle.lon += ((u / 10) * metres) / (111320 * Math.cos((particle.lat * Math.PI) / 180));
      particle.lat += ((v / 10) * metres) / 110540;
      particle.trail.push([particle.lat, particle.lon]);
      if (particle.trail.length > trailLength) particle.trail.shift();
      const points = particle.trail.map(([lat, lon]) => project(lat, lon, occluder));
      for (let i = 1; i < points.length; i++) {
        if (!points[i - 1] || !points[i]) continue;
        const fade = Math.min(1, particle.age / 0.4) * Math.min(1, (particle.life - particle.age) / 0.6);
        const strength = hero ? HERO.alpha : 0.6;
        ctx.strokeStyle = `rgba(235, 244, 255, ${(strength * i * fade) / points.length})`;
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
      }
    }
  }

  let last = performance.now();
  return {
    /**
     * Draw the haze for a moment in the story.
     * @param {number} ms - the story's current time
     * @param {number} compression - story seconds per real second, as wind speed scale
     */
    update(ms, compression) {
      const now = performance.now();
      const seconds = Math.min(0.1, (now - last) / 1000);
      last = now;
      const step = weatherStepAt(weather, ms);
      const occluder = new C.EllipsoidalOccluder(C.Ellipsoid.WGS84, scene.camera.positionWC);
      if (slots.length) {
        const dayMs = ms - SATELLITE_HOUR * HOUR_MS;
        const day = new Date(Math.floor(dayMs / 86400000) * 86400000);
        const fraction = (dayMs % 86400000) / 86400000;
        const today = day.toISOString().slice(0, 10);
        const tomorrow = new Date(day.getTime() + 86400000).toISOString().slice(0, 10);
        const opacity = (spec.satelliteOpacity ?? 0.9) * fadeIn();
        showFrame(slots[0], today, opacity * (1 - fraction));
        showFrame(slots[1], tomorrow, opacity * fraction);
        frame(new Date(day.getTime() + 2 * 86400000).toISOString().slice(0, 10));
      }
      if (cloudCanvas) {
        cloudCanvas.style.opacity = String(fadeIn());
        drawCloud(step, occluder);
      }
      if (windCanvas) windCanvas.style.opacity = String(fadeIn());
      if (windCanvas)
        drawWind(step, seconds, Math.min(compression, MAX_WIND_COMPRESSION), occluder);
      if (tint) {
        const camera = scene.camera.positionCartographic;
        const pm = sampleWeather(
          weather,
          'pm25',
          C.Math.toDegrees(camera.latitude),
          C.Math.toDegrees(camera.longitude),
          step,
        );
        tint.style.opacity = String(Math.min(0.62, Math.max(0, ((pm ?? 0) - 20) / 220)));
      }
      scene.requestRender?.();
      return spec.readout
        ? sampleWeather(weather, 'pm25', spec.readout.lat, spec.readout.lon, step)
        : null;
    },
    destroy() {
      for (const cleanup of cleanups) cleanup();
      cloudCanvas?.remove();
      windCanvas?.remove();
      tint?.remove();
    },
  };
}
