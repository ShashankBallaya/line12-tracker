# Builds Line 5's route line and station positions from MMRDA's alignment file.
#
# Sources: MMRDA's alignment file to the Ulhas river bridge at Durgadi, and past it the tentative key plan in
# MMRDA's tender documents of March 2026 (scripts/data/line5-extension-keyplan.json, traced from an image).
#
# MMRDA publishes "Line 5 : Thane-Bhiwandi-Kalyan" as a KML on its Metro Influence Zone for
# NOC page (uploaded March 2025). Unlike Line 12's file it has no centre line: it holds the corridor
# as one polygon about 50 m wide, and a point for each of 17 stations. This script:
#   - derives the centre line as the midpoints between the polygon's two long sides (the two ends of
#     the polygon are its tips at Kapurbawdi and past APMC Kalyan),
#   - at Kapurbawdi, where MMRDA's file stops at the curve onto Ghodbunder Road, continues the line north
#     to Kapurbawdi station along Line 5's two tracks in OpenStreetMap (scripts/data/line5-kapurbawdi-osm.json),
#   - writes src/data/lines/line-5/alignment-mmrda-2025.geojson (simplified to ~1 m) in four parts:
#     the centre line (MMRDA's file to the bridge, then Phase 3 to Kalyan from the key plan), the
#     stretch from Dhamankar Naka to Temghar that the revised plan of 2026 puts underground (its
#     route is not published, so this is the 2025 route above it), the Line 5A spur from the key
#     plan, and the 2017 route past the bridge, which the revised plan drops,
#   - moves every station in src/data/lines/line-5/stations.json to MMRDA's point, graded verified,
#     and sets along_m: the distance from the start of the centre line at Kapurbawdi; then moves
#     Phase 3 and spur stations to their key plan positions (reported), keeping the 2025 point
#     under location.earlier, and adds the ones that are new.
# Every station point lies within about 11 m of the derived line; the script stops if one is more
# than 25 m away, which would mean the derivation went wrong.
# Run from the repo root: python scripts/build-alignment-line5.py [path/to/metro_line-5.kml]
# Without a path it downloads the file. Uses only the Python standard library.
import json
import math
import sys
import urllib.request
import xml.etree.ElementTree as ET

KML_URL = 'https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/metro_line-5.kml'
PAGE_URL = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
CHECKED = '2026-10-09'
K = '{http://www.opengis.net/kml/2.2}'
STATIONS = 'src/data/lines/line-5/stations.json'
OUT = 'src/data/lines/line-5/alignment-mmrda-2025.geojson'
KEYPLAN = 'scripts/data/line5-extension-keyplan.json'
KAPURBAWDI = 'scripts/data/line5-kapurbawdi-osm.json'
MMRDA_PR = 'https://mmrda.maharashtra.gov.in/sites/default/files/2026-05/extended_metro_line_5_to_strengthen_connectivity_across_thane_bhiwandi_kalyan_and_ulhasnagar.pdf'

# KML placemark name -> station id in stations.json.
KML_NAMES = {
    'Kapurbawdi(M)station': 'kapurbawdi',
    'Balkum Naka(M) Station': 'balkum-naka',
    'Kasheli(M)Station': 'kasheli',
    'Kalhar(M) Station': 'kalher',
    'Purna(M) Station': 'purna',
    'Anjurphata(M)Station': 'anjurphata',
    'Dhamankar Naka (M) Station': 'dhamankar-naka',
    'Bhiwandi(M) Statiion': 'bhiwandi',
    'Gopal Nagar (M) station': 'gopal-nagar',
    'Temghar(M)station': 'temghar',
    'Rajnouli Village(M) Station': 'rajnouli',
    'Gove Gaon MIDC(M) Station': 'gove-gaon',
    'Kon Gaon (M) Station': 'kon-gaon',
    'Durgadi Fort (M) Station': 'durgadi-fort',
    'Sahajanand Chowk (M) Station': 'sahajanand-chowk',
    'Kalyan (M) Station': 'kalyan',
    'APMC Kalyan (M) Station': 'apmc-kalyan',
}

