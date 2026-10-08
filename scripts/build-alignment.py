# Builds the route line and the station positions from MMRDA's approved alignment.
#
# Source: MMRDA publishes "ML-12 APPROVED ALIGNMENT (INFLUENCE ZONE OF 20M) final 20-03-2025" as a
# KMZ on its Metro Influence Zone for NOC page. It holds the centre line, the depot connection and a
# point for each of the 19 stations. This script:
#   - writes src/data/lines/line-12/alignment-mmrda-2025.geojson (centre line and depot line, simplified to ~1 m),
#   - moves every station in src/data/lines/line-12/stations.json to MMRDA's point, graded verified, and adds
#     along_m: the distance from the start point at Kalyan, measured along the centre line,
#   - keeps each station's earlier position (the 2019 DPR, or a reading by the site owner) in
#     location.earlier, with its distance from the new point.
# Run from the repo root: python scripts/build-alignment.py [path/to/metro_line_12_4.kmz]
# Without a path it downloads the file. Uses only the Python standard library.
import io
import json
import math
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

KMZ_URL = 'https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/metro_line_12_4.kmz'
PAGE_URL = 'https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc'
CHECKED = '2026-09-29'
K = '{http://www.opengis.net/kml/2.2}'


def dist(a, b):
    """Metres between two (lat, lng) points."""
    r = 6371008.8
    la1, lo1, la2, lo2 = map(math.radians, (*a, *b))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def local_xy(lat0):
    """A flat projection good to centimetres over a few kilometres near lat0."""
    ky = 111_132.954
    kx = 111_319.49 * math.cos(math.radians(lat0))
    return lambda lat, lng: (lng * kx, lat * ky)


def simplify(points, tol):
    """Douglas-Peucker on (lng, lat) points, tolerance in metres."""
    xy = local_xy(points[0][1])
    p = [xy(la, lo) for lo, la in points]
    keep = [False] * len(p)
    keep[0] = keep[-1] = True
    stack = [(0, len(p) - 1)]
    while stack:
        i, j = stack.pop()
        (x1, y1), (x2, y2) = p[i], p[j]
        dx, dy = x2 - x1, y2 - y1
        seg = dx * dx + dy * dy or 1e-12
        best, idx = 0.0, None
        for k in range(i + 1, j):
            t = max(0.0, min(1.0, ((p[k][0] - x1) * dx + (p[k][1] - y1) * dy) / seg))
            d = math.hypot(p[k][0] - (x1 + t * dx), p[k][1] - (y1 + t * dy))
            if d > best:
                best, idx = d, k
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(i, idx), (idx, j)]
    return [pt for pt, k in zip(points, keep) if k]


def along(line, lat, lng):
    """Distance in metres from the start of line to the point on it nearest (lat, lng), and the offset."""
    xy = local_xy(lat)
    q = xy(lat, lng)
    run, best = 0.0, (1e18, 0.0)
    for (lo1, la1), (lo2, la2) in zip(line, line[1:]):
        a, b = xy(la1, lo1), xy(la2, lo2)
        dx, dy = b[0] - a[0], b[1] - a[1]
        seg = math.hypot(dx, dy)
        t = 0.0 if seg == 0 else max(0.0, min(1.0, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / seg ** 2))
        off = math.hypot(q[0] - (a[0] + t * dx), q[1] - (a[1] + t * dy))
        if off < best[0]:
            best = (off, run + t * seg)
        run += seg
    return best[1], best[0]


def point_at(line, metres):
    """The (lat, lng) point a given distance along line."""
    run = 0.0
    for (lo1, la1), (lo2, la2) in zip(line, line[1:]):
        seg = dist((la1, lo1), (la2, lo2))
        if run + seg >= metres:
            t = (metres - run) / seg if seg else 0
            return la1 + t * (la2 - la1), lo1 + t * (lo2 - lo1)
        run += seg
    return line[-1][1], line[-1][0]


# ---------- Read the KMZ ----------
if len(sys.argv) > 1:
    data = open(sys.argv[1], 'rb').read()
else:
    data = urllib.request.urlopen(urllib.request.Request(KMZ_URL, headers={'User-Agent': 'mumbai-metro-tracker build script'}), timeout=120).read()
root = ET.fromstring(zipfile.ZipFile(io.BytesIO(data)).read('doc.kml'))

points, lines = {}, []
for pm in root.iter(K + 'Placemark'):
    name = (pm.findtext(K + 'name') or '').strip()
    pt = pm.find(K + 'Point')
    if pt is not None:
        lng, lat = map(float, pt.findtext(K + 'coordinates').strip().split(',')[:2])
        points[name] = (lat, lng)
    if name == 'ML-12 ALIGNMENT CENTRE LINE':
        for ls in pm.iter(K + 'LineString'):
            lines.append([tuple(map(float, c.split(',')[:2])) for c in ls.findtext(K + 'coordinates').split()])
if len(lines) != 2:
    sys.exit(f'Expected the centre line and the depot connection, found {len(lines)} lines')
main, depot = sorted(lines, key=len, reverse=True)
start = points['START POINT OF METRO LINE-12']
if dist(start, (main[0][1], main[0][0])) > dist(start, (main[-1][1], main[-1][0])):
    main.reverse()  # run from Kalyan
