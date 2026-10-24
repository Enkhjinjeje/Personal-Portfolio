import type { NextConfig } from 'next'

// Files in public/ keep their names between deploys, so browsers cache them for a day and revalidate in the
// background for a week after that; the hashed build files under /_next are cached for good by Vercel already.
const cached = 'public, max-age=86400, stale-while-revalidate=604800'

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:file(.*\\.(?:webp|jpg|png|svg|pdf))', headers: [{ key: 'Cache-Control', value: cached }] }]
  },
}

export default config
