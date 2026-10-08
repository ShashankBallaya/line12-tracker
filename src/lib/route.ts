/**
 * Schematic Line 12, Vignelli style: straight along Kalyan-Shilphata Road, one 45-degree bend
 * where the line leaves the road near Manpada, then straight to Amandoot.
 * x is proportional to distance along MMRDA's approved centre line (20 Mar 2025), so stations
 * keep their true relative spacing. Used by the front-page strip and the route ride.
 */
import { stations, alignmentRaw } from './data';

/** Where the line leaves Kalyan-Shilphata Road: the DPR's bend (ch. 7,182 m) found on the 2025 line. */
const BEND_M: number = JSON.parse(alignmentRaw).properties.bend_along_m;

/** Metres from the start of the line at Kalyan, along the centre line. */
export const alongOf = (i: number) => stations[i].location.along_m;

export interface Schematic {
  width: number;
  height: number;
  path: string;
  /** Station points in viewBox units, in station order. */
  points: [number, number][];
}

export function schematic({ width = 1000, top = 26, drop = 44, pad = 14, bottom = 20 } = {}): Schematic {
  const c0 = alongOf(0);
  const c1 = alongOf(stations.length - 1);
  const x0 = pad;
  const x1 = width - pad;
  const xAt = (c: number) => x0 + ((c - c0) / (c1 - c0)) * (x1 - x0);
  const bendAt = xAt(BEND_M);
  const pointAt = (c: number): [number, number] => {
    const x = xAt(c);
    return [x, top + Math.max(0, Math.min(x - bendAt, drop))];
  };
  return {
    width,
    height: top + drop + bottom,
    path: `M${x0} ${top} H${bendAt.toFixed(1)} L${(bendAt + drop).toFixed(1)} ${top + drop} H${x1}`,
    points: stations.map((_, i) => pointAt(alongOf(i))),
  };
}
