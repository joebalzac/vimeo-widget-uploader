/* Apollo showcase content + per-view animation state (Figma 204:8262 + Tour Intelligence spec). */

export interface ApolloView {
  kind: "phone" | "win";
  title: string;
  /** Sidebar "Active" sessions: [title, selected]. Window views only. */
  sessions?: [string, boolean][];
  question: string;
  /** Question bubble width in window views (Figma Managers: 229px). */
  bubbleWidth?: number;
  paragraphs: string[];
  extra: "file" | "table" | null;
}

export const VIEWS: ApolloView[] = [
  {
    kind: "phone",
    title: "Caladan Lofts Tour Prep",
    question: "I know Steven toured one of our sister properties. What should I know before his tour?",
    paragraphs: [
      "Steven toured Caladan Lofts. He wants a first-floor two-bedroom for September, with a budget of $2,200. At Caladan, he loved the spacious kitchen.",
    ],
    extra: null,
  },
  {
    kind: "win",
    title: "Oakview Tour Coaching Plan",
    sessions: [["Oakview Tour Coaching Plan", true]],
    question: "Who’s skipping the gym on tours? Build me a coaching plan.",
    bubbleWidth: 229,
    paragraphs: [
      "I reviewed 64 tours at Oakview. Marcus skipped the gym on 9 of his 14 tours, more often than anyone else on the team. He also had the team’s lowest tour-to-application rate.",
      "I put together a two-week coaching plan that starts with Marcus and Dana reviewing three flagged tours together.",
    ],
    extra: "file",
  },
  {
    kind: "win",
    title: "Denver Objection Insights",
    sessions: [
      ["Oakview Tour Coaching Plan", false],
      ["Denver Objection Insights", true],
    ],
    question:
      "What were the top three objections in my Denver portfolio last month, and who handled the objections the best?",
    bubbleWidth: 366,
    paragraphs: [
      "Fitness center size came up on 164 of 412 tours, more than the next two combined. Here’s who handled each best, and what they did.",
    ],
    extra: "table",
  },
];

export const OBJECTION_TABLE = [
  ["Objection", "Best Response", "What They Did"],
  ["Pet fees · 97 tours", "Priya, Oakview · 18/27 applied", "Ties fee to dog park & pet wash"],
  ["2-car parking · 58 tours", "Laura, Oakview · 12/17 applied", "Shows rear lot upfront"],
  ["Gym size · 164 tours", "Jordan, The Elm · 31/44 applied", "Mentions partner gym discount"],
];

export interface ViewState {
  bubble: boolean;
  thinking: boolean;
  answer: boolean;
  worked: boolean;
  words: number[];
  extras: number;
}

export const extrasCount = (v: ApolloView) =>
  v.extra === "file" ? 1 : v.extra === "table" ? OBJECTION_TABLE.length : 0;
export const blankState = (i: number): ViewState => ({
  bubble: false,
  thinking: false,
  answer: false,
  worked: false,
  words: VIEWS[i].paragraphs.map(() => 0),
  extras: 0,
});
export const restState = (i: number): ViewState => ({ ...blankState(i), bubble: true, thinking: true });
export const finalState = (i: number): ViewState => ({
  bubble: true,
  thinking: false,
  answer: true,
  worked: true,
  words: VIEWS[i].paragraphs.map((p) => p.split(" ").length),
  extras: 99,
});

