// Ankur Mishra — portfolio v5.3.4.
// Full dark UI. Ankur's own avatar VIDEOS in the centre (avatar-idle.mp4
// loops normally; the dance videos play when a box opens — a different
// dance each time, time to time — and the speech bubble narrates the
// section). The videos are shot on white, so a live canvas keys the white
// out and draws him on the dark page. NO 3D model (removed 2026-11-11,
// Ankur's call), no side graphics.
// 8 boxes now: Work, Skills, Education, Certificates (new, v5.1.0 —
// certificates moved out of Education so the two stop mixing; new
// certificates go to the Certificates panel from now on), Journey, Proof,
// Hire Me, Contact. Real 3D cubes orbit around him: hover turns, drag
// rotates, tap opens a panel on THAT box's side.
// MatchMate bot: recruiter posts a requirement, bot checks the match honestly.
// Motion: transform / opacity only. prefers-reduced-motion respected.
// v5.3.3 (Mage-UI, 2026-11-15): gold follow-dot + gold click-sparks
// (one canvas, desktop dot / tap sparks everywhere), Proof numbers count
// up, gradient shimmer on the name, preloader until the first frame.
// v5.3.4 (Mage-UI, 2026-11-15): Split Text on the name (hover a letter,
// it splits apart with a ripple); Case Study Card on all boxes (book-open
// pivot + sliding OPEN tab); Canvas Cursor Effect replaces the follow-dot
// (warm gold spring-ribbon trails, click-sparks kept).

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stage = $("avatarStage");
const bubble = $("speechBubble");
const stateLabel = $("avatarState");

function setSpeech(text) { bubble.textContent = text; }

