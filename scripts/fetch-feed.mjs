// Fetches the automatic news and video feed into src/data/feed.json.
// Runs every 6 hours in GitHub Actions (.github/workflows/feed.yml); also runs locally.
//   - News: outlets' own RSS feeds listed in src/data/feed-sources.json.
//   - Videos: the YouTube Data API, only when YOUTUBE_API_KEY is set.
// Keeps only items that match the Line 12 rules in feed-sources.json, merges them with
// what the file already holds, and writes the file only when the items change.
// Stores headline, outlet, date and link only: no article text.
// Run: node scripts/fetch-feed.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DATA = new URL('../src/data/', import.meta.url);
const SOURCES = new URL('feed-sources.json', DATA);
const OUT = new URL('feed.json', DATA);
const UA = 'Line12Tracker/1.0 (+https://github.com/ShashankBallaya/mumbai-metro-tracker)';

const cfg = JSON.parse(readFileSync(SOURCES, 'utf8'));
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { news: [], videos: [] };

const lineRe = cfg.match.line_12.map((p) => new RegExp(p, 'i'));
const corridorRe = cfg.match.corridor.map((p) => new RegExp(p, 'i'));
const any = (res, t) => res.some((r) => r.test(t));
// The title names Line 12, or the title names a corridor place and the summary names Line 12.
const relevant = (title, summary) => any(lineRe, title) || (any(corridorRe, title) && any(lineRe, summary));
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
for (const feed of cfg.news_feeds) {
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
      if (!relevant(title, summary)) continue;
      found.push({ title, outlet: feed.outlet, date: istDate(when), url });
      kept++;
    }
    console.log(`news  ${feed.outlet}: kept ${kept}`);
  } catch (e) {
    console.warn(`news  ${feed.outlet}: skipped (${e.message})`);
  }
}

function merge(fresh, old, idOf, limit) {
  const byId = new Map();
  const titles = new Set();
  for (const it of [...fresh, ...old]) {
    const id = idOf(it);
    if (byId.has(id) || titles.has(key(it.title)) || excluded.has(it.url)) continue;
    if (Date.parse(it.date) < oldest) continue;
    byId.set(id, it);
    titles.add(key(it.title));
  }
  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)).slice(0, limit);
}
// When every feed fails, keep what we had rather than emptying the list.
const news = feedsOk ? merge(found, prev.news ?? [], (n) => n.url, cfg.keep.news) : prev.news ?? [];

// ---------- Videos ----------
let videos = prev.videos ?? [];
const ytKey = process.env.YOUTUBE_API_KEY;
if (ytKey) {
  const fresh = [];
  const after = new Date(oldest).toISOString();
  for (const q of cfg.video_queries) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=15&regionCode=IN&publishedAfter=${after}&q=${encodeURIComponent(q)}&key=${ytKey}`;
      const { items = [] } = JSON.parse(await get(url));
      let kept = 0;
      for (const v of items) {
        const id = v.id?.videoId;
        const s = v.snippet ?? {};
        const title = clean(s.title ?? '');
        if (!id || !/^[\w-]{11}$/.test(id) || !relevant(title, clean(s.description ?? ''))) continue;
        const u = `https://www.youtube.com/watch?v=${id}`;
        if (excluded.has(u)) continue;
        fresh.push({ id, title, channel: clean(s.channelTitle ?? ''), date: istDate(Date.parse(s.publishedAt)), url: u });
        kept++;
      }
      console.log(`video "${q}": kept ${kept}`);
    } catch (e) {
      // Never print the request URL: it carries the key.
      console.warn(`video "${q}": skipped (${e.message})`);
    }
  }
  videos = merge(fresh, videos, (v) => v.id, cfg.keep.videos);
} else {
  console.log('video: YOUTUBE_API_KEY not set, videos left as they are');
}

// ---------- Write only on change ----------
const same = JSON.stringify({ news, videos }) === JSON.stringify({ news: prev.news ?? [], videos: prev.videos ?? [] });
if (same && existsSync(OUT)) {
  console.log('No new items. feed.json unchanged.');
} else {
  const out = {
    _meta: {
      description: 'Written by scripts/fetch-feed.mjs. Do not edit by hand: add an item\'s URL to exclude_urls in feed-sources.json to hide it. Items are found automatically and are not checked by a person.',
      updated_at: new Date().toISOString(),
    },
    news,
    videos,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote feed.json: ${news.length} news, ${videos.length} videos.`);
}
