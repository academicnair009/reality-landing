# RIALITI home page v2: design

Date 2026-10-28. Creative director, for the engineer who builds it. Binding inputs: `brief.md`, `critique.md`. Every visible string lives in `copy.md` (it wins any disagreement). The reference build at `src/mock/index.html` implements this spec as static HTML and CSS with the real story model, so you can open it, measure it, and lift from it. Rendered references are in `assets/v2/reference/`.

## 0. The idea, and what changed from the critique

**Idea: every image on this page says where it came from.** RIALITI exists so a photo can show its origin. The page does the same thing in its own layout: the hero capture carries its record and date, the edited car says who edited it, every story photograph carries its credit, and the altered one says "altered by us" in the frame. Provenance captions are the signature device. They encode real information, so they are structure, not decoration.

**Where the boldness goes: the turn.** The story's first photograph (a child's first steps) is held on screen while you scroll, and the same photograph decays into its altered version in place, under the line "And soon, some will never have happened at all." The page's product half is calm, plain and real. The turn is the one thing a visitor remembers.

Three territories considered:

1. **Exhibit file.** The page as an evidence folder, with exhibit labels and record slips. Rejected: cold and legal, and it drifts into label-everything chrome.
2. **Every image says where it came from (chosen).** Product and mission share one device. It is specific to this product, it is honest by construction, and it costs nothing at runtime.
3. **Ask for proof.** A buyer and seller chat as the page spine, like ad concept C. Rejected: a fabricated conversation on the home page reads as staged, and it serves only one use case.

What changed from the critique, and why:

| Critique said | Design does | Why |
|---|---|---|
| Proof section ships with the demo files, or two-file version | Proof ships **now** with the live public record of the hero car (`check.rialiti.io/e/ra-e58e1b6d5bed4de9`) plus a dated screenshot of it. The downloadable demo is built and switched off. | The record is real and public today. Nobody has to wait for the founder's WhatsApp files to see the product prove something. |
| Problem section: "one line and one picture" | The picture is the real car and the hand-edited car, stacked, each labeled. Caption: "Both look real. Only one can prove it." | Shows the threat with the product's own object, without claiming the app detects the edit. |
| Story: three beats, keep the order | Same three beats, but beats 1 and 5 share one held frame and crossfade in place. Blue Marble carries the mission. The beat 6 line becomes the coda. | Beat 5 is literally beat 1 altered, so showing it in the same frame makes the turn land. One sticky stage instead of three halves the scroll length and the layer count. |
| Seven-letter rail and photo mosaic | Both removed. | The rail spelled seven beats; three cannot spell it. The mosaic (460 KB of unprovenanced Lorem Picsum tiles) no longer has a job. |
| Visual system choice (dark site vs cream and forest) | Dark, built on the app's own tokens: `#0C0D11` background sampled from the Play screenshot, `#14171C` panels, `#34D399` green. Lexend everywhere, Playfair Display Italic only in the story and the mission line. | The hero image is a real app screen. With the page background equal to the app's, the screen sits on the page with no device frame, and the ad, Play listing, app and site read as one brand. |
| Footer email founders@rialiti.io | Kept | It is the role address already on the privacy page, not a personal one. |
| Hero headline A | Kept, unchanged: "Prove your photo is real." | It held up at 360 px: 2 lines at 42 px, 2 lines at 92 px. |
| "Free on Android. Checking is free forever." | "Free on Android. Verification will always be free." | Keeps the canonical line instead of paraphrasing it. |
| "Pets: Show the animal is real and really yours." | "Show buyers a real animal, photographed today." | A photo cannot prove ownership. That would be an overclaim. |

## 1. Visual system

### 1.1 Color tokens

60/30/10: background and panels 60, ink and muted text 30, green 10. Green has exactly two meanings, the same two it has in the app: **verified** and **the one primary action (Get it on Google Play)**. Nothing decorative is green. The flag red appears only on the word "Edited".

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0C0D11` | Page background. Sampled from `assets/play/screens/04-verified.png` (12,13,17). |
| `--panel` | `#14171C` | Proof band, waitlist panel. The app's card color. |
| `--line` | `#2A3038` | Footer rule, screenshot frame (decorative boundaries only). |
| `--line-strong` | `#5B6573` | Form field borders, ghost button border (3.29:1 on field, 3.04:1 on panel). |
| `--ink` | `#EEF1F5` | Primary text. The app's text color. |
| `--muted` | `#A3ADBA` | Secondary text. |
| `--green` | `#34D399` | Primary button fill, "Real capture" tag, success message. |
| `--green-hover` | `#5EE0B0` | Primary button hover. |
| `--green-ink` | `#04251A` | Text on green. |
| `--flag` | `#FF8A8A` | "Edited" tag, form errors. |
| `--story` | `#000000` | Story section background: the photographs' own black (Blue Marble edges are 1,1,1). |
| `--story-ink` | `#F4F1EC` | Story text: warm ink, the human voice. |
| `--story-muted` | `#B5AFA6` | Story captions. |
| tag fills | `#10261E` (real), `#2A1719` (edited) | Tag pill backgrounds. |

