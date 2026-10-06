// Scroll-linked effects: header state and image parallax.

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export function initScroll({ reduceMotion, onScroll }) {
  const header = document.querySelector('[data-header]');
  let vh = window.innerHeight;
  let lastY = window.scrollY;
  let items = [];

  function measure() {
    vh = window.innerHeight;
    if (reduceMotion) return;
    items = [...document.querySelectorAll('[data-speed]')].map((el) => {
      el.style.translate = '';
      const frame = el.tagName === 'IMG' ? el.parentElement : el;
      const rect = frame.getBoundingClientRect();
      return {
        el,
        speed: parseFloat(el.dataset.speed) || 0,
        center: rect.top + window.scrollY + rect.height / 2,
        // Images are 12% taller than their frame, so they can travel 6% each way.
        limit: el.tagName === 'IMG' ? rect.height * 0.055 : Infinity,
      };
    });
  }

  function update() {
    const y = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', y > 30);
      if (y > lastY + 3 && y > vh * 0.5) header.classList.add('is-hidden');
      else if (y < lastY - 3) header.classList.remove('is-hidden');
    }
    lastY = y;

    if (reduceMotion) return;
    for (const item of items) {
      const dist = item.center - (y + vh / 2);
      if (Math.abs(dist) > vh * 1.5) continue;
      const offset = clamp(dist * item.speed, -item.limit, item.limit);
      item.el.style.translate = `0 ${offset.toFixed(2)}px`;
    }
  }

  measure();
  update();
  onScroll(update);

  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      measure();
      update();
    }, 150);
  });
  window.addEventListener('load', () => {
    measure();
    update();
  });
}
