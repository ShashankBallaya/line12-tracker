# Plan: from one line to many

Status: decided 2026-10-08. Step 2 done.

## Decisions (owner, 2026-10-08)

- Domain: mumbaimetrotracker.com. Site name: Mumbai Metro Tracker (assumed from the domain, owner to confirm).
- `/` is a hub of all lines.
- Line 5: cover the whole line. Phase 1 is built and gets the full Line 12 treatment (same orange line colour). Later phases get the lighter treatment until they are built.
- Repo: rename `line12-tracker` to `mumbai-metro-tracker`.
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
3. **Components take `line`.** One commit per group (front page, stations, status, layout and SEO). Remove the old exports at the end. Still no visible change.
4. **Routes under `/line-12/`** with `[line]` dynamic routes, the hub page, `_redirects`, sitemap and `llms.txt` per line. Ship this with the domain (step 5), not before.
5. **Domain move.** Custom domain on Cloudflare Pages, `site` in `astro.config.mjs`, Search Console property for the new domain plus the Change of Address tool, 301 from `pages.dev`. Note: `_redirects` cannot match on host name, so the `pages.dev` to new-domain redirect needs Cloudflare Bulk Redirects (to check before this step).
6. **Line 5 research.** Same rules as Line 12: every fact sourced and graded in `SOURCES.md`, alignment from MMRDA's KMZ if one exists. This is the long step and is separate from code.
7. **Line 5 pages.** Data files only, plus a feed match block and any per-line assets. Cross-links at Kalyan.
8. **Line 4, then Line 2B.** Data and research only, if steps 2 to 4 hold.

## Risks

- **SEO dip.** Pages that rank today change URL. The 301s and one combined move keep this short. Check Search Console for two weeks after.
- **Performance.** `import.meta.glob` with `eager` pulls every line into each page. Load one line per page so the station page goal (see `perf/station-page`) is not hurt.
- **Merge conflict** with `perf/station-page`. Merge or park that branch before step 3.
- **Scope creep.** The 3D model, before/after and lead picture took most of Line 12's effort. New lines launch without them.
- **Feed noise.** "Line 4" and "Line 2B" are common strings. Each line needs tight match patterns, and the 12 vs 12A rule must hold.

## Questions for the owner

1. Line 12A: a line of its own in the registry, or still out of scope?
2. Line 5 and Line 12 share the orange colour. On the hub and at Kalyan the two lines need a second cue (the line number, always shown) so they never rely on colour alone.
