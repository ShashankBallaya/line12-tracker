/**
 * Site configuration. Values that differ per deployment come from PUBLIC_* environment
 * variables (set them in Cloudflare Pages > Settings > Environment variables, or in a local .env).
 * PUBLIC_ variables end up in the browser bundle: only put client-side, domain-restricted tokens here.
 */

/** Street-level imagery provider for each station.
 *  'mapillary' (default): free, shows capture dates. Needs PUBLIC_MAPILLARY_TOKEN (a client token).
 *  'google': Google Street View embed. Needs PUBLIC_GOOGLE_MAPS_KEY and a Google billing account.
 *  Without the needed key, the site falls back to plain "open in Mapillary / Street View" links. */
export const STREET_LEVEL_PROVIDER: 'mapillary' | 'google' =
  import.meta.env.PUBLIC_STREET_LEVEL_PROVIDER === 'google' ? 'google' : 'mapillary';

export const MAPILLARY_TOKEN: string = import.meta.env.PUBLIC_MAPILLARY_TOKEN ?? '';
export const GOOGLE_MAPS_KEY: string = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY ?? '';

/** Vector tiles for the alignment map (free, no key). */
export const MAP_TILES = 'https://tiles.openfreemap.org/planet';
export const MAP_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
