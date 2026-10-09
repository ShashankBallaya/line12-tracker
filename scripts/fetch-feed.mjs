// Fetches the automatic news and video feed into src/data/feed.json.
// Runs every 6 hours in GitHub Actions (.github/workflows/feed.yml); also runs locally.
//   - News: outlets' own RSS feeds listed in src/data/feed-sources.json.
//   - Videos: the YouTube Data API, only when YOUTUBE_API_KEY is set.
// Keeps only items that match a line's rules in feed-sources.json, tags each with the lines
// it matches, merges them with what the file already holds, and writes the file only when
// the items change. Items written before lines existed are Line 12's.
// Stores headline, outlet, date and link only: no article text.
// Run: node scripts/fetch-feed.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DATA = new URL('../src/data/', import.meta.url);
const SOURCES = new URL('feed-sources.json', DATA);
const OUT = new URL('feed.json', DATA);
const UA = 'Line12Tracker/1.0 (+https://github.com/ShashankBallaya/mumbai-metro-tracker)';

const cfg = JSON.parse(readFileSync(SOURCES, 'utf8'));
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { news: [], videos: [] };

const any = (res, t) => res.some((r) => r.test(t));
const rx = (list) => list.map((p) => new RegExp(p, 'i'));
const rules = Object.entries(cfg.lines).map(([id, l]) => ({
  id,
  strong: rx(l.match.strong),
  line: rx(l.match.line),
  corridor: rx(l.match.corridor),
  needsPlace: l.match.require_corridor,
}));
/**
 * The lines an item is about. A line counts when the title meets a strong pattern; or the title names
 * the line (and, where the line needs it, a place on it appears in the title or summary); or the title
 * names a place on the line and the summary names the line.
 */
const linesOf = (title, summary) =>
  rules
    .filter((r) => any(r.strong, title)
      || (any(r.line, title) && (!r.needsPlace || any(r.corridor, `${title} ${summary}`)))
      || (any(r.corridor, title) && any(r.line, summary)))
    .map((r) => r.id);
const excluded = new Set(cfg.exclude_urls);
const oldest = Date.now() - cfg.keep.max_age_days * 86_400_000;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: ', ', hellip: '...', rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"' };
function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
// House style: no em dashes anywhere, and plain spacing.
const clean = (s) => decode(s).replace(/<[^>]+>/g, ' ').replace(/—/g, ', ').replace(/–/g, '-').replace(/\s+/g, ' ').trim();
const tag = (xml, name) => xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] ?? '';

