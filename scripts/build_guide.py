#!/usr/bin/env python3
"""Render a RIALITI guide page from its content file.

    python3 scripts/build_guide.py used-cars       # writes guides/used-cars/index.html
    python3 scripts/build_guide.py --all           # every guides/<slug>/content.md
    python3 scripts/build_guide.py --check --all   # exit 1 if any committed page differs

Inputs:  guides/<slug>/content.md, guides/_template/page.html, index.html, sections.html,
         guides.css, guides.js
Output:  guides/<slug>/index.html (committed; GitHub Pages serves it as is) and,
         if missing, the page's <url> entry in sitemap.xml. With --all, also the
         guides index, guides/index.html (from guides/_template/index.html).

Guide order and cross-links: GUIDE_ORDER below lists the guides in the order the
index shows them; a guide not in it is appended alphabetically, so a new page is
listed and linked without touching this file. Every guide ends with a "More
guides" block (before the close) linking the other guides and the home page,
leaving out any link the page's own sections already make (the AI pillar's "When
this matters" list already links them all, so it gets no block). Because every
page lists every other page, run --all after adding or retitling a guide.

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

Section keys (sections render in the order they appear in the file, except
[close], which is always last, and [seller]/[buyer], which belong to [how]):
    intro      required. Paragraphs under the H1.
    how        required. H2 heading; paragraphs become the section lead.
    seller     required. H3 heading; paragraphs, "> " sourced facts, "1. **Title.** detail" steps.
    buyer      required. Same as seller.
    answer     required. H2 heading; exactly three paragraphs: what a match means,
               what an AI image or AI-edited photo gets (nothing to match), what it does not tell you.
    checklist  optional. H2 heading; lead paragraph, "- **Item.** tip" checkboxes, a closing note.
    text       optional, repeatable. H2 heading; paragraphs, "> " facts, "- " bullet lists.
    faq        required. H2 heading; "### Question" then answer paragraphs (also FAQPage JSON-LD).
               Two questions are standard on every guide and must be tagged:
                 ### [ai-tell] How can I tell if a <thing> photo is AI?   (answer: mostly you can't; ask for proof)
                 ### [ai-check] Can RIALITI tell whether an image is AI?  (answer: no, it proves real ones)
    close      required. H2 heading; paragraphs.
A "> " fact block is one or more lines; a line starting "Source:" becomes its credit.
HTML comments (<!-- ... -->) are dropped, so editors can leave notes in the file.

Standard AI fields, required on every guide (founder decision 2026-10-28: the reader
must learn that their photos can be proven real even when others edit or invent
photos with AI): "AI" in title and h1, the ai_line front-matter field (shown under
the hook statistic), the three-line [answer], and the two tagged FAQ entries.
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
            "hook_number", "hook_text", "hook_source_name", "hook_source_url", "ai_line"]
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
SECTIONS = ["intro", "how", "seller", "buyer", "answer", "checklist", "text", "faq", "close"]
REQUIRED_SECTIONS = ["intro", "how", "seller", "buyer", "answer", "faq", "close"]
REPEATABLE = {"text"}
AI_WORD = re.compile(r"\bAI\b")

# Honesty rail and copy rules (brief.md). Checked case-insensitively on the whole page.
LINT = ["—", "spot", "detect", "ai detector", "attest", "hash", "cryptograph",
        "blockchain", "metadata", "alpha", "api.rialiti.io", "gmail"]
SLUG_RE = re.compile(r"^[a-z0-9-]{1,32}$")

# The guides index (/guides/) and every "More guides" block list guides in this order.
GUIDE_ORDER = ["how-to-tell-if-a-photo-is-ai", "used-cars", "india"]
HOME_LINK = ("/", "The RIALITI home page")
INDEX_MODIFIED = "2026-10-29"           # the guides index's dateModified and sitemap lastmod


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

    order = []          # [(key, heading, lines)] in file order
    for line in m.group(2).splitlines():
        h = re.match(r"##\s+\[(\w+)\]\s*(.*)$", line)
        if h:
            key = h.group(1)
            if key not in SECTIONS:
                raise BuildError(f"{path}: unknown section [{key}]")
            if key not in REPEATABLE and any(k == key for k, _, _ in order):
                raise BuildError(f"{path}: section [{key}] appears twice")
            order.append((key, h.group(2).strip(), []))
        elif order:
            order[-1][2].append(line)
        elif line.strip():
            raise BuildError(f"{path}: text before the first ## [section]")
    keys = [k for k, _, _ in order]
    for k in REQUIRED_SECTIONS:
        if k not in keys:
            raise BuildError(f"{path}: missing section ## [{k}]")
    sections = [{"key": k, "heading": hd, "blocks": blocks(ls)} for k, hd, ls in order]
    for sec in sections:
        if sec["key"] != "intro" and not sec["heading"]:
            raise BuildError(f"{path}: section [{sec['key']}] needs a heading after the key")
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


def render_text(bl):
    out = []
    for kind, v in bl:
        if kind == "p":
            out.append(f'{IND}<p class="sec-lead">{inline(v)}</p>' if not out else f"{IND}<p>{inline(v)}</p>")
        elif kind == "fact":
            out.append(render_role([("fact", v)], indent=IND))
        elif kind == "ul":
            items = "\n".join(f"{IND}  <li>{inline(i)}</li>" for i in v)
            out.append(f'{IND}<ul class="bullets">\n{items}\n{IND}</ul>')
        else:
            raise BuildError(f"unexpected {kind} block in a text section")
    return '\n'.join(out).replace(f"{IND}<p>", f'{IND}<p class="prose-p">')


def faq_items(bl):
    items = []
    for kind, v in bl:
        if kind == "q":
            tag = re.match(r"\[([\w-]+)\]\s*(.*)", v)
            items.append([tag.group(2) if tag else v, [], tag.group(1) if tag else None])
        elif kind == "p" and items:
            items[-1][1].append(v)
        else:
            raise BuildError("faq: each answer needs a '### Question' above it")
    if not items:
        raise BuildError("faq: no questions")
    tags = [t for _, _, t in items]
    for t in ("ai-tell", "ai-check"):
        if tags.count(t) != 1:
            raise BuildError(f"faq: needs exactly one '### [{t}] ...' question (standard on every guide)")
    return items


def render_faq(items):
    out = []
    for q, answers, _tag in items:
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
        for q, answers, _tag in faq]}
    data = {"@context": "https://schema.org", "@graph": [article, faqpage]}
    s = json.dumps(data, ensure_ascii=False, indent=1)
    return s.replace("<", "\\u003c")


def partials():
    """guides/_template/sections.html, split on its "@@ name" lines."""
    text = (TEMPLATE / "sections.html").read_text(encoding="utf-8")
    parts = re.split(r"^@@ (\w+)\n", text, flags=re.M)
    return {parts[i]: parts[i + 1] for i in range(1, len(parts), 2)}


def fill(template, values):
    def sub(m):
        k = m.group(1)
        if k not in values:
            raise BuildError(f"template placeholder {{{{{k}}}}} has no value")
        return values[k]
    return re.sub(r"\{\{(\w+)\}\}", sub, template)


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40] or "section"


def catalog():
    """[(slug, meta)] for every guide, GUIDE_ORDER first, then any others alphabetically."""
    found = sorted(p.parent.name for p in GUIDES.glob("*/content.md") if not p.parent.name.startswith("_"))
    order = [s for s in GUIDE_ORDER if s in found] + [s for s in found if s not in GUIDE_ORDER]
    return [(s, parse(GUIDES / s / "content.md")[0]) for s in order]


def more_links(slug, cat, body):
    """The "More guides" items: other guides, then home, minus hrefs the page already links."""
    links = [(f"/guides/{s}/", m["title"]) for s, m in cat if s != slug] + [HOME_LINK]
    return [(href, text) for href, text in links if f'href="{html.escape(href)}"' not in body]


def build(slug, cat=None):
    src = GUIDES / slug / "content.md"
    meta, secs = parse(src)
    cat = catalog() if cat is None else cat
    by = {sec["key"]: sec for sec in secs}
    canonical = f"{SITE}/guides/{slug}/"
    og_image = meta["og_image"] if meta["og_image"].startswith("http") else SITE + meta["og_image"]
    organic = ("utm_source=rialiti.io&utm_medium=guide&utm_campaign=guides&utm_content="
               + meta["organic_content"])
    play_href = PLAY + quote(organic, safe="")

    for k in ("title", "h1"):
        if not AI_WORD.search(meta[k]):
            raise BuildError(f"{k} must name AI (standard on every guide): {meta[k]!r}")
    if len(typo(meta["title"])) > 60:
        raise BuildError(f"title is {len(typo(meta['title']))} characters; keep it at 60 or under")

    answer = [t for k, t in by["answer"]["blocks"] if k == "p"]
    if len(answer) != 3:
        raise BuildError("answer: needs exactly three paragraphs (what a match means, "
                         "what an AI image or AI-edited photo gets, what it does not tell you)")
    faq = faq_items(by["faq"]["blocks"])
    parts = partials()

    used_ids = {"how", "means", "faq", "get", "more"}
    rendered = []
    for sec in secs:
        k = sec["key"]
        if k == "how":
            rendered.append(fill(parts["how"], {
                "how_heading": _text(sec["heading"]),
                "how_body": render_paras(sec["blocks"], "sec-lead"),
                "seller_heading": _text(by["seller"]["heading"]),
                "seller_body": render_role(by["seller"]["blocks"]),
                "seller_caption": inline(meta["seller_caption"]),
                "handoff": inline(meta["handoff"]),
                "buyer_heading": _text(by["buyer"]["heading"]),
                "buyer_body": render_role(by["buyer"]["blocks"]),
                "buyer_caption": inline(meta["buyer_caption"]),
            }))
        elif k == "answer":
            rendered.append(fill(parts["answer"], {
                "answer_heading": _text(sec["heading"]),
                "answer_yes": inline(answer[0]), "answer_ai": inline(answer[1]), "answer_no": inline(answer[2]),
            }))
        elif k in ("checklist", "text"):
            sid = slugify(sec["heading"])
            while sid in used_ids:
                sid += "-2"
            used_ids.add(sid)
            body = render_checklist(sec["blocks"], slug) if k == "checklist" else render_text(sec["blocks"])
            rendered.append(fill(parts[k], {"id": sid, "heading": _text(sec["heading"]), "body": body}))
        elif k == "faq":
            rendered.append(fill(parts["faq"], {"heading": _text(sec["heading"]), "body": render_faq(faq)}))
    more = more_links(slug, cat, "".join(rendered))
    if more:
        items = "\n".join(f'{IND}  <li><a href="{html.escape(h)}">{_text(t)}</a></li>' for h, t in more)
        rendered.append(fill(parts["more"], {"items": items}))
    hook_long = len(meta["hook_number"]) > 4
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
        "hook_class": " hook-long" if hook_long else "",
        "hook_style": f' style="--hook-chars: {len(meta["hook_number"])}"' if hook_long else "",
        "hook_text": inline(meta["hook_text"]),
        "hook_source": hook_source,
        "ai_line": inline(meta["ai_line"]),
        "h1": _text(meta["h1"]),
        "intro": render_paras(by["intro"]["blocks"], indent="        "),
        "hero_aside": inline(meta["hero_aside"]),
        "seller_caption": inline(meta["seller_caption"]),
        "sections": "".join(rendered).rstrip("\n") + "\n",
        "close_heading": _text(by["close"]["heading"]),
        "close_body": render_paras(by["close"]["blocks"], "sec-lead"),
        "close_aside": inline(meta["close_aside"]),
        "css": (TEMPLATE / "guides.css").read_text(encoding="utf-8"),
        "js": (TEMPLATE / "guides.js").read_text(encoding="utf-8"),
    }
    page = fill((TEMPLATE / "page.html").read_text(encoding="utf-8"), values)
    lint(slug, page)
    return page, canonical, meta


def lint(name, page):
    low = page.lower()
    hits = [w for w in LINT if w in low]
    if hits:
        raise BuildError(f"{name}: rendered page contains banned text: {hits}")


def build_index(cat):
    """guides/index.html: the list of every guide, from guides/_template/index.html."""
    canonical = f"{SITE}/guides/"
    tpl = (TEMPLATE / "index.html").read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", tpl).group(1)
    if len(html.unescape(title)) > 60:
        raise BuildError(f"index title is {len(html.unescape(title))} characters; keep it at 60 or under")
    li = "\n".join(
        f'        <li>\n          <h2><a href="/guides/{s}/">{_text(m["title"])}</a></h2>\n'
        f'          <p>{_text(m["description"])}</p>\n        </li>' for s, m in cat)
    org = {"@type": "Organization", "@id": SITE + "/#organization", "name": "RIALITI", "url": SITE + "/",
           "logo": {"@type": "ImageObject", "url": SITE + "/assets/play/icon-512.png", "width": 512, "height": 512}}
    desc = re.search(r'<meta name="description" content="(.*?)">', tpl).group(1)
    data = {"@context": "https://schema.org", "@graph": [{
        "@type": "CollectionPage", "@id": canonical + "#page", "url": canonical,
        "name": html.unescape(title), "description": html.unescape(desc), "inLanguage": "en",
        "dateModified": INDEX_MODIFIED, "isPartOf": {"@type": "WebSite", "url": SITE + "/", "name": "RIALITI"},
        "publisher": org,
        "mainEntity": {"@type": "ItemList", "numberOfItems": len(cat), "itemListElement": [
            {"@type": "ListItem", "position": n, "url": f"{SITE}/guides/{s}/", "name": typo(m["title"])}
            for n, (s, m) in enumerate(cat, 1)]}}]}
    organic = "utm_source=rialiti.io&utm_medium=guide&utm_campaign=guides&utm_content=guides-index"
    page = fill(tpl, {
        "canonical": canonical,
        "jsonld": json.dumps(data, ensure_ascii=False, indent=1).replace("<", "\\u003c"),
        "play_href": html.escape(PLAY + quote(organic, safe="")),
        "guides": li,
        "css": (TEMPLATE / "guides.css").read_text(encoding="utf-8"),
        "js": (TEMPLATE / "guides.js").read_text(encoding="utf-8"),
    })
    lint("guides index", page)
    return page, canonical


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
    try:
        cat = catalog()
    except BuildError as e:
        print(f"build_guide: {e}", file=sys.stderr)
        return 2
    jobs = list(args) + (["/index"] if "--all" in argv else [])
    for slug in jobs:
        if slug != "/index" and not SLUG_RE.match(slug):
            print(f"bad slug {slug!r}", file=sys.stderr)
            return 64
        try:
            if slug == "/index":
                page, canonical = build_index(cat)
                meta = {"modified": INDEX_MODIFIED}
                out = GUIDES / "index.html"
            else:
                page, canonical, meta = build(slug, cat)
                out = GUIDES / slug / "index.html"
        except BuildError as e:
            print(f"build_guide: {e}", file=sys.stderr)
            return 2
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
