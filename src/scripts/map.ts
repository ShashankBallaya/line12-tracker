/**
 * Alignment map (MapLibre GL) and street-level panel. Loaded lazily by scenes.ts when the map
 * section nears the viewport. The map style is built here from the edition's CSS tokens,
 * on OpenFreeMap vector tiles (OpenMapTiles schema, free, no key), and rebuilt on theme change.
 */
import * as maplibregl from 'maplibre-gl';
import type { StyleSpecification, LngLatLike, MapLayerMouseEvent } from 'maplibre-gl';
// Linked at mount, not imported: an imported stylesheet would be hoisted into the page head
// and block the first paint for a map that loads only near its section.
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
// MapLibre 6 runs tile parsing in a module worker; Vite bundles it and gives us its URL.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);
import { MAP_TILES, MAP_GLYPHS, MAPILLARY_TOKEN, GOOGLE_MAPS_KEY } from '../config';

interface StationData {
  id: string;
  order: number;
  name: string;
  lat: number | null;
  lng: number | null;
  where: string;
  interchanges: string[];
  context: { text: string; status: string; source: string | null }[];
  status: string;
  note: string | null;
  /** Not on the line itself: on a spur, or dropped from an earlier plan. */
  group?: 'spur' | 'dropped';
}

/** Parts of an alignment drawn apart from the line (a feature without `part` is the line). */
const isPart = (...parts: string[]) => ['in', ['get', 'part'], ['literal', parts]] as maplibregl.ExpressionSpecification;

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const GRADE_LABEL: Record<string, string> = { verified: 'Verified', reported: 'Reported', unverified: 'Unverified', conflicting: 'Sources conflict' };

/** Same marks as Grade.astro, as a string for panel HTML. */
function gradeHtml(status: string, source: string | null): string {
  const mark: Record<string, string> = {
    verified: '<rect x="1" y="1" width="14" height="14" fill="currentColor"/><path d="M4 8.4 6.9 11 12 5" fill="none" stroke="var(--paper)" stroke-width="2"/>',
    reported: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"/>',
    unverified: '<rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.2"/>',
    conflicting: '<rect x="1.5" y="1.5" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 6.5 6.5 1.5M1.5 11.5 11.5 1.5M4.5 14.5 14.5 4.5M9.5 14.5 14.5 9.5" stroke="currentColor"/>',
  };
  const link = source ? ` <a class="grade__source" href="${esc(source)}" target="_blank" rel="noopener">source<span class="visually-hidden"> (opens in a new tab)</span></a>` : '';
  return `<span class="mini-grade"><svg viewBox="0 0 16 16" aria-hidden="true">${mark[status] ?? mark.unverified}</svg><span class="visually-hidden">${GRADE_LABEL[status] ?? 'Unverified'}</span>${link}</span>`;
}

