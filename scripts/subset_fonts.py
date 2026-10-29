"""Subset the self-hosted web fonts for the home page.

Sources are the Google Fonts latin files the creative director downloaded on
2026-10-28 (SIL OFL 1.1), kept unchanged in assets/v2/fonts/:
  lexend-latin-var.woff2            -> lexend-sub.woff2        (wght axis cut to 300..700)
  playfair-display-italic-latin.woff2 -> playfair-italic-sub.woff2

The kept range is Basic Latin, Latin-1 and the typographic punctuation the copy
uses (curly quotes, ellipsis, non-breaking hyphen, en dash for safety), so copy
edits in English never fall back to a system font. Needs fontTools + brotli:
    python3 scripts/subset_fonts.py
"""
import os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "assets", "v2", "fonts")
UNICODES = "U+0020-007E,U+00A0-00FF,U+2011,U+2013,U+2018-201F,U+2022,U+2026,U+2122"
FEATURES = "kern,liga,calt"

def subset(src, dst):
    subprocess.run([sys.executable, "-m", "fontTools.subset", os.path.join(FONTS, src),
                    "--unicodes=" + UNICODES, "--layout-features=" + FEATURES,
                    "--flavor=woff2", "--output-file=" + dst], check=True)

with tempfile.TemporaryDirectory() as tmp:
    lex = os.path.join(tmp, "lexend.woff2")
    subset("lexend-latin-var.woff2", lex)
    # The page uses weights 300 to 600; keep 300..700 so a bold fallback never synthesizes.
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    f = instancer.instantiateVariableFont(TTFont(lex), {"wght": (300, 700)})
    f.flavor = "woff2"
    f.save(os.path.join(FONTS, "lexend-sub.woff2"))
subset("playfair-display-italic-latin.woff2", os.path.join(FONTS, "playfair-italic-sub.woff2"))
for n in ("lexend-sub.woff2", "playfair-italic-sub.woff2"):
    print(n, os.path.getsize(os.path.join(FONTS, n)), "bytes")
