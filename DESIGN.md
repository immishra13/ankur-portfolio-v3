---
version: zeta
name: Ankur Mishra Portfolio v4.0 "Living Model"
description: Warm dark one-page orbit over a personal-area photo background. REAL 3D model avatar (Three.js) in the centre — he waves, walks, points and dances himself; no video, no side graphics. Real 3D cubes in a phone ring too, journey tracker, education cards with real photos + bg-removed icons, per-section panel themes, MatchMate NLP (stemming + synonyms).
colors:
  page-default: "#0d0a07"
  surface-default: "#1c150e"
  surface-subtle: "#261c11"
  fill-inverse: "#161009"
  content-primary: "#f5efe6"
  content-muted: "#b3a48f"
  accent-primary: "#E8590C"
  accent-secondary: "#2DD4BF"
  accent-tertiary: "#F59E0B"
  accent-pink: "#D6336C"
  accent-green: "#2F9E44"
  accent-violet: "#9775FA"
---

# Design Contract — Portfolio v4.0 "Living Model"

## Concept (Ankur's own words, 2026-11-11)
Full dark UI so everything written on it pops. Ankur in the centre. 3D boxes floating
in the air around him — Skills, Education, Work, Hire Me, Journey, Proof, Contact.
Almost no scrolling: one page, the centre stays put, the boxes orbit around him.
Avatar must move fully — hands, head, body. A 3D name + short intro near the avatar.
Click a box → avatar gets excited and follows (turns toward the panel), and a beautiful,
easy-to-read section opens. A chatbot on the home page with its own name — MatchMate —
whose job is: recruiter posts a requirement, it checks how much Ankur's skills match.
Contact box opens icons (WhatsApp, Gmail, LinkedIn, GitHub, Instagram) with the name
below; tapping redirects straight there. See `~/workspace/custom-skills/ankur_design_taste/SKILL.md`
for the standing version of this taste.

## Avatar
Same look (his face, Maithili kurta-paag-dhoti). Real video, no fake pupils,
drawn on a canvas with LIVE chroma-key — the white video background is removed
per frame, so the avatar floats directly on the dark page (no white box):
- `avatar-idle.mp4` — 9.7s loop: breathing, head tilt, talking.
- `avatar-dance.mp4` — 8s full body: arms, legs, turning, smiling. Plays when any box
  opens (excitement), then returns to idle.
- Keying: per-pixel Euclidean distance from white (< 75 → transparent, 75–95 soft
  edge, despill on fringe). Transparent VP9/WebM alpha was tried first and failed
  (encoder fed yuva420p still wrote Profile 0, no alpha) — canvas keying is the
  shipped route. Verified on real frames: idle + dance key cleanly, face/kurta/paag
  intact, no speckles.
- POSTER BUG (found 2026-11-11, v3.4 fix): the poster `avatar.png` is a tall
  610×1530 still. Cover-fitting it on the 360×640 canvas cropped 131px off the
  top and bottom — the head was cut off on first load, and only appeared after
  opening a box (which switched to the fitting dance video). Fix: the poster is
  now drawn CONTAINED (whole figure, head included) until the first keyed video
  frame takes over. Source videos are kept off-screen with 1px opacity-0
  positioning, never `display:none` — phones suspend display:none videos.
  A `playing` listener keys one frame immediately on every video switch, so the
  canvas never shows a stale frame from the other video.
- Pointing: the avatar system only generates dance videos, so there is no separate
  pointing video — the "follow" is the stage tilting in 3D toward the open panel
  (rotateY ±12deg, rAF-lerped) plus the dance.
- Reduced-motion: no autoplay, poster still, no tilt, no float.

