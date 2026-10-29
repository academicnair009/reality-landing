# RIALITI home page v2: QA

Date 2026-10-28. Covers the design deliverables (`design.md`, `copy.md`, assets in `assets/v2/`, the reference build). The engineer's build needs its own QA pass against this file.

## 1. Claims check against the brief

| Claim on the page | Basis | Verdict |
|---|---|---|
| "Prove your photo is real." / "proof it's real" framing | Brief product truth: the product proves a capture is real and unedited | Allowed wording |
| "free RIALITI Capture app", "Free on Android" | Play listing (fetched 2026-10-28): Install with no price, "No ads" | True |
| "Anyone can check it, even after WhatsApp." | Brief: "Anyone uploads any copy of a photo (even after WhatsApp compression)"; Play listing: "compressed copies from messaging apps still verify against the original" | True |
| "Three steps. No account." | Privacy page and Play listing: "No accounts, no sign-in" | True |
| "Anyone checks it free at check.rialiti.io." / "Verification will always be free." | Brief (canonical line) | True |
| "An edited photo or an AI image traces back to nothing." | Brief, verbatim product truth | True. It says what a check finds, not that RIALITI detects anything. |
| "Videos work the same way." | Play listing: "takes photos and videos"; check page: "Check a photo or video" | Removed from the page 2026-10-28 (founder: unverified claim, decide later). |
| "A toy car, shot in RIALITI Capture on 21 September 2026." | Live record, re-checked 2026-10-28: Captured 2026-09-21T04:20:31Z, "Verified attested capture", Tier 1, match 100.0% | True (UTC date) |
| "The toy car at the top of this page has a public record." | Same record, public at `check.rialiti.io/e/ra-e58e1b6d5bed4de9`; brief allows this record on the page | True |
| "RIALITI Check, opened on 28 October 2026." | Screenshot taken by me that day; source kept in `src/sources/` | True |
| Problem pair "Edited" / "Made by us, by hand" | `make_edit.py`: OpenCV interpolation, no generator | True, disclosed in tag, note and alt |
| "Both look real. Only one can prove it." | The real one has a record; the edited one has none | True. Does not claim the app spots the edit. |
| Use case lines | Each says what a dated, unedited capture shows. The pets line was rewritten from "really yours" (ownership, unprovable) to "a real animal, photographed today". "Prove you have it in hand" holds because the photo shows it in hand at capture time. | True |
| "Every photograph on this page is real. The two we altered say so." | Credits plus on-page captions for the turn and the edited car | True. The added sentence is there so the canonical line is not undercut by the two altered images. |
| "We won't use it for anything else." (waitlist) | A promise. Nothing technical prevents misuse, so the founder must honor it | Needs founder OK (open item 3) |

Not on the page anywhere: testimonials, logos, user or download numbers (Play shows "10+ downloads"; deliberately not used), press, funding, ratings, dates for iPhone.

## 2. Honesty rail

- Forbidden phrases grep (`spot fake`, `spot the fake`, `detect AI`, `detection AI`, `AI detector`, `spot the edit`, plus the machine tells `unlock`, `elevate`, `seamless`) over design.md, copy.md, credits-additions.md, the Apps Script and all three HTML sources: **0 hits**.
- Em dash (U+2014) and en dash (U+2013) grep over the same files: **0 hits**. The check-page screenshot was cropped to exclude that page's own tagline, which contains an em dash.
- Names grep (owner, cofounder, Gmail address): **0 hits** in public strings. "Gmail" appears only in the instruction to remove the old mailto. Contact on the page: `founders@rialiti.io` (role address, already on the privacy page).
- No generated imagery. Every raster is a real photograph, a real screenshot of RIALITI software, or a typeset composite of those. The edited car and the turn are real photographs altered by hand, labeled on the page, in alt text and in credits.
- The hero capture is a crop of a screenshot, so that file will not verify if uploaded. The page never invites anyone to upload it; the proof link opens the record instead. The demo stays off until real files exist.
- Canonical mark: `assets/v2/icons/rialiti-mark.svg` is byte-identical to `branding/rialiti-logo-vector.svg` (`cmp` clean). Used at 34x28 and 26x21, never recolored. Clear space: 12 px to the wordmark.
- The Play button does not imitate Google's badge (no badge shape, no Play logo, no lockup). Trademark line in the footer.

## 3. Contrast (WCAG 2.1, computed)

