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
2. Add it to `posts` in `src/data/social.json`:

```json
{
  "url": "https://x.com/SomeAccount/status/1234567890",
  "status": "verified",
  "source_url": "https://x.com/SomeAccount/status/1234567890",
  "last_verified": "2026-10-01"
}
```

The site shows it with X's official embed. Only add posts you have read and checked.

## Blocking a news link (after Phase 5)

When the automatic news feed is live, you can hide a bad link without redeploying:

```bash
npx wrangler d1 execute line12 --remote --command "INSERT INTO blocked_urls (url) VALUES ('https://example.com/bad-article')"
```

Full instructions arrive with Phase 5.