function buildStyle(alignment: GeoJSON.FeatureCollection, stations: StationData[], selected: string | null, showOld = false): StyleSpecification {
  const paper = css('--paper');
  const paper2 = css('--paper-2');
  const paper3 = css('--paper-3');
  const rule = css('--rule');
  const concrete = css('--concrete');
  const ink = css('--ink');
  const ink3 = css('--ink-3');
  const signal = css('--signal-graphic');
  const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const water = dark ? '#16243d' : '#c9d3d2';
  const green = dark ? '#101c28' : '#dcdccb';
  const font = ['Noto Sans Regular'];
  const points: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: stations
      .filter((s) => s.lat !== null)
      .map((s) => ({ type: 'Feature', properties: { id: s.id, name: s.name, sel: s.id === selected ? 1 : 0, change: s.interchanges.length ? 1 : 0, dropped: s.group === 'dropped' ? 1 : 0 }, geometry: { type: 'Point', coordinates: [s.lng!, s.lat!] } })),
  };
  return {
    version: 8,
    glyphs: MAP_GLYPHS,
    sources: {
      omt: { type: 'vector', url: MAP_TILES, attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
      route: { type: 'geojson', data: alignment },
      stations: { type: 'geojson', data: points },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': paper } },
      { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', paint: { 'fill-color': paper2, 'fill-opacity': 0.7 } },
      { id: 'green', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland', 'wetland']]], paint: { 'fill-color': green } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': green } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': water } },
      { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': water, 'line-width': 1.5 } },
      { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14, paint: { 'fill-color': paper3, 'fill-opacity': 0.8 } },
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary']]], paint: { 'line-color': rule, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 4] } },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': concrete, 'line-opacity': dark ? 0.55 : 0.9, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 16, 9] } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': ink3, 'line-width': 1.2, 'line-dasharray': [3, 2] } },
      { id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14, layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name:latin'], 'text-font': font, 'text-size': 11 }, paint: { 'text-color': ink3, 'text-halo-color': paper, 'text-halo-width': 1.5 } },
      { id: 'place-label', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'suburb', 'village', 'neighbourhood']]], layout: { 'text-field': ['get', 'name:latin'], 'text-font': font, 'text-size': ['match', ['get', 'class'], 'city', 15, 'town', 14, 12], 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: { 'text-color': ink3, 'text-halo-color': paper, 'text-halo-width': 1.5 } },
      // The route an earlier plan had, which the current plan replaces: thin and dashed, off until asked for.
      { id: 'route-old', type: 'line', source: 'route', filter: isPart('superseded'), layout: { visibility: showOld ? 'visible' : 'none' }, paint: { 'line-color': ink3, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 4], 'line-dasharray': [2, 1.5] } },
      // Line 12: hollow orange line = under construction (same grammar as the page).
      { id: 'route-casing', type: 'line', source: 'route', filter: ['!', isPart('superseded', 'underground')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': signal, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 16, 16] } },
      { id: 'route-core', type: 'line', source: 'route', filter: ['!', isPart('superseded', 'underground')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': paper, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.6, 16, 6] } },
      // Underground: gaps cut into the hollow line, so it reads as a dashed outline.
      { id: 'route-tunnel', type: 'line', source: 'route', filter: isPart('underground'), layout: { 'line-cap': 'butt', 'line-join': 'round' }, paint: { 'line-color': paper, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 16, 16], 'line-dasharray': [0.7, 0.6] } },
      { id: 'stations-old', type: 'circle', source: 'stations', filter: ['==', ['get', 'dropped'], 1], layout: { visibility: showOld ? 'visible' : 'none' }, paint: { 'circle-color': ['case', ['==', ['get', 'sel'], 1], ink3, paper], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 16, 8], 'circle-stroke-color': ink3, 'circle-stroke-width': 2 } },
      { id: 'station-old-label', type: 'symbol', source: 'stations', filter: ['==', ['get', 'dropped'], 1], layout: { visibility: showOld ? 'visible' : 'none', 'text-field': ['get', 'name'], 'text-font': font, 'text-size': 11, 'text-offset': [0.9, 0], 'text-anchor': 'left', 'text-optional': true }, paint: { 'text-color': ink3, 'text-halo-color': paper, 'text-halo-width': 2 } },
      { id: 'stations', type: 'circle', source: 'stations', filter: ['==', ['get', 'dropped'], 0], paint: { 'circle-color': ['case', ['==', ['get', 'sel'], 1], signal, ink], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, ['case', ['==', ['get', 'sel'], 1], 7, 4.5], 16, ['case', ['==', ['get', 'sel'], 1], 14, 9]], 'circle-stroke-color': paper, 'circle-stroke-width': 2.5 } },
      { id: 'station-label', type: 'symbol', source: 'stations', filter: ['==', ['get', 'dropped'], 0], layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': ['case', ['==', ['get', 'sel'], 1], 15, 12], 'text-offset': [0.9, 0], 'text-anchor': 'left', 'text-optional': true }, paint: { 'text-color': ink, 'text-halo-color': paper, 'text-halo-width': 2 } },
    ],
  };
}

