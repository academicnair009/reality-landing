# RIALITI guides: build report

Date 2026-10-28. Branch `guides` (worktree `~/.codex/worktrees/landing-guides`). Not pushed.

## What was built

A reusable guide template, a generator, and three pages:

| Page | URL | Hook | Default ad cell | Organic `utm_content` |
|---|---|---|---|---|
| Used cars | `/guides/used-cars/` | 68%, Cazoo via AM Online | `guide-used-cars` | `used-cars` |
| India | `/guides/india/` | Rs 65,782, Delhi Police via Asianet Newsable | `in-a` | `india` |
| AI pillar | `/guides/how-to-tell-if-a-photo-is-ai/` | 52%, Conjointly | `ai-a` | `ai-pillar` |

Files:

| Path | What |
|---|---|
| `guides/_template/page.html` | Page skeleton: head and SEO plumbing, header, lede (hook, AI line, H1, premise, Play button), close, Play bar, footer |
| `guides/_template/sections.html` | Section partials: how (seller and buyer steps with the two screenshots), answer, checklist, text, faq |
| `guides/_template/guides.css`, `guides.js` | Shared style and script. The generator inlines both into every page, so a guide is one request plus the font. |
| `scripts/build_guide.py` | Generator, Python 3 standard library only. Deterministic. Lints every page. |
| `guides/<slug>/content.md` | One content file per page. `index.html` beside it is generated and committed. |
| `assets/guides/` | Shared screenshots (webp and jpg) and one OG card per page |
| `docs/design/2026-10-28-guides/src/` | `build_guide_assets.py` (screenshot crops), `og-<slug>.html` and `render_og.mjs` (OG cards), `render_guides.mjs` (renders and checks) |
| `robots.txt`, `sitemap.xml`, `.nojekyll` | Site root. The generator adds each new guide to `sitemap.xml`. |
| `assets/v2/fonts/*.woff2`, `assets/v2/og/og-1200x630.jpg` | Committed here because the guides reference them. Byte-identical to the v2 copies, so a merge with the v2 branch adds the same blobs and does not conflict. |

### Page structure (top to bottom)

1. Slim header: mark and wordmark linking home, a "Get the app" text link (tagged Play URL).
2. Hook: one sourced number set large (88 to 192 px, sized to fit when it is long, like "Rs 65,782"), a one-line sentence, and a source credit that links to the original. Every number on these pages carries its source on the line beneath it, the same idea as the home page's provenance captions.
3. AI line, under a hairline: the second half of the hook ("And AI can now erase a dent or change a mileage photo in seconds. Most people can't tell by looking.").
4. H1 and a two-sentence premise. Then the Play button, "Check a photo for free", and a one-line aside. On desktop, the real Verified capture screenshot sits in the right columns.
5. "How it works between a seller and a buyer": numbered seller steps first, a dotted handoff line ("The photos go out the usual way..."), then numbered buyer steps. Sourced facts sit in the buyer block. Each side has a real screenshot with a provenance caption: the app's Verified capture panel for our toy-car test shot (record `ra-e58e1b6d5bed4de9`, linked) and RIALITI Check's answer for it.
6. "What the answer means": three lines. A check for what a match proves; a cross for "an AI image, or a photo edited with AI, traces back to nothing"; a muted cross for what it does not tell you.
7. Checklist: real checkboxes, so a seller can tick items off standing by the car. It works without JS and nothing is stored ("What to photograph" for cars; "Before you pay" for India).
8. FAQ (also emitted as FAQPage JSON-LD), a close with the Play button and the "Not on iPhone yet" line, an "Updated" date, the mission line, and the home page's footer.

The pillar adds two free-text sections ("What people look for", then "The other way: proof instead of guessing") and a "When this matters" list linking to both guides and the home page.

### The Play bar

- Phones and tablets (below 1024 px): a full-width bar fixed to the bottom inside `env(safe-area-inset-bottom)`, holding "RIALITI Capture / Free on Android" and one green "Get it on Google Play" button. The body has matching bottom padding and `scroll-padding-bottom`, so the bar never covers content or a focused element.
- Desktop: a compact card in the empty right rail (columns 10 to 12). The article column ends at x=925 at 1440 and the card starts at x=1058, so it never covers text.
- Rule: the bar is shown exactly when no in-page Play button is fully on screen. That covers the brief (hidden while the hero button is on screen, shown once you scroll past it) and two cases the brief did not cover. First, on a 360x780 phone the hero button starts just below the fold, so the bar fills that gap from the first frame. Second, the bar steps aside again at the closing button, so there are never two Play buttons on screen. Visibility is a pure function of what is on screen. My first version latched a "scrolled past" flag from observer events, and a jump past the button (an anchor or a restored scroll) left the bar hidden for good. The render test caught it.
- No JS: the bar is simply always shown (`html.js` is only set when IntersectionObserver exists).
- Reduced motion: no transition, no transform. Measured transition duration 0s, 0 running animations.
- Keyboard: the hidden bar is moved off screen and made transparent, but it stays in the tab order, and `:focus-within` brings it back. Tabbing through the page reaches it after the closing button, and no focused element is ever under the bar.

