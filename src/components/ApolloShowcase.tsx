import "../utils/interVariableFont";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import "./ApolloShowcase.css";
import cardBg from "../assets/apollo/card-bg.jpg";
import { PhoneView, WindowView } from "./apollo/ApolloViews";
import {
  VIEWS,
  blankState,
  extrasCount,
  finalState,
  restState,
  type ViewState,
} from "./apollo/apolloData";

export interface ApolloShowcaseProps {
  /** Heading shown left of the tabs. Leave empty to use a separate SectionHeading. */
  heading?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  /** Tab shown first; the auto-cycle continues from there. */
  startTab?: "Leasing Agents" | "Managers" | "Executives";
  className?: string;
}

const TABS = ["Leasing Agents", "Managers", "Executives"];
const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;
const VIEWPORT = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -6% 0px",
} as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: {
    opacity: { duration: 0.8, ease: CSS_EASE },
    y: { duration: 1, ease: EZ },
  },
};

/** <480px only: width of the element, used to scale the fixed-size mocks. 0 on wider screens. */
function useMobileWidth(ref: RefObject<HTMLElement | null>) {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 479.98px)");
    const f = () => setW(mq.matches ? el.clientWidth : 0);
    const ro = new ResizeObserver(f);
    ro.observe(el);
    f();
    mq.addEventListener?.("change", f);
    return () => {
      ro.disconnect();
      mq.removeEventListener?.("change", f);
    };
  }, [ref]);
  return w;
}

/**
 * ApolloShowcase — "Ask Apollo Anything About Your Tours". Figma: node 204:8262 (.com_2027).
 *
 * Tabs auto-cycle Leasing Agents → Managers → Executives once the card is revealed (4.8s
 * pause after each conversation finishes). Clicking a tab stops the cycle and replays
 * that view. Each view: question bubble → "Planning next moves" → answer streams in word
 * by word → extras (PDF / objection table). Window → window swaps are instant so the
 * chrome doesn't re-animate.
 */
