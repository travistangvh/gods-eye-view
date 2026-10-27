/** A text caption over the map for the scene shot that is playing. */
import { viewportOverlayScale, zoomOverlay } from './sceneOverlayScale.js';

/**
 * Create the caption. Without a document (headless runs) every call is a no-op.
 * The caption is plain text, ignores the pointer, and is announced politely.
 *
 * @param {Document} [doc]
 * @returns {{show: (text: string) => void, hide: () => void, destroy: () => void}}
 */
export function createSceneCaption(doc = globalThis.document) {
  let element = null;
  const ensure = () => {
    if (element || !doc?.body) return element;
    element = doc.createElement('div');
    element.dataset.sceneCaption = '';
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    Object.assign(element.style, {
      position: 'fixed',
      left: '50%',
      bottom: 'max(130px, 16%)', // clear of the bottom dock
      transform: 'translateX(-50%)',
      maxWidth: 'min(80vw, 900px)',
      padding: '10px 18px',
      borderRadius: '6px',
      background: 'rgba(6, 12, 20, 0.78)',
      border: '1px solid rgba(110, 234, 255, 0.45)',
      color: '#f2fbff',
      font: '600 20px/1.35 system-ui, sans-serif',
      textAlign: 'center',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
      pointerEvents: 'none',
      zIndex: '40',
      display: 'none',
    });
    doc.body.appendChild(element);
    return element;
  };
  return {
    show(text) {
      const label = String(text ?? '').trim();
      if (!label) return this.hide();
      const node = ensure();
      if (!node) return;
      node.textContent = label;
      // Larger in a portrait (phone) viewport, and no wider than the screen.
      const scale = viewportOverlayScale(doc.defaultView);
      zoomOverlay(node, scale);
      node.style.maxWidth = scale > 1 ? `${90 / scale}vw` : 'min(80vw, 900px)';
      // A portrait render has no dock to clear, so the caption sits lower and
      // leaves the middle of the frame to the story's cards.
      node.style.bottom = scale > 1 ? '56px' : 'max(130px, 16%)';
      node.style.display = 'block';
    },
    hide() {
      if (element) element.style.display = 'none';
    },
    destroy() {
      element?.remove();
      element = null;
    },
  };
}
