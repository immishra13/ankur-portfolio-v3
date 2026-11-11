// Ankur Mishra — portfolio v4.0 "Living Model".
// A REAL 3D model avatar (Three.js, procedural, styled like his illustrated
// avatar: cream Madhubani kurta, magenta dhoti, yellow paag). No video:
// the model itself waves, walks, points, flexes and dances — all code.
// Exposes window.Avatar3D and dispatches 'avatar3d-ready' when the first
// frame has rendered. app.js (classic script) talks to it through that
// event + window.Avatar3D guards.
import * as THREE from "three";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// ---------- Canvas textures (kurta + paag) ----------
function kurtaTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#f2e3c2"; g.fillRect(0, 0, 512, 512);
  // Subtle vertical folds.
  g.strokeStyle = "rgba(160,120,60,0.10)"; g.lineWidth = 5;
  for (const x of [70, 150, 360, 440]) {
    g.beginPath(); g.moveTo(x, 90); g.lineTo(x, 512); g.stroke();
  }
  // Big circular Madhubani neckline design, centred on the FRONT (u=0.5 ->
  // canvas x=256; the torso mesh is rotated PI so this faces the camera).
  const cx = 256, cy = 96;
  const rings = [["#e8590c", 150], ["#d6336c", 128], ["#f59e0b", 104], ["#2b8a6d", 80], ["#e8590c", 56]];
  for (const [col, r] of rings) {
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fillStyle = col; g.globalAlpha = 0.92; g.fill(); g.globalAlpha = 1;
  }
  // Sun rays inside the design.
  g.strokeStyle = "#f7ead0"; g.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60);
    g.lineTo(cx + Math.cos(a) * 148, cy + Math.sin(a) * 148);
    g.stroke();
  }
  // Small fish swimming around the design.
  const fish = (x, y, s, col) => {
    g.fillStyle = col;
    g.beginPath(); g.ellipse(x, y, 26 * s, 12 * s, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - 22 * s, y); g.lineTo(x - 38 * s, y - 12 * s);
    g.lineTo(x - 38 * s, y + 12 * s); g.closePath(); g.fill();
    g.fillStyle = "#222";
    g.beginPath(); g.arc(x + 14 * s, y - 3 * s, 2.5 * s, 0, Math.PI * 2); g.fill();
  };
  fish(90, 120, 1, "#2b8a6d"); fish(422, 120, 1, "#2b8a6d");
  fish(120, 210, 0.8, "#d6336c"); fish(392, 210, 0.8, "#d6336c");
  // Centre placket + buttons.
  g.strokeStyle = "#c98f2e"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(256, 150); g.lineTo(256, 330); g.stroke();
  g.fillStyle = "#8a5a2b";
  for (const y of [180, 230, 280]) {
    g.beginPath(); g.arc(256, y, 9, 0, Math.PI * 2); g.fill();
  }
  // Hem border: diamonds across the bottom.
  const cols = ["#2b8a6d", "#e8590c", "#d6336c", "#f59e0b", "#3b6fd4"];
  for (let i = 0; i < 16; i++) {
    const x = 16 + i * 32;
    g.fillStyle = cols[i % cols.length];
    g.beginPath();
    g.moveTo(x, 462); g.lineTo(x + 14, 478); g.lineTo(x, 494); g.lineTo(x - 14, 478);
    g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function paagTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#f5d76e"; g.fillRect(0, 0, 512, 128);
  // Diamond borders, top and bottom.
  const cols = ["#2b8a6d", "#e8590c", "#d6336c", "#f59e0b", "#3b6fd4"];
  for (const y of [10, 108]) {
    for (let i = 0; i < 16; i++) {
      const x = 16 + i * 32;
      g.fillStyle = cols[(i + (y > 50 ? 2 : 0)) % cols.length];
      g.beginPath();
      g.moveTo(x, y); g.lineTo(x + 11, y + 9); g.lineTo(x, y + 18); g.lineTo(x - 11, y + 9);
      g.closePath(); g.fill();
    }
  }
  // Fish across the middle.
  const fish = (x, col) => {
    g.fillStyle = col;
    g.beginPath(); g.ellipse(x, 64, 34, 16, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - 30, 64); g.lineTo(x - 52, 48);
    g.lineTo(x - 52, 80); g.closePath(); g.fill();
    g.fillStyle = "#222";
    g.beginPath(); g.arc(x + 18, 60, 3, 0, Math.PI * 2); g.fill();
  };
  fish(80, "#e8590c"); fish(210, "#2b8a6d"); fish(340, "#d6336c"); fish(460, "#e8590c");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

// ---------- Materials ----------
const M = {
  skin: new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: 0.75 }),
  skinDark: new THREE.MeshStandardMaterial({ color: 0x6b4429, roughness: 0.8 }),
  kurta: new THREE.MeshStandardMaterial({ map: kurtaTexture(), roughness: 0.85 }),
  kurtaPlain: new THREE.MeshStandardMaterial({ color: 0xf2e3c2, roughness: 0.85 }),
  dhoti: new THREE.MeshStandardMaterial({ color: 0xc2275f, roughness: 0.8 }),
  paag: new THREE.MeshStandardMaterial({ map: paagTexture(), roughness: 0.8 }),
  jutti: new THREE.MeshStandardMaterial({ color: 0xe8d9b0, roughness: 0.7 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.6 }),
  white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  mouth: new THREE.MeshStandardMaterial({ color: 0x7a2e22, roughness: 0.6 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.85 }),
};

