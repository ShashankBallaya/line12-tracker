---
name: Line 12 Tracker
description: An unofficial daily paper with one story, Mumbai Metro Line 12, printed on newsprint and navy with one orange bar.
colors:
  signal: "#f26b1d"
  signal-line: "#c24a08"
  signal-graphic: "#d5530a"
  on-signal: "#0c1422"
  paper: "#efe9de"
  paper-2: "#e5ddcf"
  paper-3: "#d9d0c0"
  ink: "#111a28"
  ink-2: "#4a453e"
  ink-3: "#5f584f"
  rule: "#bdb3a2"
  concrete: "#a69e91"
  halftone: "rgb(17 26 40 / 0.14)"
  night-paper: "#0c1422"
  night-paper-2: "#121d31"
  night-paper-3: "#1a2740"
  night-ink: "#ece5d8"
  night-ink-2: "#bfb7a9"
  night-ink-3: "#978f82"
  night-rule: "#2d3a55"
  night-signal-line: "#f5813c"
  night-signal-graphic: "#f26b1d"
  night-halftone: "rgb(236 229 216 / 0.09)"
typography:
  display:
    fontFamily: "'Anek Latin Variable', 'Anek Devanagari Variable', system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 1.7rem + 4.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "'Anek Latin Variable', 'Anek Devanagari Variable', system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 1.5rem + 2.4vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  title:
    fontFamily: "'Anek Latin Variable', 'Anek Devanagari Variable', system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1.3rem + 1.2vw, 2.3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  subhead:
    fontFamily: "'Anek Latin Variable', 'Anek Devanagari Variable', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.55vw, 1.55rem)"
    fontWeight: 700
    lineHeight: 1.05
    fontVariation: "'wdth' 87.5"
  standfirst:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.55vw, 1.55rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(1.02rem, 0.97rem + 0.22vw, 1.14rem)"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(0.84rem, 0.8rem + 0.15vw, 0.92rem)"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(0.84rem, 0.8rem + 0.15vw, 0.92rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  figure:
    fontFamily: "'Anek Latin Variable', 'Anek Devanagari Variable', system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 1.7rem + 4.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 75"
rounded:
  none: "0px"
  focus: "2px"
  car: "3px"
  control: "4px"
  capsule: "1rem"
  pill: "999px"
  dot: "50%"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "4.5rem"
  s-9: "7rem"
  gutter: "clamp(1rem, 0.6rem + 1.8vw, 2.5rem)"
  bar: "0.5rem"
  rule-w: "1px"
  rule-heavy: "4px"
  measure: "68ch"
  page-max: "88rem"
components:
  masthead-band:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.display}"
    padding: "1rem 0 0.75rem"
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.subhead}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.5rem"
    height: "48px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.5rem"
    height: "48px"
  button-ink-hover:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 0.75rem"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.paper-2}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    height: "44px"
  nav-link-hover:
    textColor: "{colors.ink}"
  pill-awarded:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1em 0.55em"
  pill-floated:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1em 0.55em"
  pill-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1em 0.55em"
  progress-track:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.none}"
    height: "1rem"
  progress-fill:
    backgroundColor: "{colors.signal-graphic}"
    rounded: "{rounded.none}"
    height: "1rem"
  station-dot:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.dot}"
    size: "1.25rem"
  panel-quiet:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
    padding: "1.5rem"
---

# Design System: Line 12 Tracker

## Overview

**Creative North Star: "The Late City Edition"**

The site is a newspaper with one story. It prints in two editions: the night edition (navy paper, cream ink) when the system asks for dark, and the morning edition (warm newsprint, navy ink) otherwise. A reader can switch editions from the masthead. Every page element is a part of a paper: a masthead band, an edition line, an "Inside" index, a front page with a headline, a standfirst and a lead picture, then inside pages that each open under a heavy rule, and a corrections column at the back.