// ---------- Cursor effects (v5.3.4, Mage-UI canvas-cursor-effect + click-spark) ----------
// One fixed canvas, one rAF loop. A warm gold ribbon trails the pointer —
// 20 spring-physics lines (50 nodes each) flowing behind the cursor like
// silk (Mage-UI's canvas-cursor-effect, re-themed: its hue-cycle ran the
// whole rainbow; here it cycles only a narrow amber/gold band, hue 28–52,
// additive 'lighter' blending on the dark page). Gold click-sparks burst
// where you tap a box or the avatar. The ribbon follows touch too (it
// draws while you drag). Reduced motion: no canvas at all. No
// preventDefault — the effect only reads the pointer position.
const E = { friction: 0.5, trails: 20, size: 50, dampening: 0.25, tension: 0.98 };
let cursorCtx = null;
let ribbonPos = { x: -100, y: -100 };
let ribbonLines = [];
const sparks = []; // {x, y, born, rot} — one burst = 8 sparks, 400ms
const hueOsc = { phase: Math.random() * Math.PI * 2, offset: 40, frequency: 0.0015, amplitude: 12 };
function hueUpdate() {
  hueOsc.phase += hueOsc.frequency;
  return hueOsc.offset + Math.sin(hueOsc.phase) * hueOsc.amplitude;
}
class RibbonNode {
  constructor() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; }
}
class RibbonLine {
  constructor(spring) {
    this.spring = spring + (0.1 * Math.random() - 0.02);
    this.friction = E.friction + (0.01 * Math.random() - 0.002);
    this.nodes = [];
    for (let i = 0; i < E.size; i++) {
      const n = new RibbonNode();
      n.x = ribbonPos.x; n.y = ribbonPos.y;
      this.nodes.push(n);
    }
  }
  update() {
    let spring = this.spring;
    const node0 = this.nodes[0];
    node0.vx += (ribbonPos.x - node0.x) * spring;
    node0.vy += (ribbonPos.y - node0.y) * spring;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        node.vx += (prev.x - node.x) * spring;
        node.vy += (prev.y - node.y) * spring;
        node.vx += prev.vx * E.dampening;
        node.vy += prev.vy * E.dampening;
      }
      node.vx *= this.friction;
      node.vy *= this.friction;
      node.x += node.vx;
      node.y += node.vy;
      spring *= E.tension;
    }
  }
  draw(ctx) {
    let x = this.nodes[0].x, y = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 1; i < this.nodes.length - 2; i++) {
      const cur = this.nodes[i], nxt = this.nodes[i + 1];
      x = 0.5 * (cur.x + nxt.x);
      y = 0.5 * (cur.y + nxt.y);
      ctx.quadraticCurveTo(cur.x, cur.y, x, y);
    }
    if (this.nodes.length > 2) {
      const i = this.nodes.length - 2;
      ctx.quadraticCurveTo(this.nodes[i].x, this.nodes[i].y, this.nodes[i + 1].x, this.nodes[i + 1].y);
    }
    ctx.stroke();
    ctx.closePath();
  }
}
function initCursorFX() {
  if (reduced) return;
  const c = document.createElement("canvas");
  c.className = "cursor-canvas";
  c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  cursorCtx = c.getContext("2d");
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize();
  window.addEventListener("resize", resize);
  const setPos = (x, y) => { ribbonPos.x = x; ribbonPos.y = y; };
  document.addEventListener("mousemove", (e) => setPos(e.clientX, e.clientY));
  document.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) setPos(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  document.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) setPos(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  ribbonPos = { x: innerWidth / 2, y: innerHeight / 2 };
  ribbonLines = [];
  for (let i = 0; i < E.trails; i++) {
    ribbonLines.push(new RibbonLine(0.4 + (i / E.trails) * 0.025));
  }
  const loop = () => {
    cursorCtx.clearRect(0, 0, c.width, c.height);
    // Ribbon — additive gold trails, hue cycling slowly in the amber band.
    cursorCtx.globalCompositeOperation = "lighter";
    cursorCtx.strokeStyle = `hsla(${Math.round(hueUpdate())}, 85%, 55%, 0.22)`;
    cursorCtx.lineWidth = 1;
    for (const line of ribbonLines) { line.update(); line.draw(cursorCtx); }
    // Click sparks — back to normal blending, 8 gold lines, 400ms.
    cursorCtx.globalCompositeOperation = "source-over";
    const now = performance.now();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const age = now - s.born;
      if (age > 400) { sparks.splice(i, 1); continue; }
      const p = 1 - age / 400; // 1 -> 0, ease-out
      const len = 18 * p + 4;
      cursorCtx.save();
      cursorCtx.globalAlpha = p;
      cursorCtx.strokeStyle = "#f59e0b"; cursorCtx.lineWidth = 2; cursorCtx.lineCap = "round";
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + s.rot;
        cursorCtx.beginPath();
        cursorCtx.moveTo(s.x + Math.cos(a) * 6, s.y + Math.sin(a) * 6);
        cursorCtx.lineTo(s.x + Math.cos(a) * (6 + len), s.y + Math.sin(a) * (6 + len));
        cursorCtx.stroke();
      }
      cursorCtx.restore();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
function burstSparks(x, y) {
  if (!cursorCtx) return;
  sparks.push({ x, y, born: performance.now(), rot: Math.random() * Math.PI });
}
initCursorFX();

// ---------- Preloader (v5.3.3) ----------
// A clean loading screen while the avatar video warms up, instead of an
// empty orange glow. Hides the moment the first avatar frame is keyed
// (keyFrame calls it), or after 4s at the latest, or if the video fails.
let preloaderHidden = false;
function hidePreloader() {
  if (preloaderHidden) return;
  preloaderHidden = true;
  const p = $("preloader");
  if (!p) return;
  p.classList.add("is-hidden");
  setTimeout(() => { p.remove(); }, 600); // let the fade finish, then remove
}
setTimeout(hidePreloader, 4000); // safety — never leave a loading screen up

// ---------- Split Text on the name (v5.3.4, Mage-UI split-text) ----------
// Each letter is cut into a top half + bottom half. Hovering a letter
// pushes its halves apart (top up, bottom down) with a ripple to the
// neighbours (active ±20px, ±1 ±12px, ±2 ±4px — Mage-UI's numbers).
// Built by JS so no-JS still shows the plain gradient name. The sizer
// keeps the h1's size and the accessible name; the letters row is
// aria-hidden. Reduced motion: keep the plain name, no split.
function buildSplitName() {
  if (reduced) return;
  const h1 = $("splitName");
  if (!h1) return;
  const text = h1.textContent;
  let splitTimer = 0;
  const letters = [];
  function setSplitActive(idx) {
    clearTimeout(splitTimer);
    letters.forEach((w, j) => {
      const d = Math.abs(j - idx);
      w.classList.toggle("is-active", idx >= 0 && j === idx);
      w.classList.toggle("is-near1", idx >= 0 && d === 1);
      w.classList.toggle("is-near2", idx >= 0 && d === 2);
    });
  }
  h1.classList.add("is-split");
  h1.innerHTML = "";
  const sizer = document.createElement("span");
  sizer.className = "split-sizer";
  sizer.textContent = text;
  h1.appendChild(sizer);
  const row = document.createElement("span");
  row.className = "split-letters";
  row.setAttribute("aria-hidden", "true");
  text.split("").forEach((ch, i) => {
    const c = ch === " " ? "\u00A0" : ch; // non-breaking space keeps its width
    const wrap = document.createElement("span");
    wrap.className = "split-letter";
    const top = document.createElement("span");
    top.className = "split-top";
    top.textContent = c;
    const bottom = document.createElement("span");
    bottom.className = "split-bottom";
    const inner = document.createElement("span");
    inner.className = "split-bottom-inner";
    inner.textContent = c;
    bottom.appendChild(inner);
    wrap.appendChild(top);
    wrap.appendChild(bottom);
    wrap.addEventListener("mouseenter", () => setSplitActive(i));
    wrap.addEventListener("mouseleave", () => {
      splitTimer = setTimeout(() => setSplitActive(-1), 150);
    });
    row.appendChild(wrap);
    letters.push(wrap);
  });
  h1.appendChild(row);
}
buildSplitName();

// ---------- Proof counter (v5.3.3, Mage-UI counter idea) ----------
// When the Proof panel opens, its numbers count up from 0 (900ms,
// easeOutCubic). The final values live in the HTML (data-count), so
// no-JS still shows them, and reduced motion skips the animation.
let proofRaf = 0;
function animateProof() {
  if (reduced) return;
  cancelAnimationFrame(proofRaf);
  const els = document.querySelectorAll(".proof-list [data-count]");
  const start = performance.now(), DUR = 900;
  const step = (now) => {
    const t = Math.min(1, (now - start) / DUR);
    const e = 1 - Math.pow(1 - t, 3);
    els.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const suf = el.dataset.suffix || "";
      el.textContent = (target * e).toFixed(dec) + suf;
    });
    if (t < 1) proofRaf = requestAnimationFrame(step);
  };
  proofRaf = requestAnimationFrame(step);
}

