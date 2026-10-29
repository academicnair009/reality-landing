# assets/demo: files for the "test it yourself" demo

The proof section of the home page (`#proof`) can hand a visitor the files of
**one real moment** and invite them to run each one through
[RIALITI Check](https://check.rialiti.io) themselves. The demo is built and
styled but switched OFF until the real files below exist. Never fabricate the
WhatsApp copy, and never ship a verdict line that check.rialiti.io does not
actually return for that file.

## Where the switch is

In `index.html`, inside `<section class="proof" id="proof">`, after the live
record part, the block `<div class="demo" id="demo">` sits inside an HTML
comment opened and closed by two lines that each read
`ENABLE ME BY DELETING THIS LINE`. Delete both lines to turn it on, then
replace the one `TODO by founder` alt text with an honest description of the
photograph. Its styles (`.demo`, `.demo-card`, ...) are already in the page's
stylesheet. Keep the markup free of `--` while it is commented out.

## Exact filenames expected

| Filename | What it must be | Required |
| --- | --- | --- |
| `original-capture.jpg` | The genuine capture, straight from RIALITI Capture, byte-identical to what was archived. The reference the others are tested against. | yes |
| `whatsapp-compressed.jpg` | The **same** file after a real round trip through WhatsApp (send it to someone, save the copy they receive). Do not re-export it by hand. | yes |
| `ai-recreation.jpg` | An AI generated recreation of the same scene. Nothing about it was captured by a camera. | optional |

Each card shows its file as a 4:3 thumbnail (lazy-loaded, `width="800"
height="600"` so the ratio is reserved; any size file works) and offers it as a
download. If a file is not 4:3, adjust nothing: it is cropped with
`object-fit: cover`.

## Two-file or three-file version

The block ships as the three-file version. For the **two-file** version (no AI
recreation), in the block also:

1. delete the `<li class="demo-card demo-ai">` card,
2. delete the `<p class="demo-fine">` paragraph,
3. replace the lead with: "Download a real capture and the copy WhatsApp gave
   back. Put both through RIALITI Check and compare the answers."

(Exact strings are in `docs/design/2026-10-28-v2/copy.md`, section 5.)

## Before enabling, check

1. **Verdicts are real.** Upload each file to https://check.rialiti.io and
   confirm the three `verdict` lines (should match its archived capture /
   still matches the same capture / matches no capture at all). If reality
   disagrees with the copy, change the copy, not the claim.
2. **Sizes.** These are downloads, lazy-loaded below the fold; keep each under
   about 4 MB so the demo is not painful on mobile data.
3. **Consent.** The photograph becomes downloadable by anyone. Use one nobody
   needs to consent to, or one where consent is explicit.
4. **Credits.** Add every file to `CREDITS.md`, including the explicit note
   that `ai-recreation.jpg` is AI generated (the note already there).
5. Run `node scripts/render_page.mjs` and `node scripts/verify_story.mjs --browser`
   (the demo adds height above the story; the story measures itself, but run
   the checks anyway).

## Why an AI image is allowed here, and only here

The site rule is "no AI generated imagery, ever". This one optional file is a
deliberate, labelled exception, in the same spirit as the altered first-steps
photograph: it exists to trace back to nothing on RIALITI Check, it is
described as AI generated in its alt text, in the page copy and in
`CREDITS.md`, and it never appears anywhere else on the site. If that labelling
is ever dropped, the file must be dropped with it.
