import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSceneCaption } from './sceneCaption.js';

function fakeDocument() {
  const body = { children: [], appendChild(node) { this.children.push(node); } };
  return {
    body,
    createElement: () => ({
      style: {},
      dataset: {},
      attributes: {},
      textContent: '',
      setAttribute(name, value) { this.attributes[name] = value; },
      remove() { body.children.splice(body.children.indexOf(this), 1); },
    }),
  };
}

test('shows plain text and hides it again', () => {
  const doc = fakeDocument();
  const caption = createSceneCaption(doc);
  assert.equal(doc.body.children.length, 0, 'nothing is created until needed');
  caption.show('Oct 9: <b>central</b> PSI reaches 192');
  const [node] = doc.body.children;
  assert.equal(node.textContent, 'Oct 9: <b>central</b> PSI reaches 192');
  assert.equal(node.style.display, 'block');
  assert.equal(node.style.pointerEvents, 'none');
  assert.equal(node.attributes['aria-live'], 'polite');
  caption.hide();
  assert.equal(node.style.display, 'none');
  caption.show('  ');
  assert.equal(node.style.display, 'none', 'blank text hides the caption');
  caption.destroy();
  assert.equal(doc.body.children.length, 0);
});

test('without a document every call is a no-op', () => {
  const caption = createSceneCaption(null);
  assert.doesNotThrow(() => {
    caption.show('text');
    caption.hide();
    caption.destroy();
  });
});
