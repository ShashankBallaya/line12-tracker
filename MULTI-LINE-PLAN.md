# Plan: from one line to many

Status: decided 2026-10-08. Step 2 done.

## Decisions (owner, 2026-10-08)

- Domain: mumbaimetrotracker.com. Site name: Mumbai Metro Tracker (assumed from the domain, owner to confirm).
- `/` is a hub of all lines.
- Line 5: cover the whole line. Phase 1 is built and gets the full Line 12 treatment (same orange line colour). Later phases get the lighter treatment until they are built.
- Repo: renamed from `line12-tracker` to `mumbai-metro-tracker` (done 2026-10-08). The Cloudflare Pages project keeps the name `line12-tracker` until the domain move.
- Line 12A: not decided yet.

Order from the owner's post of 7 Oct 2026: buy a domain, then Line 5, then Line 4 and Line 2B. Line 12 stays the first and fullest line.

## Where the code is today

- One line is baked in. `src/lib/data.ts` imports each JSON file once and exports module-level values (`project`, `stations`, `timeline` and so on). About 20 components and pages import those values directly.
- "Line 12" appears as literal text in 22 source files. Most of it is in `status.astro` (24 times), `stations/[id].astro` (10) and `Base.astro` (9: site name, JSON-LD `#line12`, OG tags).
- Some parts only make sense for Line 12 as built:
  - `src/lib/route.ts`: the schematic has one bend, read from the 2025 alignment.
  - `StationModel`, `BeforeAfter`, `LeadPicture`, `RouteRide`: Line 12 assets and captions.
  - `feed-sources.json`: match patterns for Line 12 only.
- The site lives at `line12-tracker.pages.dev`. Search Console is verified for it, and the sitemap lists `/`, `/status/`, `/stations/` and 19 station pages.
- Local branch `perf/station-page` changes `stations/[id].astro`. The refactor below touches the same file.

## Target shape

### URLs

```
/                          hub: all lines, Kalyan first
/line-12/                  today's front page
/line-12/status/
/line-12/stations/
/line-12/stations/kalyan/
/line-5/ ...               same set per line
```

- Every old URL gets a 301 to its `/line-12/...` twin in `public/_redirects`.
- Do the URL move and the domain move in one step, so search engines see one move, not two.

### Data

```
src/data/lines.json                 registry: id, name, colour token, route, status, order on the hub
src/data/lines/line-12/project.json
src/data/lines/line-12/stations.json
src/data/lines/line-12/timeline.json
src/data/lines/line-12/...          (every per-line file moves here unchanged)
src/data/lines/line-5/...
src/data/feed-sources.json          one file, a match block per line
src/data/feed.json                  items tagged with the line ids they match
```

- File schemas stay the same. A new line only needs the files it has facts for.
- A missing file means "no section", not an error. Line 5 can launch with project, stations, timeline and alignment only.

### Code seam

- `src/lib/data.ts` keeps its job as the one place that reads JSON. It gets `getLine(id)` that returns one typed bundle (project, stations, timeline, tenders and the rest, each optional except project and stations), plus `lines` for the hub.
- It loads files with `import.meta.glob`, so a new line folder needs no code change.
- Components take a `line` prop and stop importing module-level values. Sections whose data is missing do not render.
- Text like "Line 12" comes from `line.name`. Copy that is truly about Line 12 (for example the 12A note) moves into that line's data.
- `route.ts` reads bend points from the alignment GeoJSON properties (a list, not one value), so other lines can have zero or many bends.
- Line colour: one CSS custom property per line, set on the page root from `lines.json`. Today's `--signal-*` tokens stay as Line 12's values. Each colour gets a contrast check in light and dark mode before use.

### Interchanges

- A station can name a station on another line by id (for example `{ "line": "line-5", "station": "..." }`). The station page links across when that page exists, and shows plain text when it does not.
- Kalyan is the first real case: Line 12 Kalyan and Line 5.

### Brand

