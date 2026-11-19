# 02 · Hero

**Code:** `Hero3` (copy), `Hero3Board` + `useHeroBoard` (board), `HBCol` / `HBCard` / `HBPerson` / `HBChip` / `HBFly`.
**Figma:** copy 590:45184; board **761:1949**; mobile 642:139552.

## Copy

- Eyebrow (Plex Mono 14, purple square): **ELISEAI GEN 2** (copy "EliseAI Gen 2", uppercased by style)
- H1: **The #1 AI Platform Transforming Multifamily Operations** (64 → 36 mobile)
- Subtitle: **The next generation of team experience, resident experience, and asset performance.** (18)
- CTA: **Get A Demo** (primary button)

Hero top padding 144 (96 on mobile). The board sits 64px below the CTA (40 on mobile).

## Board layout (Figma 761:1949, with requested changes)

- **Columns:** 3 columns, each 379 wide at x 0 / 391 / 782 (12px gap).
  - Background `rgba(0,0,0,.04)`, radius 14, padding 4.
  - **Prospects sits 51px higher** than Calendar and Residents (staggered, per Gabby).
- **Column header:** 44 tall, 18px icon, title 16 `#0E0D0C`, 6-dot drag handle `#A9A8A6` on the right.
- **Cards:** 75 tall, white, 0.5px `#DDDCDA` border, radius 8, padding 0 16, shadow `0 1px 2px rgba(14,13,12,.05)`, 4px gap.
  - Text: name 14 `#3F3E3C`, subtitle 14 `#7A7977`.
- **Calendar cards:**
  - 2×43 left bar: blue `#2E95FF` = Self Guided, purple `#8571FC` = In Person, mint `#1FD19A` = Virtual.
  - Time on the right, 14 ink.
- **Card count:** each column holds **6 cards**, so the bottom is never empty.
- **Fade:** the board fades out from 68% to 96% of its 560px height (mask).
- **Mobile:** 300-wide columns (Prospects centred, the others peek in from the sides), 66-tall cards, 12px text, 10px chips.

### Chips (Plex Mono 12 uppercase, 22 tall, radius 3)

| Chip | Background / text | Meaning |
|---|---|---|
| INQUIRY | `#F4FAFF` / `#1475E8` | |
| Scheduling Tour · Processing Application (+ the "Elise acting" set below) | **no tag**: Inter 14 (12 mobile), purple→blue gradient text `#A093FD → #1475E8` + spinner (same as Figma 692:175277 "Sending Reminder") | in progress: it only becomes a tag once confirmed |
| SCHEDULED TOUR · TOURED · LEASE SIGNED | `#EEFDF8` / `#00B080` | success = green |
| CURRENT · FUTURE | `#F6F4F2` / `#0E0D0C` | |
| WORK ORDER | `#FEF0FA` / `#D42AAF` | |
| RENEWAL OFFER | `#E5F2FF` / `#1475E8` | |

"Lease Signed", "Scheduling Tour" and "Processing Application" aren't in the Figma key; the colours follow Gabby's rule (blue = progress, green = success).

## Animation

### Load-in
1. Columns rise in (opacity, y 36 → 0, scale .97 → 1, 1s `E`). Prospects goes first; the side columns follow 0.1s later.
2. Cards then come in as a diagonal wave. Per-card delay = `row × 75ms + column offset` (Prospects 0.22s, Calendar 0.30s, Residents 0.38s).
3. Each card moves from opacity 0, y 22, rotate −2°, scale .96 to rest, over 0.75s `E`.

### Story loop (never resets or fades out; ~13s per cycle)
1. **Lease → Residents** (first thing):
   1. A toured prospect in the top 3 (Maya Patel, row 2) changes to SIGNING LEASE (spinner, 1.5s), then LEASE SIGNED (1.2s).
   2. **Move:** the real card hides, a dashed lilac slot appears, and an identical "flyer" card lifts (scale 1.035, y −6, 0.28s).
   3. The flyer glides to the top of Residents on a spring (0.95s, bounce .12). It **tilts with its horizontal speed** (±6° max, spring 260/26), so it only leans while moving.
   4. Residents has already made room with an invisible twin. The flyer sets down exactly on it and the twin shows, so there's no blink.
   5. Prospects closes up 0.38s after the lift.
   6. Chip changes to FUTURE.
