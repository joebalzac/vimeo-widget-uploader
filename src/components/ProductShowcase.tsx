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
  /** Keep this user bubble on a single line (no wrap) on desktop. */
  oneLine?: boolean;
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
  /** Hides the eyebrow/heading section above the card (health-site variant doesn't need it). */
  isHealthcare?: boolean;
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
        text: "Hey. So I have no hot water and it's really urgent.",
        audioSrc: AUDIO["housing/Jordan-No-Hot-Water"],
        durationMs: 4000,
      },
      {
        role: "ai",
        status:
          "AI detects a potential maintenance emergency and initiates resident verification.",
        text: "I'm sorry you're dealing with that. Let me get a maintenance request started. Can I have your full name and apartment number?",
        audioSrc: AUDIO["housing/Elise-Sorry-Maintenance"],
        durationMs: 7000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Yeah, my name's Jordan and I live in unit 12F.",
        audioSrc: AUDIO["housing/Jordan-Name-Unit"],
        durationMs: 3000,
      },
      {
        role: "ai",
        status:
          "AI verifies the resident, retrieves the unit record, and loads maintenance history.",
        text: "Thanks, Jordan. Is the hot water out everywhere, or just in the kitchen?",
        audioSrc: AUDIO["housing/Elise-Everywhere-Or-Kitchen"],
        durationMs: 4000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Uh, just the kitchen.",
        audioSrc: AUDIO["housing/Jordan-Just-Kitchen"],
        durationMs: 2000,
        oneLine: true,
      },
      {
        role: "ai",
        status:
          "AI categorizes the issue, determines priority, and prepares the work order.",
        text: "Got it. I'll submit a work order for the hot water issue in your kitchen. Is maintenance allowed to enter if you're not home?",
        audioSrc: AUDIO["housing/Elise-Got-It-Work-Order"],
        durationMs: 7000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Yeah, they can come.",
        audioSrc: AUDIO["housing/Jordan-They-Can-Come"],
        durationMs: 2000,
        oneLine: true,
      },
      {
        role: "ai",
        status:
          "AI creates the work order, records permission to enter, and routes the request to the maintenance team.",
        text: "Perfect. Your work order has been submitted, and I've noted that maintenance has permission to enter. They'll take care of it as soon as possible.",
        audioSrc: AUDIO["housing/Elise-Perfect-Submitted"],
        durationMs: 8000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Thanks.",
        audioSrc: AUDIO["housing/Jordan-Thanks"],
        durationMs: 1000,
        oneLine: true,
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
        oneLine: true,
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
const PROCESS_DUR = 1600; // "processing" pre-roll before an AI line with a status — long enough to read the status line
const LOOP_PAUSE = 4000; // pause after the last line before the loop restarts
const DEFAULT_DUR = 2500; // fallback clip length when durationMs is unset
const GAP = 12; // px gap used by the slide-to-latest math (not a duration)

export default function ProductShowcase({
  eyebrow = "See it in action",
  heading = "Product Demo",
  isHealthcare = false,
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
  // The line currently "on air" — recorded on every line (even while muted) so
  // unmuting mid-dialogue can resume it in sync instead of waiting for the next.
  const activeClipRef = useRef<{
    src: string;
    startedAt: number;
    durationMs: number;
  } | null>(null);

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
    function playClip(i: number) {
      const audio = audioRef.current;
      const src = activeMessages[i]?.audioSrc;
      if (!src) return;
      // Record what's on air regardless of mute state, so a later unmute can
      // resume this exact clip at the right offset.
      activeClipRef.current = {
        src,
        startedAt: performance.now(),
        durationMs: durations[i] ?? DEFAULT_DUR,
      };
      if (!audio || !audioOnRef.current) return;
      audio.src = src;
      audio.currentTime = 0;
      audio.play().catch(() => {});
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

    // Fade the whole response in as one block. The rAF gives the browser a
    // frame to register the text's display:none -> visible switch (from
    // is-processing being removed) before toggling opacity, so it transitions
    // instead of popping straight to visible.
    function revealText(msg: HTMLElement) {
      const text = msg.querySelector<HTMLElement>(".ps__ai-text");
      if (!text) return;
      raf(() => text.classList.add("is-visible"));
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
        .querySelectorAll<HTMLElement>(".ps__ai-text")
        .forEach((t) => t.classList.remove("is-visible"));
      activeClipRef.current = null;
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
            revealText(msg);
            playClip(i);
            // Stop the wave once this line's clip duration elapses, whether
            // or not audio actually played (muted, blocked autoplay, etc.).
            push(() => msg.classList.remove("is-speaking"), dur);
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
      // Loop: fade the finished conversation out and stop audio first, then
      // snap the scroll position back only once it's invisible — otherwise the
      // instant transform reset shows as a jump between dialogues.
      push(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        activeClipRef.current = null;
        msgEls().forEach((m) =>
          m.classList.remove("is-show", "is-speaking", "is-processing")
        );
        panel!
          .querySelectorAll<HTMLElement>(".ps__ai-text")
          .forEach((t) => t.classList.remove("is-visible"));
        push(() => {
          const el = inner();
          if (el) {
            el.style.transition = "none";
            el.style.transform = "translateY(0)";
          }
          push(play, 60);
        }, 550); // wait out the 0.5s opacity fade before the invisible snap
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

  // Muting pauses immediately. Unmuting resumes the line that's currently on
  // air, seeking to where it should be so the audio matches the on-screen text
  // instead of staying silent until the next line begins.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioOn) {
      audio.pause();
      return;
    }
    const clip = activeClipRef.current;
    if (!clip) return;
    const elapsed = (performance.now() - clip.startedAt) / 1000;
    // Clip already finished (we're in the gap before the next line) — let the
    // next line's own playback handle it rather than replaying stale audio.
    if (elapsed >= clip.durationMs / 1000) return;
    audio.src = clip.src;
    const seekAndPlay = () => {
      try {
        audio.currentTime = elapsed;
      } catch {
        /* seeking before metadata is ready — play from wherever it lands */
      }
      audio.play().catch(() => {});
    };
    // Seek needs loaded metadata; play immediately if it's already available.
    if (audio.readyState >= 1) seekAndPlay();
    else audio.addEventListener("loadedmetadata", seekAndPlay, { once: true });
  }, [audioOn]);

  return (
    <section className="ps">
      {!isHealthcare && (
        <div className="ps__head">
          <div className="ps__eyebrow">
            <span className="ps__eyebrow-dot" aria-hidden="true" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="ps__heading">{heading}</h2>
        </div>
      )}

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
                    <div
                      className={`ps__bubble${
                        msg.oneLine ? " ps__bubble--one-line" : ""
                      }`}
                    >
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
                    <p className="ps__ai-text">{msg.text}</p>
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
            {audioOn ? <SpeakerIcon /> : <SpeakerOffIcon />}
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

function SpeakerOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 9C16.5044 9.67234 16.8311 10.461 16.95 11.293"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.3643 5.63672C20.6432 6.91498 21.5075 8.54887 21.8445 10.3255C22.1814 12.102 21.9754 13.9389 21.2533 15.5967"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 2L22 22"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7L6.413 7.587C6.2824 7.71838 6.12703 7.82253 5.95589 7.89342C5.78475 7.96432 5.60124 8.00054 5.416 8H3C2.73478 8 2.48043 8.10536 2.29289 8.29289C2.10536 8.48043 2 8.73478 2 9V15C2 15.2652 2.10536 15.5196 2.29289 15.7071C2.48043 15.8946 2.73478 16 3 16H5.416C5.60124 15.9995 5.78475 16.0357 5.95589 16.1066C6.12703 16.1775 6.2824 16.2816 6.413 16.413L9.796 19.797C9.8946 19.8958 10.0203 19.9631 10.1572 19.9904C10.2941 20.0177 10.436 20.0037 10.5649 19.9503C10.6939 19.8968 10.804 19.8063 10.8815 19.6902C10.959 19.5741 11.0002 19.4376 11 19.298V11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.82812 4.17256C9.92401 4.0763 10.0463 4.01069 10.1795 3.98404C10.3128 3.95738 10.4509 3.97088 10.5764 4.02283C10.702 4.07478 10.8093 4.16284 10.8847 4.27584C10.9601 4.38884 11.0003 4.52169 11.0001 4.65756V5.34356"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
