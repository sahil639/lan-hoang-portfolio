// IntersectionObserver-driven reveals (fade/slide, image curtains, line masks, counters).

export function initReveals() {
  const targets = document.querySelectorAll('[data-reveal], [data-split-lines]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    // The huge top margin counts anything already scrolled past as "in",
    // so jumping via anchors or reloads mid-page never leaves hidden content behind.
    { rootMargin: '100000px 0px -12% 0px', threshold: 0.05 }
  );
  targets.forEach((el) => io.observe(el));
}

function formatCount(value, decimals, suffix) {
  return `${value.toFixed(decimals)}${suffix}`;
}

export function initCounters(reduceMotion) {
  const stats = document.querySelectorAll('[data-count]');
  if (reduceMotion) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = formatCount(target * eased, decimals, suffix);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { rootMargin: '100000px 0px 0px 0px', threshold: 0.6 }
  );

  stats.forEach((el) => {
    el.textContent = formatCount(0, (el.dataset.count.split('.')[1] || '').length, el.dataset.suffix || '');
    io.observe(el);
  });
}
