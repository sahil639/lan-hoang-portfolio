// Case-study rows: on hover the big title types itself in, the details reshuffle
// and the project image follows the cursor (as in the reference video).

import { scramble, typeIn, cancel } from './scramble.js';

export function initCaseRows(reduceMotion) {
  const rows = document.querySelectorAll('.case-row');
  const box = document.querySelector('[data-cursor-media]');
  if (!rows.length || !box || !matchMedia('(hover: hover) and (min-width: 761px)').matches) return;

  const images = new Map();
  const pos = { x: 0, y: 0, tx: 0, ty: 0 };
  let active = null;
  let raf = 0;

  const loop = () => {
    pos.x += (pos.tx - pos.x) * 0.35;
    pos.y += (pos.ty - pos.y) * 0.35;
    box.style.transform = `translate3d(${pos.x - box.offsetWidth / 2}px, ${pos.y - box.offsetHeight / 2}px, 0)`;
    raf = active ? requestAnimationFrame(loop) : 0;
  };

  const imageFor = (src) => {
    let img = images.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      img.alt = '';
      box.append(img);
      images.set(src, img);
    }
    return img;
  };
  // Warm the cache so the first hover is instant
  rows.forEach((row) => imageFor(row.dataset.media));

  rows.forEach((row) => {
    const title = row.querySelector('.case-row__title');
    const text = title.dataset.title;
    const details = row.querySelectorAll('[data-scramble-row]');

    row.addEventListener('mouseenter', (e) => {
      active = row;
      images.forEach((img, src) => img.classList.toggle('is-active', src === row.dataset.media));
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      if (!raf) {
        pos.x = pos.tx;
        pos.y = pos.ty;
        raf = requestAnimationFrame(loop);
      }
      box.classList.add('is-visible');
      if (reduceMotion) {
        title.textContent = text;
        return;
      }
      typeIn(title, text, 260 + text.length * 22);
      details.forEach((d) => scramble(d, { duration: 420 }));
    });
    row.addEventListener('mouseleave', () => {
      if (active === row) active = null;
      cancel(title);
      title.textContent = '';
      box.classList.remove('is-visible');
    });
  });

  window.addEventListener('mousemove', (e) => {
    pos.tx = e.clientX;
    pos.ty = e.clientY;
  });
}
