/**
 * Typed access to the hand-maintained data files in src/data.
 * Components import from here, never from the JSON files directly,
 * so a schema change only needs fixing in one place.
 *
 * Each line's files live in src/data/lines/<id>/ and are listed in src/data/lines.json.
 * Line 12's files are the schema every line follows. Data is read at build time only:
 * no browser script imports this module.
 */
import linesJson from '../data/lines.json';
import feedJson from '../data/feed.json';

type ProjectFile = typeof import('../data/lines/line-12/project.json');
type StationsFile = typeof import('../data/lines/line-12/stations.json');
type TimelineFile = typeof import('../data/lines/line-12/timeline.json');
type TendersFile = typeof import('../data/lines/line-12/tenders.json');
type ContractorsFile = typeof import('../data/lines/line-12/contractors.json');
type RollingstockFile = typeof import('../data/lines/line-12/rollingstock.json');
type SocialFile = typeof import('../data/lines/line-12/social.json');
type PhotosFile = typeof import('../data/lines/line-12/photos.json');
type BeforeAfterFile = typeof import('../data/lines/line-12/beforeafter.json');
type StationModelFile = typeof import('../data/lines/line-12/station-model.json');

// Above getLine: lines load while this module loads, and their stage notes format dates.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const jsonFiles = import.meta.glob('../data/lines/*/*.json', { eager: true, import: 'default' });
const rawFiles = import.meta.glob('../data/lines/*/*.geojson', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export type LineInfo = (typeof linesJson.lines)[number];
export type LineId = LineInfo['id'];

/** Every line on the site, in hub order. */
export const lines: LineInfo[] = linesJson.lines;

/** How sure we are about a fact. See SOURCES.md. */
export type Grade = 'verified' | 'reported' | 'unverified' | 'conflicting';

export interface Sourced {
  status: Grade;
  source_url: string | null;
  last_verified: string;
}

/** A station. `phase` is set on lines built in phases (Line 5: 1, 2, 3, or '5A' for the spur). */
export type Station = StationsFile['stations'][number] & { phase?: number | string };
export type TimelineEvent = TimelineFile['events'][number];
export type Tender = TendersFile['tenders'][number];

export interface SocialPost {
  url: string;
  author: string;
  handle: string;
  date: string;
  text: string;
  status: Grade;
  source_url: string;
  last_verified: string;
}

/** Dated ground photos for one station page, by the owner or by people who gave permission. Never stock or official images. */
export interface StationPhoto {
  src: string;
  alt: string;
  date: string;
  credit: string;
  /** The photographer's X handle without the @, when the photo is not the owner's. */
  handle?: string;
  /** The photographer's own post, when the photo is not the owner's. */
  source_url?: string;
  width: number;
  height: number;
  caption?: string;
}

/** Where a section of the line stands on the way from planning to opening. Drawn as a pattern and written in words, never colour alone. */
export type StageState = 'done' | 'now' | 'started' | 'next';
export interface Stage {
  name: string;
  state: StageState;
  /** Dates in it are filled in from the data (see `stages.notes` in project.json). */
  note: string;
}
/** One part of a line built on its own (Line 5: Phase 1, Phase 2, Phase 3 with the spur). `label` is null when the line is built as one. */
export interface StageSection {
  label: string | null;
  stages: Stage[];
}

/**
 * Everything the data holds about one line. Only project and stations are required:
 * lists are empty and other parts undefined when the line has no file for them,
 * and the section that needs them does not show.
 */
export interface Line {
  id: LineId;
  info: LineInfo;
  project: ProjectFile;
  stations: Station[];
  /** A branch off the line (Line 5A for Line 5), in order from where it leaves; along_m is measured on the branch. */
  spurStations: Station[];
  /** Stations of an earlier plan that the current plan drops. */
  droppedStations: Station[];
  stationsMeta: StationsFile['_meta'];
  timeline: TimelineEvent[];
  tenders: Tender[];
  contractors: ContractorsFile['contractors'];
  excludedClaims: ContractorsFile['excluded_claims'];
  rollingstock?: RollingstockFile;
  socialPosts: SocialPost[];
  stationPhotos: Record<string, StationPhoto[]>;
  photoPairs: PhotosFile['pairs'];
  /** From project.json `stages`, with dates filled in; empty when the line has none. */
  stages: StageSection[];
  beforeAfter?: BeforeAfterFile;
  stationModel?: StationModelFile;
  /** The GeoJSON named by `alignment` in lines.json, as text. */
  alignmentRaw?: string;
  /** The latest review date across this line's fact files. */
  lastReviewed: string;
}

const byId = new Map<string, Line>();

export function getLine(id: LineId): Line {
  const cached = byId.get(id);
  if (cached) return cached;
  const info = lines.find((l) => l.id === id);
  if (!info) throw new Error(`No line "${id}" in src/data/lines.json`);
  const dir = `../data/lines/${id}/`;
  const file = <T>(name: string) => jsonFiles[dir + name] as T | undefined;
  const project = file<ProjectFile>('project.json');
  const stations = file<StationsFile>('stations.json');
  if (!project || !stations) throw new Error(`Line "${id}" needs project.json and stations.json`);
  const timeline = file<TimelineFile>('timeline.json');
  const tenders = file<TendersFile>('tenders.json');
  const contractors = file<ContractorsFile>('contractors.json');
  const rollingstock = file<RollingstockFile>('rollingstock.json');
  const social = file<SocialFile>('social.json');
  const photos = file<PhotosFile>('photos.json');
  const line: Line = {
    id,
    info,
    project,
    stations: stations.stations,
    spurStations: (stations as { spur_stations?: Station[] }).spur_stations ?? [],
    droppedStations: (stations as { dropped_stations?: Station[] }).dropped_stations ?? [],
    stationsMeta: stations._meta,
    timeline: timeline?.events ?? [],
    tenders: tenders?.tenders ?? [],
    contractors: contractors?.contractors ?? [],
    excludedClaims: contractors?.excluded_claims ?? [],
    rollingstock,
    socialPosts: (social?.posts ?? []) as SocialPost[],
    stationPhotos: (photos?.stations ?? {}) as Record<string, StationPhoto[]>,
    photoPairs: photos?.pairs ?? [],
    stages: fillStages(id, (project as { stages?: { sections: StageSection[] } }).stages?.sections ?? [], project.progress.as_of, timeline?.events ?? []),
    beforeAfter: file('beforeafter.json'),
    stationModel: file('station-model.json'),
    alignmentRaw: info.alignment ? rawFiles[dir + info.alignment] : undefined,
    lastReviewed: [project, stations, timeline, tenders, contractors, rollingstock, social]
      .map((f) => f?._meta.last_reviewed)
      .filter((d): d is string => !!d)
      .sort()
      .at(-1)!,
  };
  byId.set(id, line);
  return line;
}

/** The latest review date across every line, for site-wide pages such as the sitemap. */
export const lastReviewed: string = lines.map((l) => getLine(l.id).lastReviewed).sort().at(-1)!;

/** The schema.org @id of a line's node, e.g. "https://example.org/#line12". Station pages point at it. */
export const lineNodeId = (siteUrl: string, line: Line) => `${siteUrl}#${line.id.replace('-', '')}`;

/** Automatic feed (scripts/fetch-feed.mjs). Found by a script, not checked by a person. */
export const feed = feedJson as {
  _meta: { updated_at: string };
  news: { title: string; outlet: string; date: string; url: string }[];
  videos: { id: string; title: string; channel: string; date: string; url: string }[];
};

/** People who shared their photos with permission (those with an X handle) on one station page. */
export const photoContributorsFor = (line: Line, stationId: string) => {
  const byHandle = new Map<string, { credit: string; handle: string }>();
  for (const ph of line.stationPhotos[stationId] ?? []) {
    if (ph.handle && !byHandle.has(ph.handle)) byHandle.set(ph.handle, { credit: ph.credit, handle: ph.handle });
  }
  return [...byHandle.values()];
};

/** Plain-language labels for each grade, used in text next to every mark. */
export const gradeLabel: Record<Grade, string> = {
  verified: 'Verified',
  reported: 'Reported',
  unverified: 'Unverified',
  conflicting: 'Sources conflict',
};

export const gradeHelp: Record<Grade, string> = {
  verified: 'Confirmed by MMRDA or its published project report.',
  reported: 'From a news or trade source, not confirmed by MMRDA.',
  unverified: 'Could not be confirmed. Treat with care.',
  conflicting: 'Sources disagree. Alternatives are shown.',
};

/** Short outlet name from a URL, e.g. "mmrda.maharashtra.gov.in" -> "MMRDA". */
export function outletName(url: string | null | undefined): string {
  if (!url) return 'No source';
  const host = new URL(url).hostname.replace(/^www\./, '');
  const known: Record<string, string> = {
    'mmrda.maharashtra.gov.in': 'MMRDA',
    'themetrorailguy.com': 'The Metro Rail Guy',
    'metrorailtoday.com': 'Metro Rail Today',
    'metrorailnews.in': 'Metro Rail News',
    'freepressjournal.in': 'Free Press Journal',
    'railanalysis.in': 'Rail Analysis India',
    'remumbai.in': 'Re-Mumbai',
    'newsband.in': 'Newsband',
    'swarajyamag.com': 'Swarajya',
    'media.biltrax.com': 'Biltrax',
    'urbanacres.in': 'Urban Acres',
    'constructionworld.in': 'Construction World',
    'en.wikipedia.org': 'Wikipedia',
    'x.com': 'X',
    'livingatlas.arcgis.com': 'Esri Wayback',
  };
  if (url.includes('Metro%20Line%2012.pdf')) return 'MMRDA DPR (2019)';
  return known[host] ?? host;
}

/** Formats "2024-03-27" / "2024-03" / "2019" by its precision. Never invents a day. */
/** Fills {progress_as_of} and {event:<timeline id>} in stage notes. An unknown event id stops the build. */
function fillStages(id: string, sections: StageSection[], progressAsOf: string, events: TimelineEvent[]): StageSection[] {
  const fill = (note: string) =>
    note
      .replace('{progress_as_of}', formatDate(progressAsOf))
      .replace(/\{event:([^}]+)\}/g, (_, ev: string) => {
        const e = events.find((x) => x.id === ev);
        if (!e) throw new Error(`${id}: a stage note names timeline event "${ev}", which timeline.json does not have`);
        return formatDate(e.date);
      });
  return sections.map((sec) => ({ ...sec, stages: sec.stages.map((st) => ({ ...st, note: fill(st.note) })) }));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Date not announced';
  const [y, m, d] = value.split('-');
  if (d) return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
  if (m) return `${MONTHS[Number(m) - 1]} ${y}`;
  return y;
}

/** Indian-grouped number, e.g. 5865 -> "5,865", 262000 -> "2,62,000". */
export function inr(n: number, digits = 2): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits });
}

export const REPO_URL = 'https://github.com/ShashankBallaya/mumbai-metro-tracker';
export const CORRECTION_URL = `${REPO_URL}/issues/new?labels=correction&title=Correction%3A%20`;
