// Scroll-linked effects: parallax, hero fade, pinned horizontal gallery,
// word highlighting, progress bar, header state and current-section label.

import { splitWords } from './split.js';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export function initScrollEffects({ reduceMotion, onScroll }) {
  const header = document.querySelector('[data-header]');
  const progressBar = document.querySelector('.progress__bar');
  const heroInner = document.querySelector('.hero__inner');
  const hscroll = document.querySelector('[data-hscroll]');
  const track = document.querySelector('[data-hscroll-track]');
  const statement = document.querySelector('[data-word-reveal]');

  let vh = window.innerHeight;
  let vw = window.innerWidth;
  let lastY = window.scrollY;
  let parallaxItems = [];
  let hs = { top: 0, height: 0, travel: 0 };
  const words = statement && !reduceMotion ? splitWords(statement) : [];

  /* ---------- Measurements (cached; refreshed on resize) ---------- */
  function measure() {
    vh = window.innerHeight;
    vw = window.innerWidth;

    if (hscroll && track && !reduceMotion) {
      track.style.transform = '';
      const travel = Math.max(track.scrollWidth - vw, 0);
      hscroll.style.setProperty('--hscroll-h', `${travel + vh}px`);
      const rect = hscroll.getBoundingClientRect();
      hs = { top: rect.top + window.scrollY, height: travel + vh, travel };
    }

    if (!reduceMotion) {
      parallaxItems = [...document.querySelectorAll('[data-speed]')].map((el) => {
        el.style.transform = '';
        const rect = el.getBoundingClientRect();
        const isInner = el.classList.contains('ph__inner');
        return {
          el,
          speed: parseFloat(el.dataset.speed) || 0,
          center: rect.top + window.scrollY + rect.height / 2,
          // Inner layers are 16% taller than their frame; never move past that slack.
          limit: isInner ? rect.height * 0.068 : Infinity,
        };
      });
    }
  }

  /* ---------- Per-frame update ---------- */
  function update() {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - vh;

    // Progress bar
    if (progressBar) progressBar.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`;

    // Header: tint after leaving the top, hide while scrolling down
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > vh * 0.6) header.classList.add('is-hidden');
      else if (goingUp) header.classList.remove('is-hidden');
    }
    lastY = y;

    if (reduceMotion) return;

    // Hero drifts up and fades as you leave it
    if (heroInner && y < vh * 1.2) {
      const p = clamp(y / vh, 0, 1);
      heroInner.style.transform = `translate3d(0, ${p * vh * 0.25}px, 0) scale(${1 - p * 0.05})`;
      heroInner.style.opacity = `${1 - p * 1.1}`;
    }

    // Parallax
    for (const item of parallaxItems) {
      const dist = item.center - (y + vh / 2);
      if (Math.abs(dist) > vh * 1.5) continue;
      const offset = clamp(dist * item.speed, -item.limit, item.limit);
      item.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }

    // Pinned horizontal set-design gallery
    if (hs.travel > 0) {
      const p = clamp((y - hs.top) / (hs.height - vh), 0, 1);
      track.style.transform = `translate3d(${(-p * hs.travel).toFixed(2)}px, 0, 0)`;
    }

    // Statement words light up as the paragraph crosses the viewport
    if (words.length) {
      const rect = statement.getBoundingClientRect();
      const start = vh * 0.85;
      const end = vh * 0.3;
      const p = clamp((start - rect.top) / (start - end + rect.height * 0.5), 0, 1);
      const lit = p * words.length;
      words.forEach((w, i) => {
        w.style.setProperty('--o', (0.18 + 0.82 * clamp(lit - i, 0, 1)).toFixed(3));
      });
    }
  }

  measure();
  update();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      update();
    }, 120);
  });
  // Fonts and late layout shifts can move things — re-measure once everything has settled.
  window.addEventListener('load', () => {
    measure();
    update();
  });

  onScroll(update);
  initCurrentSection();
  return { measure, update };
}

/* ---------- Header "current chapter" label ---------- */
function initCurrentSection() {
  const wrap = document.querySelector('.site-header__current');
  const num = document.querySelector('[data-current-num]');
  const name = document.querySelector('[data-current-name]');
  if (!wrap || !num || !name) return;

  let active = null;
  let swapTimer;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target === active) return;
        active = entry.target;
        const { section, name: label } = active.dataset;
        wrap.classList.add('is-swapping');
        clearTimeout(swapTimer);
        swapTimer = setTimeout(() => {
          num.textContent = section;
          name.textContent = label;
          wrap.classList.remove('is-swapping');
        }, 300);
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );
  document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
}
