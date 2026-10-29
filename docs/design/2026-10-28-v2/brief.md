# RIALITI home page v2: brief

Date: 2026-10-28. Owner decision: the founder judged the current home page "not good; a person visiting will never understand what RIALITI Capture can be used for" and asked for the best possible website for the product, built by the creative director and an engineer who go all out.

## Product truth (do not deviate)
- RIALITI Capture: free Android app on Google Play, package `app.rialiti.capture`, listing https://play.google.com/store/apps/details?id=app.rialiti.capture (live). You take a photo inside the app; the capture is attested on the device and archived with a public record id.
- RIALITI Check: https://check.rialiti.io. Anyone uploads any copy of a photo (even after WhatsApp compression) and learns whether it traces back to an archived real capture. Free, forever.
- An edited photo or an AI image traces back to nothing. The product PROVES a capture is real and unedited. It does NOT detect AI or fakes. Allowed: "prove it's real", "ask for proof", "proof it's real, not edited". Forbidden: "spot fakes", "detect AI", "AI detector", "spot the edit".
- Who it is for now: online selling and buying where photos decide the deal (used cars, watches, phones, Shopify and marketplace sellers, rentals and move-outs, pets), plus insurance, disputes and reporting.
- iPhone: not available. The page carries an iPhone waitlist. No date promised.
- Verified record used publicly in the live ads and allowed on the page: `ra-e58e1b6d5bed4de9`.
- Mission line, canonical: "To Protect What's Human". Keep "Every photograph on this page is real." and "Verification will always be free."

## Decisions already made
- Architecture follows the creative director's critique at `docs/design/2026-10-28-v2/critique.md`: hero with product name, promise, Play button and "Check a photo for free"; the problem in one beat; six use cases; three steps; proof moment; the photo story moved below the product and cut to three beats (first steps, the turn, Blue Marble with mission line); close with Play button, iPhone waitlist, mission line. The director may improve on this but must say what changed and why.
- The August rule "mechanism-free, never explain how" is lifted for everything above the story. The story section keeps its voice.
- Visual system: the director decides, within the brand (canonical wordmark, dark site, Lexend and Playfair available) and must feel like one brand with the Play listing art in `assets/play/` and the app. Elite, not generic SaaS.
- Android door: Google Play link, replacing the sideload APK block and all alpha notes. Append `&referrer=utm_source%3Drialiti.io` to the Play URL. The APK counter link disappears from the page.
- iPhone waitlist: a form (email only, optional "what will you use it for" free text) that POSTs to a Google Apps Script endpoint, same pattern as the shotnotgenerated.com signup. Ship `docs/design/2026-10-28-v2/waitlist-apps-script.gs` and a `WAITLIST_URL` constant. Until the founder deploys the script, the form is in preview mode: it still renders, and submitting shows an honest "not connected yet" line. No personal email address on the page.
- "Test it yourself" demo: build the section ready, but it ships only when real files exist (a real capture, the same file after a real WhatsApp send, optionally an AI recreation). Keep it switched off until the founder supplies them. Never fabricate the WhatsApp copy.
- Use-case tiles will later link to SEO guides. Until those exist, tiles are not links (no dead links). Reserve a `/guides/` path.
- Em dashes: none anywhere in copy, including the page title and the beat 5 line (rewrite with commas or a full stop).
- Credits: every photograph stays credited in CREDITS.md and remains real.

## Engineering invariants (from CLAUDE.md, still binding)
- Static site on GitHub Pages, no build system, no frameworks, no JS libraries. Self-hosted images. One `index.html` is acceptable; supporting CSS/JS files are acceptable if that makes the page easier to maintain.
- Without JS or under `prefers-reduced-motion` the page is complete and readable.
- Any scroll-driven animation is a pure function of scroll position (scrub-symmetric) and `scripts/verify_scroll.mjs` must be updated and pass, or be replaced by an equivalent verifier if the story mechanism changes.
- Compositor rule: at most two promoted large layers at a time; parked photo wrappers `visibility: hidden`; `will-change` only while moving. The founder's low-RAM Android is the acceptance device.
- Performance: hero readable in under one second on a mid-range phone; images sized and lazy-loaded; fonts with `display=swap`; total above-the-fold weight small.
- Accessibility: WCAG AA contrast, keyboard reachable, focus visible, alt text honest.
- SEO plumbing: search-relevant title and meta description, canonical, Open Graph and Twitter cards with a real 1200x630 image, `robots.txt`, `sitemap.xml`, JSON-LD for Organization and SoftwareApplication (Android), semantic headings.

## Deliverables
1. Creative director: `docs/design/2026-10-28-v2/design.md` (final architecture, section by section, with the job, exact copy, layout at phone and desktop, imagery and motion), `copy.md` (every string on the page, final), rendered assets in `assets/v2/` (OG image, any composed hero or use-case imagery, icons), and `qa.md` (claims check, honesty rail, contrast, credits).
2. Engineer: the site, on a branch, verified at 360px, 768px and 1440px with screenshots, Lighthouse-style checks, verifier passing, and a report.
3. Nothing is pushed or deployed without the founder's explicit approval.
