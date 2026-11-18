/**
 * Gen2 hero board data (handoff 02-hero; content from Figma 761:1950 / 763:2042 / 763:2098).
 * Every column holds 6 cards (Figma shows 5; the 6th sits under the bottom fade so the loop
 * never empties a column). Maya Patel (TOURED) sits in the Prospects top 3 so the first beat
 * of the story loop is her lease.
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
  /** Arrived during the loop: pops in instead of joining the load-in wave. */
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
    { id: "r-clara-2", name: "Clara Whitaker", sub: "Oakview Gardens", chip: "CURRENT", tag: "RENEWAL OFFER" },
    { id: "r-mateo", name: "Mateo Delgado", sub: "Aura Estates", chip: "CURRENT" },
    { id: "r-wesley", name: "Wesley Grant", sub: "Oakview Gardens", chip: "CURRENT", tag: "WORK ORDER" },
    { id: "r-grace", name: "Grace Liu", sub: "Caladan Lofts", chip: "FUTURE" },
  ],
  slotId: null,
  flight: null,
};

/** New inquiries that pop in at the top of Prospects, in order (cycled). */
export const NEW_LEADS: { name: string; sub: string }[] = [
  { name: "Aisha Rahman", sub: "Aura Estates" },
  { name: "Tyler Brooks", sub: "Caladan Lofts" },
  { name: "Camila Ortiz", sub: "Oakview Gardens" },
  { name: "Owen Fischer", sub: "Aura Estates" },
  { name: "Hannah Cho", sub: "Caladan Lofts" },
  { name: "Diego Morales", sub: "Oakview Gardens" },
  { name: "Leah Goldberg", sub: "Aura Estates" },
  { name: "Samuel Okafor", sub: "Caladan Lofts" },
];

/** Fills the bottom of Prospects when a prospect leaves for Residents. */
export const BACKFILL: { name: string; sub: string }[] = [
  { name: "Rachel Kim", sub: "Oakview Gardens" },
  { name: "Nathan Price", sub: "Caladan Lofts" },
  { name: "Zoe Martin", sub: "Aura Estates" },
  { name: "Caleb Wright", sub: "Oakview Gardens" },
];

/** Times for tours booked during the loop (cycled). */
export const TOUR_TIMES = ["4:30 PM", "5:15 PM", "6:00 PM", "10:45 AM", "2:15 PM", "11:30 AM"];
export const TOUR_KINDS: TourKind[] = ["person", "self", "virtual"];
