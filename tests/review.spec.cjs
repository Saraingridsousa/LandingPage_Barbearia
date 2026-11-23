const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

for (const config of ['null', '[]', '"invalid"', '{malformed']) {
  test(`configuração raiz inválida não causa erro: ${config}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/index.html', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('{"whatsapp":null}', config) });
    });
    await page.goto('/index.html');
    await expect(page.locator('[data-booking]').first()).toHaveAttribute('href', '#contato');
    await expect(page.locator('#contact-primary')).toHaveAttribute('href', 'https://instagram.com/josedocorte7');
    expect(errors).toEqual([]);
  });
}

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
