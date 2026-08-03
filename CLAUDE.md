# reality-landing

Marketing landing page for **Reality** (the attested-capture / video+photo
provenance product). Static site, deployed on **GitHub Pages** from this
repo's `main` branch (root). No build system — `index.html` is the entire
site, self-contained (inline CSS, no JS, no external assets).

## Context isolation — read this first

This repo is deliberately SEPARATE from the product monorepo
(`/Users/ashishnair/claude_ws/reality`) so that landing-page work never
consumes context in product sessions and vice versa. Do NOT read the
product repo from here; everything needed to work on this page is in this
file.

## Product facts the page may claim (all true as of 2026-08)

- Working prototype: native Android app, hardware-attested capture
  (TEE Key Attestation, ECDSA P-256, validated server-side against pinned
  Google roots), photos AND video.
- Server-side perceptual fingerprints survive platform re-encoding
  (WhatsApp/Telegram validated).
- Append-only RFC-6962 transparency log, STHs anchored to public Rekor.
- Verdicts are tiered and honest: ATTESTED (hardware) / REGISTERED
  (fingerprint known, no hardware proof) / unknown ≠ fake.
- Verification is free and public; the recorder pays (SSL-cert economics).

Do NOT add: testimonials, customer logos, usage numbers, funding claims —
none exist. Honesty is a product value ("we say what we can prove").

## Editing rules

- Brand name "Reality" is provisional — it appears as plain text; rebrand
  is a find-and-replace. Don't invent logos.
- CTA is a mailto to academicnair.009@gmail.com. A Formspree waitlist may
  replace it later (Ashish signs up, provides form ID).
- Keep the page a single self-contained index.html (no build step, no CDN,
  no external fonts) unless Ashish asks otherwise.
- Light/dark via prefers-color-scheme; keep both readable.

## Deploy

Push to `main` → GitHub Pages publishes automatically (branch: main,
path: /). Repo: github.com/academicnair009/reality-landing (public — Pages
free tier requires it). Live at
https://academicnair009.github.io/reality-landing/ until the custom domain
is wired: Ashish owns a domain (name not yet provided); when he supplies
it, add a `CNAME` file containing `www.<domain>` and have him create a DNS
CNAME record `www -> academicnair009.github.io`, then enable "Enforce
HTTPS" in repo Pages settings.
