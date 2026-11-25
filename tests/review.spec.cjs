const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('menu aberto acessível e link ativado somente com teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.logo_nav')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#btn_mobile')).toBeFocused();
  await page.keyboard.press('Enter');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#nav_list a[href="#sobre"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sobre')).toBeFocused();
  await expect(page.locator('#nav_list')).toBeHidden();
});
