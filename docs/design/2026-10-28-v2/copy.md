# RIALITI home page v2: every string, final

Date 2026-10-28, revised the same day by the AI copy wave (founder: the page must say a photo can be proven real even when anyone can edit or invent photos with AI; that is the search angle). This file is the copy source of truth. If a string here and a string in `design.md` or the reference build ever disagree, this file wins. No em dashes anywhere (checked by grepping for U+2014). Typographic apostrophes (’) in visible copy; straight quotes are fine in attributes.

Spelling is US English ("color").

## Head

| Field | Text |
|---|---|
| `<title>` | Prove a photo is real, not AI \| RIALITI Capture |
| meta description | Anyone can edit or invent a photo with AI now. Take yours in the free RIALITI Capture app and anyone can check it is a real, unedited capture, not AI, even after WhatsApp. |
| canonical | https://www.rialiti.io/ |
| og:type | website |
| og:site_name | RIALITI |
| og:title | Prove your photo is real. Not AI. |
| og:description | AI can edit or invent any photo. Take yours in RIALITI Capture and anyone can check it is real, for free. |
| og:url | https://www.rialiti.io/ |
| og:image | https://www.rialiti.io/assets/v2/og/og-1200x630.jpg (1200x630) |
| og:image:alt | Prove your photo is real. A toy car photographed in the RIALITI Capture app, with the app’s Verified capture panel showing record ra-e58e1b6d5bed4de9. |
| twitter:card | summary_large_image |
| twitter:title / description / image / image:alt | same as og |
| theme-color | #0C0D11 |

JSON-LD strings. Organization: name "RIALITI", url "https://www.rialiti.io/", logo "https://www.rialiti.io/assets/play/icon-512.png", email "founders@rialiti.io". SoftwareApplication: name "RIALITI Capture", operatingSystem "Android", applicationCategory "MultimediaApplication", description "Take photos that anyone can check are real, unedited captures and not AI, for free at check.rialiti.io.", offers price "0" priceCurrency "USD", url = the Play URL below. No rating and no review count: none exist that we can show.

Play URL (every Play button): `https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer=utm_source%3Drialiti.io` (write `&amp;` inside HTML attributes).

## Header

| Element | Text |
|---|---|
| Logo link `aria-label` | RIALITI home |
| Logo `img alt` | (empty, the link carries the name) |
| Wordmark | RIALITI |
| Nav `aria-label` | Main |
| Nav link 1 (hidden below 700px) | How it works |
| Nav link 2 (hidden below 700px) | AI photos (to `#ai`) |
| Nav link 3 | Check a photo |

## 1. Hero

| Element | Text |
|---|---|
| H1 | Prove your photo is real. Not AI. ("Not AI." always on its own line) |
| Lead | AI can edit or invent any photo now. Take yours in the free RIALITI Capture app and anyone can check it is a real, unedited capture, even after WhatsApp. |
| Primary button | Get it on Google Play |
| Text link | Check a photo for free |
| Aside | Free on Android. On iPhone? Join the waitlist. (link text: "Join the waitlist") |
| Capture `alt` | A blue die-cast toy car on a wooden table, photographed in the RIALITI Capture app. |
| Record panel `alt` | The app’s Verified capture panel for this photo. It shows the entry ra-e58e1b6d5bed4de9 and says anyone can check this capture at check.rialiti.io. |
| Caption | A toy car, shot in RIALITI Capture on 21 September 2026. Open its public record (link text: "Open its public record") |

## 2. The problem

| Element | Text |
|---|---|
| H2 | Anyone can make a photo with AI now. Looking real proves nothing. |
| Body | A listing photo. A damage photo. A photo of the watch you’re about to pay for. AI can erase the dent, change the mileage or invent the whole scene in seconds, and nobody can tell by looking. Proof has to come from somewhere else. |
| Edited image `alt` | The same toy car photo, edited by us so it looks newer: the racing decals, number and scuffs are gone. |
| Edited tag | Edited |
| Edited note | Made by us, by hand, from the original. AI does this in seconds. |
| Real image `alt` | The original capture of the toy car, with its racing decals, number and scuffs. |
| Real tag | Real capture |
| Real note | The original. It has a public record. |
| Figure caption | Both look real. Only one can prove it. |

## 3. Use cases

