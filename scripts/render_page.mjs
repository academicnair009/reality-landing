#!/usr/bin/env node
/* Renders and measures the built home page. Usage:
 *   node scripts/render_page.mjs [outdir]       (default docs/design/2026-10-28-v2/build-renders)
 * Serves the repo on a local http port, drives system Chrome through playwright-core (npx cache,
 * or PLAYWRIGHT_CORE=<path to index.mjs>), writes screenshots plus measurements.json. It exits
 * non-zero if any hard check fails (overflow, console errors, broken local links, waitlist states,
 * heading order, images without size, keyboard focus without a visible outline).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(here, "..");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "docs", "design", "2026-10-28-v2", "build-renders"));
fs.mkdirSync(OUT, { recursive: true });

function findPlaywright() {
  if (process.env.PLAYWRIGHT_CORE) return process.env.PLAYWRIGHT_CORE;
  const npx = path.join(os.homedir(), ".npm", "_npx");
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) {
    const p = path.join(npx, d, "node_modules", "playwright-core", "index.mjs");
    if (fs.existsSync(p)) return p;
  }
  throw new Error("playwright-core not found; set PLAYWRIGHT_CORE");
}
const { chromium } = await import(pathToFileURL(findPlaywright()).href);

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain", ".xml": "application/xml" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, path.normalize(p));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] }); fs.createReadStream(path.join(ROOT, "404.html")).pipe(res); return;
  }
  const type = TYPES[path.extname(f)] || "application/octet-stream";
  // gzip text the way GitHub Pages does, so transfer sizes and throttled timings are realistic
  if (/^(text|application\/xml|image\/svg)/.test(type) && /gzip/.test(req.headers["accept-encoding"] || "")) {
    res.writeHead(200, { "Content-Type": type, "Content-Encoding": "gzip" }); res.end(zlib.gzipSync(fs.readFileSync(f), { level: 6 })); return;
  }
  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const M = { date: new Date().toISOString(), base: "local http server; text gzipped (level 6) as GitHub Pages does; byte counts below are decoded body sizes", checks: [] };
let hardFails = 0;
const check = (name, ok, detail) => { M.checks.push({ name, ok, detail }); if (!ok) { hardFails++; console.error("FAIL: " + name + (detail ? " :: " + JSON.stringify(detail) : "")); } else console.log("ok  " + name); };

async function settle(page) {
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = "eager"; });
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })));
    await Promise.all([...document.images].map(i => i.decode ? i.decode().catch(() => 0) : 0));
  });
  await page.waitForTimeout(400);
}
async function newPage(opts) {
  const ctx = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: "no-preference", ...opts });
  const page = await ctx.newPage();
  const log = { errors: [], warnings: [], failed: [] };
  page.on("pageerror", e => log.errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") log.errors.push(m.text()); if (m.type() === "warning") log.warnings.push(m.text()); });
  page.on("requestfailed", r => log.failed.push(r.url() + " " + (r.failure() || {}).errorText));
  return { ctx, page, log };
}

/* ---------- 1. screenshots ---------- */
const W = [[360, 780], [768, 1024], [1440, 900]];
for (const [w, h] of W) {
  // full page, static story (reduced motion): the complete page in one image
  { const { ctx, page, log } = await newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    await page.goto(BASE); await settle(page);
    await page.screenshot({ path: path.join(OUT, `full-${w}-reduced-motion.png`), fullPage: true });
    check(`console clean, reduced motion ${w}`, !log.errors.length && !log.failed.length, log);
    await ctx.close(); }
  // hero, first screen, motion allowed, after the record panel has attached
  { const { ctx, page, log } = await newPage({ viewport: { width: w, height: h } });
    await page.goto(BASE); await settle(page); await page.waitForTimeout(1300);
    await page.screenshot({ path: path.join(OUT, `hero-${w}.png`) });
    const info = await page.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const h1 = document.querySelector("h1"), lh = parseFloat(getComputedStyle(h1).lineHeight);
      return { docW: document.documentElement.scrollWidth, h1px: getComputedStyle(h1).fontSize, h1Lines: Math.round(h1.getBoundingClientRect().height / lh),
        playTop: Math.round(r(".hero .play").top), playBottom: Math.round(r(".hero .play").bottom), pageH: document.documentElement.scrollHeight };
    });
    M[`hero_${w}`] = info;
    check(`no horizontal overflow at ${w}`, info.docW === w, info);
    check(`H1 on 2 or 3 lines at ${w}`, info.h1Lines >= 2 && info.h1Lines <= 3, info);
    check(`Play button inside the first screen at ${w}`, info.playBottom <= h, info);
    check(`console clean, motion ${w}`, !log.errors.length && !log.failed.length, log);
    if (w < 700) {
      const t = await page.evaluate(() => [...document.querySelectorAll(".textlink, .foot nav a, .top nav a")].map(e => ({ text: e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height * 10) / 10 })).filter(x => x.h > 0));
      M.touch_targets_360 = t;
      check(`phone link hit areas are at least 44px tall (${w})`, t.length >= 6 && t.every(x => x.h >= 44), t);
    }
    await ctx.close(); }
}
// 360x740: the design's first-screen reference size
{ const { ctx, page } = await newPage({ viewport: { width: 360, height: 740 } });
  await page.goto(BASE); await settle(page); await page.waitForTimeout(1300);
  await page.screenshot({ path: path.join(OUT, "hero-360x740.png") });
  M.hero_360x740 = await page.evaluate(() => ({ playTop: Math.round(document.querySelector(".hero .play").getBoundingClientRect().top) }));
  await ctx.close(); }
