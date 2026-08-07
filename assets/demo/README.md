# assets/demo — files for the "test it yourself" demo

The demo section on the landing page hands a visitor three downloads of the
**same moment** and invites them to run each one through
[RIALITI Check](https://check.rialiti.io) themselves. It is switched OFF until
all three files below exist.

The section's markup lives in `index.html`, inside `<section class="closing">`,
commented out between two lines that each read
`ENABLE ME BY DELETING THIS LINE`. Delete those two lines to turn it on, then
replace the three `TODO` alt texts with honest descriptions of the actual
photograph. Nothing else needs changing.

## Exact filenames expected

| Filename | What it must be |
| --- | --- |
| `original-capture.jpg` | The genuine capture, straight from the RIALITI capture app, byte-identical to what was archived. This is the reference the other two are tested against. |
| `whatsapp-compressed.jpg` | The **same** file after a real round trip through WhatsApp (send it to someone, save the copy they receive). Do not re-export it by hand — the point is the real, lossy transport the real world applies. |
| `ai-recreation.jpg` | An AI generated recreation of the same scene, as close to pixel-for-pixel as it can be made. Nothing about it was captured by a camera. |

All three are `.jpg`, referenced by these exact names, and are served as both
the on-page thumbnail (lazy-loaded, cropped 4:3) and the download.

## Before enabling, check

1. **All three actually behave as claimed.** Upload each to
   https://check.rialiti.io and confirm the verdicts match the three
   `verdict` lines on the page (matches / still matches / matches nothing).
   If reality disagrees with the copy, change the copy, not the claim.
2. **Sizes.** These are downloads, so they are deliberately exempt from the
   ≤150KB hero budget — but they load below the fold and lazily. Keep each
   under ~4MB so the demo is not painful on mobile data.
3. **Consent.** The photograph is going to be downloadable by anyone. Use one
   nobody needs to consent to, or one where consent is explicit.
4. **Credits.** Add all three to `CREDITS.md`, including the explicit note
   that `ai-recreation.jpg` is AI generated — see the note already there.

## Why an AI image is allowed here, and only here

The repo rule is "no AI generated imagery, ever". This one file is a
deliberate, labelled exception, in the same spirit as the distorted beat-5
photograph: it exists to be caught by the product, it is described as AI
generated in its alt text, in the page copy and in `CREDITS.md`, and it never
appears anywhere else on the site. If that labelling is ever dropped, the file
must be dropped with it.
