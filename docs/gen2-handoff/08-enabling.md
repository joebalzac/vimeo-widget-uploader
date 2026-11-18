# 08 · Enabling New Operating Models

**Code:** `Enabling3`, `EnMsg`, `TaskC`, data `EN_MSG`. **Figma:** 671:141273 (notes 642:99517 / 642:89329).

## Copy

- H2: **Enabling New Operating Models**
- Subtitle: **Automatically route tasks to the right teams.**

## Layout

- **Stage:** 1160×600 on a dotted canvas `#F4F3F1`.
- **Email card** ("Past-Due Oakview Balance", Inbox × chip), three messages:
  1. **Elise → Maya:** "Maya, your $2,840 balance is 11 days past due. Please pay here."
  2. **Maya → Elise:** "So sorry, I was traveling for work. My bonus pays on the 15th. Can I pay then?"
  3. **Elise → Maya:** "The 15th works! While I have you, your lease ends January 31. We'd love for you to renew for 12 months at $2,995/month."
- **Routing:** lines run from messages 2 and 3 to a centred **ROUTED** pill (mint `#00B080`, check icon), then out to two task cards:
  - **Task Created · Promise To Pay · Maya Bennett** → DELINQUENCY TEAM
  - **Task Created · Generate Lease Renewal · Maya Bennett** → ONSITE TEAM
- **Lines:** 1px `#C7C6C4`. Equal arms either side of the pill.
- **Mobile:** a vertical column (`.en-mcol`) with downward connectors; padding 48, header margin 32.

## Animation (plays once)

Nothing is visible until the section is ≥50% in view.

1. The email card opens as one block (height). Its **skeleton loader holds about 1.7s**, then resolves to text.
2. Lines grow out of the card edge while the group slides left (gx 0 → −320 over 1s `[.55,0,.25,1]`). The pill arrives as the lines reach it.
3. The right-hand lines draw. Each message's pulse travels its route, and its task card appears: Promise To Pay first, then Lease Renewal.
4. The pill shows **ROUTED**.
5. **After the build:** the lilac gradient pulses (`#C1BAFE` → `#A093FD`, crisp 1px) **keep travelling both routes on a loop** (2.6s each, 2.2s rest).
