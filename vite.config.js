import { defineConfig } from 'vite';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import site from './site.config.js';

const root = dirname(fileURLToPath(import.meta.url));
const images = JSON.parse(readFileSync(resolve(root, 'src/data/images.json'), 'utf8'));

/* ---------- Every index.html / *.html outside build folders is a page ---------- */
function findPages(dir, out = {}) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', 'public', 'src', '.git', '.claude'].includes(entry)) continue;
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) findPages(full, out);
    else if (entry.endsWith('.html')) out[relative(root, full).replace(/\.html$/, '') || 'index'] = full;
  }
  return out;
}

/* ---------- Tiny template layer ---------- */
const parseAttrs = (str) => {
  const attrs = {};
  for (const m of str.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[m[1]] = m[2] ?? true;
  return attrs;
};

function imgTag(a) {
  const meta = images[a.name];
  if (!meta) throw new Error(`Unknown image "${a.name}"`);
  const largest = meta.files[meta.files.length - 1][0];
  const srcset = meta.files.map(([f, w]) => `/images/${f} ${w}w`).join(', ');
  const ratio = a.ratio || `${meta.w} / ${meta.h}`;
  const cls = ['media', a.class].filter(Boolean).join(' ');
  const zoom = a.zoom ? ` data-zoom="/images/${largest}"` : '';
  const speed = a.speed ? ` data-speed="${a.speed}"` : '';
  const reveal = '';
  return (
    `<div class="${cls}" style="--ratio: ${ratio}"${reveal}${zoom}>` +
    `<img src="/images/${largest}" srcset="${srcset}" sizes="${a.sizes || '(max-width: 760px) 100vw, 50vw'}" ` +
    `width="${meta.w}" height="${meta.h}" alt="${a.alt || ''}" ${a.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${speed}>` +
    `</div>`
  );
}

function videoTag(a) {
  const poster = images[a.poster];
  const largest = poster.files[poster.files.length - 1][0];
  const cls = ['video', a.class].filter(Boolean).join(' ');
  return (
    `<div class="${cls}" style="--ratio: 9 / 16" data-video="${a.id}">` +
    `<img src="/images/${largest}" width="${poster.w}" height="${poster.h}" alt="" loading="lazy" decoding="async">` +
    `<button class="video__play" type="button" aria-label="Play video: ${a.title}"><span class="video__icon" aria-hidden="true"></span><span>Play</span></button>` +
    `</div>`
  );
}

function render(html, depth = 0) {
  if (depth > 5) return html;
  return html
    .replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
      render(readFileSync(resolve(root, `src/partials/${name}.html`), 'utf8'), depth + 1)
    )
    .replace(/<x-img\s([^>]*?)\/?>/g, (_, attrs) => imgTag(parseAttrs(attrs)))
    .replace(/<x-video\s([^>]*?)\/?>/g, (_, attrs) => videoTag(parseAttrs(attrs)))
    .replace(/%SITE_EMAIL%/g, site.email || '[EMAIL]')
    .replace(/%SITE_EMAIL_HREF%/g, site.email ? `mailto:${site.email}` : '/contact')
    .replace(/%SITE_INSTAGRAM%/g, site.instagram || '#')
    .replace(/%SITE_INSTAGRAM_HANDLE%/g, site.instagramHandle)
    .replace(/%SITE_PHONE%/g, site.phone)
    .replace(/%SITE_WHATSAPP%/g, `https://wa.me/${site.phoneIntl}`)
    .replace(/%SITE_ZALO%/g, `https://zalo.me/${site.phoneIntl}`)
    .replace(/%SITE_LOCATION%/g, site.places.join(' — '))
    .replace(/%SITE_PLACE_1%/g, site.places[0])
    .replace(/%SITE_PLACE_2%/g, site.places[1])
    .replace(/%SITE_TZ%/g, site.timezone)
    .replace(/%SITE_TZ_LABEL%/g, site.timezoneLabel)
    .replace(/%YEAR%/g, String(new Date().getFullYear()));
}

const templates = () => ({
  name: 'site-templates',
  transformIndexHtml: { order: 'pre', handler: (html) => render(html) },
  // Match Vercel's cleanUrls in dev: /about → /about/index.html
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query = ''] = req.url.split('?');
      if (path !== '/' && !/\.\w+$/.test(path) && !path.startsWith('/@')) {
        const clean = path.replace(/\/$/, '');
        try {
          if (statSync(resolve(root, `.${clean}/index.html`)).isFile()) {
            req.url = `${clean}/index.html${query ? `?${query}` : ''}`;
          }
        } catch {}
      }
      next();
    });
  },
  handleHotUpdate({ file, server }) {
    if (file.includes('/src/partials/') || file.endsWith('images.json')) server.ws.send({ type: 'full-reload' });
  },
});

export default defineConfig({
  plugins: [templates()],
  define: { __SITE_EMAIL__: JSON.stringify(site.email) },
  build: { rollupOptions: { input: findPages(root) } },
});
