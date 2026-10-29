# reality-landing

Marketing site for **RIALITI** (brand final, founder-confirmed 2026-08-03).
Static site on **GitHub Pages** from this repo's `main` branch (root), domain
**www.rialiti.io** (`CNAME`). No build system, no frameworks, no JS libraries:
`index.html` (inline CSS and JS) plus self-hosted files in `assets/`.

## Context isolation: read this first

This repo is deliberately SEPARATE from the product monorepo so that landing
work never consumes product context and vice versa. Do NOT read the product
repo from here; everything needed to work on the site is in this file and in
`docs/design/2026-10-28-v2/` (brief, design, copy, QA for the current page).

## The page: v2, "every image says where it came from" (2026-10-28)

The founder judged v1 (the seven-beat scrollytelling page) beautiful but
unclear: a visitor could not tell what RIALITI Capture is for. v2 puts the
product first and keeps the story below it. Design package, binding:
`docs/design/2026-10-28-v2/` (`brief.md` product truth and invariants,
`design.md` section by section, `copy.md` every string, `qa.md` claims and
contrast). `copy.md` wins any disagreement about wording.

Concept: provenance captions are the signature device. The hero capture
carries its record and date, the edited car says who edited it, every story
photograph carries its credit, and the altered one says "altered by us".

Sections, top to bottom:
1. **Header** (not sticky): mark + wordmark, "How it works" (`#how`, hidden
   below 700px), "Check a photo".
2. **Hero**: "Prove your photo is real.", Play button, "Check a photo for
   free", iPhone aside, and the real verified capture (toy car, record
   `ra-e58e1b6d5bed4de9`) with the app's Verified panel. One CSS load
   animation: the panel rises onto the photo (fill `backwards` only, so its
   compositor layer is released after it runs).
