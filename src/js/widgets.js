// Small page widgets: clock, rotating globe, showreel cuts, archive filter.

/* ---------- Local time under the nav ---------- */
export function initClock() {
  const el = document.querySelector('[data-clock]');
  const out = el?.querySelector('[data-clock-time]');
  if (!el || !out) return;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: el.dataset.tz,
  });
  const tick = () => {
    const [h, m] = fmt.format(new Date()).split(':');
    const value = `${h} ${m}`;
    // Don't fight the load-in scramble; the text node carries the target value.
    const node = out.firstChild || out.appendChild(document.createTextNode(''));
    node.__original = value;
    if (!out.dataset.started) {
      out.dataset.started = '1';
    } else {
      node.textContent = value;
    }
  };
  tick();
  setInterval(tick, 15000);
}

/* ---------- Wireframe globe that rotates (SVG, drawn each frame) ---------- */
export function initGlobes(reduceMotion) {
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('[data-globe]').forEach((host) => {
    const W = 108;
    const H = 72;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `${-W / 2 - 1} ${-H / 2 - 1} ${W + 2} ${H + 2}`);
    const make = (tag, attrs) => {
      const e = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      svg.append(e);
      return e;
    };
    make('ellipse', { cx: 0, cy: 0, rx: W / 2, ry: H / 2 });
    make('line', { x1: -W / 2, y1: 0, x2: W / 2, y2: 0 });
    [-0.55, 0.55].forEach((f) => {
      const y = (f * H) / 2;
      const half = (W / 2) * Math.sqrt(1 - f * f);
      make('line', { x1: -half, y1: y, x2: half, y2: y });
    });
    const meridians = Array.from({ length: 5 }, () => make('ellipse', { cx: 0, cy: 0, rx: 1, ry: H / 2 }));
    host.append(svg);

    let t = 0;
    let visible = false;
    const draw = () => {
      meridians.forEach((m, i) => {
        const phase = (i / meridians.length) * Math.PI + t;
        m.setAttribute('rx', Math.abs(Math.cos(phase) * (W / 2)).toFixed(2));
      });
    };
    draw();
    if (reduceMotion) return;
    const loop = () => {
      t += 0.006;
      draw();
      if (visible) requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) requestAnimationFrame(loop);
    }).observe(host);
  });
}

/* ---------- Showreel: hard cuts between frames, like an edit ---------- */
export function initShowreel(reduceMotion) {
  const frame = document.querySelector('[data-showreel]');
  if (!frame || reduceMotion) return;
  const slides = [...frame.querySelectorAll('.showreel__slide')];
  let i = 0;
  let timer = 0;
  const next = () => {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  };
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = setInterval(next, 1500);
  }).observe(frame);
  // Preload the later frames once the page is idle
  window.addEventListener('load', () =>
    slides.forEach((s) => s.querySelectorAll('img').forEach((img) => (img.loading = 'eager')))
  );
}

/* ---------- Archive filter ---------- */
export function initArchiveFilter() {
  const bar = document.querySelector('[data-filter-bar]');
  if (!bar) return;
  const items = document.querySelectorAll('[data-tags]');
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const f = btn.dataset.filter;
    items.forEach((it) => {
      it.hidden = f !== 'all' && !it.dataset.tags.split(' ').includes(f);
    });
  });
}
