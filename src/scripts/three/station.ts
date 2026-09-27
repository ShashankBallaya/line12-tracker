/**
 * The station fly-around: an original, flat-shaded model of a typical Line 12 elevated station
 * over Kalyan-Shilphata Road, set in a grey line-drawn street (the MASP reference) with only the
 * line itself in colour. Proportions follow the published description (about 145 m long, 17 m bays,
 * concourse on cantilever arms, platforms above, cantilevered roof, 21 to 23 m high).
 * Not an official design. The camera is driven by scroll progress from motion.ts ('station-progress').
 */
import * as THREE from 'three';
import { createStage, lightRig, box, flat, buildTrain, readPalette, onThemeChange } from './common';

const LEN = 144.8;
// Pier grid from the published elevation: 11.95 m end bays, 17 m bays, 8.5 m either side of centre.
const BAYS = [0.95, 11.95, 17, 17, 17, 8.5, 8.5, 17, 17, 17, 11.95];

/** Seeded random, so the cladding pattern is the same on every visit. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/** Facade cladding: warm panels with a scatter of dark rectangles, a pattern of our own. */
function claddingTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 128;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#ece4d3';
  g.fillRect(0, 0, w, h);
  const r = rng(12);
  for (let i = 0; i < 180; i++) {
    const rw = 10 + r() * 34;
    const rh = 5 + r() * 10;
    g.fillStyle = r() > 0.7 ? '#3b4252' : '#1e2533';
    g.fillRect(Math.floor(r() * (w - rw)), Math.floor(r() * (h - rh)), rw, rh);
  }
  g.fillStyle = '#5a4336';
  g.fillRect(0, 0, w, 6);
  g.fillRect(0, h - 6, w, 6);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  t.anisotropy = 4;
  return t;
}

