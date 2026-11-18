const root = document.documentElement;
const header = document.querySelector('.site-header');
const menu = document.querySelector('.site-menu');
const menuButton = document.querySelector('.menu-toggle');
const mobileLayout = matchMedia('(max-width: 720px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

// The studio opens in its night palette. An explicit choice survives reloads.
const themeButton = document.querySelector('.theme-toggle');
function syncThemeControl() {
  const light = root.dataset.theme === 'light';
  const label = `Switch to ${light ? 'dark' : 'light'} theme`;
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
  document.querySelector('meta[name="theme-color"]').content = light ? '#f9f8f1' : '#151615';
}
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem('portfolio-theme', root.dataset.theme);
  } catch {
    /* Optional storage. */
  }
  syncThemeControl();
});
syncThemeControl();

// The mobile menu is a disclosure, so Tab and native hash links still work.
function setMenu(open) {
  menu.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
header.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('pointerdown', (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('focusin', (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
mobileLayout.addEventListener('change', () => setMenu(false));

const navigation = [...menu.querySelectorAll('a'), document.querySelector('.nav-contact')].map((link) => ({
  link,
  section: document.querySelector(link.hash),
}));
const progress = document.querySelector('.scroll-progress span');
const toTop = document.querySelector('.back-to-top');
let scrollFrame = 0;
function updateScrollUI() {
  scrollFrame = 0;
  const maxScroll = root.scrollHeight - innerHeight;
  const atEnd = maxScroll > 0 && scrollY >= maxScroll - 4;
  const marker = Math.max(innerHeight * 0.27, header.offsetHeight + 24);
  let current = navigation[0];
  for (const item of navigation) {
    if (item.section.getBoundingClientRect().top <= marker) current = item;
  }
  if (atEnd) current = navigation[navigation.length - 1];
  for (const item of navigation) {
    item.link.classList.toggle('is-active', item === current);
    if (item === current) item.link.setAttribute('aria-current', 'location');
    else item.link.removeAttribute('aria-current');
  }
  const percent = maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, scrollY / maxScroll));
  progress.style.transform = `scaleX(${percent})`;
  toTop.classList.toggle('is-visible', scrollY > innerHeight && !atEnd);
}
function scheduleScrollUI() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollUI);
}
window.addEventListener('scroll', scheduleScrollUI, { passive: true });
window.addEventListener('resize', scheduleScrollUI);
window.addEventListener('pageshow', scheduleScrollUI);
for (const notes of document.querySelectorAll('.project-notes')) notes.addEventListener('toggle', scheduleScrollUI);
updateScrollUI();

// The computer, props and live pixel face occupy separate depth planes.
// Use the untransformed hit area for measurements and only draw on input.
const stage = document.querySelector('.studio-scene');
const buddy = document.querySelector('.buddy-control');
const resetDepth = [];
function addDepth(hitArea, surface, strength, trackEyes = false) {
  let frame = 0;
  let clientX = 0;
  let clientY = 0;
  function render() {
    frame = 0;
    const rect = hitArea.getBoundingClientRect();
    const unit = (value) => Math.max(-1, Math.min(1, value * 2 - 1));
    const x = unit((clientX - rect.left) / rect.width);
    const y = unit((clientY - rect.top) / rect.height);
    surface.style.setProperty('--rx', `${(-y * strength * 0.8).toFixed(2)}deg`);
    surface.style.setProperty('--ry', `${(x * strength).toFixed(2)}deg`);
    if (trackEyes) {
      surface.style.setProperty('--eye-x', `${(x * 10).toFixed(1)}px`);
      surface.style.setProperty('--eye-y', `${(y * 6).toFixed(1)}px`);
    }
  }
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    for (const property of ['--rx', '--ry', '--eye-x', '--eye-y']) surface.style.removeProperty(property);
  }
  hitArea.addEventListener(
    'pointermove',
    (event) => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(render);
    },
    { passive: true }
  );
  hitArea.addEventListener('pointerleave', reset);
  hitArea.addEventListener('pointercancel', reset);
  resetDepth.push(reset);
}
addDepth(buddy, stage, 9, true);
for (const area of document.querySelectorAll('.poster-stage')) addDepth(area, area.firstElementChild, 3.5);
const resetAllDepth = () => resetDepth.forEach((reset) => reset());
reducedMotion.addEventListener('change', resetAllDepth);
finePointer.addEventListener('change', resetAllDepth);
window.addEventListener('blur', resetAllDepth);

