/**
 * Shared Three.js plumbing for the page's 3D scenes.
 *   - One renderer per scene, pixel ratio capped for phones.
 *   - The loop runs only while the scene is on screen and the tab is visible.
 *   - Colours come from the CSS design tokens, so scenes follow the edition theme.
 * All geometry is built in code (flat-shaded planes), so there are no model files to download.
 */
import * as THREE from 'three';

export type Palette = Record<'paper' | 'paper2' | 'paper3' | 'ink' | 'ink3' | 'signal' | 'onSignal' | 'concrete', THREE.Color>;

export function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const c = (name: string) => new THREE.Color(css.getPropertyValue(name).trim() || '#888');
  return {
    paper: c('--paper'),
    paper2: c('--paper-2'),
    paper3: c('--paper-3'),
    ink: c('--ink'),
    ink3: c('--ink-3'),
    signal: c('--signal'),
    onSignal: c('--on-signal'),
    concrete: c('--concrete'),
  };
}

/** Calls fn whenever the edition theme changes (switch button or system setting). */
export function onThemeChange(fn: () => void): () => void {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', fn);
  return () => {
    mo.disconnect();
    mq.removeEventListener('change', fn);
  };
}

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  /** Register a per-frame callback (seconds since start, seconds since last frame). */
  onFrame(fn: (t: number, dt: number) => void): void;
  /** Render one frame now (for still, reduced-motion states). */
  renderOnce(): void;
  setCamera(camera: THREE.Camera, fit: (w: number, h: number) => void): void;
  dispose(): void;
}

export function createStage(host: HTMLElement, { shadows = false, animate = true } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'scene-canvas';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  let camera: THREE.Camera | null = null;
  let fit: (w: number, h: number) => void = () => {};
  const frames: ((t: number, dt: number) => void)[] = [];

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    fit(w, h);
    if (!running) draw(0);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const timer = new THREE.Timer();
  let visible = false;
  let running = false;
  let raf = 0;
  let t = 0;

  const draw = (dt: number) => {
    frames.forEach((f) => f(t, dt));
    if (camera) renderer.render(scene, camera);
  };
  const loop = () => {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    t += dt;
    draw(dt);
    raf = requestAnimationFrame(loop);
  };
  const update = () => {
    const should = animate && visible && document.visibilityState === 'visible';
    if (should && !running) {
      running = true;
      timer.reset();
      raf = requestAnimationFrame(loop);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    update();
  });
  io.observe(host);
  document.addEventListener('visibilitychange', update);

  return {
    renderer,
    scene,
    canvas,
    onFrame: (fn) => frames.push(fn),
    renderOnce: () => draw(0),
    setCamera(cam, fitFn) {
      camera = cam;
      fit = fitFn;
      resize();
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', update);
      renderer.dispose();
      canvas.remove();
    },
  };
}

/** Flat-shaded material: every face reads as one plane of colour, like the isometric drawing. */
export const flat = (color: THREE.ColorRepresentation) => new THREE.MeshLambertMaterial({ color, flatShading: true });

export function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Standard light rig: soft sky fill plus one sun, giving top, side and front three clear tones. */
export function lightRig(scene: THREE.Scene, { shadows = false, span = 120 } = {}): THREE.DirectionalLight {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8278, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.position.set(-40, 90, 60);
  if (shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const c = sun.shadow.camera as THREE.OrthographicCamera;
    c.left = -span;
    c.right = span;
    c.top = span;
    c.bottom = -span;
    c.far = 400;
    sun.shadow.bias = -0.0008;
  }
  scene.add(sun);
  return sun;
}

/**
 * A generic three-car metro train, 3.2 m wide (as the 2019 project report plans),
 * in a livery inspired by the Line 5 train design: deep blue body, orange and brown bands.
 * Length runs along x. Returns the group; its origin is the centre of the train at rail level.
 */
export function buildTrain(cars = 3): THREE.Group {
  const group = new THREE.Group();
  const CAR = 21;
  const GAP = 0.6;
  const W = 3.2;
  const H = 3.7;
  const body = flat('#2a3a8c');
  const glass = flat('#131a2b');
  const orange = flat('#e8742a');
  const brown = flat('#6b4a3c');
  const roof = flat('#c9ccd3');
  const under = flat('#23262d');
  const door = flat('#34479f');

  const total = cars * CAR + (cars - 1) * GAP;
  for (let i = 0; i < cars; i++) {
    const x0 = -total / 2 + i * (CAR + GAP);
    const isHead = i === 0 || i === cars - 1;
    const dir = i === 0 ? -1 : 1;

    // Side profile, extruded across the width. Head cars get a sloped nose.
    const s = new THREE.Shape();
    const nose = isHead ? 1.6 : 0;
    if (isHead && dir === -1) {
      s.moveTo(0, 0.9);
      s.lineTo(CAR, 0.9);
      s.lineTo(CAR, H);
      s.lineTo(nose, H);
      s.lineTo(0, H - 1.3);
    } else if (isHead) {
      s.moveTo(0, 0.9);
      s.lineTo(CAR, 0.9);
      s.lineTo(CAR, H - 1.3);
      s.lineTo(CAR - nose, H);
      s.lineTo(0, H);
    } else {
      s.moveTo(0, 0.9);
      s.lineTo(CAR, 0.9);
      s.lineTo(CAR, H);
      s.lineTo(0, H);
    }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 1 });
    geo.translate(0, 0, -W / 2);
    const car = new THREE.Mesh(geo, body);
    car.position.x = x0;
    car.castShadow = true;
    group.add(car);

    // Bands and windows on both sides.
    for (const side of [-1, 1]) {
      const z = side * (W / 2 + 0.13);
      group.add(box(CAR - (isHead ? 2.2 : 0.4), 0.9, 0.04, glass, x0 + CAR / 2 + (isHead ? -dir * 0.6 : 0), 2.75, z));
      group.add(box(CAR - 0.4, 0.28, 0.04, orange, x0 + CAR / 2, 1.75, z));
      group.add(box(CAR - 0.4, 0.14, 0.04, brown, x0 + CAR / 2, 1.5, z));
      for (const dx of [3.4, 8.3, 12.7, 17.6]) group.add(box(1.4, 2.3, 0.05, door, x0 + dx, 2.2, z));
    }
    group.add(box(CAR - 1.2, 0.35, W - 0.6, roof, x0 + CAR / 2, H + 0.2, 0));
    group.add(box(CAR - 2, 0.6, W - 0.8, under, x0 + CAR / 2, 0.6, 0));
    // Windscreen on the head car's nose.
    if (isHead) {
      const wx = dir === -1 ? x0 + 0.55 : x0 + CAR - 0.55;
      const ws = box(0.1, 1.1, W - 0.9, glass, wx, H - 0.9, 0);
      ws.rotation.z = dir * 0.62;
      group.add(ws);
      group.add(box(0.12, 0.3, W - 0.5, orange, dir === -1 ? x0 - 0.06 : x0 + CAR + 0.06, 1.7, 0));
    }
  }
  return group;
}

/** A texture with large text, drawn in the page's display face (used for the ground "12"). */
export async function textTexture(text: string, color: string, size = 1024): Promise<THREE.CanvasTexture> {
  try {
    await document.fonts.load(`800 400px "Anek Latin Variable"`);
  } catch {
    /* fall back to the system face if the font cannot load */
  }
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const g = cv.getContext('2d')!;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${size * 0.95}px "Anek Latin Variable", sans-serif`;
  (g as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = 'condensed';
  g.fillText(text, size / 2, size * 0.54);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
