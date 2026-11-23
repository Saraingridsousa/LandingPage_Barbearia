const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`layout, alvos e axe em ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.locator('img').evaluateAll(images => images.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src))).toEqual([]);
    const badTargets = await page.locator('a,button').evaluateAll(elements => elements.filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !e.classList.contains('skip-link') && (r.width < 44 || r.height < 44);
    }).map(e => ({ text: e.textContent, rect: e.getBoundingClientRect().toJSON() })));
    expect(badTargets).toEqual([]);
    const sections = await page.locator('main > section').evaluateAll(elements => elements.map(e => e.getBoundingClientRect().toJSON()));
    for (let i = 1; i < sections.length; i++) expect(sections[i].top).toBeGreaterThanOrEqual(sections[i - 1].bottom - 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    await testInfo.attach('axe', { body: JSON.stringify({ violations: axe.violations, incomplete: axe.incomplete }, null, 2), contentType: 'application/json' });
    expect(axe.violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `${process.env.JR_EVIDENCE_DIR || 'evidence'}/screenshot-${width}.png`, fullPage: true });
  });
}

test('links internos, assets e prefixo GitHub Pages resolvem', async ({ page, request }) => {
  const missing = [];
  page.on('response', response => { if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400) missing.push(response.url()); });
  await page.goto('/LandingPage_Barbearia/');
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.hash).filter(hash => !document.getElementById(decodeURIComponent(hash.slice(1)))));
  expect(brokenAnchors).toEqual([]);
  for (const img of await page.locator('img').all()) await img.scrollIntoViewIfNeeded();
  const resources = await page.locator('[src], link[href]').evaluateAll(elements => elements.map(e => e.src || e.href).filter(url => url.startsWith(location.origin)));
  for (const url of new Set(resources)) expect((await request.get(url)).status(), url).toBe(200);
  const unsafe = await page.locator('a[target="_blank"]').evaluateAll(links => links.filter(a => !a.relList.contains('noopener') || !a.relList.contains('noreferrer')).map(a => a.href));
  expect(unsafe).toEqual([]);
  expect(missing).toEqual([]);
});

test('sem JavaScript mantém navegação e contato úteis', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#nav_list a').first()).toBeVisible();
  await expect(page.locator('#btn_mobile')).toBeHidden();
  await expect(page.locator('#contact-primary')).toHaveAttribute('href', 'https://instagram.com/josedocorte7');
  await context.close();
});

test('menu fecha ao sair, redimensionar e foco é visível', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('#btn_mobile');
  await toggle.click();
  await page.locator('h1').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(page.locator('#nav_list')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#nav_list')).toBeHidden();
  await page.keyboard.press('Tab');
  await toggle.focus();
  expect(await toggle.evaluate(e => getComputedStyle(e).outlineStyle)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.button').first().evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
});

for (const badContact of ['"+55 32 99982-7807"', '"javascript:alert(1)"', '123', '{}']) {
  test(`configuração inválida mantém fallback: ${badContact}`, async ({ page }) => {
    await page.route('**/index.html', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('{"whatsapp":null}', `{"whatsapp":${badContact}}`) });
    });
    await page.goto('/index.html');
    await expect(page.locator('[data-booking]').first()).toHaveAttribute('href', '#contato');
  });
}
