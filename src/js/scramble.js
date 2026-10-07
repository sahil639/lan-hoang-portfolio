// Text scramble effects modelled on the reference: characters arrive as random
// glyphs and resolve left to right.

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$?!<>[]{}^~*+=';
const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
const running = new WeakMap();

function textNodes(el) {
  const out = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => ((n.__original ?? n.textContent).trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  while (walk.nextNode()) out.push(walk.currentNode);
  return out;
}

/**
 * mode "in":    text grows from nothing as random glyphs, then resolves (page load)
 * mode "shuffle": full-length text shuffles, then resolves (hover)
 */
export function scramble(el, { mode = 'shuffle', duration = 450 } = {}) {
  cancelAnimationFrame(running.get(el));
  const nodes = textNodes(el).map((n) => {
    if (!n.__original) n.__original = n.textContent;
    return n;
  });
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    for (const n of nodes) {
      const src = n.__original;
      const len = src.length;
      const shown = mode === 'in' ? Math.min(len, Math.ceil(p * 1.7 * len)) : len;
      const resolved = mode === 'in' ? Math.floor(Math.max(0, (p - 0.3) / 0.7) * len) : Math.floor(p * len);
      let s = '';
      for (let i = 0; i < shown; i++) {
        const ch = src[i];
        s += i < resolved || ch === ' ' || ch === ' ' ? ch : rand();
      }
      n.textContent = s;
    }
    if (p < 1) running.set(el, requestAnimationFrame(tick));
    else nodes.forEach((n) => (n.textContent = n.__original));
  };
  running.set(el, requestAnimationFrame(tick));
}

/** Types a string into an element, keeping a random glyph or two at the cursor. */
export function typeIn(el, text, duration = 520) {
  cancelAnimationFrame(running.get(el));
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const n = Math.ceil(p * text.length);
    const tail = p < 1 ? Math.min(2, text.length - n + 1) : 0;
    let s = text.slice(0, Math.max(0, n - tail));
    for (let i = 0; i < tail; i++) s += text[n - tail + i] === ' ' ? ' ' : rand();
    el.textContent = s;
    if (p < 1) running.set(el, requestAnimationFrame(tick));
    else el.textContent = text;
  };
  running.set(el, requestAnimationFrame(tick));
}

export function cancel(el) {
  cancelAnimationFrame(running.get(el));
}

/** Labels scramble in the first time they enter the viewport. */
export function initScrambleIn(reduceMotion) {
  const els = document.querySelectorAll('[data-scramble-in]');
  if (reduceMotion) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        scramble(e.target, { mode: 'in', duration: 900 + Math.random() * 500 });
      });
    },
    { threshold: 0.1 }
  );
  els.forEach((el) => {
    textNodes(el).forEach((n) => {
      n.__original = n.textContent;
      n.textContent = '';
    });
    io.observe(el);
  });
}

/** Links and labels reshuffle on hover. */
export function initScrambleHover(reduceMotion) {
  if (reduceMotion) return;
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    const host = el.closest('a, button') || el;
    host.addEventListener('mouseenter', () => scramble(el, { duration: 380 }));
  });
  document.querySelectorAll('[data-scramble-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => scramble(el, { duration: 380 }));
  });
}
