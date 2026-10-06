# Lana Hoang — Creative Producer

Portfolio site for Lana Hoang. A single-page editorial site with smooth scrolling and
scroll-driven reveals, built with [Vite](https://vite.dev) and plain HTML/CSS/JS, plus
[Lenis](https://lenis.darkroom.engineering/) for smooth scroll.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

## Deploy (Vercel)

Import the repo in Vercel. `vercel.json` already sets the Vite framework preset,
`npm run build` and the `dist` output, so no configuration is needed. `/` renders the full portfolio.

## Structure

```
index.html                 All page content (semantic sections, one per chapter)
public/
  fonts/                   Promenade + Citerne, self-hosted WOFF2 (Latin subset)
  favicon.svg
src/
  main.js                  Entry: imports styles, boots motion modules
  styles/
    tokens.css             Design tokens: colors, type scale, spacing, motion
    fonts.css              @font-face declarations
    base.css               Reset, globals, links, utilities
    components.css         Header, progress bar, placeholders, reveal system
    sections.css           Per-section layout (hero, about, chapters, contact)
  js/
    smooth-scroll.js       Lenis setup + anchor links
    split.js               Character / line / word splitting
    reveal.js              IntersectionObserver reveals + stat counters
    scroll-effects.js      Parallax, hero fade, pinned horizontal gallery,
                           word highlight, header state, current-chapter label
```

## Design tokens

Edit `src/styles/tokens.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#C1CED5` | Base background (tints `--color-bg-50` … `--color-bg-500`) |
| `--color-accent` | `#7E4846` | Headlines, links, hovers, details |
| `--color-text-primary` / `-secondary` / `-muted` | slate greys | Body copy hierarchy |
| `--font-display` | Promenade | Headlines |
| `--font-body` | Citerne | Subtitles, body, UI labels |

## Adding real media

Every image or video slot is a placeholder like:

```html
<figure class="ph" style="--ratio: 3 / 4" data-reveal="image">
  <div class="ph__inner" data-speed="0.05"><span class="ph__label">[IMAGE – …]</span></div>
</figure>
```

Replace the `<span class="ph__label">` with an `<img>` or `<video>` (styled
`width:100%; height:100%; object-fit:cover`) and keep the wrapper so the reveal and parallax still work.
Put files in `public/images/` or `public/video/`.

## Motion

- Lenis smooth scroll; anchor links glide to sections
- Hero title rises in character by character, then drifts and fades on scroll
- Headings reveal line by line from behind masks; blocks fade/slide up
- Images open with a curtain wipe and get light parallax inside their frames
- About statement lights up word by word as you scroll
- Set Design is a pinned, scroll-driven horizontal gallery
- Instagram view counts count up when they come into view
- Header hides on scroll down, shows on scroll up, and names the current chapter

`prefers-reduced-motion` turns all of this off: native scroll, static content, and a swipeable Set Design row.

## Content to finalise

- About bio (draft written from the work in the portfolio plan)
- Contact email, Instagram, LinkedIn, CV link (placeholders in the footer)
- Hero line "and what my works are about!" (flagged in the plan for review)
- "5.3M+ combined views" adds up the four iTVC spots (1.3M + 1.5M + 2M + 482K)
