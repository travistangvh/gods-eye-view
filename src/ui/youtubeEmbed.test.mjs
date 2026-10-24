import assert from 'node:assert/strict';
import test from 'node:test';
import { createYouTubeFrame, youtubeEmbedUrl } from './youtubeEmbed.js';

test('embed URL names the embedding page so YouTube can verify it', () => {
  const url = new URL(
    youtubeEmbedUrl('mll1VmKZ18U', {
      start: 10.7,
      autoplay: true,
      controls: false,
      origin: 'http://127.0.0.1:42003',
    }),
  );
  assert.equal(url.origin, 'https://www.youtube-nocookie.com');
  assert.equal(url.pathname, '/embed/mll1VmKZ18U');
  assert.equal(url.searchParams.get('start'), '10');
  assert.equal(url.searchParams.get('autoplay'), '1');
  assert.equal(url.searchParams.get('mute'), '1');
  assert.equal(url.searchParams.get('controls'), '0');
  assert.equal(url.searchParams.get('origin'), 'http://127.0.0.1:42003');
  assert.equal(
    url.searchParams.get('widget_referrer'),
    'http://127.0.0.1:42003/',
  );
});

test('a page without an http origin sends no origin', () => {
  const url = new URL(youtubeEmbedUrl('mll1VmKZ18U', { origin: 'null' }));
  assert.equal(url.searchParams.has('origin'), false);
  assert.equal(url.searchParams.has('autoplay'), false);
  assert.throws(() => youtubeEmbedUrl('../x'), /Invalid YouTube video ID/);
});

test('the frame is not sandboxed and keeps the referrer', () => {
  const attributes = new Map();
  const doc = {
    createElement: () => ({ setAttribute: (k, v) => attributes.set(k, v) }),
  };
  const frame = createYouTubeFrame(doc, 'mll1VmKZ18U', 'clip', {
    origin: 'http://localhost:1',
  });
  assert.equal(frame.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.match(frame.allow, /autoplay/);
  assert.equal(attributes.has('sandbox'), false);
});
