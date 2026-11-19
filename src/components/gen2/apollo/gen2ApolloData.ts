/**
 * Gen2 Apollo scenarios (handoff 05-apollo, data `AP2`). Marketing-editable copy.
 * Copy is taken verbatim from the Figma scenario frames
 * (734:178008 Site Team · 734:178086 Onboarding · 734:178164 Regionals · 734:178242 Portfolio Leaders).
 *
 * Each scenario is one tab: a chat title plus the blocks that play in order.
 * Block kinds:
 *   u  user bubble              { k: "u", text }
 *   w  "Worked for a few seconds" (shows "Thinking" first)   { k: "w" }
 *   p  paragraph                { k: "p", text }
 *   l  bulleted list, optional lead line above it   { k: "l", lead?, items }
 *   f  file card                { k: "f", name, ext? }
 *   t  table; `cols` = relative column widths (Figma px)    { k: "t", head, rows, cols? }
 *   b  closing paragraph        { k: "b", text }
 *   a  action button (outlined, purple)   { k: "a", label }
 */

export type ApBlock =
  | { k: "u"; text: string }
  | { k: "w"; label?: string }
  | { k: "p"; text: string }
  | { k: "l"; lead?: string; items: string[] }
  | { k: "f"; name: string; ext?: "pdf" | "xlsx" }
  | { k: "t"; head: string[]; rows: string[][]; cols?: number[] }
  | { k: "b"; text: string }
  | { k: "a"; label: string };

export interface ApScenario {
  /** Tab label. */
  tab: string;
  /** Chat title in the phone header. */
  title: string;
  blocks: ApBlock[];
}

/** Pacing in ms: how long each block holds before the next one appears. */
export const PACE = {
  /** Delay before the first block of a scenario. */
  start: 450,
  u: 1200,
  p: 1300,
  l: 1300,
  f: 1200,
  t: 1800,
  b: 600,
  a: 600,
  /** "Thinking" shimmer, then "Worked for a few seconds" + this extra beat. */
  think: 1800,
  worked: 400,
  /** Hold on the finished conversation before auto-advancing to the next tab. */
  hold: 7000,
} as const;

export const AP2: ApScenario[] = [
  {
    tab: "Site Team",
    title: "Pipe Burst at Aura Estates",
    blocks: [
      { k: "u", text: "A pipe just burst in Unit 4C at Aura Estates. What do I do\u2026" },
      { k: "w" },
      { k: "p", text: "The pipe burst in Building C at Aura Estates affects 4 units. Here\u2019s what I recommend:" },
      {
        k: "t",
        head: ["Unit", "Impact", "Proposed Actions"],
        cols: [48, 109.39, 189.39],
        rows: [
          ["1D", "Burst Pipe", "Open emergency work order. Text and email Jordan. Email Sam."],
          [
            "4A",
            "Ceiling Leak",
            "Escalate #48211 to Emergency. Notify Alex. Pause rent and renewal reminders through Nov 30. Extend offer to Dec 4.",
          ],
          ["7E", "Damp Drywall", "Open emergency work order. Notify Morgan."],
          ["7E", "Possible Water Damage", "Open emergency work order. Move Nov 19 tour and flag Nov 21 move-in."],
        ],
      },
      {
        k: "b",
        text: "Confirm and I\u2019ll submit all 4 actions in one approval request, then check each one took effect.",
      },
      { k: "a", label: "Confirm" },
    ],
  },
  {
    tab: "Onboarding",
    title: "Mixed-Income LIHTC Setup",
    blocks: [
      {
        k: "u",
        text: "Set up Oakview, Caladan Lofts, and Aura Estates as mixed-income LIHTC properties, with 40% of units at 60% AMI.",
      },
      { k: "w" },
      {
        k: "p",
        text: "I\u2019ll add a 60% AMI tier at each property and reserve 40% of units for households at or below that limit. The remaining units will be market rate.",
      },
      {
        k: "l",
        lead: "How should each property meet the 40% set-aside?",
        items: [
          "Designated units: Only units on your affordable unit list count.",
          "Floating units: Any eligible unit occupied by an income-certified household can count.",
        ],
      },
      { k: "u", text: "Use designated units." },
      { k: "w" },
      {
        k: "p",
        text: "Once you approve, I\u2019ll apply these settings to Oakview, Caladan Lofts, and Aura Estates.",
      },
      {
        k: "t",
        head: ["Setting", "Configuration"],
        cols: [123.39, 223.39],
        rows: [
          /* "Burst Pipe" is what the Figma frame says (likely a copy-paste slip; "Program"?) */
          ["Burst Pipe", "LIHTC"],
          ["Income Limit", "60% AMI"],
          ["Set-Aside", "40% of all units at each property"],
          ["Unit Designation", "Only designated affordable units count"],
        ],
      },
      { k: "b", text: "After approval, you can add the affordable unit list for each property." },
      { k: "a", label: "Approve" },
    ],
  },
  {
    tab: "Regionals",
    title: "Boise Regional Report Schedule",
    blocks: [
      { k: "u", text: "Send the Boise Regional Report to ownership on the 5th of every month." },
      { k: "w" },
      {
        k: "p",
        text: "I found the Boise Regional Report in SharePoint under Asset Management \u203a Boise. It tracks occupancy, leasing velocity, renewals, delinquency, and open work orders across six communities.",
      },
      { k: "f", name: "Boise Regional Report", ext: "pdf" },
      {
        k: "t",
        head: ["Routine", "Details"],
        cols: [83.39, 263.39],
        rows: [
          ["Schedule", "5th of each month at 8:00 AM Mountain"],
          ["Report", "Prior month\u2019s numbers in the same workbook format, with a one-page summary"],
          ["Recipients", "The three Cascade Capital Partners contacts who received October\u2019s report"],
        ],
      },
      {
        k: "b",
        text: "I\u2019ll send you the report for review on the 5th and email it to ownership once you approve it.",
      },
      { k: "a", label: "Approve Routine" },
    ],
  },
  {
    tab: "Portfolio Leaders",
    title: "Boise Rent Concession",
    blocks: [
      { k: "u", text: "Offer one month free on new 12-month leases across Boise through January 31." },
      { k: "w" },
      { k: "p", text: "I\u2019ll set up the same concession at all six Boise communities." },
      {
        k: "t",
        head: ["Setting", "Details"],
        cols: [83.39, 263.39],
        rows: [
          /* "Offer" value is verbatim from Figma (looks copied from the Regionals table) */
          ["Offer", "5th of each month at 8:00 AM Mountain"],
          ["Eligibility", "New 12-month leases"],
          ["Application", "Automatically applied to qualifying leases"],
          ["Availability", "Through January 31, 2027"],
        ],
      },
      {
        k: "b",
        text: "Once approved, LeasingAI will start sharing the offer with prospects and stop when it expires.",
      },
      { k: "a", label: "Approve Concession" },
    ],
  },
];

export const AP2_TABS = AP2.map((s) => s.tab);
