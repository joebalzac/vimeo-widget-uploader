/**
 * Gen2 hero board data (handoff 02-hero; content from Figma 761:1950 / 763:2042 / 763:2098).
 * Every column holds 6 cards (Figma shows 5; the 6th sits under the bottom fade so a column
 * never empties). Maya Patel (TOURED) sits in the Prospects top 3: her lease is the
 * centrepiece of the one-pass "Elise acting" sequence (useHeroBoard).
 */

export type ColumnKey = "prospects" | "calendar" | "residents";
export type TourKind = "self" | "person" | "virtual";

export interface BoardCardData {
  id: string;
  name: string;
  sub: string;
  /** Prospects / Residents status chip. */
  chip?: string;
  /** Residents: optional second chip after the status (WORK ORDER / RENEWAL OFFER). */
  tag?: string;
  /** Calendar: tour time on the right. */
  time?: string;
  /** Calendar: tour type (left bar colour). */
  kind?: TourKind;
  /**
   * Elise is acting on this card: spinner + gradient text (HeroProgress). It replaces ALL
   * of the card's tags (Calendar: the time) until it's cleared.
   */
  progress?: string;
  /** Bumped to play the "change pop" on the card (e.g. a rescheduled tour). */
  flash?: number;
  /** Arrived during the sequence: pops in instead of joining the load-in wave. */
  pop?: boolean;
  /** Invisible placeholder that holds the flyer's landing spot. */
  twin?: boolean;
}

export interface BoardState {
  prospects: BoardCardData[];
  calendar: BoardCardData[];
  residents: BoardCardData[];
  /** Prospects card currently shown as the dashed "slot" while its flyer is airborne. */
  slotId: string | null;
  /** The card in flight (Prospects → Residents), or null. */
  flight: { card: BoardCardData; w: number; h: number } | null;
}

export const COLUMN_SIZE = 6;

/** Chip colours the hero adds on top of the shared map (Gabby: blue = progress, green = success). */
export const HERO_CHIP_TONES: Record<string, "green"> = {
  "RENT PAID": "green",
  RENEWED: "green",
};

export const KIND_LABEL: Record<TourKind, string> = {
  self: "Self Guided",
  person: "In Person",
  virtual: "Virtual",
};

export const INITIAL_BOARD: BoardState = {
  prospects: [
    { id: "p-daniel", name: "Daniel Reyes", sub: "Oakview Gardens", chip: "INQUIRY" },
    { id: "p-jordan", name: "Jordan Brooks", sub: "Caladan Lofts", chip: "INQUIRY" },
    { id: "p-maya", name: "Maya Patel", sub: "Aura Estates", chip: "TOURED" },
    { id: "p-owen", name: "Owen Fitzgerald", sub: "Aura Estates", chip: "INQUIRY" },
    { id: "p-jonah", name: "Jonah Feldman", sub: "Caladan Lofts", chip: "TOURED" },
    { id: "p-priya", name: "Priya Shah", sub: "Oakview Gardens", chip: "SCHEDULED TOUR" },
  ],
  calendar: [
    { id: "c-natalie", name: "Natalie Foster", sub: "Self Guided @ Caladan Lofts", time: "2:00 PM", kind: "self" },
    { id: "c-camille", name: "Camille Bennett", sub: "In Person @ Caladan Lofts", time: "2:15 PM", kind: "person" },
    { id: "c-lucas", name: "Lucas Ferreira", sub: "Virtual @ Aura Estates", time: "3:00 PM", kind: "virtual" },
    { id: "c-caleb", name: "Caleb Morgan", sub: "In Person @ Oakview Gardens", time: "3:00 PM", kind: "person" },
    { id: "c-bianca", name: "Bianca Russo", sub: "In Person @ Oakview Gardens", time: "5:00 PM", kind: "person" },
    { id: "c-ethan", name: "Ethan Park", sub: "Virtual @ Caladan Lofts", time: "5:30 PM", kind: "virtual" },
  ],
  residents: [
    { id: "r-malcolm", name: "Malcolm Rhodes", sub: "Caladan Lofts", chip: "CURRENT" },
    { id: "r-clara", name: "Clara Whitaker", sub: "Oakview Gardens", chip: "CURRENT", tag: "WORK ORDER" },
    { id: "r-clara-2", name: "Elena Castillo", sub: "Caladan Lofts", chip: "CURRENT", tag: "RENEWAL OFFER" },
    { id: "r-mateo", name: "Mateo Delgado", sub: "Aura Estates", chip: "CURRENT" },
    { id: "r-wesley", name: "Wesley Grant", sub: "Oakview Gardens", chip: "CURRENT", tag: "WORK ORDER" },
    { id: "r-grace", name: "Grace Liu", sub: "Caladan Lofts", chip: "FUTURE" },
  ],
  slotId: null,
  flight: null,
};

