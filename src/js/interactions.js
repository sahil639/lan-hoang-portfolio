// Hover & click interactions: text scramble, cursor preview, videos,
// lightbox, mobile menu, page transitions and the contact form.

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ—0123456789';

/* ---------- Text scramble on hover ---------- */
export function initScramble(reduceMotion) {
  if (reduceMotion) return;
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    const host = el.closest('a, button') || el;
    const original = el.textContent;
    let frame;
    host.addEventListener('mouseenter', () => {
      cancelAnimationFrame(frame);
      const start = performance.now();
      const duration = 420;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const revealed = Math.floor(p * original.length);
        el.textContent = [...original]
          .map((ch, i) => (i < revealed || ch === ' ' ? ch : CHARS[(Math.random() * CHARS.length) | 0]))
          .join('');
        if (p < 1) frame = requestAnimationFrame(tick);
        else el.textContent = original;
      };
      frame = requestAnimationFrame(tick);
    });
  });
}

/* ---------- Image that follows the cursor over case rows ---------- */
export function initCursorPreview() {
  const box = document.querySelector('[data-cursor-preview]');
  const triggers = document.querySelectorAll('[data-preview]');
  if (!box || !triggers.length || !matchMedia('(hover: hover)').matches) return;

  const inner = box.querySelector('.cursor-preview__inner');
  const cache = new Map();
  const pos = { x: 0, y: 0, tx: 0, ty: 0 };
  let running = false;

  const loop = () => {
    pos.x += (pos.tx - pos.x) * 0.14;
    pos.y += (pos.ty - pos.y) * 0.14;
    const w = box.offsetWidth;
    const h = box.offsetHeight;
    box.style.transform = `translate3d(${pos.x - w / 2}px, ${pos.y - h / 2}px, 0)`;
    if (running) requestAnimationFrame(loop);
  };

  const show = (src) => {
    let img = cache.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      img.alt = '';
      inner.append(img);
      cache.set(src, img);
    }
    inner.append(img); // newest on top
    cache.forEach((i) => i.classList.toggle('is-active', i === img));
    box.classList.add('is-visible');
  };

  triggers.forEach((el) => {
    el.addEventListener('mouseenter', (e) => {
      if (!running) {
        pos.x = pos.tx = e.clientX;
        pos.y = pos.ty = e.clientY;
        running = true;
        requestAnimationFrame(loop);
      }
      show(el.dataset.preview);
    });
    el.addEventListener('mouseleave', () => {
      box.classList.remove('is-visible');
      cache.forEach((i) => i.classList.remove('is-active'));
      setTimeout(() => {
        if (!box.classList.contains('is-visible')) running = false;
      }, 400);
    });
  });
  window.addEventListener('mousemove', (e) => {
    pos.tx = e.clientX;
    pos.ty = e.clientY;
  });
}

/* ---------- Drive videos: load the player only on click ---------- */
export function initVideos() {
  document.querySelectorAll('[data-video]').forEach((wrap) => {
    wrap.querySelector('.video__play')?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://drive.google.com/file/d/${wrap.dataset.video}/preview`;
      iframe.allow = 'autoplay; encrypted-media; fullscreen';
      iframe.allowFullscreen = true;
      iframe.title = wrap.querySelector('.video__play').getAttribute('aria-label');
      wrap.append(iframe);
      wrap.classList.add('is-playing');
    });
  });
}

/* ---------- Lightbox ---------- */
export function initLightbox({ stop, start }) {
  const box = document.querySelector('[data-lightbox]');
  if (!box) return;
  const img = box.querySelector('[data-lightbox-img]');
  const count = box.querySelector('[data-lightbox-count]');

  const items = [];
  const indexOf = new Map();
  const add = (el, src, alt) => {
    if (!indexOf.has(src)) {
      indexOf.set(src, items.length);
      items.push({ src, alt });
    }
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open(indexOf.get(src));
    });
  };
  document.querySelectorAll('[data-zoom]').forEach((el) => add(el, el.dataset.zoom, el.querySelector('img')?.alt || ''));
  document.querySelectorAll('a[data-lightbox-link]').forEach((el) => add(el, el.getAttribute('href'), el.textContent));
  if (!items.length) return;

  let current = 0;
  let lastFocus = null;
  const show = (i) => {
    current = (i + items.length) % items.length;
    img.src = items[current].src;
    img.alt = items[current].alt;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    void box.offsetWidth; // commit the un-hidden state so the fade-in transitions
    box.classList.add('is-open');
    stop();
    box.querySelector('[data-lightbox-close]').focus();
  };
  const close = () => {
    box.classList.remove('is-open');
    setTimeout(() => (box.hidden = true), 350);
    start();
    lastFocus?.focus();
  };

  box.querySelector('[data-lightbox-close]').addEventListener('click', close);
  box.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(current - 1));
  box.querySelector('[data-lightbox-next]').addEventListener('click', () => show(current + 1));
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('lightbox__stage')) close();
  });
  window.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
}

/* ---------- Mobile menu ---------- */
export function initMenu({ stop, start }) {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;
  const label = toggle.querySelector('.menu-toggle__label');

  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      void menu.offsetWidth; // commit the un-hidden state so the wipe transitions
      menu.classList.add('is-open');
      stop();
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => (menu.hidden = true), 800);
      start();
    }
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') set(false);
  });
}

/* ---------- Page transitions (curtain) ---------- */
export function initPageTransitions(reduceMotion) {
  const root = document.documentElement;
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) root.classList.remove('is-leaving');
  });
  if (reduceMotion) return;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (url.pathname.startsWith('/images/')) return;
    e.preventDefault();
    root.classList.add('is-leaving');
    setTimeout(() => (location.href = url.href), 650);
  });
}

/* ---------- Contact form → pre-filled email ---------- */
export function initContactForm(email) {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.value.trim() && (field.type !== 'email' || /\S+@\S+\.\S+/.test(field.value));
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      status.textContent = 'Please fill in your name, a valid email and a short message.';
      firstInvalid.focus();
      return;
    }
    if (!email) {
      status.textContent = 'The contact email isn’t set up yet — please reach out on Instagram for now.';
      return;
    }

    const data = new FormData(form);
    const types = data.getAll('type').join(', ') || '—';
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Brand: ${data.get('brand') || '—'}`,
      `Project type: ${types}`,
      '',
      data.get('message'),
    ].join('\n');
    const subject = `New project enquiry — ${data.get('name')}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app…';
  });
}
