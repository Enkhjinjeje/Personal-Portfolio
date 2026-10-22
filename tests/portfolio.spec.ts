import { test, expect } from '@playwright/test'

test('portfolio content, interactions, and responsive layout survive the migration', async ({ page, context, request }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page).toHaveTitle('Jeje — Developer & community builder')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()

  const remix = page.getByRole('button', { name: 'Remix the Jeje lettering' })
  await remix.click()
  await expect(remix).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Put things back' }).click()
  await expect(remix).toHaveAttribute('aria-pressed', 'false')

  for (const detail of await page.locator('details').all()) {
    await detail.locator('summary').click()
    await expect(detail).toHaveAttribute('open', '')
    await detail.locator('summary').click()
    await expect(detail).not.toHaveAttribute('open')
  }

  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(page.getByRole('status')).toHaveText('Copied!')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('enkhjinjeje@gmail.com')
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new Error('Denied')),
    })
  })
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(page.getByRole('status')).toHaveText('Please copy the email above.')

  const resume = await request.get('/JejeResume.pdf')
  expect(resume.ok()).toBeTruthy()
  expect((await resume.body()).subarray(0, 4).toString()).toBe('%PDF')
  for (const link of await page.locator('a[href^="#"]').all()) {
    await expect(page.locator((await link.getAttribute('href'))!)).toHaveCount(1)
  }
  await page.locator('.project-visual').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true)

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 390) {
      await page.getByRole('button', { name: 'Open menu' }).click()
      const nav = page.getByRole('navigation', { name: 'Mobile navigation' })
      await expect(nav).toBeVisible()
      await nav.getByRole('link', { name: 'About' }).click()
      await expect(nav).toHaveCount(0)
      await expect(page).toHaveURL(/#about$/)
      await page.getByRole('link', { name: 'Jeje, home' }).click()
      await page.getByRole('button', { name: 'Open menu' }).click()
      await nav.getByRole('link', { name: 'Work' }).focus()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
      await expect(nav).toHaveCount(0)
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  expect(errors).toEqual([])
})

test('Next.js serves the portfolio and metadata before JavaScript runs', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  await page.goto('http://127.0.0.1:3000/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Enkhjin/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.close()
})
