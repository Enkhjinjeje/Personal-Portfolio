# Jeje's portfolio

A night-first, black-and-white personal portfolio built with the Next.js App Router, React, TypeScript, and Tailwind CSS 4.

```bash
npm install
npm run dev        # http://127.0.0.1:3000
npm run build      # every page is prerendered as static HTML
npm test           # Playwright, against a production build
```

- `src/app/` — the five pages: home, projects, work, about, contact
- `src/components/field/` — the dot field behind every page, and the flow between pages
- `src/components/projects/` — the endless projects canvas
- `src/content.ts` — the facts, links, projects and experience the pages show

Deploys to Vercel with no settings to change.
