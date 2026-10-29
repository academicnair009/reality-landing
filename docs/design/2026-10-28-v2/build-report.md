# RIALITI home page v2: build report

Date 2026-10-28. Engineer's report on the build of the design package in this folder. Branch `home-v2` (worktree of the landing repo). Nothing pushed or deployed.

## What was built

| File | What |
|---|---|
| `index.html` | The v2 home page: static HTML with inline CSS and vanilla JS, no libraries, no build step. Sections exactly as `design.md`: header, hero, problem, use cases, how it works, proof (with the demo switched off), story, close with the iPhone waitlist, footer. |
| `404.html` | The director's 404 design, absolute asset paths, `noindex`. |
| `robots.txt`, `sitemap.xml` | Allow all, keep `/docs/` and `/scripts/` out of search; sitemap lists `/` and `/privacy/` only. |
| `assets/v2/fonts/lexend-sub.woff2`, `playfair-italic-sub.woff2` | Subsets: Lexend 39.7 KB to 23.4 KB (weight axis cut to 300..700), Playfair 22.0 KB to 16.5 KB. Built by `scripts/subset_fonts.py`. |
| `scripts/verify_story.mjs` | Replaces `scripts/verify_scroll.mjs`. Model checks in Node plus `--browser` checks of the real page. |
| `scripts/render_page.mjs` | Renders everything into `build-renders/` and runs 62 page checks; writes `build-renders/measurements.json`. |
| `scripts/validate_html.mjs` | parse5 parse errors plus id, idref, img and link checks. |
| `CREDITS.md`, `CLAUDE.md`, `README.md`, `assets/demo/README.md` | Credits merged; CLAUDE.md describes v2 with v1, the APK tabs and the old signup as dated history. |

Removed from the page: the letter rail, mosaic, tabs, APK block, install steps, alpha notes, version line, the `api.rialiti.io` counter link, the Gmail mailto, Google Fonts links, the opening thesis, and "Videos work the same way." (also marked removed in `copy.md`, `design.md`, `qa.md` and the reference mock). `scripts/verify_scroll.mjs` was deleted. No assets were deleted: every old image is still covered by `CREDITS.md` or used as a build source.

Head and SEO: title and description from `copy.md`, canonical `https://www.rialiti.io/`, Open Graph and Twitter tags with absolute URLs to `assets/v2/og/og-1200x630.jpg` (plus width, height, type, alt), `theme-color`, `color-scheme`, JSON-LD `@graph` with Organization and SoftwareApplication (Android, MultimediaApplication, free offer, `url` and `installUrl` = the Play URL, publisher linked to the Organization), one h1, `lang="en"`.

## Measurements

Local http server, text gzipped at level 6 the way GitHub Pages serves it. Byte counts are decoded sizes.

