const { test, expect } = require('@playwright/test');

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`hero composition and controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const banner = page.locator('#banner');
    const title = page.locator('#hero-title');
    const photo = banner.locator('img');
    await expect(photo).toBeVisible();
    await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const imageRect = await banner.boundingBox();
    const titleRect = await title.boundingBox();
    if (width < 768) {
      expect(imageRect.y).toBeLessThanOrEqual(titleRect.y);
      expect(imageRect.y + imageRect.height).toBeGreaterThan(titleRect.y + titleRect.height);
      expect(imageRect.width).toBeCloseTo(width, 0);
      await expect(banner).toHaveCSS('position', 'absolute');
      await expect(photo).toHaveCSS('object-fit', 'cover');
      await expect(page.locator('.hero-actions .button')).toBeInViewport();
    } else {
      expect(imageRect.x).toBeGreaterThanOrEqual(titleRect.x + titleRect.width - 1);
      await expect(banner).not.toHaveCSS('position', 'absolute');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

for (const width of [390, 1440]) {
  test(`smooth anchors reach their destination at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'smooth');
    await page.evaluate(() => {
      window.__scrollPositions = [];
      window.addEventListener('scroll', () => window.__scrollPositions.push(window.scrollY), { passive: true });
    });
    if (width < 1024) await page.locator('#btn_mobile').click();
    await page.locator('#nav_list a[href="#sobre"]').click();
    await expect(page).toHaveURL(/#sobre$/);
    await expect(page.locator('#sobre')).toBeFocused();
    await expect.poll(() => page.locator('#sobre').evaluate(e => Math.abs(e.getBoundingClientRect().top - 24))).toBeLessThan(3);
    expect(await page.evaluate(() => new Set(window.__scrollPositions).size)).toBeGreaterThan(2);
    await page.goto('/');
    await page.locator('.hero-actions .text-link').click();
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe('#serviços');
    await expect.poll(() => page.locator('#serviços').evaluate(e => Math.abs(e.getBoundingClientRect().top - 24))).toBeLessThan(3);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
    await page.locator('.footer-bottom a[href="#home"]').click();
    await expect(page).toHaveURL(/#home$/);
    await expect.poll(() => page.locator('#home').evaluate(e => Math.abs(e.getBoundingClientRect().top - 24))).toBeLessThan(3);
  });
}

test('release assets are versioned and the canonical points to the renamed Pages site', async ({ page }) => {
  await page.goto('/Barbershop-landing-page/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://saraingridsousa.github.io/Barbershop-landing-page/');
  const assets = await page.locator('link[rel="stylesheet"], script[src]').evaluateAll(elements => elements.map(e => new URL(e.href || e.src).searchParams.get('v')));
  expect(assets.length).toBeGreaterThan(2);
  expect(assets.every(Boolean)).toBe(true);
});