3. **Problem**: edited car over real car, each tagged ("Edited" / "Real
   capture"), "Both look real. Only one can prove it."
4. **Use cases**: six `h3` + line items, a typographic list. NOT links until
   their guides exist; reserved paths are in an HTML comment above the
   section and in `copy.md`. When a guide ships: link the h3 text, add it to
   `sitemap.xml`.
5. **How it works** (`#how`): three numbered steps and "An edited photo or an
   AI image traces back to nothing."
6. **Proof** (`#proof`): "Don't trust us. Check it yourself." with the live
   public record link and a dated screenshot of it. Contains the demo switch
   (below).
7. **Story** (`#why`, true black, the only Playfair): one held frame, the
   first-steps photograph, that crossfades in place into its altered version
   ("Some moments happen once." then "And soon, some will never have
   happened at all."), then the Blue Marble with "To Protect What's Human",
   then the coda "Real moments deserve proof." and the ethos line.
8. **Close** (`#get`): "Keep what's real, real.", Play button, the iPhone
   waitlist panel (`#iphone`), the signature mission line.
9. **Footer**: RIALITI Check, Privacy (`privacy/`), Photograph credits
   (`CREDITS.md`), founders@rialiti.io (role address), trademark line.

Also: `404.html` (absolute asset paths, noindex), `robots.txt`,
`sitemap.xml` (home and privacy only), JSON-LD Organization and
SoftwareApplication in the head, OG/Twitter image
`assets/v2/og/og-1200x630.jpg`.

## Product truth (do not deviate; from the v2 brief)

- RIALITI Capture: free Android app on Google Play, package
  `app.rialiti.capture`. RIALITI Check: https://check.rialiti.io, free forever.
- The product PROVES a capture is real and unedited. It does NOT detect AI or
  fakes. Allowed: "prove it's real", "ask for proof". Forbidden: "spot
  fakes", "detect AI", "AI detector", "spot the edit".
- iPhone: not available, waitlist only, no date promised.
- Required lines: "To Protect What's Human", "Every photograph on this page
  is real.", "Verification will always be free."
- No em dashes anywhere in copy. No testimonials, logos, user or download
  numbers, press, funding or ratings: none exist that we can show honestly.
  No founder name anywhere (standing rule); no personal email address.
- "Videos work the same way." was REMOVED on 2026-10-28 (unverified claim,
  founder decides later). Do not re-add it without founder sign-off.

## Android door

Every Play button links to
`https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=utm_source%3Drialiti.io`
(`&amp;` inside the attribute), `target="_blank" rel="noopener"`. It is our own
green pill, never an imitation of Google's badge; the footer carries "Google
Play is a trademark of Google LLC."

## The story mechanism (scrub-symmetric, verified)

- `<head>` adds `html.anim` before first layout, only when motion is allowed
  and `position: sticky` is supported. Without JS, under
  `prefers-reduced-motion`, or without sticky, the story is a plain static
  sequence (photo, credit, line; photo, credit, line; Earth, mission, credit;
  coda) and the page is complete. If the user flips reduced motion while the
  page is open, the script removes `anim` and clears its inline styles.
- With `anim`: `.story-a` is 300svh with a 100svh sticky stage holding both
  photographs stacked; `.story-b` is 190svh with the Blue Marble stage.
  Phones: the frames fill the stage with a bottom scrim; desktop (1024+):
  the frames are prints on the grid (84svh tall), lines to the right.
- HARD RULE: every animated value is a pure function of scroll position,
  computed by `storyFrame(y, g)` in the block between the two
  `PURE SCROLL MODEL` markers in `index.html` (no DOM access inside it). `g`
  is measured from layout on load, resize and font load, never on scroll;
  geometry uses `stage.offsetHeight` (100svh), not `innerHeight`, so URL-bar
  collapse does not move the timeline. Only `opacity` is written per frame,
  from one rAF-throttled passive scroll listener, only when a rounded value
  changes, and not at all when the story is more than a screen away.
- COMPOSITOR RULE (the founder's low-RAM Android is the acceptance device; v1
  failed on it twice): at most two promoted large layers at once. In v2 the
  only element ever given `will-change: opacity` is the altered photograph
  (`.f2.live`, only while `turnLive`, i.e. mid-fade); its raster (`.f2
  picture`) is `visibility: hidden` whenever it is parked at opacity 0. The
  scrim and the credit live inside each frame and each frame is its own
  stacking context (`z-index: 0`), so nothing full-screen sits above the
  promoted photograph (which would force a second promoted layer). The sticky
  stage is itself a layer, so the measured maximum on screen is 2: stage +
  altered photograph. No fixed elements anywhere (except the debug HUD).
- Verifier: `node scripts/verify_story.mjs` checks the extracted model in
  Node (down == up at every 7px step on phone, phone with URL bar collapsed,
  and desktop; ranges; continuity; no overlap of the two lines or two
  credits; will-change only mid-fade; end states; and a mutated model that
  must fail). `node scripts/verify_story.mjs --browser` also scrolls the real
  page down and up in headless Chrome at 360x740 and 1440x900, asserts the DOM
  opacities equal the model, the parked raster is hidden, and counts large
  promoted layers on screen through the DevTools LayerTree (must be <= 2).
  Run it after ANY change to the story, the CSS around it, or anything that
  could promote a layer. Keep the markers byte-identical.
- Debug: `?debug=1` shows a fixed HUD (y, innerHeight, stage height, pa, pb,
  every opacity, turnLive, whether the altered raster is visible). Zero cost
  when absent. Ask the founder to screenshot it for device reports.
  Kept for the founder's low-RAM phone test of v2. Once that test passes it
  may be removed (the `#debug-hud` CSS rule, `paintHud` and the `?debug=1`
  block in the story script); keep it if more device reports are expected.
- After any animation change, ask the founder to re-test on the phone.

Browser tools need `export PATH=$HOME/.nvm/versions/node/v22.18.0/bin:$PATH`
(system Chrome plus playwright-core from the npx cache; or set
`PLAYWRIGHT_CORE`). `node scripts/render_page.mjs` re-renders every
screenshot into `docs/design/2026-10-28-v2/build-renders/` and re-runs the
page checks (overflow, H1 lines, console, links, heading order, image sizes,
contrast, keyboard focus, LCP element, CLS, every waitlist state).

## iPhone waitlist

Form `#wl` in the close: email (required), "What will you use it for?"
(optional, max 500), honeypot `website` (off-screen, not focusable), hidden
`source=rialiti.io-home` and `reply=html`. JS posts form-urlencoded (a CORS
simple request) to `WAITLIST_URL`, the constant at the top of the page
script, with a 12 s timeout. States: invalid, submitting ("Joining…"),
success (fields hidden, focus to the status), error, and **preview**: while
`WAITLIST_URL` is `""`, a valid submit sends nothing and says "The waitlist
isn't connected yet, so nothing was sent." Backend:
`docs/design/2026-10-28-v2/waitlist-apps-script.gs` (deploy steps at its top).
When `WAITLIST_URL` is set the script also sets the form's `action` to it, and
a fetch that fails before any response arrives (network error, the 12 s
timeout, an unreadable cross-origin reply) falls back to a plain form post
(`reply=html`), which can add a duplicate row if the first request did land.

To go live, grep `WAITLIST (` in `index.html`; there are three marked spots:
(1) delete the `<noscript>` block in the head that hides the form without JS,
(2) add `action="<the /exec URL>"` to the form (the no-JS fallback),
(3) set `WAITLIST_URL`. Then test one real submission and confirm the browser
can read the JSON; if it cannot, add `mode: "no-cors"` to the fetch (an opaque
response is already treated as success) and record that here. "We won't use
it for anything else." is a promise the founder must keep.

## Demo section, "test it yourself" (BUILT, OFF)

Inside `#proof`, the `<div class="demo" id="demo">` block is commented out
between two lines that each read `ENABLE ME BY DELETING THIS LINE` (same
switch as v1). Delete both lines to ship it, once the real files exist and
their verdicts are confirmed on check.rialiti.io. Files, the two-file
variant and the checklist: `assets/demo/README.md`. Never fabricate the
WhatsApp copy.

## Images: hard rules

- Every image is a REAL photograph or a real screenshot of RIALITI software,
  self-hosted. NO AI-generated imagery (the only planned exception is the
  optional, labelled demo recreation). Altered images say so on the page, in
  alt text and in `CREDITS.md`.
- `CREDITS.md` lists every image with source, author, license and
  modifications. Keep it current; the footer and the ethos line link to it.
- v2 rasters are built by `docs/design/2026-10-28-v2/src/build_assets.py`
  from repo files (needs Pillow + NumPy). Fonts are subset by
  `scripts/subset_fonts.py` (fontTools + brotli).
- Every `<img>` has width, height and honest alt; everything below the first
  screen is `loading="lazy"`; WebP with JPEG/PNG fallback via `<picture>`.

## Budgets (measured 2026-10-28, see the build report)

HTML about 53 KB raw, 15 KB gzip. First screen on a 360px phone at 2.6x:
about 205 KB including HTML, both fonts and the hero images. Whole page about
360 KB at 2.6x. CLS 0. LCP element: the hero photograph.

## Editing rules

- Static HTML, CSS and vanilla JS only. Tokens are the app's own
  (`--bg #0C0D11`, `--panel #14171C`, `--green #34D399` for verified and the
  one primary action only, `--flag #FF8A8A` for "Edited" and errors). Lexend
  everywhere, Playfair Display Italic only in the story and mission lines.
- Accessibility: one h1, h2 per section (story h2 visually hidden), h3 for
  use cases and the waitlist; visible focus on every stop; WCAG AA contrast
  (checked by `render_page.mjs`); complete without JS and under reduced
  motion.
- Nothing is pushed or deployed without the founder's explicit approval.

## Deploy

Push to `main` and GitHub Pages publishes (branch main, path /). Repo
github.com/academicnair009/reality-landing (public). `docs/` and `scripts/`
are published too (robots.txt keeps them out of search); do not put
private material in them.

## Privacy policy page (2026-09-18)

`privacy/index.html` is a plain static page at https://www.rialiti.io/privacy/
(own inline CSS; still loads Lexend from Google Fonts). It exists because
Google Play requires a privacy policy URL. Its facts were derived from the app
code on 2026-09-18; if the app changes what it sends, this page must change
with it and get a new effective date. Contact: founders@rialiti.io.

## History (dated, superseded)

- **2026-08-03, v1 scrollytelling.** Seven full-viewport beats with photos;
  each beat's letter flew into a fixed rail spelling RIALITI; photos flew
  into a fixed, pre-baked mosaic (`assets/mosaic.jpg`, built by
  `scripts/build_mosaic.py`) that brightened at the close. Copy was mechanism-free by founder decision
  (lifted for everything above the story in v2). Verified by the old
  `scripts/verify_scroll.mjs` (removed 2026-10-28). On 2026-10-28 the
  unused beat photographs (2, 3, 4, 6), `assets/mosaic.jpg` and
  `scripts/build_mosaic.py` were deleted (credits kept in `CREDITS.md`
  under "No longer on the page"); beats 1, 5 and 7 moved to
  `docs/design/2026-10-28-v2/src/sources/` as build sources of
  `assets/v2/story/`. Beat 5 is regenerated with
  `python3 scripts/make_turn_image.py docs/design/2026-10-28-v2/src/sources/beat1-first-steps.jpg docs/design/2026-10-28-v2/src/sources/beat5-turn.jpg`.
- **2026-08-07 to 2026-10-02, top-right tabs and the APK.** Tabs for RIALITI
  Check and a sideloaded Android APK with alpha notes; removed 2026-09-18,
  restored 2026-10-02 via the counted link `api.rialiti.io/download/android`.
  **Removed for good on 2026-10-28**: the APK block, install steps, alpha
  notes, version line and counter link are gone; Android is the Play link.
- **Signup.** v1 had a `SIGNUP_URL` placeholder falling back to a personal
  mailto. Removed 2026-10-28; replaced by the iPhone waitlist above.
