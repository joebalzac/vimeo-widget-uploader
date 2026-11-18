/** EliseCRM section data (handoff 06-crm: `CRM_TASKS`, `CRM_R`; Figma 642:57379 / 618:9972). */

export interface CrmTask {
  /** Task type, e.g. "Needs Reply". */
  label: string;
  name: string;
}

/** Left task list (Figma 642:57650 → 642:57680). The first row is the open conversation. */
export const CRM_TASKS: CrmTask[] = [
  { label: "Needs Reply", name: "Lia Tress" },
  { label: "Confirm Move-Out", name: "Jordan Ellis" },
  { label: "Needs Action", name: "Serve Demand Notice" },
  { label: "Needs Reply", name: "Nina Shah" },
  { label: "Call Back", name: "Maya Bennett" },
  { label: "Needs Reply", name: "- Miles Carter" },
];

/** Badge next to "Tasks" (Figma 642:57639). */
export const CRM_TASK_COUNT = 4;

export const CRM_CONTACT = { name: "Lia Tress", property: "Oakview" };

export const CRM_INBOUND = "I loved Oakview! How do I apply for a December 16 move-in?";

/** One word of the AI reply; `link` words render as the purple underlined link. */
export interface CrmWord {
  w: string;
  link?: boolean;
}

const words = (t: string): CrmWord[] => t.split(" ").map((w) => ({ w }));

/**
 * AI Assistant reply (`CRM_R`, Figma 618:10312): a greeting line, then the body. Words fade
 * in one by one; the bubble is laid out at full size from the start.
 */
export const CRM_REPLY: CrmWord[][] = [
  words("Hi Lia,"),
  [
    ...words("Glad you loved Oakview! You can apply"),
    { w: "here", link: true },
    ...words(
      "for a December 16 move-in. Select apartments offer up to 12 weeks of free base rent. Additional fees and costs may apply. Terms and a minimum lease term apply.",
    ),
  ],
];
