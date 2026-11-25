const { test, expect } = require('@playwright/test');

test.use({ timezoneId: 'America/Sao_Paulo' });

for (const [date, age] of [
  ['2026-10-25T12:00:00-03:00', 18],
  ['2026-10-26T00:00:00-03:00', 19],
  ['2026-11-25T12:00:00-03:00', 19],
  ['2027-01-01T12:00:00-03:00', 19],
  ['2027-10-25T23:59:59-03:00', 19],
  ['2027-10-26T00:00:00-03:00', 20],
  ['2030-10-26T12:00:00-03:00', 23]
]) {
  test(`biography age on ${date} is ${age}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(date));
    await page.goto('/');
    await expect(page.locator('#barber-age')).toHaveText(`, tenho ${age} anos`);
    await expect(page.locator('.about-copy > p').nth(1)).toContainText('desde os 15');
    await expect(page.locator('#floating-contact')).toHaveAttribute('href', 'https://wa.me/553299827807');
  });
}

test('biography remains grammatical without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#barber-age')).toBeEmpty();
  await expect(page.locator('.about-copy > p').nth(1)).toContainText('Meu nome é José Ricardo e sou apaixonado por barbearia desde os 15');
  await context.close();
});
