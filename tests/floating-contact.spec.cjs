const { test, expect } = require('@playwright/test');

for (const width of [320, 390, 768, 1440]) {
  test(`floating contact stays visible, gold and usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const button = page.locator('#floating-contact');
    await expect(button).toHaveAccessibleName('Agendar pelo WhatsApp');
    await expect(button).toHaveAttribute('href', 'https://wa.me/553299827807');
    await expect(button).toHaveCSS('position', 'fixed');
    await expect(button).toHaveCSS('background-color', 'rgb(255, 180, 48)');
    await expect(button.locator('.floating-contact-whatsapp')).toBeVisible();
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
    await page.route('https://wa.me/**', route => route.fulfill({ body: 'WhatsApp link intercepted for test' }));
    await button.click();
    await expect(page).toHaveURL('https://wa.me/553299827807');
  });
}

test('floating contact remains useful without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 800 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#floating-contact')).toHaveAttribute('href', 'https://wa.me/553299827807');
  await expect(page.locator('#floating-contact')).toBeVisible();
  await context.close();
});
