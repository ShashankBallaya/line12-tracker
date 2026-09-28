/**
 * Lazy loader for heavy page parts. Nothing here downloads until its section is near the viewport:
 *   [data-map-section]  MapLibre alignment map (src/scripts/map.ts)
 *   [data-scene=name]   Three.js scenes (src/scripts/three/<name>.ts), only when WebGL is available
 *   [data-x-show]       X's embed script, only when a reader asks for one full post in Updates
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

// ---------- X posts: the script loads on the first "Show full post", never before ----------
type Twttr = { widgets: { createTweet: (id: string, el: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLElement | undefined> } };
let twttr: Promise<Twttr> | null = null;
function loadX(): Promise<Twttr> {
  twttr ??= new Promise<Twttr>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://platform.twitter.com/widgets.js';
    s.async = true;
    s.onload = () => {
      const x = (window as unknown as { twttr?: Twttr }).twttr;
      if (x) resolve(x);
      else reject(new Error('X script ran without twttr'));
    };
    s.onerror = () => reject(new Error('X script blocked'));
    document.head.appendChild(s);
  }).catch((e) => {
    twttr = null; // a later click tries again
    throw e;
  });
  return twttr;
}

document.addEventListener('click', async (event) => {
  const btn = (event.target as Element).closest<HTMLButtonElement>('[data-x-show]');
  if (!btn) return;
  const box = document.getElementById(btn.getAttribute('aria-controls')!)!;
  const label = btn.querySelector('[data-x-label]')!;
  const open = btn.getAttribute('aria-expanded') === 'true';
  // Opening and closing always work, even while X is still rendering.
  btn.setAttribute('aria-expanded', String(!open));
  label.textContent = open ? 'Show full post' : 'Hide full post';
  box.hidden = open;
  if (open || box.dataset.state === 'loading' || box.dataset.state === 'done') return;

  box.dataset.state = 'loading';
  btn.setAttribute('aria-busy', 'true');
  box.innerHTML = '<p class="post__fail">Loading the post from X.</p>';
  // The embed renders in the edition the reader has now.
  const t = document.documentElement.dataset.theme;
  const dark = t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches);
  try {
    const x = await loadX();
    box.textContent = '';
    const el = await x.widgets.createTweet(btn.dataset.xShow!, box, { theme: dark ? 'dark' : 'light', dnt: true, conversation: 'none', align: 'left' });
    if (!el) throw new Error('post unavailable');
    box.dataset.state = 'done';
  } catch {
    delete box.dataset.state; // closing and opening again retries
    box.innerHTML = '<p class="post__fail">X did not load this post. This browser may block X, or the post may be deleted. Use Open on X.</p>';
  } finally {
    btn.removeAttribute('aria-busy');
  }
});

const sceneLoaders: Record<string, () => Promise<{ mount: (host: HTMLElement, opts: { reduced: boolean }) => unknown }>> = {
  viaduct: () => import('./three/viaduct'),
  station: () => import('./three/station'),
};

/** Runs fn once the page has loaded and the browser is idle, so 3D never competes with first paint. */
function afterIdle(fn: () => void, timeout = 2500) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 600));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

if (webgl()) {
  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((host) => {
    const load = sceneLoaders[host.dataset.scene ?? ''];
    if (!load) return;
    const mount = () => load().then((m) => m.mount(host, { reduced })).catch((e) => console.error('3D scene failed to load', e));
    // The hero is on screen at load. Wide screens: load after idle. Phones: load on the first
    // scroll or touch, so the 3D never slows the first paint on a mobile connection.
    if (host.dataset.scene === 'viaduct' && window.matchMedia('(max-width: 47.99rem)').matches) {
      const once = () => {
        ['scroll', 'touchstart', 'pointerdown'].forEach((t) => window.removeEventListener(t, once));
        whenNear(host, mount, '300px');
      };
      ['scroll', 'touchstart', 'pointerdown'].forEach((t) => window.addEventListener(t, once, { passive: true, once: true }));
    } else if (host.dataset.scene === 'viaduct') afterIdle(() => whenNear(host, mount, '300px'));
    else whenNear(host, mount, '300px');
  });
}

export {};
