# 03 · The Ideal Renter Journey

**Code:** `Journey3`. **Figma:** 642:88637 (desktop), 642:89116 / 642:139552 (mobile).

## Copy

- H2: **The Ideal Renter Journey**
- Subtitle: **From first inquiry to lease renewal, Elise handles it all across text, voice, email, and web chat.**

## Layout

- **Stage:** 640×600 (Figma graphic cropped to x 280–920). Circle centre (320,300), r 200.
- **Products:** six at 60° steps, clockwise from the top: **LeasingAI** (top), **Tour Intelligence**, **AI-Guided Touring**, **Maintenance** (bottom), **Delinquency**, **Renewals**.
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
