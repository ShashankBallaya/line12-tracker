# Line 12 Tracker

An unofficial, public-interest website that tracks Mumbai Metro Line 12 (Kalyan to Taloja, MMRDA): route, stations, progress, timeline, tenders and trains. Every figure links to its source and carries a grade (verified, reported, unverified, conflicting).

**Not affiliated with MMRDA or the Government of Maharashtra.**

Live site: https://line12-tracker.pages.dev (after the Cloudflare Pages setup below)

## Stack

- [Astro](https://astro.build) 7, static output, TypeScript
- GSAP (ScrollTrigger, SplitText) and Lenis for motion, all disabled under `prefers-reduced-motion`
- Fonts: Anek Latin, Anek Devanagari and Mukta (Ek Type, Mumbai), self-hosted through Fontsource
- Hosting: Cloudflare Pages, deployed from this GitHub repo
- Later phases: MapLibre GL (map), Three.js (3D), a Cloudflare Worker with D1 and cron (news and video feed)

## Project layout

```
src/
  data/            Hand-edited JSON. The only source of facts on the site.
  lib/data.ts      Typed access to the data, date and number formatting.
  components/      One Astro component per section of the page.
  scripts/         Client scripts: motion, theme switch, countdown.
  styles/          Design tokens (tokens.css) and global styles.
scripts/
  validate-data.mjs       Checks every data entry has source_url, last_verified and a valid status.
  draw-lead-picture.py    Generates the isometric lead picture (src/components/LeadPicture.astro).
  capture.mjs             Dev-only screenshots for design review (needs local Chrome).
SOURCES.md         Every source used, with open questions.
PRODUCT.md         Product context for design work.
```

## Run it locally

Requirements: Node 20 or later.

```bash
npm install
npm run dev
```

Open http://localhost:4321.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds the static site into `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run validate` | Checks the data files |
| `npm run check` | Type-checks the project and checks the data files |

## Deploy to Cloudflare Pages (from GitHub)

Do this once, in the Cloudflare dashboard:

1. Go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2. Pick the GitHub repo `ShashankBallaya/line12-tracker`.
3. Set the build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. Select **Save and Deploy**. The project name `line12-tracker` gives the address `line12-tracker.pages.dev`.

After that, every push to `main` deploys automatically, and every pull request gets a preview URL.

## Secrets

The site itself needs no secrets. The news and video Worker (Phase 5) will need a YouTube Data API key:

- Production: `npx wrangler secret put YOUTUBE_API_KEY` (from the Worker's folder).
- Local development: put it in a `.dev.vars` file. `.dev.vars` is in `.gitignore`. Never commit it.

## How to update the facts

All facts live in `src/data/*.json`. See [UPDATING.md](UPDATING.md) for a step-by-step guide.

## Corrections

Found a mistake? [Open a correction issue](https://github.com/ShashankBallaya/line12-tracker/issues/new?labels=correction&title=Correction%3A%20) with the right figure and where you saw it.

## Licence and credits

- Code: MIT (see `LICENSE`).
- Fonts: Anek and Mukta by Ek Type, SIL Open Font License 1.1.
- Drawings on the site are original. They are not official MMRDA designs.
- Facts come from the sources listed in `SOURCES.md`. Their copyright stays with their owners.
