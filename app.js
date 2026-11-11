// Ankur Mishra — portfolio v3.
// Avatar follows the cursor (pupils + tilt, transform only).
// Role filter reshapes the work grid. Counters animate on view.

const $ = (id) => document.getElementById(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Avatar: pupils + tilt follow the pointer ----
const stage = $("avatarStage");
const tilt = $("avatarTilt");
const pupilL = $("pupilL");
const pupilR = $("pupilR");
const img = $("avatarImg");

// Pupil home positions, in % of the avatar image box.
const PUPILS = [
  { el: pupilL, x: 44.5, y: 11.4 },
  { el: pupilR, x: 55.5, y: 11.4 },
];

function followPointer(clientX, clientY) {
  if (reduced || !stage || !tilt) return;
  const r = img.getBoundingClientRect();
  if (!r.width) return;
  // Where is the pointer, relative to the centre of the avatar?
  const dx = (clientX - (r.left + r.width / 2)) / window.innerWidth;
  const dy = (clientY - (r.top + r.height / 2)) / window.innerHeight;
  const cx = Math.max(-1, Math.min(1, dx * 2));
  const cy = Math.max(-1, Math.min(1, dy * 2));
  // Whole avatar leans toward the cursor (small, transform only).
  tilt.style.transform = `rotateY(${cx * 5}deg) rotateX(${-cy * 4}deg) translateX(${cx * 6}px)`;
  // Pupils move a few px toward the cursor.
  for (const p of PUPILS) {
    p.el.style.left = `calc(${p.x}% + ${cx * 4}px)`;
    p.el.style.top = `calc(${p.y}% + ${cy * 3}px)`;
  }
}

if (stage) {
  stage.addEventListener("pointermove", (e) => followPointer(e.clientX, e.clientY));
  document.addEventListener("pointermove", (e) => {
    // Keep following even when the pointer leaves the avatar card.
    if (!stage.matches(":hover")) followPointer(e.clientX, e.clientY);
  });
  stage.addEventListener("pointerleave", () => {
    if (tilt) tilt.style.transform = "";
    for (const p of PUPILS) {
      p.el.style.left = `${p.x}%`;
      p.el.style.top = `${p.y}%`;
    }
  });
}

// ---- Speech bubble: tap the avatar, it talks ----
const LINES = [
  "Namaste! I am Ankur — move your cursor, I am watching. Tap me.",
  "I build things that work. Scroll down and try them live.",
  "Hiring for AI/ML? Tap the AI & ML filter above.",
  "Hiring for events? I have run 50+ weddings. See the Events filter.",
  "My CV is one tap away — Tech or Events, your pick.",
  "FixMateHub is my real business. 1000+ customers, not a college demo.",
];
let lineIdx = 0;
const speechBtn = $("speechBtn");
if (speechBtn) {
  speechBtn.addEventListener("click", () => {
    lineIdx = (lineIdx + 1) % LINES.length;
    speechBtn.textContent = LINES[lineIdx];
  });
}

// ---- Role filter: the work reshapes for the recruiter ----
const filterBtns = document.querySelectorAll(".role-filter button");
const cards = document.querySelectorAll("#projectGrid .project");
const filterStatus = $("filterStatus");
const ROLE_LABELS = { all: "all", ai: "AI & ML", backend: "Backend", fullstack: "Full-stack", events: "Events" };

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    const role = btn.getAttribute("data-role");
    let shown = 0;
    cards.forEach((card) => {
      const roles = (card.getAttribute("data-roles") || "").split(" ");
      const show = role === "all" || roles.includes(role);
      card.hidden = !show;
      if (show) shown += 1;
    });
    if (filterStatus) {
      filterStatus.textContent =
        role === "all"
          ? `Showing all ${shown} pieces of work.`
          : `Showing ${shown} piece${shown === 1 ? "" : "s"} of work for ${ROLE_LABELS[role]}.`;
    }
  });
});

// ---- Two worlds toggle ----
const worldBtns = document.querySelectorAll(".world-toggle button");
const worldTech = $("worldTech");
const worldEvents = $("worldEvents");
worldBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    worldBtns.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    const world = btn.getAttribute("data-world");
    if (worldTech) worldTech.hidden = world !== "tech";
    if (worldEvents) worldEvents.hidden = world !== "events";
  });
});

// ---- Counters animate once, on view ----
const counters = document.querySelectorAll(".count");
function animateCount(el) {
  const target = parseFloat(el.getAttribute("data-count"));
  const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
  if (reduced) {
    el.textContent = target.toFixed(decimals);
    return;
  }
  const start = performance.now();
  const dur = 900;
  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => io.observe(c));
} else {
  counters.forEach(animateCount);
}

// ---- Reveal on scroll ----
const revealEls = document.querySelectorAll(".card, .world-panel, .timeline li, .skills div");
revealEls.forEach((el) => el.classList.add("reveal"));
if ("IntersectionObserver" in window && !reduced) {
  const ro = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          ro.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => ro.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}