The whole identity is one orange shape, the bar module (0.5rem tall). It is the masthead band, the marker on top of every section head, the separator squares in the edition line, the progress fills, the timeline rails, the hover underline in the index and the station directory, and the casing of the route line itself. Everything else is navy, newsprint and concrete. The route is drawn after Vignelli: thick parallel strokes, one 45-degree bend, dot stations, and x spaced by true chainage. The line is not built yet, so it prints hollow (an orange casing with a paper core). The lead picture follows the Tren Urbano and MASP references: a flat-shaded isometric viaduct and train on an orange halftone field, a giant "12" painted on the road, and concrete in greys with only the train band in orange.

Density is editorial, not dashboard. Sections are solid blocks with a deep gap before the next rule. Facts sit in ruled lists and tables, not cards. Status is always a mark or a stroke pattern plus a word, never hue alone.

**Key Characteristics:**
- One signal colour (Line 12 orange), used as bars, bands, lines and large figures, never as body text.
- Heavy condensed display grotesk (Anek Latin at 75% width, weight 800), set uppercase, against a plain humanist body (Mukta).
- Tabular lining numerals for every figure, date and table.
- Hairline column rules and 4px heavy rules carry the structure. No shadows, no cards.
- Status grammar: solid, dashed, gapped or hollow strokes; tick, ring, dashed square, crosshatch marks.
- Two editions from one token set. Only the paper, ink, rule and orange-on-paper values flip.
- Motion is the ride: the reader scrolls the train along the line, station by station. Without motion, the page is complete.

## Colors

Warm newsprint and night navy, cut by one orange.

### Primary
- **Line 12 Orange** (signal): the band colour. Masthead band, primary button fill, "Floated" tender pill, the train's livery band, the lead picture field, the skip link, text selection and the colophon's top bar. Text on it is always Navy Pressroom (on-signal), at 6:1.
- **Orange Ink** (signal-line, night: night-signal-line): orange where it has to read on paper as a stroke or a large figure. Link underlines, the strike through superseded figures, grade marks for unverified and conflicting facts, the painted distance figure in the route ride, the focus ring. It measures 4.06:1 on morning paper, so it is for large text and marks only.
- **Orange Rail** (signal-graphic, night: night-signal-graphic): orange for graphic shapes on paper, at 3:1 or more. Section-head bars, route casing, progress fills, the current station dot, construction and award rails on the timeline, the edition separators and hover underlines.

### Neutral
- **Newsprint** (paper, night: night-paper): the page ground. Also the hollow core of the route line and the ring around station dots, so the line reads as cut out of the paper.
- **Folded Newsprint** (paper-2, night: night-paper-2): the second sheet. Quiet panels ("not printed yet"), the colophon, the train drawing plate, progress tracks, hover fill on the edition toggle, the scrollbar track.
- **Old Newsprint** (paper-3, night: night-paper-3): the third tone, held in reserve for a deeper sheet.
- **Pressroom Navy** (ink, night: night-ink): headlines, figures, station dots, the "done" phase bar, the "awarded" pill, the ink button, and the heavy rules (rule-strong resolves to ink in both editions).
- **Faded Ink** (ink-2, night: night-ink-2): standfirsts, section intros, secondary copy, unit suffixes, source links.
- **Marginal Ink** (ink-3, night: night-ink-3): metadata, table headers, station order numbers, future or muted items, source lines. 5.8:1 on morning paper, 5.8:1 on night paper.
- **Column Rule** (rule, night: night-rule): hairline dividers between rows and entries, the outline of the edition toggle, dashed "next" and "future" strokes, the empty-state frame.
- **Concrete** (concrete): the scrollbar thumb, the "related" timeline rail, and the short dash before each street-context line in the route. It does not flip between editions.
- **Navy Pressroom** (on-signal): text and marks on orange. It is the same value as night paper.
- **Halftone** (halftone, night: night-halftone): the dot screen on printed-picture areas. Inside the lead picture it becomes navy at 16% on orange.

### Named Rules

**The One Signal Rule.** Orange is the only hue. It appears as the bar module, the route and big figures. Every other colour is paper, ink, rule or concrete.

**The Three Oranges Rule.** Pick the orange by job, not by taste: signal for fills that carry navy text, signal-graphic for shapes drawn on paper, signal-line for strokes and large figures on paper. Never set body-size text in any orange.

