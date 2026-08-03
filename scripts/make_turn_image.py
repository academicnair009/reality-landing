#!/usr/bin/env python3
"""Build the beat-5 "turn" image for the RIALITI landing page.

Takes the REAL beat-1 photograph (a child's first steps) and applies a
deliberate, honest distortion treatment so it feels subtly wrong:
duplicated fragments, a smeared band, and a ghosted double-exposure.

No AI imagery is involved anywhere — this is a real photograph with a
visible-on-inspection darkroom-style manipulation, disclosed in CREDITS.md.

Usage:
    python3 scripts/make_turn_image.py assets/beat1-first-steps.jpg assets/beat5-turn.jpg
"""
import random
import sys

from PIL import Image, ImageEnhance, ImageFilter

def main(src_path: str, dst_path: str) -> None:
    random.seed(2383)  # reproducible (nod to AS08-14-2383)
    im = Image.open(src_path).convert("RGB")
    w, h = im.size

    # 1. Ghost double-exposure: the whole frame, shifted, at low alpha.
    ghost = im.copy().filter(ImageFilter.GaussianBlur(2))
    im = Image.blend(im, ghost.transform(im.size, Image.AFFINE, (1, 0, -14, 0, 1, 6)), 0.22)

    # 2. Duplicated fragments: copy rectangular patches and re-paste them
    #    slightly offset, like a moment stuttering.
    for _ in range(7):
        pw, ph = random.randint(w // 8, w // 4), random.randint(h // 10, h // 5)
        x, y = random.randint(0, w - pw), random.randint(int(h * 0.25), h - ph)
        patch = im.crop((x, y, x + pw, y + ph))
        dx, dy = random.randint(-28, 28), random.randint(-14, 14)
        nx = min(max(x + dx, 0), w - pw)
        ny = min(max(y + dy, 0), h - ph)
        faded = ImageEnhance.Brightness(patch).enhance(random.uniform(0.94, 1.06))
        im.paste(Image.blend(im.crop((nx, ny, nx + pw, ny + ph)), faded, 0.85), (nx, ny))

    # 3. Smeared horizontal band across the middle third.
    band_top, band_h = int(h * 0.42), int(h * 0.09)
    band = im.crop((0, band_top, w, band_top + band_h))
    band = band.resize((w // 14, band_h)).resize((w, band_h), Image.BILINEAR)
    im.paste(Image.blend(im.crop((0, band_top, w, band_top + band_h)), band, 0.65), (0, band_top))

    # 4. Slightly drained color — the warmth is gone.
    im = ImageEnhance.Color(im).enhance(0.62)
    im = ImageEnhance.Contrast(im).enhance(1.04)

    im.save(dst_path, "JPEG", quality=75, optimize=True, progressive=True)
    print(f"wrote {dst_path} ({im.size[0]}x{im.size[1]})")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
