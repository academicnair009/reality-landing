# Photograph credits: RIALITI website

Every photograph on this site is a real photograph or a real screenshot of
RIALITI's own software. No AI-generated imagery is used anywhere on the site.
Two images are real photographs that we deliberately altered by hand, and
both say so on the page, in their alt text and below: the edited toy car and
the altered first-steps photograph. During sourcing, several openly-licensed
candidates were identified as AI-generated and rejected for that reason.

All images are self-hosted in `assets/`; nothing is hotlinked at runtime.

## Images on the current home page (v2, 2026-10-28)

### `assets/v2/hero/capture-*.{webp,jpg}`: the toy car
- **What:** a blue die-cast toy car on a wooden table, photographed with the RIALITI Capture app on 21 September 2026 (04:20:31 UTC).
- **Author / license:** our own photograph (the RIALITI team). All rights reserved.
- **Source:** cropped, unretouched, from the Play listing screenshot `assets/play/screens/04-verified.png` (pixels x 147 to 933, y 55 to 1103).
- **Provenance:** archived capture with public record `ra-e58e1b6d5bed4de9`, https://check.rialiti.io/e/ra-e58e1b6d5bed4de9 . Re-checked 2026-10-28: "Verified attested capture", Tier 1, match ratio 100.0%.
- **Note:** this crop is taken from a screenshot, so the file on this page is not the archived capture file itself and will not match its record if uploaded. The record is for the original capture.
- **Modifications:** cropped and resized; WebP q78 and JPEG q80.

### `assets/v2/hero/record-card-*.{webp,png}`: the Verified capture panel
- **What:** the RIALITI Capture app's "Verified capture" panel for the same capture, showing entry `ra-e58e1b6d5bed4de9`.
- **Author / license:** screenshot of our own app. All rights reserved.
- **Source:** cropped from `assets/play/screens/04-verified.png` (x 56 to 1023, y 1149 to 1709); the corners outside the panel's 44 px radius are made transparent. No pixels inside the panel were changed.

### `assets/v2/problem/car-real-*.{webp,jpg}`
- Same photograph as the hero capture, cropped to the car (785x470 from y 330). Our own photograph, all rights reserved.

### `assets/v2/problem/car-edited-*.{webp,jpg}`: deliberately edited
- **HONEST NOTE:** this is the toy car photograph above, **edited by us, by hand**, to show how easily a listing photo can be changed: the racing decals, number and tyre lettering were removed with row interpolation, the roof chips smoothed and the paint lifted, using OpenCV in `docs/design/2026-10-28-v2/src/sources/make_edit.py` (copied from the 2026-10-27 marketplace ad, where it was made). **No generative model was used.** The page labels it "Edited" and says "Made by us, by hand, from the original below." Its alt text says it was edited by us.
- **Author / license:** derivative of our own photograph. All rights reserved.

### `assets/v2/proof/check-record-*.{webp,png}`: RIALITI Check screenshot
- **What:** the public record page for `ra-e58e1b6d5bed4de9` on RIALITI Check, captured with headless Chrome at 390 px wide (2x) on 28 October 2026, cropped to the result card. The page caption gives the date.
- **Author / license:** screenshot of our own service. All rights reserved.
- **Source file:** `docs/design/2026-10-28-v2/src/sources/check-record-ra-e58e1b6d5bed4de9-2026-10-28-390w@2x.png`.

