#!/usr/bin/env node
/* Verifier for the home page story (v2, 2026-10-28). Replaces scripts/verify_scroll.mjs, which
 * verified the retired seven-beat letter-rail story.
 *
 *   node scripts/verify_story.mjs              model checks (pure Node, no browser)
 *   node scripts/verify_story.mjs --browser    model checks, then the real page in headless Chrome
 *
 * PART 1, the model. Extracts the code between the two PURE SCROLL MODEL markers in index.html
 * (the exact shipped code) and runs it in a sandbox with no DOM. For a phone, a phone with the
 * URL bar collapsed (innerHeight > 100svh stage) and a desktop, it walks scrollY through the
 * story in 7 px steps, DOWN and then UP, and asserts:
 *   1. purity: each position gives identical output in both directions
 *   2. ranges: every opacity is within [0, 1]
 *   3. continuity: no channel jumps more than 0.15 between adjacent 7 px steps (no pops)
 *   4. no text collision: line 1 and line 2 are never both above 0.02; the two credits likewise
 *   5. compositor: the altered photograph is promoted (turnLive) only while it is mid-fade,
 *      never while parked at 0 or settled at 1, and it is the only promotable element
 *   6. order and end states: nothing extra at the top of section A; line 1 shown early; at the
 *      end of A the altered photograph and line 2 are fully in and line 1 is gone; the mission
 *      line is fully in by the middle of section B
 * It then mutates the model (line 2 starts at 30 percent) and requires the checks to fail, so a
 * passing run means the checks can bite.
 *
 * PART 2, the page (--browser). Serves the repo on a local http port, loads the page in headless Chrome at 360x740 and
 * 1440x900, measures the real layout, scrolls the story DOWN then UP in 1/40 steps of its travel,
 * and at every stop reads the computed opacities from the DOM and asserts they equal the model
 * (within the 0.001 write rounding) in both directions, that the altered raster is
 * visibility: hidden whenever it is parked, that will-change is set only while it moves, and,
 * through the Chrome DevTools LayerTree, that no stop has more than two promoted layers of
 * a quarter screen or more on screen at once (the brief's compositor rule). Needs system Chrome and
 * playwright-core (found in the npx cache, or set PLAYWRIGHT_CORE to its index.mjs).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import http from "node:http";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname);
const pagePath = path.join(here, "..", "index.html");
const html = fs.readFileSync(pagePath, "utf8");
const MARK = /\/\* =+ PURE SCROLL MODEL =+[\s\S]*?\*\/([\s\S]*?)\/\* =+ END PURE SCROLL MODEL =+ \*\//;
const m = html.match(MARK);
if (!m) { console.error("FAIL: PURE SCROLL MODEL markers not found in index.html"); process.exit(1); }
if ((html.match(/PURE SCROLL MODEL =/g) || []).length !== 2) { console.error("FAIL: expected exactly one pair of model markers"); process.exit(1); }

function load(code) {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(code + "\nthis.storyFrame = storyFrame;", ctx);
  return ctx.storyFrame;
}

const CH = ["l1", "cap1", "turn", "cap2", "l2", "mission"];
const CONFIGS = [["phone 740", 740, 740], ["phone, URL bar collapsed", 800, 740], ["desktop 900", 900, 900]];

function checkModel(storyFrame, quiet) {
  let fails = 0;
  const fail = msg => { fails++; if (!quiet && fails <= 30) console.error("FAIL: " + msg); };
  const lines = [];
  for (const [label, vh, stageH] of CONFIGS) {
    const aTop = 6000, aH = 3 * stageH, bTop = aTop + aH, bH = 1.9 * stageH;
    const g = { aTop, aH, bTop, bH, stageH };
    const ys = []; for (let y = aTop - 2 * vh; y <= bTop + bH + vh; y += 7) ys.push(y);
    const down = ys.map(y => JSON.stringify(storyFrame(y, g)));
    const up = ys.slice().reverse().map(y => JSON.stringify(storyFrame(y, g))).reverse();
    let diff = 0; down.forEach((d, i) => { if (d !== up[i]) diff++; });
    if (diff) fail(`${label}: ${diff} positions differ between the down and up passes`);
    let prev = null, live = 0;
    for (const y of ys) {
      const f = storyFrame(y, g);
      for (const k of CH) if (!(f[k] >= 0 && f[k] <= 1)) fail(`${label}: ${k}=${f[k]} out of range at y=${y}`);
      if (prev) for (const k of CH) if (Math.abs(f[k] - prev[k]) > .15) fail(`${label}: ${k} jumps ${prev[k].toFixed(3)} -> ${f[k].toFixed(3)} at y=${y}`);
      if (f.l1 > .02 && f.l2 > .02) fail(`${label}: line 1 and line 2 overlap at y=${y}`);
      if (f.cap1 > .02 && f.cap2 * f.turn > .02) fail(`${label}: the two credits overlap at y=${y}`);
      if (f.turnLive) live++;
      if (f.turnLive && (f.turn === 0 && f.pa < .4 || f.turn === 1 && f.pa > .7)) fail(`${label}: promoted while parked at y=${y}`);
      if (!f.turnLive && f.turn > 0 && f.turn < 1) fail(`${label}: altered photo moving (turn=${f.turn.toFixed(3)}) without will-change at y=${y}`);
      prev = f;
    }
    const s0 = storyFrame(aTop, g), s1 = storyFrame(aTop + aH - stageH, g);
    if (s0.turn !== 0 || s0.l2 !== 0 || s0.l1 !== 0 || s0.cap1 !== 1) fail(`${label}: wrong state at the start of section A`);
    if (s1.turn !== 1 || s1.l2 !== 1 || s1.l1 !== 0 || s1.cap1 !== 0 || s1.cap2 !== 1) fail(`${label}: end state of section A not reached`);
    if (storyFrame(aTop + .1 * (aH - stageH), g).l1 < .5) fail(`${label}: line 1 not shown early in section A`);
    if (storyFrame(bTop + .5 * (bH - stageH), g).mission !== 1) fail(`${label}: mission not fully shown by the middle of section B`);
    if (storyFrame(bTop - 1, g).mission !== 0) fail(`${label}: mission visible before section B`);
    lines.push(`ok  ${label}: ${ys.length} positions, down == up, ranges, continuity, no overlaps, will-change only mid-fade (${live} live stops)`);
  }
  return { fails, lines };
}

/* ---------------- PART 1 ---------------- */
const real = checkModel(load(m[1]), false);
real.lines.forEach(l => console.log(l));
if (real.fails) { console.error(`${real.fails} model failure(s)`); process.exit(1); }
const mutated = checkModel(load(m[1].replace("l2: smooth(pa, .66, .78)", "l2: smooth(pa, .30, .42)")), true);
if (m[1].indexOf("l2: smooth(pa, .66, .78)") < 0) console.log("note: mutation anchor not found (line 2 timing changed); update the mutation in this file");
else if (!mutated.fails) { console.error("FAIL: a mutated model (line 2 at 30 percent) still passes; the checks do not bite"); process.exit(1); }
else console.log(`ok  mutation test: a model with line 2 moved to 30 percent fails ${mutated.fails} checks`);
console.log("MODEL PASS");

