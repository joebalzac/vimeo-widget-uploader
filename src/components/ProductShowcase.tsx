import { useEffect, useRef, useState } from "react";
import "./ProductShowcase.css";

export interface DemoMessage {
  role: "user" | "ai";
  /** Bubble / transcript text. */
  text: string;
  /** Sender label, shown under user bubbles. */
  name?: string;
  /** Processing label shown while the AI "thinks" (ai role only). */
  status?: string;
}

export interface DemoTab {
  /** Stable id used for tab state and DOM lookup. */
  id: string;
  /** Toggle label. */
  label: string;
  messages: DemoMessage[];
}

export interface ProductShowcaseProps {
  eyebrow?: string;
  heading?: string;
  tabs?: DemoTab[];
}

const PLACEHOLDER_TABS: DemoTab[] = [
  {
    id: "housing",
    label: "Housing",
    messages: [
      {
        role: "user",
        name: "Jordan T.",
        text: "The garbage disposal just hums and won't turn on.",
      },
      {
        role: "ai",
        status: "Pulling resident file…",
        text: 'Sorry to hear that. A humming disposal is usually jammed. Try inserting a 1/4" Allen wrench into the hex slot underneath, turning it back and forth to free the jam, then press the red reset button and test it again. Let me know how it goes.',
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Ok, that worked, it's running now.",
      },
      {
        role: "ai",
        status: "Logging resolution…",
        text: "Wonderful, I'm glad that resolved it, and we saved you a maintenance visit.",
      },
      { role: "user", name: "Jordan T.", text: "Super helpful. Thank you!" },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    messages: [
      {
        role: "user",
        name: "Marcus R.",
        text: "I need to reschedule my appointment with Dr. Chen tomorrow.",
      },
      {
        role: "ai",
        status: "Checking schedule…",
        text: "Of course, Marcus! Dr. Chen has openings this Thursday at 10 AM or Friday at 2 PM. Which works better for you?",
      },
      { role: "user", name: "Marcus R.", text: "Friday at 2 PM works." },
      {
        role: "ai",
        status: "Verifying coverage…",
        text: "Done! I've rescheduled you to Friday, June 27th at 2:00 PM with Dr. Chen. You'll get a confirmation text shortly.",
      },
      { role: "user", name: "Marcus R.", text: "Perfect, thank you so much!" },
    ],
  },
];

// ── Timing config (ms) ───────────────────────────────────────────────────────
// APPEAR_AT[i] is when message i shows. Processing fires PROCESS_DUR before an
// AI message; SPEAK_DUR drives the word-streaming length of each AI message.
const APPEAR_AT = [600, 3000, 7500, 9800, 13000];
const SPEAK_DUR = [2800, 2200];
const PROCESS_DUR = 800;
const LOOP_PAUSE = 4000;
const GAP = 12;

export default function ProductShowcase({
  eyebrow = "See it in action",
  heading = "Product Demo",
  tabs = PLACEHOLDER_TABS,
}: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [audioOn, setAudioOn] = useState(false);
  const panelsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Animation engine — scoped to one effect run so all timers/rAF handles are
  // captured locally and torn down on tab change / unmount. Mirrors the proven
  // imperative classList choreography (entrance, processing, word streaming,
  // viewport slide) rather than re-deriving per-message phase in React state.
  useEffect(() => {
    const panel = panelsRef.current[activeTab];
    if (!panel) return;

    let timers: number[] = [];
    let rafs: number[] = [];
    const push = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };
    const raf = (fn: () => void) => {
      rafs.push(window.requestAnimationFrame(fn));
    };

    const inner = () => panel.querySelector<HTMLElement>(".ps__conv-inner");
    const msgEls = () => [...panel.querySelectorAll<HTMLElement>(".ps__msg")];

    function slideToLatest() {
      const el = inner();
      if (!el) return;
      const visible = [
        ...panel!.querySelectorAll<HTMLElement>(
          ".ps__msg.is-show, .ps__msg.is-processing"
        ),
      ];
      if (visible.length <= 2) {
        el.style.transform = "translateY(0)";
        return;
      }
      let offset = 0;
      for (let i = 0; i < visible.length - 2; i++) {
        offset += visible[i].offsetHeight + GAP;
      }
      el.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = `translateY(-${offset}px)`;
    }

    function streamWords(msg: HTMLElement, dur: number) {
      const words = [...msg.querySelectorAll<HTMLElement>(".ps__word")];
      if (!words.length) return;
      const step = (dur * 0.9) / words.length;
      words.forEach((w, i) => push(() => w.classList.add("is-visible"), i * step));
    }

    function reset() {
      const el = inner();
      if (el) {
        el.style.transition = "none";
        el.style.transform = "translateY(0)";
      }
      msgEls().forEach((m) =>
        m.classList.remove("is-show", "is-speaking", "is-processing")
      );
      panel!
        .querySelectorAll<HTMLElement>(".ps__word")
        .forEach((w) => w.classList.remove("is-visible"));
    }

    function play() {
      const msgs = msgEls();
      let aiIdx = 0;
      msgs.forEach((msg, i) => {
        const showAt = APPEAR_AT[i] ?? 600 + i * 2500;
        if (msg.classList.contains("ps__msg--ai")) {
          const thisAi = aiIdx++;
          const dur = SPEAK_DUR[thisAi] ?? 2000;
          push(() => {
            msg.classList.add("is-processing");
            raf(slideToLatest);
          }, Math.max(0, showAt - PROCESS_DUR));
          push(() => {
            msg.classList.remove("is-processing");
            msg.classList.add("is-show", "is-speaking");
            streamWords(msg, dur);
            push(() => msg.classList.remove("is-speaking"), dur);
            raf(slideToLatest);
          }, showAt);
        } else {
          push(() => {
            msg.classList.add("is-show");
            raf(slideToLatest);
          }, showAt);
        }
      });
      const last = APPEAR_AT[msgs.length - 1] ?? 13000;
      push(() => {
        reset();
        push(play, 300);
      }, last + LOOP_PAUSE);
    }

    reset();
    push(play, 100);

    return () => {
      timers.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
      timers = [];
      rafs = [];
    };
  }, [activeTab, tabs]);

  return (
    <section className="ps">
      <div className="ps__head">
        <div className="ps__eyebrow">
          <span className="ps__eyebrow-dot" aria-hidden="true" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="ps__heading">{heading}</h2>
      </div>

      <div className="ps__card">
        <div className="ps__grid" aria-hidden="true" />
        <div className="ps__glow" aria-hidden="true" />

        {/* Top bar — tab toggle */}
        <div className="ps__top-bar">
          <div className="ps__toggle" role="tablist" aria-label="Demo scenario">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`ps__tab${active ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={active}
                  onClick={() => active || setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation panels */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            ref={(el) => {
              panelsRef.current[tab.id] = el;
            }}
            className={`ps__conv${tab.id === activeTab ? "" : " is-hidden"}`}
            role="tabpanel"
          >
            <div className="ps__conv-inner">
              {tab.messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="ps__msg ps__msg--user">
                    <div className="ps__bubble">
                      <p>{msg.text}</p>
                    </div>
                    {msg.name && (
                      <span className="ps__msg-name">{msg.name}</span>
                    )}
                  </div>
                ) : (
                  <div key={i} className="ps__msg ps__msg--ai">
                    <div className="ps__ai-status">
                      <StarIcon />
                      <span className="ps__status-text">{msg.status}</span>
                    </div>
                    <Waveform />
                    <p className="ps__ai-text">
                      {msg.text.split(/\s+/).map((w, wi) => (
                        <span className="ps__word" key={wi}>
                          {w}{" "}
                        </span>
                      ))}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {/* Bottom bar — audio button */}
        <div className="ps__bottom-bar">
          <button
            type="button"
            className={`ps__audio-btn${audioOn ? " is-playing" : ""}`}
            aria-label={audioOn ? "Pause call audio" : "Listen to call"}
            aria-pressed={audioOn}
            onClick={() => setAudioOn((v) => !v)}
          >
            <SpeakerIcon />
          </button>
        </div>

        <div className="ps__inset" aria-hidden="true" />
      </div>
    </section>
  );
}

/** Four-point sparkle used as the "thinking" indicator. */
function StarIcon() {
  return (
    <svg
      className="ps__star"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="psStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b4fff" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path
        d="M7,0 C7,3.2 10.8,3.2 14,7 C10.8,7 10.8,10.8 7,14 C7,10.8 3.2,10.8 0,7 C3.2,7 3.2,3.2 7,0Z"
        fill="url(#psStarGrad)"
      />
    </svg>
  );
}

/** Seven-bar voice waveform; bars animate independently while speaking. */
function Waveform() {
  const bars = [
    { x: 0, y: 6.5, h: 5 },
    { x: 5, y: 3.5, h: 11 },
    { x: 10, y: 1, h: 16 },
    { x: 15, y: 2.5, h: 13 },
    { x: 20, y: 4.5, h: 9 },
    { x: 25, y: 6, h: 6 },
    { x: 30, y: 7, h: 4 },
  ];
  return (
    <svg
      className="ps__waveform"
      viewBox="0 0 37 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="psWvGrad"
          x1="0"
          y1="0"
          x2="37"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6b4fff" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <rect
          key={i}
          className="ps__wv-bar"
          x={b.x}
          y={b.y}
          width="3.5"
          height={b.h}
          rx="10"
          fill="url(#psWvGrad)"
        />
      ))}
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" />
      <path
        d="M15.54 8.46a5 5 0 010 7.07"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19.07 4.93a10 10 0 010 14.14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
