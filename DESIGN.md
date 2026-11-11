---
version: zeta
name: Ankur Mishra Portfolio v3.6 "Home Orbit"
description: Warm dark one-page orbit over a personal-area photo background. Contain-fit avatar poster, real 3D cubes in a phone ring too, journey tracker, education cards with real photos + bg-removed icons, per-section panel themes, MatchMate NLP (stemming + synonyms).
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

# Design Contract — Portfolio v3.6 "Home Orbit"

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
