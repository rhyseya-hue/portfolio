// The folio is ordinary HTML first. Motion, the cover press and view switching
// enhance it without intercepting scrolling, anchor navigation or project links.
const root = document.documentElement;
const header = document.querySelector('[data-header]');
const menu = document.querySelector('.mast-nav');
const menuButton = document.querySelector('.menu-toggle');
const cover = document.querySelector('.print-cover');
const archive = document.querySelector('.work-archive');
const strip = document.querySelector('.practice-strip');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mouse = matchMedia('(hover: hover) and (pointer: fine)');
const home = document.body.dataset.page === 'home';
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Optional preferences. */
  }
};

function setMenu(open) {
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('menu-open', open);
  if (open) menu.querySelector('a').focus({ preventScroll: true });
}
menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
header.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('pointerdown', (e) => {
  if (menu.classList.contains('open') && !header.contains(e.target)) setMenu(false);
});
document.addEventListener('focusin', (e) => {
  if (menu.classList.contains('open') && !header.contains(e.target)) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});
matchMedia('(max-width:760px)').addEventListener('change', () => setMenu(false));

const themeToggle = document.querySelector('[data-theme-toggle]');
function showTheme() {
  const night = root.dataset.theme === 'dark';
  themeToggle.querySelector('span').textContent = night ? 'Night mode' : 'Paper mode';
  themeToggle.setAttribute(
    'aria-label',
    `${night ? 'Night' : 'Paper'} mode. Switch to ${night ? 'light' : 'dark'} theme`,
  );
  document.querySelector('meta[name="theme-color"]').content = night ? '#232420' : '#f4f2e9';
}
themeToggle.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  save('portfolio-theme', root.dataset.theme);
  showTheme();
});
showTheme();
for (const year of document.querySelectorAll('[data-year]')) year.textContent = new Date().getFullYear();
const clock = document.querySelector('[data-clock]');
if (clock) {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const tick = () => {
    clock.textContent = `${time.format(new Date())} PHT`;
  };
  tick();
  setInterval(tick, 30000);
}

const notice = document.querySelector('.notice');
let noticeTimer;
function say(message) {
  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.classList.add('show');
  noticeTimer = setTimeout(() => notice.classList.remove('show'), 2300);
}
window.addEventListener('folio:notice', (e) => {
  if (typeof e.detail === 'string') say(e.detail);
});
async function copyText(value, button) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const input = document.createElement('textarea');
    input.value = value;
    input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(input);
    try {
      input.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      input.remove();
      button.focus({ preventScroll: true });
    }
  }
}
for (const button of document.querySelectorAll('[data-copy]'))
  button.addEventListener('click', async () => {
    say(
      (await copyText(button.dataset.copy, button))
        ? 'Email address copied.'
        : `Email: ${button.dataset.copy}`,
    );
  });

const nav = [...menu.querySelectorAll('[data-section]')];
const sections = home ? nav.map((a) => document.getElementById(a.dataset.section)) : [];
const contact = document.getElementById('contact');
const contactLink = header.querySelector('.talk-link');
let scrollFrame = 0;
function updatePage() {
  scrollFrame = 0;
  const max = root.scrollHeight - innerHeight;
  header.style.setProperty('--read', max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0);
  const line = Math.max(innerHeight * 0.3, header.offsetHeight + 15);
  let active = home ? null : 'work';
  for (const section of sections) if (section.getBoundingClientRect().top <= line) active = section.id;
  const inContact = contact.getBoundingClientRect().top <= line || (max > 0 && scrollY >= max - 3);
  for (const a of nav) {
    if (!inContact && a.dataset.section === active) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
  if (inContact) contactLink.setAttribute('aria-current', 'location');
  else contactLink.removeAttribute('aria-current');
}
function queueScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updatePage);
}
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll);
window.addEventListener('pageshow', queueScroll);
updatePage();

// Four independent layers: the type entrance, perspective hit area, floating
// cutout and remixed print. They never compete for the same transform.
const gs = window.gsap,
  st = window.ScrollTrigger;
