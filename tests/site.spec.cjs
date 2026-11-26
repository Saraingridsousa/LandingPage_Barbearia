const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('all booking links point to confirmed WhatsApp, Instagram links stay separate', async ({ page }) => {
  await page.goto('/');
  const links = await page.locator('[data-booking]').evaluateAll(links => links.map(a => a.href));
  expect(links.length).toBe(12);
  expect(links.every(href => href === 'https://wa.me/553299827807')).toBe(true);
  await expect(page.locator('#contact-primary')).toHaveAttribute('href', 'https://wa.me/553299827807');
  await expect(page.locator('#contact-status')).toContainText('WhatsApp');
  await expect(page.locator('a[href="https://www.instagram.com/josedocorte7"]')).toHaveCount(3);
});

test('conteúdo autêntico sem captura indevida e metadados completos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.service-card')).toHaveCount(6);
  await expect(page.locator('#depoimentos img, .carousel')).toHaveCount(0);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Lima Duarte/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://saraingridsousa.github.io/Barbershop-landing-page/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  const business = await page.locator('script[type="application/ld+json"]').evaluate(el => JSON.parse(el.textContent));
  expect(business['@type']).toBe('LocalBusiness');
  expect(business.address.streetAddress).toBe('Rua Vieira Pinto, 44');
  expect(business.telephone).toBeUndefined();
  expect(business.aggregateRating).toBeUndefined();
  await expect(page.locator('iframe')).toHaveAttribute('title', /Localização/);
});

test('menu móvel funciona por teclado, Escape e navegação', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
  const toggle = page.locator('#btn_mobile');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-controls', 'nav_list');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(page.locator('#nav_list a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Space');
  await page.locator('#nav_list a[href="#sobre"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#sobre')).toBeFocused();
});

for (const width of [320, 390, 768, 1440]) {
  test(`Instagram CTA is accessible and responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const cta = page.locator('#sobre > .instagram-cta');
    await expect(page.locator('#serviços .instagram-cta')).toHaveCount(0);
    await expect(page.locator('#sobre > .about-grid + .instagram-cta')).toHaveCount(1);
    const link = cta.getByRole('link', { name: /Conheça nosso trabalho no Instagram/ });
    await expect(link).toHaveAttribute('href', 'https://www.instagram.com/josedocorte7');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).not.toHaveAttribute('data-booking', /.+/);
    await expect(link.locator('svg')).toBeVisible();
    await link.scrollIntoViewIfNeeded();
    const bounds = await link.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await link.focus();
    await expect(link).toBeFocused();
  });
}
