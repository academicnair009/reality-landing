# Photograph credits — RIALITI landing page

Every photograph on this page is a real photograph. No AI-generated imagery is
used anywhere on this site — including the deliberately distorted image in
section five, which is a real photograph that we altered (disclosed below).
During sourcing, several openly-licensed candidates were identified as
AI-generated and rejected for that reason.

All images are self-hosted in `assets/`; nothing is hotlinked at runtime.

## Hero photographs

### 1. `beat1-first-steps.jpg` — "R · Some moments happen once."
- **Title/Author:** *First Steps #6* by **FDWR** (Flickr)
- **License:** CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/
- **License verified at:** https://www.flickr.com/photos/62569532@N00/8664173566/ (verified 2026-08-03)
- **File downloaded:** https://live.staticflickr.com/8244/8664173566_42cc18cc36_b.jpg
- **Modifications:** resized, re-encoded (JPEG q75).

### 2. `beat2-earthrise.jpg` — "I · Some changed how we see everything."
- **Title/Author:** *Earthrise*, photograph **AS08-14-2383**, taken by astronaut
  Bill Anders, Apollo 8, 24 December 1968. Courtesy **NASA**.
- **License:** Public domain (NASA imagery; not copyrighted).
- **Source (NASA original):** https://images.nasa.gov/details/as08-14-2383
- **File downloaded:** https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~large.jpg
- **Modifications:** resized, re-encoded (JPEG q75).

### 3. `beat3-embrace.jpg` — "A · Some we promise to keep."
- **Title/Author:** *Wedding couple hug on cliff* by **Brian Hartley**
  (Unsplash, @mrbrianhartley), 2017. Real photograph (iPhone, VSCO-processed).
- **License:** CC0 1.0 — published on Unsplash under its pre-June-2017 CC0
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

### 4. `beat4-portrait.jpg` — "L · Some are all that’s left of someone."
- **Title/Author:** *Family portrait in home of Fred Rowe, farmer near
  Estherville, Iowa* by **Russell Lee**, December 1936. Farm Security
  Administration / Office of War Information collection, **Library of Congress**.
- **License:** Public domain (work of the U.S. federal government; LOC lists
  "no known restrictions on publication").
- **Source (LOC item page):** https://www.loc.gov/item/2017735128/
- **File downloaded:** https://tile.loc.gov/storage-services/service/pnp/fsa/8a21000/8a21300/8a21393v.jpg
- **Modifications:** resized, re-encoded (JPEG q75).

### 5. `beat5-turn.jpg` — "I · And soon — some will never have happened at all."
- **HONEST NOTE:** this is the *same real photograph* as image 1 (*First Steps
  #6* by FDWR, CC BY 2.0), which we **deliberately distorted** with classical
  image processing — duplicated fragments, a smeared band, a ghosted double
  exposure, drained colour — so that the moment feels subtly wrong. It is not
  AI-generated; the treatment is reproducible from the committed script
  `scripts/make_turn_image.py`. The page's alt text discloses the alteration.
- **License of the derivative:** CC BY 2.0, credit FDWR (same as source).

### 6. `beat6-proof.jpg` — "T · Real moments deserve proof."
- **Title/Author:** *Matthew Vieira stands in the very place where, some
  thirty-five years ago, he took these pictures of his children. At that time
  the area was Wood Island Park… since then the site has become part of Logan
  Airport* — East Boston, June 1973, by **Michael Philip Manheim** for the
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

### 7. `beat7-bluemarble.jpg` — "I · the name completes"
- **Title/Author:** *The Blue Marble*, photograph **AS17-148-22727**, taken by
  the crew of Apollo 17 traveling toward the Moon, 7 December 1972. Courtesy
  **NASA**. (A different photograph and composition from image 2's
  *Earthrise*: the full sunlit Earth, no lunar horizon.)
- **License:** Public domain (NASA imagery; not copyrighted).
- **Source (NASA original):** https://images.nasa.gov/details/as17-148-22727
- **File downloaded:** https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~large.jpg
- **Modifications:** resized to 1400px, re-encoded (JPEG q62).

## Mosaic

### 8. `mosaic.jpg` — closing section background
- **What it is:** a single pre-baked composite of **160 unique real-photograph
  thumbnails** tiled into a 28×18 grid (504 cells; tiles repeat with random
  brightness/saturation jitter), built by `scripts/build_mosaic.py`. Seven
  cells are baked near-black — the seven hero photographs above fly in and
  occupy them as the story scrolls.
- **Source:** https://picsum.photos (Lorem Picsum free image service).
- **Modifications:** gently desaturated and composited (dimming happens in
  CSS); served as one JPEG so the page never makes hundreds of image requests.

## Fonts

- **Lexend** and **Playfair Display**, served via Google Fonts (SIL Open Font
  License).
