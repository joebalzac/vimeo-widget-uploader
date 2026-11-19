/*
 * Hero board data — a direct port of the Final prototype's HB_CH / HB_BAR / HB0 / HB_NEW /
 * HB_TIME constants (rows turned into objects for typing; values unchanged).
 */

/** Chip key → [label, tone class, in-progress?]. In-progress chips render as gradient text + spinner. */
export const HB_CH = {
  resp: ["Responding", "inq", true],
  fup: ["Following Up", "inq", true],
  disp: ["Assigning Work Order", "inq", true],
  crent: ["Collecting Rent", "inq", true],
  paid: ["Rent Paid", "tour", false],
  pren: ["Predicting Renewal", "inq", true],
  soff: ["Sending Offer", "inq", true],
  conf: ["Confirming", "inq", true],
  resch: ["Rescheduling Tour", "inq", true],
  renewed: ["Renewed", "tour", false],
  inq: ["Inquiry", "inq", false],
  tour: ["Toured", "tour", false],
  sched: ["Scheduled Tour", "tour", false],
  sing: ["Scheduling Tour", "inq", true],
  sig: ["Processing Application", "inq", true],
  cur: ["Current", "cur", false],
  fut: ["Future", "cur", false],
  wo: ["Work Order", "wo", false],
  ren: ["Renewal Offer", "ren", false],
  ls: ["Lease Signed", "tour", false],
} as const satisfies Record<string, readonly [string, string, boolean]>;
export type ChipKey = keyof typeof HB_CH;

/** Calendar tour types: label + left-bar colour. */
export const HB_BAR = {
  s: ["Self Guided", "#2e95ff"],
  p: ["In Person", "#8571fc"],
  v: ["Virtual", "#1fd19a"],
} as const;
export type TourType = keyof typeof HB_BAR;

export interface CalRow {
  id: string;
  name: string;
  ty: TourType;
  prop: string;
  time: string;
  /** Prototype r[6]: 0 / undefined = time shown; 1 = "Confirming"; "resch" = "Rescheduling Tour"; 2 = time hidden. */
  st?: 0 | 1 | 2 | "resch";
}

export interface PersonRow {
  id: string;
  name: string;
  prop: string;
  chips: ChipKey[];
  /** Twin row that's in the DOM but invisible while the flyer is travelling (prototype r[4]). */
  hid?: boolean;
  /** Dashed slot left behind in Prospects while the card flies (prototype "gh" rows). */
  ghost?: boolean;
}

export interface Flight {
  row: PersonRow;
  from: { x: number; y: number; w: number };
  to: { x: number; y: number; w: number };
}

export interface BoardState {
  c: CalRow[];
  p: PersonRow[];
  r: PersonRow[];
  lift: string | null;
  fresh: string | null;
  chg: string | null;
  fly: Flight | null;
}

const cal = (id: string, name: string, ty: TourType, prop: string, time: string): CalRow => ({ id, name, ty, prop, time });
const per = (id: string, name: string, prop: string, chips: ChipKey[]): PersonRow => ({ id, name, prop, chips });

export const HB0: Pick<BoardState, "c" | "p" | "r"> = {
  c: [
    cal("c1", "Natalie Foster", "s", "Caladan Lofts", "2:00 PM"),
    cal("c2", "Camille Bennett", "p", "Caladan Lofts", "2:15 PM"),
    cal("c3", "Lucas Ferreira", "v", "Aura Estates", "3:00 PM"),
    cal("c4", "Caleb Morgan", "p", "Oakview", "3:00 PM"),
    cal("c5", "Bianca Russo", "p", "Oakview", "5:00 PM"),
    cal("c7", "Henry Walsh", "v", "Aura Estates", "5:30 PM"),
  ],
  p: [
    per("p1", "Daniel Reyes", "Oakview", ["inq"]),
    per("p3", "Maya Patel", "Aura Estates", ["tour"]),
    per("p2", "Jordan Brooks", "Caladan Lofts", ["inq"]),
    per("p4", "Owen Fitzgerald", "Aura Estates", ["inq"]),
    per("p5", "Jonah Feldman", "Caladan Lofts", ["tour"]),
    per("p8", "Lena Ortiz", "Oakview", ["inq"]),
  ],
  r: [
    per("r1", "Malcolm Rhodes", "Caladan Lofts", ["cur"]),
    per("r2", "Clara Whitaker", "Oakview", ["cur", "wo"]),
    per("r3", "Clara Whitaker", "Oakview", ["cur", "ren"]),
    per("r4", "Mateo Delgado", "Aura Estates", ["cur"]),
    per("r5", "Wesley Grant", "Oakview", ["cur", "wo"]),
    per("r6", "Nina Park", "Caladan Lofts", ["cur"]),
  ],
};

export const HB_NEW: [string, string][] = [
  ["Sofia Martinez", "Aura Estates"],
  ["Ethan Cole", "Caladan Lofts"],
  ["Priya Shah", "Oakview"],
  ["Noah Kim", "Aura Estates"],
  ["Ava Thompson", "Caladan Lofts"],
  ["Leo Hart", "Oakview"],
  ["Grace Lin", "Aura Estates"],
  ["Marcus Bell", "Caladan Lofts"],
];

export const HB_TIME = ["1:30 PM", "11:30 AM", "12:45 PM", "10:15 AM", "1:00 PM", "11:00 AM"];

export const initialBoard = (): BoardState => ({
  c: HB0.c.map((r) => ({ ...r })),
  p: HB0.p.map((r) => ({ ...r })),
  r: HB0.r.map((r) => ({ ...r })),
  lift: null,
  fresh: null,
  chg: null,
  fly: null,
});
