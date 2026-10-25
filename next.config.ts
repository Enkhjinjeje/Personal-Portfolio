import type { NextConfig } from 'next'

// Files in public/ keep their names between deploys, so browsers cache them for a day and revalidate in the
// background for a week after that. The hashed build files under /_next, imported images among them, are left out:
// Vercel caches those for good already.
const cached = 'public, max-age=86400, stale-while-revalidate=604800'

const config: NextConfig = {
  poweredByHeader: false,
  // the stylesheet is small, so it comes inside the page rather than as a request the first paint waits on
  experimental: { inlineCss: true },
  async headers() {
    return [{ source: '/:file((?!_next/).*\\.(?:webp|jpg|png|svg|pdf))', headers: [{ key: 'Cache-Control', value: cached }] }]
  },
}

export default config
