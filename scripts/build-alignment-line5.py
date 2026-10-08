# Builds Line 5's route line and station positions from MMRDA's alignment file.
#
# Source: MMRDA publishes "Line 5 : Thane-Bhiwandi-Kalyan" as a KML on its Metro Influence Zone for
# NOC page (uploaded March 2025). Unlike Line 12's file it has no centre line: it holds the corridor
# as one polygon about 50 m wide, and a point for each of 17 stations. This script:
#   - derives the centre line as the midpoints between the polygon's two long sides (the two ends of
#     the polygon are its tips at Kapurbawdi and past APMC Kalyan),
#   - writes src/data/lines/line-5/alignment-mmrda-2025.geojson (simplified to ~1 m) in three parts:
#     the centre line from Kapurbawdi to Durgadi Fort (Phases 1 and 2, still the plan), the stretch
#     from Dhamankar Naka to Temghar that the revised plan of 2026 puts underground (its exact route
#     is not published, so this is the 2025 route above it), and the 2017 route past Durgadi Fort,
#     which the revised plan drops,
#   - moves every station in src/data/lines/line-5/stations.json to MMRDA's point, graded verified,
#     and sets along_m: the distance from the start of the centre line at Kapurbawdi.
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


# ---------- Stations ----------
doc = json.load(open(STATIONS, encoding='utf-8'))
by_id = {s['id']: s for s in doc['stations']}
last = -1.0
along_of = {}
for kml_name, sid in KML_NAMES.items():
    lng, lat = points[kml_name]
    off, at = along(lng, lat)
    if off > 25:
        sys.exit(f'{kml_name} is {off:.0f} m from the derived centre line')
    if at < last:
        sys.exit(f'{kml_name} is out of order along the line')
    last = at
    along_of[sid] = at
    loc = by_id[sid]['location']
    loc.update({
        'lng': round(lng, 6),
        'lat': round(lat, 6),
        'along_m': round(at),
        'method': f'MMRDA alignment file for Line 5 (KML on the Metro Influence Zone page, uploaded March 2025): point "{kml_name}". along_m is measured along a centre line derived from MMRDA\'s corridor polygon, from its start at Kapurbawdi; the point is {round(off)} m from that line.',
        'status': 'verified',
        'source_url': PAGE_URL,
    })
    print(f'{sid:18s} {at / 1000:7.3f} km  {off:5.1f} m off the line')

with open(STATIONS, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, indent=1, ensure_ascii=False)
    f.write('\n')



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


durgadi = along_of['durgadi-fort']
feature = lambda props, coords: {'type': 'Feature', 'properties': props, 'geometry': {'type': 'LineString', 'coordinates': coords}}
geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f'Derived from MMRDA\'s alignment file for Line 5 ({KML_URL}), which gives the corridor as a polygon about 50 m wide, not a centre line. The centre line runs midway between the polygon\'s two sides, {length / 1000:.3f} km from its tip at Kapurbawdi to its tip past APMC Kalyan. The file predates the revised plan of 2026: Phases 1 and 2 (Kapurbawdi to Durgadi Fort) still follow it, along the road medians of Agra Road, the Bhiwandi bypass, and Kalyan-Bhiwandi Road; past Durgadi Fort the revised plan takes a new route (Phase 5A), which is not published. Simplified to about 1 m by scripts/build-alignment-line5.py.',
        'source_url': PAGE_URL,
        'status': 'verified',
        'last_verified': CHECKED,
        'length_m': round(length),
        'centre_line_m': round(durgadi),
    },
    'features': [
        feature({'name': 'Line 5 centre line', 'part': 'current', 'note': 'Kapurbawdi to Durgadi Fort: Phase 1 (built) and Phase 2 (approved). Phase 2 starts at Dhamankar Naka; see the stations for along_m.'}, cut(0, durgadi)),
        feature({'name': 'Line 5 underground stretch', 'part': 'underground', 'status': 'conflicting', 'note': 'Dhamankar Naka to Temghar, which a news report (Metro Rail News, Apr 2026) says goes underground; MMRDA names only Bhiwandi station as underground. The route below ground is not published: this is the 2025 route along the road above it, which here runs on the Bhiwandi bypass flyover.'}, cut(along_of['dhamankar-naka'], along_of['temghar'])),
        feature({'name': 'Line 5 route past Durgadi, 2017 plan', 'part': 'superseded', 'note': 'Durgadi Fort, Sahajanand Chowk, Kalyan and APMC Kalyan. The revised plan of 2026 replaces this with Phase 5A (Durgadi, Khadakpada, Bhoirwadi to Kalyan, with a spur to Ulhasnagar), whose route is not published.'}, cut(durgadi, length)),
    ],
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'Line {length / 1000:.3f} km ({len(centre)} points); current plan to Durgadi Fort {durgadi / 1000:.3f} km')
