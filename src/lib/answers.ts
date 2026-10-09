/**
 * Each line's status page: the questions people search for, answered from the line's data files,
 * each answer with its grades. The same answers feed the page's FAQPage structured data.
 * A line without a set here has no status page (hasStatusPage).
 */
import { formatDate, inr, lineBase, type Line } from './data';

export interface Answer {
  id: string;
  q: string;
  a: string;
  grades: { status: string; source: string | null }[];
  more?: { href: string; label: string };
}

function line12(line: Line): Answer[] {
  const { project, stations, contractors } = line;
  const rollingstock = line.rollingstock!;
  const p = project;
  const t = p.target_completion;
  const prog = p.progress;
  const overall = prog.overall_reported;
  const civil = contractors.find((c) => c.id === 'gawar-constructions')!;
  const line12a = p.related_projects[0];
  const pct = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  // "Pile works" -> "pile works" mid-sentence, but "U-girder works" keeps its capital.
  const lower = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
  const aliases = p.name.also_known_as.filter((n) => !n.startsWith('Orange Line'));
  const answers: Answer[] = [
    {
      id: 'opening',
      q: 'When will Mumbai Metro Line 12 open?',
      a: `No official opening date has been published. The latest reported target is ${formatDate(t.value)} (reported in December 2025). An earlier reported target was ${formatDate(t.alternatives[0].value)}, and the 2019 project report had assumed ${formatDate(t.alternatives[1].value)}. MMRDA's project page gives no date.`,
      grades: [{ status: t.status, source: t.source_url }],
    },
    {
      id: 'progress',
      q: 'How much of Line 12 is built?',
      a: `MMRDA's progress table for ${formatDate(prog.as_of)} puts ${prog.items.map((i) => `${lower(i.activity)} at ${pct(i.percent_complete)}%`).join(', ')}. Loksatta reported on ${formatDate(overall.as_of)}, quoting unnamed MMRDA sources, that ${pct(overall.percent_complete)}% of the whole line is complete; MMRDA itself publishes no overall figure.`,
      grades: [
        { status: prog.status, source: prog.source_url },
        { status: overall.status, source: overall.source_url },
      ],
    },
    {
      id: 'route',
      q: 'What is the route of Metro Line 12?',
      a: `${p.route.value}. The line is ${p.length_km.value} km long, fully elevated, with ${p.stations_count.value} stations. It runs above Kalyan-Shilphata Road from Kalyan to Sonarpada.`,
      grades: [{ status: p.route.status, source: p.route.source_url }],
      more: { href: '/#map', label: 'See the route on the map' },
    },
    {
      id: 'stations',
      q: 'Which stations are on Line 12?',
      a: `${stations.length} stations, in order: ${stations.map((s) => s.name).join(', ')}.`,
      grades: [{ status: p.stations_count.status, source: p.stations_count.source_url }],
      more: { href: '/stations/', label: 'A page for every station' },
    },
    {
      id: 'interchanges',
      q: 'Where does Line 12 connect with other lines?',
      a: `${p.interchanges.value.map((x) => `At ${x.station}, with ${x.connects_to}`).join('. ')}. Line 12 continues Metro Line 5 (Thane-Bhiwandi-Kalyan) south from Kalyan.`,
      grades: [{ status: p.interchanges.status, source: p.interchanges.source_url }],
    },
    {
      id: 'cost',
      q: 'How much does Metro Line 12 cost?',
      a: `MMRDA's loan invitation of March 2026 gives an estimated cost of Rs ${inr(p.completion_cost_crore_inr.value)} crore, plus interest during construction. MMRDA's project page still gives Rs ${inr(p.completion_cost_crore_inr.alternatives[0].value)} crore, the 2019 report's completion cost. To pay for it, MMRDA invited banks in March 2026 to lend Rs 7,800 crore; no lender has been named yet.`,
      grades: [
        { status: p.completion_cost_crore_inr.status, source: p.completion_cost_crore_inr.source_url },
        { status: p.funding.status, source: p.funding.source_url },
      ],
    },
    {
      id: 'builder',
      q: 'Who is building Line 12?',
      a: `MMRDA (Mumbai Metropolitan Region Development Authority) is building the line. ${civil.name} holds the civil contract for the viaduct and all ${p.stations_count.value} stations (package CA-240, awarded in March 2024).`,
      grades: [
        { status: p.implementing_agency.status, source: p.implementing_agency.source_url },
        { status: civil.status, source: civil.source_url },
      ],
    },
    {
      id: 'depot',
      q: 'Where is the Line 12 depot?',
      a: `At ${p.depot.value}, on about ${p.depot.area_ha} hectares.`,
      grades: [{ status: p.depot.status, source: p.depot.source_url }],
    },
    {
      id: 'trains',
      q: 'Which trains will run on Line 12?',
      a: `No train maker has been chosen yet. The trains are part of the systems tender MMRDA floated in June 2026. The 2019 project report plans ${rollingstock.dpr_design_assumptions.initial_formation_cars}-car air-conditioned trains, growing to ${rollingstock.dpr_design_assumptions.future_formation_cars} cars, with a top operating speed of ${rollingstock.dpr_design_assumptions.max_operating_speed_kmph} km/h.`,
      grades: [
        { status: rollingstock.procurement.status, source: rollingstock.procurement.source_url },
        { status: rollingstock.dpr_design_assumptions.status, source: rollingstock.dpr_design_assumptions.source_url },
      ],
    },
    {
      id: 'riders',
      q: 'How many people will use Line 12?',
      a: `About ${p.daily_ridership_2031.display} riders a day by 2031, as projected. MMRDA says the line saves about ${p.travel_time_benefit.minutes_saved} minutes between Kalyan and Taloja, cutting road travel time by 50% to 75% depending on traffic.`,
      grades: [
        { status: p.daily_ridership_2031.status, source: p.daily_ridership_2031.source_url },
        { status: p.travel_time_benefit.status, source: p.travel_time_benefit.source_url },
      ],
    },
    {
      id: 'line-12a',
      q: 'Is Line 12A the same as Line 12?',
      a: `No. ${line12a.name} is a separate project: ${line12a.summary} Its figures are not counted in Line 12's.`,
      grades: [{ status: line12a.status, source: line12a.source_url }],
    },
    {
      id: 'names',
      q: 'What else is Metro Line 12 called?',
      a: `${p.name.value} is also called ${aliases.join(' or ')}. It is part of the ${p.line_color.value}, as the southern extension of Metro Line 5.`,
      grades: [{ status: p.name.status, source: p.name.source_url }],
    },
  ];
  return answers;
}