// ---------- Video avatar (idle + dance videos) ----------
// The videos are shot on a WHITE background, so the live canvas keys the
// white out (chroma-key) and draws the avatar on the dark page — the same
// trick v3.7 used. The canvas holds the last keyed frame while a new
// video loads, so swapping idle <-> dance never flashes white.
// Behaviour: idle loops normally; when a box opens he dances (a different
// dance each time) and the speech bubble narrates the section; tap him
// and he dances briefly; Hire Me is a dance too (celebration — the video
// cannot flex). Close the panel and he is back to idle.
const IDLE_SRC = "avatar-idle.mp4";
// All 5 dances are in the repo (dance 1 was already there; 2, 4, 5, 6
// uploaded 2026-11-11 via the GitHub web UI — binary, push-files cannot
// carry them). A random one plays each time a box opens.
const DANCES = ["avatar-dance.mp4", "avatar-dance2.mp4", "avatar-dance4.mp4", "avatar-dance5.mp4", "avatar-dance6.mp4"];
const video = $("avatarVideo");
const canvas = $("avatarCanvas");
const vctx = canvas.getContext("2d");
const KW = 360, KH = 640; // keying resolution — small enough to be fast
canvas.width = KW; canvas.height = KH;
let lastDance = -1;
let keying = false;

function showFallback(msg) {
  const fb = $("avatarFallback");
  if (fb) fb.hidden = false;
  canvas.hidden = true;
  stopKeying();
  hidePreloader(); // video failed — don't leave the user on a loading screen
  if (msg) stateLabel.textContent = msg;
}