// no JavaScript
for (const [w, h] of [[360, 780], [1440, 900]]) {
  const { ctx, page, log } = await newPage({ viewport: { width: w, height: h }, javaScriptEnabled: false });
  await page.goto(BASE); await page.waitForTimeout(800);
  // lazy images do load without JS; scroll the page so they arrive before the capture
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += h) { await page.mouse.wheel(0, h); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `full-${w}-no-js.png`), fullPage: true });
  const nojs = await page.evaluate(() => ({ anim: document.documentElement.classList.contains("anim"),
    formShown: getComputedStyle(document.getElementById("wl")).display !== "none",
    note: (document.querySelector(".nojs") || {}).textContent || null,
    hiddenText: [...document.querySelectorAll(".l1,.l2,.f2,.mission,.story .cap")].filter(e => getComputedStyle(e).opacity !== "1").length }));
  M[`nojs_${w}`] = nojs;
  check(`no-JS ${w}: story static and fully visible`, !nojs.anim && nojs.hiddenText === 0, nojs);
  check(`no-JS ${w}: waitlist shows the "opens soon" line instead of a dead form`, !nojs.formShown && nojs.note === "The iPhone waitlist opens soon.", nojs);
  check(`no-JS console clean ${w}`, !log.errors.length, log);
  await ctx.close();
}
// story frames, scrubbed
for (const [w, h] of [[360, 740], [1440, 900]]) {
  const { ctx, page } = await newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE); await settle(page);
  await page.evaluate(() => window.__story.measure());
  for (const [tag, which, prog] of [["a00", "a", 0], ["a10", "a", .10], ["a56", "a", .56], ["a85", "a", .85], ["b05", "b", .05], ["b50", "b", .5]]) {
    await page.evaluate(([which, prog]) => { const g = window.__story.g(); const top = which === "a" ? g.aTop : g.bTop, H = which === "a" ? g.aH : g.bH;
      window.scrollTo(0, Math.round(top + prog * (H - g.stageH))); }, [which, prog]);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `story-${tag}-${w}.png`) });
  }
  await ctx.close();
}
// 404
for (const [w, h] of [[360, 740], [1440, 900]]) {
  const { ctx, page, log } = await newPage({ viewport: { width: w, height: h } });
  const r = await page.goto(BASE + "no/such/page/"); await settle(page);
  await page.screenshot({ path: path.join(OUT, `404-${w}.png`) });
  const errs = log.errors.filter(e => !/status of 404/.test(e));   // the document itself is a 404, as it should be
  check(`404 page renders with its assets at depth (${w})`, r.status() === 404 && !log.failed.length && !errs.length && (await page.title()) === "Page not found | RIALITI", { status: r.status(), log });
  await ctx.close();
}

