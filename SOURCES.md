# Sources

Research for Phase 1. Last reviewed: 2026-09-29.

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
3. **MMRDA, Metro Line 12 approved alignment (KMZ), final 20 Mar 2025.** Published on the Metro Influence Zone for NOC page. Centre line (22.166 km from the start point at Kalyan to the end point past Amandoot), the 1.229 km Nilje depot connection, and a point for each of the 19 stations. Used for the route line and every station position.
   https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc (file: https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/metro_line_12_4.kmz)
4. **MMRDA, Invitation of Expression of Interest for a Rs 14,100 Cr loan for Metro Lines 10 and 12, March 2026.** Page 7: MMRDA approval (146th Authority Meeting, 21 Nov 2018), State approval (GR dated 6 Sep 2019), civil contract awarded March 2024, estimated cost Rs 11,516 Cr plus IDC, loan requirement Rs 7,800 Cr, about 45 minutes saved, interchanges at Kalyan and Amandoot. It also repeats the 2019 DPR length and station count (20.756 km plus 0.5 km, 17 stations).
   https://mmrda.maharashtra.gov.in/sites/default/files/2026-03/tender_document.pdf

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
| Loksatta (Marathi) | 27 Sep 2026 | 53.87% overall progress (unnamed MMRDA sources), May 2028 target, 19-station list with Kalyan, Nilje depot about 45 ha | https://www.loksatta.com/mumbai/kalyan-taloja-metro-12-construction-status-mmrda-mumbai-print-news-rnb-99-6159080/ |
| Wikipedia, Orange Line | read 28 Sep 2026 | Approval dates and claims marked unverified | https://en.wikipedia.org/wiki/Orange_Line_(Mumbai_Metro) |

## Derived data

Since 2026-09-29 the route line (`src/data/alignment-mmrda-2025.geojson`) and every station position come from MMRDA's approved alignment of 20 Mar 2025 (primary source 3), built by `scripts/build-alignment.py`. Station points are graded verified. Each station's distance along the line (`along_m`) is measured along the centre line from MMRDA's start point at Kalyan; every station point lies within 8 m of the line. The earlier positions below are kept in `stations.json` under `location.earlier`. Compared with them, most stations moved 5 to 35 m; Nilje Gaon moved 561 m (the 2025 line runs straight where the 2019 line curved east through the wetlands), Sonarpada 111 m, Pisarve 107 m, Hedutane and Manpada about 60 m, and Amandoot 963 m (see below).

### Before 2026-09-29: the 2019 DPR

`src/data/alignment-dpr-2019.geojson` (kept for history) and the earlier station coordinates came from DPR Table 4.3 (213 alignment points, chainage -403.688 m to 20,645.678 m).