// Chroma-key: distance from white < 75 -> transparent, 75-95 soft ramp.
// Despill: pull the white spill off semi-transparent edge pixels so he
// has no white halo.
function keyFrame() {
  if (!keying || video.readyState < 2) return;
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) return;
  // contain-fit the video into the 360x640 canvas
  const s = Math.min(KW / vw, KH / vh);
  const dw = vw * s, dh = vh * s;
  const dx = (KW - dw) / 2, dy = (KH - dh) / 2;
  vctx.clearRect(0, 0, KW, KH);
  vctx.drawImage(video, dx, dy, dw, dh);
  const img = vctx.getImageData(0, 0, KW, KH);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const dist = Math.sqrt((255 - r) * (255 - r) + (255 - g) * (255 - g) + (255 - b) * (255 - b));
    if (dist < 75) {
      d[i + 3] = 0;
    } else if (dist < 95) {
      d[i + 3] = Math.round(255 * (dist - 75) / 20);
    }
    if (d[i + 3] > 0 && d[i + 3] < 255) {
      const m = Math.min(r, g, b);
      d[i] = Math.max(0, r - (255 - m) * 0.4);
      d[i + 1] = Math.max(0, g - (255 - m) * 0.4);
      d[i + 2] = Math.max(0, b - (255 - m) * 0.4);
    }
  }
  vctx.putImageData(img, 0, 0);
  hidePreloader(); // first frame keyed — the avatar is actually visible now
}

function startKeying() {
  if (keying) return;
  keying = true;
  const loop = () => {
    if (!keying) return;
    keyFrame();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
function stopKeying() { keying = false; }

// v5.1.1 fix — the video died after the first dance (UI test 2026-11-12):
// when a new src loads, the browser ABORTS the pending play() promise
// (AbortError). The old code treated that abort as a video failure and
// showed the static photo forever. AbortError is EXPECTED during a src
// switch — it is not a failure. Only a real failure (and only from the
// latest switch) may show the fallback. And if the video later starts
// playing, the canvas comes back — the fallback is never permanent.
let playSeq = 0;
function playSrc(src, loop) {
  const seq = ++playSeq;
  video.loop = !!loop;
  if (video.getAttribute("src") !== src) {
    video.setAttribute("src", src);
    video.load(); // only reload when the src actually changed
  }
  const p = video.play();
  if (p) p.catch((err) => {
    if (err && err.name === "AbortError") return; // superseded by a newer switch — fine
    if (seq !== playSeq) return; // an older switch — ignore it
    showFallback("Right now: showing photo");
  });
}
// Recovery: if the video starts playing after a fallback was shown
// (a slow load, a retry), bring the canvas back.
video.addEventListener("playing", () => {
  const fb = $("avatarFallback");
  if (fb) fb.hidden = true;
  canvas.hidden = false;
  startKeying();
});

function playIdle() {
  playSrc(IDLE_SRC, true);
  stateLabel.textContent = "Right now: idle — listening";
}
function playDance(label) {
  // A different dance from the last one — time to time, a new dance.
  let idx;
  do { idx = Math.floor(Math.random() * DANCES.length); } while (DANCES.length > 1 && idx === lastDance);
  lastDance = idx;
  playSrc(DANCES[idx], true); // loop while the panel is open
  stateLabel.textContent = label || "Right now: dancing";
}

// Start: idle video + keying. Reduced motion: no video, just the photo.
if (reduced) {
  showFallback("Right now: photo — motion reduced");
} else {
  video.addEventListener("error", () => showFallback("Right now: showing photo"));
  startKeying();
  playIdle();
}

// Tap the avatar himself: he dances briefly and answers back.
const TAP_LINES = [
  "Hey — you tapped me! I am right here.",
  "Hi! Tap a box if you need anything.",
  "My full story is in Journey.",
  "Tap Hire Me — let's see if we match.",
];
stage.addEventListener("click", (e) => {
  if (reduced) return;
  burstSparks(e.clientX, e.clientY);
  setSpeech(TAP_LINES[Math.floor(Math.random() * TAP_LINES.length)]);
  if (!openKey) {
    playDance("Right now: dancing");
    setTimeout(() => { if (!openKey) playIdle(); }, 3000);
  }
});
// ---------- 3D cubes: drag to rotate ----------
// Hover rotation is CSS (--rx/--ry vars). Drag sets the same vars inline;
// on release the inline vars are cleared so the CSS resting pose returns.
// A drag that moved never opens the panel (see the click guard below).
document.querySelectorAll(".cube").forEach((cube) => {
  let dragging = false, moved = false, startX = 0, startY = 0;
  const setRot = (rx, ry) => {
    cube.style.setProperty("--rx", rx.toFixed(1) + "deg");
    cube.style.setProperty("--ry", ry.toFixed(1) + "deg");
  };
  cube.addEventListener("pointerdown", (e) => {
    dragging = true; moved = false; startX = e.clientX; startY = e.clientY;
    cube.classList.add("dragging");
    try { cube.setPointerCapture(e.pointerId); } catch (_) {}
  });
  cube.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
    if (moved) {
      setRot(
        Math.max(-50, Math.min(20, -14 - dy * 0.3)),
        Math.max(-55, Math.min(55, -20 + dx * 0.35))
      );
    }
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    cube.classList.remove("dragging");
    cube.style.removeProperty("--rx");
    cube.style.removeProperty("--ry");
    if (moved) window.__cubeDragAt = Date.now();
  };
  cube.addEventListener("pointerup", endDrag);
  cube.addEventListener("pointercancel", endDrag);
});

// ---------- Panels ----------
// The panel opens on the same side as the box that was tapped. The video
// avatar dances and the speech bubble narrates the section.
// Left boxes: Work, Education, Certificates, Proof.
const LEFT_PANELS = new Set(["work", "education", "certificates", "proof"]);
const TITLES = {
  work: "Work", skills: "Skills", education: "Education",
  certificates: "Certificates",
  journey: "Journey", proof: "Proof", hire: "Hire Me — MatchMate", contact: "Contact",
  feedback: "Feedback",
};
const SPEECH = {
  work: "Here is my work — all live, check it yourself.",
  skills: "These are the tools I actually use — not a copied list.",
  education: "My education journey — from school to VIVA.",
  certificates: "My certificates — every course and quiz I finished, with proof.",
  journey: "2020 to 2027 — I built something every year.",
  proof: "Numbers speak. Promises don't.",
  hire: "Write your requirement — I will check how much I match.",
  contact: "Let's talk directly.",
  feedback: "Say it straight — good, bad, anything. It comes straight to me.",
};
const panel = $("panel");
const backdrop = $("panelBackdrop");
const panelTitle = $("panelTitle");
let openKey = null;

function openPanel(key) {
  openKey = key;
  panelTitle.textContent = TITLES[key];
  document.querySelectorAll(".panel-section").forEach((s) => {
    s.classList.toggle("is-active", s.dataset.section === key);
  });
  document.querySelectorAll(".orbit-box").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.panel === key);
  });
  panel.classList.add("open");
  backdrop.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
  const isLeft = LEFT_PANELS.has(key);
  panel.classList.toggle("panel-left", isLeft);
  // Side marker for the medium-width CSS: on small laptops the panel
  // covers the avatar, so the stage shifts to the other side (v5.1.1).
  document.body.classList.toggle("panel-side-left", isLeft);
  document.body.classList.toggle("panel-side-right", !isLeft);
  // He dances (a different dance each time) and the speech bubble
  // narrates the section. The stage lifts above the panel backdrop
  // (CSS: body.panel-open .avatar-stage z-index 21), so he stays visible.
  if (!reduced) playDance("Right now: dancing — " + (key === "hire" ? "Hire Me" : TITLES[key]));
  setSpeech(SPEECH[key]);
  if (key === "proof") animateProof(); // Proof numbers count up
}