2. **New inquiry** pops in at the top of Prospects (scale .94 → 1, y −10 → 0, spring). The bottom card exits.
3. **Book a tour:** an INQUIRY prospect changes to SCHEDULING TOUR (1.5s), then SCHEDULED TOUR. Their tour pops in at the top of Calendar.
4. **Tour completes:** another INQUIRY changes to TOURED.
5. **Residents:** a WORK ORDER chip clears, and the new resident changes from FUTURE to CURRENT.

**Chip change:** the old chip slides up and out (y −12, 0.28s) and the new one rises in (y 12 → 0, scale .9 → 1, spring 520/20–24). **Cards never change colour.**

**Rules:** columns always hold 6 (a pop-in pushes the last card out). Exiting cards use `AnimatePresence mode="popLayout"`, so components must `forwardRef`.

## Background gradient

- The soft lilac (left) and blue (right) light is the **hero section's own background image**, anchored to its bottom edge:
  - Desktop: `hero-bg-desktop.jpg` at 100% × 920px.
  - Mobile (≤767): `hero-bg-mobile.jpg` at 100% × 680px.
- The image fades to exactly #FDFCFB at its top and bottom edges, so The Ideal Renter Journey meets it with no seam.
- **No layer crosses into another section.** Set it on the Webflow hero section (see gradients.css §1).

## Elise acting (the shipped hero story)

Product marketing (ZF) wants Elise's actions to show before every outcome. It's built as a toggle (bottom-right "Hero: Current / Elise acting") for sign-off; delete the toggle (`.hb-opt`) once one is chosen.

| Where | In-progress action (gradient text + spinner) | Then |
|---|---|---|
| Prospects | Processing Application | LEASE SIGNED → moves to Residents |
| Prospects | Responding (new inquiry) | INQUIRY |
| Prospects | Following Up → Scheduling Tour | SCHEDULED TOUR |
| Calendar | Confirming (in place of the time) | time fades in |
| Residents | Assigning Work Order | work order clears |
| Residents | Collecting Rent | RENT PAID |
| Residents | Sending Offer | RENEWED |
| Residents | Predicting Renewal | RENEWAL OFFER |

Two actions run at once in different columns. One cycle takes about 26s; it loops and never resets.

### Elise acting — progress rules (v108)
- A progress state (spinner + gradient text) **replaces all of a card's tags**; tags return once it completes.
- One progress per prospect step, never two in a row: Maya `Toured` → `Processing Application` (progress) → `Lease Signed` → moves to Residents. New lead: `Responding` → `Inquiry`. Booking: `Inquiry` → `Scheduling Tour` → `Scheduled Tour` → calendar (calendar keeps the "Rescheduling" beat).
- Never more than two progress states on screen at once; starts and ends are staggered (≥700ms apart) and two progress cards are never adjacent in a column.
- Residents sequence: `Assigning Work Order` (resolves to `Current` before the lease is signed) · `Collecting Rent` → `Current · Rent Paid` · `Sending Offer` → `Current · Renewed` (700ms after rent) · `Predicting Renewal` → `Current · Renewal Offer`.

- Loop opener (both options): ~0.9s in, Camille Bennett's calendar card is rescheduled 2:15 PM → 4:30 PM. Elise acting: the time is replaced by a "Rescheduling Tour" progress state for 1.5s; Current: a quick time swap. The card then gets the change pop.

### v120 — Zane's lease wording
No "Generate / Sending / Signing Lease" anywhere on the page. Prospects go `Toured` → `Processing Application` (progress) → `Lease Signed` (fine: read from the PMS) → Residents. The hero board plays **once**, only when it's in view, then holds its final state.