- Method: parse the table, convert easting and northing to latitude and longitude, and interpolate each station at its DPR chainage.
- Assumption: WGS84, UTM zone 43N. The DPR does not state the datum. If it is Everest 1830, positions can be off by a few hundred metres.
- Check: consecutive points agree with their chainage spacing, and the start point falls at APMC Kalyan. Still, treat all positions as approximate.
- Check (Phase 3, 2026-09-28): drawn over OpenStreetMap roads, the DPR line runs along Kalyan-Shilphata Road and leaves it near Manpada, and the Dombivli MIDC point falls on the road in Esri imagery that shows the new viaduct. The UTM 43N / WGS84 assumption holds at map scale. Positions stay marked approximate.
- Limit: this is the 2019 alignment. It does not include Kalyan station (added later) or any later realignment.
- Kalyan station: 19°14'19.2"N 73°07'38.5"E (19.238667, 73.127361), supplied by the site owner on 2026-09-28. No published source gives this position; it is graded reported.
- Amandoot check (2026-09-29): the DPR alignment's last point (point 213, ch. 20,645.678 m, E 299156.552, N 2110184.877) converts to 19.074685, 73.091173, about 45 m from the Navi Mumbai Metro Line 1 station OpenStreetMap calls Panchanand, and the route line ends there exactly. The DPR station position (ch. 20,492.296 m) sits 153 m before it, as expected. But Line 12 is being built elsewhere: the site owner's photos of 26 Aug 2026 show station piers SP01 to SP05 beside the Line 1 station that Google Maps and [a post on X](https://x.com/Maha7Arindam/status/2092489255948025861) call Amandoot (OpenStreetMap: Sector 34), 959 m west. The owner's reading (19.07378, 73.081859) was 36 m from the point MMRDA's 2025 alignment gives for Amandoot, which the site now uses. The 2025 line ends about 350 m further west, past the station.

## Map and imagery sources

| Source | Used for | Licence / terms |
|---|---|---|
| [OpenFreeMap](https://openfreemap.org) vector tiles, [OpenMapTiles](https://openmaptiles.org) schema | Base map | Free, no key. Attribution shown on the map. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors | Map data | ODbL, attribution shown |
| [Esri World Imagery Wayback](https://livingatlas.arcgis.com/wayback/) | Before and after imagery (Maxar 10 May 2022, Vantor 12 Oct 2025) | Esri terms of use, attribution shown. Capture dates from Esri's imagery metadata service. |
| [Mapillary](https://www.mapillary.com) (optional) | Street-level photos with capture dates | CC BY-SA 4.0, needs `PUBLIC_MAPILLARY_TOKEN` |

## Items that need your review

1. **Target completion date (countdown).** Sources conflict: 31 Dec 2027 (MMRDA statement, Dec 2024) and May 2028 (reported Dec 2025). MMRDA's page gives no date. I set the countdown to 31 May 2028, labelled "reported target". Do you accept that, or do you want the countdown hidden until MMRDA publishes a date?
2. **Funding.** Resolved 2026-09-29: MMRDA's loan invitation (primary source 4) seeks Rs 7,800 Cr for Line 12. No lender named yet, and still no primary source ties the AIIB or OPEC Fund loans to Line 12.
3. **Approval dates.** Resolved 2026-09-29 by primary source 4: MMRDA approval 21 Nov 2018 (146th Authority Meeting) and State approval by GR dated 6 Sep 2019. Wikipedia's 23 Jul 2019 may be the Cabinet decision.
4. **Cost figures.** Two MMRDA figures now conflict: Rs 11,516 Cr plus IDC (loan invitation, March 2026, shown first) and Rs 5,865 Cr (project page, the 2019 DPR figure). Trade press also quotes Rs 4,132 Cr and Rs 5,494 Cr without sources; those are not used.
5. **Length.** MMRDA says 23.57 km. Older figures (20.756 km in the DPR, 22.17 km in CA-240) are kept as history.
6. **Station coordinates.** Resolved 2026-09-29: MMRDA's approved alignment (primary source 3) gives every station point.
7. **Systems tender number.** "CA-315" and the EMD come from a search snippet of a paywalled page. Marked unverified.
8. **General Consultant value.** Rs 265.10 crore covers Lines 10 and 12 together. There is no source for the Line 12 share.
9. **Line 12A.** Separate 18.4 km project approved in Feb 2026. It is listed under `related_projects` and kept out of Line 12 totals. Should the site cover it?
10. **Nearby landmarks.** Station context comes only from DPR text (roads, chowks, villages) and engineering reports. I did not add landmarks from maps, to avoid invented facts. Phase 3 can add them from OpenStreetMap with attribution.
11. **Social posts.** `social.json` has no posts yet. There is one candidate for you to review.

## Leads to verify (supplied by the owner, 2026-09-28, no source URL yet)

Origin: posts on X by @hadilal and @bodkeitis, which say they come from official tender details. That makes them useful leads but not primary sources: grade them `reported` at best once the specific posts are linked, and `verified` only when the tender document itself is found (mahatenders.gov.in or MMRDA).

Nothing below is on the site yet.

1. **Package "CA-316" line diagram.** It shows revised centre-line chainages: Kalyan -739.050 m, APMC Kalyan -100.650 m, Ganesh Nagar 788.251 m, Pisavali Gaon 2,265.152 m, Golavli 3,353.052 m, Dombivli MIDC 4,520.952 m, Sagaon 5,528.852 m, Sonarpada 6,539.752 m, Manpada 7,592.652 m. After Manpada it shows a new **Katai Naka** station (ch. 9,695.783 m) "to Amandoot" and a branch via **Kolegaon** to **Nilje depot**. The chainages differ from the 2019 DPR by 40 m to 90 m. If confirmed, they replace the DPR chainages in `stations.json`. Check (2026-09-29): MMRDA's approved alignment of 20 Mar 2025 (primary source 3) has the same 19 stations as CA-240 and no Katai Naka station on Line 12, so the Katai Naka leads most likely belong to Line 12A. Its station spacing (Kalyan to Manpada) agrees with this diagram within 25 m.
2. **Line 12A overlap.** The diagram fits the Line 12A corridor (Manpada, Katai Naka, Kalyan Phata, Dahisar Mori, joining Line 12 near Khutari). No source yet says whether 12A replaces the original Line 12 stations from Hedutane to Pisarve. Checked: [ThePrint/PTI, 20 Feb 2026](https://theprint.in/india/metro-rail-line-12-to-be-extended-along-kalyan-shilphata-road-at-cost-of-rs-8-4k-cr-sena-mp/2859716/) (does not say).
3. **Summary line "22.17 km, 12 stations, Rs 8,416 crore+".** Conflicts with MMRDA (23.57 km, 19 stations, Rs 5,865 crore). 22.17 km is the CA-240 scope; 12 stations and about Rs 8,415 crore match Line 12A; Rs 8,416 crore is Line 5's cost. Not used.
4. **Nilje depot layout drawing.** Shows stabling and inspection sheds, internal roads, a 2.22 ha TOD green area and 2.30 ha staff quarters land. Not used until sourced.
5. **Station elevation, section and render (Dombivli).** Useful as a description for the stylized 3D station in Phase 4 (cantilevered roof over the platform, patterned side cladding). The drawings themselves are not reproduced.
6. **Train render with "LINE 5" livery.** This is a Line 5 train, not Line 12. The Line 12 trains are not ordered yet. Not used.
7. **Station finishing tenders (posts on X, 8 Sep 2026).** @bodkeitis and @Maha7Arindam report two MMRDA tenders for architectural finishing, roofing, facade and plumbing at 11 stations from Kalyan to **Katai Naka** (Kalyan, APMC Kalyan, Ganesh Nagar, Pisavali Gaon, Golavali; Dombivli MIDC, Sagaon, Sonarpada, Manpada, Kolegaon, Katai Naka). This supports lead 1. The posts are shown in Updates as reported; the station list changes only when the tender document is found.

## Not found

- Per-station construction progress (MMRDA publishes corridor-wide figures only).
- Trial run or opening dates.
- Rolling stock supplier (tender open since June 2026).
- Official station architecture descriptions for the 3D models.

---

# Line 5 (Thane-Bhiwandi-Kalyan)

Research started 2026-10-09. Data in `src/data/lines/line-5/`. Figures follow MMRDA's press release of 28 May 2026 (primary source 4); phase names follow the post on X by @bodkeitis (31 Aug 2026). Both by the owner's decision of 2026-10-09. Not shown on the site yet (see MULTI-LINE-PLAN.md, step 7). The status values above apply.

## Primary sources

1. **MMRDA, Metro Line 5 project page.** Length 24.9 km, 15 stations (Balkum Naka to Kalyan APMC), cost Rs 8,416.51 Cr, 2031 ridership 3.025 lakh, car size and capacity, interchanges with Lines 4 and 12 and the Central Railway, and a progress table (as of 31 Aug 2026, every activity 100%). Page last updated 7 Oct 2026, but it still shows the 2017 plan.
   https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-5/overview
   The Marathi page gives the Marathi station names. Its progress table is headed "Metro Line 7A" and is not used.
   https://mmrda.maharashtra.gov.in/mr/projects/transport/metro-line-5/overview
2. **MMRDA, Line 5 alignment file (KML), uploaded March 2025.** Published on the Metro Influence Zone for NOC page. Unlike Line 12's file, it has no centre line: it has the corridor as one polygon about 50 m wide, and 17 station points from Kapurbawdi to APMC Kalyan.
   https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc (file: https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/metro_line-5.kml)
3. **MMRDA, Phase 1 draft final Environmental Impact Assessment for AIIB, 11 Sep 2023.** Phase 1 is 11.88 km and 6 elevated stations from Kapurbawdi to Dhamankar Naka; Kapurbawdi station is built as part of Line 4. Station chainages, Kasheli depot (27.134 ha), design speeds, station length 145 m, platforms about 13.5 m above the road, and the cost breakdown from the March 2016 DPR.
   https://mmrda.maharashtra.gov.in/sites/default/files/2023-12/mmrda-aiib-mml5-final-draft-eia-11-sep-2023.pdf

4. **MMRDA press release PRC/PR/31/2026, "Extended Metro Line 5 to Strengthen Connectivity Across Thane, Bhiwandi, Kalyan and Ulhasnagar", 28 May 2026.** Corridor 34.21 km and Rs 18,130 Cr. Phase 1, Thane to Dhamankar Naka: 11.9 km, 6 stations, Rs 6,741 Cr. Phase 2, Dhamankar Naka to Durgadi: 10.48 km, 6 stations (Bhiwandi underground; Temghar, Rajnoli, Gove Gaon, Kon Gaon, Kongaon West elevated), Rs 7,326 Cr. Phase 5A, Durgadi - Khadakpada - Bhoirwadi - Kalyan with a spur to Ulhasnagar from Bhoirwadi: 11.83 km, 7 elevated stations, Rs 4,063 Cr. Interchanges with Line 4 at Balkhum (Kapurbawadi) and Line 12 at Kalyan Junction; Phase 1 preparing for the CMRS inspection. No map: its images are construction photos.
   https://mmrda.maharashtra.gov.in/sites/default/files/2026-05/extended_metro_line_5_to_strengthen_connectivity_across_thane_bhiwandi_kalyan_and_ulhasnagar.pdf

## Secondary sources

| Outlet | Date | Used for | URL |
|---|---|---|---|
| The Metro Rail Guy | 28 Jan 2020 | CA-28 civil contract to Afcons, 7 Jan 2020, 12.811 km | https://themetrorailguy.com/2020/01/28/afcons-awarded-mumbai-metro-line-5s-thane-bhiwandi-section/ |
| The Metro Rail Guy | 8 May 2020 | AIIB loan concept, USD 236 million, 21 Apr 2020 | https://themetrorailguy.com/2020/05/08/aiib-to-lend-236-million-for-mumbai-metro-line-5-thane-kalyan/ |
| The Metro Rail Guy | 12 Mar 2023, updated 14 Sep 2023 | CA-151 Kasheli depot to Rithwik, Rs 589.56 Cr | https://themetrorailguy.com/2023/03/12/rithwik-wins-mumbai-metro-line-5-kasheli-depots-civil-contract/ |
| The Metro Rail Guy | 30 Jun 2025 | CA-241 trains and signalling to Titagarh, Rs 2,481 Cr | https://themetrorailguy.com/2025/06/30/titagarh-wins-mumbai-metro-line-5s-132-coach-signaling-contract-ca-241/ |
| Construction World | 13 Mar 2026 | Route shape past Durgadi: from Kon Gaon through Durgadi, Khadakpada and Bhoirwadi, then two arms, to Kalyan (Line 12 interchange) and to Ulhasnagar; DPR ready, not published | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mmrda-advances-metro-line-five-a-from-kalyan-to-ulhasnagar/88025 |
| Free Press Journal | 9 Feb 2026 | Phase 1 civil work 95%, December 2026 target | https://www.freepressjournal.in/mumbai/mmrda-nears-completion-of-metro-line-5-phase-1-thanebhiwandi-services-set-for-december-2026-launch |
| Indian Infrastructure | 23 Apr 2026 | State approval of revised Lines 5 and 5A, 22 Apr 2026 | https://indianinfrastructure.com/2026/04/23/maharashtra-government-approves-mumbai-metro-line-5-5a/ |
| Metro Rail News | 27 Apr 2026 | Revised plan, underground sections, APMC Kalyan dropped | https://metrorailnews.in/mumbai-metro-line-5-gets-state-approval/ |
| Metro Rail News | 2 Sep 2026 | Union approval, 2030-31 target for the rest | https://metrorailnews.in/center-approved-mumbai-metro-line-5-and-5a/ |
| Indian Infrastructure | 3 Sep 2026 | Union approval, 29 Aug 2026; Line 5A Rs 4,063 Cr | https://indianinfrastructure.com/2026/09/03/union-government-approves-mumbai-metro-line-5-5a-project/ |
| Free Press Journal | 7 Sep 2026 | Overhead wires energised, 12.6 km; work beyond Bhiwandi not begun | https://www.freepressjournal.in/mumbai/mumbai-metro-line-5-trial-run-preparations-gain-momentum-as-mmrda-begins-25000-volt-overhead-wire-energisation |
| Construction World | 8 Sep 2026 | Station lists of the revised Lines 5 and 5A | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/centre-approves-mumbai-metro-line-five-and-five-a/97055 |
| Swarup Bodke (@bodkeitis) on X | 31 Aug 2026 | Union approval split into Phase 2 (Dhamankar Naka to Durgadi, 10.48 km), Phase 3 (Durgadi to Kalyan, 11.82 km) and Line 5A (Bhoirwadi to Ulhasnagar spur, 5.27 km); tenders to follow. Lead, graded reported. Its two map images are a Google Earth view of MMRDA's 2025 file and an unlabelled sketch, not used. | https://x.com/bodkeitis/status/2094307767142244544 |
| Wikipedia, Orange Line | read 9 Oct 2026 | Line colour only (unverified) | https://en.wikipedia.org/wiki/Orange_Line_(Mumbai_Metro) |

## Derived data

`scripts/build-alignment-line5.py` derives the centre line from the corridor polygon in primary source 2: it takes the polygon's two tips (at Kapurbawdi, and 119 m past APMC Kalyan), and draws the line midway between the two long sides. The result is 24.14 km. Every one of the 17 station points lies within 11 m of it, and they fall in order, so the line is graded verified like the points. Each station's `along_m` is measured along it from Kapurbawdi.

The station chainages in primary source 3 do not match the distances between the station points (Kalher to Purna: 0.83 km in the report, about 2 km apart on the map). They are kept under `eia_chainage_m` as published and not used for drawing.

Since 2026-10-09 the GeoJSON has three parts. "Line 5 centre line" runs from Kapurbawdi to Durgadi Fort (21.9 km): Phase 1 (built) and Phase 2, which MMRDA's revised plan keeps on the same stations except Gopal Nagar (dropped) and Kongaon West (new, no published position). "Line 5 underground stretch" marks Dhamankar Naka to Temghar, drawn on the 2025 route above ground because the tunnel's route is not published. "Line 5 route past Durgadi, 2017 plan" keeps the dropped route to APMC Kalyan for history.

Check (2026-10-09): between Dhamankar Naka and Durgadi Fort, 10,150 of 10,251 m of the derived line lies within 20 m of a main road in OpenStreetMap: Agra Road (NH848) through Bhiwandi, the Bhiwandi bypass flyover (about 13.4 to 16.0 km from Kapurbawdi), Kalyan-Bhiwandi Road (NH61), and the Chhatrapati Shivaji Maharaj Bridge over the Ulhas into Durgadi. So Phase 2 runs on the road medians, as Phase 1 does. The flyover stretch is the clash that the underground section avoids (Metro Rail News, Sep 2026). The station-to-station distance from Dhamankar Naka to Durgadi Fort on this line is 10.23 km; MMRDA gives 10.48 km for Phase 2.

Line 5's Kalyan point is 14 m from Line 12's, and its APMC Kalyan point 30 m from Line 12's. In the 2025 files the two lines share both stations.

## Items that need your review

1. **Which plan to show.** Decided 2026-10-09 by the owner. Figures: MMRDA's press release of 28 May 2026 (34.21 km, 19 stations, Rs 18,130 Cr, the spur included). Names: Phase 1 Kapurbawdi to Dhamankar Naka, Phase 2 Dhamankar Naka to Durgadi, Phase 3 Durgadi to Kalyan, Line 5A the Bhoirwadi to Ulhasnagar spur. MMRDA calls Phase 3 and the spur together 'Phase 5A'. Phase 3's own stations (Khadakpada, Bhoirwadi and others) and the spur have no published route or positions.
2. **Phase 1 opening date.** MMRDA's press release (28 May 2026) quotes the Chief Minister: open by the end of 2026. No exact date. The September 2026 report also says trial runs take about six months, which does not fit. Countdown or not?
3. **Line 5A.** The Bhoirwadi to Ulhasnagar spur. Unlike Line 12A it is inside MMRDA's Line 5 totals, so the totals include it. Its own page, or part of the Line 5 page?
4. **Kongaon West.** New in the revised plan, with no published position. It is listed after Kon Gaon in MMRDA's order, without a map point.
5. **Kapurbawdi.** Built as part of Line 4, but every Line 5 train will start there. The data lists it as Line 5's station 1, with a note.

## Leads to verify

1. **Approval dates 2016 to 2018.** Wikipedia gives MMRDA approval on 19 Oct 2016, State Cabinet approval on 24 Oct 2017 and the foundation stone on 18 Dec 2018, citing The Hindu, Livemint and the Indian Express. Those articles were not read yet.
2. **More packages.** Wikipedia lists CA-166 (track, Paras Railtech), CA-239 (power and E&M, IRCON), CA-242 (fare collection) and CA-246 (finishing, NACPL-MANSI-UCC JV) without sources.
3. **AIIB and OPEC Fund final loan amounts.** The OPEC Fund lists approval on 29 Apr 2024 and signing on 13 Oct 2025; GTAI lists an AIIB loan of USD 186.5 million. Neither page was read.
4. **The revised plan's Government Resolution (April 2026) and the Union notification of 28 August 2026.** Either may describe the route.
5. **Phase 3 and spur route.** MMRDA's general consultant tender for it (ID 2026_MMRDA_1283742_1, ref MMRDA/MMRP/L-5A/GC/CA293) is on mahatenders.gov.in, behind a CAPTCHA; its documents usually include a key plan. The owner can download them. MMRDA may also add a new file to the Metro Influence Zone page, as it did for Line 12.
6. **Train render with "LINE 5" livery** (owner's lead of 2026-09-28, see Line 12 lead 6). Now relevant for Line 5. Not used until sourced.

## Not found

- Marathi names for Kapurbawdi, Durgadi Fort and Sahajanand Chowk.
- A trial-run start date or CMRS inspection date.
- A published route for the revised plan past Durgadi, or for the underground stretch at Bhiwandi. Not in OpenStreetMap, Wikipedia (a schematic only) or the news (checked 2026-10-09).
