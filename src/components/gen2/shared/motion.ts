/**
 * Gen2 motion tokens. The handoff refers to eases by name (E, EZ, DRAW); EZ and CSS_EASE
 * match the Tour Intelligence page, E and DRAW are the handoff's defaults.
 */
export const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
/** Soft ease-out used by section entrances (nav, CRM window). */
export const EZ = [0.22, 0.8, 0.24, 1] as const;
/** Strong ease-out for things that land (hero columns, cards, phone). */
export const E = [0.16, 1, 0.3, 1] as const;
/** Symmetric ease for lines that draw / rewind. */
export const DRAW = [0.65, 0, 0.35, 1] as const;
/** Height/expand tweens (Delinquency row). */
export const EXPAND = [0.32, 0.72, 0, 1] as const;

export const SPRING_POP = { type: "spring", stiffness: 420, damping: 30 } as const;
export const SPRING_CHIP = { type: "spring", stiffness: 520, damping: 22 } as const;
export const SPRING_FLY = { type: "spring", duration: 0.95, bounce: 0.12 } as const;
export const SPRING_TILT = { stiffness: 260, damping: 26 } as const;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
