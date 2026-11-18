/** Chip label → colour family (handoff 02-hero: blue = in progress, green = success). */
export type ChipTone = "blue" | "green" | "neutral" | "pink" | "sky" | "purple" | "orange";

const TONES: Record<string, ChipTone> = {
  INQUIRY: "blue",
  "SCHEDULING TOUR": "blue",
  "SIGNING LEASE": "blue",
  "SENDING REMINDER": "blue",
  CLEANING: "blue",
  "SCHEDULED TOUR": "green",
  "TOUR SCHEDULED": "green",
  TOURED: "green",
  "LEASE SIGNED": "green",
  READY: "green",
  COMPLETE: "green",
  PAID: "green",
  "NTV SAVE": "green",
  CURRENT: "neutral",
  FUTURE: "neutral",
  VACANT: "neutral",
  PROSPECT: "neutral",
  "WORK ORDER": "pink",
  "RENEWAL OFFER": "sky",
  DUE: "orange",
  "PAST DUE": "orange",
};
/** Labels that show the spinner (work in progress). */
const SPINNING = new Set(["SCHEDULING TOUR", "SIGNING LEASE", "SENDING REMINDER", "CLEANING"]);

export function chipTone(label: string): ChipTone {
  return TONES[label.toUpperCase()] ?? "neutral";
}

/** Labels that show the spinner by default. */
export function chipSpins(label: string) {
  return SPINNING.has(label.toUpperCase());
}
