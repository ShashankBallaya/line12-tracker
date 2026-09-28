/**
 * Typed access to the hand-maintained data files in src/data.
 * Components import from here, never from the JSON files directly,
 * so a schema change only needs fixing in one place.
 */
import projectJson from '../data/project.json';
import stationsJson from '../data/stations.json';
import timelineJson from '../data/timeline.json';
import tendersJson from '../data/tenders.json';
import contractorsJson from '../data/contractors.json';
import rollingstockJson from '../data/rollingstock.json';
import socialJson from '../data/social.json';

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
