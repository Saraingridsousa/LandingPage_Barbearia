const fs = require('node:fs/promises');
(async () => {
  const html = await fs.readFile('index.html', 'utf8');
  const urls = [...new Set([...html.matchAll(/(?:href|src)="(https:[^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&')))];
  const results = await Promise.all(urls.map(async url => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
      await response.body?.cancel();
      return { url, status: response.status, finalURL: response.url, ok: response.ok };
    } catch (error) { return { url, ok: false, error: error.message }; }
  }));
  await fs.writeFile('evidence/external-links.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
