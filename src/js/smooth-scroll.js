// Lenis smooth scrolling + in-page anchor handling.

import Lenis from 'lenis';

export function initSmoothScroll(reduceMotion) {
  const listeners = new Set();
  const onScroll = (fn) => listeners.add(fn);
  const emit = () => listeners.forEach((fn) => fn());

  let lenis = null;

  if (!reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', emit);
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', emit, { passive: true });
  }

  document.querySelectorAll('a[data-scroll-to]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else if (target === 0) window.scrollTo({ top: 0 });
      else target.scrollIntoView();
      history.replaceState(null, '', id === '#top' ? ' ' : id);
    });
  });

  return { lenis, onScroll };
}
