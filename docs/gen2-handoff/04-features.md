# 04 · Features (6 products)

**Code:** `Features3` → `FeaturesPinned` (≥1001) / `FeaturesStack` (≤1000). Text in `FText`, card in `FCard`, visual in `FVis`.
**Figma:** section 618:6951; visuals in Assets **618:3434** (frame IDs per product below).

## Content (`F3`)

| Product | Description | What's New |
|---|---|---|
| LeasingAI | Nurtures every lead from inquiry to signed lease. | Brand Suite · Personalization Suite · Team Optimization · Central AI |
| Tour Intelligence **NEW** | Records, scores, and coaches every tour. | Real-Time Coaching · Property Insights · Custom Rubrics · Agent Scoring |
| AI-Guided Tours | Interactive self-guided touring. | Video Configuration · Smart Wayfinding |
| Maintenance | Resident communications and end-to-end operations management. | Preventative Maintenance · Asset Tracking · Turn Scheduling · Vendor Coordination |
| Delinquency | Improve collections without reducing sentiment. | Payment Plans · Demand Notice Generation · Former Resident Recovery |
| Renewals | Increase retention and speed up renewal decisions. | Renewals Prediction · NTV Saves · One-Click Renewals Portal |

## Layout

### Desktop (pinned)

- **Pinning:** the section pins while you scroll through 6 steps.
- **Grid:** ruler | text | visual.
- **Ruler:** tick marks shift 48px per product. The active mark grows 12 → 24 wide and turns `#6B4FFF` (others `#A093FD`).
- **Text column:** title 36/1.1 and description 18 at the top. **What's New** (label muted, items 16) sits low, **32px above Learn More ↗** (16 muted).
  - Panes are stacked in one grid cell so the column never changes height.
  - Switching products is an **opacity-only crossfade** (0.25s). Nothing slides.
- **Visual card:** 660×460 base (frame 476 with two stacked "deck" layers behind), radius 12.
  - Gradient background image (`bg.jpg`).
  - Scales with width up to 1.25× on large screens.
  - **Deck swap on product change (`FCard`, `DECK`):**
    - A soft swap. The next card eases forward a hair (scale .985 → 1, y −3 → 0, fade in) over 0.9s ease (opacity 0.6s).
    - The current card settles back the same small amount and fades (0.8s, opacity 0.6s after 0.15s).
    - There's no vertical travel, and it's the same in both scroll directions. The two back layers stay put.

### Mobile / tablet (≤1000)

Each product is a card + text pair, revealed with `Reveal`. Title 20, body 16.

## NEW tag

- **Style:** Plex Mono 12, 25 tall, pad 0 8, radius 3, **no fill**, 1px `#DDDCDA` stroke, text `#6B4FFF`.
- **Beam:** a soft streak travels around the border every 2.8s. It's a conic gradient masked to the 1px border: `#C1BAFE` → `#C1BAFE` → `#99CEFF`, about 90° long. Built Attio-style per Gabby; there's no Figma node.

## Visuals

All visuals loop while in view, restart on re-entry, and show their final frame under reduced motion.

