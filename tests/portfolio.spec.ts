import { test, expect, type Page } from '@playwright/test'

const pages = [
  { path: '/', corner: 'Home', heading: /Jeje/ },
  { path: '/projects', corner: 'Projects', heading: 'Projects.' },
  { path: '/work', corner: 'Work experience', heading: 'Work experience.' },
  { path: '/about', corner: 'About me', heading: 'Building communities, deploying potential.' },
  { path: '/contact', corner: 'Contact', heading: /Let’s make/ },
]

// No page scrolls; the stage between the corners holds its page without overflowing on a laptop screen (the
// projects page scrolls through its list inside the stage on purpose)
const fitsOneScreen = (page: Page) => page.evaluate(() => {
  const stage = document.getElementById('main')!
  const fits = document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth
  return fits && (!!stage.querySelector('.projects') || stage.scrollHeight <= stage.clientHeight + 1)
})
const nav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' })

test('the four corners flow between pages that each fit one screen', async ({ page, context, request }) => {
  // a walk through every page and its flows; it runs close to the default 30s on its own
  test.setTimeout(60_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page).toHaveTitle('Jeje — Developer & community builder')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()

  // the portrait colours in and back
  await expect(page.getByRole('img', { name: /portrait drawn in dots, in black and white/ })).toBeVisible()
  const color = page.locator('.color-hint')
  await color.click()
  await expect(color).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('img', { name: /portrait drawn in dots, in colour/ })).toBeVisible()
  await color.click()
  await expect(color).toHaveAttribute('aria-pressed', 'false')

  // each corner flows to its page, where that same corner turns into the way home
  for (const { path, corner, heading } of pages.slice(1)) {
    await nav(page).getByRole('link', { name: corner }).click()
    // the flow runs out first: the page changes only when it bounces, and the mask lifts when it lands
    await expect(page.locator('html')).toHaveClass(/is-flowing/)
    expect(new URL(page.url()).pathname).toBe('/')
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.locator('html')).not.toHaveClass(/is-flowing/)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    expect(await fitsOneScreen(page), `${path} fits one screen`).toBe(true)
    await expect(nav(page).getByRole('link', { name: corner })).toHaveCount(0)
    const home = nav(page).getByRole('link', { name: 'Home' })
    await expect(home).toHaveAttribute('href', '/')
    await home.click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).not.toHaveClass(/is-flowing/)
  }

  // the projects are an endless canvas: arrow keys pan it, a tile opens its details, Escape closes them
  await page.goto('/projects')
  const plane = page.locator('.project-plane')
  const before = await plane.evaluate(el => el.style.transform)
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => plane.evaluate(el => el.style.transform)).not.toBe(before)
  await page.locator('.project-tile[tabindex="0"]').first().focus()
  await page.keyboard.press('Enter')
  const detail = page.getByRole('dialog', { name: 'Mongolian Cultural Center website' })
  await expect(detail).toContainText('501(c)(3)')
  await expect(detail).toContainText('June 2025 – Present')
  await page.keyboard.press('Escape')
  await expect(detail).toHaveCount(0)
  await expect(page).toHaveURL(/\/projects$/)

  // Esc flows home from any other page
  await page.goto('/work')
  // wait for the page's script, which listens for Escape
  await page.waitForLoadState('networkidle')
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('html')).not.toHaveClass(/is-flowing/)

  // the roles turn on a dial: picking one, or turning it with the arrow keys, shows that role beside it
  await page.goto('/work')
  const roles = page.getByRole('tab')
  const panel = page.getByRole('tabpanel')
  await expect(roles).toHaveCount(5)
  await expect(roles.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('2,279')
  await roles.nth(1).click()
  await expect(roles.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(panel).toContainText('9-member board')
  await page.keyboard.press('ArrowDown')
  await expect(roles.nth(2)).toHaveAttribute('aria-selected', 'true')
  await expect(roles.nth(2)).toBeFocused()
  await expect(panel).toContainText('300+ total attendees')
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)

  await page.goto('/contact')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(page.getByRole('status')).toHaveText('Copied!')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('enkhjinjeje@gmail.com')
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Denied')) })
  })
  await page.getByRole('button', { name: 'Copy email address' }).click()
  await expect(page.getByRole('status')).toHaveText('Please copy the email above.')

  const resume = await request.get('/JejeResume.pdf')
  expect(resume.ok()).toBeTruthy()
  expect((await resume.body()).subarray(0, 4).toString()).toBe('%PDF')

  // smaller screens: nothing runs off the side, and the corners use short labels on phones
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    for (const { path } of pages) {
      await page.goto(path)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight), `${path} at ${width}px`).toBe(true)
    }
    if (width === 390) await expect(page.locator('.corner-tr .label-short')).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('with reduced motion the corners change page at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact' }).click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(page.locator('html')).not.toHaveClass(/is-flowing/)
  await expect(page.getByRole('heading', { level: 1, name: /Let’s make/ })).toBeVisible()
})

test('every page is served, with its own title, before JavaScript runs', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  for (const { path, heading } of pages) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeAttached()
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Enkhjin/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  }
  await page.goto('/about')
  await expect(page).toHaveTitle('About me — Jeje')
  await page.close()
})

test('recruiter mode lays out the résumé over any page, and closes back to it', async ({ page }) => {
  await page.goto('/work')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Recruiter' }).click()
  const sheet = page.getByRole('dialog', { name: /Chuluunkhuu/ })
  await expect(sheet).toBeVisible()
  await expect(sheet).toContainText('GPA 3.4')
  await expect(sheet).toContainText('88 participants at Amazon')
  await expect(page).toHaveURL(/\/work#recruiter$/)
  // Escape closes it, and stays on the page instead of flowing home
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(page).toHaveURL(/\/work$/)
  // a link to #recruiter opens it straight away
  await page.goto('/projects#recruiter')
  await expect(page.getByRole('dialog', { name: /Chuluunkhuu/ })).toBeVisible()
})
