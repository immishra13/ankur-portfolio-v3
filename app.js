// Ankur Mishra — portfolio v3.1.
// Motion per design-motion-principles (Create mode):
// context = creative portfolio → Primary Jakub · Secondary Jhey · Selective Emil.
// Avatar is a LIVING video now (idle loop + dance on tap) — no fake pupils.
// transform / opacity / filter only. prefers-reduced-motion respected everywhere.

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// ---- Speech lines ----
const SPEECH = [
  "Namaste! I am Ankur. Move your cursor — I follow.",
  "I ship products, not promises. Scroll down, the proof is there.",
  "FixMateHub is my business — 1000+ customers and counting.",
  "AwaazRoute samajhta hai Hindi complaint. Try it live.",
  "Hire me? Filter the work above by your role.",
  "Madhubani roots, modern code. Bihar se Mumbai tak.",
];
let speechIdx = 0;
const bubble = $("speechBubble");
const stateLabel = $("avatarState");

// ---- Avatar: idle video <-> dance video ----
const idle = $("videoIdle");
const dance = $("videoDance");
const danceBtn = $("danceBtn");
const waveBtn = $("waveBtn");
let dancing = false;

function setSpeech(text) { bubble.textContent = text; }

function startDance() {
  if (dancing) return;
  dancing = true;
  idle.pause();
  idle.classList.add("avatar-video-hidden");
  dance.classList.remove("avatar-video-hidden");
  dance.classList.remove("dancing");
  void dance.offsetWidth; // restart the pop animation
  dance.classList.add("dancing");
  dance.currentTime = 0;
  dance.play().catch(() => {});
  danceBtn.textContent = "Bas, wapas baitho";
  stateLabel.textContent = "Right now: DANCE — haath-pair poora move kar raha hai";
  setSpeech("Arey waah! Dekho — haath bhi, pair bhi. Yehi toh asli avatar hai!");
}

function stopDance() {
  if (!dancing) return;
  dancing = false;
  dance.pause();
  dance.classList.add("avatar-video-hidden");
  idle.classList.remove("avatar-video-hidden");
  if (!reduced) idle.play().catch(() => {});
  danceBtn.textContent = "Dance karo";
  stateLabel.textContent = "Right now: idle — breathing, listening";
  setSpeech("Wapas aa gaya. Thak gaya thoda — dance karna easy nahi hai!");
}

danceBtn.addEventListener("click", () => (dancing ? stopDance() : startDance()));
dance.addEventListener("ended", stopDance);
waveBtn.addEventListener("click", () => {
  speechIdx = (speechIdx + 1) % SPEECH.length;
  setSpeech(SPEECH[speechIdx]);
  if (dancing) stopDance();
});

// Reduced motion: no autoplay video — show the poster still.
if (reduced) {
  idle.removeAttribute("autoplay");
  idle.pause();
}

// ---- Hero stage 3D tilt — spring-smoothed via rAF lerp (interruptible) ----
const stage = $("avatarStage");
const tilt = $("avatarTilt");
let tx = 0, ty = 0, cx = 0, cy = 0, tiltOn = false;

if (finePointer && !reduced) {
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 10; // rotateY
    ty = ((e.clientY - r.top) / r.height - 0.5) * -8; // rotateX
    tiltOn = true;
  });
  stage.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
  (function tiltLoop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    tilt.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
    requestAnimationFrame(tiltLoop);
  })();
}

// ---- 3D tilt cards with glare — direct style updates (Emil) ----
document.querySelectorAll(".tilt-card").forEach((card) => {
  if (!finePointer || reduced) return;
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(800px) rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 7).toFixed(2)}deg) translateY(-2px)`;
    card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
});

// ---- Role filter — frequent interaction: 180ms, no bounce ----
const ROLE_LABELS = { all: "All work", ai: "AI & ML", backend: "Backend", fullstack: "Full-stack", events: "Events" };
const filterButtons = document.querySelectorAll(".role-filter button");
const cards = document.querySelectorAll("#projectGrid .card");
const filterStatus = $("filterStatus");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const role = btn.dataset.role;
    let shown = 0;
    cards.forEach((card) => {
      const match = role === "all" || card.dataset.roles.split(" ").includes(role);
      card.style.display = match ? "" : "none";
      if (match) shown += 1;
    });
    filterStatus.textContent = role === "all"
      ? `Showing all ${shown} projects.`
      : `Showing ${shown} project${shown === 1 ? "" : "s"} for ${ROLE_LABELS[role]}.`;
  });
});

// ---- Two worlds toggle — clip-path wipe is CSS; JS only switches state ----
document.querySelectorAll(".world-toggle button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".world-toggle button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    $("panelTech").classList.toggle("is-active", btn.dataset.world === "tech");
    $("panelEvents").classList.toggle("is-active", btn.dataset.world === "events");
  });
});

// ---- Proof counters — count up once when visible ----
const counters = document.querySelectorAll(".count");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counterObserver.unobserve(el);
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (reduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const start = performance.now();
    const dur = 1200;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}, { threshold: 0.4 });
counters.forEach((c) => counterObserver.observe(c));

// ---- Skills cube — drag to spin (direct style), JS auto-rotate when idle ----
const scene = $("cubeScene");
const cube = $("cube");
let rotX = -12, rotY = 24, dragging = false, hovering = false, lastX = 0, lastY = 0;

function applyCube() { cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`; }
applyCube();

if (!reduced) {
  // Gentle auto-rotation from the current angle — no jump after a drag.
  (function spinLoop() {
    if (!dragging && !hovering) { rotY += 0.12; applyCube(); }
    requestAnimationFrame(spinLoop);
  })();
  scene.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.4;
    rotX = Math.max(-60, Math.min(60, rotX - (e.clientY - lastY) * 0.3));
    lastX = e.clientX; lastY = e.clientY;
    applyCube();
  });
  const endDrag = () => { dragging = false; };
  scene.addEventListener("pointerup", endDrag);
  scene.addEventListener("pointercancel", endDrag);
  scene.addEventListener("pointerenter", () => { hovering = true; });
  scene.addEventListener("pointerleave", () => { hovering = false; });
}

// ---- Journey progress bar — transform scaleX only ----
const journey = $("journeyScroll");
const journeyBar = $("journeyBar");
journey.addEventListener("scroll", () => {
  const max = journey.scrollWidth - journey.clientWidth;
  const p = max > 0 ? journey.scrollLeft / max : 0;
  journeyBar.style.transform = `scaleX(${p.toFixed(3)})`;
}, { passive: true });

// ---- Magnetic buttons — small pull toward cursor, transform only ----
document.querySelectorAll(".magnetic").forEach((el) => {
  if (!finePointer || reduced) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.2;
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
});

// ---- Selective reveal — hero + section headers ONLY (anti-checklist) ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
