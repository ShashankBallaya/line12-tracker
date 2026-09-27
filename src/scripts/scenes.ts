/**
 * Lazy loader for heavy page parts. Nothing here downloads until its section is near the viewport:
 *   [data-map-section]  MapLibre alignment map (src/scripts/map.ts)
 *   [data-scene=name]   Three.js scenes (src/scripts/three/<name>.ts), only when WebGL is available
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webgl(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function whenNear(el: Element, run: () => void, margin = '600px') {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { rootMargin: margin },
  );
  io.observe(el);
}

const mapSection = document.querySelector<HTMLElement>('[data-map-section]');
if (mapSection && webgl()) {
  whenNear(mapSection, () => import('./map').then((m) => m.mount(mapSection)).catch((e) => console.error('Map failed to load', e)));
}

const sceneLoaders: Record<string, () => Promise<{ mount: (host: HTMLElement, opts: { reduced: boolean }) => unknown }>> = {
  viaduct: () => import('./three/viaduct'),
};

if (webgl()) {
  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((host) => {
    const load = sceneLoaders[host.dataset.scene ?? ''];
    if (!load) return;
    whenNear(host, () => load().then((m) => m.mount(host, { reduced })).catch((e) => console.error('3D scene failed to load', e)), '300px');
  });
}
