#!/usr/bin/env node
/* Headless numeric verification of the RIALITI scrollytelling system.
 *
 * Extracts the PURE SCROLL MODEL block out of index.html (the exact shipped
 * code) plus the HERO_CELLS / mosaic constants, then walks scrollY through
 * the full document in BOTH directions on several viewports and asserts:
 *
 *   1. no scroll position during beats 1-7 shows the page without a
 *      substantial photograph (the wipe/flight always keeps one on screen);
 *   2. through the final flight and closing, either a photo or the mosaic
 *      layer is meaningfully visible (never bare black mid-story);
 *   3. at each beat's pin midpoint: exactly that beat's photo is fullscreen
 *      at opacity 1, all earlier photos sit landed on their cells, all later
 *      photos are parked below the viewport at opacity 0;
 *   4. every hero lands EXACTLY on its designated mosaic cell (≤0.5px) and
 *      stays there for the rest of the document;
 *   5. the rising photo's visible top edge tracks its section top to <0.01px
 *      (seamless wipe against the incoming stage);
 *   6. rail letters: flown glyph + slot glyph opacities always sum to 1 once
 *      the letter exists — the swap is a pure crossfade, never a pop;
 *   7. all channels are continuous (no jumps between adjacent scroll steps);
 *   8. the reverse sweep reproduces the forward sweep bit-for-bit.
 *
 * The last configuration is a DYNAMIC-VIEWPORT device case: mobile Chrome
 * with the URL bar collapsed, where window.innerHeight (844, what the JS
 * measures as m.vh) exceeds the 100svh stage/section basis (780, what CSS
 * lays out). The model must stay photo-covered and land exactly under that
 * mismatch; page-top endpoint checks are skipped there (at y=0 the bar is
 * always expanded on a real device, so that state cannot occur).
 *
 * Run: node scripts/verify_scroll.mjs
 */
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

/* ---- extract the shipped pure model ---- */
const mark = html.indexOf("==== PURE SCROLL MODEL");
const start = html.indexOf("*/", mark) + 2;
const end = html.indexOf("/* ==== END PURE SCROLL MODEL");
if (mark < 0 || end < 0) throw new Error("pure-model markers not found in index.html");
const computeFrame = new Function(html.slice(start, end) + "\nreturn computeFrame;")();

/* ---- extract grid constants (single source of truth: the page) ---- */
const cellsMatch = html.match(/var HERO_CELLS = (\[\[[^\]]*\](?:, \[[^\]]*\])*\]);/);
const dimsMatch = html.match(/var MOSAIC_W = (\d+), MOSAIC_H = (\d+), MOSAIC_TILE = (\d+)/);
if (!cellsMatch || !dimsMatch) throw new Error("mosaic constants not found in index.html");
const HERO_CELLS = JSON.parse(cellsMatch[1]);
const [MW, MH, MT] = dimsMatch.slice(1).map(Number);

let failures = 0;
function fail(msg) {
  failures++;
  if (failures <= 30) console.error("FAIL: " + msg);
}

function metricsFor(vw, vh, stageH = vh) {
  const sc = Math.max(vw / MW, vh / MH);
  const dx = (vw - MW * sc) / 2, dy = (vh - MH * sc) / 2;
  return {
    vw, vh,
    cells: HERO_CELLS.map(([c, r]) =>
      ({ x: dx + c * MT * sc, y: dy + r * MT * sc, s: MT * sc })),
    slots: Array.from({ length: 7 }, (_, i) =>
      ({ left: vw / 2 + (i - 3.5) * 34 + 5, top: 18 })),
    flyW: Array(7).fill(vw * 0.45),
    flyH: Array(7).fill(vw * 0.5),
    endScale: 0.12,
    stageH: Array(7).fill(stageH),
  };
}

/* visible box of a photo wrapper (viewport-sized box under its transform) */
function photoBox(ph, m) {
  return { x: ph.x, y: ph.y, w: m.vw * ph.sx, h: m.vh * ph.sy };
}
function viewportCoverage(box, m) {
  const w = Math.max(0, Math.min(box.x + box.w, m.vw) - Math.max(box.x, 0));
  const h = Math.max(0, Math.min(box.y + box.h, m.vh) - Math.max(box.y, 0));
  return (w * h) / (m.vw * m.vh);
}

/* [vw, innerHeight, svh] — svh differs from innerHeight only in the
   dynamic-viewport (URL bar collapsed) device configuration. */