## Layout
Warm dark ("home") theme — warm charcoal base (#0d0a07) with amber/terracotta
glows, clean, never cluttered. Desktop: 100dvh stage. Name block top-centre:
small gold "Hi, I am" line, then the big 3D extruded "ANKUR MISHRA", then the
tagline + one-line intro + hint. Avatar centred (canvas 280×498, drop-shadow,
no card). Seven REAL 3D cubes in a ring (Work left-top, Skills right-top,
Education left-mid, Journey right-mid, Proof left-bottom, Contact right-bottom,
Hire Me bottom-centre, saffron highlight). Each cube is a W×H×D cuboid: front
face (icon + label), right face (accent, "Open →"), top face (accent edge), back
face (label). Resting pose rotateX(-14deg) rotateY(-20deg); hover turns it
further; drag (pointer) rotates freely and snaps back; a drag never opens the
panel. Panel: fixed sheet, 560px wide, slides in from the SAME side as the box
that was tapped (left boxes → left sheet, avatar tilts the other way); mobile:
bottom sheet. Panel content scrolls internally — the page itself does not
scroll. While a panel is open the orbit dims to 0.45 with NO blur (blur made
the boxes look smeared).
Phone (≤960px): the SAME ring, smaller — avatar canvas 200×356, cubes 104×80,
boxes at 25% / 46% / 63% heights around him, Hire Me bottom-centre. Cubes stay
3D and draggable on touch (`touch-action: none` on cubes). No grid below the
avatar — that was the v3.3 phone bug.

## Panels
- Work: real cards — icon + title + one-liner + proper buttons (Visit site /
  Try it live / GitHub), slight 3D lift on hover. No more plain text links.
- Skills: official brand icons (Simple Icons CDN, `onerror` removes a missing
  one) + 3D tilt chips (hover rotateX/rotateY, perspective parent). Includes an
  Events &amp; Management group (Event Planning, Weddings, Corporate Events,
  Logistics, Hospitality, Vendor Management, Client Handling, Budgeting, Team
  Leadership, Stage Management) from his event work.
- Journey: a route-map tracker, not a list — Bihar → Mumbai header, progress
  bar (86%, "You are here — 2026"), vertical line with a node per year, the
  2026 card tagged YOU ARE HERE, 2027 tagged DESTINATION.
- Education: real-photo cards — VIVA card uses a real campus photo
  (`assets/viva-campus.jpg`, entrance banner + glass building, cropped from a
  real VIVA photo); NPTEL card uses the real transparent NPTEL logo
  (`assets/nptel-logo.png`); HSC/SSC use clean cap-icon cards (his school
  name is not on record, so no school photo is faked — add it when he gives
  the name). Background removal was tried for the VIVA photo (rembg u2netp kept
  only the banner; full u2net OOM-killed the VM; flood fill cannot separate the
  sky from the sky-reflecting glass) — the cropped real photo is the shipped
  result, and it is honest.

## MatchMate bot (Hire Me)
Input + 5 example chips → keyword match against a real skill DB (26 skills with
proof projects) + a not-in-stack list (Java, AWS, TypeScript, …). Score =
matched / (matched + missing). Shows % with a bar, matched chips, missing chips,
proof projects (max 3), and an honest verdict. No keywords found → asks for detail.
Never claims 100% it cannot prove. CV download buttons below the result.

## Motion — design-motion-principles (Create mode)
Creative portfolio → Jakub primary · Jhey secondary · Emil selective.
- Frequency gate: box clicks + panel close = occasional → 450ms panel slide, 180ms
  button feedback, no bounce. Dance + float = rare delight → expressive.
- Easing: custom cubic-bezier only. Never bare `ease`.
- Anti-checklist: no pulsing indicators, no uniform fade-ins, no stagger spam,
  no hover-scale-on-everything (only the primary CTA and boxes lift slightly).
- Performance: transform / opacity / filter only. Direct style updates for tilt/drag.
- Accessibility: `prefers-reduced-motion` kills all animation/transition/video
  autoplay. Panels close with Escape, backdrop click, or the × button.

## Rules
- Plain HTML/CSS/JS. No framework, no Tailwind, no build step.
- Dark theme tokens above. One button pair. Zero emoji in UI. Real SVG icons only.
- All facts from Ankur's master profile + Tech Resume + Event CV. No invented claims.
- Every external link verified HTTP 200 before launch.
- Footer links to portfolio v2 (untouched).


## v3.5 — "Home Orbit" (2026-11-11)
- Personal-area background: generated warm workspace photo (Madhubani art, lamp, laptop, books) as a fixed `body::before` layer, darkened with a warm gradient overlay; responsive (mobile: position center 22%).
- Avatar slimmer: `.avatar-canvas` scaleX(0.93), kept through the dance-pop keyframes. On load a waving-hand SVG (`assets/wave-hand.svg`, Twemoji) greets beside the avatar for ~5s, then fades; speech bubble opens with "Hi! I'm Ankur — tap a box, let's talk." The idle video itself cannot be re-shot with a smile (avatar system only makes dance videos) — the greeting is the fix.
- Education icons per the original command: VIVA entrance banner bg-removed with rembg isnet-general-use, cropped to the banner (409x115, transparent) as the top visual; NPTEL logo (already transparent); Shri Nawab High School real photo (Instagram reel thumbnail by Ankesh Singh, rotated, text cropped out); DPS Lagma gate photo (JustDial catalogue). BG removal DESTROYS building photos (verified 3x: u2netp + isnet on VIVA, isnet on Sheohar — keeps only ~5%): buildings stay as cropped photos, banners/logos stay as transparent icons. Schools: Shri Nawab High School, Sheohar (Bihar Board 2022); DPS Lagma, Sitamarhi (CBSE 2020) — Lagma is the district's senior-secondary DPS nearest Sheohar; if Ankur's branch is Pupri or another, swap the photo.
- Work panel now 12 cards from ALL sources (CV + LinkedIn + GitHub, 24 public repos listed 2026-11-11): added MyTab, SignSight (Dual Vision repo), Personality Prediction (split from the old combined card), Event Management System, CABMANAGEMENT, FixMateHub Mate Connect; Preview Cloud now links its real repo (cloud-preview); "More on GitHub" row lists the 9 smaller repos by name+link only.
- MatchMate NLP upgrade: light stemmer (suffix stripping, looped) + synonym groups with prefix matching, so logistic=logistics, management=manager, supply chain=logistics, wedding planner=event planning. 23/23 Node tests pass (incl. no false positives: "sign language" does NOT match NLP, "javascript function" does NOT match Weddings). NOT_HAVE still exact-phrase only.
- Per-section panel themes (each panel its own design, not one repeated layout): eyebrow pill per section (Workshop / Toolbox / Campus / Route map / Scoreboard / MatchMate / Calling cards), workshop dashed work cards + LIVE/GitHub tags, toolbox h3 labels, scoreboard 2-up stat grid, contact accent top edges.
- LinkedIn profile read (browser task) was still running when v3.5 shipped; its education/projects/certifications go into v3.5.1.

## v3.5.1 — LinkedIn pass (2026-11-11)
- LinkedIn profile read in full (browser task, read-only): 3 education entries, 1 role, 30 skills, 1 certification, 9 activity posts.
- Education: added Kushal Yuva Program (BS-CIT/BS-CLS/BS-CSS, Nov 2021-Mar 2022, Grade A+), MongoDB certification (Jun 2025, Credly), Google Foundations of Cybersecurity (Coursera, from his activity post — not in LinkedIn's Certifications section, labelled as such in docs only).
- Skills: added PHP, Firebase, React Native, RAG, LangChain, MCP, People & Process group (Project Management, Management, Communication, Web Design, Responsive Web Design); note about Office/Excel/PowerPoint LinkedIn assessments.
- MatchMate: added Firebase, PHP, React Native, LangChain/RAG, MCP, n8n/Zapier automation, Web Design, Project Management, Communication; PHP REMOVED from NOT_HAVE (he has it — LinkedIn lists PHP). 12/12 new tests pass, 23/23 old tests still pass.
- Work cards enriched from his LinkedIn posts: RTI Black Hole (transparency score, 4 role portals), Financial Complaint Classifier (CFPB dataset, VADER sentiment, probability breakdown).

## v3.5.2 — Hotfix (2026-11-11)
- A version-bump typo put a stray space in the asset URLs (`styles.css ?v=3.5.1`), so the live site briefly loaded with no styling and no JS. Fixed to `?v=3.5.2`; live index.html href/src and all versioned URLs verified 200. Lesson: after any version bump, verify the LIVE index.html href/src values and that the versioned CSS/JS URLs return 200 — checking the unversioned file is NOT enough.

## v3.5.3 — Background visibility fix (2026-11-11)
- Live re-check found the background photo effectively invisible: the 0.78–0.86 dark overlay hid the Madhubani painting, lamp and laptop. Overlay lightened to 0.52–0.68 so the workspace scene shows through while cream text stays readable. Nothing else changed.

## v3.6 — Ankur's own photos, moving avatar, journey map (2026-11-11)
- BACKGROUND, REAL ROOT CAUSE: Ankur's phone screenshot proved the photo was STILL invisible after v3.5.3. The overlay was never the problem — `.orbit`'s opaque `var(--bg)` base painted over `body::before` across the whole 100dvh hero. Base is transparent now (warm glows only); overlay lightened to 0.48–0.62. Lesson: check what actually covers a layer, not just the layer itself.
- EDUCATION — HIS EXACT IMAGES, AS ICONS: Ankur sent his own photos (DPS red/yellow building, Shri Nawab cream building, VIVA banner + glass building) and logos (NPTEL, Kushal Yuva). Cards now use 76px icons, not full-width banners: photos are rounded cover-crops; the two white-background logos got a clean white-to-alpha cut (rembg isnet made them foggy — verified visually — so PIL white-to-alpha + autocrop was used instead) and sit on a light cream tile. Building photos are NEVER bg-removed (rembg destroys them, verified 3x). Old reel-thumbnail / gate photos retired (files remain in assets/ unused).
- AVATAR MOVES (code, not new video): the avatar system only makes dance videos — no walk/point/biceps/smile video exists and none can be generated. So the STAGE moves in JS: walk-in from off-screen left on load (1.5s, step-bob, "walking in — hi!"), a small stroll every 22s while idle, a shift away from the open panel + a pointing-hand SVG on the panel's side (bobbing toward it) on every box tap, and a flex-pose scale bounce + "FLEXING — hire me energy" on Hire Me. `prefers-reduced-motion` disables the movement.
- JOURNEY MAP: the panel now opens with a hand-built SVG route map in the style of Ankur's reference sketch — winding road (pale + dashed gold centre line), one dot per year (positions verified numerically on the cubic path, max 0.5px off), pin at Sheohar 2020, person marker at YOU ARE HERE 2026, flag at DESTINATION 2027. The year-by-year list stays below it.

## v3.6.1 — Hotfix: pointing hand was never uploaded (2026-11-11)
- Visual check caught a broken-image placeholder beside the dancing avatar in every excited state. Root cause: `assets/point-hand.svg` was created locally but never included in the v3.6 push manifest (only the 5 text files were listed) — so the live page referenced a 404. Fixed by pushing the file itself, plus the two stale header comments (styles.css said v3.5, app.js said v3.3). Lesson: when a new asset is referenced, the push manifest must list it — verify every new asset URL returns 200 live, not just the text files.

## v4.0.3 — Hotfix: poster fallback was always visible, model pushed off-screen (2026-11-11)
- Main-page check of v4.0.2 failed: the poster showed in the centre AND the 3D figure was cropped at the top (head off-screen), so no wave/point/flex was visible — though the state labels and arm flicks proved the animation logic was running. Root cause (one line): `.avatar-fallback { display: block; }` beats the UA stylesheet's `[hidden] { display: none }`, so the `hidden` poster was visible from the first paint — inflating the stage to ~1300px tall and pushing the 380×520 mount up off the viewport. Fixed: `.avatar-fallback[hidden] { display: none; }`. Also: tapping the avatar now sets the state label to "waving hi!" for the 2.6s wave (it previously stayed "idle" during the wave).

## v4.0.2 — Hotfix: poster fallback could overlap the live model (2026-11-11)
- Re-check of v4.0.1 passed (model renders, waves, points, flexes, dances — see below) but exposed two robustness gaps: (1) if the model loads AFTER the fallback timeout fired, the poster stayed visible under the live canvas — now `avatar3d-ready` re-hides the fallback; (2) the fallback timeouts were tight for a cold CDN load (6s main page / 8s test page) — raised to 10s / 12s. Note: the re-check's first run showed the OLD v4.0 page (title "v4.0", cached) timing out — that was the stale cache, not v4.0.1 failing.

## v4.0.1 — Hotfix: the model never started (2026-11-11)
- First visual check (test-3d.html, two loads): black viewport, "TIMEOUT — Avatar3D never loaded" — no figure at all. Root cause: `avatar3d.js` defined `init()` and exposed it on `window.Avatar3D`, but NOTHING ever called `init()` — neither the module itself nor app.js. The page waited for `avatar3d-ready` forever. Fixed: the module auto-starts when it finds `#avatar3d` (module scripts run after the document parses, so the mount exists). Lesson: an API that is never invoked is dead code — verify the init path, not just the API shape.

## v4.0 — Living Model: the avatar is a real 3D model now (2026-11-11)
- Ankur's correction, 2026-11-11 evening: the v3.7 sparkles / music notes / confetti / pointing-hand were winner's misread — he never asked for side graphics. He wants the avatar MODEL itself to move: raise his own hand to say hi and move himself toward the selected cube. The wave-video try failed honestly (all 7 existing clips checked frame-by-frame — no wave anywhere; avatar.edit generate_videos returned no_missing, dance catalog exhausted). He chose the 3D model path.
- `avatar3d.js` (new, Three.js r160 via jsdelivr importmap): procedural low-poly character styled like his illustrated avatar — cream Madhubani kurta (canvas texture: sun neckline design, placket + buttons, diamond hem border), magenta dhoti, yellow paag with fish + diamond border (canvas texture), skin-tone head with geometry face (eyes, brows, nose, mustache, beard, two mouths — neutral line + smile arc), cream juttis. Face is a stylised illustration-style face, NOT his photo — told to him when he picked this path.
- Animation is all code (damped joint targets + timed modes): idle breathing + look-around + cursor follow (fine pointers only); walk-in from off-screen left then a real WAVE (right arm up beside the head, forearm waving); stroll every 22s; on panel open he TURNS toward the panel (root Y ±0.3), POINTS at it with his own arm (shoulder ±1.5 rad), steps aside, and dances (procedural: hips sway, arms pump, knees bounce); Hire Me fires a FLEX (both elbows bent up, chest out, smile); tap him = wave + short dance. Real contact shadow (directional light + ShadowMaterial plane) + a soft blob that follows his feet. `prefers-reduced-motion` renders one static frame.
- app.js talks to it through `window.Avatar3D` + the `avatar3d-ready` event (module scripts load after the classic script); if the CDN/WebGL fails, a poster fallback (`avatar.png`, hidden by default) shows after 6s / on `avatar3d-failed` — the page never sits empty.
- REMOVED in v4.0: avatar videos (files stay in the repo, unused — delete later), canvas chroma-key, fx layer (sparkles/notes/confetti), pointing-hand + wave-hand SVGs (files stay, unused), ground-shadow div, tilt loop, moveStage. The stage no longer moves via --mx/--my — the MODEL walks inside the 380×520 mount.
- New file `test-3d.html` (not linked): standalone model demo — walk-in → wave → point + dance → flex — for isolated render checks.
- Honest limit: the model is a stylised low-poly character. It moves exactly as asked, but it is not photoreal and its face is drawn, not his photo.

## v3.7 — More motion graphics on the avatar (2026-11-11)
- Still code-only (no new video exists): gold sparkles drift up around him every ~1.1s (max 10 live), music notes float up while he dances, a ground shadow under his feet shrinks as he bobs (also hides the faint white patch under his feet in the dance video), and with no panel open he slowly glances around (idle look-around sway ±4°, ~16s cycle — the tilt loop now runs on touch devices too, not just fine pointers).
- Tap the avatar himself: he waves again, a sparkle burst fires, a random line appears in the speech bubble, and he starts dancing.
- Hire Me now fires a 12-piece gold/teal/pink confetti burst with the flex pose.
- Restraint: all effects are transform/opacity only, capped counts, `prefers-reduced-motion` hides them entirely.

## v3.7.3 — Fix: confetti veiled by backdrop, shadow has no ground at idle (2026-11-11)
- Visual check of v3.7.2 passed the avatar tap (dances, waves, new bubble lines) — but confetti was still unseen in 3 attempts and sparkles still looked sparse (1–2 at once), and the shadow was still invisible. Root causes, found by reading the actual video frames, not guessing: (1) The confetti fires exactly when the panel opens — and the panel backdrop is a 55% dark veil (z-index 20) over the whole hero, dimming the burst. Fixed: `body.panel-open .avatar-stage { z-index: 21 }` lifts the avatar + all its effects above the backdrop (panel itself is 30), so he stays bright while a panel is open. (2) The burst was still too small/fast for a screenshot-based check. Fixed: 24 pieces × 3 waves (0/400/800ms), 14px dots with strong glow, 2.2s flight, opacity holds to 55% — visible ~3s. Sparkles: 8px, 2 per tick, opacity holds to 65% (~5–6 clearly visible). (3) The shadow: I extracted real frames — the IDLE video is framed waist-up (kurta hem cut at the frame edge, no feet, no ground), the DANCE video is full-body with feet. So a shadow at idle floats over the desk in the background photo and reads as nothing. Fixed: the shadow is now opacity 0 at idle and fades in only while he dances (`show-shadow` class in startDance/stopDance). Honest limit to tell Ankur: the idle video itself is waist-up — feet appear only when he dances. That is the generated video, not a bug.

## v3.7.2 — Fix: avatar untappable, confetti too quick to see (2026-11-11)
- Visual check of v3.7.1 passed the avatar position, boxes, sparkles (sparse) and music notes — but tapping the avatar did nothing and no confetti was seen on Hire Me. Root causes: (1) `.orbit-boxes` covers the whole hero (`inset: 0`, z-index 3, above the stage) with NO `pointer-events: none` — it ate every click meant for the avatar, while the buttons inside still worked. Fixed: container `pointer-events: none`, boxes `pointer-events: auto`, avatar gets `cursor: pointer`. Lesson: a full-screen overlay layer must always declare pointer-events, or everything under it is dead. (2) The confetti DID fire (the FLEXING label in the same branch was seen), but one 0.9s burst of 8px dots is too quick to catch while the panel slides in. Fixed: 16 pieces, 10px with glow, 1.4s, fired twice 350ms apart (~1.8s total). Sparkles also thickened (every 800ms, was 1100ms) after the "sparse" note, and the ground shadow got a faint warm halo so it reads against the dark desk in the background photo.

## v3.7.1 — Hotfix: v3.7 killed the whole script on load (2026-11-11)
- Visual check found the avatar stuck off-screen left, boxes dead, no effects at all. Root cause: the new idle look-around line read `openKey` inside the tilt loop's IIFE, which runs synchronously during script evaluation — but `openKey` is declared later (`let`, temporal dead zone) → `ReferenceError` → the ENTIRE script died before the walk-in, panels, and effects were even defined. The old status text ("idle — breathing, listening") was just the hardcoded HTML, not a completed walk-in. Fixed by using `panelTiltY !== 0` (set in lockstep with panel open/close, declared before the loop) as the "panel open" proxy. Lessons: (1) never read a later-declared `let` from code that runs synchronously at eval time — `node --check` only proves syntax, it cannot see TDZ errors; (2) a DOM-stub smoke test (`/tmp/appjs-smoke.js`) now proves the script evaluates without throwing — run it on every JS change, and it was verified to catch the v3.7 bug (ReferenceError) while passing the fix.
