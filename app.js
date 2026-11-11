// Ankur Mishra — portfolio v4.0 "Living Model".
// Full dark UI. A REAL 3D model avatar (Three.js, avatar3d.js) in the
// centre — he waves hi on load, walks in, turns toward the panel you
// tapped and points at it with his OWN arm, flexes for Hire Me, and
// dances while a panel is open. No video, no side graphics (Ankur's call:
// sparkles / music notes / confetti / pointing-hand are gone — the MODEL
// itself moves now, not emojis around him).
// Real 3D cubes orbit around him: hover turns, drag rotates, tap opens a
// panel on THAT box's side.
// MatchMate bot: recruiter posts a requirement, bot checks the match honestly.
// Motion: transform / opacity only. prefers-reduced-motion respected.

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const stage = $("avatarStage");
const bubble = $("speechBubble");
const stateLabel = $("avatarState");

function setSpeech(text) { bubble.textContent = text; }

// ---------- 3D model avatar (avatar3d.js) ----------
// app.js is a classic script, avatar3d.js is a module — it sets
// window.Avatar3D and fires 'avatar3d-ready' when the first frame has
// rendered. Everything below waits for that; if it never arrives (CDN or
// WebGL blocked) the poster fallback shows instead — the page never sits
// empty with no avatar at all.
let dancing = false;
function whenAvatar(fn) {
  if (window.Avatar3D) { fn(window.Avatar3D); return; }
  window.addEventListener("avatar3d-ready", () => fn(window.Avatar3D), { once: true });
}
let fallbackShown = false;
function showFallback() {
  if (fallbackShown) return;
  fallbackShown = true;
  const fb = $("avatarFallback");
  if (fb) fb.hidden = false;
  stateLabel.textContent = "Right now: 3D model could not load — showing photo";
}
window.addEventListener("avatar3d-failed", showFallback);
setTimeout(() => { if (!window.Avatar3D) showFallback(); }, 6000);

function startDance() {
  if (dancing) return;
  dancing = true;
  whenAvatar((A) => A.danceStart());
  stateLabel.textContent = "Right now: EXCITED — dance kar raha hai";
}
function stopDance() {
  if (!dancing) return;
  dancing = false;
  whenAvatar((A) => A.danceStop());
  stateLabel.textContent = "Right now: idle — breathing, listening";
}

// Walk in on load: from off-screen left to centre, then he waves hi
// himself — his own right hand goes up. (Reduced motion: he just stands.)
stateLabel.textContent = "Right now: walking in — hi!";
whenAvatar((A) => {
  if (reduced) { stateLabel.textContent = "Right now: idle — breathing, listening"; return; }
  A.setX(-1.7);
  A.walkTo(0, 1500, () => {
    A.wave();
    stateLabel.textContent = "Right now: idle — breathing, listening";
  });
});
// A little stroll while idle, so he never looks stuck in one place.
function stroll() {
  if (openKey || document.hidden || reduced) return;
  whenAvatar((A) => {
    const dx = (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.14);
    A.walkTo(dx, 900, () => setTimeout(() => { if (!openKey) A.walkTo(0, 900); }, 1200));
  });
}
setInterval(stroll, 22000);

// Tap the model himself: he waves again, answers back, and does a short
// dance if no panel is open.
const TAP_LINES = [
  "Arre — tap kar diya! Main yahin hoon.",
  "Hi! Kuch chahiye to koi box dabao.",
  "Main dance bhi karta hoon — Hire Me dabao!",
  "Bihar se Mumbai — poori kahani Journey me hai.",
];
stage.addEventListener("click", () => {
  setSpeech(TAP_LINES[Math.floor(Math.random() * TAP_LINES.length)]);
  whenAvatar((A) => {
    A.wave();
    if (!openKey) {
      A.danceStart();
      setTimeout(() => { if (!openKey) A.danceStop(); }, 3000);
    }
  });
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
// The panel opens on the same side as the box that was tapped, and the
// MODEL turns toward it and points at it with his own arm.
// Left boxes: Work, Education, Proof.
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
  const isLeft = LEFT_PANELS.has(key);
  // He turns toward the panel, points at it with his own arm, and steps
  // aside so he stays visible next to the sheet instead of under it.
  whenAvatar((A) => {
    A.pointAt(isLeft ? "left" : "right");
    A.walkTo(isLeft ? 0.35 : -0.35, 600);
  });
  setSpeech(SPEECH[key]);
  startDance(); // excitement on every open
  if (key === "hire") {
    // Flex emote: he puffs up and shows off for recruiters — no confetti,
    // the MODEL does the celebrating now.
    whenAvatar((A) => A.flex());
    stateLabel.textContent = "Right now: FLEXING — hire me energy";
  }
}

function closePanel() {
  if (!openKey) return;
  openKey = null;
  panel.classList.remove("open");
  backdrop.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  document.querySelectorAll(".orbit-box").forEach((b) => b.classList.remove("is-active"));
  whenAvatar((A) => {
    A.pointAt(null);
    A.walkTo(0, 600); // walk back to centre
  });
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
