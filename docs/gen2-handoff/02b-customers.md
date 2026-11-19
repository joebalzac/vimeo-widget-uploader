# 02b · Customers (logo grid, directly below the hero)

Source pattern: eliseai.com/platform-overview "Trusted by" grid, restyled to Gen 2 tokens.

## Content
- H2 (centered, max-width 820px): **Trusted by Over 900 of the Top Property Management Companies**
- 5 × 2 grid, in order: GoldOller, Scion, Mill Creek Residential, S2 Residential, Willow Bridge / Avenue5 Residential, RPM Living, Cardinal Group, Olympus Property, WinnCompanies
- "Case Study →" pill on 5 cells (whole cell is the link, opens new tab):
  - GoldOller → /customer-stories/how-goldoller-enhanced-the-employee-experience-and-improved-conversion-rates-with-elisecrm
  - S2 → /customer-stories/how-s2-empowers-their-techs-and-completes-work-orders-faster-with-eliseais-maintenance-app
  - Avenue5 → /customer-stories/reinventing-leasing-at-avenue5-with-eliseai
  - RPM → /customer-stories/how-rpm-living-scaled-their-managed-services-offering-with-eliseai
  - WinnCompanies → /customer-stories/how-winncompanies-uses-eliseai-to-support-their-affordable-resident-population-at-scale
- Logos: use the CMS SVGs from platform-overview (prototype inlines webp copies; `source/img/logos.json`).

## Layout (v110)
| | Desktop | ≤1000 | ≤767 |
|---|---|---|---|
| Section padding | 120 top / 40 bottom | 96 top | 72 / 24 |
| H2 → grid | 48 | 48 | 32 (H2 36px) |
| Grid | 5 cols | 5 cols | 2 cols |
| Cell height / padding | auto: 40 + 32 logo row + 40 = 112 | same | 32 + 32 + 32 = 96 |
| Logo | height = natural, max 32; max-width = cell inner width | same | max-height 32, inner width |

- Grid: square corners (no radius), 1px #dddcda outer border + internal hairlines, bg #fdfcfb.
- Logo render sizes (desktop, before width capping): GoldOller 122×24 · Scion 72×30 · Mill Creek 161×28 · S2 163×24 · Willow Bridge 87×32 · Avenue5 123×32 · RPM 44×32 · Cardinal 173×32 · Olympus 133×32 · Winn 170×26. At 1440 the inner cell is ~141px wide, so the widest marks scale down to fit.
- Case-study CTA: 32px circle arrow (carousel arrow, 16px icon, #7A7977), Figma 874:180245 — default bg #f6f4f2, hover #f0eeec; top/right 16 (8 mobile). Whole cell is the link.
- Cell hover / focus: bg #f6f4f2 (card primary) .3s; arrow nudges 2px right.

## Motion
- H2: standard `Reveal`.
- Cells: `Reveal` stagger — delay = .06 × column + .08 × row.
- Arrow (v120): circle card primary #f6f4f2 → hover card secondary #f0eeec; icon type secondary #7a7977 → hover type default #0e0d0c. No movement.
