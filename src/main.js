import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';

import { initSmoothScroll } from './js/smooth-scroll.js';
import { initSplitLines } from './js/split.js';
import { initReveals, initCounters } from './js/reveal.js';
import { initScroll } from './js/scroll.js';
import {
  initScramble,
  initCursorPreview,
  initVideos,
  initLightbox,
  initMenu,
  initPageTransitions,
  initContactForm,
} from './js/interactions.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

// Always start at the top so each page's intro plays.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const scroller = initSmoothScroll(reduceMotion);

initPageTransitions(reduceMotion);
initMenu(scroller);
initVideos();
initLightbox(scroller);
initScramble(reduceMotion);
initCursorPreview();
initContactForm(__SITE_EMAIL__);

let booted = false;
const boot = () => {
  if (booted) return;
  booted = true;
  // Line splitting depends on final font metrics.
  initSplitLines(reduceMotion);
  initReveals();
  initCounters(reduceMotion);
  initScroll({ reduceMotion, onScroll: scroller.onScroll });
  void root.offsetWidth; // commit split/reveal start states before lifting the curtain
  root.classList.add('is-loaded');
};
document.fonts.ready.then(boot);
setTimeout(boot, 1500); // never leave the curtain down if fonts stall
