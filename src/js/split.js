// Split headings into masked lines so each line can slide up into place.
// Inline elements (<em>, the accent dot) are preserved word by word.

const originals = new WeakMap();

function tokenize(el) {
  const tokens = [];
  const walk = (node, wrappers) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        for (const word of child.textContent.split(/\s+/).filter(Boolean)) {
          const token = document.createElement('span');
          token.className = 'split-word';
          let target = token;
          for (const w of wrappers) {
            const clone = w.cloneNode(false);
            target.append(clone);
            target = clone;
          }
          target.append(word);
          tokens.push(token);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (!child.textContent.trim()) tokens.push(child.cloneNode(true));
        else walk(child, [...wrappers, child]);
      }
    }
  };
  walk(el, []);
  return tokens;
}

export function splitLines(el) {
  if (!originals.has(el)) {
    originals.set(el, el.innerHTML);
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
  } else {
    el.innerHTML = originals.get(el);
  }

  const tokens = tokenize(el);
  el.textContent = '';
  tokens.forEach((t) => el.append(t, ' '));

  // Group tokens by rendered line. Decorative tokens (the accent dot) sit on a
  // different baseline, so they simply join the line of the next word.
  const lines = [];
  let pending = [];
  let lastTop = null;
  for (const t of tokens) {
    if (!t.classList.contains('split-word')) {
      pending.push(t);
      continue;
    }
    const top = t.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(...pending, t);
    pending = [];
  }
  if (pending.length) lines.length ? lines[lines.length - 1].push(...pending) : lines.push(pending);

  el.textContent = '';
  lines.forEach((line, i) => {
    const mask = document.createElement('span');
    mask.className = 'split-line';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.style.setProperty('--delay', `${i * 0.09}s`);
    line.forEach((t, j) => inner.append(t, j < line.length - 1 ? ' ' : ''));
    mask.append(inner);
    el.append(mask);
  });
}

/** Split once, then re-split when the width changes so lines stay accurate. */
export function initSplitLines(reduceMotion) {
  if (reduceMotion) return;
  const els = [...document.querySelectorAll('[data-split-lines]')];
  els.forEach(splitLines);

  let lastWidth = window.innerWidth;
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      els.forEach(splitLines);
    }, 150);
  });
}
