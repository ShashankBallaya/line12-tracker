# Updating the data

Every fact on the site comes from the JSON files in `src/data/`. You edit them by hand, commit, and push. Cloudflare Pages rebuilds the site in about a minute.

## The rules

1. **No source, no fact.** Every entry has a `source_url`.
2. **Date your check.** Set `last_verified` to the day you checked the source, as `YYYY-MM-DD`.
3. **Grade it honestly.** Use one `status`:
   - `verified`: MMRDA's website or an MMRDA document says it.
   - `reported`: a news or trade outlet says it, but MMRDA does not (yet).
   - `unverified`: one weak source, or you could not confirm it.
   - `conflicting`: sources disagree. Put the other values in `alternatives`.
4. **Keep history.** When a number changes, move the old value into `history` (with its source) instead of deleting it. The site shows old values struck through.
5. **No em dashes.** Use commas, full stops or brackets.

Run `npm run validate` before you commit. It fails if an entry is missing a source, a date or a valid status.

## Common updates

### New monthly progress from MMRDA

MMRDA updates the progress table on its [Line 12 page](https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview) about once a month.

In `src/data/project.json`, edit `progress`:

```json
"progress": {
  "as_of": "2026-09-30",
  "items": [
    { "activity": "Pile works", "percent_complete": 39.50 },
    ...
  ],
  "status": "verified",
  "source_url": "https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview",
  "last_verified": "2026-10-05"
}
```

Also add a timeline event if something notable happened (next section).

### A new milestone

Add an object to `events` in `src/data/timeline.json`, in date order:

```json
{
  "id": "girder-300",
  "date": "2026-11",
  "date_precision": "month",
  "kind": "construction",
  "title": "300th U-girder launched",
  "summary": "Near Sonarpada station.",
  "status": "reported",
  "source_url": "https://example.com/article",
  "last_verified": "2026-11-20"
}
```

- `date` can be `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Only use a day if the source gives one.
- `kind` is one of `planning`, `approval`, `tender`, `award`, `construction`, `related`, `future`.

### A tender is awarded

In `src/data/tenders.json`, find the tender and set `awarded_value_crore`, `awarded_to`, `award_date` and `tender_status: "awarded"`. If the firm is new, add it to `src/data/contractors.json` and use its `id` in `awarded_to`.

### The target date changes

In `src/data/project.json`, edit `target_completion`:

- Put the new target in `value` (`YYYY-MM` or `YYYY-MM-DD`) and the day the countdown should count to in `countdown_date`.
- Move the old target into `alternatives` with its source.
- If MMRDA itself publishes the date, set `status` to `verified`.

### Curated X posts

Posts are never scraped. You choose them.

1. Open the post on X and copy its URL.
2. Add it to `posts` in `src/data/social.json`, newest first:

```json
{
  "url": "https://x.com/SomeAccount/status/1234567890",
  "author": "Display Name",
  "handle": "SomeAccount",
  "date": "2026-10-01",
  "text": "The post's text, as written.",
  "status": "reported",
  "source_url": "https://x.com/SomeAccount/status/1234567890",
  "last_verified": "2026-10-01"
}
```

The site prints the post as a row (date, author, text). A reader can open X's full embed, with photos, from that row. `status` grades the post's claims: posts by people who follow the project are `reported` at best.

### News and videos (automatic)

A GitHub Actions job (`.github/workflows/feed.yml`) runs every 6 hours. It reads the outlets' own RSS feeds and, if a key is set, YouTube. It keeps only items about Line 12, writes `src/data/feed.json`, and commits and deploys only when it finds something new. Do not edit `feed.json` by hand.

What you can change, in `src/data/feed-sources.json`:

- **Hide an item:** add its URL to `exclude_urls`. The next run removes it.
- **Add an outlet:** add an RSS feed to `news_feeds`. For a WordPress site, `https://site/?s=taloja&feed=rss2` gives its Line 12 articles. Do not add Google News: its feed is for personal readers only.
- **Change what counts as Line 12:** edit the patterns in `match`.

