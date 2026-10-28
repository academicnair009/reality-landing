// OG image + 404 reference renders. Usage: node render_extra.mjs
import { chromium } from '/Users/ashishnair/.npm/_npx/da7caeae9db9c589/node_modules/playwright-core/index.mjs';
import path from 'node:path'; import fs from 'node:fs';
const here = path.dirname(new URL(import.meta.url).pathname);
const assets = path.join(here, '..', '..', '..', '..', 'assets', 'v2');
const b = await chromium.launch({ channel: 'chrome', headless: true });
async function shot(file, w, h, out) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(here, file));
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))); });
  await p.waitForTimeout(400);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await p.screenshot({ path: out }); await p.close();
}
await shot('og.html', 1200, 630, path.join(assets, 'og', 'og-1200x630.png'));
await shot('404/index.html', 360, 740, path.join(assets, 'reference', '404-360.png'));
await shot('404/index.html', 1440, 900, path.join(assets, 'reference', '404-1440.png'));
await b.close();