length = sum(dist((a[1], a[0]), (b[1], b[0])) for a, b in zip(main, main[1:]))
depot_len = sum(dist((a[1], a[0]), (b[1], b[0])) for a, b in zip(depot, depot[1:]))

# ---------- Stations ----------
official = {}
for name, (lat, lng) in points.items():
    m = re.search(r'STATION (\d+)$', name)
    if m:
        official[int(m.group(1))] = (name, lat, lng)

path = 'src/data/lines/line-12/stations.json'
doc = json.load(open(path, encoding='utf-8'))
stations = doc['stations']
if sorted(official) != [s['order'] for s in stations]:
    sys.exit('Station numbers in the KMZ do not match stations.json')

for s in stations:
    name, lat, lng = official[s['order']]
    loc = s['location']
    a_m, off = along(main, lat, lng)
    earlier = list(loc.get('earlier', []))
    if 'along_m' not in loc and loc.get('lat') is not None:
        # First run: keep where the site had the station, and why.
        if loc.get('dpr_position'):
            dp = loc['dpr_position']
            earlier.append({'lat': dp['lat'], 'lng': dp['lng'], 'basis': 'the 2019 project report (DPR)'})
            earlier.append({'lat': loc['lat'], 'lng': loc['lng'], 'basis': "the site owner's reading, 29 Sep 2026"})
        elif loc.get('label'):
            earlier.append({'lat': loc['lat'], 'lng': loc['lng'], 'basis': "the site owner's reading, 28 Sep 2026"})
        else:
            earlier.append({'lat': loc['lat'], 'lng': loc['lng'], 'basis': 'the 2019 project report (DPR)'})
    for e in earlier:
        e['distance_m'] = round(dist((e['lat'], e['lng']), (lat, lng)))
    s['location'] = {
        'lng': round(lng, 6),
        'lat': round(lat, 6),
        'along_m': round(a_m),
        'dpr_chainage_m': loc.get('dpr_chainage_m'),
        'method': f'MMRDA approved alignment of 20 Mar 2025 (KMZ on the Metro Influence Zone page): point "{name}". along_m is measured along the centre line from the start point at Kalyan; the point is {off:.0f} m from the line.',
        'status': 'verified',
        'source_url': PAGE_URL,
        **({'earlier': earlier} if earlier else {}),
    }
    s['last_verified'] = CHECKED
    print(f"{s['order']:2d} {s['name']:<16} {a_m / 1000:6.2f} km  off-line {off:4.0f} m  moved {max([e['distance_m'] for e in earlier] or [0]):4d} m")

doc['_meta']['description'] = (
    f'The {len(stations)} Line 12 stations, in order from Kalyan. Names follow the CA-240 civil contract scope. '
    "Positions are MMRDA's station points from the approved alignment of 20 Mar 2025 (scripts/build-alignment.py); "
    'earlier positions are kept under location.earlier.'
)
doc['_meta']['last_reviewed'] = CHECKED
with open(path, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)
    f.write('\n')

# ---------- The line ----------
# The DPR's bend, where the line leaves Kalyan-Shilphata Road (DPR ch. 7,182 m), located on the 2025 line.
dpr = json.load(open('src/data/lines/line-12/alignment-dpr-2019.geojson', encoding='utf-8'))
dpr_line = dpr['features'][0]['geometry']['coordinates']
bend_lat, bend_lng = point_at(dpr_line, 7182 - (-403.688))  # the DPR line starts at ch. -403.688 m
bend_m, _ = along(main, bend_lat, bend_lng)

geo = {
    'type': 'FeatureCollection',
    'properties': {
        'note': f'MMRDA approved alignment of 20 Mar 2025 ({KMZ_URL}), centre line {length / 1000:.3f} km from the start point at Kalyan to the end point past Amandoot, plus the {depot_len / 1000:.3f} km connection to the Nilje depot. Simplified to about 1 m by scripts/build-alignment.py.',
        'source_url': PAGE_URL,
        'status': 'verified',
        'last_verified': CHECKED,
        'length_m': round(length),
        'depot_connection_m': round(depot_len),
        'bend_along_m': round(bend_m),
    },
    'features': [
        {'type': 'Feature', 'properties': {'name': 'Line 12 centre line'}, 'geometry': {'type': 'LineString', 'coordinates': [[round(x, 6), round(y, 6)] for x, y in simplify(main, 1.0)]}},
        {'type': 'Feature', 'properties': {'name': 'Nilje depot connection'}, 'geometry': {'type': 'LineString', 'coordinates': [[round(x, 6), round(y, 6)] for x, y in simplify(depot, 1.0)]}},
    ],
}
with open('src/data/lines/line-12/alignment-mmrda-2025.geojson', 'w', encoding='utf-8', newline='\n') as f:
    json.dump(geo, f, indent=1)
    f.write('\n')
print(f'Line {length / 1000:.3f} km ({len(main)} -> {len(geo["features"][0]["geometry"]["coordinates"])} points), depot {depot_len / 1000:.3f} km, bend at {bend_m / 1000:.2f} km')
