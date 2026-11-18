# 01 · Nav

**Code:** `Nav`. **Figma:** page frame 590:45183 (top); mobile `nav-mobile` in 642:139552.

## Layout

| | Desktop | Mobile (≤761) |
|---|---|---|
| Height | 60 | 52 |
| Side padding | max(gutter, min(48px, 4vw)) | 16 / 24 |
| Left | Logo (49×16) + tabs **Products / Solutions / Resources** (14px, pill hover `rgba(127,120,110,.12)`, each with a + icon) | Logo |
| Right | **Log In ↗** (14px muted) + **Get A Demo** (14px, 8/12 pad, purple-500) | Hamburger (20px) |

Tabs hide at ≤1000.

## States

- **Default:** transparent with a 50px backdrop blur.
- **Scrolled (>8px):** `rgba(253,252,251,.8)` with a 0.5px bottom hairline.
- **Over a dark section** (`[data-dark="1"]`, the Stats section): `rgba(19,17,21,.72)`, with white logo and tabs.

## Motion

- **Load:** the bar fades in, y −8 → 0 over 0.8s `EZ`, 0.2s delay.
- **Buttons:** press scale 0.98.
