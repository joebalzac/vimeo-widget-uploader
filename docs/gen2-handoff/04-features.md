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

### LeasingAI (`VLease`) — 632:53306 → 632:53308 → 636:53665 (+ 692:175157)

1. Two lead cards (Ava Mitchell / Caladan Lofts / 1bd/1ba $2,000; Mateo Alvarez / Oakview / 2bd/1ba $2,500) rise in with slight counter-rotation.
2. Chips change TOUR SCHEDULED → TOURED.
3. The cards converge (0.6s ease-in-out, no blur) as the **Generate Lease** button grows in (scale .82 → 1).
4. A cursor glides in, hovers and clicks (button press .96).
5. The lease document enters as the button leaves (overlapping, no gap).
6. A scan band sweeps down 2.7s, turning skeleton into text.
7. Hold 1.9s, fade out, loop.

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