### Play link

`https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=<encodeURIComponent(ref)>`, `target="_blank" rel="noopener"`, on all four Play links on each page.

- `?c=<cell>` present: `ref = utm_source=meta&utm_medium=paid&utm_campaign=marketplace-oct26&utm_content=<cell>`. The cell must match `[a-z0-9-]{1,32}`; otherwise the page's default cell is used. That includes `?c=` with an empty value.
- No `?c=`: the organic referrer written into the HTML at build time: `utm_source=rialiti.io&utm_medium=guide&utm_campaign=guides&utm_content=<organic_content>`. No-JS visitors also get this one, so a paid visitor without JS is attributed as organic. That is accepted and documented.
- No cookies, no storage, nothing sent anywhere.

### SEO

Indexable (`index, follow, max-image-preview:large`). Titles of 53, 56 and 59 characters, each naming AI. Meta descriptions of 151 to 155 characters. Canonical `https://www.rialiti.io/guides/<slug>/`. Open Graph `article` and Twitter `summary_large_image`, each with a guide-specific 1200x630 card composed from the real screenshot. JSON-LD `@graph` with Article (publisher and author is the RIALITI Organization, no person) and FAQPage. One H1, H2 per section, H3 for the roles and FAQ questions, `lang="en"` (`og:locale` `en_IN` on the India page). `robots.txt` allows everything except `/guides/_template/` and points at the sitemap. `sitemap.xml` lists `/`, `/privacy/` and the three guides.

`.nojekyll` is new and changes the whole site's Pages build. Without it, Jekyll would render each `content.md` (it has front matter) into a duplicate `content.html` page and would hide `_template/`. Nothing on the site relied on Jekyll: every page is plain HTML, and `.md` files without front matter, like CREDITS.md, were already served raw.

## Statistics chosen, and why

Each statistic was re-opened at its original source on 2026-10-28.