function loadMapCss(): Promise<void> {
  if (document.querySelector('link[data-maplibre-css]')) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = mapCssUrl;
    link.dataset.maplibreCss = '';
    // Build the map either way: without the sheet only the controls look plain.
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

export async function mount(section: HTMLElement) {
  await loadMapCss();
  const container = section.querySelector<HTMLElement>('[data-map]')!;
  const select = section.querySelector<HTMLSelectElement>('[data-map-select]')!;
  const nameEl = section.querySelector<HTMLElement>('[data-panel-name]')!;
  const coordsEl = section.querySelector<HTMLElement>('[data-panel-coords]')!;
  const bodyEl = section.querySelector<HTMLElement>('[data-panel-body]')!;
  const streetView = section.querySelector<HTMLElement>('[data-street-view]')!;
  const streetLinks = section.querySelector<HTMLElement>('[data-street-links]')!;
  const stations: StationData[] = JSON.parse(section.querySelector('[data-map-stations]')!.textContent!);
  const alignment: GeoJSON.FeatureCollection = JSON.parse(section.querySelector('[data-map-alignment]')!.textContent!);
  const street = JSON.parse(section.querySelector('[data-street-config]')!.textContent!) as { provider: string; mapillary: boolean; google: boolean };
  const oldToggle = section.querySelector<HTMLInputElement>('[data-map-old]');
  let showOld = false;

  // A station page links here as /?station=<id>#map, so the map opens on that station.
  const asked = new URLSearchParams(location.search).get('station');
  const linked = stations.find((s) => s.id === asked && s.lat !== null && s.group !== 'dropped')?.id;
  let selected = linked ?? section.dataset.mapFirst ?? stations.find((s) => s.lat !== null)!.id;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Open on the whole route (the line and any spur), with room east of it for station names.
  const bounds = new maplibregl.LngLatBounds();
  for (const f of alignment.features) {
    if (f.geometry.type !== 'LineString' || ['superseded', 'underground'].includes(f.properties?.part)) continue;
    for (const c of f.geometry.coordinates) bounds.extend(c as [number, number]);
  }
  const map = new maplibregl.Map({
    container,
    style: buildStyle(alignment, stations, selected),
    bounds,
    fitBoundsOptions: { padding: { top: 30, bottom: 30, left: 30, right: 70 } },
    attributionControl: { compact: true },
    cooperativeGestures: true,
    maxZoom: 18,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  // `astro dev` only: lets capture scripts (share images, screen recordings) drive the map.
  if (import.meta.env.DEV) (window as unknown as { __map: maplibregl.Map }).__map = map;

  const setTheme = () => map.setStyle(buildStyle(alignment, stations, selected, showOld), { diff: true });
  function setOld(on: boolean) {
    showOld = on;
    if (oldToggle) oldToggle.checked = on;
    for (const id of ['route-old', 'stations-old', 'station-old-label']) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  }
  oldToggle?.addEventListener('change', () => setOld(oldToggle.checked));
  new MutationObserver(setTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);

  async function showStreet(s: StationData) {
    const lat = s.lat!;
    const lng = s.lng!;
    const links = [
      `<a href="https://www.mapillary.com/app/?lat=${lat}&lng=${lng}&z=17" target="_blank" rel="noopener">Open in Mapillary</a>`,
      `<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}" target="_blank" rel="noopener">Open in Google Street View</a>`,
      `<a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}" target="_blank" rel="noopener">Open in OpenStreetMap</a>`,
    ];
    streetLinks.innerHTML = links.join('');

    if (street.provider === 'google' && GOOGLE_MAPS_KEY) {
      streetView.innerHTML = `<iframe title="Google Street View near ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&location=${lat},${lng}&fov=80"></iframe>`;
      return;
    }
    if (!MAPILLARY_TOKEN) {
      streetView.innerHTML = `<p class="panel__muted">No street-level photo is embedded on this site yet. Use the links below to look around ${esc(s.name)}.</p>`;
      return;
    }
    streetView.innerHTML = `<p class="panel__muted">Looking for the nearest street-level photo...</p>`;
    const d = 0.0018;
    const url = `https://graph.mapillary.com/images?access_token=${encodeURIComponent(MAPILLARY_TOKEN)}&fields=id,captured_at,thumb_1024_url,computed_geometry&bbox=${lng - d},${lat - d},${lng + d},${lat + d}&limit=60`;
    try {
      const r = await fetch(url);
      const { data } = (await r.json()) as { data: { id: string; captured_at: number; thumb_1024_url: string; computed_geometry?: { coordinates: [number, number] } }[] };
      if (!data?.length) throw new Error('none');
      const dist = (c?: [number, number]) => (c ? (c[0] - lng) ** 2 + (c[1] - lat) ** 2 : 1);
      const best = data.sort((a, b) => dist(a.computed_geometry?.coordinates) - dist(b.computed_geometry?.coordinates))[0];
      const when = new Date(best.captured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      streetView.innerHTML = `<figure style="margin:0;width:100%"><img src="${esc(best.thumb_1024_url)}" alt="Street-level photo near ${esc(s.name)}, captured ${when}" loading="lazy" /><figcaption class="panel__muted">Captured ${when}. Photo by Mapillary contributors, CC BY-SA 4.0. <a href="https://www.mapillary.com/app/?pKey=${best.id}" target="_blank" rel="noopener">View on Mapillary</a></figcaption></figure>`;
    } catch {
      streetView.innerHTML = `<p class="panel__muted">No Mapillary photo within about 200 m of ${esc(s.name)} yet. Use the links below.</p>`;
    }
  }

  function select_(id: string, fly = true) {
    const s = stations.find((x) => x.id === id);
    if (!s || s.lat === null) return;
    selected = id;
    select.value = id;
    if (s.group === 'dropped' && !showOld) setOld(true);
    nameEl.textContent = s.name;
    coordsEl.textContent = `${s.lat.toFixed(5)}, ${s.lng!.toFixed(5)} (${s.where})`;
    const rows: string[] = [];
    const own = stations.filter((x) => x.group === s.group);
    const order = s.group === 'dropped' ? 'Dropped: on the earlier plan, not on the current one' : `${s.group === 'spur' ? 'Spur station' : 'Station'} ${s.order} of ${own.length}`;
    rows.push(`<li><span class="panel__label">Order</span>${order}</li>`);
    if (s.interchanges.length) rows.push(`<li><span class="panel__label">Interchange</span>${s.interchanges.map(esc).join(', ')}</li>`);
    if (s.context.length) rows.push(`<li><span class="panel__label">Around the station</span>${s.context.map((c) => `${esc(c.text)} ${gradeHtml(c.status, c.source)}`).join('<br>')}</li>`);
    rows.push(`<li><span class="panel__label">Construction</span>${esc(s.status)}</li>`);
    if (s.note) rows.push(`<li><span class="panel__label">Note</span>${esc(s.note)}</li>`);
    bodyEl.innerHTML = `<ul class="panel__list">${rows.join('')}</ul>`;
    const src = map.getSource('stations') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      const style = buildStyle(alignment, stations, selected, showOld);
      src.setData((style.sources.stations as { data: GeoJSON.FeatureCollection }).data);
    }
    if (fly) map.flyTo({ center: [s.lng!, s.lat] as LngLatLike, zoom: 15.5, duration: reduced ? 0 : 1400, essential: true });
    showStreet(s);
  }

  select.addEventListener('change', () => select_(select.value));
  map.on('click', 'stations', (e: MapLayerMouseEvent) => {
    const id = e.features?.[0]?.properties?.id as string | undefined;
    if (id) select_(id);
  });
  map.on('mouseenter', 'stations', () => (map.getCanvas().style.cursor = 'pointer'));
  map.on('mouseleave', 'stations', () => (map.getCanvas().style.cursor = ''));
  map.once('load', () => select_(selected, Boolean(linked)));
}