Contrast (WCAG 2.1, computed; full table in `qa.md`): ink on bg 17.14, muted on bg 8.55, muted on panel 7.91, green on bg 10.10, green-ink on green 8.50, flag on bg 8.56, story-muted on black 9.65, story-ink over the worst-case scrimmed photo 8.25. Every text pair passes AA, most pass AAA.

### 1.2 Type

Two families, self-hosted from `assets/v2/fonts/` (both SIL OFL, downloaded from Google Fonts, latin subset):

- **Lexend** variable, 300 to 700, `lexend-latin-var.woff2` (38 KB). The wordmark, the Play listing art and every product sentence. Preload it.
- **Playfair Display Italic** 400, `playfair-display-italic-latin.woff2` (21 KB). Only the story lines, the coda and the two mission lines. Do not preload; it is below the fold.

```css
@font-face { font-family: "Lexend"; font-style: normal; font-weight: 300 700; font-display: swap;
  src: url("/assets/v2/fonts/lexend-latin-var.woff2") format("woff2"); }
@font-face { font-family: "Playfair Display"; font-style: italic; font-weight: 400; font-display: swap;
  src: url("/assets/v2/fonts/playfair-display-italic-latin.woff2") format("woff2"); }
```

Fallbacks: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` and `Georgia, "Times New Roman", serif`. Drop the Google Fonts `<link>` and both preconnects.

Scale (fluid between 360 and 1440; values are what the reference build measures):

| Role | CSS | @360 | @1440 | Weight | Line height | Tracking |
|---|---|---|---|---|---|---|
| Display (H1) | `clamp(2.5rem, 1.6rem + 4.6vw, 5.75rem)` | 42 px | 92 px | 600 | 1.0 | -0.035em |
| H2 | `clamp(1.875rem, 1.35rem + 2.3vw, 3.5rem)` | 30 | 55 | 600 | 1.08 | -0.025em |
| Steps | `clamp(1.375rem, 1.05rem + 1.45vw, 2.375rem)` | 22 | 38 | 400 | 1.22 | -0.015em |
| H3 | `clamp(1.25rem, 1.1rem + .7vw, 1.75rem)` | 20 | 28 | 500 (600 in waitlist) | 1.2 | -0.012em |
| Lead | `clamp(1.125rem, 1.03rem + .42vw, 1.375rem)` | 18 | 22 | 300 (400 when ink) | 1.5 | 0 |
| Body | `1.0625rem` | 17 | 17 | 300 | 1.6 | 0 |
| Small | `.875rem` | 14 | 14 | 400 | 1.5 | 0 |
| Micro (story captions, legal) | `.8125rem` | 13 | 13 | 400 | 1.45 | 0 |
| Story line (Playfair) | `clamp(1.75rem, 1.2rem + 2.45vw, 3.5rem)` | 28 | 56 | 400 italic | 1.22 | 0 |
| Mission on Blue Marble (Playfair) | `clamp(2.125rem, 1.3rem + 3.6vw, 5rem)` | 34 | 80 | 400 italic | 1.1 | -0.01em |
| Coda / signature (Playfair) | `clamp(1.5rem, 1.2rem + 1.3vw, 2.25rem)` / `clamp(1.5rem, 1.25rem + 1vw, 2rem)` | 24 | 36 / 32 | 400 italic | 1.3 | 0 |
| Wordmark | `1.0625rem` (footer `.875rem`) | 17 | 17 | 600 | 1 | 0.22em, with `margin-right: -0.22em` |

Rules: sentence case everywhere; no all-caps labels; no eyebrow labels; no single word in a different weight or color inside a headline; `text-wrap: balance` on headings and steps, `pretty` on leads. Measure: leads max 27 to 30em, body max 30em.

### 1.3 Space, grid, radii

- Spacing scale (4 px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Page margin `clamp(20px, 5.5vw, 80px)`: 20 at 360, 42 at 768, 80 at 1440. Content max width 1280.
- Grid at 1024 and up: 12 columns, gutter `clamp(16px, 1.7vw, 24px)` (24 at 1440). Below 1024: one column.
- Section rhythm: `--section: clamp(96px, 7vw + 70px, 176px)` top padding per section (96 at 360, 171 at 1440).
- Breakpoints: below 700 (phone), 700 to 1023 (tablet, single column), 1024 and up (desktop grid).
- Alignment: left-aligned everything. The single centered moment is the Blue Marble and its mission line.
- Radii by role, not one radius for everything: photographs 20 px, panels and screenshots 16 px (waitlist panel 20), fields 12 px, buttons and tags pill (999). Story photographs on desktop 4 px (prints, not UI).
- Shadow: one, only where a UI panel floats over a photograph (the hero record panel): `filter: drop-shadow(0 18px 36px rgba(0,0,0,.6))`. No other shadows.

### 1.4 Components

**Primary button, "Get it on Google Play".** We have no official badge file, and we must not imitate Google's badge (no black rounded badge, no Play triangle, no two-line "GET IT ON / Google Play" lockup). So it is our own button in our own tokens, the same pill as the app's "Share capture" button:

- `min-height: 56px; padding: 0 30px; border-radius: 999px; background: #34D399; color: #04251A; font: 600 17px/1 Lexend; letter-spacing: -0.005em; white-space: nowrap`. Measured width 240 px at desktop. Full width below 700 px.
- Hover `#5EE0B0`. Active `translateY(1px)`. Focus: 2 px `#34D399` outline, 4 px offset, pill radius.
- Text only, no icon, no arrow. The footer carries "Google Play is a trademark of Google LLC."
- `href` is the Play URL with `&referrer=utm_source%3Drialiti.io`. Same tab. It is a link (`<a>`), not a button.

