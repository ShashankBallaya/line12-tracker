/**
 * The station fly-around: an original, flat-shaded model of a typical Line 12 elevated station
 * over Kalyan-Shilphata Road, set in a grey line-drawn street (the MASP reference) with only the
 * line itself in colour. Proportions and parts follow the published Dombivli elevation (about
 * 145 m long, 17 m bays, a branched-frame concourse on cantilever arms, a V-framed central bay with
 * a semicircle, louvred platform level, dark cantilevered roof, 21 to 23 m high), drawn in our own
 * flat style. The drawing itself, and its mural, are not reproduced. Not an official design. The camera is driven by scroll progress from motion.ts ('station-progress').
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

/** Units of the concourse frame pattern: four branched arches to each 17 m bay. */
const FRAME_UNIT = 4.25;
const FRAMES_PER_TILE = 8;

/**
 * Concourse cladding: warm panels crossed by branched frames, each a stem that splits into two
 * arcs meeting its neighbours, as the elevation shows. Drawn by us; no part of the drawing is used.
 */
function claddingTexture(): THREE.CanvasTexture {
  const unit = 128;
  const w = unit * FRAMES_PER_TILE;
  const h = 256;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#e4d3a8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5a4336';
  g.lineWidth = 7;
  g.lineCap = 'round';
  for (let i = 0; i < FRAMES_PER_TILE; i++) {
    const cx = i * unit + unit / 2;
    const fork = h * 0.58;
    g.beginPath();
    g.moveTo(cx, h);
    g.lineTo(cx, fork);
    g.quadraticCurveTo(cx, h * 0.12, i * unit, h * 0.1);
    g.moveTo(cx, fork);
    g.quadraticCurveTo(cx, h * 0.12, (i + 1) * unit, h * 0.1);
    g.stroke();
  }
  g.fillStyle = '#5a4336';
  g.fillRect(0, 0, w, 10);
  g.fillRect(0, h - 10, w, 10);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(LEN / (FRAME_UNIT * FRAMES_PER_TILE), 1);
  t.anisotropy = 4;
  return t;
}