| Foreground | Background | Ratio | Need |
|---|---|---|---|
| ink `#EEF1F5` | bg `#0C0D11` | 17.14:1 | 4.5 |
| ink `#EEF1F5` | panel `#14171C` | 15.86:1 | 4.5 |
| muted `#A3ADBA` | bg `#0C0D11` | 8.55:1 | 4.5 |
| muted `#A3ADBA` | panel `#14171C` | 7.91:1 | 4.5 |
| green `#34D399` (success text, tag) | bg `#0C0D11` | 10.10:1 | 4.5 |
| green `#34D399` | panel `#14171C` | 9.34:1 | 4.5 |
| green `#34D399` | tag fill `#10261E` | 8.29:1 | 4.5 |
| green-ink `#04251A` | green `#34D399` (Play button) | 8.50:1 | 4.5 |
| green-ink `#04251A` | green-hover `#5EE0B0` | 9.94:1 | 4.5 |
| flag `#FF8A8A` (errors, tag) | bg `#0C0D11` | 8.56:1 | 4.5 |
| flag `#FF8A8A` | panel `#14171C` | 7.92:1 | 4.5 |
| flag `#FF8A8A` | tag fill `#2A1719` | 7.49:1 | 4.5 |
| bg `#0C0D11` (submit text) | ink `#EEF1F5` | 17.14:1 | 4.5 |
| story-ink `#F4F1EC` | black | 18.64:1 | 4.5 |
| story-muted `#B5AFA6` | black | 9.65:1 | 4.5 |
| story-ink over photo, worst case (white pixel under the 0.72 scrim = `#474747`) | | 8.25:1 | 3 (28 px) |
| story-muted credit over photo, worst case under the 0.86 scrim (`#242424`) | | 7.13:1 | 4.5 |
| field border `#5B6573` (non-text) | field `#0C0D11` / panel `#14171C` | 3.29:1 / 3.04:1 | 3 |
| field border hover `#7D8794` | field `#0C0D11` | 5.33:1 | 3 |
| focus ring ink | panel | 15.86:1 | 3 |

First pass had field borders at `#3A424D` (1.91:1, failed 1.4.11). Fixed to `#5B6573`.

## 4. Dimensions and weights (Pillow and Chrome measurements)

- OG: `assets/v2/og/og-1200x630.png` 1200x630 (248 KB master), `og-1200x630.jpg` 1200x630 (59 KB, the one to ship). Checked at unfurl size (375x197): headline and record panel both legible.
- Reference renders (`assets/v2/reference/render-report.json`): document width equals viewport at 360, 768 and 1440 (no horizontal overflow); H1 is 2 lines at all three (42, 61 and 92 px); Play button top at y 305 on a 360x740 screen; no overflowing text nodes.
- Phone above-the-fold assets: Lexend 38 KB + capture 24 KB + record panel 14 KB + mark 3 KB, about 80 KB plus HTML.
- Whole page on a phone with WebP: 291 KB of fonts and images. `assets/v2/` total without reference renders: 1.7 MB (JPEG/PNG fallbacks and 2x variants included; a visitor downloads one of each).
- Story model: `node src/verify_story.mjs` PASS at phone 740, phone with URL bar collapsed, desktop 900 (836 to 1016 sampled positions each; down equals up; no overlaps; at most one live layer). A mutated model (line 2 starting at 30%) fails with 90 failures, so the verifier bites.

## 5. Phone-size review (what I looked at, and what I fixed)

Looked at every reference render at full size and the 360 renders at 1:1, plus story frames at 10%, 56%, 85% (section A) and 50% (section B) at 360 and 1440.

Fixed during review:
1. "RIALITI Capture" was bolded inside the lead: a single-phrase accent, one of the listed tells. Now plain.
2. The record panel covered the car. Recomposed so the photo crops from the bottom and the panel overlaps the table, not the car.
3. Problem pair as two 3:4 thumbnails side by side: at 360 the removed decals were invisible. Now stacked landscape crops around the car, full width.
4. Story captions overlapped mid-crossfade. Split into separate timed fades (`cap1`, `cap2`), now asserted by the verifier.
5. Step numerals hung outside the grid at 1440 and "app." orphaned. Numerals moved inside, steps measure widened, balanced wrapping.
6. Waitlist success state left the fields visible (inline style overrode the hide rule). Fixed.
7. Field border contrast (above).
8. Pair oversized at 768. Capped at 600 px below 1024.

## 6. Generated-page tells avoided