### `assets/v2/story/first-steps-681.{webp,jpg}`
- Same photograph as entry 1 (*First Steps #6* by **FDWR**, CC BY 2.0, https://www.flickr.com/photos/62569532@N00/8664173566/). Re-encoded only (WebP q74, JPEG q75). Credited on the page under the photograph.

### `assets/v2/story/turn-681.{webp,jpg}`
- Same file as entry 5 (the deliberately distorted *First Steps #6*, CC BY 2.0, credit FDWR), re-encoded only. The page caption reads "The same photograph, altered by us. This version never happened."

### `assets/v2/story/blue-marble-{760,1200}.{webp,jpg}`
- Same photograph as entry 7 (*The Blue Marble*, AS17-148-22727, NASA, public domain, https://images.nasa.gov/details/as17-148-22727). Resized to 1200 and 760 px; WebP q72, JPEG q70. On the page its edge is feathered into black with a CSS mask (the file itself is not altered).

### `assets/v2/og/og-1200x630.{png,jpg}`
- Composite of the hero capture and record panel with typeset text (Lexend) and the canonical RIALITI mark, rendered from `docs/design/2026-10-28-v2/src/og.html` with headless Chrome. No generated imagery.

### `assets/v2/icons/rialiti-mark.svg`
- Byte-identical copy of the canonical `branding/rialiti-logo-vector.svg` (also identical to `assets/favicon.svg`). Not redrawn or recolored.

## Earlier photographs (v1 story, 2026-08-03)

The v2 page shows three of these (1, 5 and 7, re-encoded under `assets/v2/story/`). The others stay in the repo and in this history, marked "not shown on the current page".


### 1. `beat1-first-steps.jpg`: "Some moments happen once."
- **Title/Author:** *First Steps #6* by **FDWR** (Flickr)
- **License:** CC BY 2.0, https://creativecommons.org/licenses/by/2.0/
- **License verified at:** https://www.flickr.com/photos/62569532@N00/8664173566/ (verified 2026-08-03)
- **File downloaded:** https://live.staticflickr.com/8244/8664173566_42cc18cc36_b.jpg
- **Modifications:** resized, re-encoded (JPEG q75).

### 2. `beat2-earthrise.jpg`: "Some changed how we see everything." (not shown on the current page)
- **Title/Author:** *Earthrise*, photograph **AS08-14-2383**, taken by astronaut
  Bill Anders, Apollo 8, 24 December 1968. Courtesy **NASA**.
- **License:** Public domain (NASA imagery; not copyrighted).
- **Source (NASA original):** https://images.nasa.gov/details/as08-14-2383
- **File downloaded:** https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~large.jpg
- **Modifications:** resized, re-encoded (JPEG q75).

### 3. `beat3-embrace.jpg`: "Some we promise to keep." (not shown on the current page)
- **Title/Author:** *Wedding couple hug on cliff* by **Brian Hartley**
  (Unsplash, @mrbrianhartley), 2017. Real photograph (iPhone, VSCO-processed).
- **License:** CC0 1.0, published on Unsplash under its pre-June-2017 CC0
  license; hosted and license-reviewed on Wikimedia Commons.
  https://creativecommons.org/publicdomain/zero/1.0/
- **License verified at:**
  https://commons.wikimedia.org/wiki/File:Wedding_couple_hug_on_cliff_(Unsplash).jpg
  (verified 2026-08-03), with the original Unsplash page and CC0 license text
  archived at
  https://web.archive.org/web/20170623211851/https%3A//unsplash.com/photos/vF_Tf9x1sLY
  and https://web.archive.org/web/20170403233634/https://unsplash.com/license
- **File downloaded:** https://upload.wikimedia.org/wikipedia/commons/a/a6/Wedding_couple_hug_on_cliff_%28Unsplash%29.jpg (3000×1687 original)
- **Modifications:** resized to 1600px, re-encoded (JPEG q75).

### 4. `beat4-portrait.jpg`: "Some are all that’s left of someone." (not shown on the current page)
- **Title/Author:** *Family portrait in home of Fred Rowe, farmer near
  Estherville, Iowa* by **Russell Lee**, December 1936. Farm Security
  Administration / Office of War Information collection, **Library of Congress**.
- **License:** Public domain (work of the U.S. federal government; LOC lists
  "no known restrictions on publication").
- **Source (LOC item page):** https://www.loc.gov/item/2017735128/
- **File downloaded:** https://tile.loc.gov/storage-services/service/pnp/fsa/8a21000/8a21300/8a21393v.jpg
- **Modifications:** resized, re-encoded (JPEG q75).

### 5. `beat5-turn.jpg`: "And soon, some will never have happened at all."
- **HONEST NOTE:** this is the *same real photograph* as image 1 (*First Steps
  #6* by FDWR, CC BY 2.0), which we **deliberately distorted** with classical
  image processing, duplicated fragments, a smeared band, a ghosted double
  exposure, drained colour, so that the moment feels subtly wrong. It is not
  AI-generated; the treatment is reproducible from the committed script
  `scripts/make_turn_image.py`. The page's alt text discloses the alteration.
- **License of the derivative:** CC BY 2.0, credit FDWR (same as source).

### 6. `beat6-proof.jpg`: "Real moments deserve proof." (not shown on the current page; the line survives as the coda)
- **Title/Author:** *Matthew Vieira stands in the very place where, some
  thirty-five years ago, he took these pictures of his children. At that time
  the area was Wood Island Park… since then the site has become part of Logan
  Airport*, East Boston, June 1973, by **Michael Philip Manheim** for the
  U.S. EPA's **DOCUMERICA** project. National Archives (NARA) local ID
  412-DA-5964, naId 548451.
- **License:** Public domain (U.S. federal government work; NARA lists use
  and access as "Unrestricted").
- **Source (NARA catalog page):** https://catalog.archives.gov/id/548451
- **License verified at:** NARA catalog API record for naId 548451
  (`useRestriction: Unrestricted`), and the license-reviewed Commons mirror
  https://commons.wikimedia.org/wiki/File:MATTHEW_VIEIRA_STANDS_IN_THE_VERY_PLACE_WHERE,_SOME_THIRTY-FIVE_YEARS_AGO,_HE_TOOK_THESE_PICTURES_OF_HIS_CHILDREN._AT..._-_NARA_-_548451.jpg
  (verified 2026-08-03)
- **File downloaded:** https://upload.wikimedia.org/wikipedia/commons/5/55/MATTHEW_VIEIRA_STANDS_IN_THE_VERY_PLACE_WHERE%2C_SOME_THIRTY-FIVE_YEARS_AGO%2C_HE_TOOK_THESE_PICTURES_OF_HIS_CHILDREN._AT..._-_NARA_-_548451.jpg (3000×2027 original)
- **Modifications:** resized to 1600px, re-encoded (JPEG q70).

### 7. `beat7-bluemarble.jpg`: the Blue Marble, under the mission line
- **Title/Author:** *The Blue Marble*, photograph **AS17-148-22727**, taken by
  the crew of Apollo 17 traveling toward the Moon, 7 December 1972. Courtesy
  **NASA**. (A different photograph and composition from image 2's
  *Earthrise*: the full sunlit Earth, no lunar horizon.)
- **License:** Public domain (NASA imagery; not copyrighted).
- **Source (NASA original):** https://images.nasa.gov/details/as17-148-22727
- **File downloaded:** https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~large.jpg
- **Modifications:** resized to 1400px, re-encoded (JPEG q62).

## Mosaic

### 8. `mosaic.jpg`: v1 closing background (not shown on the current page)
- **What it is:** a single pre-baked composite of **160 unique real-photograph
  thumbnails** tiled into a 28×18 grid (504 cells; tiles repeat with random
  brightness/saturation jitter), built by `scripts/build_mosaic.py`. Seven
  cells are baked near-black, the seven hero photographs above fly in and
  occupy them as the story scrolls.
- **Source:** https://picsum.photos (Lorem Picsum free image service).
- **Modifications:** gently desaturated and composited (dimming happens in
  CSS); served as one JPEG so the page never makes hundreds of image requests.

## Demo files (`assets/demo/`), pending

The "test it yourself" demo section is written but **switched off**: its
files do not exist yet. When they land, each gets a full entry here. Two of
them are the same real photograph (the original capture, and the copy WhatsApp
gave back after a real round trip). The optional third, `ai-recreation.jpg`,
will be **AI generated**, the single deliberate exception to this site's
no-AI-imagery rule, present only so that visitors can watch the product fail
to find any capture behind it. It is labelled as AI generated in its alt text
and in the page copy, and it appears nowhere else on the site. See
`assets/demo/README.md`.

## Fonts

- **Lexend** (variable, latin subset) and **Playfair Display Italic** (latin
  subset), self-hosted in `assets/v2/fonts/`, downloaded from Google Fonts on
  2026-10-28. SIL Open Font License 1.1. The page loads `lexend-sub.woff2` and
  `playfair-italic-sub.woff2`, further subsets made by `scripts/subset_fonts.py`
  from those files (glyph subset and Lexend's weight axis cut to 300..700; no
  outlines changed).
