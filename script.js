// Industrial folio — plain HTML first. Motion and view switching enhance it
// without intercepting scrolling, anchor navigation, or project links.
const root = document.documentElement;
const header = document.querySelector('[data-header]');
const menu = document.querySelector('.mast-nav');
const menuButton = document.querySelector('.menu-toggle');
const archive = document.querySelector('.work-archive');
const strip = document.querySelector('.practice-strip');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const home = document.body.dataset.page === 'home';
const read = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* Optional preferences. */ }
};

function setMenu(open) {
  if (!menu || !menuButton) return;
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-open', open);
  if (open) menu.querySelector('a')?.focus({ preventScroll: true });
}
menuButton?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
header?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('pointerdown', (e) => {
  if (menu?.classList.contains('open') && !header.contains(e.target)) setMenu(false);
});
document.addEventListener('focusin', (e) => {
  if (menu?.classList.contains('open') && !header.contains(e.target)) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.classList.contains('open')) { setMenu(false); menuButton.focus(); }
});
matchMedia('(max-width:760px)').addEventListener('change', () => setMenu(false));

const themeToggle = document.querySelector('[data-theme-toggle]');
function showTheme() {
  if (!themeToggle) return;
  const night = root.dataset.theme === 'dark';
  themeToggle.querySelector('span').textContent = night ? 'Dark mode' : 'Light mode';
  themeToggle.setAttribute('aria-label', `${night ? 'Dark' : 'Light'} mode. Switch to ${night ? 'light' : 'dark'} theme`);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = night ? '#141414' : '#ecece8';
}
themeToggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  save('portfolio-theme', root.dataset.theme);
  showTheme();
});
showTheme();
for (const year of document.querySelectorAll('[data-year]')) year.textContent = new Date().getFullYear();
const clock = document.querySelector('[data-clock]');
if (clock) {
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const tick = () => { clock.textContent = `${time.format(new Date())} PHT`; };
  tick();
  setInterval(tick, 30000);
}

const notice = document.querySelector('.notice');
let noticeTimer;
function say(message) {
  if (!notice) return;
  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.classList.add('show');
  noticeTimer = setTimeout(() => notice.classList.remove('show'), 2300);
}
window.addEventListener('folio:notice', (e) => { if (typeof e.detail === 'string') say(e.detail); });
async function copyText(value, button) {
  try { await navigator.clipboard.writeText(value); return true; }
  catch {
    const input = document.createElement('textarea');
    input.value = value; input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(input);
    try { input.select(); return document.execCommand('copy'); }
    catch { return false; }
    finally { input.remove(); button.focus({ preventScroll: true }); }
  }
}
for (const button of document.querySelectorAll('[data-copy]'))
  button.addEventListener('click', async () => {
    say((await copyText(button.dataset.copy, button)) ? 'Email address copied.' : `Email: ${button.dataset.copy}`);
  });

const nav = menu ? [...menu.querySelectorAll('[data-section]')] : [];
const sections = home ? nav.map((a) => document.getElementById(a.dataset.section)) : [];
const contact = document.getElementById('contact');
const contactLink = header?.querySelector('.talk-link');
let scrollFrame = 0;
function updatePage() {
  scrollFrame = 0;
  const max = root.scrollHeight - innerHeight;
  header?.style.setProperty('--read', max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0);
  const line = Math.max(innerHeight * 0.3, (header?.offsetHeight || 68) + 15);
  let active = home ? null : 'work';
  for (const section of sections) if (section?.getBoundingClientRect().top <= line) active = section.id;
  const inContact = contact ? (contact.getBoundingClientRect().top <= line || (max > 0 && scrollY >= max - 3)) : false;
  for (const a of nav) {
    if (!inContact && a.dataset.section === active) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
  if (contactLink) {
    if (inContact) contactLink.setAttribute('aria-current', 'location');
    else contactLink.removeAttribute('aria-current');
  }
}
function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updatePage); }
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll);
window.addEventListener('pageshow', queueScroll);
updatePage();