/** A flat panel from an outline in the x-y plane, given a small depth. */
function panel(points: [number, number][], depth: number, mat: THREE.Material): THREE.Mesh {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** A straight member of a given thickness between two points in the x-y plane. */
function member(x1: number, y1: number, x2: number, y2: number, t: number, depth: number, mat: THREE.Material): THREE.Mesh {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const m = box(len, t, depth, mat, (x1 + x2) / 2, (y1 + y2) / 2, 0);
  m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  return m;
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
  // An open lot faces the station on the +z side, so the camera can see its front.
  const OPEN_LOT = 80;
  for (const side of [-1, 1]) {
    for (let x = -400; x < 400; ) {
      const w = 12 + r() * 26;
      if (side > 0 && x + w > -OPEN_LOT && x < OPEN_LOT) {
        x += w + 3;
        continue;
      }
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
  // Levels, read off the elevation's scale (bottom band to roof), rounded to 0.1 m.
  const BAND = [10.6, 12.2]; // dark base band under the concourse
  const CONC = [12.2, 15.8]; // concourse cladding
  const RAIL = [15.8, 16.8]; // railing band at platform floor
  const PLAT = [16.8, 21.2]; // platform level: louvres and roof columns
  const ROOF = 21.2; // roof underside; the roof tops out near 22.1 m
  const D = 21; // depth of the station box across the road
  const mid = (r: number[]) => (r[0] + r[1]) / 2;
  const tall = (r: number[]) => r[1] - r[0];
  const brown = flat('#5a4336');
  const darkBrown = flat('#3a2c25');

  for (const px of pierXs.slice(0, -1)) {
    station.add(box(2.6, BAND[0] - 0.4, 2.6, con, px, (BAND[0] - 0.4) / 2, 0));
    station.add(box(2.6, 1.2, D + 1, con, px, BAND[0] - 0.4, 0)); // cantilever arm under the concourse
  }
  station.add(box(LEN + 0.6, tall(BAND), D + 0.6, brown, 0, mid(BAND), 0));
  const cladMat = new THREE.MeshLambertMaterial({ map: claddingTexture(), flatShading: true });
  const concourseSide = new THREE.MeshLambertMaterial({ color: '#d8c9a2', flatShading: true });
  const concourse = new THREE.Mesh(new THREE.BoxGeometry(LEN, tall(CONC), D), [concourseSide, concourseSide, concourseSide, concourseSide, cladMat, cladMat]);
  concourse.position.set(0, mid(CONC), 0);
  concourse.castShadow = concourse.receiveShadow = true;
  station.add(concourse);
  station.add(box(LEN + 0.4, tall(RAIL), D + 0.4, darkBrown, 0, mid(RAIL), 0));

  // Platform level: a dark glazed volume behind louvres, columns on every grid line.
  const glass = new THREE.MeshLambertMaterial({ color: '#1b2638', transparent: true, opacity: 0.82 });
  station.add(box(LEN - 2, tall(PLAT), D - 2, glass, 0, mid(PLAT), 0));
  const cream = flat('#ece5d6');
  const faceZ = D / 2 - 0.6;
  for (const y of [17.9, 18.9, 19.9]) for (const s of [-1, 1]) station.add(box(LEN - 1, 0.2, 0.3, cream, 0, y, s * faceZ));
  const colMat = flat('#d9d2c4');
  for (const px of pierXs) for (const s of [-1, 1]) station.add(box(0.45, tall(PLAT), 0.45, colMat, px - 0.45, mid(PLAT), s * faceZ));
  // Cross-bracing in the two end bays.
  const endBays: [number, number][] = [
    [pierXs[0], pierXs[1]],
    [pierXs[pierXs.length - 2], pierXs[pierXs.length - 1]],
  ];
  for (const [a, b] of endBays) for (const s of [-1, 1]) {
    for (const [y1, y2] of [[PLAT[0], ROOF], [ROOF, PLAT[0]]]) {
      const m = member(a, y1, b, y2, 0.3, 0.3, colMat);
      m.position.z = s * (faceZ + 0.2);
      station.add(m);
    }
  }

  // Roof: dark sheet on a grey gutter, cantilevered past both ends and both faces.
  station.add(box(LEN + 6.2, 0.4, D + 6.2, flat('#8e939b'), 0, ROOF + 0.2, 0));
  station.add(box(LEN + 6, 0.5, D + 6, flat('#2b2f36'), 0, ROOF + 0.65, 0));

  // The central bay (grid 04 to 07, 51 m): a V-shaped frame drops from the platform floor to the
  // base band; above it a pale perforated screen rises to the roof; a semicircle stands over a
  // plain name plate. The elevation's mural is not reproduced.
  const C = 25.5; // grid 04 and 07 sit 25.5 m either side of the centre line
  const V = 12.5; // where the V meets the base band
  const screenMat = flat('#efe4bd');
  const discMat = flat('#6d7179');
  const rimMat = flat(pal.signal);
  const plateMat = flat('#d4d6d9');
  for (const s of [-1, 1]) {
    const face = new THREE.Group();
    face.add(panel([[-C, ROOF], [C, ROOF], [C, RAIL[1]], [V, BAND[1]], [-V, BAND[1]], [-C, RAIL[1]]], 0.3, screenMat));
    for (const dir of [-1, 1]) face.add(member(dir * C, RAIL[1], dir * V, BAND[1], 1.0, 0.5, darkBrown));
    face.add(box(2 * V + 1, 0.9, 0.5, darkBrown, 0, BAND[1] + 0.2, 0));
    face.add(box(12, 1.1, 0.4, plateMat, 0, 13.4, 0.35)); // name plate
    const disc = new THREE.Mesh(new THREE.CircleGeometry(6.6, 48, 0, Math.PI), discMat);
    disc.position.set(0, 14.1, 0.36);
    face.add(disc);
    const rim = new THREE.Mesh(new THREE.RingGeometry(6.6, 7.3, 48, 1, 0, Math.PI), rimMat);
    rim.position.set(0, 14.1, 0.37);
    face.add(rim);
    // Scalloped edge: small paper-coloured dots around the rim.
    for (let k = 1; k < 18; k++) {
      const a = (k / 18) * Math.PI;
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), plateMat);
      dot.position.set(Math.cos(a) * 6.95, 14.1 + Math.sin(a) * 6.95, 0.38);
      face.add(dot);
    }
    // Face groups are built facing +z; the far face is turned round.
    face.position.z = s * (D / 2 + 0.05);
    if (s < 0) face.rotation.y = Math.PI;
    station.add(face);
  }

  // Four street entries: stairs down to the footpaths on both sides.
  const stairMat = flat('#bfb6a7');
  for (const ex of [-52, 50]) for (const side of [-1, 1]) {
    const st = box(4, 0.8, 16, stairMat, ex, 5.8, side * 17.5);
    st.rotation.x = side * 0.62;
    station.add(st);
    station.add(box(4.6, 3.2, 4.6, flat('#e8e1d3'), ex, 1.6, side * 23.5)); // street landing
  }
  scene.add(station);

  // A train waiting at the platform, level with the viaduct deck.
  const train = buildTrain(3);
  train.position.set(-6, RAIL[1] + 0.1, 2.4);
  scene.add(train);

  const retheme = () => {
    const p = readPalette();
    groundMat.color.copy(p.paper2);
    roadMat.color.copy(p.paper3);
    kerbMat.color.copy(p.concrete);
    blockMat.color.copy(p.paper);
    markMat.color.copy(p.paper);
    edgeMat.color.copy(p.ink3);
    rimMat.color.copy(p.signal);
    stage.renderOnce();
  };
  onThemeChange(retheme);

  // ---- Camera path, driven by scroll progress (0 to 1) ----
  // A spline through four viewpoints, kept over the road or the open lot so the camera never
  // enters a building: high aerial, the front of the central bay from the open lot, under the
  // concourse, then street level looking up.
  const cam = new THREE.PerspectiveCamera(34, 1, 1, 2400);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-190, 150, 170),
    new THREE.Vector3(-42, 16, 78),
    new THREE.Vector3(-30, 7, 13),
    new THREE.Vector3(150, 3.2, 11),
  ]);
  const looks = [new THREE.Vector3(0, 8, 0), new THREE.Vector3(-4, 15, 0), new THREE.Vector3(20, 13, 0), new THREE.Vector3(-10, 16, 0)];
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
