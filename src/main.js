import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';
import './styles/pages.css';

import { initSmoothScroll } from './js/smooth-scroll.js';
import { initScroll } from './js/scroll.js';
import { initScrambleIn, initScrambleHover } from './js/scramble.js';
import { initCaseRows } from './js/rows.js';
import { initClock, initGlobes, initShowreel, initArchiveFilter } from './js/widgets.js';
import { initVideos, initLightbox, initMenu, initContactForm } from './js/interactions.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

const scroller = initSmoothScroll(reduceMotion);

initScrambleIn(reduceMotion);
initClock();
initScrambleHover(reduceMotion);
initCaseRows(reduceMotion);
initGlobes(reduceMotion);
initShowreel(reduceMotion);
initArchiveFilter();
initMenu(scroller);
initVideos();
initLightbox(scroller);
initContactForm(__SITE_EMAIL__);
initScroll({ reduceMotion, onScroll: scroller.onScroll });
