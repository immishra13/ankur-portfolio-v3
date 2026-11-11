# Ankur Mishra — Portfolio v4.0 "Living Model"

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
- `DESIGN.md` — the design contract (v4.0)
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
- v3.7.2 — fix: avatar untappable (full-screen boxes layer ate clicks — added pointer-events), confetti too quick to see (bigger, longer, double-fired), sparkles thickened, ground shadow given a warm halo
- v3.7.3 — fix: confetti was veiled by the 55% panel backdrop (stage now lifts above it when a panel is open), burst made much bigger/longer (24×3 waves, ~3s), shadow now shows only while dancing (idle video is waist-up — verified on real frames, feet exist only in the dance video)
- v4.0 — Living Model: the video avatar is replaced by a REAL 3D model (Three.js, `avatar3d.js`) that waves hi, walks in, turns toward the tapped cube and points at it with his own arm, flexes for Hire Me and dances — all code. All side graphics removed (sparkles, notes, confetti, pointing/wave hands) per Ankur's correction; the wave-video try failed first (no wave in any clip, dance catalog exhausted)
- v4.0.1 — hotfix: the model never rendered — `init()` was defined but never called by anyone; the module now auto-starts when it finds `#avatar3d`
- v4.0.2 — hotfix: poster fallback could stay visible under a late-loading live model (now re-hidden on ready); fallback timeouts raised to 10s/12s for cold CDN loads
- v4.0.3 — hotfix: the poster's `display:block` CSS beat the `hidden` attribute, so it was always visible and pushed the 3D mount off the top of the screen (`.avatar-fallback[hidden]{display:none}` fixes it); tap now shows a "waving hi!" state label
- v4.0.4 — fix: Hire Me flex read as a T-pose (old targets left upper arms pointing down-forward; hold was 1.0s and the walk overwrote the flex arms) — new targets verified numerically as a clear double-biceps, 2.5s hold, walk no longer overwrites flex arms
- v4.0.5 — fix: the walk's completion handler reset mode to idle unconditionally, killing the flex when the 600ms walk ended — walk now only falls back to idle if mode is still 'walk'
- v4.0.6 — polish: FLEXING state label outlived the 2.5s pose (now returns to EXCITED while Hire Me stays open); flex stays a "low" double-biceps (upper arms ~24° below horizontal) — raising them fully horizontal points the forearms at the camera, which reads worse
- v4.1.0 — real face (his illustrated face from avatar.png as the head texture; geometry zombie face removed), phone overlap fixed (smaller mount, stage lifted, Proof/Contact to 71%), professional simple-English copy everywhere (footer version, "Numbers talk", "Bihar → Mumbai" and Hinglish speech/bot lines removed)
- v2 lives at https://github.com/immishra13/ankur-portfolio-v2 (untouched)
