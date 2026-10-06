// Lenis smooth scrolling. Exposes a tiny scroll-listener API for other modules.

import Lenis from 'lenis';

export function initSmoothScroll(reduceMotion) {
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());
  let lenis = null;

  if (!reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

  document.querySelectorAll('[data-scroll-top]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0 });
    });
  });

  return {
    lenis,
    onScroll: (fn) => listeners.add(fn),
    stop: () => lenis?.stop(),
    start: () => lenis?.start(),
  };
}