**The Two Editions Rule.** Every colour is written as a token that both editions define. Components never hard-code a hex; the lead picture's isometric palette is the one exception, because it always sits on the orange field.

## Typography

**Display Font:** Anek Latin Variable (with Anek Devanagari Variable, then system-ui)
**Body Font:** Mukta (with system-ui)
**Masthead Marathi:** Anek Devanagari Variable, weight 700, for the decorative "मेट्रो १२" mark only.

**Character:** A condensed, heavy headline grotesk shouts like a front page; a calm, open humanist body reads like the column underneath. The display face is always squeezed to 75% width (87.5% for subheads); the body is never condensed.

### Hierarchy
- **Display** (800, 75% width, step-4 clamp 2.8rem to 6rem, line-height 0.88, uppercase): the front-page headline, the masthead "LINE 12" (line-height 0.8), the pinned station name in the ride.
- **Figure** (800, 75% width, step-4, line-height 0.85 to 0.9, tabular lining): the countdown days, the big numbers, the progress percentages, the ride's painted distance. The number is the headline.
- **Headline** (800, 75% width, step-3 clamp 2.1rem to 3.6rem, line-height 0.95, uppercase): section heads, station names in the vertical route, the rolling-stock maker, word-valued facts.
- **Title** (800, 75% width, step-2 clamp 1.6rem to 2.3rem, line-height 1, uppercase): sub-heads inside a section, phase names, firm names, station directory entries, timeline dates.
- **Subhead** (700, 87.5% width, step-1, uppercase): fact names in the numbers list, the masthead tagline (600), the countdown title and the primary button (800, 75%).
- **Standfirst** (400, step-1, line-height 1.4 to 1.45, Faded Ink, max 52ch on the front, 68ch in sections): the paragraph under a headline.
- **Body** (400, step-0 clamp 1.02rem to 1.14rem, line-height 1.55, max 68ch): running copy.
- **Small** (400, step--1, line-height 1.3 to 1.45): source lines, captions, target notes, history under a fact.
- **Label** (500, step--1, uppercase, 0.06em to 0.08em tracking): table column heads, grade words, phase states, the edition line, pills, mobile table field names. Labels name data; they do not introduce headings.

### Named Rules

**The Squeeze Rule.** Display type is Anek at 75% width and weight 800, uppercase, with line-height under 1. A display line at normal width or in sentence case is off-world. The one exception is the timeline event title, which drops to Mukta 700 so a long sentence stays readable.

**The Tabular Rule.** Every number, date and table uses tabular lining numerals. Figures line up down a column like a stock page.

**The Balanced Head Rule.** Headings balance their lines; paragraphs wrap pretty. No orphan word on a headline.

## Layout

One centred page frame (max 88rem) with a fluid gutter (1rem to 2.5rem). Space follows one rhythm, s-1 to s-9 (0.25rem to 7rem). A section is a solid block: a 4px ink rule on top, then s-8 (4.5rem) of air before content and s-7 (3rem) after. The section head is a grid: a 4.5rem by 0.5rem orange bar, the uppercase name, then a Faded Ink standfirst.

The front page is one column on phones. At 64rem it becomes a two-column front: the headline column (1.45fr) on the left, the lead picture over the countdown (min 20rem) on the right, and the full-width route strip across the fold under a heavy rule.

Inside pages are ruled lists, not grids of cards. The numbers list goes to two columns at 48rem. Updates go to 1.5fr and 1fr at 56rem. Sources go to three columns at 64rem. The station directory uses newspaper columns (16rem minimum). The rolling-stock spec goes to two text columns at 64rem. Tenders are a full table on wide screens; under 48rem each row becomes a labelled block, one field per line, with the label column at 6rem.

At 64rem and up, two sections pin. The route ride pins for 0.55 viewport heights per station and moves the train along the line. The timeline pins and slides its strip sideways. Under 64rem, and with reduced motion, both are plain vertical lists.

Every tap target is at least 44px tall; the two buttons are 48px.

### Named Rules

