---
version: delta
name: Ankur Mishra Portfolio v3.3 "Cube Orbit"
description: Dark one-page orbit. Canvas keyed avatar (no white box), real 3D cubes around him, panels open on the box's side, MatchMate hiring bot.
colors:
  page-default: "#070B14"
  surface-default: "#111A2E"
  surface-subtle: "#16233A"
  fill-inverse: "#0E1524"
  content-primary: "#EEF2F8"
  content-muted: "#9AA8BD"
  accent-primary: "#E8590C"
  accent-secondary: "#2DD4BF"
  accent-tertiary: "#F59E0B"
  accent-pink: "#D6336C"
  accent-green: "#2F9E44"
  accent-violet: "#9775FA"
---

# Design Contract — Portfolio v3.3 "Cube Orbit"

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
  intact, no speckles. Poster = transparent avatar.png.
- Pointing: the avatar system only generates dance videos, so there is no separate
  pointing video — the "follow" is the stage tilting in 3D toward the open panel
  (rotateY ±12deg, rAF-lerped) plus the dance.
- Reduced-motion: no autoplay, poster still, no tilt, no float.

## Layout
Desktop: 100dvh stage. 3D extruded name top-centre ("ANKUR MISHRA", layered
saffron text-shadow, perspective tilt) + one-line intro + hint line under it
(the old floor hint overlapped the Hire Me box, so it moved up here).
Avatar centred (canvas 280×498, drop-shadow, no card). Seven REAL 3D cubes in a
ring (Work left-top, Skills right-top, Education left-mid, Journey right-mid,
Proof left-bottom, Contact right-bottom, Hire Me bottom-centre, saffron highlight).
Each cube is a W×H×D cuboid: front face (icon + label), right face (accent,
"Open →"), top face (accent edge), back face (label). Resting pose
rotateX(-14deg) rotateY(-20deg); hover turns it further; drag (pointer) rotates
freely and snaps back; a drag never opens the panel. Panel: fixed sheet, 560px
wide, slides in from the SAME side as the box that was tapped (left boxes →
left sheet, avatar tilts the other way); mobile: bottom sheet. Panel content
scrolls internally — the page itself does not scroll. While a panel is open the
orbit dims to 0.45 with NO blur (blur made the boxes look smeared).

## Panels
- Work: real cards — icon + title + one-liner + proper buttons (Visit site /
  Try it live / GitHub), slight 3D lift on hover. No more plain text links.
- Skills: official brand icons (Simple Icons CDN, `onerror` removes a missing
  one) + 3D tilt chips (hover rotateX/rotateY, perspective parent).

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
