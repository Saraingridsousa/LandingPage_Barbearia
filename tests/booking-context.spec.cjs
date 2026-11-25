const { test, expect } = require('@playwright/test');

test('service booking works by keyboard and leaves the page for the confirmed WhatsApp', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://wa.me/**', route => route.fulfill({ body: 'WhatsApp link intercepted for test' }));
  await page.goto('/');
  const service = page.locator('.service-card [data-service="Pigmentação"]');
  await service.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('https://wa.me/553299827807');
});

test('internal navigation and Instagram and maps retain independent destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-actions .text-link')).toHaveAttribute('href', '#serviços');
  await expect(page.locator('.hero-bottom a')).toHaveAttribute('href', '#localizacao');
  await expect(page.locator('.location-grid .button')).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/dir\//);
  await expect(page.locator('.about-copy a')).toHaveAttribute('href', 'https://www.instagram.com/josedocorte7');
  await expect(page.locator('.footer-inner .text-link')).toHaveAttribute('href', 'https://www.instagram.com/josedocorte7');
});
