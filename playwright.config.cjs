const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', workers: 2, timeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'evidence/playwright-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve.cjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false }
});
