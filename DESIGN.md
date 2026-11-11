---
version: beta
name: Ankur Mishra Portfolio v3.1
description: Recruiter-first portfolio. Madhubani roots, modern code. Living video avatar, one different world per section.
colors:
  page-default: "#FAF7F2"
  surface-default: "#FFFFFF"
  surface-subtle: "#F3EFE7"
  fill-inverse: "#16233A"
  content-primary: "#1C2733"
  content-muted: "#5A6472"
  accent-primary: "#E8590C"
  accent-secondary: "#0F766E"
  accent-tertiary: "#F59E0B"
  surface-dark: "#0E1524"
  accent-pink: "#D6336C"
  accent-green: "#2F9E44"
  accent-violet: "#7048E8"
---

# Design Contract — Portfolio v3.1

## Concept
"Madhubani roots, modern code." One concept, but every section is a different world:
hero (navy, 3D stage), marquee ticker (saffron), work (cream, 3D tilt cards, one accent per
project), proof (black, huge numbers), two worlds (split Tech/Events, clip-path wipe),
skills (3D cube), journey (horizontal scroll-snap), contact (saffron-soft, magnetic buttons).

## Avatar — LIVING VIDEO (v3.1 fix)
v3.0 used a static PNG with fake pupil dots — Ankur was right, the dots looked odd and the
avatar just stood there. v3.1 uses real video of his own avatar:
- `avatar-idle.mp4` — 9.7s loop, muted, autoplay: breathing, head tilt, subtle talking.
- `avatar-dance.mp4` — 8s, full body: arms up, legs stepping, turning, smiling.
- "Dance karo" swaps idle → dance (plays, then auto-returns to idle). "Bolo kuch" cycles
  speech lines. Poster = avatar.png (transparent PNG). Reduced-motion: no autoplay, poster still.
- Stage tilts in 3D toward the cursor (rotateX/Y, rAF-lerped, interruptible).

## Motion — design-motion-principles (Create mode)
Context: creative portfolio → Primary Jakub · Secondary Jhey · Selective Emil.
- Frequency gate: role filter + nav + world toggle = frequent → 180ms, no bounce.
  Dance + cube = rare delight → expressive, longer, bounce easing allowed.
  Scroll reveals = occasional → 450ms, selective.
- Easing: custom cubic-bezier only (`--ease-out`, `--ease-snappy`, `--ease-spring`,
  `--bounce` linear()). Never bare `ease`.
- Enter = opacity + translateY + blur, but SELECTIVE: hero + section headers only.
  No uniform fade-in on cards/lists/body copy, no stagger spam, no hover-scale-on-everything,
  no pulsing indicators (per the skill's anti-checklist).
- Exit subtler than enter (world panel wipe uses clip-path inset, 0.45s).
- Performance: transform / opacity / filter only. Direct style updates for drag/tilt.
  Magnetic buttons: max ~6px pull, transform only.
- Accessibility: `prefers-reduced-motion` kills all animation/transition, stops video
  autoplay, freezes the cube at one angle. All motion has a non-motion alternative.

## Rules
- Plain HTML/CSS/JS. No framework, no Tailwind, no build step.
- One design system (tokens above). One card style, one button pair.
- Zero emoji in UI. Real SVG icons only.
- All facts from Ankur's master profile + Tech Resume + Event CV. No invented claims.
- Every external link verified HTTP 200 before launch.
- Footer links to portfolio v2 (untouched).
