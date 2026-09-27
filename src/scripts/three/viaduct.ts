/**
 * Hero scene: an isometric, flat-shaded stretch of the Line 12 viaduct on an orange halftone field,
 * a train gliding along it, and a giant "12" painted on the ground (the Tren Urbano reference).
 * Orthographic camera, so it reads like the drawing it replaces. Original geometry, not an official design.
 */
import * as THREE from 'three';
import { createStage, lightRig, box, flat, buildTrain, textTexture } from './common';

export async function mount(host: HTMLElement, { reduced }: { reduced: boolean }) {
  // The canvas gets its own box above the figure caption; the drawing is hidden once live.
  // The canvas sits exactly over the drawing's box, so swapping them never moves the page.
  const fig = host.querySelector('.lead') ?? host;
  const drawing = fig.querySelector('svg');
  const frame = document.createElement('div');
  frame.className = 'lead-3d';
  fig.prepend(frame);
  if (drawing) {
    const fit = () => (frame.style.height = `${drawing.getBoundingClientRect().height}px`);
    fit();
    new ResizeObserver(fit).observe(drawing);
  }
  const stage = createStage(frame, { shadows: true, animate: !reduced });
  const { scene } = stage;
  lightRig(scene, { shadows: true, span: 110 });

  // Orange field with newsprint halftone dots.
  const dots = document.createElement('canvas');
  dots.width = dots.height = 32;
  const g = dots.getContext('2d')!;
  g.fillStyle = '#f26b1d';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = 'rgba(12,20,34,0.22)';
  g.beginPath();
  g.arc(16, 16, 3.2, 0, Math.PI * 2);
  g.fill();
  const dotTex = new THREE.CanvasTexture(dots);
  dotTex.wrapS = dotTex.wrapT = THREE.RepeatWrapping;
  dotTex.repeat.set(160, 160);
  dotTex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ map: dotTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road under the viaduct, with lane marks.
  const road = new THREE.Mesh(new THREE.PlaneGeometry(800, 22), flat('#1a2233'));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  road.receiveShadow = true;
  scene.add(road);
  const mark = flat('#efe9de');
  for (let x = -300; x < 300; x += 14) {
    for (const z of [-5.5, 5.5]) {
      const m = box(7, 0.05, 0.5, mark, x, 0.05, z);
      m.castShadow = false;
      scene.add(m);
    }
  }

  // The giant "12", painted flat on the field in front of the road.
  const tex = await textTexture('12', '#0c1422');
  const twelve = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 46),
    new THREE.MeshLambertMaterial({ map: tex, transparent: true }),
  );
  twelve.rotation.x = -Math.PI / 2;
  twelve.position.set(-8, 0.04, 36);
  twelve.receiveShadow = true;
  scene.add(twelve);

  // Piers, pier caps and the U-girder deck.
  const con = flat('#c9c1b4');
  for (let x = -300; x <= 300; x += 28) {
    scene.add(box(2.4, 12.4, 2.4, con, x, 6.2, 0));
    scene.add(box(4.8, 1.4, 9.4, con, x, 13.1, 0));
  }
  scene.add(box(600, 2, 9, con, 0, 14.8, 0));
  scene.add(box(600, 1.3, 0.6, con, 0, 16.4, -4.2));
  scene.add(box(600, 1.3, 0.6, con, 0, 16.4, 4.2));

  // The train.
  const train = buildTrain(3);
  train.position.set(0, 15.8, 1.8);
  scene.add(train);

  // Isometric-style orthographic camera: the line runs bottom-left to top-right.
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  cam.position.set(-150, 150, 225);
  cam.lookAt(0, 8, 10);
  stage.setCamera(cam, (w, h) => {
    const view = 70; // world units visible vertically
    const aspect = w / h;
    cam.left = (-view * aspect) / 2;
    cam.right = (view * aspect) / 2;
    cam.top = view / 2;
    cam.bottom = -view / 2;
    cam.updateProjectionMatrix();
  });

  // The train glides across and re-enters from the far end, out of frame.
  const SPEED = 9; // m/s, a calm glide rather than a real service speed
  const SPAN = 260;
  let x = -40;
  stage.onFrame((_t, dt) => {
    x += SPEED * dt;
    if (x > SPAN / 2) x = -SPAN / 2;
    train.position.x = x;
  });
  stage.renderOnce();
  host.classList.add('is-live');
  return stage;
}
