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
for (const notes of document.querySelectorAll('.project-notes')) {
  notes.addEventListener('toggle', () => {
    scheduleScrollUI();
    // An open disclosure moves the sections below it.
    if (window.gsap && !reducedMotion.matches) window.ScrollTrigger?.refresh();
  });
}
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

// Only the ambient loop is continuous. Suspend it off-screen and in background tabs.
const motionButton = document.querySelector('.motion-toggle');
let ambientLoop, greetingBounce;
let ambientPaused = false;
let stageInView = true;
try {
  ambientPaused = localStorage.getItem('portfolio-ambient') === 'off';
} catch {
  /* Optional storage. */
}
function syncAmbient() {
  const enabled = Boolean(ambientLoop) && !ambientPaused && !reducedMotion.matches;
  stage.dataset.ambient = enabled ? 'on' : 'off';
  motionButton.hidden = !ambientLoop;
  const label = enabled ? 'Pause ambient animation' : 'Play ambient animation';
  motionButton.setAttribute('aria-label', label);
  motionButton.title = label;
  if (enabled) ambientLoop.paused(!stageInView || document.hidden);
  else ambientLoop?.pause(0);
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
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    stageInView = entry.isIntersecting;
    syncAmbient();
  }).observe(stage);
}
document.addEventListener('visibilitychange', syncAmbient);

function enterStudio(gsap) {
  const intro = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } });
  intro
    .from('.availability', { y: 10, opacity: 0.3, duration: 0.4 }, 0)
    .from('.hero-line', { y: 26, opacity: 0.25, stagger: 0.09, duration: 0.7 }, 0.05)
    .from('.hero-intro, .hero-actions, .location-line', { y: 13, opacity: 0.25, stagger: 0.06, duration: 0.5 }, 0.24)
    .from(buddy, { y: 26, scale: 0.92, rotation: -3, duration: 0.9, ease: 'back.out(1.35)' }, 0)
    .from('.hero-foot', { y: 5, opacity: 0.3, duration: 0.45 }, 0.4);

  const arrow = buddy.querySelector('.buddy-note path');
  const length = arrow.getTotalLength();
  intro.fromTo(
    arrow,
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDashoffset: 0, duration: 0.48, ease: 'sine.inOut', clearProps: 'strokeDasharray,strokeDashoffset' },
    0.43
  );
}

function setupStudioMotion(gsap, scrollTrigger) {
  if (!gsap) return; // Keep the portfolio and Byte's greetings usable without the animation library.
  if (scrollTrigger) gsap.registerPlugin(scrollTrigger);
  let playEntrance = !reducedMotion.matches && ['', '#home', '#top', '#main'].includes(location.hash);

  // matchMedia reverts transforms, stops timelines and removes triggers when the OS preference changes.
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', (context) => {
    if (playEntrance && scrollY < header.offsetHeight) enterStudio(gsap);
    playEntrance = false;

    ambientLoop = gsap
      .timeline({
        id: 'byte-ambient',
        paused: true,
        repeat: -1,
        defaults: { ease: 'sine.inOut', yoyo: true, repeat: 1 },
      })
      .to('.computer-layer', { y: -4, duration: 4 }, 0)
      .to('.prop-disk', { x: -2, y: -8, rotation: '-=4', duration: 2, repeat: 3 }, 0)
      .to('.prop-star', { x: 2, y: 8, duration: 4 }, 0)
      .to('.prop-orb', { y: -10, duration: 2, repeat: 3 }, 0)
      .to('.blink', { scaleY: 0.15, transformOrigin: '50% 50%', duration: 0.08 }, 6.3);

    greetingBounce = gsap
      .timeline({ id: 'byte-greeting', paused: true })
      .to('.computer-body', { y: 4, scaleY: 0.97, scaleX: 1.02, duration: 0.09, ease: 'power2.in' })
      .to('.computer-body', { y: -13, scaleY: 1.015, scaleX: 1, rotation: 2, duration: 0.2, ease: 'power2.out' })
      .to('.computer-body', { y: 0, scaleY: 1, rotation: 0, duration: 0.32, ease: 'back.out(1.6)' })
      .to('.prop-star', { rotation: '+=28', yoyo: true, repeat: 1, duration: 0.26, ease: 'sine.inOut' }, 0);

    if (scrollTrigger) {
      gsap.to(stage, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
      });
      // Reveal on entry, not by hiding content on page load. Anchors and keyboard focus stay usable.
      context.add('reveal', (items) =>
        gsap.from(items, {
          y: 20,
          opacity: 0.4,
          stagger: 0.075,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        })
      );
      scrollTrigger.batch('.section-heading, .project-card, .about-copy, .capability, .timeline li', {
        start: 'top 96%',
        once: true,
        interval: 0.06,
        batchMax: 4,
        onEnter: context.reveal,
      });
    }
    syncAmbient();
    return () => {
      ambientLoop = greetingBounce = null;
      syncAmbient();
    };
  });
}
setupStudioMotion(window.gsap, window.ScrollTrigger);
syncAmbient();

const greetings = [
  { mood: 'love', words: 'Hello, human!' },
  { mood: 'wink', words: 'Nice to meet you.' },
  { mood: 'wow', words: 'Oh, more pixels!' },
  { mood: 'happy', words: 'Let’s build something!' },
];
const bubble = document.querySelector('.byte-speech');
let greetingIndex = 0;
let bubbleTimer, moodTimer;
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
  const { mood, words } = greetings[greetingIndex++ % greetings.length];
  stage.dataset.mood = mood;
  bubble.textContent = words;
  stage.classList.add('speaking');
  if (!reducedMotion.matches) greetingBounce?.restart();
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
