# Sources

Research for Phase 1. Last reviewed: 2026-09-28.

Every data point in `src/data/*.json` has a `source_url`, a `last_verified` date and a `status`.

## Status values

| Status | Meaning | How the UI shows it |
|---|---|---|
| `verified` | Confirmed by a primary source: the MMRDA website or the MMRDA-published DPR. | Normal. |
| `reported` | From a reputable secondary source (news or trade press). Not confirmed by a primary source. | Small "reported" tag with the outlet name. |
| `unverified` | Single weak source, or not confirmed. | Clear warning style. |
| `conflicting` | Sources disagree. The value is the latest credible figure. `alternatives` lists the others. | Warning style plus the alternatives. |

## Primary sources

1. **MMRDA, Metro Line 12 project page.** Length, stations, depot, interchanges, cost, 2031 ridership, monthly progress (as of 31 Aug 2026).
   https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview
2. **Detailed Project Report, Mumbai Metro Line 12, Kalyan to Taloja.** Prepared by DMRC for MMRDA. Final, April 2019. Design basis, station chainages, alignment coordinates, cost, rolling stock assumptions.
   https://mmrda.maharashtra.gov.in/sites/default/files/2021-10/Metro%20Line%2012.pdf

Note: the MMRDA server has an incomplete TLS certificate chain. Some tools refuse to fetch it. Browsers load it normally.

## Secondary sources (reputable news and trade press)

| Outlet | Date | Used for | URL |
|---|---|---|---|
| The Metro Rail Guy | 15 Feb 2022 | GC bids invited | https://themetrorailguy.com/2022/02/15/mumbai-metro-line-10-line-12s-general-consultant-bids-invited/ |
| The Metro Rail Guy | 29 Jul 2022 | GC preferred bidder | https://themetrorailguy.com/2022/07/29/systra-db-wins-mumbai-metro-line-10-12s-general-consultancy/ |
| The Metro Rail Guy | 26 Dec 2022 | GC award, Rs 265.10 cr, 54 months | https://themetrorailguy.com/2022/12/26/systra-db-awarded-mumbai-metro-line-10-12s-general-consultancy/ |
| The Metro Rail Guy | 31 May 2023 | First civil tender CA-185, CA-186, bidders | https://themetrorailguy.com/2023/05/31/11-bidders-for-mumbai-metro-line-12-kalyan-talojas-civil-work/ |
| The Metro Rail Guy | 9 Jun 2023 | Design consultant award | https://themetrorailguy.com/2023/06/09/lkt-enia-jv-wins-mumbai-metro-line-12s-design-consultant-work/ |
| The Metro Rail Guy | 9 Feb 2024 (updated) | CA-240 bids, scope, 19 stations, LoA 27 Mar 2024 for Rs 1,971.77 cr | https://themetrorailguy.com/2024/02/09/gawar-wins-mumbai-metro-line-12s-construction-contract-ca-240/ |
| Metro Rail Today | 9 Feb 2024 | CA-240 lowest bid Rs 2,037.20 cr | https://metrorailtoday.com/news/gawar-constructions-wins-2037-crore-civil-contract-for-mumbai-metro-line-12 |
| Swarajya | Mar 2024 | Foundation stone, 3 Mar 2024 | https://swarajyamag.com/infrastructure/mumbai-metro-foundation-stone-laid-to-progress-with-22-km-line-12-enhancing-transit-between-kalyan-and-navi-mumbai |
| Biltrax Media | Mar 2024 | Foundation stone, 3 Mar 2024 | https://media.biltrax.com/maharashtra-cm-lays-foundation-of-metro-line-12-in-mmr/ |
| Free Press Journal | 25 Dec 2024 | Dec 2027 target, depot details, contract periods (MMRDA statement) | https://www.freepressjournal.in/mumbai/navi-mumbai-orange-metro-line-12-to-connect-kalyan-taloja-set-for-completion-by-december-2027 |
| Construction World | 19 Aug 2025 | Operations claims (unverified) | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-metro-line-12-to-connect-kalyan--taloja---nm-airport/77782 |
| Free Press Journal | Dec 2025 | 100th U-girder, May 2028 target | https://www.freepressjournal.in/mumbai/mumbai-metro-update-kalyantaloja-line-key-link-to-navi-mumbai-airport-crosses-100th-u-girder-milestone-target-completion-may-2028 |
| Rail Analysis India | 15 Dec 2025 | 100th U-girder, long spans, station heights | https://railanalysis.in/metro/mmrdas-mumbai-metro-line-12-marks-major-milestone-with-100th-u-girder-launch-near-dombivli/ |
| Re-Mumbai | 17 Feb 2026 | 200th U-girder near Golavali | https://remumbai.in/2026/02/17/metro-line-12-achieves-key-construction-milestone-in-kalyan-dombivli-taloja-corridor/ |
| Newsband | 20 Feb 2026 | Line 12A approval (related project) | https://www.newsband.in/article_detail/kalyantaloja-metro-12a-corridor-gets-state-approval |
| Metro Rail News | 1 Jun 2026 | Systems and rolling stock tender, about Rs 4,882 cr | https://metrorailnews.in/mmrda-invites-bids-for-rolling-stock-and-signalling-systems-for-mumbai-metro-line-12/ |
| Urban Acres | 1 Jun 2026 | Same tender, about Rs 4,900 cr | https://urbanacres.in/mumbai-metro-line-12-tender-advances-network/ |
| Wikipedia, Orange Line | read 28 Sep 2026 | Approval dates and claims marked unverified | https://en.wikipedia.org/wiki/Orange_Line_(Mumbai_Metro) |

