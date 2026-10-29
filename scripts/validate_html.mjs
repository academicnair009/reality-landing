#!/usr/bin/env node
/* HTML conformance check without network installs: parse5 (the WHATWG parsing algorithm, from
 * the npx cache, or PARSE5=<path to dist/index.js>) reports every parse error, plus a few
 * document checks parse5 does not make: duplicate ids, label/for and aria-* idrefs resolve,
 * img alt/width/height, a single <title>, lang, no inline event handlers.
 * This is not the W3C Nu validator (it needs Java, not installed here).
 * Usage: node scripts/validate_html.mjs [files...]   (default: index.html 404.html privacy/index.html)
 */
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { pathToFileURL } from "node:url";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
function find() {
  if (process.env.PARSE5) return process.env.PARSE5;
  const d = path.join(os.homedir(), ".npm", "_npx");
  for (const x of fs.readdirSync(d)) { const p = path.join(d, x, "node_modules", "parse5", "dist", "index.js"); if (fs.existsSync(p)) return p; }
  throw new Error("parse5 not found; set PARSE5");
}
const { parse } = await import(pathToFileURL(find()).href);
const files = process.argv.slice(2).length ? process.argv.slice(2) : ["index.html", "404.html", "privacy/index.html"];
let total = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  const errs = [];
  const doc = parse(src, { sourceCodeLocationInfo: true, onParseError: e => errs.push(`parse: ${e.code} at line ${e.startLine}`) });
  const els = [];
  (function walk(n) { if (n.tagName) els.push(n); (n.childNodes || []).forEach(walk); if (n.content) walk(n.content); })(doc);
  const attr = (n, k) => { const a = (n.attrs || []).find(a => a.name === k); return a ? a.value : null; };
  const ids = els.map(n => attr(n, "id")).filter(Boolean);
  ids.filter((x, i) => ids.indexOf(x) !== i).forEach(x => errs.push(`duplicate id "${x}"`));
  const idset = new Set(ids);
  for (const n of els) {
    const line = n.sourceCodeLocation ? n.sourceCodeLocation.startLine : "?";
    for (const k of ["for", "aria-labelledby", "aria-describedby", "aria-controls"]) { const v = attr(n, k); if (v) v.split(/\s+/).forEach(r => { if (!idset.has(r)) errs.push(`${k}="${r}" points at no id (line ${line})`); }); }
    if (n.tagName === "img") { for (const k of ["alt", "width", "height"]) if (attr(n, k) === null) errs.push(`img without ${k} (line ${line})`); }
    for (const a of n.attrs || []) if (/^on/.test(a.name)) errs.push(`inline handler ${a.name} (line ${line})`);
    if (n.tagName === "a" && attr(n, "target") === "_blank" && !/noopener/.test(attr(n, "rel") || "")) errs.push(`target=_blank without rel=noopener (line ${line})`);
  }
  if (els.filter(n => n.tagName === "title").length !== 1) errs.push("not exactly one <title>");
  if (!attr(els.find(n => n.tagName === "html"), "lang")) errs.push("<html> without lang");
  console.log(`${errs.length ? "FAIL" : "ok  "} ${f}: ${errs.length} problem(s)`); errs.forEach(e => console.log("     " + e));
  total += errs.length;
}
process.exit(total ? 1 : 0);
