#!/usr/bin/env python3
"""Render a RIALITI guide page from its content file.

    python3 scripts/build_guide.py used-cars       # writes guides/used-cars/index.html
    python3 scripts/build_guide.py --all           # every guides/<slug>/content.md
    python3 scripts/build_guide.py --check --all   # exit 1 if any committed page differs

Inputs:  guides/<slug>/content.md, guides/_template/page.html, guides.css, guides.js
Output:  guides/<slug>/index.html (committed; GitHub Pages serves it as is) and,
         if missing, the page's <url> entry in sitemap.xml.

Python 3 standard library only. The output is deterministic: running it twice on
the same inputs gives byte-identical files. The build fails (exit 2) when the
rendered page breaks the honesty rail or the copy rules (see LINT below), so a
future page cannot ship "detect AI" or an em dash by accident.

Content file format (see guides/used-cars/content.md for a full example):

    ---
    key: value                 one per line; see REQUIRED and DEFAULTS below
    ---
    ## [intro]                 sections, each "## [key] Optional heading"
    Paragraph text. **bold**, [link text](https://...) and blank-line paragraphs.

Section keys and what each block type becomes:
    intro      paragraphs, under the H1
    how        H2 heading; paragraphs become the section lead
    seller     H3 heading; paragraphs, "> " sourced facts, "1. **Title.** detail" steps
    buyer      same as seller
    answer     H2 heading; first paragraph = what a match means, second = what it does not
    checklist  H2 heading; lead paragraph, "- **Item.** tip" checkboxes, a closing note paragraph
    faq        H2 heading; "### Question" then answer paragraphs (also emitted as FAQPage JSON-LD)
    close      H2 heading; paragraphs
A "> " fact block is one or more lines; a line starting "Source:" becomes its credit.
HTML comments (<!-- ... -->) are dropped, so editors can leave notes in the file.
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "guides"
TEMPLATE = GUIDES / "_template"
SITE = "https://www.rialiti.io"
PLAY = "https://play.google.com/store/apps/details?id=app.rialiti.capture&referrer="

REQUIRED = ["slug", "title", "description", "h1", "cell", "published",
            "hook_number", "hook_text", "hook_source_name", "hook_source_url"]
DEFAULTS = {
    "modified": None,                       # defaults to published
    "paid_campaign": "marketplace-oct26",
    "organic_content": None,                # defaults to slug
    "og_title": None,                       # defaults to h1
    "og_description": None,                 # defaults to description
    "og_image": "/assets/v2/og/og-1200x630.jpg",
    "og_image_alt": "Prove your photo is real. A toy car photographed in the RIALITI Capture app, "
                    "with the app’s Verified capture panel showing record ra-e58e1b6d5bed4de9.",
    "og_locale": "en_US",
    "hook_source_note": "",                 # text before the linked source name
    "hero_aside": "Free on Android. Anyone can check a photo from any phone.",
    "handoff": "The photos travel the way they always do.",
    "seller_caption": "Our own test shot of a toy car, taken in RIALITI Capture on 21 September 2026. "
                      "[Open its public record](https://check.rialiti.io/e/ra-e58e1b6d5bed4de9)",
    "buyer_caption": "The same photo on RIALITI Check, opened on 28 October 2026.",
    "close_aside": "Not on iPhone yet. Anyone can check a photo from any phone at "
                   "[check.rialiti.io](https://check.rialiti.io).",
}
SECTIONS = ["intro", "how", "seller", "buyer", "answer", "checklist", "faq", "close"]

# Honesty rail and copy rules (brief.md). Checked case-insensitively on the whole page.
LINT = ["—", "spot", "detect", "ai detector", "attest", "hash", "cryptograph",
        "blockchain", "metadata", "alpha", "api.rialiti.io", "gmail"]
SLUG_RE = re.compile(r"^[a-z0-9-]{1,32}$")


class BuildError(Exception):
    pass


# ---------------------------------------------------------------- parsing

def parse(path):
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"<!--.*?-->\n?", "", text, flags=re.S)
    m = re.match(r"---\n(.*?)\n---\n(.*)\Z", text, flags=re.S)
    if not m:
        raise BuildError(f"{path}: missing front matter between --- lines")
    meta = {}
    for n, line in enumerate(m.group(1).splitlines(), 2):
        if not line.strip():
            continue
        if ":" not in line:
            raise BuildError(f"{path}:{n}: expected 'key: value'")
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip()
    for k in REQUIRED:
        if not meta.get(k):
            raise BuildError(f"{path}: front matter needs '{k}'")
    for k, v in DEFAULTS.items():
        meta.setdefault(k, v)
    meta["modified"] = meta["modified"] or meta["published"]
    meta["organic_content"] = meta["organic_content"] or meta["slug"]
    meta["og_title"] = meta["og_title"] or meta["h1"]
    meta["og_description"] = meta["og_description"] or meta["description"]
    for k in ("slug", "cell", "organic_content", "paid_campaign"):
        if not SLUG_RE.match(meta[k]):
            raise BuildError(f"{path}: '{k}' must match [a-z0-9-]{{1,32}}")
    if meta["slug"] != path.parent.name:
        raise BuildError(f"{path}: slug '{meta['slug']}' must equal its folder name")

    sections = {}
    current = None
    for line in m.group(2).splitlines():
        h = re.match(r"##\s+\[(\w+)\]\s*(.*)$", line)
        if h:
            current = h.group(1)
            if current not in SECTIONS:
                raise BuildError(f"{path}: unknown section [{current}]")
            sections[current] = {"heading": h.group(2).strip(), "lines": []}
        elif current:
            sections[current]["lines"].append(line)
        elif line.strip():
            raise BuildError(f"{path}: text before the first ## [section]")
    for k in SECTIONS:
        if k not in sections:
            raise BuildError(f"{path}: missing section ## [{k}]")
        sections[k]["blocks"] = blocks(sections[k]["lines"])
    return meta, sections


def blocks(lines):
    """Group lines into blocks: ('p', text), ('ol', [items]), ('ul', [items]),
    ('fact', [lines]), ('q', question)."""
    out, para = [], []

    def flush():
        if para:
            out.append(("p", " ".join(s.strip() for s in para)))
            para.clear()

    for line in lines:
        s = line.strip()
        if not s:
            flush()
            continue
        if s.startswith("### "):
            flush(); out.append(("q", s[4:].strip())); continue
        if s.startswith(">"):
            flush()
            body = s[1:].strip()
            if out and out[-1][0] == "fact":
                out[-1][1].append(body)
            else:
                out.append(("fact", [body]))
            continue
        om = re.match(r"\d+\.\s+(.*)", s)
        if om:
            flush()
            if out and out[-1][0] == "ol":
                out[-1][1].append(om.group(1))
            else:
                out.append(("ol", [om.group(1)]))
            continue
        if s.startswith("- "):
            flush()
            if out and out[-1][0] == "ul":
                out[-1][1].append(s[2:])
            else:
                out.append(("ul", [s[2:]]))
            continue
        if out and out[-1][0] in ("ol", "ul") and not para and line.startswith("   "):
            out[-1][1][-1] += " " + s          # continuation of a list item
            continue
        para.append(s)
    flush()
    return out


# ---------------------------------------------------------------- inline text

def typo(s):
    """Straight quotes to typographic ones, in visible text only."""
    s = re.sub(r"(?<=\w)'(?=\w)", "’", s)       # it's, don't
    s = re.sub(r"(?<=\w)'(?=\s|$|[.,;:!?)])", "’", s)  # sellers'
    s = re.sub(r"'(?=\w)", "‘", s)
    s = re.sub(r'"(?=\w)', "“", s)
    s = s.replace('"', "”")
    return s


LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")


def inline(s):
    out, pos = [], 0
    for m in LINK_RE.finditer(s):
        out.append(_text(s[pos:m.start()]))
        url = m.group(2)
        ext = url.startswith("http") and not url.startswith(("https://check.rialiti.io", SITE))
        attrs = ' target="_blank" rel="noopener"' if ext else ""
        out.append(f'<a href="{html.escape(url)}"{attrs}>{_text(m.group(1))}</a>')
        pos = m.end()
    out.append(_text(s[pos:]))
    return "".join(out)


def _text(s):
    s = html.escape(typo(s), quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)


def plain(s):
    """Markdown inline to plain text (for JSON-LD)."""
    s = LINK_RE.sub(lambda m: m.group(1), s)
    return typo(s.replace("**", ""))


def attr(s):
    return html.escape(typo(s), quote=True)


# ---------------------------------------------------------------- rendering

IND = "      "


def render_paras(bl, cls=None, indent=IND):
    c = f' class="{cls}"' if cls else ""
    return "\n".join(f"{indent}<p{c}>{inline(t)}</p>" for kind, t in bl if kind == "p")


def render_role(bl, indent="          "):
    out = []
    for kind, v in bl:
        if kind == "p":
            out.append(f"{indent}<p>{inline(v)}</p>")
        elif kind == "fact":
            inner = []
            for line in v:
                if line.startswith("Source:"):
                    inner.append(f'<p class="src">{inline(line)}</p>')
                else:
                    inner.append(f"<p>{inline(line)}</p>")
            out.append(f'{indent}<div class="fact">' + "".join(inner) + "</div>")
        elif kind == "ol":
            items = "\n".join(f"{indent}  <li>{inline(i)}</li>" for i in v)
            out.append(f'{indent}<ol class="steps">\n{items}\n{indent}</ol>')
        else:
            raise BuildError(f"unexpected {kind} block in a seller/buyer section")
    return "\n".join(out)


def render_checklist(bl, slug):
    out, seen_list = [], False
    for kind, v in bl:
        if kind == "p":
            cls = "check-note" if seen_list else "sec-lead"
            out.append(f'{IND}<p class="{cls}">{inline(v)}</p>')
        elif kind == "ul":
            seen_list = True
            items = []
            for n, item in enumerate(v, 1):
                m = re.match(r"\*\*(.+?)\*\*\s*(.*)", item)
                if not m:
                    raise BuildError("checklist items must start with **Item.**")
                tip = f" {inline(m.group(2))}" if m.group(2) else ""
                items.append(f'{IND}  <li><label><input type="checkbox" name="{slug}-{n}">'
                             f"<span><strong>{_text(m.group(1))}</strong>{tip}</span></label></li>")
            out.append(f'{IND}<ul class="check">\n' + "\n".join(items) + f"\n{IND}</ul>")
        else:
            raise BuildError(f"unexpected {kind} block in the checklist")
    return "\n".join(out)


def faq_items(bl):
    items = []
    for kind, v in bl:
        if kind == "q":
            items.append([v, []])
        elif kind == "p" and items:
            items[-1][1].append(v)
        else:
            raise BuildError("faq: each answer needs a '### Question' above it")
    if not items:
        raise BuildError("faq: no questions")
    return items


def render_faq(items):
    out = []
    for q, answers in items:
        out.append(f"        <div>\n          <h3>{inline(q)}</h3>")
        out += [f"          <p>{inline(a)}</p>" for a in answers]
        out.append("        </div>")
    return "\n".join(out)


def human_date(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%B')} {d.year}"


def jsonld(meta, faq, canonical, og_image):
    org = {"@type": "Organization", "@id": SITE + "/#organization", "name": "RIALITI", "url": SITE + "/",
           "logo": {"@type": "ImageObject", "url": SITE + "/assets/play/icon-512.png", "width": 512, "height": 512}}
    article = {
        "@type": "Article", "@id": canonical + "#article",
        "headline": typo(meta["h1"]), "description": typo(meta["description"]),
        "image": og_image, "inLanguage": "en",
        "datePublished": meta["published"], "dateModified": meta["modified"],
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "author": {"@id": SITE + "/#organization"}, "publisher": org,
    }
    faqpage = {"@type": "FAQPage", "@id": canonical + "#faq", "mainEntity": [
        {"@type": "Question", "name": plain(q),
         "acceptedAnswer": {"@type": "Answer", "text": " ".join(plain(a) for a in answers)}}
        for q, answers in faq]}
    data = {"@context": "https://schema.org", "@graph": [article, faqpage]}
    s = json.dumps(data, ensure_ascii=False, indent=1)
    return s.replace("<", "\\u003c")


def build(slug):
    src = GUIDES / slug / "content.md"
    meta, sec = parse(src)
    canonical = f"{SITE}/guides/{slug}/"
    og_image = meta["og_image"] if meta["og_image"].startswith("http") else SITE + meta["og_image"]
    organic = ("utm_source=rialiti.io&utm_medium=guide&utm_campaign=guides&utm_content="
               + meta["organic_content"])
    play_href = PLAY + quote(organic, safe="")

    answer = [t for k, t in sec["answer"]["blocks"] if k == "p"]
    if len(answer) != 2:
        raise BuildError("answer: needs exactly two paragraphs (what a match means, what it does not)")
    faq = faq_items(sec["faq"]["blocks"])
    hook_source = (attr_free(meta["hook_source_note"]) +
                   f'<a href="{html.escape(meta["hook_source_url"])}" target="_blank" rel="noopener">'
                   f'{_text(meta["hook_source_name"])}</a>')

    values = {
        "slug": slug,
        "title": attr(meta["title"]),
        "description": attr(meta["description"]),
        "canonical": canonical,
        "og_locale": meta["og_locale"],
        "og_title": attr(meta["og_title"]),
        "og_description": attr(meta["og_description"]),
        "og_image": og_image,
        "og_image_alt": attr(meta["og_image_alt"]),
        "published": meta["published"],
        "modified": meta["modified"],
        "modified_human": human_date(meta["modified"]),
        "jsonld": jsonld(meta, faq, canonical, og_image),
        "cell": meta["cell"],
        "paid_campaign": meta["paid_campaign"],
        "play_href": html.escape(play_href),
        "hook_number": _text(meta["hook_number"]),
        "hook_text": inline(meta["hook_text"]),
        "hook_source": hook_source,
        "h1": _text(meta["h1"]),
        "intro": render_paras(sec["intro"]["blocks"], indent="        "),
        "hero_aside": inline(meta["hero_aside"]),
        "how_heading": _text(sec["how"]["heading"]),
        "how_body": render_paras(sec["how"]["blocks"], "sec-lead"),
        "seller_heading": _text(sec["seller"]["heading"]),
        "seller_body": render_role(sec["seller"]["blocks"]),
        "seller_caption": inline(meta["seller_caption"]),
        "handoff": inline(meta["handoff"]),
        "buyer_heading": _text(sec["buyer"]["heading"]),
        "buyer_body": render_role(sec["buyer"]["blocks"]),
        "buyer_caption": inline(meta["buyer_caption"]),
        "answer_heading": _text(sec["answer"]["heading"]),
        "answer_yes": inline(answer[0]),
        "answer_no": inline(answer[1]),
        "checklist_heading": _text(sec["checklist"]["heading"]),
        "checklist_body": render_checklist(sec["checklist"]["blocks"], slug),
        "faq_heading": _text(sec["faq"]["heading"]),
        "faq_body": render_faq(faq),
        "close_heading": _text(sec["close"]["heading"]),
        "close_body": render_paras(sec["close"]["blocks"], "sec-lead"),
        "close_aside": inline(meta["close_aside"]),
        "css": (TEMPLATE / "guides.css").read_text(encoding="utf-8"),
        "js": (TEMPLATE / "guides.js").read_text(encoding="utf-8"),
    }
    for k in ("how", "seller", "buyer", "answer", "checklist", "faq", "close"):
        if not sec[k]["heading"]:
            raise BuildError(f"section [{k}] needs a heading after the key")

    page = (TEMPLATE / "page.html").read_text(encoding="utf-8")

    def fill(m):
        k = m.group(1)
        if k not in values:
            raise BuildError(f"template placeholder {{{{{k}}}}} has no value")
        return values[k]
    page = re.sub(r"\{\{(\w+)\}\}", fill, page)

    if len(typo(meta["title"])) > 60:
        raise BuildError(f"title is {len(typo(meta['title']))} characters; keep it at 60 or under")
    low = page.lower()
    hits = [w for w in LINT if w in low]
    if hits:
        raise BuildError(f"{slug}: rendered page contains banned text: {hits}")
    return page, canonical, meta


def attr_free(s):
    return inline(s + " ") if s else ""


def ensure_sitemap(canonical, lastmod):
    path = ROOT / "sitemap.xml"
    if not path.exists():
        return False
    s = path.read_text(encoding="utf-8")
    if f"<loc>{canonical}</loc>" in s:
        return False
    entry = f"  <url><loc>{canonical}</loc><lastmod>{lastmod}</lastmod></url>\n"
    path.write_text(s.replace("</urlset>", entry + "</urlset>"), encoding="utf-8")
    return True


def main(argv):
    check = "--check" in argv
    args = [a for a in argv if not a.startswith("--")]
    if "--all" in argv:
        args = sorted(p.parent.name for p in GUIDES.glob("*/content.md") if not p.parent.name.startswith("_"))
    if not args:
        print(__doc__)
        return 64
    status = 0
    for slug in args:
        if not SLUG_RE.match(slug):
            print(f"bad slug {slug!r}", file=sys.stderr)
            return 64
        try:
            page, canonical, meta = build(slug)
        except BuildError as e:
            print(f"build_guide: {e}", file=sys.stderr)
            return 2
        out = GUIDES / slug / "index.html"
        data = page.encode("utf-8")
        if check:
            same = out.exists() and out.read_bytes() == data
            print(f"{'same' if same else 'DIFFERS'}  {out.relative_to(ROOT)}  ({len(data)} bytes)")
            status |= 0 if same else 1
        else:
            out.write_bytes(data)
            added = ensure_sitemap(canonical, meta["modified"])
            print(f"wrote {out.relative_to(ROOT)} ({len(data)} bytes)" + ("; added to sitemap.xml" if added else ""))
    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
