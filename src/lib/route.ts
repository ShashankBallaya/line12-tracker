/**
 * Schematic line, Vignelli style. For Line 12: straight along Kalyan-Shilphata Road, one 45-degree
 * bend where the line leaves the road near Manpada, then straight to Amandoot.
 * x is proportional to distance along the line's centre line (for Line 12, MMRDA's approved
 * alignment of 20 Mar 2025), so stations keep their true relative spacing. A line whose alignment
 * has no `bend_along_m` is drawn straight. Used by the front-page strip and the route ride.
 */
import type { Line } from './data';

/** Metres from the start of the line, along the centre line. */
export const alongOf = (line: Line, i: number) => line.stations[i].location.along_m;

export interface Schematic {
  width: number;
  height: number;
  path: string;
  /** Station points in viewBox units, in station order. */
  points: [number, number][];
}

export function schematic(line: Line, { width = 1000, top = 26, drop = 44, pad = 14, bottom = 20 } = {}): Schematic {
  const { stations } = line;
  /** For Line 12, where it leaves Kalyan-Shilphata Road: the DPR's bend (ch. 7,182 m) found on the 2025 line. */
  const bendM: number | undefined = line.alignmentRaw ? JSON.parse(line.alignmentRaw).properties?.bend_along_m : undefined;
  const c0 = alongOf(line, 0);
  const c1 = alongOf(line, stations.length - 1);
  const x0 = pad;
  const x1 = width - pad;
  const xAt = (c: number) => x0 + ((c - c0) / (c1 - c0)) * (x1 - x0);
  if (bendM === undefined) {
    return {
      width,
      height: top + bottom,
      path: `M${x0} ${top} H${x1}`,
      points: stations.map((_, i) => [xAt(alongOf(line, i)), top]),
    };
  }
  const bendAt = xAt(bendM);
  const pointAt = (c: number): [number, number] => {
    const x = xAt(c);
    return [x, top + Math.max(0, Math.min(x - bendAt, drop))];
  };
  return {
    width,
    height: top + drop + bottom,
    path: `M${x0} ${top} H${bendAt.toFixed(1)} L${(bendAt + drop).toFixed(1)} ${top + drop} H${x1}`,
    points: stations.map((_, i) => pointAt(alongOf(line, i))),
  };
}
