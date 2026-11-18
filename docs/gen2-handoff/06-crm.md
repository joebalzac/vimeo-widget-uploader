# 06 · EliseCRM Takes the Work off Your Team

**Code:** `CrmV2`, data `CRM_TASKS`, `CRM_R`. **Figma:** 618:4862 → 618:9972; mobile 642:139552.

## Copy

- H2: **EliseCRM Takes the Work off Your Team**
- Subtitle: **The AI workspace for your team.**

## Layout

- **Stage:** 1160 wide, gradient background (inlined `crmbg`), radius 12. The window sits 64px from the top and runs off the bottom (bottom −24, so it never shows its bottom edge).
- **Window:**
  - Traffic lights.
  - **Left list:**
    - "Tasks" with a count of **6**.
    - Filters "Oakview ▾ · Prospects + Residents ▾".
    - Task rows: Needs Reply / Lia Tress, Confirm Move-Out / Jordan Ellis, …
  - **Main pane:**
    - Header: avatar, **Lia Tress** with PROSPECT and **TOURED** pills, "Oakview", and call and settings icons.
    - Messages.
    - Composer (Email ▾ · "Type a message…" · format/link/attach · Dismiss · **Send**).
- **Mobile (≤767):**
  - Window 24px from the sides; stage **620px** tall.
  - Messages start at the **top**.
  - The **composer is removed**.
  - Only the **TOURED** pill shows.
  - 16px message padding, 12px bubble text.

## Animation (loop, in view ≥30%)

1. **Entrance:** the card reveals, then the window rises (opacity, y 60 → 0, 0.9s `EZ`, 0.12s delay). Same as the Tour Intelligence page.
2. At 1.1s, the inbound message appears: "I loved Oakview! How do I apply for a December 16 move-in?" (Lia Tress).
3. At +0.9s, a typing indicator shows three round dots.
4. At +1.4s, the AI Assistant reply appears. All words are laid out from the start (so the bubble never resizes) and fade in at 34ms per word.
   - The reply follows the Figma 3-line breaks when the bubble fits (container query).
5. Hold 6s, loop.