# A flat projection, good to well under a metre across this 25 km line.
LAT0 = 19.25
KX = 111_319.49 * math.cos(math.radians(LAT0))
KY = 111_132.954
to_xy = lambda lng, lat: (lng * KX, lat * KY)
to_ll = lambda x, y: (x / KX, y / KY)


def seg_nearest(a, b, p):
    """Nearest point to p on segment ab, its distance, and how far along ab it is."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    l2 = dx * dx + dy * dy or 1e-12
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2))
    q = (a[0] + t * dx, a[1] + t * dy)
    return q, math.dist(p, q), t * math.sqrt(l2)


def densify(pts, step):
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        n = max(1, int(math.dist(a, b) // step))
        out += [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(1, n + 1)]
    return out


def simplify(p, tol):
    """Douglas-Peucker on projected points, tolerance in metres."""
    keep = [False] * len(p)
    keep[0] = keep[-1] = True
    stack = [(0, len(p) - 1)]
    while stack:
        i, j = stack.pop()
        best, idx = 0.0, None
        for k in range(i + 1, j):
            _, d, _ = seg_nearest(p[i], p[j], p[k])
            if d > best:
                best, idx = d, k
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [q for q, kp in zip(p, keep) if kp]


# ---------- Read the KML ----------
if len(sys.argv) > 1:
    data = open(sys.argv[1], 'rb').read()
else:
    data = urllib.request.urlopen(urllib.request.Request(KML_URL, headers={'User-Agent': 'mumbai-metro-tracker build script'}), timeout=120).read()
root = ET.fromstring(data)

ring, points = None, {}
for pm in root.iter(K + 'Placemark'):
    name = (pm.findtext(K + 'name') or '').strip()
    coords = [tuple(map(float, c.split(',')[:2])) for c in pm.find('.//' + K + 'coordinates').text.split()]
    if pm.find('.//' + K + 'Polygon') is not None:
        if ring is not None:
            sys.exit('Expected one corridor polygon, found more')
        ring = coords
    else:
        points[name] = coords[0]
if ring is None:
    sys.exit('No corridor polygon in the KML')
if set(points) != set(KML_NAMES):
    sys.exit(f'Station names in the KML changed: {sorted(set(points) ^ set(KML_NAMES))}')

# ---------- Centre line ----------
if ring[0] == ring[-1]:
    ring = ring[:-1]
R = [to_xy(*c) for c in ring]
n = len(R)
cum = [0.0]
for i in range(n):
    cum.append(cum[-1] + math.dist(R[i], R[(i + 1) % n]))
perimeter = cum[-1]
i0 = min(range(n), key=lambda i: R[i][0])  # the western tip, at Kapurbawdi
ahead = lambda a, b: (cum[b] - cum[a]) % perimeter
i1 = min(range(n), key=lambda i: abs(ahead(i0, i) - perimeter / 2))  # the far tip: halfway round
side_a = densify([R[(i0 + j) % n] for j in range((i1 - i0) % n + 1)], 2.0)
side_b = densify([R[(i0 - j) % n] for j in range((i0 - i1) % n + 1)], 2.0)

mid = []
for k in range(0, len(side_a), 5):
    p = side_a[k]
    c = int(k * len(side_b) / len(side_a))
    window = side_b[max(0, c - 400):c + 400]
    q = min((seg_nearest(a, b, p)[:2] for a, b in zip(window, window[1:])), key=lambda r: r[1])[0]
    mid.append(((p[0] + q[0]) / 2, (p[1] + q[1]) / 2))
centre = simplify(mid, 1.0)

# ---------- Kapurbawdi: MMRDA's file stops at the curve; OSM's tracks go on north to the station ----------
KAP = json.load(open(KAPURBAWDI, encoding='utf-8'))
tracks = [densify([to_xy(*c) for c in t], 2.0) for t in KAP['tracks']]
for t in tracks:
    if t[0][1] < t[-1][1]:
        t.reverse()  # run from the north end, past the station
osm_mid = []
for p in tracks[0][::5]:
    q = min((seg_nearest(a, b, p)[:2] for a, b in zip(tracks[1], tracks[1][1:])), key=lambda r: r[1])[0]
    osm_mid.append(((p[0] + q[0]) / 2, (p[1] + q[1]) / 2))


def nearest_on_centre(p):
    return min(((i, *seg_nearest(a, b, p)[:2]) for i, (a, b) in enumerate(zip(centre, centre[1:]))), key=lambda r: r[2])


join = next((i for i, p in enumerate(osm_mid) if nearest_on_centre(p)[2] <= 8), None)
if join is None:
    sys.exit("OpenStreetMap's Line 5 tracks never meet MMRDA's line at Kapurbawdi")
k, q, _ = nearest_on_centre(osm_mid[join])
centre = simplify(osm_mid[:join] + [q] + centre[k + 1:], 1.0)
cum_c = [0.0]
for a, b in zip(centre, centre[1:]):
    cum_c.append(cum_c[-1] + math.dist(a, b))
length = cum_c[-1]


def along(lng, lat):
    p = to_xy(lng, lat)
    best = (1e18, 0.0)
    for i, (a, b) in enumerate(zip(centre, centre[1:])):
        _, d, s = seg_nearest(a, b, p)
        if d < best[0]:
            best = (d, cum_c[i] + s)
    return best


# ---------- Stations from MMRDA's file ----------
doc = json.load(open(STATIONS, encoding='utf-8'))
for key in ('stations', 'spur_stations', 'dropped_stations'):
    doc.setdefault(key, [])
by_id = {s['id']: s for key in ('stations', 'spur_stations', 'dropped_stations') for s in doc[key]}
last = -1.0
along_of = {}
for kml_name, sid in KML_NAMES.items():
    lng, lat = points[kml_name]
    off, at = along(lng, lat)
    # MMRDA's Kapurbawdi point sits on the rounded tip of its corridor, off the real curve; it is replaced below.
    if off > (60 if sid == 'kapurbawdi' else 25):
        sys.exit(f'{kml_name} is {off:.0f} m from the derived centre line')
    if at < last:
        sys.exit(f'{kml_name} is out of order along the line')
    last = at
    along_of[sid] = at
    loc = by_id[sid]['location']
    loc.pop('earlier', None)
    loc.pop('keyplan_chainage_m', None)
    loc.update({
        'lng': round(lng, 6),
        'lat': round(lat, 6),
        'along_m': round(at),
        'method': f'MMRDA alignment file for Line 5 (KML on the Metro Influence Zone page, uploaded March 2025): point "{kml_name}". along_m is measured along a centre line derived from MMRDA\'s corridor polygon, from its start at Kapurbawdi; the point is {round(off)} m from that line.',
        'status': 'verified',
        'source_url': PAGE_URL,
    })
    print(f'{sid:18s} {at / 1000:7.3f} km  {off:5.1f} m off the line')


def cut(s0, s1):
    """The part of the centre line between s0 and s1 metres from its start."""
    def point(s):
        for i in range(len(centre) - 1):
            if cum_c[i + 1] >= s:
                t = (s - cum_c[i]) / ((cum_c[i + 1] - cum_c[i]) or 1e-9)
                a, b = centre[i], centre[i + 1]
                return (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
        return centre[-1]
    inner = [q for q, c in zip(centre, cum_c) if s0 < c < s1]
    return [[round(c, 6) for c in to_ll(*q)] for q in [point(s0), *inner, point(s1)]]


# ---------- Kapurbawdi station: OpenStreetMap's point, not MMRDA's ----------
kap = by_id['kapurbawdi']['location']
k_off, k_at = along(KAP['station']['lng'], KAP['station']['lat'])
moved = round(math.dist(to_xy(KAP['station']['lng'], KAP['station']['lat']), to_xy(kap['lng'], kap['lat'])))
kap['earlier'] = [{'lat': kap['lat'], 'lng': kap['lng'], 'basis': "MMRDA's alignment file of March 2025, which puts it on the curve east of Ghodbunder Road, where there is no station", 'distance_m': moved}]
kap.update({
    'lng': KAP['station']['lng'], 'lat': KAP['station']['lat'], 'along_m': round(k_at),
    'method': f"OpenStreetMap's Kapurbawdi Station ({KAP['station']['osm']}), on the Line 4 viaduct over Ghodbunder Road, where Line 5's tracks run alongside; checked on satellite imagery by the owner (Google Maps) and on Esri imagery, 2026-10-09. The point is {round(k_off)} m from the line.",
    'status': 'reported', 'source_url': KAP['station']['osm'],
})
along_of['kapurbawdi'] = k_at
print(f'kapurbawdi         {k_at / 1000:7.3f} km  (OpenStreetMap; {moved} m from MMRDA\'s point)')


# ---------- Past the Ulhas bridge: the key plan in the March 2026 tender documents ----------
KP = json.load(open(KEYPLAN, encoding='utf-8'))
tf = KP['transform']
kp_a, kp_b = complex(*tf['a']), complex(*tf['b'])
kp_kx = 111_319.49 * math.cos(math.radians(tf['lat0']))


def kp_ll(x, y):
    """Image pixel -> (lng, lat), with the fit recorded in the key plan file."""
    z = kp_a * complex(x, -y) + kp_b
    return z.real / kp_kx, z.imag / KY


def metres(coords):
    return sum(math.dist(to_xy(*p), to_xy(*q)) for p, q in zip(coords, coords[1:]))


ph3, spur = KP['phase_3'], KP['spur']
fork_off, fork_m = along(*kp_ll(*ph3['line_px'][0]))
if fork_off > 60:
    sys.exit(f'The key plan route starts {fork_off:.0f} m from the derived centre line')
ph3_line = cut(0, fork_m) + [[round(c, 6) for c in kp_ll(*p)] for p in ph3['line_px'][1:]]
spur_line = [[round(c, 6) for c in kp_ll(*p)] for p in spur['line_px']]
KP_METHOD = ('Tentative route in MMRDA\'s tender documents of March 2026 for the general consultant of Line 5A (key plan posted on X by '
             'Arindam Mahapatra; that tender was cancelled on 19 Aug 2026). Position traced from the key plan and placed on the map '
             'with Kala Talao and the Ulhas river bridge as control points; good to about 50 m. ')


def new_station(sid, name, phase):
    return {
        'id': sid, 'order': None, 'name': name, 'name_mr': None, 'phase': phase, 'type': 'Elevated',
        'name_status': 'verified', 'name_source_url': MMRDA_PR,
        'location': {}, 'interchanges': {'value': [], 'status': 'verified', 'source_url': MMRDA_PR},
        'context': [],
        'construction_status': {'value': 'Not started', 'status': 'reported', 'source_url': KP['_meta']['source_url']},
        'revised_plan_2026': {'value': 'New station' if phase == 3 else 'New station on the Line 5A spur', 'name_in_plan': name,
                              'status': 'verified', 'source_url': MMRDA_PR, 'last_verified': CHECKED},
        'notes': None, 'last_verified': CHECKED,
    }


def place(st, px, chainage, along_m, list_key, phase):
    rec = by_id.get(st['id'])
    if rec is None:
        rec = by_id[st['id']] = new_station(st['id'], st['name'], phase)
        doc[list_key].append(rec)
    loc = rec['location']
    lng, lat = kp_ll(*px)
    if st['id'] in along_of:  # its point came from MMRDA's file in this run
        moved = round(math.dist(to_xy(lng, lat), to_xy(loc['lng'], loc['lat'])))
        loc['earlier'] = [{'lat': loc['lat'], 'lng': loc['lng'], 'basis': "MMRDA's alignment file of March 2025 (the 2017 route)", 'distance_m': moved}]
    loc.update({
        'lng': round(lng, 6), 'lat': round(lat, 6), 'along_m': round(along_m), 'keyplan_chainage_m': chainage,
        'method': KP_METHOD + f'Key plan chainage {chainage:,.0f} m; along_m adds it to the distance from Kapurbawdi to the corridor start at the bridge.' if list_key == 'stations'
                  else KP_METHOD + f'along_m is the key plan chainage on the spur, from its start just past Bhoirwadi.',
        'status': 'reported', 'source_url': KP['_meta']['source_url'],
    })
    print(f'{st["id"]:18s} {along_m / 1000:7.3f} km  (key plan)')


for st in ph3['stations']:
    place(st, st['px'], st['chainage_m'], fork_m + st['chainage_m'], 'stations', 3)
for st in spur['stations']:
    place(st, st['px'], st['chainage_m'], st['chainage_m'], 'spur_stations', '5A')
# Keep the main list in order along the line; a station without a position stays after the one before it.
keyed, prev = [], -1.0
for st in doc['stations']:
    at = st['location'].get('along_m')
    prev = at if at is not None else prev + 0.5
    keyed.append((prev, st))
doc['stations'] = [st for _, st in sorted(keyed, key=lambda t: t[0])]
for key in ('stations', 'spur_stations', 'dropped_stations'):
    for k, st in enumerate(doc[key], 1):
        st['order'] = k

with open(STATIONS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, indent=1, ensure_ascii=False)
    f.write('\n')

feature = lambda props, coords: {'type': 'Feature', 'properties': props, 'geometry': {'type': 'LineString', 'coordinates': coords}}
geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f'Kapurbawdi to the Ulhas river bridge at Durgadi: from the station north of the curve onto Ghodbunder Road, OpenStreetMap\'s Line 5 tracks (ODbL; scripts/data/line5-kapurbawdi-osm.json); then derived from MMRDA\'s alignment file for Line 5 ({KML_URL}), which gives the corridor as a polygon about 50 m wide; the centre line runs midway between its two sides, along the road medians of Agra Road, the Bhiwandi bypass and Kalyan-Bhiwandi Road (verified). Past the bridge, Phase 3 to Kalyan and the Line 5A spur to Ulhasnagar are traced from the tentative key plan in MMRDA\'s tender documents of March 2026 (reported, good to about 50 m; scripts/data/line5-extension-keyplan.json). Simplified to about 1 m by scripts/build-alignment-line5.py.',
        'source_url': PAGE_URL,
        'status': 'verified',
        'last_verified': CHECKED,
        'length_m': round(length),
        'fork_m': round(fork_m),
        'centre_line_m': round(metres(ph3_line)),
        'spur_m': round(metres(spur_line)),
        # For the schematic strip (src/lib/route.ts): where the spur leaves the line, and the stretch to dash.
        'branch_from_station': 'bhoirwadi',
        'underground_along_m': [round(along_of['dhamankar-naka']), round(along_of['temghar'])],
        # The station-page locator (src/components/LocatorMap.astro): Kapurbawdi sits bottom left, so north goes top left.
        'locator_north': 'top-left',
    },
    'features': [
        feature({'name': 'Line 5 centre line', 'part': 'current', 'note': f'Phase 1 (built) and Phase 2 (approved) from Kapurbawdi to the Ulhas river bridge, from MMRDA\'s 2025 file (verified); then Phase 3 to Kalyan from the tender key plan (reported). Phase 3 starts {fork_m / 1000:.2f} km from Kapurbawdi.'}, ph3_line),
        feature({'name': 'Line 5 underground stretch', 'part': 'underground', 'status': 'conflicting', 'note': 'Dhamankar Naka to Temghar, which a news report (Metro Rail News, Apr 2026) says goes underground; MMRDA names only Bhiwandi station as underground. The route below ground is not published: this is the 2025 route along the road above it, which here runs on the Bhiwandi bypass flyover.'}, cut(along_of['dhamankar-naka'], along_of['temghar'])),
        feature({'name': 'Line 5A spur', 'part': 'spur', 'status': 'reported', 'note': 'Bhoirwadi to Ulhasnagar, 5.27 km by the key plan, traced from the tentative key plan in MMRDA\'s tender documents of March 2026. Its first stretch runs beside Phase 3.'}, spur_line),
        feature({'name': 'Line 5 route past the Ulhas bridge, 2017 plan', 'part': 'superseded', 'note': 'Durgadi Fort, Sahajanand Chowk, Kalyan and APMC Kalyan on the 2017 route, which the revised plan of 2026 replaces with Phase 3 and the spur.'}, cut(fork_m, length)),
    ],
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'MMRDA file {length / 1000:.3f} km; corridor start at the bridge {fork_m / 1000:.3f} km ({fork_off:.0f} m off the line); '
      f'Line 5 to Kalyan {metres(ph3_line) / 1000:.3f} km; spur {metres(spur_line) / 1000:.3f} km (key plan: {ph3["length_m"] / 1000:.3f} and {spur["length_m"] / 1000:.3f})')
