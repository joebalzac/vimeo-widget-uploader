# 05 · More Power, More Simplicity with Apollo

**Code:** `ApolloV2` (with `v3`), `ApChat`, `ApBlock`, data `AP2`.
**Figma:** section 642:140593; scenarios 734:178008 / 178086 / 178164 / 178242; mobile 667:141085.

## Copy

- H2: **More Power, More Simplicity with Apollo**
- Subtitle: **One agent to control the whole platform.** (16 on mobile)
- Tabs: **Site Team · Onboarding · Executives · Portfolio Leaders**
  - 18px desktop / 16px mobile.
  - Selected background `#F0EEEC`; it slides between tabs.
  - On mobile the tabs scroll horizontally and centre the active tab.

## Layout

- **Section:** background `#FDFCFB`, padding 120 top / 0 bottom (48 top on mobile), overflow hidden.
- **Phone:** 420×940 (1:1 with Figma) inside a 1160×600 clip with a bottom fade.
  - Mobile: a native 280-wide phone × 1.167 inside a **640-tall clip with a 40px fade**, so the last message and the composer stay visible.
- **Phone header:** chat title 14 (12 on mobile) with chevron; link, edit and close icons.
  - **24px side padding on desktop, 20px on mobile.** The mobile chat body uses the same 20px.
- **Chat viewport:** really scrollable. It auto-follows new content until the user scrolls or touches it.
- **Composer:** fixed at the bottom ("Add a follow up…", mic, send).

## Scenarios (`AP2`)

| Tab | Chat title |
|---|---|
| Site Team | Pipe Burst at Aura Estates |
| Onboarding | Mixed-Income LIHTC Setup |
| Executives | Boise Regional Report Schedule |
| Portfolio Leaders | Boise Rent Concession |

**Block types:**
- `u` user bubble
- `w` "Worked for a few seconds" (shows thinking first)
- `p` paragraph
- `l` list
- `f` file card
- `t` table
- `b` closing paragraph

**Pacing:**
- user 1200ms
- paragraph 1300ms
- table 1800ms
- closing 600ms
- thinking 1800ms + 400ms
- hold 7000ms, then auto-advance to the next tab
- Clicking a tab stops auto-advance.

## Animation

- **Phone entrance (on view):** scale .56 → 1, y 140 → 0, rotateX 24° → 0 over 1.3–1.4s `[.16,1,.3,1]`.
- **Ring backdrop:**
  - Tied to scroll, behind everything.
  - A soft ring whose band is a conic gradient: lilac `#B9B0FB` · **page colour `#FCFCFB` gaps** · sky `#A7CBFF` · white · `#C7BEFC` · `#9FC2FF`.
  - Masked to a wide soft band (about 140px), and the band slowly rotates.
  - As the section scrolls in, it **starts small at the centre (scale .18) and grows** until it frames the section (scale 1.75, edges at the screen sides). Blur grows 48 → 70px.
  - It **holds there** while the section is in view and only fades once the section has scrolled away.
  - Scroll progress is smoothed with a spring (stiffness 38, damping 24).
  - Content sits above it (`z-index: 2`).
- **Tabs and chat blocks:** blocks fade and rise in one by one. The title crossfades on tab change.