for (const [vw, vh, svhArg] of [[390, 844], [360, 740], [1440, 900], [390, 844, 780]]) {
  const svh = svhArg ?? vh;
  const dyn = svh !== vh;
  console.log(`\n=== viewport ${vw}x${vh}${dyn ? ` (dynamic: stages ${svh}svh)` : ""} ===`);
  const m = metricsFor(vw, vh, svh);
  const secH = [1.75, 1.75, 1.75, 1.75, 1.75, 1.5, 1.5].map(f => f * svh);
  const off = [];
  let acc = svh; // opening section (100svh)
  for (const h of secH) { off.push(acc); acc += h; }
  const offClosing = acc;
  const yMax = offClosing; // closing is 100vh and ends the document

  const frameAt = y => computeFrame(off.map(o => o - y), secH, offClosing - y, m);

  const STEP = 4;
  const ys = [];
  for (let y = 0; y <= yMax; y += STEP) ys.push(y);
  if (ys[ys.length - 1] !== yMax) ys.push(yMax);

  const fwd = ys.map(frameAt);

  /* ---- 8: reverse sweep must be identical ---- */
  const rev = [...ys].reverse().map(frameAt).reverse();
  for (let k = 0; k < ys.length; k++) {
    if (JSON.stringify(fwd[k]) !== JSON.stringify(rev[k])) {
      fail(`reverse sweep differs at y=${ys[k]}`);
      break;
    }
  }

  const pinLen = i => secH[i] - m.stageH[i];
  const photoZoneEnd = off[6] + pinLen(6); // end of beat-7's pin

  for (let k = 0; k < ys.length; k++) {
    const y = ys[k], f = fwd[k];

    /* ---- 1: a substantial photo at every step of beats 1-7 ---- */
    if (y >= off[0] && y <= photoZoneEnd) {
      let cov = 0;
      for (let i = 0; i < 7; i++)
        if (f.photos[i].op >= 0.5) cov = Math.max(cov, viewportCoverage(photoBox(f.photos[i], m), m));
      if (cov < 0.25) fail(`y=${y}: max photo coverage ${cov.toFixed(3)} < 0.25 during beats 1-7`);
    }

    /* ---- 2: final flight / closing — photo or mosaic visible ---- */
    if (y > photoZoneEnd && y <= yMax) {
      let cov = 0;
      for (let i = 0; i < 7; i++)
        if (f.photos[i].op >= 0.4) cov = Math.max(cov, viewportCoverage(photoBox(f.photos[i], m), m));
      if (cov < 0.10 && f.mosaic < 0.15)
        fail(`y=${y}: bare black — photo cov ${cov.toFixed(3)}, mosaic ${f.mosaic.toFixed(3)}`);
    }

    /* ---- 5: rising photo's visible edge tracks its section top ---- */
    for (let i = 0; i < 7; i++) {
      const top = off[i] - y;
      if (top > 0.5 && top < vh - 0.5) {
        const edge = photoBox(f.photos[i], m).y;
        if (Math.abs(edge - top) > 0.01)
          fail(`y=${y}: photo ${i + 1} edge ${edge.toFixed(3)} vs section top ${top.toFixed(3)}`);
        if (f.photos[i].op !== 1) fail(`y=${y}: rising photo ${i + 1} op ${f.photos[i].op} != 1`);
      }
    }

    /* ---- 6: letter presence — fly + slot is a pure crossfade ---- */
    for (let i = 0; i < 7; i++) {
      if (f.p[i] >= 0.16 && Math.abs(f.fly[i].op + f.slot[i].op - 1) > 1e-9)
        fail(`y=${y}: letter ${i + 1} fly+slot = ${(f.fly[i].op + f.slot[i].op).toFixed(4)}`);
    }

    /* ---- 7: continuity vs previous step ---- */
    if (k > 0) {
      const g = fwd[k - 1];
      if (Math.abs(f.mosaic - g.mosaic) > 0.05) fail(`y=${y}: mosaic jump`);
      for (let i = 0; i < 7; i++) {
        const a = f.photos[i], b = g.photos[i];
        /* opacity is binary while parked/entering; only meaningful once the
           photo actually covers screen area (geometry is continuous) */
        const onA = viewportCoverage(photoBox(a, m), m) > 0.02;
        const onB = viewportCoverage(photoBox(b, m), m) > 0.02;
        if ((onA || onB) && Math.abs(a.op - b.op) > 0.15) fail(`y=${y}: photo ${i + 1} opacity jump ${b.op.toFixed(2)}→${a.op.toFixed(2)}`);
        if (Math.abs(a.x - b.x) > 40 || Math.abs(a.y - b.y) > 40) fail(`y=${y}: photo ${i + 1} position jump`);
        if (Math.abs(a.sx - b.sx) > 0.05 || Math.abs(a.sy - b.sy) > 0.05) fail(`y=${y}: photo ${i + 1} scale jump`);
        /* net image scale must stay uniform (no distortion, ever) */
        if (Math.abs(a.sx * a.kx - a.sy * a.ky) > 1e-9) fail(`y=${y}: photo ${i + 1} net image transform not uniform`);
        if (Math.abs(a.kx - b.kx) > 0.05 || Math.abs(a.ky - b.ky) > 0.05) fail(`y=${y}: photo ${i + 1} counter-scale jump`);
      }
      for (let i = 0; i < 7; i++) {
        if (Math.abs(f.slot[i].op - g.slot[i].op) > 0.35) fail(`y=${y}: slot ${i + 1} jump`);
        if (Math.abs(f.fly[i].op - g.fly[i].op) > 0.35) fail(`y=${y}: fly ${i + 1} opacity jump`);
        if (Math.abs(f.fly[i].x - g.fly[i].x) > 40 || Math.abs(f.fly[i].y - g.fly[i].y) > 40)
          fail(`y=${y}: fly ${i + 1} position jump`);
        if (Math.abs(f.copy[i].op - g.copy[i].op) > 0.25) fail(`y=${y}: copy ${i + 1} jump`);
        if (Math.abs(f.scrimOp[i] - g.scrimOp[i]) > 0.15) fail(`y=${y}: scrim ${i + 1} jump`);
      }
    }
  }

  /* ---- 3: state audit at each beat's pin midpoint ---- */
  for (let i = 0; i < 7; i++) {
    const y = off[i] + 0.5 * pinLen(i);
    const f = frameAt(y);
    {
      const ph = f.photos[i];
      if (ph.op !== 1 || ph.x !== 0 || ph.y !== 0 || ph.sx !== 1 || ph.sy !== 1)
        fail(`beat ${i + 1} mid-pin: own photo not fullscreen/opaque`);
    }
    for (let j = 0; j < 7; j++) {
      if (j < i) {
        const box = photoBox(f.photos[j], m), c = m.cells[j];
        if (Math.abs(box.x - c.x) > 0.5 || Math.abs(box.y - c.y) > 0.5 ||
            Math.abs(box.w - c.s) > 0.5 || Math.abs(box.h - c.s) > 0.5)
          fail(`beat ${i + 1} mid-pin: earlier photo ${j + 1} not on its cell`);
        if (Math.abs(f.photos[j].op - f.tileOp) > 1e-9)
          fail(`beat ${i + 1} mid-pin: landed photo ${j + 1} opacity != tileOp`);
      } else if (j > i) {
        if (f.photos[j].op !== 0) fail(`beat ${i + 1} mid-pin: later photo ${j + 1} visible (op ${f.photos[j].op})`);
        if (photoBox(f.photos[j], m).y < vh - 0.01) fail(`beat ${i + 1} mid-pin: later photo ${j + 1} inside viewport`);
      }
    }
    for (let j = 0; j < 7; j++) {
      const want = j < i ? 1 : 0; // own slot not yet locked at p=0.5
      if (Math.abs(f.slot[j].op - want) > 1e-9)
        fail(`beat ${i + 1} mid-pin: slot ${j + 1} opacity ${f.slot[j].op} != ${want}`);
    }
  }

  /* ---- 4: exact landings, then permanence to document end ---- */
  for (let i = 0; i < 7; i++) {
    for (const y of [off[i] + pinLen(i) + m.stageH[i], yMax]) {
      const f = frameAt(y);
      const box = photoBox(f.photos[i], m), c = m.cells[i];
      const err = Math.max(Math.abs(box.x - c.x), Math.abs(box.y - c.y),
                           Math.abs(box.w - c.s), Math.abs(box.h - c.s));
      if (err > 0.5) fail(`photo ${i + 1} at y=${Math.round(y)}: landing error ${err.toFixed(3)}px`);
    }
  }

  /* ---- endpoints (page-top checks skipped for the dynamic config —
          at y=0 a real device always has the URL bar expanded) ---- */
  const f0 = frameAt(0), fEnd = frameAt(yMax);
  if (!dyn) {
    if (f0.mosaic !== 0) fail(`y=0: mosaic ${f0.mosaic} != 0`);
    if (f0.photos.some(p => p.op !== 0)) fail("y=0: a photo is visible over the opening");
    if (f0.slot.some(s => s.op !== 0)) fail("y=0: a rail letter is visible at the top");
  }
  if (Math.abs(fEnd.mosaic - 0.62) > 1e-9) fail(`yMax: mosaic ${fEnd.mosaic} != 0.62`);
  if (fEnd.tileOp !== 1) fail(`yMax: tileOp ${fEnd.tileOp} != 1`);
  if (fEnd.slot.some(s => s.op !== 1)) fail("yMax: rail letters incomplete");
  const cl = fEnd.closing;
  if (cl.mission !== 1 || cl.headline !== 1 || cl.block !== 1 || cl.footer !== 1)
    fail("yMax: closing reveal incomplete");

  console.log(failures ? "…failures so far: " + failures : "all assertions passed");
}

console.log(failures ? `\n${failures} FAILURES` : "\nOK — full scroll path verified in both directions on all viewports");
process.exit(failures ? 1 : 0);