| Element | Text |
|---|---|
| H2 | For any photo that has to be believed. |
| Body | Shoot it in RIALITI and send it anywhere. Anyone can check it. |
| 1 H3 / line | Selling a used car / Show the real dents and the real mileage, as they are today. |
| 2 | Watches and phones / Prove you have it in hand, not a photo you found. |
| 3 | Shopify and marketplace sellers / Product photos buyers can check for themselves. |
| 4 | Renting out or moving out / A dated record of the condition, before and after. |
| 5 | Pets and rehoming / Show buyers a real animal, photographed today. |
| 6 | Insurance, disputes, reporting / Show when the photo was taken, and that it’s unedited. |

Reserved guide paths (not linked until the guide exists): `/guides/used-cars/`, `/guides/watches-and-phones/`, `/guides/online-sellers/`, `/guides/rentals/`, `/guides/pets/`, `/guides/insurance-and-disputes/`.

## 4. How it works (`id="how"`)

| Element | Text |
|---|---|
| H2 | Three steps. No account. |
| Step 1 | Take the photo in the free RIALITI Capture app. |
| Step 2 | Send it anywhere. WhatsApp, a listing, an email. |
| Step 3 | Anyone checks it free at check.rialiti.io. (link text: "check.rialiti.io") |
| Note | An AI image, or a real photo edited with AI, traces back to nothing. |
| Small | (removed 2026-10-28 by the founder's instruction: the video line is an unverified claim; the founder decides later) |

## 4b. AI photos (`id="ai"`, between How it works and Proof)

| Element | Text |
|---|---|
| H2 | How do you tell if a photo is AI? |
| Body 1 | Mostly, you can’t. In a 2025 test, people told real photos from AI images at about the rate of a coin flip: 49 percent right on real images, 52 percent on AI ones. (link text "a 2025 test" to https://conjointly.com/blog/real-vs-ai-images-2025/ : Conjointly, published 25 September 2025, 301 US adults, 49% / 52%, "no better than random guessing"; checked 2026-10-28) |
| Body 2 | RIALITI doesn’t guess. A photo taken in the app carries a public record of the moment it was captured, and anyone can check it free. An AI image has no record. A real photo edited with AI no longer matches its record. Either way the check finds nothing to match, and that is the difference between looking real and being real. |
| H3 left | What RIALITI does |
| Items | Proves a photo is a real, unedited capture / Shows when it was taken / Works on any copy, even after WhatsApp / Free to check |
| H3 right | What it doesn’t |
| Items | Guess whether a random image is AI / Grade the car, the watch or the seller / Prove who owns the thing in the photo |

## 5. Proof (`id="proof"`)

Live part (ships now):

| Element | Text |
|---|---|
| H2 | Don’t trust us. Check it yourself. |
| Body | The toy car at the top of this page has a public record. Open it on RIALITI Check and read it for yourself. |
| Outline button | Open the car’s record |
| Text link | Check a photo of your own |
| Fine print | RIALITI checks where a file came from, not whether it looks real. |
| Screenshot `alt` | RIALITI Check showing this record: Verified attested capture, Tier 1, captured 21 September 2026 at 04:20 UTC, match ratio 100 percent. |
| Screenshot caption | RIALITI Check, opened on 28 October 2026. |

Demo part (built, switched off until the founder supplies real files):

| Element | Text |
|---|---|
| H3 | Try it with the files. |
| Lead (two-file version) | Download a real capture and the copy WhatsApp gave back. Put both through RIALITI Check and compare the answers. |
| Lead (three-file version) | Download a real capture, the copy WhatsApp gave back, and an AI recreation. Put each through RIALITI Check and compare the answers. |
| Card 1 title / text / verdict | The original capture / The photo as the camera recorded it, exactly as it was archived. / Should match its archived capture |
| Card 2 | The same photo, sent through WhatsApp / Resized and recompressed on the way, the way every shared photo is. / Still matches the same capture |
| Card 3 (optional) | An AI recreation / Generated to look like the same moment. No camera ever recorded it. / Matches no capture at all |
| Download buttons | Download the original / Download the WhatsApp copy / Download the AI recreation |
| Card 1 `alt` | TODO by founder: honest description of the photograph. |
| Card 2 `alt` | The same photograph after a real WhatsApp send. It is smaller and softer. |
| Card 3 `alt` | An AI generated recreation of the same scene. This image is not a photograph. |
| Demo fine print (three-file only) | The recreation is the only image on this site that is not a photograph. It is here so you can see it trace back to nothing. |

Verdict lines must be confirmed against check.rialiti.io with the real files before the switch is flipped (see `assets/demo/README.md`). If reality disagrees, change the copy, not the claim.

## 6. Story (`id="why"`)

| Element | Text |
|---|---|
| H2 (visually hidden) | Why RIALITI exists |
| Line 1 (approved, beat 1) | Some moments happen once. |
| Photo 1 `alt` | A toddler in owl-print pants pulls herself upright against an armchair in a bright living room, taking her first steps. |
| Photo 1 caption | First Steps #6 by FDWR. CC BY 2.0. |
| Line 2 (approved, beat 5, em dash replaced) | And soon, some will never have happened at all. |
| Photo 2 `alt` | The same photograph of the toddler’s first steps, deliberately altered by us: the color is drained, fragments repeat, and the child has too many feet. This version of the moment never happened. |
| Photo 2 caption | The same photograph, altered by us. This version never happened. |
| Mission (canonical) | To Protect What’s Human |
| Photo 3 `alt` | The Blue Marble: the whole Earth, with ocean, Africa and Antarctica under swirling cloud, photographed by the crew of Apollo 17 on 7 December 1972. |
| Photo 3 caption | The Blue Marble. Apollo 17, 7 December 1972. NASA. |
| Coda (approved, beat 6 line) | Real moments deserve proof. |
| Ethos | Every photograph on this page is real. The two we altered say so. Photograph credits (link text: "Photograph credits") |

## 6b. FAQ (`id="faq"`, between the story and the close; also FAQPage JSON-LD, word for word)

| Element | Text |
|---|---|
| H2 | Questions about AI photos |
| Q1 / A1 | How can I tell if a photo is AI-generated? / Mostly, you can’t by looking. In a 2025 test, people told real photos from AI images at about the rate of a coin flip. Ask for a photo taken in RIALITI Capture and check it free at check.rialiti.io. (visible answer links "a 2025 test" to the same study) |
| Q2 / A2 | Can RIALITI detect AI images? / No. It proves real ones. Anything without a record, including AI images and AI-edited photos, cannot be proven, and the check says so. |
| Q3 / A3 | What if someone edits my photo with AI after I send it? / The edited copy no longer matches your record, so it fails the check. Your original still proves real. |
| Q4 / A4 | Does it still work after WhatsApp compression? / Yes. Resizing and compression keep the match; editing the content breaks it. |

## 7. Close (`id="get"`)

| Element | Text |
|---|---|
| H2 | Keep what’s real, real. |
| Body | Free on Android. Verification will always be free. |
| Primary button | Get it on Google Play |
| Waitlist H3 (`id="iphone"`) | Not on iPhone yet. |
| Waitlist body | Leave your email and we’ll tell you when it is. We won’t use it for anything else. |
| Label 1 | Email |
| Label 2 | What will you use it for? Optional (the word "Optional" is a muted span inside the label) |
| Submit (idle) | Join the iPhone waitlist |
| Submit (submitting) | Joining… |
| Success | You’re on the iPhone waitlist. We’ll email you when RIALITI Capture is on the App Store. |
| Preview mode (WAITLIST_URL not set) | The waitlist isn’t connected yet, so nothing was sent. Your email stayed on this page. |
| Error: empty or invalid email | Enter an email address, like name@example.com. |
| Error: note over 500 characters | Keep the note under 500 characters. |
| Error: network or server | That didn’t go through. Check your connection and try again. |
| No-JS note (inside `<noscript>`, only while WAITLIST_URL is unset) | The iPhone waitlist opens soon. |
| Signature | To Protect What’s Human |

## Footer

| Element | Text |
|---|---|
| Logo link `aria-label` | RIALITI home |
| Nav `aria-label` | Footer |
| Links, in order | RIALITI Check, Privacy, Photograph credits, founders@rialiti.io (separate links, no separators drawn between them) |
| Legal | © 2026 RIALITI. Google Play is a trademark of Google LLC. |

## 404 page (`/404.html`)

| Element | Text |
|---|---|
| `<title>` | Page not found \| RIALITI |
| meta robots | noindex |
| H1 | This page traces back to nothing. |
| Body | The link may be old or mistyped. Nothing was ever published here. |
| Button | Go to the home page |
| Text link | Check a photo |

## Strings removed from v1 (do not carry over)

"Every photograph is a promise: this happened." (opening thesis), "Scroll", the seven-letter rail, beats 2, 3, 4, 6 and 7 as separate beats, "Get early access" and its Gmail mailto, "Download for Android", the version and size line for the APK, the three sideload steps, both alpha notes, the "Alpha" badge, the `api.rialiti.io/download/android` link, and the v1 page title and meta description (both replaced above)
