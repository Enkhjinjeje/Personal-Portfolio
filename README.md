# Jeje's portfolio

A night-first, black-and-white personal portfolio built with the Next.js App Router, React, TypeScript, and Tailwind CSS 4. The landing view is a spring-driven dot field that draws the "jeje." wordmark and a portrait; clicking sends a wave that turns the portrait into colour.

## Run it

```sh
npm install
npm run dev        # http://127.0.0.1:3000
npm run build      # production build
npm run typecheck
npm test           # Playwright, against a production build on port 3210 (run `npm run build` first)
```

## Layout

| Path | What it holds |
| --- | --- |
| `src/app/` | The root layout (fonts, metadata, pre-paint theme script) and the page, which composes the sections |
| `src/content.ts` | Email, links, experience and skills lists |
| `src/components/sections/` | One component per page section: Hero, Intro, Work, About, Community, Experience, Contact |
| `src/components/dots/` | `dotField.ts`, the canvas engine (springs, portrait, colour wave, wordmark), and `DotFieldBackground.tsx`, which wires it to the page |
| `src/components/curious-mind/` | The illustrated head in About and its styles |
| `src/components/` | Site header and footer, theme toggle, and the scroll-lit heading |
| `src/style.css` | Theme tokens and page styles, by section, then the tablet and phone breakpoints |
| `public/` | Images (WebP) and the résumé |
| `tests/` | Playwright tests |

Only the interactive parts (header menu, hero, intro heading, Curious Mind, contact copy button) are client components; the rest renders on the server.

## Deploy

Any Next.js host works. On Vercel, import the repository and keep the defaults (framework: Next.js, build: `npm run build`). Requires Node 20.9 or newer.
