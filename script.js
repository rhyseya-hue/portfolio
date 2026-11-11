const root = document.documentElement;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
const themeButton = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const progressBar = document.querySelector('.scroll-progress span');
const backToTop = document.querySelector('.back-to-top');
const copyEmailButton = document.querySelector('.copy-email');
const toast = document.querySelector('.toast');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
const depthPointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');
const hero = document.querySelector('.hero');
const tiltElements = [...document.querySelectorAll('[data-tilt]')];
const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

let toastTimer;
let scrollTicking = false;

const hasSavedTheme = () => {
  try {
    return Boolean(localStorage.getItem('portfolio-theme'));
  } catch (error) {
    return false;
  }
};

const updateThemeControl = () => {
  const isDark = root.dataset.theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  themeButton.setAttribute('aria-pressed', String(isDark));
  themeButton.title = `Switch to ${nextTheme} theme`;
  themeColor.content = isDark ? '#040a13' : '#081221';
};

const applyTheme = (theme, persist = true) => {
  root.dataset.theme = theme;
  updateThemeControl();

  if (persist) {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch (error) {
      // The visual preference still applies when storage is unavailable.
    }
  }
};

const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
  menu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

const setActiveNavigation = () => {
  const activationLine = window.innerHeight * 0.38;
  let activeId = '';

  observedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeId = section.id;
    }
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    activeId = 'contact';
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const updateScrollInterface = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;

  progressBar.style.transform = `scaleX(${progress})`;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
  backToTop.classList.toggle('is-visible', window.scrollY > 640);
  setActiveNavigation();
  scrollTicking = false;
};

const requestScrollUpdate = () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollInterface);
    scrollTicking = true;
  }
};

const showToast = (message) => {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
};

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand('copy');
  textArea.remove();
  if (!copied) throw new Error('Copy command was not available');
};

themeButton.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

colorPreference.addEventListener('change', (event) => {
  if (!hasSavedTheme()) {
    applyTheme(event.matches ? 'dark' : 'light', false);
  }
});

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  menu.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    toast.classList.remove('is-visible');
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1000) closeMenu();
  requestScrollUpdate();
});

window.addEventListener('scroll', requestScrollUpdate, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'auto' : 'smooth' });
});

copyEmailButton.addEventListener('click', async () => {
  const email = copyEmailButton.dataset.email;

  try {
    await copyText(email);
    copyEmailButton.classList.add('is-copied');
    copyEmailButton.querySelector('span').textContent = 'COPIED';
    showToast('Email address copied to clipboard');

    window.setTimeout(() => {
      copyEmailButton.classList.remove('is-copied');
      copyEmailButton.querySelector('span').textContent = 'COPY';
    }, 2200);
  } catch (error) {
    showToast('Unable to copy. Email: rhyseya@gmail.com');
  }
});

const depthEffectsEnabled = () => depthPointerPreference.matches && !motionPreference.matches;
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
const tiltResets = [];
let heroDepthFrame;
let heroPointerX = 0;
let heroPointerY = 0;

const resetHeroDepth = () => {
  if (heroDepthFrame) {
    window.cancelAnimationFrame(heroDepthFrame);
    heroDepthFrame = undefined;
  }

  heroPointerX = 0;
  heroPointerY = 0;
  hero.style.setProperty('--scene-x', '0px');
  hero.style.setProperty('--scene-y', '0px');
  hero.style.setProperty('--scene-inverse-x', '0px');
  hero.style.setProperty('--scene-inverse-y', '0px');
  hero.style.setProperty('--scene-far-x', '0px');
  hero.style.setProperty('--scene-far-y', '0px');
};

const renderHeroDepth = () => {
  hero.style.setProperty('--scene-x', `${(-heroPointerX * 10).toFixed(2)}px`);
  hero.style.setProperty('--scene-y', `${(-heroPointerY * 7).toFixed(2)}px`);
  hero.style.setProperty('--scene-inverse-x', `${(heroPointerX * 6).toFixed(2)}px`);
  hero.style.setProperty('--scene-inverse-y', `${(heroPointerY * 4).toFixed(2)}px`);
  hero.style.setProperty('--scene-far-x', `${(heroPointerX * 15).toFixed(2)}px`);
  hero.style.setProperty('--scene-far-y', `${(heroPointerY * 11).toFixed(2)}px`);
  heroDepthFrame = undefined;
};