// ---------- Character build ----------
// Facing +Z (toward the camera). His right hand is on the viewer's left (-X).
// Arms hang down -Y from shoulder pivots; legs hang down -Y from hip pivots.
function buildCharacter() {
  const root = new THREE.Group();       // position.x = walk, rotation.y = turn
  const body = new THREE.Group();       // bob (walk / dance bounce)
  root.add(body);

  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  body.add(pelvis);

  // Kurta: one tapered cylinder, shoulders -> knees. Rotated PI so the
  // painted neckline (canvas x=256, u=0.5) faces the camera (+Z).
  const kurta = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20, 0.27, 0.85, 24), M.kurta);
  kurta.position.y = 0.35;
  kurta.rotation.y = Math.PI;
  kurta.castShadow = true;
  pelvis.add(kurta);

  // Dhoti band under the kurta hem.
  const dhotiBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.27, 0.32, 24), M.dhoti);
  dhotiBand.position.y = -0.10;
  dhotiBand.castShadow = true;
  pelvis.add(dhotiBand);

  // ---- Head ----
  const neck = new THREE.Group();
  neck.position.y = 0.80;
  pelvis.add(neck);
  const head = new THREE.Group();
  head.position.y = 0.06;
  neck.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 24), M.skin);
  skull.castShadow = true;
  head.add(skull);

  // Ears.
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), M.skin);
    ear.scale.set(0.5, 1, 0.8);
    ear.position.set(0.155 * s, 0, 0);
    head.add(ear);
  }
  // Eyes: white + pupil, sitting on the sphere surface.
  const eyeY = 0.02, eyeX = 0.058;
  for (const s of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), M.white);
    white.scale.set(1, 1, 0.45);
    white.position.set(eyeX * s, eyeY, 0.138);
    head.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 10), M.dark);
    pupil.position.set(eyeX * s, eyeY, 0.162);
    head.add(pupil);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.012), M.hair);
    brow.position.set(eyeX * s, 0.062, 0.146);
    brow.rotation.z = -0.10 * s;
    head.add(brow);
  }
  // Nose + mustache + beard + mouths.
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 10), M.skinDark);
  nose.scale.set(0.8, 1.2, 0.8);
  nose.position.set(0, -0.022, 0.15);
  head.add(nose);
  for (const s of [-1, 1]) {
    const mo = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.055, 8), M.hair);
    mo.rotation.z = Math.PI / 2 + 0.35 * s;
    mo.position.set(0.032 * s, -0.058, 0.146);
    head.add(mo);
  }
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), M.hair);
  beard.scale.set(1, 0.62, 0.72);
  beard.position.set(0, -0.095, 0.045);
  head.add(beard);
  const mouthFlat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.012), M.mouth);
  mouthFlat.position.set(0, -0.078, 0.146);
  head.add(mouthFlat);
  const mouthSmile = new THREE.Mesh(
    new THREE.TorusGeometry(0.032, 0.007, 8, 20, Math.PI), M.mouth);
  mouthSmile.position.set(0, -0.058, 0.146);
  mouthSmile.rotation.z = Math.PI; // arc opens upward -> smile
  mouthSmile.rotation.x = -0.15;
  mouthSmile.visible = false;
  head.add(mouthSmile);

  // Paag: short tapered cylinder, tilted back a touch, fish pattern.
  const paag = new THREE.Mesh(
    new THREE.CylinderGeometry(0.125, 0.15, 0.09, 24), M.paag);
  paag.position.y = 0.155;
  paag.rotation.x = -0.10;
  paag.rotation.z = 0.04;
  paag.castShadow = true;
  head.add(paag);

  // ---- Arms ----
  function arm(side) { // side: -1 = his right (-X), +1 = his left (+X)
    const shoulder = new THREE.Group();
    shoulder.position.set(0.24 * side, 0.68, 0);
    pelvis.add(shoulder);
    const upper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.05, 0.26, 14), M.kurtaPlain);
    upper.position.y = -0.13;
    upper.castShadow = true;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.26;
    shoulder.add(elbow);
    const fore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.044, 0.24, 14), M.kurtaPlain);
    fore.position.y = -0.12;
    fore.castShadow = true;
    elbow.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), M.skin);
    hand.scale.set(0.85, 1.15, 0.9);
    hand.position.y = -0.27;
    hand.castShadow = true;
    elbow.add(hand);
    return { shoulder, elbow };
  }
  const armR = arm(-1); // his right hand (viewer's left)
  const armL = arm(1);

  // ---- Legs ----
  function leg(side) {
    const hip = new THREE.Group();
    hip.position.set(0.09 * side, -0.27, 0); // relative to pelvis (abs y 0.68)
    pelvis.add(hip);
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.068, 0.30, 14), M.dhoti);
    thigh.position.y = -0.15;
    thigh.castShadow = true;
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.y = -0.30;
    hip.add(knee);
    const shin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.066, 0.06, 0.28, 14), M.dhoti);
    shin.position.y = -0.14;
    shin.castShadow = true;
    knee.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.21), M.jutti);
    foot.position.set(0, -0.30, 0.035);
    foot.castShadow = true;
    knee.add(foot);
    return { hip, knee };
  }
  const legR = leg(-1);
  const legL = leg(1);

  return { root, body, pelvis, neck, head, armR, armL, legR, legL, mouthFlat, mouthSmile };
}