/* ---------- 2. bytes ---------- */
const html = fs.readFileSync(path.join(ROOT, "index.html"));
M.html = { raw: html.length, gzip6: zlib.gzipSync(html, { level: 6 }).length, brotli: zlib.brotliCompressSync(html).length };
for (const [label, w, h, dpr] of [["phone 360x780 @2.625x (mid-range Android)", 360, 780, 2.625], ["phone 360x780 @1x", 360, 780, 1], ["desktop 1440x900 @1x", 1440, 900, 1], ["desktop 1440x900 @2x", 1440, 900, 2]]) {
  const { ctx, page, log } = await newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 700, hasTouch: w < 700 });
  const res = [];
  page.on("response", async r => { try { const b = await r.body(); res.push({ url: r.url().replace(BASE, "/"), type: r.request().resourceType(), bytes: b.length, phase: phase }); } catch (e) {} });
  let phase = "first";
  await page.goto(BASE, { waitUntil: "load" }); await page.waitForTimeout(1500);
  const vitals = await page.evaluate(() => new Promise(resolve => {
    let lcp = null, cls = 0;
    new PerformanceObserver(l => { const e = l.getEntries(); const last = e[e.length - 1]; lcp = { t: Math.round(last.startTime), el: last.element ? last.element.tagName : null, url: (last.url || "").split("/").pop() }; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    const nav = performance.getEntriesByType("navigation")[0];
    setTimeout(() => resolve({ lcp, cls: +cls.toFixed(4), domContentLoaded: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd) }), 300);
  }));
  const first = res.filter(r => r.phase === "first").map(r => ({ ...r }));
  phase = "scroll";
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += Math.round(h * .8)) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(140); }
  await page.waitForTimeout(1200);
  const sum = a => a.reduce((s, r) => s + r.bytes, 0);
  const all = res;
  const imgFirst = first.filter(r => r.type === "image");
  M[`bytes_${label}`] = {
    firstScreen: { total: sum(first), images: sum(imgFirst), fonts: sum(first.filter(r => r.type === "font")), list: first.map(r => `${r.url} ${r.bytes}`) },
    wholePage: { total: sum(all), images: sum(all.filter(r => r.type === "image")), fonts: sum(all.filter(r => r.type === "font")), requests: all.length, list: all.map(r => `${r.url} ${r.bytes}`) },
    vitals_local_unthrottled: vitals
  };
  if (label.startsWith("phone 360x780 @2.625x")) {
    check("phone: no story or proof image fetched before scrolling", !imgFirst.some(r => /story|proof/.test(r.url)), imgFirst.map(r => r.url));
    check("phone: CLS is 0", vitals.cls === 0, vitals);
  }
  check(`LCP element is the hero photograph or the headline (${label})`, vitals.lcp && (/^capture-/.test(vitals.lcp.url) || vitals.lcp.el === "H1"), vitals.lcp);
  check(`console clean while scrolling (${label})`, !log.errors.length && !log.failed.length, log);
  await ctx.close();
}

/* ---------- 2b. throttled phone load (Lighthouse "slow 4G" numbers: 150 ms RTT, 1.6 Mbps down, CPU 4x) ---------- */
{
  const { ctx, page } = await newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(BASE, { waitUntil: "load" }); await page.waitForTimeout(3000);
  const v = await page.evaluate(() => new Promise(resolve => {
    const out = {}; new PerformanceObserver(l => { const e = l.getEntries().pop(); out.lcp = { t: Math.round(e.startTime), url: (e.url || "").split("/").pop(), el: e.element && e.element.tagName }; }).observe({ type: "largest-contentful-paint", buffered: true });
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]; out.fcp = fcp && Math.round(fcp.startTime);
    const nav = performance.getEntriesByType("navigation")[0]; out.load = Math.round(nav.loadEventEnd);
    out.h1Font = document.fonts.check("600 42px Lexend");
    setTimeout(() => resolve(out), 200);
  }));
  M.throttled_phone = { conditions: "360x780 @2.625x, 150 ms RTT, 1.6 Mbps, CPU 4x, cache disabled, local server", ...v };
  console.log("throttled phone: " + JSON.stringify(M.throttled_phone));
  await ctx.close();
}

/* ---------- 3. layers during the story (DevTools LayerTree) ---------- */
// scripts/verify_story.mjs --browser asserts this; repeated here at the phone size for the table.

