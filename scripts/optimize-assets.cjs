#!/usr/bin/env node
'use strict';
// Render the supplied SVG compositions, never their embedded raster payloads.
// Run from any directory: node scripts/optimize-assets.cjs
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
const images = path.join(root, 'src', 'imagens');
const out = path.join(images, 'optimized');
const fonts = path.join(root, 'src', 'fonts');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const cssUrl = 'https://fonts.googleapis.com/css2?family=MedievalSharp&family=Montserrat:wght@400..800&display=swap';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
async function download(url) {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
  if (!response.ok) throw new Error(`Download ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
const convertPython = `import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert('RGBA')\nim.save(sys.argv[2],format='WEBP',quality=90,method=6,exact=True,lossless=sys.argv[3]=='lossless')\ncheck=Image.open(sys.argv[2]);check.load()\nassert check.size==im.size\nprint(json.dumps({'width':check.width,'height':check.height,'mode':check.mode,'format':check.format}))`;
async function main() {
  await fs.mkdir(out, { recursive: true });
  await fs.mkdir(fonts, { recursive: true });
  const scratchBase = path.join(os.homedir(), 'AppData', 'Local', 'hermes', 'cache', 'scratch');
  await fs.mkdir(scratchBase, { recursive: true });
  const scratch = await fs.mkdtemp(path.join(scratchBase, 'barbearia-assets-'));
  const originalNames = (await fs.readdir(images, { withFileTypes: true })).filter(x => x.isFile()).map(x => x.name).sort();
  const originalHashes = Object.fromEntries(await Promise.all(originalNames.map(async name => [name, hash(await fs.readFile(path.join(images, name)))])));
  const manifest = { schemaVersion: 1, command: 'node scripts/optimize-assets.cjs', renderer: 'Playwright Chromium; original SVG file URLs; omitBackground: true; deviceScaleFactor: 1', encoding: 'Pillow WebP method=6; photos quality=90; service icons and logo lossless', originals: originalHashes, images: [], fonts: [] };
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const jobs = [
      ['capa.svg', 'capa-916.webp', 916], ['capa.svg', 'capa-640.webp', 640],
      ['foto_jr.svg', 'foto-jr-600.webp', 600], ['foto_jr.svg', 'foto-jr-360.webp', 360],
      ['Corte.svg', 'corte.webp'], ['Barba.svg', 'barba.webp'], ['Corte_Kids.svg', 'corte-kids.webp'],
      ['Sobrancelha.svg', 'sobrancelha.webp'], ['Pigmentação.svg', 'pigmentacao.webp'], ['Produtos.svg', 'produtos.webp'],
      ['logo.png', 'logo.webp', 196]
    ];
    for (const [source, filename, requestedWidth] of jobs) {
      let input = path.join(images, source);
      const lossless = !source.startsWith('capa') && source !== 'foto_jr.svg';
      if (source.endsWith('.svg')) {
        const svg = await fs.readFile(input, 'utf8');
        const dimensions = svg.match(/<svg[^>]*\bwidth="([\d.]+)"[^>]*\bheight="([\d.]+)"/);
        if (!dimensions) throw new Error(`Missing SVG dimensions: ${source}`);
        const width = requestedWidth || Number(dimensions[1]);
        const height = Math.round(width * Number(dimensions[2]) / Number(dimensions[1]));
        await page.setViewportSize({ width, height });
        await page.goto(pathToFileURL(input).href, { waitUntil: 'load' });
        await page.evaluate(({ width, height }) => {
          const svg = document.documentElement;
          svg.setAttribute('width', String(width));
          svg.setAttribute('height', String(height));
          svg.style.display = 'block';
        }, { width, height });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        input = path.join(scratch, `${filename}.png`);
        await page.screenshot({ path: input, omitBackground: true, animations: 'disabled' });
      }
      const destination = path.join(out, filename);
      const encoded = spawnSync(process.env.PYTHON || 'python', ['-c', convertPython, input, destination, lossless ? 'lossless' : 'lossy'], { encoding: 'utf8', windowsHide: true });
      if (encoded.status !== 0) throw new Error(encoded.stderr || encoded.error || 'Pillow failed');
      const info = JSON.parse(encoded.stdout.trim());
      const data = await fs.readFile(destination);
      const entry = { source: `src/imagens/${source}`, file: `src/imagens/optimized/${filename}`, ...info, bytes: data.length, sourceBytes: (await fs.stat(path.join(images, source))).size, sha256: hash(data), lossless };
      manifest.images.push(entry);
      console.log(`${filename}: ${info.width}x${info.height}, ${data.length} bytes`);
    }
    await browser.close(); browser = null;
    const css = (await download(cssUrl)).toString('utf8');
    await fs.writeFile(path.join(fonts, 'google-fonts-source.css'), css);
    for (const family of ['Montserrat', 'MedievalSharp']) {
      const blocks = [...css.matchAll(/\/\*\s*latin\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)].map(x => x[1]);
      const block = blocks.find(x => x.includes(`font-family: '${family}'`) && x.includes('font-style: normal'));
      if (!block) throw new Error(`No normal latin CSS block for ${family}`);
      const url = block.match(/url\((https:[^)]+)\)/)?.[1];
      const weights = block.match(/font-weight:\s*([^;]+)/)?.[1];
      if (!url || !url.includes('.woff2')) throw new Error(`No WOFF2 for ${family}`);
      if (family === 'Montserrat' && weights !== '400 800') throw new Error(`Expected Montserrat variable 400 800, got ${weights}`);
      const filename = family === 'Montserrat' ? 'montserrat-latin-400-800-normal.woff2' : 'medievalsharp-latin-400-normal.woff2';
      const data = await download(url);
      if (data.toString('ascii', 0, 4) !== 'wOF2') throw new Error(`Invalid WOFF2: ${family}`);
      await fs.writeFile(path.join(fonts, filename), data);
      const licenseUrl = `https://raw.githubusercontent.com/google/fonts/main/ofl/${family.toLowerCase()}/OFL.txt`;
      const license = await download(licenseUrl);
      if (!license.toString().includes('SIL OPEN FONT LICENSE')) throw new Error(`Invalid license: ${family}`);
      const licenseFile = `${family}-OFL.txt`;
      await fs.writeFile(path.join(fonts, licenseFile), license);
      manifest.fonts.push({ family, style: 'normal', subset: 'latin', weights, file: `src/fonts/${filename}`, bytes: data.length, sha256: hash(data), sourceCss: cssUrl, sourceUrl: url, license: `src/fonts/${licenseFile}`, licenseUrl });
      console.log(`${filename}: ${data.length} bytes; normal latin, weights ${weights}`);
    }
    const fontReadme = `# Local font assets\n\nDownloaded from the public Google Fonts CSS endpoint (not replacement fonts).\n\nSource CSS: ${cssUrl}\n\nThe exact returned stylesheet is retained in google-fonts-source.css for provenance, not for importing: its remote URLs include subsets deliberately not downloaded. Only the normal latin WOFF2 blocks are retained locally.\n\n${manifest.fonts.map(f => `## ${f.family}\n\n- File: ${path.basename(f.file)}\n- Style: normal; subset: latin; weight: ${f.weights}${f.family === 'Montserrat' ? ' (variable; includes 400, 600, 700, and 800)' : ''}\n- Download source: ${f.sourceUrl}\n- License: SIL Open Font License 1.1, preserved verbatim in ${path.basename(f.license)}\n- License source: ${f.licenseUrl}\n`).join('\n')}\nReproduce images, font downloads, licenses, and manifest with:\n\n\`node scripts/optimize-assets.cjs\`\n\nRequires installed @playwright/test Chromium and Python with Pillow. No originals are modified. Google Fonts may update its upstream files, so downloaded byte hashes can change on later runs.\n`;
    await fs.writeFile(path.join(fonts, 'README.md'), fontReadme);
    for (const name of originalNames) {
      if (hash(await fs.readFile(path.join(images, name))) !== originalHashes[name]) throw new Error(`Original changed: ${name}`);
    }
    manifest.verification = { originalsUntouched: true, imagesDecodedByPillow: true, imageCount: manifest.images.length, fontCount: manifest.fonts.length, woff2SignaturesValid: true };
    await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log('Verified originals unchanged; manifest saved.');
  } finally {
    if (browser) await browser.close();
    await fs.rm(scratch, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
