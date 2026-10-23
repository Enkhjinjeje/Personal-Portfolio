import { defineConfig, devices } from '@playwright/test'

// Tests run against a production build on its own port, so they never collide with `npm run dev` on 3000.
// Build first: npm run build && npm test
const port = 3210

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `npx next start --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
})
