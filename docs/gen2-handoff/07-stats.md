# 07 · AI That Drives Asset Performance (stats)

**Code:** `StatsDark`, `Stat2`, `LogoIn`. **Figma:** 590:46214; mobile 642:139552.

## Copy

- H2: **AI That Drives Asset Performance** (white)
- Subtitle: **The right AI product directly produces financial results, unlike previous technologies.** (`#DDDCDA`, 18; max 288 wide on mobile)

| Stat | Label | Logo |
|---|---|---|
| +7.1% | Resident Satisfaction | ALN Apartment Data (76×40) |
| +47% | Team Retention | GoldOller (111.5×22) |
| +2% | Occupancy | Grace Hill (118×44) |

## Layout

- **Section:** background `#131115` (`data-dark="1"` turns the nav dark), padding 120.
- **Desktop:** a 3-column boxed row with 1px dividers.
- **Mobile:** stacked boxes. The header has a 6px gap and a 32px bottom margin.
- **Numbers:** 72px white (64 on mobile), proportional figures (Final CSS: `font-variant-numeric: normal`).

## Animation

- **Counters:** count 0 → value over 1.4s (out-cubic) when 50% in view, staggered 0.07s.
- **Number and label:** use `Reveal`.
- **Logos fade in on their own** (opacity on the `<img>` only). They're white marks screened onto the dark background (`mix-blend-mode: screen` + `filter: grayscale(1) contrast(2.3)`, to drop the grey box baked into the source images).
  - A fading or transformed parent would break the blend and flash the box, so the logo has none.
  - **Production: replace with transparent SVG logos and drop the blend and filter.**
