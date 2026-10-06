import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { initSmoothScroll } from './js/smooth-scroll.js';
import { splitChars, splitLines } from './js/split.js';
import { initReveals, initCounters } from './js/reveal.js';
import { initScrollEffects } from './js/scroll-effects.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Always start at the hero so the intro animation plays on reload.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

root.classList.add('js');
if (reduceMotion) root.classList.add('no-hscroll');

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const heroTitle = document.querySelector('[data-split-chars]');
if (heroTitle && !reduceMotion) splitChars(heroTitle);

const { onScroll } = initSmoothScroll(reduceMotion);

// Line splitting depends on final font metrics.
document.fonts.ready.then(() => {
  if (!reduceMotion) document.querySelectorAll('[data-split-lines]').forEach(splitLines);

  initReveals();
  initCounters(reduceMotion);
  initScrollEffects({ reduceMotion, onScroll });

  requestAnimationFrame(() => root.classList.add('is-loaded'));
});