export default function ApolloShowcase({
  heading = "Ask Apollo Anything About Your Tours",
  cardTitle = "Tour Preparation",
  cardSubtitle = "Receive daily prospect brief with full context.",
  startTab = "Leasing Agents",
  className,
}: ApolloShowcaseProps) {
  const first = Math.max(0, TABS.indexOf(startTab));
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(stageRef, VIEWPORT);
  const fit = useMobileWidth(stageRef);
  const [cur, setCur] = useState(first);
  const [instant, setInstant] = useState(false);
  const [vs, setVs] = useState<ViewState[]>(() =>
    VIEWS.map((_, j) => (j === first ? (reduce ? finalState(j) : restState(j)) : blankState(j)))
  );
  const gen = useRef(0);
  const picked = useRef(false);
  const started = useRef(false);
  const curRef = useRef(first);

  const patch = (
    i: number,
    p: Partial<ViewState> | ((s: ViewState) => Partial<ViewState>)
  ) =>
    setVs((a) =>
      a.map((s, j) =>
        j === i ? { ...s, ...(typeof p === "function" ? p(s) : p) } : s
      )
    );

  const select = (i: number) => {
    const same =
      curRef.current !== i &&
      VIEWS[curRef.current].kind === "win" &&
      VIEWS[i].kind === "win";
    curRef.current = i;
    setInstant(same);
    setCur(i);
  };

  /* keep the active tab centred in the scrollable tab row (phones) */
  useEffect(() => {
    const list = tabsRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const btn = list.querySelectorAll<HTMLElement>("[role=tab]")[cur];
    if (!btn) return;
    list.scrollTo({
      left: btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [cur, reduce]);

  useEffect(() => {
    if (!instant) return;
    let a = requestAnimationFrame(() => {
      a = requestAnimationFrame(() => setInstant(false));
    });
    return () => cancelAnimationFrame(a);
  }, [instant]);

  const play = async (i: number, my: number) => {
    const v = VIEWS[i];
    const ok = () => my === gen.current;
    setVs((a) => a.map((s, j) => (j === i ? blankState(i) : s)));
    select(i);
    await sleep(650);
    if (!ok()) return;
    patch(i, { bubble: true });
    await sleep(700);
    if (!ok()) return;
    patch(i, { thinking: true });
    await sleep(2100);
    if (!ok()) return;
    patch(i, { thinking: false, answer: true });
    await sleep(30);
    patch(i, { worked: true });
    await sleep(300);
    for (let k = 0; k < v.paragraphs.length; k++) {
      const n = v.paragraphs[k].split(" ").length;
      for (let w = 1; w <= n; w++) {
        if (!ok()) return;
        patch(i, (s) => ({ words: s.words.map((x, j) => (j === k ? w : x)) }));
        await sleep(34);
      }
      await sleep(160);
    }
    for (let e = 1; e <= extrasCount(v); e++) {
      if (!ok()) return;
      patch(i, { extras: e });
      await sleep(170);
    }
  };

  const cycle = async (start: number) => {
    const my = ++gen.current;
    let i = start;
    while (my === gen.current) {
      await play(i, my);
      await sleep(4800);
      if (picked.current || my !== gen.current) return;
      i = (i + 1) % VIEWS.length;
    }
  };

  useEffect(() => {
    if (!revealed || started.current) return;
    started.current = true;
    if (reduce) {
      setVs((a) => a.map((s, j) => (j === first ? finalState(first) : s)));
      return;
    }
    void cycle(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  useEffect(
    () => () => {
      gen.current++;
    },
    []
  );

  const onTab = (i: number) => {
    picked.current = true;
    started.current = true;
    const my = ++gen.current;
    if (reduce) {
      setVs((a) => a.map((s, j) => (j === i ? finalState(i) : s)));
      select(i);
    } else void play(i, my);
  };

  return (
    <section className={["apl", className].filter(Boolean).join(" ")}>
      <div className={heading ? "apl__top" : "apl__top apl__top--tabs-only"}>
        {heading && (
          <motion.h2 className="apl__heading" {...reveal}>
            {heading}
          </motion.h2>
        )}
        <motion.div className="apl__tabs-wrap" {...reveal}>
          <div
            className="apl__tabs"
            role="tablist"
            aria-label="Apollo views"
            ref={tabsRef}
          >
            {TABS.map((t, i) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={cur === i}
                className="apl__tab"
                onClick={() => onTab(i)}
              >
                {cur === i && (
                  <motion.span
                    layoutId="aplPill"
                    className="apl__pill"
                    transition={{ duration: 0.5, ease: EZ }}
                  />
                )}
                <motion.span
                  className="apl__tab-label"
                  initial={false}
                  animate={{ color: cur === i || fit ? "#0e0d0c" : "#7a7977" }}
                  transition={{ duration: 0.3 }}
                >
                  {t}
                </motion.span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div className="apl__card" {...reveal}>
        <div ref={stageRef} className="apl__probe" />
        {/* Figma 426:3466 "image 1": 1212x693 blurred gradient, centred, 60% opacity */}
        <img className="apl__bg" src={cardBg} alt="" aria-hidden="true" />
        <div className="apl__card-head">
          <p className="apl__card-title">{cardTitle}</p>
          <p className="apl__card-subtitle">{cardSubtitle}</p>
        </div>
        <div className="apl__views">
          {VIEWS.map((v, i) => {
            const on = i === cur;
            const target =
              on && !revealed
                ? { opacity: 0, y: 60 }
                : on
                ? { opacity: 1, y: 0, visibility: "visible" as const }
                : {
                    opacity: 0,
                    y: 28,
                    transitionEnd: { visibility: "hidden" as const },
                  };
            const tr = instant
              ? { duration: 0 }
              : on
              ? {
                  opacity: { duration: 0.5, delay: 0.12, ease: CSS_EASE },
                  y: { duration: 0.9, delay: 0.12, ease: EZ },
                }
              : {
                  opacity: { duration: 0.4, ease: CSS_EASE },
                  y: { duration: 0.8, ease: EZ },
                };
            return (
              <motion.div
                key={i}
                className={on ? "apl__view" : "apl__view apl__view--off"}
                aria-hidden={!on}
                initial={false}
                animate={target}
                transition={tr}
              >
                {v.kind === "phone" ? (
                  <PhoneView v={v} s={vs[i]} fit={fit} />
                ) : (
                  <WindowView v={v} s={vs[i]} fit={fit} />
                )}
              </motion.div>
            );
          })}
        </div>
        <div className="apl__card-border" />
      </motion.div>
    </section>
  );
}
