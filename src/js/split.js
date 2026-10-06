// Text splitting helpers for line / character / word animations.

/** Wrap every character of each line in a mask so it can rise into place. */
export function splitChars(root) {
  let i = 0;
  root.querySelectorAll('.hero__title-line').forEach((line) => {
    const text = line.textContent.trim();
    line.setAttribute('aria-hidden', 'true');
    line.textContent = '';
    for (const ch of text) {
      const wrap = document.createElement('span');
      wrap.className = 'char-wrap';
      const inner = document.createElement('span');
      inner.className = 'char';
      inner.textContent = ch === ' ' ? ' ' : ch;
      inner.style.setProperty('--delay', `${0.15 + i * 0.045}s`);
      wrap.append(inner);
      line.append(wrap);
      i += 1;
    }
  });
  root.setAttribute('aria-label', root.dataset.label || 'Creative Producer');
}

/**
 * Split a heading into visual lines (after fonts load) so each line
 * can slide up from behind its own mask.
 */
export function splitLines(el) {
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', text);
  el.textContent = '';

  const words = text.split(' ').map((w) => {
    const s = document.createElement('span');
    s.textContent = w;
    s.style.display = 'inline-block';
    el.append(s, ' ');
    return s;
  });

  // Group words by their rendered line
  const lines = [];
  let lastTop = null;
  words.forEach((w) => {
    const top = w.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(w.textContent);
  });

  el.textContent = '';
  lines.forEach((words, i) => {
    const mask = document.createElement('span');
    mask.className = 'split-line';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = words.join(' ');
    inner.style.setProperty('--delay', `${i * 0.1}s`);
    mask.append(inner);
    el.append(mask);
  });
}

/** Wrap each word so its opacity can follow scroll progress. */
export function splitWords(el) {
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', text);
  el.textContent = '';
  return text.split(' ').map((w) => {
    const s = document.createElement('span');
    s.className = 'word';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = w;
    el.append(s, ' ');
    return s;
  });
}
