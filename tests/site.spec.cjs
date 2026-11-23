const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('contato pendente não escolhe número e mantém alternativa real', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href*="wa.me"], a[href*="api.whatsapp"]')).toHaveCount(0);
  await expect(page.locator('[data-booking]').first()).toHaveAttribute('href', '#contato');
  await expect(page.locator('#contact-status')).toContainText('Instagram');
  await expect(page.locator('#contato a[href="https://instagram.com/josedocorte7"]')).toBeVisible();
});

test('conteúdo autêntico sem captura indevida e metadados completos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.service-card')).toHaveCount(6);
  await expect(page.locator('#depoimentos img, .carousel')).toHaveCount(0);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Lima Duarte/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://saraingridsousa.github.io/LandingPage_Barbearia/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  const business = await page.locator('script[type="application/ld+json"]').evaluate(el => JSON.parse(el.textContent));
  expect(business['@type']).toBe('LocalBusiness');
  expect(business.address.streetAddress).toBe('Rua Vieira Pinto, 44');
  expect(business.telephone).toBeUndefined();
  expect(business.aggregateRating).toBeUndefined();
  await expect(page.locator('iframe')).toHaveAttribute('title', /Localização/);
});

test('configuração confirmada uniformiza CTAs e codifica serviço sem envio', async ({ page }) => {
  await page.route('**/index.html', async route => {
    const response = await route.fetch();
    const html = (await response.text()).replace('{"whatsapp":null}', '{"whatsapp":"5511999999999"}');
    await route.fulfill({ response, body: html });
  });
  await page.goto('/index.html');
  const urls = await page.locator('[data-booking]').evaluateAll(links => links.map(a => ({ href: a.href, service: a.dataset.service })));
  expect(urls.length).toBeGreaterThan(6);
  for (const item of urls) {
    const url = new URL(item.href);
    expect(url.origin + url.pathname).toBe('https://wa.me/5511999999999');
    expect(url.searchParams.get('text')).toContain(item.service || 'horário');
  }
  await expect(page.locator('#contact-primary')).toHaveAttribute('href', /wa.me\/5511999999999/);
  await expect(page.locator('#contact-status')).toContainText('WhatsApp');
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