| Tell | How this design avoids it |
|---|---|
| Near-black background with one bright acid accent | The background is the app's own `#0C0D11`, sampled from the real screenshot, so the app screen sits on the page frameless. Green has two jobs only, both inherited from the app (verified, primary action). The mark's teal stays in the mark. |
| Tinted near-black standing in for black | The product half uses the app's background for a reason (continuity with a real screen). The story uses true black, the photographs' own. |
| Cream plus serif plus terracotta | Not used. Cream and forest campaign system deliberately not chosen for the home page (it would break the ad, Play listing, app chain). |
| SaaS card kit (identical rounded cards, one radius, grey shadow, gradient washes) | Use cases are a typographic list. Steps are type. Radii differ by role (20 photo, 16 panel, 12 field, pill button). One shadow, only where a UI panel floats over a photo. No gradients except the functional scrim under story text. |
| All-caps eyebrow labels above headings | None. The only caps are inside the real app screenshots. |
| Accenting one word in a headline | None (fixed the one instance in the lead). |
| Meta strings joined with middle dots | None. The old "Version 0.8.2 · about 24 MB" line is gone. |
| "WORD, spaced em dash, fragment" labels, and em dashes generally | None anywhere. |
| Monospace for data labels | The record id appears in the app's own pixels and in Lexend in text. No monospace face loaded. |
| Arrow appended to links and buttons | None. |
| Numbered markers on non-sequences | Numbers only on the three steps, which are a sequence. |
| Fade-and-slide-up on every section, hover effects on every card | One load moment (the record panel attaching to the photo) and one scroll mechanism (the turn). Everything else is still. |
| Big number with a small label | No stats at all. None exist that we can print honestly. |
| Generic stock or generated imagery | Real capture, real check page, real archival photographs, each with its provenance on the page. |
| Centered everything | Left-aligned throughout; one centered moment (Blue Marble and mission). |
| Template chrome that would appear on any page | The provenance caption device is specific to a product about where images come from. |

## 7. Rubric

| Dimension | Score | Evidence |
|---|---|---|
| Idea | 5 | Headline plus real verified capture says the offer in 2 s at 360. |
| Hierarchy | 4 | H1, then green Play button, then the image. The text link and the aside compete a little at 360; acceptable. |
| Typography | 4 | Two families with a defined role split, fluid scale, balanced rag, H1 2 lines at every width. Lexend is wide; the use-case H3s at 360 are close to 2 lines for the longest item. |
| Color/contrast | 5 | All pairs AA, most AAA; green restricted to two meanings. |
| Layout | 4 | Grid holds at 360, 768, 1440; tablet is a stretched phone layout, which is fine but plain. |
| Brand fit | 5 | App tokens, canonical mark, Lexend wordmark matching the Play feature graphic. |
| Craft | 4 | Real pixels throughout. The hero capture is a 786 px crop of a screenshot, so at 2x on desktop it is about 1.8x density, slightly soft on retina. |
| Honesty/rules | 5 | Greps clean; every altered image disclosed; no generated imagery. |
| Motion | 4 | One load moment, one scrub mechanism, opacity only, verified pure. Needs the founder's phone test before it counts as 5. |

No must-fix items remain in the design. Polish suggestions are in open items.

## 8. Open items

For the founder:
1. **A better real capture for the hero (optional).** The toy car is honest but small-stakes. A real capture of a used car, a watch or a phone, archived in the app, would land harder with sellers. The slot takes any capture plus its record id: drop the Verified screenshot into `assets/play/screens/` and rerun `src/build_assets.py` with new crop boxes. Until then the toy car stays, described as a toy car.
2. **Demo files.** The demo stays off until you supply a real capture and the real WhatsApp copy (and optionally an AI recreation). Confirm the verdict lines on check.rialiti.io before it ships.
3. **Waitlist promise.** "We won't use it for anything else." is a commitment. Keep it or cut it.
4. **Deploy the Apps Script** (three steps at the top of `waitlist-apps-script.gs`) and send the `/exec` URL. Until then the form shows the honest preview message.
5. **"Videos work the same way."** Removed 2026-10-28 by founder instruction; re-add only after the founder decides.
6. **Low-RAM phone test** of the new story (required by the compositor rule).

For the engineer:
7. Test one live waitlist submission and confirm the browser can read the JSON from Apps Script; fall back to `no-cors` with optimistic success if not (see design.md 2.7).
8. Replace `scripts/verify_scroll.mjs` with `scripts/verify_story.mjs` (reference in `src/`).
9. `CREDITS.md` is served as raw Markdown. A rendered `/credits/` page would read better; optional.

Not verified by me:
- Whether Google Play's referrer parameter is received by an app with no install-referrer SDK. The UTM tag is harmless either way, but it may not show in Play Console acquisition reports.
- The Play listing's minimum Android version (the listing page did not expose it), so the page does not state one.
- Apps Script CORS readability for this exact deployment (item 7).
- Rendering on a real low-RAM Android; all checks here are headless Chrome on a Mac.
