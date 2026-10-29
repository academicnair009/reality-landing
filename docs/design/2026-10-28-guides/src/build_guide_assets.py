"""Builds the shared guide images in assets/guides/ from real app screenshots.

Run from the repo root:  python3 docs/design/2026-10-28-guides/src/build_guide_assets.py
Needs Pillow. Inputs are committed real screenshots; nothing is retouched or regraded.
  - assets/play/screens/04-verified.png  (RIALITI Capture, record ra-e58e1b6d5bed4de9)
  - assets/v2/proof/check-record-724.png (RIALITI Check, the same record, 28 Oct 2026)
"""
from PIL import Image

def save(im, stem, widths, q=80):
    for w in widths:
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS)
        r.save(f"{stem}-{w}.webp", "WEBP", quality=q, method=6)
        r.convert("RGB").save(f"{stem}-{w}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
        print(stem, w, h)

# Verified screen: from the top of the photo to just under the Verified capture panel.
v = Image.open("assets/play/screens/04-verified.png").convert("RGB").crop((0, 30, 1080, 1710))
save(v, "assets/guides/verified-screen", [300, 600])

# Check result: the verdict and the two dates only (tier and device lines left out of the crop).
c = Image.open("assets/v2/proof/check-record-724.png").convert("RGB").crop((0, 0, 724, 732))
save(c, "assets/guides/check-record", [362, 724])
