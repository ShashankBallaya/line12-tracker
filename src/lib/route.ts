/**
 * Schematic line, Vignelli style. For Line 12: straight along Kalyan-Shilphata Road, one 45-degree
 * bend where the line leaves the road near Manpada, then straight to Amandoot.
 * x is proportional to distance along the line's centre line (for Line 12, MMRDA's approved
 * alignment of 20 Mar 2025), so stations keep their true relative spacing. A line whose alignment
 * has no `bend_along_m` is drawn straight. Used by the front-page strip and the route ride.
 *
 * Two more shapes, read from the alignment's properties (Line 5 has both):
 * - `branch_from_station`: a spur (the line's spurStations) leaves that station at 45 degrees and
 *   runs below the line, its stations at their distance along the spur.
 * - `underground_along_m`: [from, to] along the line, a stretch to draw dashed.
 * A station without a published position sits midway between its neighbours and is marked not placed.
 * A line that loops back (Line 5 at Kalyan) is drawn unrolled: x stays distance along the line.
 */
import type { Line, Station } from './data';

/** Metres from the start of the line, along the centre line. */
export const alongOf = (line: Line, i: number) => line.stations[i].location.along_m;

export interface Schematic {
  width: number;
  height: number;
  path: string;
  /** Station points in viewBox units, in station order. */
  points: [number, number][];
  /** Per station: false when its position is not published and its point is only put between its neighbours. */
  placed: boolean[];
  /** The stretch to draw dashed (underground), on the line's path. */
  underground?: string;
  /** A spur: the index of the station it leaves from, its path, and its station points in order. */
  branch?: { from: number; path: string; points: [number, number][] };
}

interface AlignmentProps {
  bend_along_m?: number;
  underground_along_m?: [number, number];
}

/** Distances along the line; a station without one gets the midpoint of its neighbours. */
function distances(stations: Station[]): { along: number[]; placed: boolean[] } {
  const raw = stations.map((s) => (s.location.along_m as number | null) ?? null);
  const along = raw.map((c, i) => {
    if (c !== null) return c;
    const before = raw.slice(0, i).findLast((v) => v !== null) ?? null;
    const after = raw.slice(i + 1).find((v) => v !== null) ?? null;
    if (before === null || after === null) throw new Error(`${stations[i].id} has no position and no placed neighbour on both sides`);
    return (before + after) / 2;
  });
  return { along, placed: raw.map((c) => c !== null) };
}

export function schematic(line: Line, { width = 1000, top = 26, drop = 44, pad = 14, bottom = 20 } = {}): Schematic {
  const { stations, spurStations } = line;
  const props: AlignmentProps = line.alignmentRaw ? (JSON.parse(line.alignmentRaw).properties ?? {}) : {};
  /** For Line 12, where it leaves Kalyan-Shilphata Road: the DPR's bend (ch. 7,182 m) found on the 2025 line. */
  const bendM = props.bend_along_m;
  const { along, placed } = distances(stations);
  const from = line.spurFrom ? stations.indexOf(line.spurFrom) : -1;
  const spur = from >= 0 && spurStations.length ? spurStations.map((s) => along[from] + s.location.along_m) : [];
  const c0 = along[0];
  const c1 = Math.max(along[along.length - 1], ...spur);
  const x0 = pad;
  const x1 = width - pad;
  const xAt = (c: number) => x0 + ((c - c0) / (c1 - c0)) * (x1 - x0);
  const xEnd = xAt(along[along.length - 1]);
  const bendAt = bendM === undefined ? undefined : xAt(bendM);
  /** The line's y at x. */
  const yAt = (x: number) => (bendAt === undefined ? top : top + Math.max(0, Math.min(x - bendAt, drop)));
  const points = along.map((c): [number, number] => [xAt(c), yAt(xAt(c))]);
  const path =
    bendAt === undefined
      ? `M${x0} ${top} H${xEnd}`
      : `M${x0} ${top} H${bendAt.toFixed(1)} L${(bendAt + drop).toFixed(1)} ${top + drop} H${xEnd}`;

  /** The line's path between two distances, with the bend corners in between. */
  const stretch = (ca: number, cb: number) => {
    const xa = xAt(ca);
    const xb = xAt(cb);
    const corners = bendAt === undefined ? [] : [bendAt, bendAt + drop].filter((x) => x > xa && x < xb);
    return [xa, ...corners, xb].map((x, k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${yAt(x).toFixed(1)}`).join(' ');
  };

  let branch: Schematic['branch'];
  if (spur.length) {
    const [bx, by] = points[from];
    const spurY = (x: number) => by + Math.max(0, Math.min(x - bx, drop));
    const bxEnd = xAt(spur[spur.length - 1]);
    branch = {
      from,
      path: `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + drop).toFixed(1)} ${(by + drop).toFixed(1)} H${bxEnd.toFixed(1)}`,
      points: spur.map((c) => [xAt(c), spurY(xAt(c))]),
    };
  }
  const lowest = Math.max(top + (bendAt === undefined ? 0 : drop), ...(branch ? branch.points.map(([, y]) => y) : []));
  return {
    width,
    height: lowest + bottom,
    path,
    points,
    placed,
    underground: props.underground_along_m ? stretch(...props.underground_along_m) : undefined,
    branch,
  };
}
