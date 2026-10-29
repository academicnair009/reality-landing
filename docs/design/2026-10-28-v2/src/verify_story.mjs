// Reference verifier for the v2 story's PURE SCROLL MODEL (replaces scripts/verify_scroll.mjs once
// the seven-beat story is gone). Usage: node verify_story.mjs [path/to/index.html]
// Extracts the block between the two "PURE SCROLL MODEL" markers, runs it headlessly, and asserts:
//  1. purity: the same scrollY gives identical output walking down and walking up
//  2. ranges: every opacity is within [0, 1]
//  3. order: at the top of section A nothing shows; at its end the altered photo and line 2 are fully in
//  4. no text collision: line 1 and line 2 are never both above 0.02; caption 1 and caption 2 likewise
//  5. compositor: at most one promoted layer (the altered photo), and only while it is mid-fade
//  6. dynamic viewport: geometry measured with a taller stage (URL bar collapsed) keeps 1 to 5 true
//  7. the mission line reaches 1 before section B's sticky travel ends
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const here = path.dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || path.join(here, 'mock', 'index.html');
const src = fs.readFileSync(file, 'utf8');
const m = src.match(/\/\* =+ PURE SCROLL MODEL =+[\s\S]*?\*\/([\s\S]*?)\/\* =+ END PURE SCROLL MODEL =+ \*\//);
if (!m) { console.error('FAIL: PURE SCROLL MODEL markers not found'); process.exit(1); }
const ctx = {}; vm.createContext(ctx); vm.runInContext(m[1] + '\nthis.storyFrame = storyFrame;', ctx);
const storyFrame = ctx.storyFrame;
let fails = 0; const fail = msg => { fails++; console.error('FAIL: ' + msg); };

for (const [label, vh, stageH] of [['phone 740', 740, 740], ['phone URL bar collapsed', 800, 740], ['desktop 900', 900, 900]]) {
  const aTop = 6000, aH = 3 * stageH, bTop = aTop + aH, bH = 1.9 * stageH;
  const g = { aTop, aH, bTop, bH, stageH };
  const ys = []; for (let y = aTop - 2 * vh; y <= bTop + bH + vh; y += 7) ys.push(y);
  const down = ys.map(y => JSON.stringify(storyFrame(y, g)));
  const up = ys.slice().reverse().map(y => JSON.stringify(storyFrame(y, g))).reverse();
  if (down.some((d, i) => d !== up[i])) fail(`${label}: output differs between down and up passes`);
  let maxLive = 0;
  for (const y of ys) {
    const f = storyFrame(y, g);
    for (const k of ['l1', 'turn', 'l2', 'cap1', 'cap2', 'mission']) if (!(f[k] >= 0 && f[k] <= 1)) fail(`${label}: ${k}=${f[k]} out of range at y=${y}`);
    if (f.l1 > .02 && f.l2 > .02) fail(`${label}: line 1 and line 2 overlap at y=${y}`);
    if (f.cap1 > .02 && f.cap2 * f.turn > .02) fail(`${label}: captions overlap at y=${y}`);
    const live = f.turnLive ? 1 : 0; maxLive = Math.max(maxLive, live);
    if (f.turnLive && (f.turn === 0 && f.pa < .4 || f.turn === 1 && f.pa > .7)) fail(`${label}: promoted while parked at y=${y}`);
  }
  if (maxLive > 1) fail(`${label}: more than one promoted layer`);
  const s0 = storyFrame(aTop, g), s1 = storyFrame(aTop + aH - stageH, g);
  if (s0.turn !== 0 || s0.l2 !== 0) fail(`${label}: altered photo or line 2 visible at section start`);
  if (s1.turn !== 1 || s1.l2 !== 1 || s1.l1 !== 0) fail(`${label}: end state of section A not reached`);
  const mid = storyFrame(aTop + .1 * (aH - stageH), g); if (mid.l1 < .5) fail(`${label}: line 1 not shown early in section A`);
  if (storyFrame(bTop + .5 * (bH - stageH), g).mission !== 1) fail(`${label}: mission not fully shown by mid section B`);
  console.log(`ok  ${label}: ${ys.length} positions, down == up, ranges, no overlaps, <=1 live layer`);
}
if (fails) { console.error(`${fails} failure(s)`); process.exit(1); }
console.log('PASS');
