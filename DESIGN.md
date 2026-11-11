---
version: alpha
name: Ankur Mishra Portfolio v3
description: Recruiter-first portfolio. Madhubani roots, modern code.
colors:
  page-default: "#FAF7F2"
  surface-default: "#FFFFFF"
  surface-subtle: "#F3EFE7"
  fill-inverse: "#16233A"
  content-primary: "#1C2733"
  content-secondary: "#5A6472"
  content-accent: "#E8590C"
  content-teal: "#0F766E"
  content-gold: "#F59E0B"
typography:
  sans:
    fontFamily: Inter
    fontWeight: 400
  display:
    fontFamily: Inter
    fontWeight: 800
    letterSpacing: -0.02em
---

# DESIGN.md — Ankur Mishra Portfolio v3

## Overview

One page, recruiter-first. Warm cream paper, ink navy hero, saffron action, teal proof, marigold accent. The Madhubani identity comes from Ankur's own avatar (kurta, paag, dhoti) and fish/sun motifs — not from stock photos.

## Colors

- Cream `#FAF7F2` page, white cards, navy `#16233A` hero and top-bar CTA.
- Saffron `#E8590C` is the only action colour. Teal `#0F766E` marks proof and links. Gold `#F59E0B` is the eyebrow and avatar glow. Pink `#D6336C` appears only inside the avatar artwork.
- Never use violet or gradients as page decoration.

## Typography

- Inter, one family. Headings 800 weight, tight letter-spacing, `text-wrap: balance`. Body text `#1C2733`, muted `#5A6472` (6.0:1 on cream).

## Layout

- Max width 1080px, 20px side padding. Hero is a two-column grid (copy + avatar) that stacks on phones, avatar first.
- One card style, one radius scale (16px cards, 10px controls), one button pair (saffron primary, outlined ghost).

## Motion

- Transform and opacity only. Avatar float, tilt and pupil movement; card lift on hover; counters count up on view. All motion stops under `prefers-reduced-motion`.

## Components

- Role filter pills, world toggle, project cards with stack chips and a proof line, proof strip with animated counters, timeline, contact block.
- Every interactive control is keyboard reachable with a visible focus outline. Filter results are announced via `aria-live`.

## Do's and Don'ts

- Do link every claim to a live site, repo or CV. Do not invent numbers, clients or reviews.
- Do keep the avatar as the single visual hero. Do not add stock photos.
