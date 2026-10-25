import { test, expect } from '@playwright/test'

test('About and its notes fit the viewport without scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [width, height] of [[1440, 900], [1366, 768], [768, 1024], [390, 844], [320, 568]]) {
    await page.setViewportSize({ width, height })
    await page.goto('/about')
    for (const open of [false, true]) {
      if (open) {
        await page.getByRole('button', { name: "Explore what's on my mind" }).click()
        await page.getByRole('button', { name: 'Building with code', exact: true }).click()
        await expect(page.locator('#mind-bubble')).toBeVisible()
      }
      await expect.poll(() => page.evaluate(() => {
        const stage = document.querySelector('.stage')!
        const frame = stage.getBoundingClientRect()
        const about = document.querySelector('.about')!.getBoundingClientRect()
        const note = document.querySelector('#mind-bubble')?.getBoundingClientRect()
        return getComputedStyle(stage).overflowY === 'hidden' && about.top >= frame.top - 1 && about.bottom <= frame.bottom + 1 && (!note || (note.top >= frame.top - 1 && note.bottom <= frame.bottom + 1))
      })).toBe(true)
      await page.mouse.wheel(0, 500)
      expect(await page.locator('.stage').evaluate(el => el.scrollTop)).toBe(0)
    }
  }
})

test('the turntable starts playing on arrival, and pauses and plays from the record', async ({ page }) => {
  await page.route('https://open.spotify.com/embed/iframe-api/v1', route => route.fulfill({ contentType: 'application/javascript', body: `
    window.onSpotifyIframeApiReady({ createController(element, options, callback) {
      let paused = true;
      const listeners = {};
      const update = () => listeners.playback_update({ data: { isPaused: paused, isBuffering: false } });
      callback({
        addListener(name, handler) { listeners[name] = handler; if(name === 'ready') setTimeout(handler, 0); },
        play() { paused = false; update(); },
        togglePlay() { paused = !paused; update(); },
        destroy() {}
      });
    }});
  ` }))
  await page.goto('/about')
  // it loads Spotify and plays as the page opens
  await expect(page.locator('.vinyl-player')).toHaveClass(/is-playing/)
  await expect(page.locator('.record-disc')).toHaveCSS('animation-play-state', 'running')
  await page.getByRole('button', { name: 'Pause Feather by Nujabes' }).click()
  await page.mouse.move(0, 0)
  await expect(page.locator('.vinyl-player')).not.toHaveClass(/is-playing/)
  await expect(page.locator('.record-disc')).toHaveCSS('animation-play-state', 'paused')
  await page.getByRole('button', { name: 'Play Feather by Nujabes' }).click()
  await expect(page.locator('.vinyl-player')).toHaveClass(/is-playing/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.record-disc')).toHaveCSS('animation-name', 'none')
})
