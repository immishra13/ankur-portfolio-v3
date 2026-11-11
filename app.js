// Ankur Mishra — portfolio v3.2 "The Orbit".
// Full dark UI. Avatar in the centre. 3D boxes orbit around him.
// Tap a box → panel opens, avatar gets excited (dance) and turns toward the panel.
// MatchMate bot: recruiter posts a requirement, bot checks the match honestly.
// Motion per design-motion-principles: Jakub primary · Jhey secondary · Emil selective.
// transform / opacity / filter only. prefers-reduced-motion respected.

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// ---------- Avatar videos: idle <-> dance ----------
const idle = $("videoIdle");
const dance = $("videoDance");
const bubble = $("speechBubble");
const stateLabel = $("avatarState");
let dancing = false;

function setSpeech(text) { bubble.textContent = text; }
function startDance() {
  if (dancing) return;
  dancing = true;
  idle.pause();
  idle.classList.add("avatar-video-hidden");
  dance.classList.remove("avatar-video-hidden");
  dance.classList.remove("dancing");
  void dance.offsetWidth;
  dance.classList.add("dancing");
  dance.currentTime = 0;
  dance.play().catch(() => {});
  stateLabel.textContent = "Right now: EXCITED — dance kar raha hai";
}
function stopDance() {
  if (!dancing) return;
  dancing = false;
  dance.pause();
  dance.classList.add("avatar-video-hidden");
  idle.classList.remove("avatar-video-hidden");
  if (!reduced) idle.play().catch(() => {});
  stateLabel.textContent = "Right now: idle — breathing, listening";
}
dance.addEventListener("ended", stopDance);
if (reduced) { idle.removeAttribute("autoplay"); idle.pause(); }

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

// ---------- Panels ----------
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
  panelTiltY = 12; // avatar turns toward the panel (right side)
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
    if (openKey === b.dataset.panel) { closePanel(); return; }
    openPanel(b.dataset.panel);
  });
});
$("panelClose").addEventListener("click", closePanel);
backdrop.addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });

// ---------- MatchMate bot ----------
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
  { label: "NLP", keys: ["nlp", "natural language"], proof: ["AwaazRoute", "Financial Complaint Classifier"] },
  { label: "scikit-learn", keys: ["scikit-learn", "scikit learn", "sklearn", "scikit"], proof: ["AwaazRoute", "Financial Complaint Classifier"] },
  { label: "XGBoost", keys: ["xgboost"], proof: ["Personality Prediction model"] },
  { label: "YOLO / Computer Vision", keys: ["yolo", "computer vision", "opencv"], proof: ["Sign Language + YOLO"] },
  { label: "GenAI / AI Agents", keys: ["genai", "generative ai", "ai agent", "ai agents", "llm"], proof: ["AwaazRoute"] },
  { label: "Blockchain / Web3", keys: ["blockchain", "web3", "solidity"], proof: ["E-WasteChain"] },
  { label: "Full-stack", keys: ["full stack", "full-stack", "fullstack"], proof: ["FixMateHub"] },
  { label: "Frontend", keys: ["frontend", "front-end", "front end"], proof: ["FixMateHub"] },
  { label: "Backend", keys: ["backend", "back-end", "back end"], proof: ["FixMateHub", "RTI Black Hole"] },
  { label: "Automation", keys: ["automation", "automate"], proof: ["AwaazRoute"] },
  { label: "Chrome Extensions", keys: ["chrome extension", "extension"], proof: ["MyTab extension"] },
  { label: "Events & Weddings", keys: ["event", "events", "wedding", "weddings", "logistics", "hospitality", "vendor"], proof: ["50+ weddings & corporate events"] },
  { label: "Data Analytics", keys: ["data analytics", "big data", "analytics"], proof: ["Sem 7: Big Data Analytics"] },
];
const NOT_HAVE = [
  "Java", "AWS", "Azure", "Kubernetes", "DevOps", "Terraform", "TypeScript",
  "Angular", "Vue", "PHP", "Laravel", "Django", "Golang", "Rust", "C++",
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
  const matched = SKILLS.filter((s) => s.keys.some((k) => hasKeyword(input, k)));
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