**Used cars hero: 68%.** "The possibility of hidden faults or undisclosed damage was a concern for 68% of respondents, followed by unclear vehicle histories at 45% and being overcharged at 41%." Source: Cazoo survey of 2,025 adults, AM Online, 23 October 2026 (https://www.am-online.com/news/only-a-third-of-used-car-buyers-trust-dealers-cazoo-finds). Why: it is fresh, specific to used cars, and names the exact thing photos are for (the damage you can't see). It speaks to the seller who installs as much as to the buyer. It needs no scam framing, so the page opens on a worry rather than an accusation. The page says "people asked about buying a used car" rather than "buyers", because the respondents were adults asked about buying. AM Online blocks scripted clients (HTTP 403 to curl and WebFetch), so the article was read in a real Chrome window.

Used cars body: Santander UK Scamtracker, 1 April 2026: cars £660,960 of more than £3.4m in purchase-scam claims for January to March 2026, more than four times the next category (pets, £158,557). In the FAQ: Conjointly, September 2025, 301 US adults: real photos judged correctly 49% of the time, AI images 52%, only 9% got 70% or more right.

Left out on purpose: KBB's "74% of vehicle shoppers prefer actual-vehicle photos". It turned out to be a 2006 study, too old to quote as current.

**India hero: Rs 65,782.** The Outer-North Delhi cyber police case (arrest 23.10.2025; Asianet Newsable, 27 October 2025): the victim "booked an iPhone 16 Pro for ₹100", paid in "29 UPI transactions", "a total transfer of ₹65,782", and the gang "gained their trust by showing fake customer chats and photos". It was the coordinator's recommendation and holds up: it is specific, it is relatable to 18 to 34 year olds, and fake photos are named as the trust device. Body: ETV Bharat, 17 October 2026 (Rajasthan Police, nearly Rs 18.60 crore, 101 complaints, 21 arrests, "cheap vehicle offers on platforms like OLX"), presented as a vehicle-offer fraud and not as a photo scam; The News Minute, 7 March 2020 (a Tamil Nadu police officer on fake vehicle photos: "This they source from the internet"). "Before you pay" checklist: Mumbai Cyber Police (Free Press Journal, 4 November 2025: "Never pay advance without physical verification of property", plus its "unusually attractive property images" red flag); the Delhi Police Cyber Cell OLX page (advance payment, QR codes, urgency, verifying the person); RBI Kehta Hai (https://rbikehtahai.rbi.org.in/qr.html: "You need to scan QR Codes for sending money. Not for receiving it."). Prices are written "Rs" because the self-hosted Lexend subset has no rupee glyph. English only; the content file notes that a Hindi variant is a later split.

The notes' link for "meet in person, inspect before paying" was the Delhi Police page, but that page does not say it. That advice is attributed to the Mumbai Cyber Police, who do. The notes' RBI URL (`website.rbi.org.in/.../fraud-through-upi-qr`) now redirects to the RBI home page, so the page links the live Kehta Hai QR page instead.

**Pillar hero: 52%.** From the same Conjointly test: "AI images were correctly identified 52% of the time", real photos 49%, only 9% scored 70% or better. It is the most direct answer to "how to tell if a photo is AI": mostly, you can't. AI line: Malwarebytes survey of 1,500 adults in the US, UK, Austria, Germany and Switzerland, reported by Help Net Security on 11 June 2026: the share who say they can no longer tell real from AI-generated content rose from 66% to 85%.

## Honesty and copy rails

- Each page says what the check proves and what it does not. It never says the app detects AI or spots fakes. The founder's requested FAQ "Can RIALITI detect AI images?" is worded "Can RIALITI tell whether an image is AI?" with the answer "No. It proves real ones." The word "detect" is on the banned grep list, and the rephrasing keeps the search intent.
- India: the page never claims the app prevents payment scams, stops UPI fraud or verifies the seller. It says so twice: in "What the answer means" and in the first FAQ entry ("Does RIALITI stop UPI fraud or prove the seller is honest? No.").
- No copy implies the reader has been scammed. "Facebook Marketplace" appears only as a venue, with no Meta logos.
- The generator fails the build (exit 2) if a rendered page contains an em dash, "spot", "detect", "AI detector", "attest", "hash", "cryptograph", "blockchain", "metadata", "alpha", "api.rialiti.io" or "gmail". It also fails when the title or H1 lacks "AI", the title runs over 60 characters, the [answer] section lacks its three lines, or the FAQ lacks the two standard AI questions.
- The check-result screenshot is cropped to the verdict and the two dates. The tier and device lines are left out, so the page shows no mechanism detail beyond the app's own "Verified attested capture" heading inside the image.

## Measurements

Measured with headless Chrome against `python3 -m http.server` on the repo root, at 360x780, DPR 2, mobile emulation.

| | Used cars | India | AI pillar |
|---|---|---|---|
| HTML (inline CSS and JS) | 37,667 B (10,717 gzip) | 39,205 B (11,243 gzip) | 37,494 B (10,628 gzip) |
| First load, phone (requests / bytes) | 4 / 110,271 B | 4 / 111,809 B | 3 / 79,960 B |
| Total with every image loaded | 153,333 B | 154,871 B | 153,160 B |
| Above-the-fold image bytes, phone | 2,774 B (mark SVG only) | 2,774 B | 2,774 B |
| Page height 360 / 768 / 1440 | 7,488 / 5,235 / 5,249 | 8,132 / 5,720 / 5,739 | 7,307 / 5,543 / 5,638 |
| Horizontal overflow (scrollWidth) | none (360, 768, 1440) | none | none |
| Console errors or warnings | 0 | 0 | 0 |
| Failed requests | 0 | 0 | 0 |

The first load is HTML, mark, Lexend (39,692 B) and, on two pages, the seller screenshot (30,138 B). The screenshot is `loading="lazy"`; Chrome fetches it early because it sits within its lazy-load distance. Playfair (21,952 B) is no longer fetched up front: the mission line uses `content-visibility: auto`, so the serif loads only when the reader nears the bottom. The hero is readable with no image at all.

## Verification results

| Check | Result |
|---|---|
| Renders | `renders/<slug>-360-{top,middle,checklist,bottom,full,nojs-middle,reduced-motion-middle}.png`, `-768-{top,middle,full}.png`, `-1440-{top,middle,full}.png` for each page (PNG, quantized to 256 colors to keep the repo small) |
| Bar visible: 360 top / reading / checklist / bottom / 768 reading / 1440 reading | true / true / true / false / true / true, all three pages. At 360x780 the hero button starts at y=751 to 799 (below the fold), so the bar shows from the first frame. At the bottom the closing button is on screen, so the bar steps aside. At 412x915 the hero button is in the first screen and the bar starts hidden. |
| Bar clear of the footer when forced on | yes (legal line bottom 656, bar top 804) |
| Desktop card overlaps the article | no (card x 1058, article right edge x 925) |
| No JS | bar visible; text length identical to the JS render (4,838 / 5,639 / 4,850 characters); Play href is the organic one |
| Reduced motion | bar shown with 0s transition, transform none, 0 animations |
| Keyboard | bar's button reached by Tab on every page; no focused element under the bar |
| Play URL, no parameter (used cars) | `https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=utm_source%3Drialiti.io%26utm_medium%3Dguide%26utm_campaign%3Dguides%26utm_content%3Dused-cars` |
| Play URL, `?c=uk-a` | `https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=utm_source%3Dmeta%26utm_medium%3Dpaid%26utm_campaign%3Dmarketplace-oct26%26utm_content%3Duk-a` |
| Play URL, `?c=Bad%20Cell` and `?c=` | the paid referrer with the page's default cell (`guide-used-cars`, `in-a`, `ai-a`) |
| Every link | all 200 (Play, check.rialiti.io, the public record, Santander, Conjointly, Help Net Security, ETV Bharat, Asianet, Free Press Journal, Delhi Police, RBI Kehta Hai, and every local path and asset), except AM Online, which returns 403 to scripts and 200 in Chrome (read there) |
| HTML structure | balanced tags, no duplicate ids, every `<img>` has width, height and alt, exactly one H1 |
| JSON-LD | parses; Article plus FAQPage with 5 / 5 / 4 questions |
| Grep (em dash, spot, detect, AI detector, attest, hash, cryptograph, blockchain, metadata, alpha, api.rialiti.io, gmail) | 0 hits on all three pages |
| Regeneration | `python3 scripts/build_guide.py --check --all` prints `same` for all three; sha1 used-cars `6285425b`, india `d2578f08`, pillar `735c26bc` |

Re-run everything:

```
cd ~/.codex/worktrees/landing-guides
python3 -m http.server 8765 --bind 127.0.0.1 &
PATH=$HOME/.nvm/versions/node/v22.18.0/bin:$PATH node docs/design/2026-10-28-guides/src/render_guides.mjs used-cars india how-to-tell-if-a-photo-is-ai
python3 scripts/build_guide.py --check --all
```

## How to add the next guide in ten minutes

1. `mkdir guides/watches && cp guides/used-cars/content.md guides/watches/content.md`.
2. Edit the front matter: `slug` (must equal the folder name), `title` (60 characters or fewer, must contain "AI"), `description`, `h1` (must contain "AI"), `cell` (the default ad cell), `organic_content`, the `hook_*` fields (one number with its source URL), `ai_line`, `og_*`, and the dates. Every number must come from a source you open and link.
3. Rewrite the sections. Required: `[intro]`, `[how]`, `[seller]`, `[buyer]`, `[answer]` (exactly three paragraphs: match, AI, limits), `[faq]` (must include `### [ai-tell]` and `### [ai-check]`) and `[close]`. Optional: `[checklist]` and any number of `[text]` sections; they render in file order. The docstring at the top of `scripts/build_guide.py` is the format reference.
4. `python3 scripts/build_guide.py watches`. It writes `guides/watches/index.html`, adds the page to `sitemap.xml`, and refuses to build if the honesty rail or copy rules are broken.
5. Optional OG card: copy `docs/design/2026-10-28-guides/src/og-used-cars.html` to `og-watches.html`, change the number and lines, then run `node docs/design/2026-10-28-guides/src/render_og.mjs watches` (writes `assets/guides/watches/og-1200x630.jpg`) and set `og_image: /assets/guides/watches/og-1200x630.jpg`. Without one, the page falls back to the home page OG card.
6. Add the guide to the pillar's "When this matters" list (and to `GUIDE_ORDER` in `scripts/build_guide.py` if it should not sort last), then run `python3 scripts/build_guide.py --all`. That also rebuilds `/guides/` and every guide's "More guides" block (added 2026-10-29), which links the other guides and the home page and leaves out any link a page already makes.
7. Render, look at the 360 shots, commit.

If you change `guides.css`, `guides.js`, `page.html` or `sections.html`, run `--all`: every page inlines them.

## Open items and concerns

- The hero Play button sits just below the fold at 360x780 on all three pages, because the AI line added about 80 px to the hero. The bar covers that gap from the first frame, so the CTA is always in reach, but the founder may prefer a shorter hero.
- The seller and buyer screenshots show our toy-car test shot, labelled as such. A real car captured in the app would be stronger on the car pages. It needs the founder to shoot one and share its record.
- The check-result screenshot still shows the app's own heading, "Verified attested capture". The page text has no mechanism words, but the image does.
- `.nojekyll` changes how the whole site builds on Pages (see SEO above). It is safe for the current site; the v2 branch should keep it.
- The pages link the home page; until the v2 home page ships, "/" is the current v1 page.
- The used-cars and pillar pages cite a US survey (Conjointly) to a partly UK audience; it is labelled "301 US adults".
- The source-check pass on AM Online and RBI ran in a separate Playwright-launched Chrome window (not the founder's browser and not the Chrome extension) before the instruction to use WebFetch or curl only. Nothing else used a visible browser.
