// llms.txt: a plain summary of the site for AI assistants and answer engines (llmstxt.org).
// Built from the same data as the pages, so it never drifts from them.
import type { APIRoute } from 'astro';
import { project, stations, formatDate, inr, lastReviewed } from '../lib/data';

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).toString();
  const p = project;
  const t = p.target_completion;
  const prog = p.progress;
  const body = `# Line 12 Tracker

> An unofficial, sourced tracker for Mumbai Metro Line 12 (Kalyan to Taloja), the line MMRDA is building. Every fact carries a grade (verified, reported, unverified, sources conflict) and a source link. Facts last checked ${formatDate(lastReviewed)}. Not affiliated with MMRDA.

## Key facts

- Name: ${p.name.value}, also called ${p.name.also_known_as.join(', ')}.
- Route: ${p.route.value}.
- Length: ${p.length_km.value} km, fully elevated, ${p.stations_count.value} stations (MMRDA, verified).
- Opening: no official date. Latest reported target ${formatDate(t.value)}; earlier reported target ${formatDate(t.alternatives[0].value)} (sources conflict).
- Progress (MMRDA, ${formatDate(prog.as_of)}): ${prog.items.map((i) => `${i.activity} ${i.percent_complete}%`).join('; ')}.
- Cost: Rs ${inr(p.completion_cost_crore_inr.value)} crore plus interest during construction (MMRDA loan invitation, March 2026); MMRDA's project page still gives Rs ${inr(p.completion_cost_crore_inr.alternatives[0].value)} crore (sources conflict).
- Funding: MMRDA invited banks in March 2026 to lend Rs 7,800 crore for Line 12; no lender named yet.
- Approvals: MMRDA Authority, 21 Nov 2018; Government of Maharashtra GR, 6 Sep 2019 (verified).
- Route and stations: MMRDA approved alignment of 20 Mar 2025, 22.17 km centre line from Kalyan to Amandoot, where it meets Navi Mumbai Metro Line 1.
- Interchanges: ${p.interchanges.value.map((x) => `${x.station} (${x.connects_to})`).join('; ')}.
- Depot: ${p.depot.value}, about ${p.depot.area_ha} ha.
- Builder: MMRDA; civil contract CA-240 with Gawar Constructions (reported).
- Line 12A is a separate project and is not part of Line 12's figures.

## Pages

- [Line 12 Tracker](${url('/')}): route, map, progress, tenders, trains, timeline and sources.
- [Line 12 status, answered](${url('/status/')}): opening date, progress, route, cost, interchanges.
- [All stations](${url('/stations/')}): the ${stations.length} stations in order.
${stations.map((s) => `- [${s.name} metro station](${url(`/stations/${s.id}/`)}): station ${s.order} of ${stations.length}.`).join('\n')}

## Sources

- [MMRDA Metro Line 12 project page](https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview)
- [Detailed Project Report, April 2019](https://mmrda.maharashtra.gov.in/sites/default/files/2021-10/Metro%20Line%2012.pdf)
- [Full source list](https://github.com/ShashankBallaya/mumbai-metro-tracker/blob/main/SOURCES.md)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
