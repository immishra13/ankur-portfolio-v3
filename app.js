// Ankur Mishra — portfolio v3.3 "Cube Orbit".
// Full dark UI. Avatar in the centre, drawn on canvas with live chroma-key
// (white video background removed per frame — no white box behind him).
// Real 3D cubes orbit around him: hover turns, drag rotates, tap opens a panel
// on THAT box's side, avatar dances and turns toward it.
// MatchMate bot: recruiter posts a requirement, bot checks the match honestly.
// Motion per design-motion-principles: Jakub primary · Jhey secondary · Emil selective.
// transform / opacity / filter only. prefers-reduced-motion respected.

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// ---------- Avatar: canvas chroma-key (white video background -> transparent) ----------
// The avatar videos were generated on a white background. Transparent VP9
// (WebM alpha) was tried first — the encoder fed yuva420p still wrote a
// Profile 0 stream with no alpha — so the background is removed live, per
// frame, on a canvas. A pixel is background when it is close to white
// (Euclidean distance in RGB, like ffmpeg's colorkey). The cream kurta sits
// ~135 away from white, so it survives; the grey dance backdrop (~66) and
// the compression speckles in it are removed. Verified on real frames:
// idle + dance both key cleanly, face/kurta/paag intact.
const canvas = $("avatarCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const CW = 360, CH = 640;
canvas.width = CW; canvas.height = CH;
const idle = $("videoIdle");
const dance = $("videoDance");
const bubble = $("speechBubble");
const stateLabel = $("avatarState");
let dancing = false;
let activeVideo = idle;
let hasFrame = false;

// Poster (transparent PNG) until the first keyed frame is ready.
// The poster is a tall 610x1530 still — cover-fitting it cropped 131px off
// the top and bottom, which cut the head off on first load (the "face gayab"
// bug). So the poster is drawn CONTAINED: whole figure, head included,
// until the video's first keyed frame takes over.
const posterImg = new Image();
posterImg.src = "avatar.png";
posterImg.onload = () => { if (!hasFrame) drawContain(posterImg); };

function drawContain(src) {
  const sw = src.naturalWidth || 0;
  const sh = src.naturalHeight || 0;
  if (!sw || !sh) return;
  const s = Math.min(CW / sw, CH / sh);
  ctx.clearRect(0, 0, CW, CH);
  ctx.drawImage(src, (CW - sw * s) / 2, (CH - sh * s) / 2, sw * s, sh * s);
}

function drawCover(src) {
  const sw = src.videoWidth || src.naturalWidth || 0;
  const sh = src.videoHeight || src.naturalHeight || 0;
  if (!sw || !sh) return;
  const s = Math.max(CW / sw, CH / sh);
  ctx.drawImage(src, (CW - sw * s) / 2, (CH - sh * s) / 2, sw * s, sh * s);
}

function keyFrame() {
  const v = activeVideo;
  if (!v || v.readyState < 2 || !v.videoWidth) return;
  drawCover(v);
  const img = ctx.getImageData(0, 0, CW, CH);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const dr = 255 - r, dg = 255 - g, db = 255 - b;
    const dist2 = dr * dr + dg * dg + db * db; // squared distance from white
    let a = 255;
    if (dist2 < 5625) { // < 75 from white: background
      a = 0;
    } else if (dist2 < 9025) { // 75–95: soft edge
      a = Math.round(((Math.sqrt(dist2) - 75) / 20) * 255);
    }
    if (a < 255) {
      d[i + 3] = a;
      // Despill: pull the white fringe toward the avatar's own colour.
      const f = 0.35 + 0.65 * (a / 255);
      d[i] = Math.round(r * f);
      d[i + 1] = Math.round(g * f);
      d[i + 2] = Math.round(b * f);
    }
  }
  ctx.putImageData(img, 0, 0);
  hasFrame = true;
}

// Key only when the video actually advanced a frame (~25fps, not 60).
let lastTime = -1;
function keyLoop() {
  if (activeVideo && !activeVideo.paused && activeVideo.currentTime !== lastTime) {
    lastTime = activeVideo.currentTime;
    keyFrame();
  }
  requestAnimationFrame(keyLoop);
}
if (!reduced) keyLoop();

