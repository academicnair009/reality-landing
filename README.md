# reality-landing

The www.rialiti.io website: a static page for RIALITI Capture (Android) and
RIALITI Check. No build step. `index.html` is the home page, `privacy/` the
privacy policy, `404.html` the not-found page.

- Editing rules, the story mechanism, the waitlist and the demo switch: `CLAUDE.md`
- Design, copy and QA for the current page: `docs/design/2026-10-28-v2/`
- Photograph credits: `CREDITS.md`

Checks (system Chrome; see `CLAUDE.md` for the node path):

    node scripts/verify_story.mjs --browser   # story model and real page, both scroll directions
    node scripts/render_page.mjs              # screenshots and page checks
