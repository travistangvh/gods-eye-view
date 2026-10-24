/** Portable camera poses and authored motion. Angles are degrees; heights are ellipsoidal meters. */

/** Resolve an inline pose or a scene-local geographic anchor without modifying authored state. */
export function resolveCameraPose(scene, camera) {
  if (!camera) return null;
  const position = camera.anchorId
    ? scene?.anchors?.find(({ id }) => id === camera.anchorId)
    : camera;
  if (!position) throw new Error('Camera anchor is unavailable');
  return {
    lat: position.lat,
    lon: position.lon,
    alt: position.alt,
    heading: camera.heading ?? 0,
    pitch: camera.pitch ?? -35,
    roll: camera.roll ?? 0,
  };
}

/** Resolve both authored endpoints. An explicit move never depends on the live viewport. */
export function resolveCameraMove(scene, shot) {
  if (!shot?.move) return null;
  return {
    from: resolveCameraPose(scene, shot.move.from),
    to: resolveCameraPose(scene, shot.camera),
    easing: shot.move.easing,
    durationSec: shot.durationSec,
  };
}

/** Wrap an interpolated camera longitude to WGS84 without changing authored endpoints. */
export function normalizeCameraLongitude(longitude) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

/**
 * A dive zooms in like scrolling: the camera centres over its target early,
 * its height falls at a steady logarithmic rate, and it tilts toward the
 * horizon only near the end, so there is no sideways sweep while low. A dive
 * out runs the same curve backwards.
 */
function sampleDive(move, t) {
  const { from, to } = move;
  const smooth = (x) => x * x * (3 - 2 * x);
  const across = 1 - (1 - Math.min(1, t / 0.6)) ** 3;
  const zoom = t + 0.5 * t * (1 - t);
  const tilt = smooth(Math.max(0, (t - 0.6) / 0.4));
  const angle = (a, b, amount) =>
    a + (((((b - a + 540) % 360) + 360) % 360) - 180) * amount;
  const low = Math.max(1, to.alt);
  const high = Math.max(1, from.alt);
  return {
    lat: from.lat + (to.lat - from.lat) * across,
    lon: normalizeCameraLongitude(angle(from.lon, to.lon, across)),
    alt: high * (low / high) ** zoom,
    heading: angle(from.heading, to.heading, tilt),
    pitch: from.pitch + (to.pitch - from.pitch) * tilt,
    roll: angle(from.roll, to.roll, tilt),
  };
}

/** Sample the same authored curve for playback and seeking, taking the short longitude/angle arc. */
export function sampleCameraMove(move, progress) {
  const t = Math.max(0, Math.min(1, Number(progress) || 0));
  if (t === 0) return { ...move.from };
  if (t === 1) return { ...move.to };
  if (move.easing === 'dive')
    // Rising out is the same curve run backwards: lift first, then pan.
    return move.to.alt > move.from.alt
      ? sampleDive({ from: move.to, to: move.from }, 1 - t)
      : sampleDive(move, t);
  const eased =
    move.easing === 'linear'
      ? t
      : t < 0.5
        ? 4 * t ** 3
        : 1 - (-2 * t + 2) ** 3 / 2;
  const lerp = (a, b) => a + (b - a) * eased;
  const angle = (a, b) =>
    a + (((((b - a + 540) % 360) + 360) % 360) - 180) * eased;
  const { from, to } = move;
  return {
    lat: lerp(from.lat, to.lat),
    lon: normalizeCameraLongitude(angle(from.lon, to.lon)),
    alt: lerp(from.alt, to.alt),
    heading: angle(from.heading, to.heading),
    pitch: lerp(from.pitch, to.pitch),
    roll: angle(from.roll, to.roll),
  };
}