/** https only, no tracking parameters, no fragment. Returns null for anything else. */
function cleanUrl(raw) {
  try {
    const u = new URL(decode(raw).trim());
    if (u.protocol !== 'https:') return null;
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|ref$)/i.test(k)) u.searchParams.delete(k);
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}
const istDate = (ms) => new Date(ms).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const key = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(25_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

// ---------- News ----------
const found = [];
let feedsOk = 0;
// Each outlet once per search word ({q} in its URL), or once when it has no search.
const searches = [...new Set(Object.values(cfg.lines).flatMap((l) => l.search))];
const requests = cfg.news_feeds.flatMap((f) => (f.url.includes('{q}') ? searches.map((q) => ({ ...f, url: f.url.replace('{q}', encodeURIComponent(q)) })) : [f]));
for (const feed of requests) {
  try {
    const xml = await get(feed.url);
    feedsOk++;
    let kept = 0;
    for (const item of xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []) {
      const title = clean(tag(item, 'title'));
      const url = cleanUrl(tag(item, 'link'));
      const when = Date.parse(clean(tag(item, 'pubDate')));
      const summary = clean(tag(item, 'description')).slice(0, 600);
      if (!title || !url || Number.isNaN(when) || when < oldest || excluded.has(url)) continue;
      const lines = linesOf(title, summary);
      if (!lines.length) continue;
      found.push({ title, outlet: feed.outlet, date: istDate(when), url, lines });
      kept++;
    }
    console.log(`news  ${feed.outlet} (${feed.url.split('?')[1] ?? 'feed'}): kept ${kept}`);
  } catch (e) {
    console.warn(`news  ${feed.outlet} (${feed.url.split('?')[1] ?? 'feed'}): skipped (${e.message})`);
  }
}

/** Fresh and stored items, one per id and title, newest first, the newest `limit` for each line. */
function merge(fresh, old, idOf, limit) {
  const byId = new Map();
  const titles = new Set();
  for (const it of [...fresh, ...old.map((o) => ({ ...o, lines: o.lines ?? ['line-12'] }))]) {
    const id = idOf(it);
    const seen = byId.get(id);
    // The same item found by two searches: it keeps every line it matched.
    if (seen) { seen.lines = [...new Set([...seen.lines, ...it.lines])]; continue; }
    if (titles.has(key(it.title)) || excluded.has(it.url)) continue;
    if (Date.parse(it.date) < oldest) continue;
    byId.set(id, { ...it });
    titles.add(key(it.title));
  }
  const all = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  const keep = new Set(rules.flatMap((r) => all.filter((it) => it.lines.includes(r.id)).slice(0, limit)));
  return all.filter((it) => keep.has(it));
}
// When every feed fails, keep what we had rather than emptying the list.
const news = feedsOk ? merge(found, prev.news ?? [], (n) => n.url, cfg.keep.news_per_line) : prev.news ?? [];

// ---------- Videos ----------
let videos = prev.videos ?? [];
const ytKey = process.env.YOUTUBE_API_KEY;
if (ytKey) {
  const fresh = [];
  const after = new Date(oldest).toISOString();
  for (const q of [...new Set(Object.values(cfg.lines).flatMap((l) => l.video_queries))]) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=15&regionCode=IN&publishedAfter=${after}&q=${encodeURIComponent(q)}&key=${ytKey}`;
      const { items = [] } = JSON.parse(await get(url));
      let kept = 0;
      for (const v of items) {
        const id = v.id?.videoId;
        const s = v.snippet ?? {};
        const title = clean(s.title ?? '');
        const lines = linesOf(title, clean(s.description ?? ''));
        if (!id || !/^[\w-]{11}$/.test(id) || !lines.length) continue;
        const u = `https://www.youtube.com/watch?v=${id}`;
        if (excluded.has(u)) continue;
        fresh.push({ id, title, channel: clean(s.channelTitle ?? ''), date: istDate(Date.parse(s.publishedAt)), url: u, lines });
        kept++;
      }
      console.log(`video "${q}": kept ${kept}`);
    } catch (e) {
      // Never print the request URL: it carries the key.
      console.warn(`video "${q}": skipped (${e.message})`);
    }
  }
  videos = merge(fresh, videos, (v) => v.id, cfg.keep.videos_per_line);
} else {
  console.log('video: YOUTUBE_API_KEY not set, videos left as they are');
}

// ---------- Write only on change ----------
const same = JSON.stringify({ news, videos }) === JSON.stringify({ news: prev.news ?? [], videos: prev.videos ?? [] });
if (same && existsSync(OUT)) {
  console.log('No new items. feed.json unchanged.');
} else {
  // Each line's own time: it moves only when that line's items change.
  const now = new Date().toISOString();
  const idsFor = (list, id) => JSON.stringify(list.filter((it) => (it.lines ?? ['line-12']).includes(id)).map((it) => it.url));
  const before = prev._meta?.updated_at_by_line ?? {};
  const byLine = Object.fromEntries(
    rules.map((r) => {
      const changed = idsFor([...news, ...videos], r.id) !== idsFor([...(prev.news ?? []), ...(prev.videos ?? [])], r.id);
      return [r.id, changed ? now : before[r.id] ?? prev._meta?.updated_at ?? now];
    }),
  );
  const out = {
    _meta: {
      description: 'Written by scripts/fetch-feed.mjs. Do not edit by hand: add an item\'s URL to exclude_urls in feed-sources.json to hide it. Items are found automatically and are not checked by a person.',
      updated_at: now,
      // When each line last gained or lost an item.
      updated_at_by_line: byLine,
    },
    news,
    videos,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote feed.json: ${news.length} news, ${videos.length} videos.`);
}