const updateHeroDepth = (event) => {
  if (!depthEffectsEnabled() || event.pointerType === 'touch') return;

  const bounds = hero.getBoundingClientRect();
  heroPointerX = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
  heroPointerY = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);

  if (!heroDepthFrame) {
    heroDepthFrame = window.requestAnimationFrame(renderHeroDepth);
  }
};

hero.addEventListener('pointermove', updateHeroDepth, { passive: true });
hero.addEventListener('pointerleave', resetHeroDepth);
hero.addEventListener('pointercancel', resetHeroDepth);

tiltElements.forEach((element) => {
  const glare = document.createElement('span');
  glare.className = 'tilt-glare';
  glare.setAttribute('aria-hidden', 'true');
  element.appendChild(glare);

  const configuredMaximum = Number.parseFloat(element.dataset.tiltMax);
  const configuredPerspective = Number.parseFloat(element.dataset.tiltPerspective);
  const maximumTilt = Number.isFinite(configuredMaximum) ? clamp(configuredMaximum, 0, 12) : 5;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let tiltBounds;
  let tiltFrame;

  if (Number.isFinite(configuredPerspective)) {
    element.style.setProperty('--tilt-perspective', `${clamp(configuredPerspective, 600, 2000)}px`);
  }

  const renderTilt = () => {
    const rotateX = (0.5 - pointerY) * maximumTilt * 2;
    const rotateY = (pointerX - 0.5) * maximumTilt * 2;

    element.style.setProperty('--tilt-rotate-x', `${rotateX.toFixed(2)}deg`);
    element.style.setProperty('--tilt-rotate-y', `${rotateY.toFixed(2)}deg`);
    element.style.setProperty('--tilt-glare-x', `${(pointerX * 100).toFixed(1)}%`);
    element.style.setProperty('--tilt-glare-y', `${(pointerY * 100).toFixed(1)}%`);
    tiltFrame = undefined;
  };

  const updateTilt = (event) => {
    if (!depthEffectsEnabled() || event.pointerType === 'touch') return;

    if (!tiltBounds || event.type === 'pointerenter') {
      tiltBounds = element.getBoundingClientRect();
    }

    pointerX = clamp((event.clientX - tiltBounds.left) / tiltBounds.width, 0, 1);
    pointerY = clamp((event.clientY - tiltBounds.top) / tiltBounds.height, 0, 1);
    element.classList.add('is-tilting');

    if (!tiltFrame) {
      tiltFrame = window.requestAnimationFrame(renderTilt);
    }
  };

  const resetTilt = () => {
    if (tiltFrame) {
      window.cancelAnimationFrame(tiltFrame);
      tiltFrame = undefined;
    }

    pointerX = 0.5;
    pointerY = 0.5;
    tiltBounds = undefined;
    element.classList.remove('is-tilting');
    element.style.setProperty('--tilt-rotate-x', '0deg');
    element.style.setProperty('--tilt-rotate-y', '0deg');
    element.style.setProperty('--tilt-glare-x', '50%');
    element.style.setProperty('--tilt-glare-y', '50%');
  };

  element.addEventListener('pointerenter', updateTilt, { passive: true });
  element.addEventListener('pointermove', updateTilt, { passive: true });
  element.addEventListener('pointerleave', resetTilt);
  element.addEventListener('pointercancel', resetTilt);
  tiltResets.push(resetTilt);
});

const resetDepthEffects = () => {
  resetHeroDepth();
  tiltResets.forEach((resetTilt) => resetTilt());
};

depthPointerPreference.addEventListener('change', resetDepthEffects);
motionPreference.addEventListener('change', resetDepthEffects);
window.addEventListener('resize', resetDepthEffects);
window.addEventListener('blur', resetDepthEffects);

const reveals = document.querySelectorAll('.reveal');

if (motionPreference.matches || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  reveals.forEach((element) => revealObserver.observe(element));
}

document.getElementById('year').textContent = new Date().getFullYear();
updateThemeControl();
updateScrollInterface();
