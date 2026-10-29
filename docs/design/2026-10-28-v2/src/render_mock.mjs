// Renders the design reference build. Usage: node render_mock.mjs <outdir>
// Needs system Chrome and the cached playwright-core (see README in design.md "Re-render").
import os from 'node:os'; import fsx from 'node:fs'; import pathx from 'node:path'; import { pathToFileURL } from 'node:url';
const PW = process.env.PLAYWRIGHT_CORE || (() => { const d = pathx.join(os.homedir(), '.npm', '_npx'); for (const x of fsx.readdirSync(d)) { const p = pathx.join(d, x, 'node_modules', 'playwright-core', 'index.mjs'); if (fsx.existsSync(p)) return p; } })();
const { chromium } = await import(pathToFileURL(PW).href);
import path from 'node:path'; import fs from 'node:fs';
const here = path.dirname(new URL(import.meta.url).pathname);
const outdir = process.argv[2] || path.join(here, '..', '..', '..', '..', 'assets', 'v2', 'reference');
fs.mkdirSync(outdir, { recursive: true });
const mock = 'file://' + path.join(here, 'mock', 'index.html');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const jobs = [
  ['home-360-full.png', 360, 780, '', true],
  ['home-360-first-screen.png', 360, 740, '', false],
  ['home-768-full.png', 768, 1024, '', true],
  ['home-1440-full.png', 1440, 900, '', true],
  ['home-1440-first-screen.png', 1440, 900, '', false],
];
const report = [];
async function eager(p) {
  await p.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await p.waitForTimeout(1500);
}
for (const [name, w, h, q, full] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await p.goto(mock + q); await eager(p);
  const info = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
    const lines = s => { const e = document.querySelector(s); const lh = parseFloat(getComputedStyle(e).lineHeight); return Math.round(e.getBoundingClientRect().height / lh); };
    const overflow = [...document.querySelectorAll('body *')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible' && !['svg','path','PICTURE'].includes(e.tagName) && e.children.length === 0).map(e => e.tagName + '.' + e.className + ':' + e.textContent.slice(0, 30));
    return { docW: document.documentElement.scrollWidth, h1: r('h1'), h1_px: getComputedStyle(document.querySelector('h1')).fontSize, h1_lines: lines('h1'),
      play: r('.hero .play'), fig: r('.hero-fig'), stack: r('.stack'), hero_bottom: r('.hero')[1] + r('.hero')[3], pageH: document.documentElement.scrollHeight, overflow };
  });
  report.push({ name, w, ...info });
  await p.screenshot({ path: path.join(outdir, name), fullPage: full });
  await p.close();
}
for (const st of ['idle', 'submitting', 'ok', 'preview', 'err', 'invalid']) {
  for (const w of [360, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await p.goto(mock + (st === 'idle' ? '' : '?state=' + st)); await p.evaluate(() => document.fonts.ready);
    const el = await p.$('#iphone'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(100);
    await el.screenshot({ path: path.join(outdir, `waitlist-${st}-${w}.png`) });
    await p.close();
  }
}
// story frames in scroll-scrubbed mode (motion allowed), at chosen progress values
for (const [w, h] of [[360, 740], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await p.goto(mock); await eager(p);
  await p.evaluate(() => window.__story.measure());
  for (const [tag, which, prog] of [['a10', 'a', .10], ['a56', 'a', .56], ['a85', 'a', .85], ['b50', 'b', .5]]) {
    await p.evaluate(([which, prog]) => { const g = window.__story.g(); const top = which === 'a' ? g.aTop : g.bTop, H = which === 'a' ? g.aH : g.bH; window.scrollTo(0, Math.round(top + prog * (H - g.stageH))); window.__story.apply(); }, [which, prog]);
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(outdir, `story-${tag}-${w}.png`) });
  }
  await p.close();
}
fs.writeFileSync(path.join(outdir, 'render-report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await b.close();
