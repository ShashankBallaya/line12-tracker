# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static-first, islands), TypeScript. GSAP + ScrollTrigger + SplitText, Lenis, Three.js (lazy), MapLibre GL. Cloudflare Pages for the site (GitHub repo `ShashankBallaya/mumbai-metro-tracker`, public). Set by the user's brief. News and video feed (Phase 5, deferred until the owner says to resume): a scheduled GitHub Actions job fetches Google News RSS and the YouTube Data API, commits a JSON file to `src/data/`, and Cloudflare Pages rebuilds. No Worker and no D1, so the feed stays on free tiers (decided 2026-09-28).

## Users

1. **Corridor residents.** People in Kalyan, Dombivli, the Kalyan-Shilphata Road belt and Taloja who will ride Line 12. Their job: find out when it opens, where their station is, and what is happening on their road now.
2. **Transit enthusiasts.** People who follow MMR metro projects closely. Their job: check tenders, contractors, progress figures and technical detail, with sources.

Both are primary. Residents set the first-read clarity; enthusiasts set the depth one click or scroll further.

## Product Purpose

Line 12 Tracker is an unofficial, public-interest website that tracks everything about Mumbai Metro Line 12 (Kalyan to Taloja, MMRDA): route and stations, progress, timeline, tenders, rolling stock and news. It exists because the official information is scattered across MMRDA pages, a 2019 DPR and trade press, and often conflicts. Success: a resident can answer "when, where, how far along" in seconds, and an enthusiast can trace every number to its source.

## Positioning

Every fact is sourced and graded (verified, reported, unverified, conflicting), and conflicts are shown, not hidden. The site is independent of MMRDA and says so.

## Operating Context

- Many visitors arrive on phones, often on mobile data.
- Data lives in `src/data/*.json`; the owner edits it by hand. News and videos will update automatically every 6 hours through GitHub Actions (Phase 5, deferred).
- Corrections come through GitHub issues on the public repo.

## Capabilities and Constraints

- Accuracy first. No invented facts, numbers, dates, contractor names or costs. Unverified items are shown as unverified.
- Footer disclaimer: unofficial, not affiliated with MMRDA.
- No copied official drawings or renders. 3D models are original and stylized.
- No em dashes anywhere in site copy.
- English only at launch. Copy must be structured so Marathi can be added later.
- No API keys in the repo (GitHub Actions secrets for the feed job, `.dev.vars` gitignored).
- Targets: Lighthouse performance 90+, accessibility 100. Respect `prefers-reduced-motion`.
- Target completion countdown uses the reported May 2028 target and must be labelled as reported, not official.
- Line 12A is a separate project and stays out of Line 12 totals.

## Brand Commitments

- Name: Line 12 Tracker. Masthead mark "LINE 12" with the Marathi "मेट्रो १२" beside it (confirmed by the owner, 2026-09-28). The Marathi mark is decorative; site copy stays English only.

## Evidence on Hand

- `src/data/*.json` and `SOURCES.md` (Phase 1 research, reviewed 2026-09-28).
- `src/data/alignment-dpr-2019.geojson`: approximate route from the DPR.
- No photos, renders, testimonials or official logos. Do not fabricate them. The owner may add dated ground photos later.
- No confirmed trial-run or opening date, no rolling stock supplier, no per-station progress.

## Product Principles

1. Source or it does not ship.
2. Show uncertainty honestly; a conflict is content, not an error.
3. Answer the resident's question first, then reward the enthusiast's curiosity.
4. Independent and plain about it.
5. Fast on a phone on a train platform.

## Accessibility & Inclusion

WCAG 2.2 AA minimum, Lighthouse accessibility 100. All motion has a reduced-motion path that keeps every piece of content usable. Stats and statuses must never rely on color alone.
