// Click interactions: Drive videos, lightbox, mobile menu and the contact form.

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

  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
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
