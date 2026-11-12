export type RoomKey = "kitchen" | "living" | "guest";

/** Phase timelines per card: [ms to wait, phase to set (null = close)]. */
export const TIMELINE: Record<RoomKey, [number, number | null][]> = {
  kitchen: [[800, 1], [320, 2], [1100, 3], [1900, null]],
  living: [[1300, 1], [2000, null]],
  guest: [[700, 1], [1900, 3], [2000, null]],
};
