#!/usr/bin/env python3
"""Build the pre-baked photo-mosaic background for the RIALITI landing page.

Downloads a set of small real-photograph thumbnails from picsum.photos
(Lorem Picsum's free image service) and composites them into ONE large
JPEG, so the page can show a wall of "thousands of photographs" without
thousands of DOM nodes or network requests.

Tiles are repeated with per-tile brightness/saturation jitter — at 72 px
a repeated thumbnail is visually undetectable. The finished mosaic is
shown heavily dimmed under the closing section.

Usage:
    python3 scripts/build_mosaic.py assets/mosaic.jpg
Requires: Pillow, network access. Idempotent; thumbnails are cached in
/tmp/rialiti_mosaic_tiles between runs.
"""
import io
import pathlib
import random
import sys
import time
import urllib.request

from PIL import Image, ImageEnhance

TILE = 72          # px, size of each square thumbnail in the mosaic
COLS, ROWS = 28, 18  # 2016 x 1296 canvas, 504 visible tiles
UNIQUE = 160       # distinct thumbnails to download (repetition is jittered)
CACHE = pathlib.Path("/tmp/rialiti_mosaic_tiles")

# Seven designated landing cells (col, row) kept almost-black: the seven beat
# photographs fly in and occupy them as the story scrolls. Chosen inside the
# region that stays on screen under object-fit: cover from 360px-wide phones
# to ultrawide monitors (cols 10-17, rows ~4-12). MUST match HERO_CELLS in
# index.html.
HERO_CELLS = {(12, 4), (16, 6), (13, 8), (15, 10), (12, 12), (10, 7), (17, 9)}

def fetch_tile(seed: int) -> Image.Image:
    CACHE.mkdir(exist_ok=True)
    p = CACHE / f"{seed}.jpg"
    if not p.exists():
        url = f"https://picsum.photos/seed/rialiti{seed}/{TILE * 2}/{TILE * 2}"
        with urllib.request.urlopen(url, timeout=30) as r:
            p.write_bytes(r.read())
        time.sleep(0.15)  # be polite
    return Image.open(io.BytesIO(p.read_bytes())).convert("RGB")

def main(out_path: str) -> None:
    random.seed(7)
    tiles = []
    for i in range(UNIQUE):
        try:
            tiles.append(fetch_tile(i).resize((TILE, TILE), Image.LANCZOS))
        except Exception as e:  # noqa: BLE001 - skip bad tiles, keep going
            print(f"tile {i} failed: {e}", file=sys.stderr)
    if len(tiles) < UNIQUE // 2:
        sys.exit("too many tile downloads failed; aborting")

    canvas = Image.new("RGB", (COLS * TILE, ROWS * TILE))
    for row in range(ROWS):
        for col in range(COLS):
            t = random.choice(tiles).copy()
            if (col, row) in HERO_CELLS:
                # near-black slot with a whisper of texture, waiting for its
                # hero photograph to land during the scroll story
                t = ImageEnhance.Brightness(t).enhance(0.16)
                t = ImageEnhance.Color(t).enhance(0.3)
            else:
                t = ImageEnhance.Brightness(t).enhance(random.uniform(0.95, 1.3))
                t = ImageEnhance.Color(t).enhance(random.uniform(0.5, 0.85))
            canvas.paste(t, (col * TILE, row * TILE))

    # Global treatment: gentle desaturate only — the CSS veil provides the
    # dimming, so individual moments stay legible as visible memories.
    canvas = ImageEnhance.Brightness(canvas).enhance(1.05)
    canvas = ImageEnhance.Color(canvas).enhance(0.9)
    canvas.save(out_path, "JPEG", quality=62, optimize=True, progressive=True)
    kb = pathlib.Path(out_path).stat().st_size // 1024
    print(f"wrote {out_path} ({canvas.size[0]}x{canvas.size[1]}, {kb} KB, {len(tiles)} unique tiles)")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "assets/mosaic.jpg")