| Measure | Value |
|---|---|
| HTML transfer (index.html) | 53.1 KB raw, **15.6 KB gzip**, 13.2 KB brotli |
| Above-the-fold images, phone 360x780 @2.625x | **71.1 KB** (capture 40.6 + record panel 27.7 + mark 2.8) |
| Above-the-fold images, phone @1x / desktop 1440 @1x | 42.9 KB / 42.9 KB (capture-560 + record-640 + mark) |
| First load before any scroll, phone @2.625x | 204.7 KB in 9 requests (includes both fonts 39.9 KB and the two problem images 37.8 KB that Chrome's lazy-load margin fetches early) |
| Whole page after scrolling to the end, phone @2.625x | **360.3 KB**, 13 requests (264.5 KB images, 39.9 KB fonts) |
| Whole page, phone @1x / desktop @1x / desktop @2x | 288.8 KB / 312.0 KB / 415.7 KB |
| LCP element | the hero photograph at every size (checked) |
| CLS | 0 |
| Throttled phone (Lighthouse slow-4G numbers: 150 ms RTT, 1.6 Mbps, CPU 4x, cache off, @2.625x) | FCP **0.31 s** (headline readable, Lexend loaded), LCP **1.07 s** |
| Promoted layers during the story (DevTools LayerTree, layers of a quarter screen or more on screen) | **max 2** at 360x740 and 1440x900: the sticky stage plus the altered photograph, only mid-fade |
| Console | no errors or failed requests at 360, 768, 1440, reduced motion, no JS, while scrolling, on the 404 |
| Contrast | 70 text elements checked on the static page, minimum ratio 7.49:1 (AA needs 4.5) |
| Keyboard | 16 tab stops, every one with a visible focus indicator; the honeypot is not a stop |

## Verification

- `node scripts/verify_story.mjs --browser`: **PASS**. Model: phone 740 (836 positions), phone with URL bar collapsed (861), desktop 900 (1016); down == up at every position, ranges, continuity, no overlap of lines or credits, will-change only mid-fade, end states; a mutated model (line 2 at 30 percent) fails 111 checks, so the checks bite. Page: 170 stops down then up at 360x740 and at 1440x900, DOM opacity equals the model at every stop in both directions, the parked altered raster is `visibility: hidden`, `will-change` only while `turnLive`, at most 2 large promoted layers.
- `node scripts/render_page.mjs`: **ALL CHECKS PASS** (62). Covers no horizontal overflow and H1 on 2 lines at 360, 768, 1440 (42, 61, 92 px); Play button top at y 305 on a 360x740 screen (same as the reference); no-JS story fully visible and the waitlist replaced by "The iPhone waitlist opens soon."; one h1 and no skipped heading levels; no duplicate ids; every img has width, height, alt; every image below the first screen lazy; every local link and image resolves to a file; external links are exactly `https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=utm_source%3Drialiti.io` (both with `target="_blank" rel="noopener"`), `https://check.rialiti.io`, `https://check.rialiti.io/e/ra-e58e1b6d5bed4de9` and `mailto:founders@rialiti.io`; every waitlist state (invalid, preview sends nothing, submitting with the agreed form-urlencoded fields, success with fields hidden and focus on the status, network or server error, server `invalid_email` mapped to the email message) at 360 and 1440, using a stubbed endpoint.
- HTML validation: the W3C Nu validator is not available (no Java runtime; nothing installed). `node scripts/validate_html.mjs` (parse5, the WHATWG parser, plus id/idref/img/target checks): **0 problems** in `index.html`, `404.html`, `privacy/index.html`. Limit: parse5 reports parse errors, not every content-model rule (for example it does not flag a stray end tag), so this is weaker than Nu.
- The demo block was switched on in a temporary copy, rendered at 360 and 1440 and validated (0 problems), then discarded.
- Copy: every visible string in `copy.md` (118 table cells, plus link-split strings checked with tags stripped, plus the 404 strings) is present verbatim in the page. Greps of `index.html` and `404.html` for em dash, en dash, "spot", "detect", "AI detector", "alpha", "api.rialiti.io", "gmail", the founder's first and last name and the account name, and "Videos work": **0 hits each**.

Renders in `build-renders/`: `full-{360,768,1440}-reduced-motion.png` (the complete page; a full-page capture of the scrubbed story is not meaningful because Playwright grows the viewport to the page height), `full-{360,1440}-no-js.png`, `hero-{360,768,1440}.png` and `hero-360x740.png`, `story-{a00,a10,a56,a85,b05,b50}-{360,1440}.png` (scrubbed mode), `waitlist-{idle,invalid,preview,submitting,ok,err}-{360,1440}.png`, `404-{360,1440}.png`, `focus-play-1440.png`, `measurements.json`.

## Deviations from the design, with reasons

1. **Play links open in a new tab** (`target="_blank" rel="noopener"`). design.md says same tab; the build instruction says new tab.
2. **"Videos work the same way." removed** (founder instruction: unverified claim).
3. **Demo switch is the two-marker comment**, as the v1 page did it, not `<div id="demo" hidden>` (build instruction). With a comment the browser never sees the download links or image URLs. It ships as the three-file version; the two-file variant is three edits listed in `assets/demo/README.md`.
4. **Compositor fixes the reference build did not have.** Measured on the reference structure: 4 to 7 large promoted layers during the story. Causes and fixes: (a) the hero panel animation used `fill-mode: both`, which keeps an animation in effect and its layer promoted forever; now `backwards`. (b) The phone scrim was the stage's `::after` above both frames, so promoting the altered photograph forced the scrim into a second full-screen layer; the scrim now lives inside each frame and each frame is its own stacking context (`z-index: 0`). (c) The altered photograph's raster is `visibility: hidden` while parked (brief rule; design.md only had will-change). Result: max 2.
5. **Record panel shadow is `box-shadow`** following the baked corners, not `filter: drop-shadow`. The filter inflated the panel's paint rect, which made the late-arriving panel the LCP element on desktop (LCP 1.2 s). Visually identical (compared at 2x zoom).
6. **`sizes` corrected.** The hero's `280px` under-served 700 to 1023 px where the photo is 440 px wide; now `(min-width: 700px) 440px, 78vw` (panel `80vw`). Problem pair `(min-width: 1024px) 628px, (min-width: 700px) 600px, 89vw`. Blue Marble `80vw` on phones (it renders at about 89vw; the 760 file at 2.4x density looks the same and saves 55 KB at 2.6x). JPEG/PNG fallbacks carry their own `srcset`.
7. **Fonts are further subset** (`lexend-sub`, `playfair-italic-sub`) and have metric-matched local fallbacks (`size-adjust` and overrides computed from the font files), so swap barely moves text.
8. **No-JS waitlist hides the form while `WAITLIST_URL` is unset** (a `<noscript><style>` in the head) and shows only "The iPhone waitlist opens soon." The design left the form visible; without JS and without an action it would have submitted the email into the page URL. Three marked spots (`grep 'WAITLIST ('`) switch it on; steps in CLAUDE.md.
9. **Story B layout is flex, not grid with `place-content`.** With a shrink-to-fit grid item the Earth's `min(100%, ...)` width is a cyclic percentage; flex with stretch makes it definite. Same rendering.
10. **Safe areas.** `viewport-fit=cover`, page margin is `max(clamp(...), safe-area insets)`, so the story's bottom offsets (`env(safe-area-inset-bottom)`) actually take effect on gesture-nav phones as design.md intended.
11. **Reduced-motion is decided in `<head>`** before first layout (not at the end of the body), and toggling reduced motion while the page is open removes or restores the scrub cleanly.
12. Extras not in the design: `og:image` width/height/type, JSON-LD `publisher` link and `installUrl`, a forced-colors border for pills, `robots.txt` disallowing `/docs/` and `/scripts/`.

No copy deviations other than item 2.

## Open items

For the founder:
1. **Phone test (required).** Open the page on the low-RAM Android, scroll the story down and up several times, and send a `?debug=1` screenshot mid-turn. Headless Chrome measured 2 large layers; the real device is the acceptance test.
2. **Waitlist go-live.** Deploy `waitlist-apps-script.gs`, send the `/exec` URL. I then set the three `WAITLIST (` spots and test one real submission. Not yet tested against a live Apps Script: the shipped call is the normal CORS read of the JSON; if a browser cannot read it, add `mode: "no-cors"` (an opaque response is already treated as success).
3. **Demo files** (real capture, real WhatsApp copy, optional AI recreation) and their verified verdicts.
4. "We won't use it for anything else." stays as written; it is a promise to keep.

Known limits and smaller items:
5. **LCP under Lighthouse slow-4G emulation is 1.07 s**, about 70 ms over design.md's 1.0 s target; the headline paints at 0.31 s. The link is bandwidth-bound (preloading the hero image did not help and was reverted). Levers if wanted: drop the hero to the 560 px file at high DPR, or keep the problem images from loading before the first scroll (Chrome's lazy-load margin fetches them early).
6. Playfair (16.5 KB) loads on first visit because its text is in the document. Deferring it would need `content-visibility` on the story, which would break the story's measured geometry. Left as is.
7. `privacy/index.html` still loads Lexend from Google Fonts and uses the v1 colors. It works and is linked; aligning it is a separate small change.
8. `docs/` (brief, critique, mock) and `scripts/` are published by GitHub Pages because the repo root is the site. `robots.txt` keeps them out of search but they are reachable by URL, and the repo is public anyway.
9. `CREDITS.md` is served as raw Markdown. A rendered `/credits/` page would read better.
10. The Play URL in JSON-LD carries the UTM referrer, as `copy.md` specifies.
11. Real-device and other-browser rendering (Safari, Firefox, Samsung Internet) not checked; everything here is headless Chrome on a Mac.

## How to re-run

```
export PATH=$HOME/.nvm/versions/node/v22.18.0/bin:$PATH
node scripts/verify_story.mjs --browser
node scripts/render_page.mjs
node scripts/validate_html.mjs
python3 scripts/subset_fonts.py        # only if the source fonts change
```
