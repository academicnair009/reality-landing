// Renders and verifies the guide pages. Usage, from the repo root, with a static
// server on the repo root (python3 -m http.server 8765 --bind 127.0.0.1):
//   PATH=$HOME/.nvm/versions/node/v22.18.0/bin:$PATH node docs/design/2026-10-28-guides/src/render_guides.mjs used-cars [more slugs]
// Writes screenshots to docs/design/2026-10-28-guides/renders/ and prints a JSON report.
import { chromium } from '/Users/ashishnair/.npm/_npx/da7caeae9db9c589/node_modules/playwright-core/index.mjs';
import path from 'node:path'; import fs from 'node:fs';
const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, '..', 'renders');
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ['used-cars'];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const report = {};

async function settle(p) {
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(i => i.offsetParent !== null && (i.loading !== 'lazy' || i.getBoundingClientRect().top < innerHeight)).map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await p.waitForTimeout(400);
}
async function eagerAll(p) {
  await p.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    await Promise.all([...document.images].filter(i => i.offsetParent !== null).map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); })));
  });
}
const barState = p => p.evaluate(() => {
  const g = document.getElementById('getbar'); const cs = getComputedStyle(g); const r = g.getBoundingClientRect();
  return { visible: cs.opacity === "1" && r.top < innerHeight && r.bottom > 0, top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), transition: cs.transitionDuration };
});

