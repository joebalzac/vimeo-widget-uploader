# 03 · The Ideal Renter Journey

**Code:** `Journey3`. **Figma:** 642:88637 (desktop), 642:89116 / 642:139552 (mobile).

## Copy

- H2: **The Ideal Renter Journey**
- Subtitle: **From first inquiry to lease renewal, Elise handles it all, across text, voice, email, and web chat.**

## Layout

- **Stage:** 640×600 (Figma graphic cropped to x 280–920). Circle centre (320,300), r 200.
- **Products:** six at 60° steps, clockwise from the top: **Leasing** (top), **Tour Intelligence**, **AI Guided Tours**, **Maintenance** (bottom), **Delinquency**, **Renewals**.
  - Labels: Plex Mono, positioned outside the ring by side (t / r / b / l).
- **Centre:** the Apollo mark in a dark disc with a white ring and soft shadow.
- **Background:** a light grid of vertical lines, plus six spokes at 40% `#DDDCDA` under a radial fade to `#FDFCFB`.
- **Desktop:** stage height 560, padding 120 top. Bottom spacing per Gabby: 60 below the circle, then 120 above Features.
- **Mobile:** the whole 1200-wide graphic scales to the viewport (0.5714 at 393). Padding 48.

## Animation (loop, in view ≥30%)

1. The ring progress (purple `#6B4FFF` 1.5px stroke over a grey `#DDDCDA` base) sweeps clockwise over 3.4s (`[.45,.05,.3,1]`).
2. As the sweep reaches each product, it lights up:
   - Its label fades and slides in (0.4s).
   - Its spoke draws inward (0.9s).
   - A soft purple gradient travels along the spoke outward from Apollo.
3. The Apollo ring rotates with progress.
4. Hold 3s, then rewind (1s `DRAW`), pause 0.4s, and loop.
5. **Section reveal:** the heading and subtitle use `Reveal`; the stage rises in at +0.2s.

Gabby's direction: clockwise and outward, no dots (this replaced the counter-clockwise/inward variant).

## Labels (v117): back to IBM Plex Mono 14 uppercase (ring and ruler).

## Responsive: Flatten/ruler is desktop only (≥1001px). Below that the journey keeps the looping ring animation and products stack; each product card carries a Plex Mono name tag above its headline (+ NEW on Tour Intelligence).

## Option under review: "Flatten" (desktop ≥1001 only)
Journey pin 200vh; Features overlaps it (`margin-top:-120vh`, no background, z 3). `FlatRuler` runs off journey progress k:
1. k 0→.30 — purple arc draws once around the ring (scroll-linked).
2. k .26→.36 heading fades; k .30→.42 ring, names, dots and Apollo fade together. Names do NOT travel.
3. k .36→.48 — the ruler (names + ticks) fades in at top 120px (8px rise). Features copy/visual ride up underneath with no reveal fade; they stay below the ruler (stick padding-top 200), so text never overlays a visual.
Ruler: names Plex Mono 14 caps, fixed (first left-aligned with the feature copy, last right-aligned, equal gaps); inactive #a9a8a6, active #0e0d0c (.3s). Ticks (Attio): 1×8 #dddcda, 12px gap, bottom-aligned, 16px below the names; active tick 1×12 purple 500. Active product = round(feature progress); the tick track **snaps** to the centre of that name with a .55s ease (cubic-bezier(.22,.8,.24,1)) — no free scrolling. Ends masked 4%. NEW tag after Tour Intelligence. Names smooth-scroll to their product.

## v124 (Final): grid-line fade is centred on the ring
Radial fade centred on the ring (bg 720,583). Vertical mask symmetric around the ring centre and fully transparent before the section clips: `linear-gradient(to bottom, transparent 31%, #000 50%, #000 74%, transparent 89%)` × the existing left/right mask.