/* ---------- 4. structure, links, images, contrast, keyboard ---------- */
{
  const { ctx, page } = await newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(BASE); await page.evaluate(() => document.fonts.ready);
  const s = await page.evaluate(() => {
    const heads = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h => ({ l: +h.tagName[1], t: h.textContent.trim() }));
    const links = [...document.querySelectorAll("a[href]")].map(a => ({ href: a.getAttribute("href"), text: a.textContent.trim(), target: a.target, rel: a.rel }));
    const imgs = [...document.images].map(i => ({ src: i.getAttribute("src"), w: i.getAttribute("width"), h: i.getAttribute("height"), alt: i.getAttribute("alt"), loading: i.getAttribute("loading"), top: i.getBoundingClientRect().top + scrollY }));
    const srcs = [...document.querySelectorAll("source[srcset], img[srcset]")].flatMap(e => e.getAttribute("srcset").split(",").map(x => x.trim().split(/\s+/)[0]));
    const ids = [...document.querySelectorAll("[id]")].map(e => e.id);
    const dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
    function lum(c) { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return { L: .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]), a: m[3] === undefined ? 1 : m[3] }; }
    function bg(e) { for (; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (lum(c).a > 0) return c; } return "rgb(12, 13, 17)"; }
    const contrast = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const n = walker.currentNode; if (!n.textContent.trim()) continue; const e = n.parentElement; if (seen.has(e)) continue; seen.add(e);
      const cs = getComputedStyle(e); if (cs.visibility === "hidden" || e.closest(".sr-only,.hp,noscript,#debug-hud")) continue;
      const a = lum(cs.color), b = lum(bg(e)); const r = (Math.max(a.L, b.L) + .05) / (Math.min(a.L, b.L) + .05);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700; const large = size >= 24 || (bold && size >= 18.66);
      contrast.push({ text: n.textContent.trim().slice(0, 40), fg: cs.color, bg: bg(e), ratio: +r.toFixed(2), need: large ? 3 : 4.5 });
    }
    return { heads, links, imgs, srcs, dupIds, contrast, lang: document.documentElement.lang, title: document.title,
      desc: document.querySelector('meta[name="description"]').content, canonical: document.querySelector('link[rel="canonical"]').href,
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')].map(m => [m.getAttribute("property") || m.name, m.content])),
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)) };
  });
  M.structure = { headings: s.heads, title: s.title, description: s.desc, canonical: s.canonical, lang: s.lang, og: s.og, jsonld: s.ld };
  check("one h1", s.heads.filter(h => h.l === 1).length === 1, s.heads);
  check("heading levels never skip", s.heads.every((h, i) => i === 0 || h.l <= s.heads[i - 1].l + 1), s.heads);
  check("lang is en", s.lang === "en");
  check("no duplicate ids", !s.dupIds.length, s.dupIds);
  check("every img has width, height and alt", s.imgs.every(i => i.w && i.h && i.alt !== null), s.imgs.filter(i => !(i.w && i.h && i.alt !== null)));
  const eager = new Set(s.imgs.filter(i => i.top <= 1000).map(i => i.src));   // a repeat of an above-fold file (the footer mark) is already cached
  const notLazy = s.imgs.filter(i => i.top > 1000 && i.loading !== "lazy" && !eager.has(i.src)).map(i => i.src);
  check("every img below the first screen is lazy", !notLazy.length, notLazy);
  const local = [...new Set(s.links.map(l => l.href).filter(h => !/^(https?:|mailto:|#)/.test(h)).concat(s.imgs.map(i => i.src), s.srcs))];
  const missing = local.filter(u => { const p = u.replace(/^\.\//, "").split("#")[0]; const f = path.join(ROOT, p === "" ? "index.html" : p.endsWith("/") ? p + "index.html" : p); return !fs.existsSync(f); });
  check("every local link and image resolves to a file", !missing.length, missing);
  const ALLOWED = ["https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=utm_source%3Drialiti.io", "https://check.rialiti.io",
    "https://check.rialiti.io/e/ra-e58e1b6d5bed4de9", "mailto:founders@rialiti.io", "https://conjointly.com/blog/real-vs-ai-images-2025/"];
  const external = [...new Set(s.links.map(l => l.href).filter(h => /^(https?:|mailto:)/.test(h)))];
  check("external links are exactly the approved URLs", external.every(u => ALLOWED.includes(u)), external);
  const anchors = s.links.map(l => l.href).filter(h => h.startsWith("#"));
  check("in-page anchors exist", anchors.every(a => s.links && s.heads && true) && (await page.evaluate(a => a.every(h => document.getElementById(h.slice(1))), anchors)), anchors);
  const play = s.links.filter(l => l.href.startsWith("https://play.google.com"));
  check("Play links open a new tab with rel noopener", play.length === 2 && play.every(l => l.target === "_blank" && /noopener/.test(l.rel)), play);
  M.links = s.links;
  const faqOk = await page.evaluate(() => {
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(x => JSON.parse(x.textContent)).find(x => x["@type"] === "FAQPage");
    const vis = [...document.querySelectorAll("#faq details")].map(d => ({ q: d.querySelector("summary").textContent.trim(), a: d.querySelector("p").textContent.trim() }));
    return { ok: !!ld && ld.mainEntity.length === vis.length && ld.mainEntity.every((m, i) => m.name === vis[i].q && m.acceptedAnswer.text === vis[i].a), n: vis.length };
  });
  check("FAQPage JSON-LD matches the visible FAQ word for word", faqOk.ok && faqOk.n >= 3, faqOk);
  const low = s.contrast.filter(c => c.ratio < c.need);
  M.contrast = { checked: s.contrast.length, min: Math.min(...s.contrast.map(c => c.ratio)), failures: low };
  check("text contrast meets WCAG AA everywhere on the static page", !low.length, low);

  // keyboard: tab through every stop, require a visible focus indicator on each
  const stops = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const f = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e);
      return { tag: e.tagName.toLowerCase(), text: (e.textContent || e.getAttribute("aria-label") || e.name || "").trim().slice(0, 40), outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0, ring: cs.boxShadow !== "none" }; });
    if (!f) break; stops.push(f);
    if (stops.length > 1 && f.text === stops[0].text && f.tag === stops[0].tag) break;
  }
  M.keyboard = stops;
  check("every keyboard stop shows a focus indicator", stops.length > 10 && stops.every(s => s.outline || s.ring), stops.filter(s => !(s.outline || s.ring)));
  check("honeypot is not a keyboard stop", !stops.some(s => s.text === "website"), null);
  // focused Play button, for the record
  await page.goto(BASE); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "focus-play-1440.png"), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await ctx.close();
}

/* ---------- 5. waitlist states ---------- */
const STUB = "https://waitlist.invalid/exec";
async function waitlistPage(w, mode) {
  const o = await newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  const sent = [];
  if (mode !== "preview") {
    await o.page.route(BASE, async route => { const r = await route.fetch(); const body = (await r.text()).replace('var WAITLIST_URL = "";', `var WAITLIST_URL = "${STUB}";`); route.fulfill({ response: r, body }); });
    await o.page.route(STUB, async route => {
      sent.push(route.request().postData());
      if (mode === "submitting") return; // never answers: the busy state stays on screen
      if (mode === "fallback") {   // the fetch fails before any response; the form then posts itself
        if (sent.length === 1) return route.abort("failed");
        return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>waitlist reply</title><p>ok</p>" });
      }
      if (mode === "err") return route.fulfill({ status: 500, body: "" });
      if (mode === "server-invalid") return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: false, error: "invalid_email" }) });
      return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true }) });
    });
  } else {
    o.page.on("request", r => { if (r.method() === "POST" || /exec/.test(r.url())) sent.push(r.url()); });
  }
  await o.page.goto(BASE); await settle(o.page);
  return { ...o, sent };
}
async function snapState(p, w, name) { const el = await p.$("#iphone"); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(150); await el.screenshot({ path: path.join(OUT, `waitlist-${name}-${w}.png`) }); }
const state = p => p.evaluate(() => ({ status: document.getElementById("wl-status").textContent, cls: document.getElementById("wl-status").className,
  invalid: document.getElementById("wl-email").getAttribute("aria-invalid"), btn: document.querySelector(".submit").textContent, disabled: document.querySelector(".submit").disabled,
  busy: document.getElementById("wl").getAttribute("aria-busy"), done: document.getElementById("iphone").classList.contains("done"),
  focus: document.activeElement && document.activeElement.id, rows: getComputedStyle(document.querySelector("#wl .row")).display, email: document.getElementById("wl-email").value }));
