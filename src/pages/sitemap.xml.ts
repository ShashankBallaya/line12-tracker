// The sitemap, built from the data so every station page is listed. lastmod is the day the facts
// were last checked, not the build date, so search engines only see a change when facts change.
import type { APIRoute } from 'astro';
import { stations, lastReviewed } from '../lib/data';

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).toString();
  const pages: { loc: string; lastmod: string; priority: string }[] = [
    { loc: url('/'), lastmod: lastReviewed, priority: '1.0' },
    { loc: url('/status/'), lastmod: lastReviewed, priority: '0.9' },
    { loc: url('/stations/'), lastmod: lastReviewed, priority: '0.8' },
    ...stations.map((s) => ({ loc: url(`/stations/${s.id}/`), lastmod: s.last_verified, priority: '0.7' })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
