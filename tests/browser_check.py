"""Focused browser checks for the portfolio. Run with the dev server on port 5173."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.impeccable' / 'review'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    page = context.new_page()
    # Capture the actual, user-owned project, not a reconstructed mockup.
    page.goto('https://www.mongolianculturalcenterna.org/', wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    page.locator('main img').first.wait_for(state='visible')
    page.wait_for_function("Array.from(document.querySelectorAll('main img')).every(i => i.complete)")
    page.screenshot(path=str(ROOT / 'public' / 'cultural-center.png'))

    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto('http://127.0.0.1:5173/', wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    expect(page.get_by_role('heading', level=1)).to_have_count(1)
    expect(page.get_by_role('button', name='Remix the Jeje lettering')).to_be_visible()
    page.keyboard.press('Tab')
    expect(page.get_by_role('link', name='Skip to content')).to_be_focused()
    remix = page.get_by_role('button', name='Remix the Jeje lettering')
    remix.click()
    expect(remix).to_have_attribute('aria-pressed', 'true')
    page.get_by_role('button', name='Put things back').click()
    expect(remix).to_have_attribute('aria-pressed', 'false')

    for detail in page.locator('details').all():
        detail.locator('summary').click()
        expect(detail).to_have_attribute('open', '')
        detail.locator('summary').click()
        expect(detail).not_to_have_attribute('open', '')
    context.grant_permissions(['clipboard-read', 'clipboard-write'])
    page.get_by_role('button', name='Copy email address').click()
    expect(page.get_by_role('status')).to_have_text('Copied!')
    assert page.evaluate('navigator.clipboard.readText()') == 'enkhjinjeje@gmail.com'
    page.evaluate("Object.defineProperty(navigator.clipboard, 'writeText', {value: () => Promise.reject(new Error('Denied'))})")
    page.get_by_role('button', name='Copy email address').click()
    expect(page.get_by_role('status')).to_have_text('Please copy the email above.')
    response = page.request.get('http://127.0.0.1:5173/JejeResume.pdf')
    assert response.ok and response.body().startswith(b'%PDF')
    for link in page.locator('a[href^="#"]').all():
        target = link.get_attribute('href')
        assert page.locator(target).count() == 1, target
    assert page.locator('img').evaluate_all('(imgs) => imgs.every(i => i.complete && i.naturalWidth > 0)')

    for width in [320, 390, 768, 1024, 1440]:
        page.set_viewport_size({'width': width, 'height': 1000 if width > 700 else 844})
        page.evaluate('window.scrollTo(0,0)')
        page.wait_for_timeout(400)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}'
        if width == 390:
            page.get_by_role('button', name='Open menu').click()
            expect(page.get_by_role('navigation', name='Mobile navigation')).to_be_visible()
            page.get_by_role('navigation', name='Mobile navigation').get_by_role('link', name='About').click()
            expect(page.get_by_role('navigation', name='Mobile navigation')).to_have_count(0)
            assert page.url.endswith('#about')
            page.get_by_role('link', name='Jeje, home').click()
            page.get_by_role('button', name='Open menu').click()
            page.get_by_role('navigation', name='Mobile navigation').get_by_role('link', name='Work').focus()
            page.keyboard.press('Escape')
            expect(page.get_by_role('button', name='Open menu')).to_be_focused()
        if width in [390, 1440]:
            page.goto('http://127.0.0.1:5173/', wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            page.screenshot(path=str(OUT / ('desktop.png' if width == 1440 else 'mobile.png')), full_page=True)
            page.screenshot(path=str(OUT / ('desktop-hero.png' if width == 1440 else 'mobile-hero.png')))
    page.emulate_media(reduced_motion='reduce')
    assert page.evaluate('getComputedStyle(document.documentElement).scrollBehavior') == 'auto'
    assert not errors, errors
    print('PASS: 5 viewport widths; no horizontal overflow; navigation; keyboard focus; all disclosures; lettering; clipboard success/failure; PDF; images; internal links; reduced motion; no runtime errors.')
    browser.close()