**Text link.** Lexend 500, ink, underline 1 px at `rgba(238,241,245,.45)`, offset 5 px. Hover: underline full ink, 2 px. No arrows appended.

**Ghost button** (proof section only). `min-height: 52px; padding: 0 26px; border: 1px solid #5B6573; radius 999; Lexend 500 16px; ink`. Hover border ink.

**Tags** ("Edited", "Real capture"). Pill, `padding: 4px 11px 4px 9px`, 14 px Lexend 500, 14 px stroke icon from `assets/v2/icons/cross.svg` / `check.svg` (inline them, `currentColor`), colors per tokens. The icon plus the word carry the meaning, so it works without color.

**Focus.** Global `:focus-visible { outline: 2px solid #EEF1F5; outline-offset: 3px; border-radius: 4px }`. Fields use border plus `box-shadow: 0 0 0 1px` instead.

## 2. Page architecture, top to bottom

Measured page heights in the reference build (reduced motion, all sections static): 8,659 px at 360, 8,868 px at 1440. With the scrubbed story the story adds about 3.9 screens.

### 2.0 Header

Job: name the brand, give the one utility link. Not sticky, not fixed (no layer over the story's photographs; the close repeats the actions).

```
360:  [mark 34x28] RIALITI                         Check a photo
1440: [mark] RIALITI                         How it works    Check a photo
```
Height 60 px below 700, 72 px above. Mark: `assets/v2/icons/rialiti-mark.svg` (byte-identical copy of the canonical `branding/rialiti-logo-vector.svg`; equal to the current `assets/favicon.svg`), rendered at 34x28, never recolored. Gap mark to wordmark 12 px. Nav links Lexend 400 15 px muted, hover ink, 10 px vertical hit padding, 28 px apart. "How it works" (anchor `#how`) is hidden below 700 px.

### 2.1 Hero

Job: name the product, say what it does, give both doors (install, check), show one real proof. Readable before any image loads.

```
360 (first screen, 360x740)
 ┌──────────────────────────────┐
 │ [mark] RIALITI  Check a photo│ 60
 │                              │ 28
 │ Prove your                   │ H1 42/42, 2 lines (y 88 to 172)
 │ photo is real.               │
 │ Take it in the free RIALITI  │ lead 18/27, 3 lines
 │ Capture app. Anyone can ...  │
 │ [ Get it on Google Play    ] │ 56, full width (y 305)
 │ Check a photo for free       │
 │ Free on Android. On iPhone?  │ 14
 │ Join the waitlist.           │
 │      ┌───────────────────┐   │ figure starts y 497:
 │      │ capture (280 wide)│   │ photo right-aligned, 87.5% wide
 │ ┌────┴────────────┐      │   │
 │ │ Verified capture│──────┘   │ record panel 90% wide, bottom-left
 │ │ ra-e58e1b6d5bed4de9     │   │
 │ └─────────────────┘          │
 │    caption, 14 px, indented  │
 └──────────────────────────────┘

1440 (first screen, 1440x900; hero fills 100svh - 72, max 1000)
 cols 1-7: copy, vertically centred      cols 8-12: figure (520 wide)
 ┌───────────────────────────────┐      ┌────────────────┐
 │ Prove your                    │      │  capture 440x  │ right-aligned
 │ photo is real.        92/92   │      │  520, cover,   │ object-position
 │ lead 22/33, max 27em          │   ┌──┴──────────┐     │ 50% 100%
 │ [Get it on Google Play] Check │   │ record panel │─────┘ 400 wide, bottom-left
 │ Free on Android. On iPhone?.. │   └─────────────┘
 └───────────────────────────────┘    caption at x+80, 14 px
```

Exact geometry (`.stack` is the positioning box):
- Desktop: `.stack { width: 100%; max-width: 520px; aspect-ratio: 520/632 }`; capture `right:0; top:0; width:84.6%; height:82.3%`, `object-fit: cover; object-position: 50% 100%; border-radius: 20px`; record panel `left:0; bottom:0; width:76.9%` with the drop shadow. Caption `margin: 18px 0 0 15.4%`.
- Below 700: `.stack { aspect-ratio: 320/421 }`; capture `width:87.5%; height:78.4%`; panel `width:90%`; caption `margin-left:12.5%`. Hero bottom padding 72 px.
- Copy: H1 `max-width: 9.5em`; lead margin-top 20; actions margin-top 32, gap 16/28; aside margin-top 20.

Images:
- Capture: `assets/v2/hero/capture-560.webp` (24 KB) / `capture-786.webp` (40 KB), JPEG fallbacks `capture-560.jpg`, `capture-786.jpg`. `sizes="(min-width: 1024px) 440px, 280px"`. `fetchpriority="high"`, not lazy, `width="786" height="1048"`.
- Record panel: `assets/v2/hero/record-card-640.webp` (15 KB) / `record-card-967.webp` (27 KB), PNG fallback `record-card-967.png`. Transparent rounded corners are baked in. `sizes="(min-width: 1024px) 400px, 288px"`, `width="967" height="560"`.
- Both are crops of the real Play screenshot `assets/play/screens/04-verified.png` (record `ra-e58e1b6d5bed4de9`, re-checked live 2026-10-28: "Verified attested capture", Tier 1, captured 2026-09-21T04:20:31Z). Not retouched, not regraded.

Motion: **the page's one orchestrated moment.** On load the record panel rises 32 px and fades in, 700 ms, `cubic-bezier(.2,.75,.25,1)`, 450 ms delay, after the photo is already there: the record attaching to the photo. Pure CSS, runs once, inside `@media (prefers-reduced-motion: no-preference)`, `animation-fill-mode: both`. No JavaScript, no `will-change`. Nothing else in the hero moves.

Measure: H1 is 2 lines at 360, 768 and 1440 (reference: 2, 2, 2); Play button top inside the first 360x740 screen (reference: y 305); no horizontal overflow (`scrollWidth == 360`); LCP element is the H1 or the capture, under 1 s on a mid-range phone with cache disabled.

### 2.2 The problem

Job: give the threat one beat, with the product's own object.

```
360                                   1440
 Photos used to be                     cols 1-6 (sticky top 96)     cols 7-12
 proof. Now anyone                     Photos used to be proof.     ┌──────────────┐
 can make one.        H2 30            Now anyone can make one.     │ edited car   │ 628 wide
 body 18, muted                        body                         └──────────────┘
 ┌──────────────────┐                                               (x) Edited  Made by us...
 │ edited car 320w  │ 785:470                                       ┌──────────────┐
 └──────────────────┘                                               │ real car     │
 (x) Edited  Made by us, by hand...                                 └──────────────┘
 ┌──────────────────┐                                               (v) Real capture  The original...
 │ real car         │                                               Both look real. Only one can prove it.
 └──────────────────┘
 (v) Real capture  The original. It has a public record.
 Both look real. Only one can prove it.   (lead size, ink)
```
- Pair is a `<figure>`; images `aspect-ratio: 785/470; border-radius: 20px`; meta row (tag + note) 12 px below each image, `flex-wrap`, gap 6/12; 28 px between items. Pair `max-width: 600px` below 1024.
- Edited first, real second: problem, then answer.
- Images: `assets/v2/problem/car-edited-400.webp|785.webp` (+ `.jpg`), `assets/v2/problem/car-real-400.webp|785.webp` (+ `.jpg`). `sizes="(min-width: 1024px) 628px, calc(100vw - 40px)"`, lazy.
- Motion: none.
- Measure: the missing white roundel and "F" number must be visible at 360 (they are, at 320 px wide).

### 2.3 What you can use it for

Job: let each visitor find themselves. A typographic list, not cards.

```
360                                   1440
 For any photo that                    cols 1-5 sticky (top 96)      cols 7-12
 has to be believed.                   For any photo that has        Selling a used car        H3 28
 body                                  to be believed.               Show the real dents...    body muted
 Selling a used car      H3 20         body                          (44 px)
 Show the real dents...  17 muted                                    Watches and phones
 (36 px gap) ... six items                                           ...
```
- `<ul>` of six `<li>`, each an `<h3>` plus one `<p>`. No icons, no borders, no numbers (not a sequence). Gap 36 px (44 at desktop).
- Tiles are **not links** until the guides exist. When a guide ships, wrap the `<h3>` text in a link to its reserved path (list in `copy.md`); do not add arrows.
- Motion: none. Measure: no item wraps its H3 to 3 lines at 360.

### 2.4 How it works (`id="how"`)

Job: make it feel simple. A real sequence, so numbers are right here.

```
360                                   1440 (cols 1-10, steps max 27em)
 Three steps.                          Three steps. No account.
 No account.          H2              1  Take the photo in the free RIALITI Capture app.     38 px
 1 Take the photo in the free         2  Send it anywhere. WhatsApp, a listing, an email.
   RIALITI Capture app.   22 px       3  Anyone checks it free at check.rialiti.io.
 2 Send it anywhere. ...
 3 Anyone checks it free at ...       An edited photo or an AI image traces back to nothing.  22 ink
 An edited photo or an AI image ...   Videos work the same way.  14 muted
```
- `<ol>` with CSS counters; numeral in muted Lexend 300, `padding-left: 1.6em`, numeral absolutely at left 0. Gap 28 px (36 desktop). Note 48 px below.
- Motion: none.

### 2.5 Proof (`id="proof"`)

Job: earn trust by letting them look for themselves. Full-bleed `--panel` band, so it reads as a different room.

```
360                                   1440
 Don't trust us.                       cols 1-6                       cols 8-12
 Check it yourself.   H2              Don't trust us.                ┌─────────────┐
 body 18 muted                        Check it yourself.             │ check page  │ 362 wide
 ( Open the car's record )  ghost     body                           │ screenshot  │ radius 16
 Check a photo of your own            ( Open the car's record )      │             │ 1px line
 fine print 14                        Check a photo of your own      └─────────────┘
 ┌──────────────┐                     fine print                     RIALITI Check, opened on 28 October 2026.
 │ screenshot   │ 100%, max 362
 └──────────────┘
 caption
```
- "Open the car's record" goes to `https://check.rialiti.io/e/ra-e58e1b6d5bed4de9`. "Check a photo of your own" goes to `https://check.rialiti.io`. Same tab.
- Image: `assets/v2/proof/check-record-362.webp` / `check-record-724.webp`, PNG fallback `check-record-724.png`, `width="724" height="1138"`, lazy. It is a crop of a headless-Chrome capture of the live record page taken 2026-10-28 (source kept at `src/sources/`). The crop deliberately excludes the check page's tagline, which contains an em dash.
- **Demo (built, off).** Below the live part, a `<div id="demo" hidden>` with the two or three download cards from `copy.md`. Layout: 1 column below 1024, 2 or 3 equal columns above, each card on `--bg` with 16 px radius, 4:3 thumbnail, title, text, verdict line (Lexend 400 14 px ink, not all-caps), and a ghost "Download" button with the `download` attribute. Turn it on by removing `hidden` only after the founder supplies real files and the verdicts are confirmed (checklist in `assets/demo/README.md`). Never synthesize the WhatsApp copy.
- Motion: none.

### 2.6 Story (`id="why"`)

Job: carry the mission for people who scroll this far. The only place Playfair and true black appear.

Markup order (this is also the complete no-JS and reduced-motion page):
```
section.story#why
  h2.sr-only  Why RIALITI exists
  div.story-a > div.stage
     figure.frame.f1  img first-steps + figcaption credit
     p.line.l1        Some moments happen once.
     figure.frame.f2  img turn + figcaption "altered by us"
     p.line.l2        And soon, some will never have happened at all.
  div.story-b > div.stage
     img blue-marble, p.mission, p.cap
  div.story-end  p.coda, p.ethos
```

Static layout (no JS or reduced motion): photo, credit, line; photo, credit, line; Earth, mission, credit; coda. At 1440 the two photographs sit in cols 1-5 with their lines in cols 7-12, one row each, 96 px row gap.

Scrubbed layout (JS adds `.anim` to `<html>` only when motion is allowed and `position: sticky` is supported):
- `.story-a` is 300svh tall, `.story-b` 190svh. Each `.stage` is `position: sticky; top: 0; height: 100svh; overflow: hidden`.
- Phone (below 1024): both frames fill the stage (`object-fit: cover; object-position: 50% 40%`). A bottom gradient `rgba(0,0,0,0) 45% → .72 82% → .86` sits over the photo. Lines sit at `bottom: 64px + safe-area`, credits at `bottom: 18px + safe-area`, both inside the page margin.
- Desktop: frames are prints, not wallpaper (the sources are 681 px wide; full-bleed would upscale them 2x and blur). Frame `top: 8svh; height: 84svh; width: (84svh - 34px) * 681/1024`, left edge on the content grid, 4 px radius, credit 12 px under the image. Line to the right, vertically centered, `max-width: 13em`.
- Blue Marble: centered, `width: min(100%, 74svh, 760px)`, square, feathered into the black with `mask-image: radial-gradient(closest-side, #000 86%, transparent 100%)`. Mission line beneath, then credit.

```
phone, section A held (100svh)            desktop, section A held
 ┌──────────────────────┐                  ┌────────────────────────────────────────────┐
 │                      │                  │ ┌──────────┐                                │
 │   first steps photo  │                  │ │ print    │     Some moments happen once.  │
 │   (crossfades to the │                  │ │ 84svh    │        (crossfades to)         │
 │    altered version)  │                  │ │          │     And soon, some will never  │
 │▒▒▒▒▒▒ gradient ▒▒▒▒▒▒│                  │ └──────────┘     have happened at all.      │
 │ Some moments         │ line, 28 px      │ credit                                      │
 │ happen once.         │                  └────────────────────────────────────────────┘
 │ First Steps #6 ...   │ credit, 13 px
 └──────────────────────┘
```

**Scroll model (scrub-symmetric).** Every animated value is a pure function of scroll position and layout, computed in a block marked `PURE SCROLL MODEL`. The reference implementation is in `src/mock/index.html`; lift it as is:

```js
function smooth(x, a, b) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function clamp01(x) { return Math.min(1, Math.max(0, x)); }
// g = { aTop, aH, bTop, bH, stageH } measured from layout on load and resize, never on scroll
function storyFrame(y, g) {
  var pa = clamp01((y - g.aTop) / Math.max(1, g.aH - g.stageH));
  var pb = clamp01((y - g.bTop) / Math.max(1, g.bH - g.stageH));
  return { pa: pa, pb: pb,
    l1: smooth(pa, .04, .16) * (1 - smooth(pa, .40, .48)),
    cap1: 1 - smooth(pa, .40, .47),
    turn: smooth(pa, .48, .64),
    cap2: smooth(pa, .60, .68),
    l2: smooth(pa, .66, .78),
    mission: smooth(pb, .16, .40),
    turnLive: pa > .44 && pa < .68 };
}
```

Timeline of section A (160svh of travel): line 1 fades in over the first 12%, holds, leaves by 48%; the altered photograph crossfades over the original from 48% to 64%; its credit replaces the original credit with a gap between them; line 2 arrives from 66% and holds to the end. Section B: the mission line and credit fade in between 16% and 40% of its 90svh travel, then the Earth holds.

Rules the engineer must keep:
- Only `opacity` is written per frame. No transforms, no scale, no Ken Burns.
- Geometry uses `stage.offsetHeight` (100svh), not `innerHeight`, so URL-bar collapse on phones does not shift the timeline.
- One rAF-throttled passive scroll listener; write a style only when its rounded value changes; skip all writes when neither section is within one viewport.
- Compositor: no fixed layers anywhere on the page. The only element that gets `will-change: opacity` is the altered photograph's frame, and only while `turnLive` is true. Base photographs are never promoted. Maximum live layers: one (the brief allows two).
- `scripts/verify_scroll.mjs` is replaced by `scripts/verify_story.mjs` (reference: `src/verify_story.mjs`, passes against the reference build and fails a mutated model with 90 failures). It extracts the marked block and asserts purity (down equals up), ranges, no overlap of the two lines or two credits, at most one live layer, end states, and a URL-bar-collapsed geometry. Keep the markers byte-identical.
- `?debug=1` keeps working: a fixed HUD showing `pa`, `pb`, each opacity and `turnLive`. Zero cost when absent.
- After the change, the founder re-tests on the low-RAM Android (CLAUDE.md compositor rule). This is required, not optional.

Images: `assets/v2/story/first-steps-681.webp|jpg` (36 / 70 KB), `assets/v2/story/turn-681.webp|jpg` (30 / 64 KB), `assets/v2/story/blue-marble-760.webp|jpg` and `-1200.webp|jpg` (50 / 104 KB webp). All lazy with `decoding="async"`. First steps and turn share 681x1024 framing exactly (asserted in the build), which the crossfade depends on.

### 2.7 Close (`id="get"`)

Job: one decision, plus the iPhone door.

```
360                                   1440
 Keep what's real, real.   H2          cols 1-6                         cols 8-12
 Free on Android. Verification ...    Keep what's real, real.          ┌ waitlist panel ──────┐
 [ Get it on Google Play ]  full      Free on Android. Verification... │ Not on iPhone yet.   │
 ┌ waitlist panel ────────┐           [Get it on Google Play]          │ body                 │
 │ Not on iPhone yet.     │                                            │ Email [__________]   │
 │ Email [______________] │                                            │ What will you use... │
 │ What will you use it.. │                                            │ [________________]   │
 │ [ Join the iPhone wait]│                                            │ (Join the iPhone ...)│
 │ status line            │                                            └──────────────────────┘
 └────────────────────────┘
 To Protect What's Human   Playfair    To Protect What's Human
```

**Waitlist form.** One `<form id="wl" novalidate>`, fields: `email` (type email, `autocomplete="email"`, `inputmode="email"`, required), `use_for` (textarea, 2 rows, `maxlength="500"`), honeypot `website` (off-screen, `tabindex="-1"`, `aria-hidden="true"`), hidden `source=rialiti.io-home`. Labels are visible `<label>`s, never placeholders. Field: 52 px min height, 14/16 padding, 17 px text (no iOS zoom), `#0C0D11` fill, `#5B6573` border, 12 px radius; hover border `#7D8794`; focus border ink plus 1 px ink ring; invalid border and ring `#FF8A8A` with `aria-invalid="true"`. Submit: ink pill `#EEF1F5` with `#0C0D11` text, 52 px, full width below 700. Panel: `#14171C`, 1 px `#2A3038` border, radius 20, padding 28/20/24 (36/36/28 desktop).

`WAITLIST_URL` constant at the top of the page script, default `""`. Behavior:

| State | Trigger | UI |
|---|---|---|
| idle | load | as rendered (`assets/v2/reference/waitlist-idle-*.png`) |
| invalid | submit with empty or malformed email | no request; email gets `aria-invalid`; status (red) "Enter an email address, like name@example.com."; focus the email field |
| submitting | valid submit, `WAITLIST_URL` set | button disabled, text "Joining…", `aria-busy="true"` on the form |
| success | response JSON `{ok:true}` | fields hidden (`.done .row { display:none }`), status (green, check icon) "You're on the iPhone waitlist. We'll email you when RIALITI Capture is on the App Store."; move focus to the status (`tabindex="-1"`) |
| preview | valid submit, `WAITLIST_URL` empty | no request; status (ink) "The waitlist isn't connected yet, so nothing was sent. Your email stayed on this page." Fields stay filled. |
| error | network failure, non-2xx, or `{ok:false}` | button re-enabled; status (red) with the matching message in `copy.md` (`invalid_email` → invalid message, `too_long` → note message, anything else → "That didn't go through. Check your connection and try again.") |

Request: `fetch(WAITLIST_URL, { method: "POST", body: new URLSearchParams({ email, use_for, source: "rialiti.io-home", user_agent: navigator.userAgent, page: location.href, website }) })`. Form-urlencoded keeps it a CORS simple request (no preflight). Read the JSON. 12 s timeout via `AbortController`, then the error state. The status element is `role="status" aria-live="polite"`. Backend: `waitlist-apps-script.gs` (deploy steps at its top). No-JS: the form's `action` is set to the same `/exec` URL (with a hidden `reply=html`) once deployed, and the script returns a small HTML page; while unset, a `<noscript>` line says "The iPhone waitlist opens soon."

Before launch the engineer must test one real submission against the founder's deployed script and confirm the browser can read the JSON. If a browser cannot, switch that call to `mode: "no-cors"` and treat an opaque response as success (the pattern shotnotgenerated.com uses). Record which one shipped.

Signature: "To Protect What's Human", Playfair italic, 24 to 32 px, story-ink, left-aligned, spanning the grid, 56 px above the footer.

### 2.8 Footer

```
360                                   1440
 [mark] RIALITI                        [mark] RIALITI   RIALITI Check  Privacy  Photograph credits  founders@rialiti.io   © 2026 RIALITI. Google Play is ...
 RIALITI Check  Privacy
 Photograph credits  founders@rialiti.io
 © 2026 RIALITI. Google Play is a trademark of Google LLC.
```
1 px `#2A3038` top rule, padding 32/48, 14 px muted links with 6 px vertical hit padding, 24 px apart; legal 13 px. Desktop: 3-column grid `auto 1fr auto`, links centered. "Photograph credits" points at `/CREDITS.md` as today (a rendered `/credits/` page is an optional later improvement). No Guides link until a guide exists.

### 2.9 404 page

`/404.html`, own small inline CSS with the same tokens, absolute asset paths (`/assets/v2/...`) because it is served at any depth. Header with mark and wordmark linking home, then vertically centered H1 "This page traces back to nothing.", body, green "Go to the home page" button and "Check a photo" link. `noindex`. Reference: `src/404/index.html`, renders `assets/v2/reference/404-360.png` and `404-1440.png`.

## 3. Plumbing the engineer must ship

- Head: everything in `copy.md` "Head", `<link rel="canonical">`, `<meta name="theme-color" content="#0C0D11">`, favicons unchanged (`assets/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`), preload Lexend only.
- OG and Twitter: `assets/v2/og/og-1200x630.jpg` (59 KB). The PNG is the master.
- JSON-LD: Organization plus SoftwareApplication, strings in `copy.md`.
- `robots.txt` (allow all, sitemap line) and `sitemap.xml` (`/` and `/privacy/`; add guides as they ship).
- Remove: the letter rail, flying letters, mosaic layer and `assets/mosaic.jpg` reference, the tabs, the APK block and counter link, the Gmail mailto, the opening thesis. Old assets can stay in the repo; the page just stops loading them.
- Headings: one visible H1 (hero), H2 per section (story H2 visually hidden), H3 for use cases and the waitlist.

## 4. Budgets and measurements

- Above the fold on a phone: HTML plus inline CSS (about 20 KB), Lexend 38 KB, capture 24 KB, record panel 15 KB, mark 2.8 KB. About 100 KB total. Hero text needs no image to read.
- Whole page, phone, webp: about 400 KB including both fonts and every image (story and proof are lazy).
- No JavaScript is needed to read anything. JS does three jobs only: the story scrub, the waitlist submit, the debug HUD.
- Check at 360, 768 and 1440: no horizontal overflow, H1 on 2 lines, Play button inside the first phone screen, story lines never overlap, safe-area insets respected at the bottom of the story stage on gesture-nav phones.
- Lighthouse-style: LCP under 1.0 s on mid-range mobile (throttled 4G), CLS 0 (every `<img>` has width and height), no layout-shifting web fonts beyond `swap`.

## 5. Files

| Path | What |
|---|---|
| `docs/design/2026-10-28-v2/design.md` | this spec |
| `docs/design/2026-10-28-v2/copy.md` | every string |
| `docs/design/2026-10-28-v2/qa.md` | claims, honesty, contrast, credits, tells, open items |
| `docs/design/2026-10-28-v2/credits-additions.md` | entries to merge into `CREDITS.md` |
| `docs/design/2026-10-28-v2/waitlist-apps-script.gs` | waitlist backend |
| `docs/design/2026-10-28-v2/src/mock/index.html` | reference build (not the site) |
| `docs/design/2026-10-28-v2/src/404/index.html` | 404 reference |
| `docs/design/2026-10-28-v2/src/og.html` | OG source |
| `docs/design/2026-10-28-v2/src/build_assets.py` | builds every raster in `assets/v2/` from repo files |
| `docs/design/2026-10-28-v2/src/render_mock.mjs`, `render_extra.mjs` | reference and OG renders |
| `docs/design/2026-10-28-v2/src/verify_story.mjs` | story model verifier |
| `docs/design/2026-10-28-v2/src/sources/` | check-page capture (2026-10-28), hand-edited car and its script |
| `assets/v2/` | fonts, hero, problem, proof, story, og, icons, reference renders |

Re-render (from `docs/design/2026-10-28-v2/src/`):
```
python3 build_assets.py && PATH=~/.nvm/versions/node/v22.18.0/bin:$PATH node render_extra.mjs && PATH=~/.nvm/versions/node/v22.18.0/bin:$PATH node render_mock.mjs && PATH=~/.nvm/versions/node/v22.18.0/bin:$PATH node verify_story.mjs
```
The render scripts import the cached `playwright-core` by absolute path and drive system Chrome.
