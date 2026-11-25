const { test, expect } = require('@playwright/test');

const originalServices = [
  ['Corte', 'Cortes modernos e clássicos para todos os estilos.'],
  ['Barba', 'Barba tradicional, design e tratamento de pele.'],
  ['Corte Kids', 'Ambiente acolhedor para a primeira experiência das crianças.'],
  ['Sobrancelha', 'Design e correção para uma expressão mais marcante.'],
  ['Pigmentação', 'Procedimentos de pigmentação para realçar o visual.'],
  ['Produtos', 'Linha selecionada de produtos para manter o corte e a barba.']
];

test('service menu groups the six original services without inventing content', async ({ page }) => {
  const expectedImages = { Corte: 'corte.webp', Barba: 'barba.webp', 'Corte Kids': 'corte-kids.webp', Sobrancelha: 'sobrancelha.webp', 'Pigmentação': 'pigmentacao.webp', Produtos: 'produtos.webp' };
  await page.goto('/');
  await expect(page.locator('.service-group')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Cortes e barba', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Detalhes e cuidados', exact: true })).toBeVisible();
  await expect(page.locator('.service-group .service-card')).toHaveCount(6);
  for (const [name, description] of originalServices) {
    const row = page.locator('.service-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(row.locator('p')).toHaveText(description);
    await expect(row.locator('[data-service]')).toHaveAttribute('data-service', name);
    await expect(row.locator('img')).toHaveAttribute('src', `src/imagens/optimized/${expectedImages[name]}`);
  }
  await expect(page.locator('.services-booking [data-booking]')).toHaveAttribute('href', 'https://wa.me/553299827807');
});
