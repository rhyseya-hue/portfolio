import { makeWires, projectWires } from './geometry.js';

const lab = document.querySelector('[data-lab]');
const proof = lab.querySelector('#proof');
const drawing = proof.querySelector('[data-mesh]');
const angle = lab.querySelector('#angle');
const names = { knot: '01', ring: '02', ribbon: '03' };
const wireCache = new Map();
let frame = 0,
  drag = null;

function state() {
  const form = lab.querySelector('input[name="geometry"]:checked').value;
  const ink = lab.querySelector('input[name="ink"]:checked');
  return { form, color: ink.value, ink: ink.dataset.name, turn: Number(angle.value) };
}
function render() {
  frame = 0;
  const { form, color, ink, turn } = state();
  if (!wireCache.has(form)) wireCache.set(form, makeWires(form));
  drawing.setAttribute('d', projectWires(wireCache.get(form), turn));
  drawing.setAttribute('stroke', color);
  proof.querySelector('[data-proof-code]').textContent = `STUDY ${names[form]}`;
  proof.querySelector('[data-proof-name]').textContent = `${form} / ${ink}`.toUpperCase();
  proof.querySelector('title').textContent =
    `Form study: ${form} in ${ink.toLowerCase()} ink, rotated ${turn} degrees`;
  lab.querySelector('.ink-name').textContent = ink;
  lab.querySelector('#angle-value').value = `${turn}°`;
  angle.setAttribute('aria-valuetext', `${turn} degrees`);
}
function queueFrame() {
  if (!frame) frame = requestAnimationFrame(render);
}
lab.addEventListener('input', queueFrame);

// Horizontal drag is optional: vertical touch scrolling and the native keyboard
// range control remain available. No idle render loop is needed for the lab.
proof.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, turn: Number(angle.value) };
  proof.setPointerCapture(event.pointerId);
  proof.classList.add('is-grabbing');
});
proof.addEventListener('pointermove', (event) => {
  if (!drag || drag.id !== event.pointerId) return;
  const delta = ((event.clientX - drag.x) * 300) / Math.max(1, proof.clientWidth);
  angle.value = String(((Math.round(drag.turn + delta) % 360) + 360) % 360);
  queueFrame();
});
function stopDrag() {
  drag = null;
  proof.classList.remove('is-grabbing');
}
proof.addEventListener('lostpointercapture', stopDrag);
proof.addEventListener('pointercancel', stopDrag);

lab.querySelector('.reset-print').addEventListener('click', () => {
  lab.querySelector('input[name="geometry"][value="knot"]').checked = true;
  lab.querySelector('input[name="ink"]').checked = true;
  angle.value = '24';
  queueFrame();
});
lab.querySelector('.export-print').addEventListener('click', () => {
  cancelAnimationFrame(frame);
  render();
  const { form, ink, turn } = state();
  const copy = proof.cloneNode(true);
  copy.removeAttribute('id');
  copy.removeAttribute('class');
  copy.setAttribute('width', '1280');
  copy.setAttribute('height', '824');
  const file = new Blob([new XMLSerializer().serializeToString(copy)], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(file),
    link = document.createElement('a');
  link.href = url;
  link.download = `rozel-eliodra-${form}-${ink.toLowerCase()}-${turn}.svg`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  window.dispatchEvent(new CustomEvent('folio:notice', { detail: 'Your SVG print download has started.' }));
});
render();
// Only replace the archive plate once the live geometry has actually drawn.
proof.querySelector('[data-first-frame]').remove();
lab.querySelector('.lab-controls').hidden = false;
lab.classList.add('is-ready');
lab.querySelector('.lab-hint').textContent = 'Drag to turn / or use the rotation slider';
window.dispatchEvent(new Event('folio:lab-ready'));