### Leasing (`VLease`) — Figma 876:180249 (v112; replaces the lease-document flow)
One white container morphs the whole way (width / height / radius / fill tween 0.75s EZ); contents cross-fade inside it (`overflow:hidden`). Centered in the 660×460 stage.
1. **Card** 320×132.5 — Ava Mitchell · Caladan Lofts, 1bd/1ba · $2,000. Enters (opacity, y), chip `TOUR SCHEDULED` (azure) → `TOURED` (mint) after 1.7s.
2. **Resize to composer** 400×140, radius 8 (annotation: "once toured tag – resize card to next frame"). Lead content fades out .2s, composer fades in .35s (delay .3).
3. **Type-out** — "Hi Ava! Thanks for touring Caladan Lofts. Here’s the application link for the one-bedroom you saw." 16/1.4, 14ms per letter (20ms on spaces). Each letter animates `lfch` .55s through the Figma gradient-text colours (692:175315: purple 300 #a093fd → azure 500 #1475e8): typing edge azure → trail purple → settles on type-default #0e0d0c. Untyped letters are rendered at opacity 0 so the text never reflows.
   Toolbar: Text / Link / Attach icons 20px #7a7977, gap 9.14; Send button #6b4fff, h32.7, px13.7, r3.43, 13.7px white (hover #5a3ff0).
4. **Cursor** glides in to Send (.85s), hover, click (scale .88 / button .95).
5. **Converge to success** (annotation: "card converges to success state") — container tweens to 220×55.4, radius 28, fill #00b080, shadow 0 26.4 22 −22 rgba(0,0,0,.2); pill content: check (24, path draws .45s) + "Follow-up Sent" 22px white, gap 7.33.
6. Hold 2.6s → fade/rise out → loop. Reduced motion: static composer with full message.
Note: Figma's background uses a WebGPU ShaderEffect (Color adjust + Warp) on the bg image; the prototype keeps the existing static bg image. Eng should use `@figma/expressive-components` with the shader modules from Figma if the warp is wanted in prod.

### Tour Intelligence (`VTour`) — 636:53954

- **Phone:** 309 wide at x176 y40 (`Phone3 sm`: the 360 phone × 0.8583).
- **Content:**
  - "Tour with Lia T." and chips 12:00 PM · Lia T. · Tips · Transcript.
  - The transcript types once at 34ms per character: "Loved the kitchen, worried about storage / Prefers a higher floor".
  - Lilac waveform bars oscillate, with a red stop button (`#DC2626`) and white glow at screen y 367.

### AI-Guided Touring (`VAigt`) — 636:54096 → 636:55403

1. **Frame 1:** Oakview header with Apply, a map with the "Floor 2 · 1" pill and pins 1 and 2, then the Welcome sheet (code `684020088` box `#F2F0FF`) and Tour Itinerary (white pin numbers).
2. A touch cursor presses the **sheet tab** at y 267, drags up to y 58, and releases.
3. The Apt. 6A sheet starts exactly on the Welcome sheet and rises to the top; a scrim fades in.
4. **Apt. 6A sheet** (Figma × 1.1668):
   - Title at 31; photo 298×175 at 61; facts row (1bd/1ba · $2,400 · 925 sq.ft.) at 248; amenities list at 280.
   - The white fade is clear at 343 and solid from 399.

### Maintenance (`VMaint`) — 636:54214 → 642:88989 → 636:56292

1. Three turn cards; the centre one is "Unit 3A Turn".
2. The 7-segment progress bar sweeps, then stops on segment 6 with a blue **CLEANING** pill (spinner) under it.
3. The bar completes in mint and the pill becomes **COMPLETE** (check draws).
4. The chip changes VACANT → READY.
5. **Pill and chip:** fixed size (pill 96 wide); contents crossfade in place.

### Delinquency (`VDq`) — 692:175214 → 692:175277 → 692:175339

1. **Payment Plan** card (328 wide, centred), rows 36 apart: 1st Installment Paid, 2nd Installment **Due**, 3rd Installment Dec 15.
2. The 2nd installment opens by exactly **52px**: Amount Due $625.00 and Date Nov 15, 2026, rows 26 apart with 8 above and below.
   - Tween 0.6s `[.32,.72,0,1]`; the card re-centres with it (y 135 → 109 in Figma).
3. The status crossfades in place: Due → Sending Reminder (spinner) → Paid. The status column is fixed at 128 wide.
4. The **AI Collected** card fades in and counts to $1,250 (tabular numbers), and a purple ring fills to 72%.

### Renewals (`VRenew`) — 697:175419 → 697:175462 → 697:176180

1. Kanban: Renewing / On Notice. Unit 4C lifts and tilts, flies across columns, and leaves a dashed ghost slot.
2. Once it lands, its status crossfades Awaiting Signatures → Notice Given + NTV SAVE.


## Copy update (v109) — the sub-line is now the header; the product name header is removed
| Product | Header (H3) |
|---|---|
| Leasing | Nurtures Every Lead From Inquiry to Signed Lease |
| Tour Intelligence | Records, Scores, & Coaches Every Tour (+ NEW tag) |
| AI Guided Tours | Interactive Self‑Guided Touring |
| Maintenance | Resident Communications & End‑to‑End Operations Management |
| Delinquency | Improve Collections Without Reducing Sentiment |
| Renewals | Increase Retention & Speed Up Renewal Decisions |
Text column 480px wide on desktop (was 380) so no header runs past 3 lines; H3 max-width none, `text-wrap: balance`, non-breaking hyphens. Then What's New list + Learn More as before. "LeasingAI" → "Leasing" and "AI-Guided Touring" → "AI Guided Tours" everywhere.

#### Leasing timing (v113, snappier)
Card in → Toured 1.2s · Toured → composer 1.05s · container morphs on a spring (stiffness 420, damping 34, mass .8) · type-out ~1.5s · cursor glide .5s, hover .14s, click .11s · converges to the mint pill on the same spring (fill .22s), check draws .32s · hold 2.2s · out .5s.

## Product copy (v120)
Each product's copy: Plex Mono 14 caps name tag (+ NEW) above the H3; What's New items have a 14px check.
