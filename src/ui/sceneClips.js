import { createYouTubeFrame } from './youtubeEmbed.js';

/**
 * Local copies of the YouTube clips a scene plays. Some windows (Pinokio's
 * among them) cannot run YouTube's player, so `npm run clips:fetch` saves
 * each clip, cut to the part the scene shows, under public/scene-assets/clips.
 * A missing file falls back to the YouTube player.
 */

export const SCENE_CLIP_DIRECTORY = 'scene-assets/clips';
/** Seconds kept for clips that play over the map; they loop while a shot holds. */
export const OVERLAY_CLIP_SECONDS = 40;
/** Seconds kept for clips the viewer opens from a card. */
export const CARD_CLIP_SECONDS = 90;

/**
 * @param {string} videoId
 * @param {number} [start]
 * @param {number} [seconds] - an exact length; omitted for the default cut
 * @returns {string}
 */
export function sceneClipFileName(videoId, start = 0, seconds = null) {
  const whole = (value) => Math.max(0, Math.floor(Number(value) || 0));
  return seconds
    ? `${videoId}-${whole(start)}s-${whole(seconds)}s.mp4`
    : `${videoId}-${whole(start)}s.mp4`;
}

/**
 * Every clip a recipe plays, once each: video walls, featured clips, fire
 * story beats (cut to their exact length) and card videos.
 *
 * @param {object} recipe
 * @returns {Array<{videoId: string, start: number, seconds: number, file: string}>}
 */
export function collectSceneClips(recipe) {
  const clips = new Map();
  const add = (videoId, start, seconds, exact = false) => {
    const file = sceneClipFileName(videoId, start, exact ? seconds : null);
    if (!clips.has(file))
      clips.set(file, { videoId, start: Number(start) || 0, seconds, file });
  };
  for (const shot of recipe?.cameraPath || []) {
    for (const item of shot.videoWall || [])
      add(item.videoId, item.start, OVERLAY_CLIP_SECONDS);
    if (shot.videoFeature?.videoId)
      add(
        shot.videoFeature.videoId,
        shot.videoFeature.start,
        OVERLAY_CLIP_SECONDS,
      );
    for (const beat of shot.fireStory?.beats || [])
      if (beat.clip)
        add(beat.clip.videoId, beat.clip.start, beat.clip.seconds, true);
    for (const item of shot.interactions || []) {
      const video = item.action?.video;
      if (video?.provider === 'youtube') add(video.id, 0, CARD_CLIP_SECONDS);
    }
  }
  return [...clips.values()];
}

/**
 * Play a clip from its local copy, or from YouTube when there is none.
 * Overlay clips autoplay muted and loop without controls; card clips wait
 * for the viewer and show controls.
 *
 * @param {Document} doc
 * @param {{videoId: string, start?: number, title: string, autoplay?: boolean}} clip
 * @returns {HTMLElement} a <video>, replaced in place by an iframe on error
 */
export function createSceneClipPlayer(
  doc,
  { videoId, start = 0, seconds = null, title, autoplay = false },
) {
  const video = doc.createElement('video');
  video.src = `/${SCENE_CLIP_DIRECTORY}/${sceneClipFileName(videoId, start, seconds)}`;
  video.title = title;
  video.playsInline = true;
  video.preload = autoplay ? 'auto' : 'metadata';
  if (autoplay) {
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
  } else {
    video.controls = true;
  }
  video.addEventListener(
    'error',
    () => {
      const frame = createYouTubeFrame(doc, videoId, title, {
        start,
        autoplay,
        controls: !autoplay,
      });
      frame.style.cssText = video.style.cssText;
      if (video.width) frame.width = video.width;
      if (video.height) frame.height = video.height;
      video.replaceWith(frame);
    },
    { once: true },
  );
  return video;
}
