# Ankur Mishra — Portfolio v3.7.1 "Home Orbit"

**Concept: Madhubani roots, modern code — everything revolves around the builder.**

Live: https://immishra13.github.io/ankur-portfolio-v3/

## What it is
One warm dark page, like home — clean, not cluttered. It opens with "Hi, I am"
and a big 3D **ANKUR MISHRA**. His living avatar in the centre — drawn on a
canvas with the white video background removed live, so he floats straight on
the dark page (no white box, and his face is never cut off on first load).
Around him float REAL 3D cubes: **Work, Skills, Education, Journey, Proof,
Hire Me, Contact**. Hover turns a cube, drag rotates it, tap opens its world —
on the phone too, the cubes stay around him.

Tap a box → a bigger side panel opens on THAT box's side, and the avatar gets
excited, dances, and turns toward the panel. No long scrolling, no walls of text.

## Journey — a route map
Bihar → Mumbai, 2020 → 2027, with a progress bar ("You are here — 2026") and a
node for every year. 2027 is the destination.

## MatchMate — the hiring bot (Hire Me box)
The recruiter posts a requirement. The bot checks it against Ankur's real skills
and shows an honest match % — what matches, what is missing, and proof (the actual
projects where he used it). No fake 100%.

## Contact box
WhatsApp, Gmail, LinkedIn, GitHub, Instagram — icon with the name below it.
Tap a card, it opens that place directly.

## Files
- `index.html` — the orbit, panels, bot, contact cards
- `styles.css` — full dark theme, 3D name, floating boxes, side panel
- `app.js` — canvas chroma-key avatar, cube drag, side-following panels, MatchMate matching
- `avatar-idle.mp4` — 9.7s idle loop · `avatar-dance.mp4` — 8s dance
- `avatar.png` — poster still · `og-image.png` — share image
- `Ankur_Mishra_Tech_Resume.pdf` · `Ankur_Kumar_Mishra_Event_Management_CV.docx`
- `DESIGN.md` — the design contract (v3.7.1)
- `assets/viva-campus.jpg` — real VIVA campus photo · `assets/nptel-logo.png` — real transparent NPTEL logo

## Stack
Plain HTML, CSS & JavaScript. No framework, no build step, no tracking.

## History
- v3.0 — concept portfolio, static avatar with cursor-following pupils
- v3.1 — living video avatar (idle + dance), 3D sections, motion per design-motion-principles
- v3.2 — "The Orbit": dark UI, avatar centre, floating boxes, panels, MatchMate bot
- v3.3 — "Cube Orbit": canvas keyed avatar (no white box), real 3D draggable cubes, panels open on the box's side, skills with official icons, work cards with buttons
- v3.4 — "Home Orbit": poster head-crop bug fixed (contain-fit), warm home palette, "Hi, I am" intro, phone keeps the ring of cubes, journey route-map tracker, education cards with real VIVA photo + NPTEL logo, events skills added
- v3.5 — "Home Orbit": personal-area background photo, slimmer avatar + Hi wave, real school photos + bg-removed VIVA banner icon, 12 work cards from CV + LinkedIn + GitHub, MatchMate NLP (stemming + synonyms, 23/23 tests), per-section panel themes
- v3.5.1 — LinkedIn pass: Kushal Yuva Program + MongoDB + Cybersecurity certs, Firebase/LangChain/RAG/MCP/n8n/Zapier/PHP/React Native skills, PHP removed from MatchMate "not in stack"
- v3.5.2 — hotfix: stray space in versioned asset URLs left the live site unstyled; fixed and live-verified
- v3.5.3 — background overlay lightened (0.78–0.86 → 0.52–0.68) so the workspace photo is actually visible
- v3.6 — Ankur's own school photos + bg-removed logos as Education icons; background photo REALLY fixed (opaque .orbit base was covering it); avatar walks in, strolls, points at the tapped box and flexes on Hire Me (code movement, not new video); Journey is now an SVG route map
- v3.6.1 — hotfix: pointing-hand SVG was never uploaded (live 404 → broken-image icon); pushed the file + fixed stale header comments
- v3.7 — more motion graphics on the avatar: ambient sparkles, music notes while dancing, ground shadow, idle look-around sway, tap-the-avatar reaction, confetti burst on Hire Me
- v3.7.1 — hotfix: v3.7's look-around read a later-declared variable at eval time (TDZ ReferenceError) and killed the whole script — avatar stuck off-screen, boxes dead; fixed with a safe proxy + a DOM-stub smoke test that now runs on every JS change
- v2 lives at https://github.com/immishra13/ankur-portfolio-v2 (untouched)