export async function mount(host: HTMLElement, { reduced }: { reduced: boolean }) {
  const stage = createStage(host, { shadows: true, animate: !reduced });
  const { scene } = stage;
  const sun = lightRig(scene, { shadows: true, span: 130 });
  sun.position.set(-70, 110, 80);

  const pal = readPalette();
  // Street context in greys (line-drawn look): surfaces plus edge lines.
  const groundMat = flat(pal.paper2);
  const roadMat = flat(pal.paper3);
  const kerbMat = flat(pal.concrete);
  // Context buildings read as a line drawing: faint fill, drawn edges (the MASP reference).
  const blockMat = new THREE.MeshLambertMaterial({ color: pal.paper, transparent: true, opacity: 0.35, depthWrite: false });
  const edgeMat = new THREE.LineBasicMaterial({ color: pal.ink3, transparent: true, opacity: 0.7 });

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(box(1400, 0.1, 34, roadMat, 0, 0.05, 0)); // carriageways
  scene.add(box(1400, 0.35, 3.2, kerbMat, 0, 0.17, 0)); // median
  for (const z of [-20.5, 20.5]) scene.add(box(1400, 0.3, 6, kerbMat, 0, 0.15, z)); // footpaths
  const markMat = flat(pal.paper);
  for (let x = -600; x < 600; x += 12) for (const z of [-9, 9]) {
    const m = box(6, 0.04, 0.35, markMat, x, 0.12, z);
    m.castShadow = false;
    scene.add(m);
  }

  // Buildings along both sides: simple blocks with drawn edges.
  const r = rng(7);
  const blocks = new THREE.Group();
  for (const side of [-1, 1]) {
    for (let x = -400; x < 400; ) {
      const w = 12 + r() * 26;
      const d = 14 + r() * 20;
      const h = 6 + r() * (r() > 0.85 ? 34 : 16);
      const b = box(w, h, d, blockMat, x + w / 2, h / 2, side * (26 + d / 2 + r() * 6));
      b.castShadow = false;
      blocks.add(b);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), edgeMat);
      edges.position.copy(b.position);
      blocks.add(edges);
      x += w + 3 + r() * 8;
    }
  }
  scene.add(blocks);

  // ---- The line: viaduct either side, the station in the middle ----
  const con = flat('#cfc7ba');
  for (let x = -600; x <= 600; x += 28) {
    if (Math.abs(x) < LEN / 2 + 4) continue;
    scene.add(box(2.4, 13.6, 2.4, con, x, 6.8, 0));
    scene.add(box(4.6, 1.4, 9.6, con, x, 14.2, 0));
  }
  for (const s of [-1, 1]) {
    const len = 600 - LEN / 2;
    const cx = s * (LEN / 2 + len / 2);
    scene.add(box(len, 2, 9.2, con, cx, 15.9, 0));
    scene.add(box(len, 1.3, 0.6, con, cx, 17.5, -4.3));
    scene.add(box(len, 1.3, 0.6, con, cx, 17.5, 4.3));
  }

  const station = new THREE.Group();
  // Piers on the median with wide cantilever arms carrying the concourse.
  let x = -LEN / 2;
  const pierXs: number[] = [];
  for (const bay of BAYS) {
    x += bay;
    pierXs.push(x);
  }
  for (const px of pierXs.slice(0, -1)) {
    station.add(box(2.6, 9, 2.6, con, px, 4.5, 0));
    station.add(box(2.6, 1.6, 22, con, px, 8.6, 0)); // cantilever arm
  }
  // Concourse: clad band, 9.4 m to 14.6 m.
  const clad = claddingTexture();
  const cladMat = new THREE.MeshLambertMaterial({ map: clad, flatShading: true });
  const concourseSide = new THREE.MeshLambertMaterial({ color: '#d8cfbd', flatShading: true });
  const concourse = new THREE.Mesh(new THREE.BoxGeometry(LEN, 5.2, 21), [concourseSide, concourseSide, concourseSide, concourseSide, cladMat, cladMat]);
  concourse.position.set(0, 12, 0);
  concourse.castShadow = concourse.receiveShadow = true;
  station.add(concourse);
  station.add(box(LEN + 0.6, 0.8, 21.6, flat('#5a4336'), 0, 9.3, 0));
  // Central gateway: the orange arch that marks the entrance, on both faces.
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 21.8, 40, 1, false, 0, Math.PI), flat(pal.signal));
  arch.rotation.x = Math.PI / 2;
  arch.rotation.z = Math.PI / 2;
  arch.position.set(0, 14.6, 0);
  station.add(arch);

  // Platform level: glazed band with mullions, 14.6 m to 20.6 m.
  const glass = new THREE.MeshLambertMaterial({ color: '#1b2638', transparent: true, opacity: 0.82 });
  station.add(box(LEN - 2, 6, 19.4, glass, 0, 17.6, 0));
  const mull = flat('#e9e3d6');
  for (let mx = -LEN / 2 + 2; mx <= LEN / 2 - 2; mx += 4.25) for (const z of [-9.75, 9.75]) station.add(box(0.35, 6, 0.3, mull, mx, 17.6, z));
  station.add(box(LEN - 2, 0.9, 19.8, con, 0, 15.1, 0)); // platform slab edge
  // Cantilevered roof, reaching about 22.5 m.
  station.add(box(LEN + 6, 0.9, 27, flat('#e8e1d3'), 0, 21.9, 0));
  station.add(box(LEN + 6.2, 0.35, 27.2, flat('#5a4336'), 0, 21.35, 0));
  // Four street entries: stairs down to the footpaths on both sides.
  const stairMat = flat('#bfb6a7');
  for (const ex of [-52, 50]) for (const side of [-1, 1]) {
    const st = box(4, 0.8, 16, stairMat, ex, 5.4, side * 17.5);
    st.rotation.x = side * 0.62;
    station.add(st);
    station.add(box(4.6, 3.2, 4.6, flat('#e8e1d3'), ex, 1.6, side * 23.5)); // street landing
  }
  scene.add(station);

  // A train waiting at the platform.
  const train = buildTrain(3);
  train.position.set(-6, 15.6, 2.4);
  scene.add(train);

  const retheme = () => {
    const p = readPalette();
    groundMat.color.copy(p.paper2);
    roadMat.color.copy(p.paper3);
    kerbMat.color.copy(p.concrete);
    blockMat.color.copy(p.paper);
    markMat.color.copy(p.paper);
    edgeMat.color.copy(p.ink3);
    (arch.material as THREE.MeshLambertMaterial).color.copy(p.signal);
    stage.renderOnce();
  };
  onThemeChange(retheme);

  // ---- Camera path, driven by scroll progress (0 to 1) ----
  // A spline through four viewpoints, all kept over the road so the camera never enters a building:
  // high aerial, alongside the station, under the concourse, then street level looking up.
  const cam = new THREE.PerspectiveCamera(34, 1, 1, 2400);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-190, 150, 170),
    new THREE.Vector3(-150, 42, 16),
    new THREE.Vector3(-30, 7, 13),
    new THREE.Vector3(150, 3.2, 11),
  ]);
  const looks = [new THREE.Vector3(0, 8, 0), new THREE.Vector3(0, 13, 0), new THREE.Vector3(20, 13, 0), new THREE.Vector3(-10, 16, 0)];
  const target = new THREE.Vector3();
  const place = (p: number) => {
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // ease in-out
    cam.position.copy(path.getPoint(e));
    const f = e * (looks.length - 1);
    const i = Math.min(Math.floor(f), looks.length - 2);
    target.lerpVectors(looks[i], looks[i + 1], f - i);
    cam.lookAt(target);
  };
  let progress = reduced ? 0.42 : 0;
  let shown = -1;
  place(progress);
  stage.setCamera(cam, (w, h) => {
    cam.aspect = w / h;
    cam.fov = w / h < 1 ? 52 : 34; // phones: wider lens to keep the station in frame
    cam.updateProjectionMatrix();
  });

  // Smoothly follow the scroll position.
  let goal = progress;
  window.addEventListener('station-progress', (e) => (goal = (e as CustomEvent<number>).detail));
  stage.onFrame((_t, dt) => {
    progress += (goal - progress) * Math.min(1, dt * 6);
    if (Math.abs(progress - shown) > 0.0005) {
      place(progress);
      shown = progress;
    }
  });
  stage.renderOnce();
  host.classList.add('is-live');
  return stage;
}