/* ── Cards that join during the one-pass sequence (useHeroBoard) ── */

/** New lead: pops in at the top of Prospects as Maya leaves ("Responding" → INQUIRY). */
export const NEW_LEAD: BoardCardData = {
  id: "p-aisha",
  name: "Aisha Rahman",
  sub: "Aura Estates",
  chip: "INQUIRY",
  pop: true,
};

/** Jordan Brooks' booked tour: pops in at the top of Calendar ("Confirming" → time). */
export const BOOKED_TOUR: BoardCardData = {
  id: "c-jordan",
  name: "Jordan Brooks",
  sub: "Virtual @ Caladan Lofts",
  time: "1:30 PM",
  kind: "virtual",
  pop: true,
};

/** Camille Bennett's rescheduled tour time (loop opener: 2:15 PM → 4:30 PM). */
export const RESCHEDULED_TIME = "4:30 PM";

/** Maya Patel's card once she has moved into Residents. */
export const MAYA_RESIDENT_ID = "res-p-maya";

/**
 * Where the one-pass sequence ends (and what reduced motion shows). Every column holds 6;
 * nothing is mid-progress. useHeroBoard's timeline must land exactly here.
 */
export const FINAL_BOARD: BoardState = {
  prospects: [
    { ...NEW_LEAD, pop: false },
    { id: "p-daniel", name: "Daniel Reyes", sub: "Oakview Gardens", chip: "INQUIRY" },
    { id: "p-jordan", name: "Jordan Brooks", sub: "Caladan Lofts", chip: "SCHEDULED TOUR" },
    { id: "p-owen", name: "Owen Fitzgerald", sub: "Aura Estates", chip: "INQUIRY" },
    { id: "p-jonah", name: "Jonah Feldman", sub: "Caladan Lofts", chip: "TOURED" },
    { id: "p-priya", name: "Priya Shah", sub: "Oakview Gardens", chip: "SCHEDULED TOUR" },
  ],
  calendar: [
    { ...BOOKED_TOUR, pop: false },
    { id: "c-natalie", name: "Natalie Foster", sub: "Self Guided @ Caladan Lofts", time: "2:00 PM", kind: "self" },
    { id: "c-camille", name: "Camille Bennett", sub: "In Person @ Caladan Lofts", time: RESCHEDULED_TIME, kind: "person" },
    { id: "c-lucas", name: "Lucas Ferreira", sub: "Virtual @ Aura Estates", time: "3:00 PM", kind: "virtual" },
    { id: "c-caleb", name: "Caleb Morgan", sub: "In Person @ Oakview Gardens", time: "3:00 PM", kind: "person" },
    { id: "c-bianca", name: "Bianca Russo", sub: "In Person @ Oakview Gardens", time: "5:00 PM", kind: "person" },
  ],
  residents: [
    { id: MAYA_RESIDENT_ID, name: "Maya Patel", sub: "Aura Estates", chip: "FUTURE" },
    { id: "r-malcolm", name: "Malcolm Rhodes", sub: "Caladan Lofts", chip: "CURRENT", tag: "RENT PAID" },
    { id: "r-clara", name: "Clara Whitaker", sub: "Oakview Gardens", chip: "CURRENT", tag: "RENEWAL OFFER" },
    { id: "r-clara-2", name: "Elena Castillo", sub: "Caladan Lofts", chip: "CURRENT", tag: "RENEWED" },
    { id: "r-mateo", name: "Mateo Delgado", sub: "Aura Estates", chip: "CURRENT" },
    { id: "r-wesley", name: "Wesley Grant", sub: "Oakview Gardens", chip: "CURRENT", tag: "WORK ORDER" },
  ],
  slotId: null,
  flight: null,
};
