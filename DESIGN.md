---
version: gamma
name: Ankur Mishra Portfolio v3.2 "The Orbit"
description: Dark one-page orbit. Living avatar in the centre, 3D boxes around him, panels on tap, MatchMate hiring bot.
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

# Design Contract — Portfolio v3.2 "The Orbit"

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
Same look (his face, Maithili kurta-paag-dhoti). Real video, no fake pupils:
- `avatar-idle.mp4` — 9.7s loop: breathing, head tilt, talking.
- `avatar-dance.mp4` — 8s full body: arms, legs, turning, smiling. Plays when any box
  opens (excitement), then returns to idle.
- Pointing: the avatar system only generates dance videos, so there is no separate
  pointing video — the "follow" is the stage tilting in 3D toward the open panel
  (rotateY +12deg, rAF-lerped) plus the dance. Poster = avatar.png.
- Reduced-motion: no autoplay, poster still, no tilt, no float.

## Layout
Desktop: 100dvh stage. 3D extruded name top-centre ("ANKUR MISHRA", layered
saffron text-shadow, perspective tilt) + one-line intro. Avatar centred. Seven boxes
in a ring (Work left-top, Skills right-top, Education left-mid, Journey right-mid,
Proof left-bottom, Contact right-bottom, Hire Me bottom-centre, saffron highlight).
Each box floats gently (different delays, transform only). Panel: fixed right sheet
(460px), slides in with transform; mobile: bottom sheet. Panel content scrolls
internally — the page itself does not scroll.

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
