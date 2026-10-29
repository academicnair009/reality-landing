// Renders a guide OG card: node render_og.mjs <slug>  (source: og-<slug>.html next to this file)
import { chromium } from '/Users/ashishnair/.npm/_npx/da7caeae9db9c589/node_modules/playwright-core/index.mjs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const slug = process.argv[2] || 'used-cars';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto('file://' + path.join(here, `og-${slug}.html`));
await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))); });
await p.screenshot({ path: path.join(here, '..', '..', '..', '..', 'assets', 'guides', slug, 'og-1200x630.png') });
await b.close();