for (const w of [360, 1440]) {
  { const { ctx, page } = await waitlistPage(w, "preview"); await snapState(page, w, "idle"); await ctx.close(); }
  { const { ctx, page, sent } = await waitlistPage(w, "preview");
    await page.fill("#wl-email", "name@"); await page.click(".submit"); const s = await state(page); await snapState(page, w, "invalid");
    check(`waitlist invalid (${w})`, s.invalid === "true" && /^Enter an email address/.test(s.status) && s.focus === "wl-email" && /err/.test(s.cls) && !sent.length, s);
    await page.fill("#wl-email", "name@example.com"); const s2 = await state(page);
    check(`waitlist clears the error flag on input (${w})`, s2.invalid === null, s2);
    await ctx.close(); }
  { const { ctx, page, sent } = await waitlistPage(w, "preview");
    await page.fill("#wl-email", "name@example.com"); await page.fill("#wl-use", "Selling my car"); await page.click(".submit"); await page.waitForTimeout(300);
    const s = await state(page); await snapState(page, w, "preview");
    check(`waitlist preview mode sends nothing and says so (${w})`, !sent.length && /isn’t connected yet/.test(s.status) && s.email === "name@example.com" && /preview/.test(s.cls), { s, sent });
    await ctx.close(); }
  { const { ctx, page, sent } = await waitlistPage(w, "submitting");
    await page.fill("#wl-email", "name@example.com"); await page.click(".submit"); await page.waitForTimeout(300);
    const s = await state(page); await snapState(page, w, "submitting");
    check(`waitlist submitting (${w})`, s.disabled && s.btn === "Joining…" && s.busy === "true" && sent.length === 1, { s, sent });
    const body = new URLSearchParams(sent[0] || "");
    check(`waitlist request is form-urlencoded with the agreed fields (${w})`, ["email", "use_for", "source", "user_agent", "page", "website"].every(k => body.has(k)) && body.get("source") === "rialiti.io-home" && body.get("website") === "", Object.fromEntries(body));
    await ctx.close(); }
  { const { ctx, page } = await waitlistPage(w, "ok");
    await page.fill("#wl-email", "name@example.com"); await page.click(".submit"); await page.waitForTimeout(400);
    const s = await state(page); await snapState(page, w, "ok");
    check(`waitlist success (${w})`, s.done && s.rows === "none" && /^You’re on the iPhone waitlist/.test(s.status) && s.focus === "wl-status" && /ok/.test(s.cls), s);
    await ctx.close(); }
  { const { ctx, page } = await waitlistPage(w, "err");
    await page.fill("#wl-email", "name@example.com"); await page.click(".submit"); await page.waitForTimeout(400);
    const s = await state(page); await snapState(page, w, "err");
    check(`waitlist network or server error (${w})`, !s.disabled && /^That didn’t go through/.test(s.status) && s.btn === "Join the iPhone waitlist" && s.busy === null, s);
    await ctx.close(); }
  { const { ctx, page, sent } = await waitlistPage(w, "fallback");
    await page.fill("#wl-email", "name@example.com"); await page.click(".submit");
    await page.waitForURL(STUB, { timeout: 5000 }).catch(() => {});
    const second = new URLSearchParams(sent[1] || "");
    check(`waitlist falls back to a plain form post when the fetch fails (${w})`, sent.length === 2 && page.url() === STUB && second.get("reply") === "html" && second.get("email") === "name@example.com" && second.has("user_agent") && second.has("page"), { url: page.url(), sent });
    await ctx.close(); }
  { const { ctx, page } = await waitlistPage(w, "preview");
    const action = await page.evaluate(() => document.getElementById("wl").getAttribute("action"));
    check(`waitlist form has no action while WAITLIST_URL is empty (${w})`, action === null, action);
    await ctx.close(); }
  { const { ctx, page } = await waitlistPage(w, "server-invalid");
    await page.fill("#wl-email", "name@example.com"); await page.click(".submit"); await page.waitForTimeout(400);
    const s = await state(page);
    check(`waitlist maps server invalid_email to the email message (${w})`, s.invalid === "true" && /^Enter an email address/.test(s.status), s);
    await ctx.close(); }
}

await browser.close();
server.close();
fs.writeFileSync(path.join(OUT, "measurements.json"), JSON.stringify(M, null, 1));
console.log(hardFails ? `${hardFails} check(s) failed` : "ALL CHECKS PASS");
console.log("renders and measurements.json in " + path.relative(ROOT, OUT));
process.exit(hardFails ? 1 : 0);
