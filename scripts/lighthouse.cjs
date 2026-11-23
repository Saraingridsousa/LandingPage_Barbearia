// One-off audit helper; Lighthouse may be installed outside the application.
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('@playwright/test');
(async () => {
  const { createRequire } = require('node:module');
  const { pathToFileURL } = require('node:url');
  const deps = process.env.LIGHTHOUSE_ROOT ? createRequire(path.resolve(process.env.LIGHTHOUSE_ROOT, 'package.json')) : require;
  const { default: lighthouse } = await import(pathToFileURL(deps.resolve('lighthouse')).href);
  const { launch } = await import(pathToFileURL(deps.resolve('chrome-launcher')).href);
  const { default: desktopConfig } = await import(pathToFileURL(deps.resolve('lighthouse/core/config/lr-desktop-config.js')).href);
  const scratch = process.env.TMPDIR || path.join(require('node:os').homedir(), 'AppData/Local/hermes/cache/scratch');
  const profile = await fs.mkdtemp(path.join(scratch, 'jr-lighthouse-'));
  const server = spawn(process.execPath, ['scripts/serve.cjs'], { windowsHide: true, stdio: 'pipe' });
  let chrome;
  try {
    for (let attempt = 0; attempt < 40; attempt++) {
      try { if ((await fetch('http://127.0.0.1:4173')).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    chrome = await launch({ chromePath: chromium.executablePath(), userDataDir: profile, chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
    const summary = [];
    for (const formFactor of ['mobile', 'desktop']) {
      const screen = formFactor === 'mobile' ? { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false } : { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false };
      const result = await lighthouse('http://127.0.0.1:4173/', { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor, screenEmulation: screen }, formFactor === 'desktop' ? desktopConfig : undefined);
      await fs.writeFile(`evidence/lighthouse-${formFactor}-raw.json`, JSON.stringify(result.lhr, null, 2));
      summary.push({ formFactor, lighthouseVersion: result.lhr.lighthouseVersion, fetchTime: result.lhr.fetchTime, scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([k, v]) => [k, v.score * 100])), metrics: Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint', 'speed-index'].map(k => [k, { value: result.lhr.audits[k].numericValue, display: result.lhr.audits[k].displayValue }])), errors: Object.entries(result.lhr.audits).filter(([, v]) => v.score !== null && v.score < 1).map(([k, v]) => ({ id: k, score: v.score, title: v.title, description: v.description })), warnings: result.lhr.runWarnings });
    }
    await fs.writeFile('evidence/lighthouse-summary.json', JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    if (chrome) await chrome.kill();
    server.kill();
    await fs.rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