- "Line 12 Tracker" becomes a name for the whole site. The name waits for the domain.
- The masthead shows the site name, then the line mark ("LINE 12", "मेट्रो १२") on line pages.
- JSON-LD: one `WebSite` for the site, one `TrainLine`-style node per line (`#line-12`, `#line-5`).

## Steps

Each step ships on its own and leaves the live site working.

1. **Decisions.** Done, see above.
2. **Data move, no visible change.** Done 2026-10-08: build output matched the old one, apart from the order of two style blocks that target different elements. Move per-line files into `src/data/lines/line-12/`. Add `lines.json`. `getLine()` in `data.ts`. Old exports stay as thin wrappers for now. Update `validate-data.mjs` to walk folders and check `lines.json`. Build output must be byte-identical apart from asset hashes.
3. **Components take `line`.** Done 2026-10-09: every component and page takes a `Line` from `getLine()`, the old Line 12 exports are gone, and sections whose data file is missing do not show. Build output matched the old one byte for byte. Line 12 facts still written in shared code, to sort out in step 7 (move into Line 12's data, or show only for Line 12):
   - `FrontPage`, `Numbers`: done in step 7 (lines.json `copy`).
   - `Progress`: done in step 7 (stages and the standfirst are in each line's `project.json`).
   - `RouteRide`, `Stations`: done in step 7 (lines.json `copy`).
   - `Trains`: still Line 12's wording; it shows only for a line with rollingstock.json, so it moves to data when Line 5 gets that file.
   - `MapSection`, `[id].astro`, `LocatorMap`: done in step 7.
   - `SourcesFooter`: done in step 7 (`copy.primary_sources`).
   - `status.astro`: every answer. Line 12 only (`hasStatusPage`) until Line 5's answers are written.
   - `stations/index.astro`: done in step 7.
   - `Masthead`: done in step 7 (lists only the sections a line shows).
   - Site name "Line 12 Tracker" (Base, Colophon, breadcrumbs, OG, llms.txt): changes at the domain move.
4. **Routes under `/line-12/`** with `[line]` dynamic routes, the hub page, `_redirects`, sitemap and `llms.txt` per line. Ship this with the domain (step 5), not before.
5. **Domain move.** Custom domain on Cloudflare Pages, `site` in `astro.config.mjs`, Search Console property for the new domain plus the Change of Address tool, 301 from `pages.dev`. Note: `_redirects` cannot match on host name, so the `pages.dev` to new-domain redirect needs Cloudflare Bulk Redirects (to check before this step).
6. **Line 5 research.** First pass done 2026-10-09: `src/data/lines/line-5/` (project, stations, timeline, tenders, contractors, alignment), sources and open questions in `SOURCES.md` under "Line 5". Line 5 is in `lines.json`, but no page builds it until step 7. Same rules as Line 12: every fact sourced and graded.
7. **Line 5 pages.** Next (owner, 2026-10-09). Line 5 gets the full Line 12 treatment, on the same components and page layout. What it needs is listed under "Line 5 page" below.
8. **Line 4, then Line 2B.** Data and research only, if steps 2 to 4 hold.

## Line 5 page: what it needs to match Line 12

Status 2026-10-09. The page reuses Line 12's components and layout; this list is what Line 5 still lacks, section by section. "Data" means a sourced, graded file in `src/data/lines/line-5/`; "code" means a shared component change that must keep Line 12 byte-identical.

### Already in place

- `project.json`, `stations.json` (18 stations, 3 spur stations, 3 dropped), `timeline.json`, `tenders.json`, `contractors.json`, `alignment-mmrda-2025.geojson` (route in parts: current, underground, spur, superseded), and the sources in `SOURCES.md`.
- Decisions: countdown to 31 Dec 2026 for Phase 1 (labelled target); the Line 5A spur on the Line 5 page; Kapurbawdi as station 1 and the interchange with Line 4.

### Shared code that must learn new shapes (do first)

1. **Schematic strip** (`src/lib/route.ts`, `FrontPage`, `RouteRide`, `Base` preloader, OG card). Done 2026-10-09 (owner chose the unrolled strip): one straight strip, x true to distance, the loop at Kalyan drawn straight. The spur leaves Bhoirwadi at 45 degrees and runs below. The underground stretch is dashed; Kongaon West sits midway between its neighbours as an open dot. Read from the alignment's `branch_from_station` and `underground_along_m` (written by `build-alignment-line5.py`). Still to do: spur station ticks and labels in the route ride (item 4), and the OG card (step 4). See it with `astro dev` at `/preview/line-5/` (dev only, `src/preview/`).
2. **Map** (`MapSection`, `scripts/map.ts`). Done 2026-10-09. The GeoJSON parts draw apart: the line and the spur hollow, the underground stretch as a dashed outline, the 2017 route thin and dashed. The 2017 route and the dropped stations are off until the reader ticks "Show the earlier plan's route and dropped stations" (choosing a dropped station ticks it). Spur and dropped stations have their own groups in the station list and their own order line in the panel. The map opens on the whole route, not on Line 12's box. Still Line 12 text in it (item 5): the standfirst, the legend's "under construction, MMRDA's approved alignment", and "MMRDA's approved alignment, 20 Mar 2025" beside every station's coordinates (Line 5's Phase 3 and spur come from the key plan).
3. **Progress** (`Progress.astro`). Done 2026-10-09. The planning-to-opening steps are now "stages" (Line 5 already uses "phase" for its sections) in `project.json` under `stages.sections`: one section for Line 12, three for Line 5 (Phase 1; Phase 2; Phase 3 with the spur). Notes take `{progress_as_of}` and `{event:<id>}`, filled by `getLine`; the data check fails on an unknown event. The standfirst is `progress.summary`; the reported overall figure shows only when a line has one.
4. **Station lists and pages** (`Stations`, `RouteRide`, `stations/[id]`, `stations/index`, `LocatorMap`). Done 2026-10-09. Spur stations have their own group, ride entries and pages (prev/next run along the spur, back to Bhoirwadi); dropped stations are listed struck through with the revised plan's grade, without pages; Bhiwandi is marked underground; Kongaon West says "position not published"; `same_site_as` links across when the other line has pages (`stationHref`, else plain text). Line wording lives in lines.json `copy`, coordinates' source in `position_basis`. The locator draws the spur and the tunnel; its north arrow takes the corner the alignment names (`locator_north`). The same page files serve `/preview/line-5/stations/` in `astro dev`. Line 12 changed in one sentence only (Kalyan: "the first station", not "the first station, at the Kalyan end"). Not done: Line 12's Kalyan page does not link to Line 5's (Line 5 has no live pages yet); Line 5 has no status page.
5. **Line 12 facts in shared code**: the list under step 3 above. Done 2026-10-09 for everything a Line 5 page shows: front page (headline, standfirst, countdown title and target text, lead picture only where a line has one), Numbers, the map's text and first station, the primary sources, the masthead's section list, the page title and description. All of it is in lines.json `copy`, with figures filled from project.json. Left, because Line 5's data does not exist yet: `Trains` (needs rollingstock.json) and the status page (needs Line 5's answers); and the site name, which changes with the domain. The dev preview now renders the real front page (`src/pages/index.astro` takes a `lineId`).
6. **Two lines, one colour.** Done 2026-10-09 for every place one line names another: `LineMark.astro` puts the line's number on its colour (a hard-edged bar, navy on orange) before the mention, in the station list, station pages, the route ride, Numbers and the stations index; Kalyan's same-site link too. lines.json gives each line a `number` and a `colour` token. A line the site does not cover (Line 4, Line 14) gets a neutral outlined mark, since its colour is not ours to assert; Navi Mumbai's lines get none (a separate network). Still to do when they exist: the hub (step 4) and any map that draws two lines.

