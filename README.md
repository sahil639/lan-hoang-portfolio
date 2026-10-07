# Lana Hoang — Creative Producer

Multi-page editorial portfolio for Lana Hoang. Layout and page structure follow
[signal-a.studio](https://signal-a.studio/): hairline grid nav, giant justified statements,
case-study index rows with a cursor-following preview, case-study pages and an About / Contact pair.

Built with [Vite](https://vite.dev), plain HTML/CSS/JS, and [Lenis](https://lenis.darkroom.engineering/) for smooth scrolling.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

## Deploy (Vercel)

Import the repo in Vercel; `vercel.json` sets the Vite preset, build command, `dist` output and
clean URLs (`/about`, `/case-studies/itvc`). No other configuration is needed.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/case-studies` | `case-studies/index.html` |
| `/case-studies/itvc` | `case-studies/itvc/index.html` (5 spots, storyboards, set design) |
| `/case-studies/commercial-photoshoot` | `case-studies/commercial-photoshoot/index.html` (incl. BTS) |
| `/case-studies/video-ads` | `case-studies/video-ads/index.html` |
| `/case-studies/food-photography` | `case-studies/food-photography/index.html` |
| `/case-studies/modelling` | `case-studies/modelling/index.html` |
| `/archive` | `archive/index.html` (every image, filterable) |
| `/about` | `about/index.html` |
| `/contact` | `contact/index.html` |

Any new `*.html` file is picked up as a page automatically.

## Structure

```
site.config.js        Email, phone (WhatsApp/Zalo), Instagram, clock — edit once, used on every page
vite.config.js        Multi-page build + tiny template layer (see below)
src/partials/         head, header, footer, cases (the case-study list)
src/data/images.json  Generated image sizes used to build responsive <img> tags
src/styles/           tokens, fonts, base, layout, components, pages
src/js/               smooth-scroll, split (line reveals), reveal, scroll (parallax/header), interactions
public/images/        WebP images, each at 800px and 1600px wide
public/fonts/         Promenade + Citerne (WOFF2)
```

### Template shorthand

The build expands these in every HTML page:

```html
<!-- @include footer -->                                        → src/partials/footer.html
<x-img name="product-01" alt="…" sizes="50vw" zoom />           → responsive <img> in a .media frame
<x-img name="set-02" ratio="21 / 9" speed="0.1" eager />        → crop ratio, parallax, no lazy-load
<x-video id="DRIVE_FILE_ID" poster="poster-ad-cc-01" title="…" /> → poster + Drive player on click
%SITE_EMAIL% %SITE_PHONE% %SITE_WHATSAPP% %SITE_ZALO% %SITE_INSTAGRAM% %YEAR%
```

`zoom` opens the image in the lightbox. Every image gets the hover effect (frame tightens, photo pushes in).

### Adding images

1. Export a WebP at 800px and 1600px wide into `public/images/` as `name-800.webp` and `name-1600.webp`.
2. Add an entry to `src/data/images.json` (`files` with real widths, plus `w`/`h` of the largest file).
3. Use `<x-img name="name" alt="…" />`.

### Videos

Videos play through Google Drive's embedded player (`https://drive.google.com/file/d/ID/preview`) and only
load when someone clicks Play. The files must stay shared as "Anyone with the link".

## Design system

`src/styles/tokens.css` holds the palette (background `#C1CED5` + tints, accent `#7E4846`), the
six-column grid (`--margin`, `--gap`, `--col`) and the type scale, sized in `vw` to mirror the reference.

| Role | Font |
| --- | --- |
| Statements, titles | Montmarte (Regular / Italic) |
| Everything else — nav, labels, paragraphs | GT America Mono (Light / Regular) |
| Emphasis words, small headings | GT America Mono Bold |

**The GT America Mono files are Grilli Type trial fonts.** They contain only letters, digits and `, - .`
(other characters render as a "Grilli Trial" stamp), so each `@font-face` is limited with
`unicode-range` and punctuation falls back to a small IBM Plex Mono subset from Google Fonts.
Trial fonts are not licensed for a live website — buy web licences before launch and swap the files in
`public/fonts/`; the fallback workaround can then be removed.

## Motion

- Labels (clock, hero label, word grid, section titles) scramble in from random glyphs on first view
- Case-study rows: on hover the large title types itself in (a different face per project), the details
  reshuffle and the project image follows the cursor
- Showreel cuts between frames every 1.5s while on screen (no intro animation)
- Rotating wireframe globe in the closing statement and on About
- Footer wordmark marquee; hover on every image tightens the frame and pushes the photo in

## Content to finalise

- Contact details live in `site.config.js`. The contact form opens the visitor's email app with a pre-filled
  message to Lana's address.
- Drafted copy to review with Lana: case-study write-ups, About bio, process/services, FAQ answers.
- "10.8M+" is the sum of the six iTVC performance screenshots (4.1M + 2M + 1.5M + 1.5M + 1.3M + 482K).
- The Luna Shot "Is there an all-in-one solution?" spot (4.1M) has a screenshot but no video file yet.