## Derived data

`src/data/alignment-dpr-2019.geojson` and the station coordinates in `stations.json` come from DPR Table 4.3 (213 alignment points, chainage -403.688 m to 20,645.678 m).

- Method: parse the table, convert easting and northing to latitude and longitude, and interpolate each station at its DPR chainage.
- Assumption: WGS84, UTM zone 43N. The DPR does not state the datum. If it is Everest 1830, positions can be off by a few hundred metres.
- Check: consecutive points agree with their chainage spacing, and the start point falls at APMC Kalyan. Still, treat all positions as approximate.
- Limit: this is the 2019 alignment. It does not include Kalyan station (added later) or any later realignment. Kalyan station has no coordinates yet.

## Items that need your review

1. **Target completion date (countdown).** Sources conflict: 31 Dec 2027 (MMRDA statement, Dec 2024) and May 2028 (reported Dec 2025). MMRDA's page gives no date. I set the countdown to 31 May 2028, labelled "reported target". Do you accept that, or do you want the countdown hidden until MMRDA publishes a date?
2. **Funding.** No primary source ties AIIB or OPEC Fund loans to Line 12. The funding field says "not confirmed". The "at a glance" stat will show cost only.
3. **Approval dates.** MMRDA approval (21 Nov 2018) and State approval (23 Jul 2019) come only from Wikipedia. A Government Resolution from gr.maharashtra.gov.in would verify the second one.
4. **Cost figures.** MMRDA says Rs 5,865 crore. Trade press also quotes Rs 4,132 crore and Rs 5,494 crore without sources. Only Rs 5,865 crore is used.
5. **Length.** MMRDA says 23.57 km. Older figures (20.756 km in the DPR, 22.17 km in CA-240) are kept as history.
6. **Station coordinates.** Approximate, datum assumed. Phase 3 will check each one against satellite imagery.
7. **Systems tender number.** "CA-315" and the EMD come from a search snippet of a paywalled page. Marked unverified.
8. **General Consultant value.** Rs 265.10 crore covers Lines 10 and 12 together. There is no source for the Line 12 share.
9. **Line 12A.** Separate 18.4 km project approved in Feb 2026. It is listed under `related_projects` and kept out of Line 12 totals. Should the site cover it?
10. **Nearby landmarks.** Station context comes only from DPR text (roads, chowks, villages) and engineering reports. I did not add landmarks from maps, to avoid invented facts. Phase 3 can add them from OpenStreetMap with attribution.
11. **Social posts.** `social.json` has no posts yet. There is one candidate for you to review.

## Leads to verify (supplied by the owner, 2026-09-28, no source URL yet)

Nothing below is on the site. Each item needs a primary source (MMRDA tender document or notice) first.

1. **Package "CA-316" line diagram.** It shows revised centre-line chainages: Kalyan -739.050 m, APMC Kalyan -100.650 m, Ganesh Nagar 788.251 m, Pisavali Gaon 2,265.152 m, Golavli 3,353.052 m, Dombivli MIDC 4,520.952 m, Sagaon 5,528.852 m, Sonarpada 6,539.752 m, Manpada 7,592.652 m. After Manpada it shows a new **Katai Naka** station (ch. 9,695.783 m) "to Amandoot" and a branch via **Kolegaon** to **Nilje depot**. The chainages differ from the 2019 DPR by 40 m to 90 m. If confirmed, they replace the DPR chainages in `stations.json`.
2. **Line 12A overlap.** The diagram fits the Line 12A corridor (Manpada, Katai Naka, Kalyan Phata, Dahisar Mori, joining Line 12 near Khutari). No source yet says whether 12A replaces the original Line 12 stations from Hedutane to Pisarve. Checked: [ThePrint/PTI, 20 Feb 2026](https://theprint.in/india/metro-rail-line-12-to-be-extended-along-kalyan-shilphata-road-at-cost-of-rs-8-4k-cr-sena-mp/2859716/) (does not say).
3. **Summary line "22.17 km, 12 stations, Rs 8,416 crore+".** Conflicts with MMRDA (23.57 km, 19 stations, Rs 5,865 crore). 22.17 km is the CA-240 scope; 12 stations and about Rs 8,415 crore match Line 12A; Rs 8,416 crore is Line 5's cost. Not used.
4. **Nilje depot layout drawing.** Shows stabling and inspection sheds, internal roads, a 2.22 ha TOD green area and 2.30 ha staff quarters land. Not used until sourced.
5. **Station elevation, section and render (Dombivli).** Useful as a description for the stylized 3D station in Phase 4 (cantilevered roof over the platform, patterned side cladding). The drawings themselves are not reproduced.
6. **Train render with "LINE 5" livery.** This is a Line 5 train, not Line 12. The Line 12 trains are not ordered yet. Not used.

## Not found

- Per-station construction progress (MMRDA publishes corridor-wide figures only).
- Trial run or opening dates.
- Rolling stock supplier (tender open since June 2026).
- Official station architecture descriptions for the 3D models.