for (const slug of slugs) {
  const url = `${BASE}/guides/${slug}/`;
  const R = report[slug] = { url };

  // ---- 360x780 phone: top, middle (reading, bar visible), bottom; plus measurements
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    const errors = [], failed = [], bytes = {};
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('requestfailed', r => failed.push(r.url()));
    p.on('response', async r => { try { const buf = await r.body(); bytes[r.url()] = { status: r.status(), bytes: buf.length, type: r.request().resourceType() }; } catch { } });
    await p.goto(url, { waitUntil: 'load' }); await settle(p);
    const aboveFoldImgs = Object.entries(bytes).filter(([u, v]) => v.type === 'image').map(([u, v]) => ({ u: u.replace(BASE, ''), bytes: v.bytes }));
    R.phone_first_load = { requests: Object.keys(bytes).length, total_bytes: Object.values(bytes).reduce((a, v) => a + v.bytes, 0), images_loaded_at_load: aboveFoldImgs,
      files: Object.entries(bytes).map(([u, v]) => `${v.status} ${v.bytes} ${u.replace(BASE, '')}`) };
    R.phone_top = await p.evaluate(() => {
      const r = s => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
      return { docW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight,
        hook_px: getComputedStyle(document.querySelector('.hook-n')).fontSize, h1: r('h1'), hero_play: r('.actions .play'),
        h1_count: document.querySelectorAll('h1').length,
        headings: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName + ' ' + h.textContent.trim().slice(0, 50)) };
    });
    R.phone_bar_at_top = await barState(p);
    await p.screenshot({ path: path.join(out, `${slug}-360-top.png`) });
    // middle: scroll to the seller steps
    await p.evaluate(() => { const e = document.querySelector('.role'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 80); });
    await p.waitForTimeout(600);
    R.phone_bar_mid = await barState(p);
    await p.screenshot({ path: path.join(out, `${slug}-360-middle.png`) });
    await p.evaluate(() => { const e = (document.querySelector('.check') || document.querySelector('.bullets') || document.querySelector('#faq')).closest('section'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 40); });
    await p.waitForTimeout(600);
    R.phone_bar_checklist = await barState(p);
    await p.screenshot({ path: path.join(out, `${slug}-360-checklist.png`) });
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(600);
    R.phone_bar_bottom = await barState(p);
    await p.screenshot({ path: path.join(out, `${slug}-360-bottom.png`) });
    await eagerAll(p); await p.waitForTimeout(300);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, `${slug}-360-full.png`), fullPage: true });
    // bottom padding: last footer line must be above the bar when the bar is forced on
    R.phone_bar_clear_of_footer = await p.evaluate(() => {
      document.getElementById('getbar').classList.add('is-on'); window.scrollTo(0, document.documentElement.scrollHeight);
      const legal = document.querySelector('.legal').getBoundingClientRect(); const bar = document.getElementById('getbar').getBoundingClientRect();
      return { legal_bottom: Math.round(legal.bottom), bar_top: Math.round(bar.top), clear: legal.bottom <= bar.top };
    });
    R.total_after_all_images = Object.values(bytes).reduce((a, v) => a + v.bytes, 0);
    R.console = errors; R.failed_requests = failed;
    R.links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href))]);
    R.play_hrefs_no_param = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[data-play]')].map(a => a.href))]);
    R.play_count = await p.evaluate(() => document.querySelectorAll('a[data-play]').length);
    await ctx.close();
  }
  // ---- Play URL for ?c=uk-a, ?c=BAD, ?c= (empty)
  for (const q of ['?c=uk-a', '?c=Bad%20Cell', '?c=']) {
    const p = await b.newPage(); await p.goto(url + q);
    R['play_hrefs' + q] = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[data-play]')].map(a => a.getAttribute('href')))]);
    await p.close();
  }
  // ---- tablet and desktop
  for (const [w, h] of [[768, 1024], [1440, 900]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(url); await settle(p);
    R[`top_${w}`] = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight,
      hook_px: getComputedStyle(document.querySelector('.hook-n')).fontSize, h1_px: getComputedStyle(document.querySelector('h1')).fontSize }));
    await p.screenshot({ path: path.join(out, `${slug}-${w}-top.png`) });
    await p.evaluate(() => { const e = document.querySelector('.role'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 100); });
    await p.waitForTimeout(600);
    R[`bar_mid_${w}`] = await barState(p);
    await p.screenshot({ path: path.join(out, `${slug}-${w}-middle.png`) });
    // card overlap check on desktop: the card must not cover article text
    if (w === 1440) R.card_overlaps_article = await p.evaluate(() => {
      const c = document.getElementById('getbar').getBoundingClientRect(); const col = document.querySelector('.col').getBoundingClientRect();
      return { card_left: Math.round(c.left), col_right: Math.round(col.right), overlap: c.left < col.right };
    });
    await eagerAll(p); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, `${slug}-${w}-full.png`), fullPage: true });
    await p.close();
  }
  // ---- no JS: bar shown, all content present
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, javaScriptEnabled: false, deviceScaleFactor: 2 });
    const p = await ctx.newPage(); await p.goto(url); await settle(p);
    R.nojs_bar_at_top = await barState(p);
    R.nojs_text_len = await p.evaluate(() => document.body.innerText.length);
    R.nojs_play_href = await p.evaluate(() => document.querySelector('a[data-play]').getAttribute('href'));
    await p.evaluate(() => { const e = document.querySelector('.role'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 80); });
    await p.screenshot({ path: path.join(out, `${slug}-360-nojs-middle.png`) });
    await ctx.close();
    const p2 = await b.newPage({ viewport: { width: 360, height: 780 } }); await p2.goto(url); await settle(p2);
    R.js_text_len = await p2.evaluate(() => document.body.innerText.length); await p2.close();
  }
  // ---- reduced motion: the bar appears with no transition
  {
    const p = await b.newPage({ viewport: { width: 360, height: 780 }, reducedMotion: 'reduce' }); await p.goto(url); await settle(p);
    await p.evaluate(() => { const e = document.querySelector('.role'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 80); });
    await p.waitForTimeout(50);
    R.reduced_motion = await p.evaluate(() => {
      const g = document.getElementById('getbar'); const cs = getComputedStyle(g);
      return { visible_after_50ms: cs.opacity === '1', transitionDuration: cs.transitionDuration, transform: cs.transform,
        animations: document.getAnimations().length };
    });
    await p.screenshot({ path: path.join(out, `${slug}-360-reduced-motion-middle.png`) });
    await p.close();
  }
  // ---- keyboard: tab through the page, the bar's button must be reachable and nothing traps focus
  {
    const p = await b.newPage({ viewport: { width: 360, height: 780 } }); await p.goto(url); await settle(p);
    const seq = [];
    for (let i = 0; i < 60; i++) {
      await p.keyboard.press('Tab');
      const f = await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'BODY'; const inBar = !!a.closest('#getbar');
        const r = a.getBoundingClientRect(); const bar = document.getElementById('getbar').getBoundingClientRect(); const barOn = getComputedStyle(document.getElementById('getbar')).opacity === '1';
        return (inBar ? 'BAR:' : '') + (a.textContent.trim() || a.name || a.tagName).slice(0, 28) + ((!inBar && barOn && r.bottom > bar.top && r.top < bar.bottom) ? ' [UNDER BAR]' : ''); });
      seq.push(f);
      if (f === 'BODY' && i > 2) break;
    }
    R.keyboard = { tab_sequence: seq, bar_reached: seq.some(s => s.startsWith('BAR:')), obscured: seq.filter(s => s.includes('UNDER BAR')) };
    await p.close();
  }
}
await b.close();
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