const gs = window.gsap, st = window.ScrollTrigger;
if (gs && st) gs.registerPlugin(st);
let context = null;
let showEntrance = !reduced.matches && (!location.hash || ['#top', '#home', '#main'].includes(location.hash));
let allowMotion = (read('folio-motion') ?? read('portfolio-ambient')) !== 'off';
let stripVisible = true;
const enabled = () => allowMotion && !reduced.matches;
function syncPlayback() {
  if (strip)
    strip.style.setProperty('--ticker-play', enabled() && stripVisible && !document.hidden ? 'running' : 'paused');
}
if (home && 'IntersectionObserver' in window && strip) {
  let watch;
  function observeStrip() {
    watch?.disconnect();
    watch = new IntersectionObserver(
      (entries) => { for (const item of entries) if (item.target === strip) stripVisible = item.isIntersecting && item.intersectionRatio > 0; syncPlayback(); },
      { rootMargin: `-${(header?.offsetHeight || 68) + 1}px 0px 0px`, threshold: [0, 0.001] },
    );
    watch.observe(strip);
  }
  observeStrip();
  if ('ResizeObserver' in window && header) new ResizeObserver(observeStrip).observe(header);
}
document.addEventListener('visibilitychange', syncPlayback);

function refreshPositions() { queueScroll(); if (enabled() && gs) st?.refresh(); }
if (archive) {
  const switches = [...document.querySelectorAll('[data-view]')];
  function showLayout(mode, animate = false) {
    archive.dataset.layout = mode;
    for (const b of switches) b.setAttribute('aria-pressed', String(b.dataset.view === mode));
    if (animate) { context?.changeView?.(); refreshPositions(); }
  }
  showLayout(read('folio-work-view') === 'index' ? 'index' : 'gallery');
  for (const b of switches)
    b.addEventListener('click', () => {
      if (b.dataset.view === archive.dataset.layout) return;
      save('folio-work-view', b.dataset.view);
      showLayout(b.dataset.view, true);
    });
}
for (const record of document.querySelectorAll('.records details'))
  record.addEventListener('toggle', refreshPositions);
document.querySelector('.screen-picks')?.addEventListener('change', refreshPositions);

function startMotion() {
  context?.revert();
  context = null;
  root.dataset.motion = enabled() ? 'on' : 'off';
  for (const b of document.querySelectorAll('[data-motion-toggle]')) {
    b.disabled = reduced.matches;
    b.setAttribute('aria-pressed', String(enabled()));
    const label = b.querySelector('span');
    if (label) label.textContent = reduced.matches ? 'Reduced motion' : enabled() ? 'Motion on' : 'Motion off';
    b.title = reduced.matches ? 'Following your device’s reduced-motion preference' : enabled() ? 'Pause motion' : 'Enable motion';
  }
  if (gs && enabled()) {
    context = gs.context((self) => {
      const enter = showEntrance && scrollY < (header?.offsetHeight || 68);
      if (home) {
        if (enter) {
          const t = gs.timeline({ id: 'hero-entrance', defaults: { ease: 'power3.out', clearProps: 'opacity,transform' } });
          t.from('.available', { y: 10, opacity: 0.3, duration: 0.4 }, 0)
            .from('.title-line', { yPercent: 30, opacity: 0.2, stagger: 0.1, duration: 0.7 }, 0.02)
            .from('.hero-intro,.hero-actions,.hero-stats', { y: 14, opacity: 0.35, stagger: 0.08, duration: 0.5 }, 0.22)
            .from('.spec-panel', { y: 20, opacity: 0.4, duration: 0.6 }, 0.15)
            .from('.hero-meta', { opacity: 0.4, duration: 0.4 }, 0.1);
        }
        self.add('changeView', () =>
          gs.from('.entry-info', { y: 10, opacity: 0.5, stagger: 0.05, duration: 0.3, clearProps: 'transform,opacity', overwrite: 'auto' }));
      } else if (enter) {
        gs.from('.case-title,.case-deck', { y: 22, opacity: 0.35, stagger: 0.09, duration: 0.65, ease: 'power3.out', clearProps: 'opacity,transform' });
      }
      if (st) {
        self.add('reveal', (items) =>
          gs.from(items, { y: 22, opacity: 0.45, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: 'opacity,transform' }));
        st.batch('.work-entry,.work-head,.profile-grid,.record-grid,.lab-heading,.lab-console,.case-story,.build-list li',
          { start: 'top 96%', once: true, interval: 0.06, batchMax: 3, onEnter: self.reveal });
      }
    });
  }
  showEntrance = false;
  syncPlayback();
}
for (const b of document.querySelectorAll('[data-motion-toggle]'))
  b.addEventListener('click', () => { allowMotion = !allowMotion; save('folio-motion', allowMotion ? 'on' : 'off'); startMotion(); });
reduced.addEventListener('change', startMotion);
root.classList.add('js');
startMotion();
if (document.fonts?.ready) document.fonts.ready.then(refreshPositions);
window.addEventListener('folio:lab-ready', refreshPositions);