function setSpeech(text) { bubble.textContent = text; }
function startDance() {
  if (dancing) return;
  dancing = true;
  idle.pause();
  activeVideo = dance;
  lastTime = -1;
  canvas.classList.remove("dancing");
  void canvas.offsetWidth;
  canvas.classList.add("dancing");
  dance.currentTime = 0;
  dance.play().catch(() => {});
  stateLabel.textContent = "Right now: EXCITED — dance kar raha hai";
}
function stopDance() {
  if (!dancing) return;
  dancing = false;
  dance.pause();
  activeVideo = idle;
  lastTime = -1;
  if (!reduced) idle.play().catch(() => {});
  stateLabel.textContent = "Right now: idle — breathing, listening";
}
dance.addEventListener("ended", stopDance);
if (reduced) { idle.removeAttribute("autoplay"); idle.pause(); }

// Kick the idle video explicitly (autoplay alone is unreliable on phones),
// and key one frame immediately when a video actually starts playing, so
// the canvas never shows a stale frame from the other video.
if (!reduced) idle.play().catch(() => {});
idle.addEventListener("playing", () => { if (activeVideo === idle) { lastTime = -1; keyFrame(); } });
dance.addEventListener("playing", () => { if (activeVideo === dance) { lastTime = -1; keyFrame(); } });

// ---------- Avatar tilt: follows cursor, turns toward the open panel ----------
const stage = $("avatarStage");
const tilt = $("avatarTilt");
let tx = 0, ty = 0, cx = 0, cy = 0;
let panelTiltY = 0; // +12 while a panel is open (turn toward it)

if (finePointer && !reduced) {
  document.querySelector(".orbit").addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    const py = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    tx = px * 14;
    ty = py * -10;
  });
  (function tiltLoop() {
    cx += (tx + panelTiltY - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    tilt.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
    requestAnimationFrame(tiltLoop);
  })();
}

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
// The panel opens on the same side as the box that was tapped, and the
// avatar turns toward it. Left boxes: Work, Education, Proof.
const LEFT_PANELS = new Set(["work", "education", "proof"]);
const TITLES = {
  work: "Work", skills: "Skills", education: "Education",
  journey: "Journey", proof: "Proof", hire: "Hire Me — MatchMate", contact: "Contact",
};
const SPEECH = {
  work: "Ye raha mera kaam — sab live hai, khud check kar lo!",
  skills: "Ye tools main sach me use karta hoon — copy-paste list nahi hai.",
  education: "Padhai ka safar — Bihar se Mumbai, VIVA tak.",
  journey: "2020 se 2027 — har saal kuch banaya.",
  proof: "Numbers bolte hain. Promises nahi.",
  hire: "Apni requirement likho — main khud check karunga kitna match karta hoon.",
  contact: "Baaki sab chhodo — seedha baat karte hain!",
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
  panel.classList.toggle("panel-left", LEFT_PANELS.has(key));
  panelTiltY = LEFT_PANELS.has(key) ? -12 : 12; // turn toward the panel's side
  setSpeech(SPEECH[key]);
  startDance(); // excitement on every open
}

function closePanel() {
  if (!openKey) return;
  openKey = null;
  panel.classList.remove("open");
  backdrop.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  document.querySelectorAll(".orbit-box").forEach((b) => b.classList.remove("is-active"));
  panelTiltY = 0;
  stopDance();
  setSpeech("Wapas aa gaya. Koi aur box try karo — main yahin hoon.");
}

document.querySelectorAll(".orbit-box").forEach((b) => {
  b.addEventListener("click", () => {
    if (Date.now() - (window.__cubeDragAt || 0) < 250) return; // it was a drag, not a tap
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
    result.innerHTML = `<p class="bot-empty">Pehle apni requirement likho — ya neeche ek example dabao.</p>`;
    return;
  }
  const matched = SKILLS.filter((s) => skillMatches(input, s));
  const missing = NOT_HAVE.filter((n) => hasKeyword(input, n));
  const total = matched.length + missing.length;
  if (total === 0) {
    result.innerHTML = `<p class="bot-empty">Isme koi pehchana hua skill nahi mila. Thoda detail me likho — jaise: <em>“Python backend intern — FastAPI, REST APIs, MySQL, Git”</em>.</p>`;
    return;
  }
  const score = Math.round((matched.length / total) * 100);
  const verdict = score >= 80 ? "Strong match — baat karni chahiye."
    : score >= 50 ? "Good match — kuch cheezein seekhni hongi, but base solid hai."
    : "Partial match — main honest rahunga, ye sab mere stack me nahi hai.";
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
  `;
  requestAnimationFrame(() => {
    const bar = result.querySelector(".match-bar span");
    if (bar) bar.classList.add("go");
  });
  setSpeech(score >= 80 ? "Strong match! Ye role mere liye hai — baat karo!" : score >= 50 ? "Good match hai — kuch seekhna padega, but base solid hai." : "Honest answer: isme kuch cheezein mere stack me nahi hain. Phir bhi baat kar sakte ho.");
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