To run it by hand: GitHub > Actions > Update news feed > Run workflow. Or locally: `node scripts/fetch-feed.mjs`.

**Videos need a YouTube key.** Without one, the job fetches news only and the Videos list stays hidden.

1. In Google Cloud Console, create a project and enable **YouTube Data API v3**.
2. Create an API key and restrict it to that API.
3. In GitHub: Settings > Secrets and variables > Actions > New repository secret. Name it `YOUTUBE_API_KEY`.

The job uses about 200 of the 10,000 free daily quota units for each run, so it stays free.

## Route line and station positions

They come from MMRDA's approved alignment KMZ, published on its [Metro Influence Zone for NOC](https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc) page. When MMRDA publishes a newer file:

```bash
python scripts/build-alignment.py
```

It downloads the file, rewrites `src/data/alignment-mmrda-2025.geojson`, moves every station in `stations.json` to MMRDA's point, and keeps each earlier position under `location.earlier`. Then run `node scripts/build-wayback.mjs`, because the satellite spots sit on station positions. Check the printed list: any station that moved more than 50 m will say so on its page.

## Station pages, status page and search files

These are built from the data files. You never edit them by hand:

- `/stations/` and one page per station come from `src/data/stations.json`. A new station there gets its own page and a sitemap entry.
- `/status/` answers common questions from `project.json`, `contractors.json` and `rollingstock.json`. When a fact changes there, the answer changes too.
- `sitemap.xml` and `llms.txt` (a plain summary for AI assistants) are rebuilt on every deploy.

## Newer satellite imagery

Esri adds new imagery releases every few weeks. To refresh the before/after dates:

```bash
node scripts/build-wayback.mjs
```

It rewrites `src/data/beforeafter.json` with the latest release and its real capture date. Commit and push. A GitHub Actions job (`.github/workflows/imagery.yml`) also runs it on the 3rd of every month and deploys, so the site picks up new imagery, and shows when it last checked, without you.

## Your own ground photos

1. Put two photos of the same spot in `public/photos/` (for example `manpada-2024-06.jpg` and `manpada-2026-09.jpg`). Keep each under 400 KB.
2. Add a pair to `pairs` in `src/data/photos.json`:

```json
{
  "place": "Manpada Circle, looking south",
  "credit": "Shashank Ballaya",
  "before": { "src": "/photos/manpada-2024-06.jpg", "alt": "Manpada Circle before piers were built", "date": "2024-06-15" },
  "after": { "src": "/photos/manpada-2026-09.jpg", "alt": "Manpada Circle with the viaduct overhead", "date": "2026-09-20" }
}
```

The pair appears under the satellite comparison.

### Photos on a station page

Every station page has a photo slot beside its headline. Until you add a photo, it shows a dashed frame that says "No ground photo yet".

1. Remove the location data from the photo first. Phone photos carry the exact GPS point where you took them. The site shows only the station and the date.
2. Put the file in `public/photos/`, for example `sagaon-2026-10.jpg`. Keep it under 400 KB and at least 1200 px wide.
3. Add it under `stations` in `src/data/photos.json`, keyed by the station id (the last part of the page address, for example `sagaon`):

```json
"stations": {
  "sagaon": [
    {
      "src": "/photos/sagaon-2026-10.jpg",
      "alt": "Piers for Sagaon station rising from the median of Kalyan-Shilphata Road",
      "caption": "Looking towards Dombivli from the footpath",
      "date": "2026-10-04",
      "credit": "Shashank Ballaya",
      "width": 1600,
      "height": 1200
    }
  ]
}
```

The first photo fills the slot. Any more appear under "More from the ground" further down the page. `width` and `height` are the file's real pixel size, so the page does not jump while the photo loads.

A photo by someone else needs their permission first. Put their name in `credit`, their X handle (without the @) in `handle`, and a link to their own post in `source_url`. The caption then links the name to that post and shows the handle. Everyone with a `handle` also gets a large credit at the top of the footer on every page.
