const { test, expect } = require('@playwright/test');
test('menu não desloca conteúdo ao carregar JavaScript atrasado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/src/javascript/script.js', async route => { await gate; await route.continue(); });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('h1')).toBeVisible();
  const before = await page.locator('#content').boundingBox();
  release();
  await page.waitForLoadState('load');
  const after = await page.locator('#content').boundingBox();
  expect(Math.abs(before.y - after.y)).toBeLessThanOrEqual(2);
});