// ---------- Scene ----------
let renderer, scene, camera, mount, char, clock;
let mode = "idle";            // idle | wave | walk | flex  (exclusive, timed)
let modeT = 0;
let danceOn = false;          // persistent dance layer (panel open)
let pointSide = null;         // 'left' | 'right' | null (viewer's side)
let rootYTarget = 0;
let smile = false;
let walk = null;              // { fromX, toX, t0, dur, done }
let dancePhase = 0, walkPhase = 0;
let pointerNX = 0, pointerNY = 0;
let ready = false;

const T = { // joint targets, damped toward every frame
  shLx: 0, shLz: 0, elLx: 0,
  shRx: 0, shRz: 0, elRx: 0, elRz: 0,
  hipLx: 0, kneeLx: 0, hipRx: 0, kneeRx: 0,
  neckX: 0, neckY: 0, neckZ: 0,
  pelvisS: 1, rootY: 0,
};
const damp = (cur, target, lambda, dt) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt));

function blobTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.5)");
  grad.addColorStop(0.6, "rgba(0,0,0,0.22)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function init(mountEl) {
  mount = mountEl;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    window.dispatchEvent(new CustomEvent("avatar3d-failed"));
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 1.02, 4.6);
  camera.lookAt(0, 0.98, 0);

  scene.add(new THREE.AmbientLight(0xfff2dd, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2.5, 4, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -1.6; key.shadow.camera.right = 1.6;
  key.shadow.camera.top = 2.4; key.shadow.camera.bottom = -0.4;
  key.shadow.camera.near = 1; key.shadow.camera.far = 12;
  key.shadow.bias = -0.002;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff9a3c, 0.5);
  rim.position.set(-3, 2, -2);
  scene.add(rim);

  // Real contact shadow + a soft blob that follows his feet.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 32),
    new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.002;
  blob.name = "blob";
  scene.add(blob);

  char = buildCharacter();
  char.root.position.x = -1.7; // walk-in starts off-canvas left
  scene.add(char.root);

  const resize = () => {
    const w = mount.clientWidth || 300, h = mount.clientHeight || 500;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fit = Math.max(1, 0.72 / camera.aspect);
    camera.position.z = 4.6 * fit;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(mount);

  if (finePointer) {
    window.addEventListener("pointermove", (e) => {
      pointerNX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerNY = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  clock = new THREE.Clock();
  ready = true;
  window.Avatar3D = API;
  window.dispatchEvent(new CustomEvent("avatar3d-ready"));
  if (reduced) {
    char.root.position.x = 0;
    renderFrame(0);
  } else {
    renderer.setAnimationLoop(tick);
  }
  return true;
}

function renderFrame(t) {
  update(0.016, t);
  renderer.render(scene, camera);
}

// ---------- Animation ----------
function update(dt, t) {
  const now = performance.now() / 1000;
  modeT += dt;

  // --- Base (idle): breathing + look-around + cursor follow ---
  const breathe = Math.sin(t * 1.6) * 0.015;
  let pelvisS = 1 + breathe;
  let neckX = 0, neckY = Math.sin(t * 0.45) * 0.28, neckZ = 0;
  if (finePointer && mode === "idle" && !pointSide) {
    neckY += pointerNX * 0.22;
    neckX += pointerNY * 0.08;
  }
  const P = {
    shLx: 0, shLz: 0.12, elLx: -0.12,
    shRx: 0, shRz: -0.12, elRx: -0.12, elRz: 0,
    hipLx: 0, kneeLx: 0, hipRx: 0, kneeRx: 0,
  };

  // --- Dance layer (persistent while a panel is open) ---
  if (danceOn) {
    dancePhase += dt * 5;
    const s = Math.sin(dancePhase);
    P.shLx = -0.7 - s * 0.55;
    P.shRx = -0.7 + s * 0.55;
    P.shLz = 0.35 + s * 0.35;
    P.shRz = -(0.35 - s * 0.35);
    P.elLx = -0.45; P.elRx = -0.45;
    P.hipLx = s * 0.25; P.hipRx = -s * 0.25;
    P.kneeLx = Math.max(0, s) * 0.5;
    P.kneeRx = Math.max(0, -s) * 0.5;
    neckX += Math.sin(dancePhase * 2) * 0.06;
    char.body.position.y = Math.abs(Math.sin(dancePhase * 2)) * 0.05;
    char.root.rotation.z = s * 0.06;
  } else {
    char.body.position.y *= 0.9;
    char.root.rotation.z *= 0.9;
  }

  // --- Point layer (persistent while a panel is open): his OWN arm points ---
  if (pointSide) {
    const isLeft = pointSide === "left"; // viewer's left = his right arm
    if (isLeft) {
      P.shRx = -0.3; P.shRz = -1.5; P.elRx = -0.1;
      neckY = -0.38; rootYTarget = -0.3;
    } else {
      P.shLx = -0.3; P.shLz = 1.5; P.elLx = -0.1;
      neckY = 0.38; rootYTarget = 0.3;
    }
  } else if (mode !== "walk") {
    rootYTarget = 0;
  }

  // --- Exclusive timed modes ---
  if (mode === "wave") {
    // Right arm up beside the head, forearm waving side to side.
    P.shRx = -0.35; P.shRz = -2.45;
    P.elRx = -0.45; P.elRz = Math.sin(modeT * 22) * 0.38;
    neckZ = 0.12;
    setSmile(true);
    if (modeT > 2.6) { mode = danceOn ? "idle" : "idle"; setSmile(danceOn); modeT = 0; }
  } else if (mode === "flex") {
    // Double-biceps: upper arms raised OUT to the sides (near-horizontal),
    // forearms curled up. Verified numerically: upper (±0.91, -0.38, 0.14),
    // forearm (±0.61, 0.51, 0.61) — unmistakable from the front.
    // (The old targets, shoulder.x -0.9 / z ±0.55, left the upper arms
    // pointing DOWN-forward — from a screenshot it read as arms-down, and
    // the 1.0s hold was too short to catch at all.)
    P.shLx = -0.35; P.shLz = 1.15; P.elLx = -2.3;
    P.shRx = -0.35; P.shRz = -1.15; P.elRx = -2.3;
    pelvisS = 1.07;
    setSmile(true);
    if (modeT > 2.5) { mode = "idle"; setSmile(danceOn); modeT = 0; }
  }

  // --- Walk ---
  if (walk && walk.active) {
    const p = Math.min(1, (now - walk.t0) / walk.dur);
    const e = 1 - Math.pow(1 - p, 3);
    char.root.position.x = walk.fromX + (walk.toX - walk.fromX) * e;
    walkPhase += dt * 7;
    const s = Math.sin(walkPhase);
    P.hipLx = s * 0.55; P.hipRx = -s * 0.55;
    P.kneeLx = Math.max(0, -s) * 0.7;
    P.kneeRx = Math.max(0, s) * 0.7;
    // Arm swing only while actually walking — during a flex (Hire Me calls
    // walkTo AND flex together) the walk must not overwrite the flex arms,
    // or the biceps pose never shows during the 600ms walk-in.
    if (mode === "walk") {
      P.shLx = -s * 0.4; P.shRx = s * 0.4;
    }
    char.body.position.y = Math.abs(Math.cos(walkPhase)) * 0.045;
    if (p >= 1) {
      walk.active = false;
      const done = walk.done;
      walk = null;
      // Only fall back to idle if nothing else took over mid-walk.
      // (Hire Me calls walkTo AND flex together — the old unconditional
      // `mode = "idle"` here killed the flex the moment the 600ms walk
      // ended, so the 2.5s biceps pose never showed. That is exactly what
      // the v4.0.4 flex check saw: point + dance arms, no flex.)
      if (mode === "walk") mode = "idle";
      if (done) done();
    }
  }

  // --- Apply (damped) ---
  const L = 10;
  T.shLx = damp(T.shLx, P.shLx, L, dt);
  T.shLz = damp(T.shLz, P.shLz, L, dt);
  T.elLx = damp(T.elLx, P.elLx, L, dt);
  T.shRx = damp(T.shRx, P.shRx, L, dt);
  T.shRz = damp(T.shRz, P.shRz, L, dt);
  T.elRx = damp(T.elRx, P.elRx, L, dt);
  T.elRz = damp(T.elRz, P.elRz, L, dt);
  T.hipLx = damp(T.hipLx, P.hipLx, L, dt);
  T.kneeLx = damp(T.kneeLx, P.kneeLx, L, dt);
  T.hipRx = damp(T.hipRx, P.hipRx, L, dt);
  T.kneeRx = damp(T.kneeRx, P.kneeRx, L, dt);
  T.neckX = damp(T.neckX, neckX, 8, dt);
  T.neckY = damp(T.neckY, neckY, 8, dt);
  T.neckZ = damp(T.neckZ, neckZ, 8, dt);
  T.pelvisS = damp(T.pelvisS, pelvisS, 6, dt);
  T.rootY = damp(T.rootY, rootYTarget, 6, dt);

  char.armL.shoulder.rotation.set(T.shLx, 0, T.shLz);
  char.armL.elbow.rotation.set(T.elLx, 0, 0);
  char.armR.shoulder.rotation.set(T.shRx, 0, T.shRz);
  char.armR.elbow.rotation.set(T.elRx, 0, T.elRz);
  char.legL.hip.rotation.set(T.hipLx, 0, 0);
  char.legL.knee.rotation.set(T.kneeLx, 0, 0);
  char.legR.hip.rotation.set(T.hipRx, 0, 0);
  char.legR.knee.rotation.set(T.kneeRx, 0, 0);
  char.neck.rotation.set(T.neckX, T.neckY, T.neckZ);
  char.pelvis.scale.set(1, T.pelvisS, 1);
  char.root.rotation.y = T.rootY;

  const blob = scene.getObjectByName("blob");
  if (blob) blob.position.x = char.root.position.x;
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  update(dt, t);
  renderer.render(scene, camera);
}

function setSmile(on) {
  if (!char || smile === on) return;
  smile = on;
  char.mouthFlat.visible = !on;
  char.mouthSmile.visible = on;
}

// ---------- Public API (used by app.js) ----------
const API = {
  init,
  ready: () => ready,
  setX(x) { if (char) char.root.position.x = x; },
  walkTo(x, durMs, done) {
    if (!char) return;
    walk = { fromX: char.root.position.x, toX: x, t0: performance.now() / 1000, dur: (durMs || 900) / 1000, done, active: true };
    mode = "walk"; modeT = 0;
  },
  wave() { if (!char) return; mode = "wave"; modeT = 0; },
  flex() { if (!char) return; mode = "flex"; modeT = 0; },
  danceStart() { danceOn = true; setSmile(true); },
  danceStop() { danceOn = false; setSmile(false); },
  pointAt(side) { pointSide = side === "left" || side === "right" ? side : null; },
  setSmile,
};

// Auto-start on pages that carry the mount (index.html + test-3d.html).
// Module scripts run after the document parses, so the mount exists by
// the time this runs. Without this call nothing ever initialises — the
// page would just wait for 'avatar3d-ready' forever (that is exactly how
// the first v4.0 visual check failed: TIMEOUT, no figure at all).
const mountEl = document.getElementById("avatar3d");
if (mountEl) init(mountEl);
