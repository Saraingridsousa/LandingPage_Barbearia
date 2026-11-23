const { test, expect } = require('@playwright/test');

test('service keyboard selection reaches contact and a generic CTA clears old context', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const service = page.locator('.service-card [data-service="Pigmentação"]');
  await service.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contato$/);
  await expect(page.locator('#booking-selection')).toHaveText('Serviço de interesse: Pigmentação.');
  await expect(page.locator('#booking-selection')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('#contato')).toBeFocused();
  await expect(page.locator('#contact-primary')).toHaveAttribute('href', 'https://instagram.com/josedocorte7');
  await page.locator('.service-card [data-service="Corte"]').click();
  await expect(page.locator('#booking-selection')).toHaveText('Serviço de interesse: Corte.');
  await page.locator('.services-booking [data-booking]').click();
  await expect(page.locator('#booking-selection')).toBeEmpty();
});