### Data and assets still to make

| Section | Line 12 has | Line 5 needs |
|---|---|---|
| Lead picture | Isometric drawing of the viaduct over a road marked 12 (`draw-lead-picture.py`) | Its own drawing. Candidate signature: the 550 m Kasheli creek viaduct, or the double-decker metro and flyover between Rajnoli and Durgadi (reported). |
| Hero 3D scene | `three/viaduct.ts` | Done 2026-10-09 (owner's request): the same scene and static drawing with Line 5's number painted on the ground (`data-line-number`, LeadPicture `number` prop). A Line 5 signature scene (Kasheli creek) can replace it later. |
| 3D station | `three/station.ts` + `station-model.json` captions | Phase 1 stations are a different design: spine and wings, two levels, about 145 m long, platforms about 13.5 m above the road (MMRDA environmental report, verified). New model and sourced captions. |
| Before and after | `beforeafter.json` from `build-wayback.mjs` | Make the script take a line. Phase 1 is built, so the pairs will be dramatic: imagery from before Feb 2020 (construction start) against the latest. Kasheli creek, Anjurphata, Dhamankar Naka. |
| Trains | `rollingstock.json` | A Line 5 file: Titagarh CA-241, 22 six-car trains, car size and capacity (MMRDA page). The owner's "LINE 5" train render lead, once sourced. |
| Ground photos | `photos.json` (owner, and Arindam with permission) | Phase 1 is built and near the owner: dated photos of Kapurbawdi, Kasheli, Dhamankar Naka. Same rules: EXIF stripped, plates blurred. |
| Updates | `social.json`, feed match block | A `line_5` block in `feed-sources.json`. Patterns must keep "Line 5" and "Metro 5" but not other cities' Line 5 (Pune, Chennai, Bengaluru all have one). Posts by @bodkeitis and @Maha7Arindam as reported. |
| Status page | `status.astro`, Line 12 answers | Line 5 answers: when Phase 1 opens, which stations open first, where it meets Line 4, what happens past Bhiwandi, where the spur goes. |
| Station pages | 19 pages, Marathi names, street level | 18 + 3 spur pages. Marathi names missing for Kapurbawdi, Durgadi, Khadakpada, Bhoirwadi, Shivaji Path, Kongaon West and the spur stations (Wikipedia has some, unverified). |
| OG card, llms.txt, sitemap | Line 12 | Per line, in step 4. |

### New for Line 5 (Line 12 does not have it yet)

- **Opening mode.** Phase 1 may open before the end of 2026. Plan sections for a running line: opening date, timings, fares, frequency, and "open" against "under construction" per station. Line 12 will need the same later.
- **Phase status at a glance.** One line in three phases at three stages (built, approved, approved), plus a spur.
- **The 2017 plan against the 2026 plan.** A short "what changed" view: Gopal Nagar, Sahajanand Chowk and APMC Kalyan dropped, the loop to Kalyan, Bhiwandi underground.

### Facts still missing (see `SOURCES.md`, Line 5)

Trial-run and CMRS dates; the tunnel's route at Bhiwandi; a position for Kongaon West; approval dates 2016 to 2018; final AIIB and OPEC Fund amounts; the remaining packages; a newer route for Phase 3 and the spur than the tentative key plan of March 2026 (that tender was cancelled).

## Risks

- **SEO dip.** Pages that rank today change URL. The 301s and one combined move keep this short. Check Search Console for two weeks after.
- **Performance.** `import.meta.glob` with `eager` pulls every line into each page. Load one line per page so the station page goal (see `perf/station-page`) is not hurt.
- **Parked branch.** `perf/station-page` was parked on 2026-10-09; redo its small changes on top of the multi-line code rather than rebase it.
- **Scope creep.** The 3D model, before/after and lead picture took most of Line 12's effort. Line 5 gets them (owner's decision); Lines 4 and 2B launch without them unless the owner decides otherwise.
- **Feed noise.** "Line 4" and "Line 2B" are common strings. Each line needs tight match patterns, and the 12 vs 12A rule must hold.

## Questions for the owner

1. Line 12A: a line of its own in the registry, or still out of scope?
2. Line 5 and Line 12 share the orange colour. On the hub and at Kalyan the two lines need a second cue (the line number, always shown) so they never rely on colour alone.
