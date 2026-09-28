# Line 12 Tracker

An unofficial, public-interest website that tracks Mumbai Metro Line 12 (Kalyan to Taloja, MMRDA): route, stations, progress, timeline, tenders and trains. Every figure links to its source and carries a grade (verified, reported, unverified, conflicting).

**Not affiliated with MMRDA or the Government of Maharashtra.**

Live site: https://line12-tracker.pages.dev (after the Cloudflare Pages setup below)

## Stack

- [Astro](https://astro.build) 7, static output, TypeScript
- GSAP (ScrollTrigger, SplitText) and Lenis for motion, all disabled under `prefers-reduced-motion`
- Fonts: Anek Latin, Anek Devanagari and Mukta (Ek Type, Mumbai), self-hosted through Fontsource
- Hosting: Cloudflare Pages, deployed from this GitHub repo
- MapLibre GL on OpenFreeMap tiles for the map; Esri Wayback imagery for before/after; Three.js for 3D. Heavy parts load only when their section is near.

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
  build-wayback.mjs       Picks before/after satellite imagery and capture dates (writes src/data/beforeafter.json).
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

## Environment variables (all optional)

| Variable | What it does |
|---|---|
| `PUBLIC_MAPILLARY_TOKEN` | Mapillary client token. Shows the nearest street-level photo (with its capture date) for each station. Free: create one at mapillary.com/dashboard/developers. |
| `PUBLIC_STREET_LEVEL_PROVIDER` | `mapillary` (default) or `google`. |
| `PUBLIC_GOOGLE_MAPS_KEY` | Only for `google`: a Maps Embed API key restricted to your domain. Needs a Google billing account. |

`PUBLIC_` values are built into the page, so only use client tokens restricted to your domain. Set them in Cloudflare Pages > Settings > Environment variables, or locally in `.env` (gitignored). Without them the site shows "Open in Mapillary / Street View" links instead.

The site itself is fully static. The news feed job has one optional GitHub Actions secret, `YOUTUBE_API_KEY` (see [UPDATING.md](UPDATING.md#news-and-videos-automatic)).

## How to update the facts

All facts live in `src/data/*.json`. See [UPDATING.md](UPDATING.md) for a step-by-step guide.

## Corrections

Found a mistake? [Open a correction issue](https://github.com/ShashankBallaya/line12-tracker/issues/new?labels=correction&title=Correction%3A%20) with the right figure and where you saw it.

## Licence and credits

- Code: MIT (see `LICENSE`).
- Fonts: Anek and Mukta by Ek Type, SIL Open Font License 1.1.
- Drawings on the site are original. They are not official MMRDA designs.
- Facts come from the sources listed in `SOURCES.md`. Their copyright stays with their owners.
