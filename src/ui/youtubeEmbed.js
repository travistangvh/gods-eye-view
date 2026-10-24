/** Shared YouTube player setup for scene cards, video walls and featured clips. */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Privacy-enhanced embed URL. YouTube refuses to play (error 153) when it
 * cannot tell which site embeds it, so the page's origin is passed both as
 * `origin` and `widget_referrer` in addition to the Referer header.
 *
 * @param {string} id
 * @param {{start?: number, autoplay?: boolean, controls?: boolean, origin?: string}} [options]
 * @returns {string}
 */
export function youtubeEmbedUrl(
  id,
  {
    start = 0,
    autoplay = false,
    controls = true,
    origin = globalThis.location?.origin,
  } = {},
) {
  if (!VIDEO_ID.test(String(id))) throw new Error('Invalid YouTube video ID');
  const url = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('rel', '0');
  const seconds = Math.max(0, Math.floor(Number(start) || 0));
  if (seconds > 0) url.searchParams.set('start', String(seconds));
  if (autoplay) {
    // Browsers only autoplay muted video.
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('mute', '1');
  }
  if (!controls) url.searchParams.set('controls', '0');
  if (/^https?:\/\//.test(String(origin ?? ''))) {
    url.searchParams.set('origin', origin);
    url.searchParams.set('widget_referrer', `${origin}/`);
  }
  return url.href;
}

/**
 * An iframe for one clip, configured the way YouTube expects: an explicit
 * referrer policy and no sandbox (a sandboxed player can fail its own
 * embedder check).
 *
 * @param {Document} doc
 * @param {string} id
 * @param {string} title
 * @param {Parameters<typeof youtubeEmbedUrl>[1]} [options]
 * @returns {HTMLIFrameElement}
 */
export function createYouTubeFrame(doc, id, title, options) {
  const frame = doc.createElement('iframe');
  frame.src = youtubeEmbedUrl(id, options);
  frame.title = title;
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  return frame;
}