if (gs && st) gs.registerPlugin(st);
let context = null,
  float = null,
  pointerFrame = 0,
  pointerX = 0,
  pointerY = 0;
let showEntrance = !reduced.matches && (!location.hash || ['#top', '#home', '#main'].includes(location.hash));
let allowMotion = (read('folio-motion') ?? read('portfolio-ambient')) !== 'off';
let artVisible = true,
  stripVisible = true;
const enabled = () => allowMotion && !reduced.matches;
function syncPlayback() {
  float?.paused(!enabled() || !artVisible || document.hidden);
  if (strip)
    strip.style.setProperty(
      '--ticker-play',
      enabled() && stripVisible && !document.hidden ? 'running' : 'paused',
    );
}
if (home && 'IntersectionObserver' in window) {
  let watch;
  function observeArtwork() {
    watch?.disconnect();
    // The fixed masthead can completely cover the ticker at the Work anchor.
    watch = new IntersectionObserver(
      (entries) => {
        for (const item of entries) {
          const seen = item.isIntersecting && item.intersectionRatio > 0;
          if (item.target === cover) artVisible = seen;
          if (item.target === strip) stripVisible = seen;
        }
        syncPlayback();
      },
      { rootMargin: `-${header.offsetHeight + 1}px 0px 0px`, threshold: [0, 0.001] },
    );
    if (cover) watch.observe(cover);
    if (strip) watch.observe(strip);
  }
  observeArtwork();
  if ('ResizeObserver' in window) new ResizeObserver(observeArtwork).observe(header);
}
document.addEventListener('visibilitychange', syncPlayback);
function resetTilt() {
  cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  if (cover) {
    cover.style.removeProperty('--rx');
    cover.style.removeProperty('--ry');
  }
}
function drawTilt() {
  pointerFrame = 0;
  cover.style.setProperty('--rx', `${-pointerY * 5}deg`);
  cover.style.setProperty('--ry', `${pointerX * 8}deg`);
}
if (cover) {
  const zone = cover.querySelector('.art-stage');
  zone.addEventListener(
    'pointermove',
    (e) => {
      if (!enabled() || !mouse.matches || e.pointerType === 'touch') return;
      const r = zone.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointerY = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(drawTilt);
    },
    { passive: true },
  );
  zone.addEventListener('pointerleave', resetTilt);
  zone.addEventListener('pointercancel', resetTilt);
  window.addEventListener('blur', resetTilt);
  mouse.addEventListener('change', resetTilt);
  const press = cover.querySelector('[data-remix]');
  const inks = ['Vermilion on ultramarine', 'Blue on apricot', 'Citrus on lilac'];
  press.addEventListener('click', () => {
    const mix = (Number(cover.dataset.mix) + 1) % inks.length;
    cover.dataset.mix = String(mix);
    press.querySelector('.mix-counter').textContent = `${mix + 1}/3`;
    context?.pullPrint?.();
    say(`Ink mix ${mix + 1}: ${inks[mix]}.`);
  });
}
function refreshPositions() {
  queueScroll();
  if (enabled() && gs) st?.refresh();
}
if (archive) {
  const switches = [...document.querySelectorAll('[data-view]')];
  function showLayout(mode, animate = false) {
    archive.dataset.layout = mode;
    for (const b of switches) b.setAttribute('aria-pressed', String(b.dataset.view === mode));
    if (animate) {
      context?.changeView?.();
      refreshPositions();
    }
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

function startMotion() {
  context?.revert();
  context = null;
  float = null;
  resetTilt();
  root.dataset.motion = enabled() ? 'on' : 'off';
  for (const b of document.querySelectorAll('[data-motion-toggle]')) {
    b.disabled = reduced.matches;
    b.setAttribute('aria-pressed', String(enabled()));
    const label = b.querySelector('span');
    if (label)
      label.textContent = reduced.matches ? 'Reduced motion' : enabled() ? 'Motion on' : 'Motion off';
    if (b.classList.contains('plate-motion'))
      b.querySelector('use').setAttribute('href', `assets/press/symbols.svg#${enabled() ? 'pause' : 'play'}`);
    b.title = reduced.matches
      ? 'Following your device’s reduced-motion preference'
      : enabled()
        ? 'Pause motion'
        : 'Enable motion';
  }
  if (gs && enabled()) {
    context = gs.context((self) => {
      const enter = showEntrance && scrollY < header.offsetHeight;
      if (cover) {
        if (enter) {
          const t = gs.timeline({
            id: 'folio-entrance',
            defaults: { ease: 'power3.out', clearProps: 'opacity,transform' },
          });
          t.from('.available', { y: 10, opacity: 0.25, duration: 0.42 }, 0)
            .from('.title-line', { yPercent: 24, opacity: 0.22, stagger: 0.11, duration: 0.77 }, 0.03)
            .from('.art-stage', { rotation: -5, y: 25, scale: 0.92, duration: 0.9, ease: 'back.out(1.2)' }, 0)
            .from('.cover-intro,.cover-actions', { y: 12, opacity: 0.32, stagger: 0.1, duration: 0.55 }, 0.26)
            .from('.art-caption,.cover-foot', { y: 5, opacity: 0.45, duration: 0.5 }, 0.4);
          const arrow = cover.querySelector('.hand-note path'),
            length = arrow.getTotalLength();
          t.fromTo(
            arrow,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 0.55, clearProps: 'strokeDasharray,strokeDashoffset' },
            0.48,
          );
        }
        float = gs
          .timeline({
            id: 'cover-float',
            paused: true,
            repeat: -1,
            yoyo: true,
            defaults: { ease: 'sine.inOut', duration: 3.7 },
          })
          .to('.hand-float', { y: -8, rotation: 1.6 }, 0)
          .to('.underprint', { x: -5, y: 3 }, 0);
        self.add('pullPrint', () =>
          gs.fromTo(
            '.ink-pop',
            { scale: 0.94, rotation: -2.5 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.5,
              ease: 'back.out(1.6)',
              clearProps: 'transform',
              overwrite: 'auto',
            },
          ),
        );
        self.add('changeView', () =>
          gs.from('.entry-info', {
            y: 9,
            opacity: 0.5,
            stagger: 0.05,
            duration: 0.3,
            clearProps: 'transform,opacity',
            overwrite: 'auto',
          }),
        );
        if (st)
          gs.to('.ink-disc', {
            yPercent: 9,
            ease: 'none',
            scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
          });
      } else if (enter) {
        gs.from('.case-title,.case-deck', {
          y: 22,
          opacity: 0.35,
          stagger: 0.09,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        });
      }
      if (st) {
        self.add('reveal', (items) =>
          gs.from(items, {
            y: 20,
            opacity: 0.45,
            duration: 0.58,
            stagger: 0.065,
            ease: 'power3.out',
            clearProps: 'opacity,transform',
          }),
        );
        // Content stays visible until its entrance actually starts. Hash links,
        // find-in-page, and keyboard focus never have to unlock hidden sections.
        st.batch(
          '.work-entry,.work-head,.profile-grid,.record-grid,.lab-heading,.lab-console,.case-story,.build-list li',
          { start: 'top 96%', once: true, interval: 0.06, batchMax: 3, onEnter: self.reveal },
        );
      }
    });
  }
  showEntrance = false;
  syncPlayback();
}
for (const b of document.querySelectorAll('[data-motion-toggle]'))
  b.addEventListener('click', () => {
    allowMotion = !allowMotion;
    save('folio-motion', allowMotion ? 'on' : 'off');
    startMotion();
  });
reduced.addEventListener('change', startMotion);
root.classList.add('js');
startMotion();
if (document.fonts?.ready) document.fonts.ready.then(refreshPositions);
window.addEventListener('folio:lab-ready', refreshPositions);
