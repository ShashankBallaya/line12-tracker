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

const jsonFiles = import.meta.glob('../data/lines/*/*.json', { eager: true, import: 'default' });
const rawFiles = import.meta.glob('../data/lines/*/*.geojson', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export type LineInfo = (typeof linesJson.lines)[number];
export type LineId = LineInfo['id'];

/** Every line on the site, in hub order. */
export const lines: LineInfo[] = linesJson.lines;

/** Everything the data holds about one line. Only project and stations are required. */
export interface LineData {
  info: LineInfo;
  project: ProjectFile;
  stations: StationsFile;
  timeline?: TimelineFile;
  tenders?: TendersFile;
  contractors?: ContractorsFile;
  rollingstock?: RollingstockFile;
  social?: SocialFile;
  photos?: PhotosFile;
  beforeAfter?: BeforeAfterFile;
  stationModel?: StationModelFile;
  /** The GeoJSON named by `alignment` in lines.json, as text. */
  alignmentRaw?: string;
}

export function getLine(id: LineId): LineData {
  const info = lines.find((l) => l.id === id);
  if (!info) throw new Error(`No line "${id}" in src/data/lines.json`);
  const dir = `../data/lines/${id}/`;
  const file = <T>(name: string) => jsonFiles[dir + name] as T | undefined;
  const project = file<ProjectFile>('project.json');
  const stations = file<StationsFile>('stations.json');
  if (!project || !stations) throw new Error(`Line "${id}" needs project.json and stations.json`);
  return {
    info,
    project,
    stations,
    timeline: file('timeline.json'),
    tenders: file('tenders.json'),
    contractors: file('contractors.json'),
    rollingstock: file('rollingstock.json'),
    social: file('social.json'),
    photos: file('photos.json'),
    beforeAfter: file('beforeafter.json'),
    stationModel: file('station-model.json'),
    alignmentRaw: info.alignment ? rawFiles[dir + info.alignment] : undefined,
  };
}

// Line 12 values under their old names, so components keep working while they move to getLine().
// Step 3 of MULTI-LINE-PLAN.md removes these.
const line12 = getLine('line-12');
const projectJson = line12.project;
const stationsJson = line12.stations;
const timelineJson = line12.timeline!;
const tendersJson = line12.tenders!;
const contractorsJson = line12.contractors!;
const rollingstockJson = line12.rollingstock!;
const socialJson = line12.social!;
const photosJson = line12.photos!;
export const beforeAfter = line12.beforeAfter!;
export const stationModel = line12.stationModel!;
export const photoPairs = photosJson.pairs;
export const alignmentRaw = line12.alignmentRaw!;

/** How sure we are about a fact. See SOURCES.md. */
export type Grade = 'verified' | 'reported' | 'unverified' | 'conflicting';

export interface Sourced {
  status: Grade;
  source_url: string | null;
  last_verified: string;
}

export const project = projectJson;
export const stations = stationsJson.stations;
export const stationsMeta = stationsJson._meta;
export const timeline = timelineJson.events;
export const tenders = tendersJson.tenders;
export const contractors = contractorsJson.contractors;
export const excludedClaims = contractorsJson.excluded_claims;
export const rollingstock = rollingstockJson;
export const socialPosts = socialJson.posts as {
  url: string;
  author: string;
  handle: string;
  date: string;
  text: string;
  status: Grade;
  source_url: string;
  last_verified: string;
}[];

/** Automatic feed (scripts/fetch-feed.mjs). Found by a script, not checked by a person. */
export const feed = feedJson as {
  _meta: { updated_at: string };
  news: { title: string; outlet: string; date: string; url: string }[];
  videos: { id: string; title: string; channel: string; date: string; url: string }[];
};

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
export const stationPhotos = photosJson.stations as Record<string, StationPhoto[]>;

/** People who shared their photos with permission (those with an X handle) on one station page. */
export const photoContributorsFor = (stationId: string) => {
  const byHandle = new Map<string, { credit: string; handle: string }>();
  for (const ph of stationPhotos[stationId] ?? []) {
    if (ph.handle && !byHandle.has(ph.handle)) byHandle.set(ph.handle, { credit: ph.credit, handle: ph.handle });
  }
  return [...byHandle.values()];
};

export type Station = (typeof stations)[number];
export type TimelineEvent = (typeof timeline)[number];
export type Tender = (typeof tenders)[number];

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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats "2024-03-27" / "2024-03" / "2019" by its precision. Never invents a day. */
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

/** The latest review date across all data files, for the "last updated" line. */
export const lastReviewed: string = [
  projectJson._meta.last_reviewed,
  stationsJson._meta.last_reviewed,
  timelineJson._meta.last_reviewed,
  tendersJson._meta.last_reviewed,
  contractorsJson._meta.last_reviewed,
  rollingstockJson._meta.last_reviewed,
  socialJson._meta.last_reviewed,
].sort().at(-1)!;

export const REPO_URL = 'https://github.com/ShashankBallaya/line12-tracker';
export const CORRECTION_URL = `${REPO_URL}/issues/new?labels=correction&title=Correction%3A%20`;
