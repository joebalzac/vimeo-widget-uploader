import { useEffect, useId, useRef, useState } from "react";
import "./ProductShowcase.css";
import { AUDIO } from "../assets/audio";

function pushEvent(event: string) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event });
}

export interface DemoMessage {
  role: "user" | "ai";
  /** Bubble / transcript text. */
  text: string;
  /** Sender label, shown under user bubbles. */
  name?: string;
  /** Processing label shown while the AI "thinks" (ai role only). */
  status?: string;
  /** Per-line call audio (bundled URL); plays when this message appears. */
  audioSrc?: string;
  /** Length of this line's audio clip in ms; drives when the next line appears. */
  durationMs?: number;
  /** Fraction of durationMs over which words stream (default 0.78). Lower = quicker. */
  streamFactor?: number;
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
  /** GTM dataLayer event fired when the first (Housing) tab is selected. */
  eventHousingTab?: string;
  /** GTM dataLayer event fired when the second (Healthcare) tab is selected. */
  eventHealthcareTab?: string;
  /** GTM dataLayer event fired when the audio speaker button is clicked. */
  eventAudioBtn?: string;
}

const PLACEHOLDER_TABS: DemoTab[] = [
  {
    id: "housing",
    label: "Housing",
    messages: [
      {
        role: "user",
        name: "Jordan T.",
        text: "Hey, the garbage disposal just hums and won't turn on.",
        audioSrc: AUDIO["housing/Jordan-Hey"],
        durationMs: 3000,
      },
      {
        role: "ai",
        status: "AI is gathering details and checking device guides…",
        text: 'Sorry to hear that. A humming disposal is usually jammed. Try inserting a 1/4" Allen wrench into the hex slot underneath, turning it back and forth to free the jam, then press the red reset button and test it again. Let me know how it goes.',
        audioSrc: AUDIO["housing/Elise-Sorry"],
        durationMs: 17000,
        streamFactor: 0.92,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Oh great, that worked! It's running now.",
        audioSrc: AUDIO["housing/Jordan-Oh-Great"],
        durationMs: 3000,
      },
      {
        role: "ai",
        status: "AI logs outcome and closes the maintenance request.",
        text: "Wonderful! I'm glad that resolved it, and we saved you a maintenance visit.",
        audioSrc: AUDIO["housing/Elise-Wonderful"],
        durationMs: 5000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Super helpful! Thank you!",
        audioSrc: AUDIO["housing/Jordan-Super-Helpful"],
        durationMs: 2000,
      },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    messages: [
      {
        role: "ai",
        text: "Hi Mia, your annual physical is coming up next week. Before I confirm your appointment, has your insurance changed since your last visit?",
        audioSrc: AUDIO["healthcare/Elise-Hi-Mia"],
        durationMs: 8000,
      },
      {
        role: "user",
        name: "Mia S.",
        text: "Yes, I switched jobs and now have Blue Cross.",
        audioSrc: AUDIO["healthcare/Mia-Yes-I-Swithced"],
        durationMs: 3000,
      },
      {
        role: "ai",
        status: "AI updates insurance on file and checks eligibility…",
        text: "Thanks. Can you provide your member ID so I can verify coverage?",
        audioSrc: AUDIO["healthcare/Mia-Got-It"],
        durationMs: 4000,
      },
      {
        role: "user",
        name: "Mia S.",
        text: "Sure, it's BC12345678.",
        audioSrc: AUDIO["healthcare/Mia-XJH"],
        durationMs: 6000,
      },
      {
        role: "ai",
        status: "AI verifies coverage and confirms appointment.",
        text: "Thanks. I've confirmed your plan is accepted. You're all set, we'll see you next week!",
        audioSrc: AUDIO["healthcare/Elise-Thanks"],
        durationMs: 5000,
      },
    ],
  },
];

// ── Timing config (ms) ───────────────────────────────────────────────────────
// Each line appears when the previous clip finishes plus GAP_MS. Per-line clip
// lengths come from message.durationMs; the timeline is derived per scenario.
const START_MS = 600; // delay before the first line
const GAP_MS = 900; // pause between a clip ending and the next line
const PROCESS_DUR = 800; // "processing" pre-roll before an AI line with a status
const LOOP_PAUSE = 4000; // pause after the last line before the loop restarts
const DEFAULT_DUR = 2500; // fallback clip length when durationMs is unset
const GAP = 12; // px gap used by the slide-to-latest math (not a duration)

export default function ProductShowcase({
  eyebrow = "See it in action",
  heading = "Product Demo",
  tabs = PLACEHOLDER_TABS,
  eventHousingTab = "product_demo_housing_tab",
  eventHealthcareTab = "product_demo_healthcare_tab",
  eventAudioBtn = "product_demo_audio_btn",
}: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [audioOn, setAudioOn] = useState(false);
  const panelsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  // Read inside the animation effect without re-running it when audio toggles.
  const audioOnRef = useRef(audioOn);
  audioOnRef.current = audioOn;

  const hasAudio = (
    tabs.find((t) => t.id === activeTab)?.messages ?? []
  ).some((m) => m.audioSrc);

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

    const activeMessages =
      tabs.find((t) => t.id === activeTab)?.messages ?? [];

    // Derive the timeline from each line's clip length: line i appears when the
    // previous clip finished plus GAP_MS, so the text tracks the speech.
    const durations = activeMessages.map((m) => m.durationMs ?? DEFAULT_DUR);
    const appearAt: number[] = [];
    let cursor = START_MS;
    durations.forEach((d, i) => {
      appearAt[i] = cursor;
      cursor += d + GAP_MS;
    });
    const lastEnd = durations.length
      ? appearAt[durations.length - 1] + durations[durations.length - 1]
      : START_MS;

    // Play the clip for message `i` as it appears, so each line's audio stays
    // in step with the text animation. Swapping src cuts off the prior line.
    // Returns true if it actually started audio. When `msg` is given, the wave
    // (is-speaking) is stopped the moment the real clip ends.
    function playClip(i: number, msg?: HTMLElement) {
      const audio = audioRef.current;
      const src = activeMessages[i]?.audioSrc;
      if (!audio || !audioOnRef.current || !src) return false;
      audio.src = src;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      if (msg) {
        audio.addEventListener(
          "ended",
          () => msg.classList.remove("is-speaking"),
          { once: true },
        );
      }
      return true;
    }

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

    function streamWords(msg: HTMLElement, dur: number, factor: number) {
      const words = [...msg.querySelectorAll<HTMLElement>(".ps__word")];
      if (!words.length) return;
      // Stream words across `factor` of the clip; the longer per-word fade (CSS)
      // keeps consecutive words smooth.
      const step = (dur * factor) / words.length;
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
      msgs.forEach((msg, i) => {
        const showAt = appearAt[i] ?? START_MS + i * (DEFAULT_DUR + GAP_MS);
        const dur = durations[i] ?? DEFAULT_DUR;
        if (msg.classList.contains("ps__msg--ai")) {
          // Only run the "processing" pre-roll when the message has a status
          // line (e.g. the AI-initiated first turn shows no status).
          if (msg.querySelector(".ps__ai-status")) {
            push(() => {
              msg.classList.add("is-processing");
              raf(slideToLatest);
            }, Math.max(0, showAt - PROCESS_DUR));
          }
          push(() => {
            msg.classList.remove("is-processing");
            msg.classList.add("is-show", "is-speaking");
            streamWords(msg, dur, activeMessages[i]?.streamFactor ?? 0.78);
            // When audio plays, the wave stops on the real "ended" event; when
            // muted, fall back to the estimated clip duration.
            const startedAudio = playClip(i, msg);
            if (!startedAudio) {
              push(() => msg.classList.remove("is-speaking"), dur);
            }
            raf(slideToLatest);
          }, showAt);
        } else {
          push(() => {
            msg.classList.add("is-show");
            playClip(i);
            raf(slideToLatest);
          }, showAt);
        }
      });
      push(() => {
        reset();
        push(play, 300);
      }, lastEnd + LOOP_PAUSE);
    }

    reset();
    push(play, 100);

    return () => {
      timers.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
      timers = [];
      rafs = [];
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [activeTab, tabs]);

  // Muting pauses immediately; unmuting resumes at the next line (per-line
  // playback lives in the animation effect above).
  useEffect(() => {
    if (!audioOn) audioRef.current?.pause();
  }, [audioOn]);

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
            {tabs.map((tab, i) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`ps__tab${active ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    if (active) return;
                    setActiveTab(tab.id);
                    pushEvent(i === 0 ? eventHousingTab : eventHealthcareTab);
                  }}
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
                    {msg.status && (
                      <div className="ps__ai-status">
                        <StarIcon />
                        <span className="ps__status-text">{msg.status}</span>
                      </div>
                    )}
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
            disabled={!hasAudio}
            onClick={() => {
              setAudioOn((v) => !v);
              pushEvent(eventAudioBtn);
            }}
          >
            <SpeakerIcon />
          </button>
          <audio ref={audioRef} preload="auto" />
        </div>

        <div className="ps__inset" aria-hidden="true" />
      </div>
    </section>
  );
}

/** Four-point sparkle used as the "thinking" indicator. */
function StarIcon() {
  // Unique gradient id per instance — shared ids break when a duplicate lives in
  // a display:none tab panel (its gradient stops resolving).
  const gradId = useId();
  return (
    <svg
      className="ps__star"
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C1BAFE" />
          <stop offset="100%" stopColor="#1A87F0" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M240 120C173.72 120 120 173.72 120 240C120 173.72 66.28 120 0 120C66.28 120 120 66.28 120 0C120 66.28 173.72 120 240 120Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}

/** Seven-bar voice waveform; bars animate independently while the line is shown.
    Bar geometry + gradient match the Figma waveform asset. */
function Waveform() {
  // Unique gradient id per instance (see StarIcon note).
  const gradId = useId();
  const bars = [
    { x: 0, y: 6, h: 6 },
    { x: 5.818, y: 0, h: 18 },
    { x: 11.637, y: 2.909, h: 12.182 },
    { x: 17.455, y: 5.091, h: 7.818 },
    { x: 23.273, y: 5.091, h: 7.818 },
    { x: 29.091, y: 2.909, h: 12.182 },
    { x: 34.909, y: 6, h: 6 },
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
          id={gradId}
          x1="5.625"
          y1="3.344"
          x2="70.14"
          y2="42.876"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#C1BAFE" />
          <stop offset="100%" stopColor="#1A87F0" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <rect
          key={i}
          className="ps__wv-bar"
          x={b.x}
          y={b.y}
          width="2"
          height={b.h}
          rx="1"
          fill={`url(#${gradId})`}
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