function line5(line: Line): Answer[] {
  const { project: p, stations, spurStations, droppedStations, contractors } = line;
  const rs = line.rollingstock as unknown as {
    procurement: { manufacturer: string; trains: number; coaches: number; package: string; date: string; built_at: string; status: string; source_url: string };
    specs: { status: string; source_url: string };
  };
  const base = lineBase(line.id) ?? '/';
  const t = p.target_completion as typeof p.target_completion & {
    rest_of_line: { value: string; status: string; source_url: string };
    scope: string;
  };
  const prog = p.progress;
  const cur = p.current_phase;
  const extra = p as unknown as { phases: unknown; underground_section: unknown };
  const phases = extra.phases as {
    value: string; length_km: number; stations?: number; cost_crore?: number; status: string; source_url: string;
  }[];
  const firm = (id: string) => contractors.find((c) => c.id === id)!;
  const phase1 = stations.filter((s) => s.phase === 1);
  const spur = (p.related_projects as { name: string; status: string; source_url: string }[])[0];
  const under = extra.underground_section as { status: string; source_url: string };
  const funding = p.funding as { status: string; source_url: string };
  const cost = p.completion_cost_crore_inr as unknown as { value: number; status: string; source_url: string; history: { value: number }[] };
  const travel = p.travel_time_benefit as { status: string; source_url: string };
  const colour = p.line_color as { status: string; source_url: string };
  const list = (names: string[]) => `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  const planned = (p.interchanges as { planned?: { station: string; connects_to: string; status: string; source_url: string }[] }).planned ?? [];
  return [
    {
      id: 'opening',
      q: 'When will Mumbai Metro Line 5 open?',
      a: `Phase 1, Kapurbawdi to Dhamankar Naka, has a target of the end of 2026: MMRDA's press release of May 2026 quotes the Chief Minister saying it will open by then, with no exact date. Its overhead wires were energised from 7 Sep 2026, ahead of the safety inspection and trial runs; a report that month, quoting MMRDA, puts the trial runs at about six months, which does not fit the target. The rest of the line, Phases 2 and 3 and the Line 5A spur, has a reported target of ${t.rest_of_line.value}.`,
      grades: [
        { status: t.status, source: t.source_url },
        { status: cur.status, source: cur.source_url },
        { status: t.rest_of_line.status, source: t.rest_of_line.source_url },
      ],
    },
    {
      id: 'first-stations',
      q: 'Which stations open first?',
      a: `The ${phase1.length} stations of Phase 1: ${list(phase1.map((s) => s.name))}. Kapurbawdi is built as part of Metro Line 4 and is the interchange with it, so MMRDA counts the other ${phase1.length - 1} as Phase 1's stations.`,
      grades: [{ status: phases[0].status, source: phases[0].source_url }],
    },
    {
      id: 'progress',
      q: 'How much of Line 5 is built?',
      a: `Phase 1's civil work is done: MMRDA's progress table for ${formatDate(prog.as_of)} shows all ${prog.items.length} of its activities at 100%, from piling to the deck slab. The table does not name the stretch it covers, but its items match Phase 1. Work beyond Bhiwandi, towards Kalyan, has not begun, as reported in September 2026.`,
      grades: [
        { status: prog.status, source: prog.source_url },
        { status: cur.status, source: cur.source_url },
      ],
    },
    {
      id: 'route',
      q: 'What is the route of Metro Line 5?',
      a: `${p.route.value}. MMRDA gives ${p.length_km.value} km including the spur, and ${p.stations_count.value} stations. To the Ulhas river bridge at Durgadi it follows the road medians of Agra Road through Bhiwandi, the Bhiwandi bypass and Kalyan-Bhiwandi Road. Bhiwandi station is underground; every other station is elevated.`,
      grades: [
        { status: p.route.status, source: p.route.source_url },
        { status: under.status, source: under.source_url },
      ],
      more: { href: `${base}#map`, label: 'See the route on the map' },
    },
    {
      id: 'stations',
      q: 'Which stations are on Line 5?',
      a: `${stations.length} on the line, in order from Kapurbawdi: ${stations.map((s) => s.name).join(', ')}. The Line 5A spur adds ${list(spurStations.map((s) => s.name))}. Kongaon West has no published position yet.`,
      grades: [{ status: p.stations_count.status, source: p.stations_count.source_url }],
      more: { href: `${base}stations/`, label: 'A page for every station' },
    },
    {
      id: 'interchanges',
      q: 'Where does Line 5 meet other lines?',
      a: `${p.interchanges.value.map((x) => `At ${x.station}, with ${x.connects_to}`).join('. ')}. ${planned.map((x) => `At ${x.station}, a planned interchange with ${x.connects_to}, as reported; the ring line's official route map puts its Balkum Naka station about 1 km east of Line 5's, and does not call the two an interchange. `).join('')}The 2017 plan also had a stop at APMC Kalyan, near Line 12's APMC Kalyan station; the revised plan drops it.`,
      grades: [{ status: p.interchanges.status, source: p.interchanges.source_url }, ...planned.map((x) => ({ status: x.status, source: x.source_url }))],
    },
    {
      id: 'past-bhiwandi',
      q: 'What happens past Bhiwandi?',
      a: `Phase 2, ${phases[1].value}, ${phases[1].length_km} km with ${phases[1].stations} stations, was approved by the Union Government on 29 Aug 2026, as reported, and has not started. It goes underground at Bhiwandi station. Past the Ulhas river bridge, Phase 3 loops north through Durgadi and Khadakpada, east to Bhoirwadi, then back west through Shivaji Path to Kalyan, on a tentative key plan of March 2026. The 2017 plan's stops at ${list(droppedStations.map((s) => s.name))} are dropped.`,
      grades: [
        { status: phases[1].status, source: phases[1].source_url },
        { status: phases[2].status, source: phases[2].source_url },
      ],
    },
    {
      id: 'spur',
      q: 'Where does the Line 5A spur go?',
      a: `From just past Bhoirwadi to Ulhasnagar, about 5.27 km, with stations at ${list(spurStations.map((s) => s.name))}, on the tentative key plan of March 2026. MMRDA counts it with Durgadi to Kalyan as Phase 5A: 11.83 km, 7 stations and Rs 4,063 crore together.`,
      grades: [{ status: spur.status, source: spur.source_url }],
    },
    {
      id: 'cost',
      q: 'How much does Metro Line 5 cost?',
      a: `MMRDA's press release of May 2026 gives Rs ${inr(cost.value)} crore for the expanded corridor: Phase 1 Rs 6,741 crore, Phase 2 Rs 7,326 crore and Phase 5A Rs 4,063 crore. The 2017 plan's cost was Rs ${inr(cost.history[0].value)} crore. AIIB approved a loan concept for the trains, signalling and power in April 2020; the final loan amounts are not published.`,
      grades: [
        { status: cost.status, source: cost.source_url },
        { status: funding.status, source: funding.source_url },
      ],
    },
    {
      id: 'builder',
      q: 'Who is building Line 5?',
      a: `MMRDA (Mumbai Metropolitan Region Development Authority) is building the line. ${firm('afcons').name} built Phase 1's viaduct and stations (package CA-28, awarded in January 2020), ${firm('rithwik').name} the Kasheli depot, and ${firm('titagarh').name} is building the trains and signalling (package CA-241, announced on ${formatDate(rs.procurement.date)}).`,
      grades: [
        { status: p.implementing_agency.status, source: p.implementing_agency.source_url },
        { status: firm('afcons').status, source: firm('afcons').source_url },
        { status: firm('titagarh').status, source: firm('titagarh').source_url },
      ],
    },
    {
      id: 'depot',
      q: 'Where is the Line 5 depot?',
      a: `At ${p.depot.value}, on about ${p.depot.area_ha} hectares, on Phase 1.`,
      grades: [{ status: p.depot.status, source: p.depot.source_url }],
    },
    {
      id: 'trains',
      q: 'Which trains will run on Line 5?',
      a: `${rs.procurement.manufacturer} is building ${rs.procurement.trains} six-car trains (${rs.procurement.coaches} coaches) at ${rs.procurement.built_at}, under package ${rs.procurement.package}, with the signalling and platform screen doors. MMRDA's figures: cars 3.2 m wide, and 1,756 people in a six-car train.`,
      grades: [
        { status: rs.procurement.status, source: rs.procurement.source_url },
        { status: rs.specs.status, source: rs.specs.source_url },
      ],
    },
    {
      id: 'riders',
      q: 'How many people will use Line 5?',
      a: `About ${p.daily_ridership_2031.display} riders a day by 2031, as projected. MMRDA's figures of 2026 put travel time 40 to 50% below the road; its Line 5 page, from the 2017 plan, still says 50 to 75%.`,
      grades: [
        { status: p.daily_ridership_2031.status, source: p.daily_ridership_2031.source_url },
        { status: travel.status, source: travel.source_url },
      ],
    },
    {
      id: 'names',
      q: 'What else is Metro Line 5 called?',
      a: `${p.name.value} is also called ${p.name.also_known_as.join(' or the ')}. Wikipedia treats Lines 5 and 12 as one Orange Line; MMRDA's Line 5 page names no colour.`,
      grades: [
        { status: p.name.status, source: p.name.source_url },
        { status: colour.status, source: colour.source_url },
      ],
    },
  ];
}

const sets: Record<string, (line: Line) => Answer[]> = { 'line-12': line12, 'line-5': line5 };

/** A line's status answers, or undefined when it has no status page. */
export function answersFor(line: Line): Answer[] | undefined {
  return sets[line.id]?.(line);
}

/** Whether the line has a status page. */
export const hasStatusPage = (line: Line) => line.id in sets;