**The Edition Rule.** Structure is printed with rules, not boxes. A heavy 4px ink rule opens each section and each major block; 1px column rules separate rows. If you reach for a card, use a rule instead.

**The True Spacing Rule.** On the route, x is proportional to chainage. Stations keep their real relative spacing on the front strip and in the ride, from the same shared geometry.

## Elevation & Depth

The system is flat. There are no drop shadows anywhere. Depth comes from paper tone (paper, paper-2, paper-3), from the weight of rules (1px against 4px), and from the halftone screen on printed pictures. The only box-shadow in the build is an inset 1px rule that outlines the progress track, which is a hairline, not an elevation. The lead picture carries its own depth by flat isometric shading (top, front and side faces in three concrete tones).

### Named Rules

**The Printed Page Rule.** Nothing floats above the paper. A surface is either the page, a second sheet (paper-2), or an orange band. State never adds a shadow.

**The Halftone Rule.** The dot screen (1px dots on a 6px grid) goes only on printed-picture areas. It is never a page background.

## Shapes

The form language is the bar, the dot and the line. The bar module is a hard-edged rectangle (0 radius) in every use: section markers, rails, progress fills, edition separators. Station dots are circles (50%) with a paper ring, so they sit in the line like punched holes. The route and the legend's line sample are capsules (1rem radius) drawn as an orange casing with a paper core. The train marker is a navy block with a 3px radius and an orange lower band. The interchange mark is two stacked bars, navy above and orange below, where two lines meet.

Controls take a small 4px radius (the two buttons and the edition toggle). Tender status pills are full pills (999px) with a 1.5px border. The focus ring is a 3px Orange Ink outline, offset 3px, with a 2px radius.

Grade marks are 16px drawn glyphs: a filled square with a paper tick (verified), an open ring (reported), a dashed square (unverified), a crosshatched square (conflicting).

## Components

### Buttons
Tactile, square-shouldered, and loud only where the paper allows it.
- **Shape:** gently cut corners (4px), 48px minimum height, padding 0.5rem by 1.5rem.
- **Signal (primary):** Line 12 Orange fill, Navy Pressroom text, display face at 75% width and weight 800, uppercase, with a down arrow. It is the "Ride the line" action on the front page. Hover moves the arrow down 3px; active scales the button to 0.98.
- **Ink:** Pressroom Navy fill, Newsprint text, Mukta 700. It is the "file a correction" action. Hover turns it Line 12 Orange with navy text; active scales to 0.98.
- **Outline toggle:** transparent, 1px Column Rule border, label type inherited from the edition line, 44px tall, a half-filled circle icon. Hover sets the border to ink and the fill to Folded Newsprint.

### Chips (tender status pills)
- **Style:** full pill, 1.5px border in the current colour, label type at 0.8rem, uppercase, 0.06em tracking, bold.
- **State:** Awarded is a navy fill with paper text. Floated is an orange fill with navy text. Other states stay outlined. A cancelled tender strikes its name and scope through in Orange Ink.

### Cards / Containers
The system has no cards. Two container types exist.
- **Ruled block:** no background, a 4px ink rule on top, content under it. Used for the countdown, the works list, the tender table, the station directory, updates and sources.
- **Quiet panel:** Folded Newsprint fill, 0 radius, 1.5rem padding, with a 4px orange rule on top. Used for "what we have not printed yet". The colophon uses the same sheet with a 0.5rem orange bar on top.
- **Empty state:** a 2px dashed Column Rule frame, 1.5rem padding, bold lead line. Dashed means "nothing here yet".

### Navigation
- **Masthead band:** full-width Line 12 Orange, "LINE 12" in display type with the Marathi mark beside it, the tagline in subhead type on the right.
- **Edition line:** label type in Faded Ink, uppercase, 0.06em tracking, with 0.5rem orange squares as separators, and the edition toggle on the right. A 1px rule under it.
- **Inside index:** the word "Inside" in subhead display type, then a horizontal list of section links (Mukta 500, Faded Ink, 44px tall). Hover or focus sets the text to ink and draws a 3px orange underline from the left. On phones it scrolls sideways with no scrollbar.
- **Links:** inherit the text colour, with a 1px Orange Ink underline offset 0.2em. Hover thickens it to 3px.