function closePanel() {
  if (!openKey) return;
  openKey = null;
  panel.classList.remove("open");
  backdrop.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  document.body.classList.remove("panel-side-left", "panel-side-right");
  document.querySelectorAll(".orbit-box").forEach((b) => b.classList.remove("is-active"));
  if (!reduced) playIdle(); // back to the idle video
  setSpeech("I am back. Try another box — I am right here.");
}

document.querySelectorAll(".orbit-box").forEach((b) => {
  b.addEventListener("click", (e) => {
    if (Date.now() - (window.__cubeDragAt || 0) < 250) return; // it was a drag, not a tap
    burstSparks(e.clientX, e.clientY);
    if (openKey === b.dataset.panel) { closePanel(); return; }
    openPanel(b.dataset.panel);
  });
});
$("panelClose").addEventListener("click", closePanel);
backdrop.addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });

// ---------- MatchMate bot ----------
// NLP: light stemming + synonym groups, so related words match too —
// "logistic" finds "logistics", "management" finds "manager", "supply chain"
// finds "logistics", "wedding planner" finds event planning.
// Trained on the CV, LinkedIn and GitHub skills.
function stem(w) {
  w = (w || "").toLowerCase();
  if (w.length <= 3) return w;
  const rules = [
    [/ational$/, "ate"], [/iveness$/, "ive"], [/fulness$/, "ful"],
    [/ization$/, "ize"], [/isation$/, "ise"],
    [/ing$/, ""], [/edly$/, ""], [/ies$/, "y"], [/ied$/, "y"],
    [/tion$/, "t"], [/sion$/, "s"], [/ics$/, "ic"], [/ism$/, ""],
    [/ment$/, ""], [/ness$/, ""], [/ity$/, ""], [/ance$/, ""], [/ence$/, ""],
    [/able$/, ""], [/ible$/, ""], [/al$/, ""], [/er$/, ""], [/or$/, ""], [/ist$/, ""],
    [/ly$/, ""], [/ed$/, ""], [/es$/, ""], [/s$/, ""], [/e$/, ""],
  ];
  let prev = "";
  while (w !== prev && w.length > 3) {
    prev = w;
    for (const [re, rep] of rules) {
      if (re.test(w)) { w = w.replace(re, rep); break; }
    }
  }
  return w;
}
// Synonym groups: words that mean the same thing for hiring.
const SYN_GROUPS = [
  ["manag", "admin", "coordin", "plan"],        // management ~ admin ~ coordination ~ planning
  ["logist", "supply", "transport", "operat"],  // logistics ~ supply chain ~ transport ~ operations
  ["event", "wed", "confer"],                          // event ~ wedding ~ conference
  ["analy", "data"],                             // analytics ~ analyst ~ data
  ["fin", "budget"],                             // finance ~ financial ~ budgeting
  ["client", "custom"],                          // client ~ customer
  ["ai", "artifici", "intellig"],                // ai ~ artificial intelligence
  ["ml", "machin"],                              // ml ~ machine learning
  ["cab", "taxi", "travel"],                     // cab ~ taxi ~ travel
  ["sign", "gesture"],                           // sign language ~ gesture
];
function equivStems(s) {
  for (const g of SYN_GROUPS) {
    for (const m of g) {
      if (s === m || (s.length >= 4 && m.length >= 4 && (s.startsWith(m) || m.startsWith(s)))) return g;
    }
  }
  return [s];
}
function tokenStems(text) {
  const toks = (text || "").toLowerCase().replace(/[^a-z0-9+#]/g, " ").split(/\s+/).filter(Boolean);
  const out = new Set();
  for (const t of toks) {
    const st = stem(t);
    out.add(st);
    for (const e of equivStems(st)) out.add(e);
  }
  return out;
}
function keyMatches(inputStems, key) {
  const ks = key.toLowerCase().replace(/[^a-z0-9+#]/g, " ").split(/\s+/).filter(Boolean).map(stem);
  return ks.every((k) => inputStems.has(k) || equivStems(k).some((e) => inputStems.has(e)));
}
function skillMatches(input, skill) {
  if (skill.keys.some((k) => hasKeyword(input, k))) return true; // exact phrase first
  const stems = tokenStems(input);
  return skill.keys.some((k) => keyMatches(stems, k));           // stem + synonym fallback
}

const SKILLS = [
  { label: "Python", keys: ["python"], proof: ["FixMateHub", "AwaazRoute"] },
  { label: "FastAPI", keys: ["fastapi", "fast api"], proof: ["RTI Black Hole", "FixMateHub"] },
  { label: "Flask", keys: ["flask"], proof: ["Flask YOLO Object Detection"] },
  { label: "REST APIs", keys: ["rest api", "rest apis", "restful", "api", "apis"], proof: ["FixMateHub", "RTI Black Hole"] },
  { label: "Node.js", keys: ["node.js", "nodejs", "node js"], proof: ["FixMateHub", "Preview Cloud"] },
  { label: "JavaScript", keys: ["javascript", "js"], proof: ["FixMateHub", "Preview Cloud"] },
  { label: "React", keys: ["react"], proof: ["FixMateHub"] },
  { label: "HTML / CSS", keys: ["html", "css"], proof: ["FixMateHub"] },
  { label: "SQL / MySQL", keys: ["sql", "mysql"], proof: ["FixMateHub"] },
  { label: "MongoDB", keys: ["mongodb", "mongo db", "mongo"], proof: [] },
  { label: "Docker", keys: ["docker"], proof: [] },
  { label: "Git / GitHub", keys: ["git", "github"], proof: ["All repos on github.com/immishra13"] },
  { label: "Machine Learning", keys: ["machine learning", "machine-learning", "ml"], proof: ["AwaazRoute", "Financial Complaint Classifier"] },
  { label: "NLP", keys: ["nlp", "natural language", "natural language processing"], proof: ["AwaazRoute", "Financial Complaint Classifier", "RTI Black Hole"] },
  { label: "scikit-learn", keys: ["scikit-learn", "scikit learn", "sklearn", "scikit"], proof: ["AwaazRoute", "Financial Complaint Classifier"] },
  { label: "XGBoost", keys: ["xgboost"], proof: ["Personality Prediction model"] },
  { label: "YOLO / Computer Vision", keys: ["yolo", "computer vision", "opencv"], proof: ["SignSight — Sign Language + YOLO"] },
  { label: "Sign Language", keys: ["sign language", "gesture"], proof: ["SignSight — Sign Language + YOLO"] },
  { label: "GenAI / AI Agents", keys: ["genai", "generative ai", "ai agent", "ai agents", "llm", "artificial intelligence"], proof: ["AwaazRoute"] },
  { label: "Blockchain / Web3", keys: ["blockchain", "web3", "solidity"], proof: ["E-WasteChain"] },
  { label: "Full-stack", keys: ["full stack", "full-stack", "fullstack"], proof: ["FixMateHub"] },
  { label: "Frontend", keys: ["frontend", "front-end", "front end"], proof: ["FixMateHub"] },
  { label: "Backend", keys: ["backend", "back-end", "back end"], proof: ["FixMateHub", "RTI Black Hole"] },
  { label: "Automation", keys: ["automation", "automate"], proof: ["AwaazRoute"] },
  { label: "Firebase", keys: ["firebase", "firestore"], proof: ["FixMateHub", "RTI Black Hole"] },
  { label: "PHP", keys: ["php"], proof: ["All-in-One Medicare (PHP/MySQL)"] },
  { label: "React Native", keys: ["react native"], proof: ["FixMateHub"] },
  { label: "LangChain / RAG", keys: ["langchain", "rag", "retrieval augmented", "llm"], proof: ["GenAI products (per LinkedIn About)"] },
  { label: "MCP", keys: ["mcp", "model context protocol"], proof: ["GenAI products (per LinkedIn About)"] },
  { label: "Automation (n8n / Zapier)", keys: ["n8n", "zapier", "make.com", "make automation", "workflow automation"], proof: ["FixMateHub ops automation"] },
  { label: "Web Design", keys: ["web design", "responsive"], proof: ["FixMateHub"] },
  { label: "Project Management", keys: ["project management", "project manager"], proof: ["FixMateHub", "50+ events"] },
  { label: "Communication", keys: ["communication"], proof: ["FixMateHub — client communication", "Kushal Yuva Program (A+)"] },
  { label: "Chrome Extensions", keys: ["chrome extension", "extension"], proof: ["MyTab extension"] },
  { label: "Event Management", keys: ["event management", "event manager", "event planning", "management", "manager", "managing", "coordination", "coordinator", "operations", "logistics", "logistic", "supply chain", "vendor management", "client handling", "budgeting", "planning"], proof: ["50+ weddings & corporate events", "Event Management System"] },
  { label: "Weddings & Hospitality", keys: ["wedding", "weddings", "hospitality", "corporate events", "event", "events", "venue", "stage management"], proof: ["50+ weddings & corporate events"] },
  { label: "Cab Booking / Travel Ops", keys: ["cab", "taxi", "travel", "booking portal", "corporate travel", "fleet"], proof: ["CABMANAGEMENT"] },
  { label: "Data Analytics", keys: ["data analytics", "big data", "analytics"], proof: ["Sem 7: Big Data Analytics"] },
];
const NOT_HAVE = [
  "Java", "AWS", "Azure", "Kubernetes", "DevOps", "Terraform", "TypeScript",
  "Angular", "Vue", "Laravel", "Django", "Golang", "Rust", "C++",
  "TensorFlow", "PyTorch", "Figma", "Flutter", "Kotlin", "Swift", ".NET", "C#",
  "Spark", "Tableau", "Power BI", "Salesforce",
];

function hasKeyword(text, key) {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, "i").test(text);
}

function checkMatch() {
  const input = $("reqInput").value.trim();
  const result = $("botResult");
  if (!input) {
    result.innerHTML = `<p class="bot-empty">Write your requirement first — or tap an example below.</p>`;
    return;
  }
  const matched = SKILLS.filter((s) => skillMatches(input, s));
  const missing = NOT_HAVE.filter((n) => hasKeyword(input, n));
  const total = matched.length + missing.length;
  if (total === 0) {
    result.innerHTML = `<p class="bot-empty">No skill I know was found in this. Write a little more detail — like: <em>“Python backend intern — FastAPI, REST APIs, MySQL, Git”</em>.</p>`;
    return;
  }
  const score = Math.round((matched.length / total) * 100);
  const verdict = score >= 80 ? "Strong match — we should talk."
    : score >= 50 ? "Good match — I will need to learn a few things, but the base is solid."
    : "Partial match — to be honest, some of this is not in my stack.";
  const proofs = [...new Set(matched.flatMap((s) => s.proof))].slice(0, 3);
  result.innerHTML = `
    <div class="match-score"><strong>${score}%</strong><span>match — ${verdict}</span></div>
    <div class="match-bar"><span style="--w:${score / 100}"></span></div>
    <h4 class="good">Matches (${matched.length})</h4>
    <p class="chips">${matched.map((s) => `<span>${s.label}</span>`).join("")}</p>
    ${missing.length ? `<h4 class="miss">Not in my current stack (${missing.length})</h4>
    <p class="chips">${missing.map((m) => `<span class="missing">${m}</span>`).join("")}</p>` : `<h4 class="good">No gaps spotted in what you listed.</h4>`}
    ${proofs.length ? `<h4 class="good">Proof — where I used it</h4>
    <ul class="bot-proof">${proofs.map((p) => `<li><strong>${p}</strong> — real work, link is in the Work box.</li>`).join("")}</ul>` : ""}
    ${matched.length ? `<div class="bot-contact-cta"><button type="button" class="btn btn-primary" id="botContactBtn">📩 Match hua — Contact Ankur, let's talk</button></div>` : ""}
  `;
  const contactBtn = result.querySelector("#botContactBtn");
  if (contactBtn) contactBtn.addEventListener("click", () => openPanel("contact"));
  requestAnimationFrame(() => {
    const bar = result.querySelector(".match-bar span");
    if (bar) bar.classList.add("go");
  });
  setSpeech(score >= 80 ? "Strong match! This role is for me — let's talk!" : score >= 50 ? "Good match — I will need to learn a few things, but the base is solid." : "Honest answer: some of this is not in my stack. We can still talk.");
}

$("botCheck").addEventListener("click", checkMatch);
document.querySelectorAll(".bot-chips button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".bot-chips button").forEach((x) => x.classList.remove("selected"));
    b.classList.add("selected");
    $("reqInput").value = b.dataset.req;
    checkMatch();
  });
});

// ---------- Feedback panel (v5.3.1) ----------
// Feedback is saved as text in a Google Form ("Feedback & Suggestions")
// and shown on Ankur's dashboard (dashboard.html reads the Form's
// published response Sheet as CSV). The form POSTs to the Google Form
// response endpoint — no email, no redirect, no sign-in, no token,
// anonymous by default (name is optional). Google Forms does not send
// CORS headers, so we use mode "no-cors": the request is sent and the
// response is opaque (we cannot read it), but the submission lands in
// the Form. If the fetch itself throws (network error), we show an error.
const FB_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeCJ_kgxS6e-CZVU32Joum9qtXbAxs7KX5NE07wnSDlRHFuLw/formResponse";
$("fbSubmit").addEventListener("click", async () => {
  const status = $("fbStatus");
  const btn = $("fbSubmit");
  const msg = $("fbMsg").value.trim();
  const name = $("fbName").value.trim() || "Anonymous";
  if (!msg) {
    status.textContent = "Please write your feedback first.";
    status.classList.add("err");
    return;
  }
  btn.disabled = true;
  status.textContent = "Saving...";
  status.classList.remove("err");
  try {
    const body = new URLSearchParams();
    body.set("entry.521064233", name);
    body.set("entry.1515644547", msg.slice(0, 1000));
    await fetch(FB_FORM_URL, { method: "POST", mode: "no-cors", body: body });
    status.textContent = "Thank you! Your feedback was saved — you can see it on Ankur's dashboard.";
    status.classList.remove("err");
    $("fbMsg").value = "";
    $("fbName").value = "";
  } catch (err) {
    status.textContent = "Couldn't save right now — please try again, or email Ankur directly from the Contact box.";
    status.classList.add("err");
  } finally {
    btn.disabled = false;
  }
});