// Ambient motion is optional, and stops completely when the stage isn't visible.
const motionButton = document.querySelector('.motion-toggle');
let ambientPaused = false;
try {
  ambientPaused = localStorage.getItem('portfolio-ambient') === 'off';
} catch {
  /* Optional storage. */
}
function syncAmbient() {
  const running = !ambientPaused && !reducedMotion.matches;
  stage.dataset.ambient = running ? 'on' : 'off';
  const label = running ? 'Pause ambient animation' : 'Play ambient animation';
  motionButton.setAttribute('aria-label', label);
  motionButton.title = label;
}
motionButton.addEventListener('click', () => {
  ambientPaused = !ambientPaused;
  try {
    localStorage.setItem('portfolio-ambient', ambientPaused ? 'off' : 'on');
  } catch {
    /* Optional storage. */
  }
  syncAmbient();
});
reducedMotion.addEventListener('change', syncAmbient);
syncAmbient();
let stageInView = true;
const syncVisibility = () => stage.classList.toggle('is-idle', !stageInView || document.hidden);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    stageInView = entry.isIntersecting;
    syncVisibility();
  }).observe(stage);
}
document.addEventListener('visibilitychange', syncVisibility);

const greetings = [
  { mood: 'love', words: 'Hello, human!' },
  { mood: 'wink', words: 'Nice to meet you.' },
  { mood: 'wow', words: 'Oh, more pixels!' },
  { mood: 'happy', words: 'Let’s build something!' },
];
const bubble = document.querySelector('.byte-speech');
let greetingIndex = 0;
let bubbleTimer, moodTimer, boopTimer;
const coarsePointer = matchMedia('(pointer: coarse)');
function labelBuddy() {
  const invitation = coarsePointer.matches ? 'Tap me!' : 'Click me!';
  buddy.querySelector('.with-js').textContent = invitation;
  buddy.setAttribute('aria-label', `${invitation} Say hello to Byte, the retro computer.`);
}
coarsePointer.addEventListener('change', labelBuddy);
labelBuddy();
buddy.disabled = false;
buddy.addEventListener('click', () => {
  clearTimeout(bubbleTimer);
  clearTimeout(moodTimer);
  clearTimeout(boopTimer);
  const { mood, words } = greetings[greetingIndex++ % greetings.length];
  stage.dataset.mood = mood;
  bubble.textContent = words;
  stage.classList.add('speaking');
  if (!reducedMotion.matches) {
    stage.classList.remove('is-booped');
    void buddy.offsetWidth; // Restart the one-shot bounce, including on a quick second tap.
    stage.classList.add('is-booped');
    boopTimer = setTimeout(() => stage.classList.remove('is-booped'), 700);
  }
  bubbleTimer = setTimeout(() => stage.classList.remove('speaking'), 2400);
  moodTimer = setTimeout(() => {
    stage.dataset.mood = 'happy';
    bubble.textContent = '';
  }, 3100);
});

// Clipboard fallback for browsers without the secure Clipboard API.
const copyButton = document.querySelector('.copy-email');
const toast = document.querySelector('.toast');
let toastTimer;
async function copyEmail(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const input = document.createElement('textarea');
    input.value = text;
    input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(input);
    try {
      input.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      input.remove();
      copyButton.focus({ preventScroll: true });
    }
  }
}
copyButton.addEventListener('click', async () => {
  const copied = await copyEmail(copyButton.dataset.email);
  const icon = copyButton.querySelector('use');
  clearTimeout(toastTimer);
  icon.setAttribute('href', copied ? '#i-check' : '#i-copy');
  toast.textContent = copied ? 'Email address copied!' : `Email: ${copyButton.dataset.email}`;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    icon.setAttribute('href', '#i-copy');
  }, 2400);
});
document.getElementById('year').textContent = new Date().getFullYear();
