const { test, expect } = require('@playwright/test');

function contrastRatio(foreground, background) {
  const luminance = (color) => {
    const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('navbar booking label stays readable on hover', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const button = page.locator('#nav_list .button');
  await button.hover();
  await page.waitForTimeout(250);
  const colors = await button.evaluate(element => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor }));
  console.log('Navbar hover colors:', colors, 'contrast:', contrastRatio(colors.color, colors.background));
  await page.screenshot({ path: `${process.env.JR_EVIDENCE_DIR || 'evidence/cta-services'}/navbar-hover-current.png` });
  expect(contrastRatio(colors.color, colors.background)).toBeGreaterThanOrEqual(4.5);
});

test('hero address includes Lima Duarte', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-location')).toHaveText('Rua Vieira Pinto, 44 · Centro - Lima Duarte');
});

for (const width of [375, 1024, 1440]) {
  test(`navbar CTA contrast survives every interaction state at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    if (width < 1024) await page.locator('#btn_mobile').click();
    const button = page.locator('#nav_list .button');
    const assertContrast = async () => {
      const colors = await button.evaluate(e => ({ foreground: getComputedStyle(e).color, background: getComputedStyle(e).backgroundColor }));
      expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
    };
    await assertContrast();
    await button.hover();
    await page.waitForTimeout(250);
    await assertContrast();
    await page.mouse.down();
    await page.waitForTimeout(250);
    await assertContrast();
    await page.mouse.move(5, 5);
    await page.mouse.up();
    await page.keyboard.press('Tab');
    if (width < 1024 && await page.locator('#nav_list').isHidden()) await page.locator('#btn_mobile').click();
    await button.focus();
    await page.waitForTimeout(250);
    await assertContrast();
    const AxeBuilder = require('@axe-core/playwright').default;
    const axe = await new AxeBuilder({ page }).include('#navbar').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations).toEqual([]);
  });
}
