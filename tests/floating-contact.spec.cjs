const { test, expect } = require('@playwright/test');

for (const width of [320, 390, 768, 1440]) {
  test(`floating contact stays visible, gold and usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const button = page.locator('#floating-contact');
    await expect(button).toHaveAccessibleName('Agendar horário');
    await expect(button).toHaveAttribute('href', '#contato');
    await expect(button).toHaveCSS('position', 'fixed');
    await expect(button).toHaveCSS('background-color', 'rgb(255, 180, 48)');
    await expect(button.locator('.floating-contact-whatsapp')).toBeHidden();
    const first = await button.boundingBox();
    expect(first.width).toBeGreaterThanOrEqual(44);
    expect(first.height).toBeGreaterThanOrEqual(44);
    expect(width - first.x - first.width).toBeGreaterThanOrEqual(15);
    expect(800 - first.y - first.height).toBeGreaterThanOrEqual(15);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const last = await button.boundingBox();
    expect(last.x).toBeCloseTo(first.x, 0);
    expect(last.y).toBeCloseTo(first.y, 0);
    await button.click();
    await expect(page).toHaveURL(/#contato$/);
    await expect(page.locator('#contato')).toBeFocused();
  });
}

test('confirmed configuration activates WhatsApp icon and correct booking URL', async ({ page }) => {
  await page.route('**/index.html', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('{"whatsapp":null}', '{"whatsapp":"5511999999999"}') });
  });
  await page.goto('/index.html');
  const button = page.locator('#floating-contact');
  await expect(button).toHaveAccessibleName('Agendar pelo WhatsApp');
  await expect(button.locator('.floating-contact-whatsapp')).toBeVisible();
  await expect(button.locator('.floating-contact-chat')).toBeHidden();
  const url = new URL(await button.getAttribute('href'));
  expect(url.origin + url.pathname).toBe('https://wa.me/5511999999999');
  expect(url.searchParams.get('text')).toContain('agendar um horário');
});

test('floating contact remains useful without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#floating-contact')).toHaveAttribute('href', '#contato');
  await expect(page.locator('#floating-contact')).toBeVisible();
  await context.close();
});