/* ---------------- PART 2 ---------------- */
if (!process.argv.includes("--browser")) process.exit(0);

function findPlaywright() {
  if (process.env.PLAYWRIGHT_CORE) return process.env.PLAYWRIGHT_CORE;
  const npx = path.join(os.homedir(), ".npm", "_npx");
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) {
    const p = path.join(npx, d, "node_modules", "playwright-core", "index.mjs");
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/* Promoted layers of at least a quarter of the viewport whose element is on screen. The root
   scroller (the document itself) is not a promoted layer and is skipped. A layer that cannot be
   mapped to an element counts as on screen, so the check errs strict. */
async function bigLayersOnScreen(cdp, layers, w, h) {
  const out = [];
  for (const l of layers) {
    if (!l.drawsContent || l.invisible || l.width * l.height < .25 * w * h) continue;
    let name = "unmapped layer", on = true;
    if (l.backendNodeId) {
      try {
        const { object } = await cdp.send("DOM.resolveNode", { backendNodeId: l.backendNodeId });
        const { result } = await cdp.send("Runtime.callFunctionOn", { objectId: object.objectId, returnByValue: true,
          functionDeclaration: "function () { var e = this.nodeType === 1 ? this : this.parentElement; if (e === document.documentElement || this.nodeType === 9) return null; var r = e.getBoundingClientRect(); return { n: e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).trim().replace(/\\s+/g, '.') : ''), t: r.top, b: r.bottom }; }" });
        if (result.value === null) continue;
        if (result.value) { name = result.value.n; on = result.value.b > 0 && result.value.t < h; }
      } catch (e) { /* pseudo-element or detached node: counted */ }
    } else continue;   /* no node: the document's own root layers */
    if (on) out.push(name);
  }
  return out;
}

const pw = findPlaywright();
if (!pw) { console.error("FAIL: --browser needs playwright-core (set PLAYWRIGHT_CORE)"); process.exit(1); }
const { chromium } = await import(pathToFileURL(pw).href);
/* Serve the repo over http (as GitHub Pages does): file:// blocks the crossorigin font preload. */
const ROOT = path.join(here, "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".md": "text/markdown; charset=utf-8" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, path.normalize(p));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const pageUrl = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
let bfails = 0;
const bfail = msg => { bfails++; if (bfails <= 30) console.error("FAIL: " + msg); };

for (const [w, h] of [[360, 740], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  await page.goto(pageUrl);
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = "eager"; });
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  const cdp = await ctx.newCDPSession(page);
  let layers = [];
  cdp.on("LayerTree.layerTreeDidChange", e => { if (e.layers) layers = e.layers; });
  await cdp.send("LayerTree.enable");
  await cdp.send("DOM.getDocument");
  const anim = await page.evaluate(() => document.documentElement.classList.contains("anim"));
  if (!anim) { bfail(`${w}: html.anim not set with motion allowed`); continue; }
  await page.evaluate(() => window.__story.measure());
  const g = await page.evaluate(() => window.__story.g());
  const ys = [];
  const travelA = g.aH - g.stageH, travelB = g.bH - g.stageH;
  for (let i = -4; i <= 40; i++) ys.push(Math.round(g.aTop + i / 40 * travelA));
  for (let i = 1; i <= 40; i++) ys.push(Math.round(g.bTop + i / 40 * travelB));
  const sweep = ys.concat(ys.slice().reverse());
  const seen = {};
  let maxBig = 0, maxBigAt = null, maxBigWhat = "", stops = 0;
  for (const y of sweep) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const s = await page.evaluate(() => {
      const q = sel => document.querySelector(sel), op = sel => +getComputedStyle(q(sel)).opacity;
      return { y: window.pageYOffset, f: window.__story.frame(),
        dom: { l1: op(".l1"), cap1: op(".f1 figcaption"), turn: op(".f2"), cap2: op(".f2 figcaption"), l2: op(".l2"), mission: op(".mission") },
        vis: getComputedStyle(q(".f2 picture")).visibility, wc: getComputedStyle(q(".f2")).willChange };
    });
    stops++;
    for (const k of Object.keys(s.dom)) {
      const want = s.f[k], got = s.dom[k];
      if (Math.abs(got - want) > .0011) bfail(`${w}x${h} y=${s.y}: ${k} DOM ${got} != model ${want.toFixed(4)}`);
    }
    if (s.f.turn === 0 && s.vis !== "hidden") bfail(`${w}x${h} y=${s.y}: parked altered raster is ${s.vis}`);
    if (s.f.turn > 0 && s.vis !== "visible") bfail(`${w}x${h} y=${s.y}: altered raster hidden while showing`);
    if ((s.wc === "opacity") !== s.f.turnLive) bfail(`${w}x${h} y=${s.y}: will-change=${s.wc} but turnLive=${s.f.turnLive}`);
    const key = s.y, sig = JSON.stringify(s.dom) + s.vis + s.wc;
    if (seen[key] !== undefined && seen[key] !== sig) bfail(`${w}x${h} y=${s.y}: DOM differs between down and up`);
    seen[key] = sig;
    const big = await bigLayersOnScreen(cdp, layers, w, h);
    if (big.length > maxBig) { maxBig = big.length; maxBigAt = s.y; maxBigWhat = big.join(", "); }
    if (big.length > 2) bfail(`${w}x${h} y=${s.y}: ${big.length} promoted layers of a quarter screen or more on screen: ${big.join(", ")}`);
  }
  if (errors.length) bfail(`${w}x${h}: console errors: ${errors.join(" | ")}`);
  console.log(`ok  page ${w}x${h}: ${stops} stops down then up, DOM == model, parked raster hidden, will-change only mid-fade, max ${maxBig} large promoted layers on screen (at y=${maxBigAt}: ${maxBigWhat})`);
  await ctx.close();
}
await browser.close();
server.close();
if (bfails) { console.error(`${bfails} page failure(s)`); process.exit(1); }
console.log("PAGE PASS");
