# Jeje's portfolio

A responsive black-and-white personal portfolio built with Next.js App Router, React, TypeScript, and Tailwind CSS 4.

## Getting started

Use Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Production

```sh
npm run build
npm start
```

Deploy with a Next.js-compatible host such as Vercel, or run the production server on a Node.js host.

## Checks

```sh
npm run typecheck
npx playwright install chromium
npm run build
npm test
```

The browser checks start the production server on port 3000, which must be free. They cover server-rendered content, navigation, keyboard access, disclosures, lettering interactions, clipboard handling, assets, responsive widths, and reduced motion.

## Project structure

- [src/app/layout.tsx](src/app/layout.tsx): document layout, metadata, font, and global styles.
- [src/app/page.tsx](src/app/page.tsx): homepage route.
- [src/App.tsx](src/App.tsx): portfolio content and interactive behavior.
- [src/style.css](src/style.css): responsive design and Tailwind theme.
- [public/](public/): résumé, project screenshot, and favicon.
- [tests/](tests/): Playwright browser checks.

Agent skills and Impeccable are optional development helpers. Neither is required to build, run, or deploy this project; their project-local files have been removed.
