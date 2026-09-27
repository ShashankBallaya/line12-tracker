/**
 * Schematic Line 12, Vignelli style: straight along Kalyan-Shilphata Road, one 45-degree bend
 * where the 2019 alignment leaves the road (about ch. 7,182 m), then straight to Amandoot.
 * x is proportional to chainage, so stations keep their true relative spacing.
 * Used by the front-page strip and the route ride, so both draw the same line.
 */
import { stations } from './data';

/** Kalyan has no DPR chainage; the start of the CA-240 viaduct stands in for it (reported, approximate). */
export const KALYAN_CH = -860.224;
const BEND_CH = 7182;

export const chainageOf = (i: number) => stations[i].location.dpr_chainage_m ?? KALYAN_CH;

export interface Schematic {
  width: number;
  height: number;
  path: string;
  /** Station points in viewBox units, in station order. */
  points: [number, number][];
}

export function schematic({ width = 1000, top = 26, drop = 44, pad = 14, bottom = 20 } = {}): Schematic {
  const c0 = chainageOf(0);
  const c1 = chainageOf(stations.length - 1);
  const x0 = pad;
  const x1 = width - pad;
  const xAt = (c: number) => x0 + ((c - c0) / (c1 - c0)) * (x1 - x0);
  const bendAt = xAt(BEND_CH);
  const pointAt = (c: number): [number, number] => {
    const x = xAt(c);
    return [x, top + Math.max(0, Math.min(x - bendAt, drop))];
  };
  return {
    width,
    height: top + drop + bottom,
    path: `M${x0} ${top} H${bendAt.toFixed(1)} L${(bendAt + drop).toFixed(1)} ${top + drop} H${x1}`,
    points: stations.map((_, i) => pointAt(chainageOf(i))),
  };
}