### Grade Mark (signature)
Every figure carries one. A 0.95em drawn mark, then an uppercase label word, then a hairline divider and the source outlet as a link. Verified and reported marks are ink; unverified and conflicting marks turn Orange Ink. The word is always present (visibly or for screen readers), so the grade never relies on colour.

### Route Line (signature)
The schematic Line 12, shared by the front-page strip and the route ride. An orange casing (14px on the strip, 22px in the ride) with a paper core (5px and 9px), round joins, one 45-degree bend where the alignment leaves Kalyan-Shilphata Road. Station dots are ink with a paper ring on the strip. In the ride, dots are paper with a 3px ink ring; passed stations fill ink; the current station fills orange and scales to 1.5. On phones the line runs down the left of a vertical station list as a hollow capsule, with an ink dot per station.

### Progress Bars
- **Works bar:** a 1rem track in Folded Newsprint with an inset 1px rule, filled from the left in Orange Rail to the reported percentage. It grows from zero on first view.
- **Phase bar:** a 1rem bar whose stroke says the state. Done is solid ink. Now is solid orange. Started is gapped orange (12px on, 6px off). Next is a 2px dashed rule outline. The state word sits under it.

### Timeline Rail
Each milestone has a 0.5rem rail across its top. Construction and award events are orange. Related-project events are concrete. Other past events are ink. Future events are a gapped rule stroke (8px on, 6px off) with their date and title in Marginal Ink.

### Superseded Figure
An old figure stays on the page in Marginal Ink with a 2px Orange Ink strike. History is printed, not deleted.

### Lead Picture
A figure on a Line 12 Orange field with the halftone screen. An isometric, flat-shaded viaduct (concrete in three greys), a three-car stainless train with an orange band and navy windows, a navy road with paper lane marks, and a giant navy "12" painted on the ground. It is generated by `scripts/draw-lead-picture.py`; edit the script, not the component. Caption in small type, navy on orange.

### Motion
One easing, `cubic-bezier(0.16, 1, 0.3, 1)`, for every CSS transition (0.2s to 0.45s). GSAP uses expo.out for reveals: the headline rises line by line through a mask (1.1s, 0.12s stagger), counters count up to the printed value (1.4s), bars grow from the left (1.2s). Lenis smooth scroll (lerp 0.12) drives ScrollTrigger. With `prefers-reduced-motion: reduce`, none of it runs and all transitions collapse to 0.01ms; the base state already holds the final values.

## Do's and Don'ts

### Do:
- **Do** build every new accent from the bar module: a 0.5rem hard-edged orange rectangle, or a multiple of it (1rem for progress bars).
- **Do** open every section with a 4px ink rule and a section head of bar, uppercase name and standfirst.
- **Do** pick the orange by job: signal under navy text, signal-graphic for shapes on paper, signal-line for strokes and large figures.
- **Do** draw status as a mark or stroke pattern plus a word: solid, gapped, dashed or hollow; tick, ring, dashed square, crosshatch.
- **Do** set every figure in tabular lining numerals, and give it a grade mark and a source link.
- **Do** keep superseded figures on the page, struck through in Orange Ink.
- **Do** write colours as tokens that both editions define, so the night and morning editions stay in step.
- **Do** keep every section fully readable with motion off.

### Don't:
- **Don't** add drop shadows, floating cards or glass panels. The paper is flat.
- **Don't** introduce a second accent hue. Status, category and emphasis use orange, ink, rule and concrete only.
- **Don't** set body-size text in any orange; Orange Ink is 4.06:1 on morning paper.
- **Don't** put the halftone screen on a page background; it belongs to printed pictures.
- **Don't** set display type at normal width, in a light weight, or in sentence case.
- **Don't** round the bar module or the rules. Radius belongs to dots, lines, controls and pills only.
- **Don't** use a small uppercase tracked label above a heading as a kicker. Labels name data and sit beside or under it.
