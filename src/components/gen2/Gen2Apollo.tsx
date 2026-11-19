import "../../utils/interVariableFont";
import { useEffect, useId, useRef, useState } from "react";
import { LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { E } from "./shared/motion";
import ApChat from "./apollo/ApChat";
import RingBackdrop from "./apollo/RingBackdrop";
import { AP2, PACE, type ApScenario } from "./apollo/gen2ApolloData";
import "./Gen2Apollo.css";

export interface Gen2ApolloProps {
  heading?: string;
  subtitle?: string;
  /** Max heading width in px (passed to SectionHeading). Figma: 418. */
  headingMaxWidth?: number;
  /** Tab label to start on (falls back to the first tab). */
  startTab?: string;
  /** Auto-advance to the next tab after each conversation (stops once a tab is clicked). */
  autoAdvance?: boolean;
  /** Hold on a finished conversation before advancing, ms. */
  holdMs?: number;
  /** Scenario data; defaults to `AP2` in apollo/gen2ApolloData.ts. */
  scenarios?: ApScenario[];
  /** HTML id on the <section>, for anchor links. */
  id?: string;
  className?: string;
}

interface Progress {
  key: string;
  n: number;
  thinking: boolean;
  done: boolean;
}
const IDLE: Progress = { key: "", n: 0, thinking: false, done: false };

/**
 * Gen2 · "More Power, More Simplicity with Apollo" (handoff 05-apollo).
 * Heading + tabs + a 420×940 Apollo phone in a 1160×600 clip, over a scroll-linked
 * ring backdrop. Each tab plays its chat block by block, holds, then advances.
 */
export default function Gen2Apollo({
  heading = "More Power, More Simplicity with Apollo",
  subtitle = "One agent to control the whole platform, making Elise radically easy to implement, learn, and use.",
  headingMaxWidth = 418,
  startTab,
  autoAdvance = true,
  holdMs = PACE.hold,
  scenarios = AP2,
  id,
  className,
}: Gen2ApolloProps) {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(clipRef, { amount: 0.3 });
  const uid = useId();

  const [tab, setTab] = useState(() => Math.max(0, scenarios.findIndex((s) => s.tab === startTab)));
  const [picked, setPicked] = useState(false);
  const auto = autoAdvance && !picked;
  const [nonce, setNonce] = useState(0);
  const [prog, setProg] = useState<Progress>(IDLE);
  const progRef = useRef<Progress>(IDLE);

  const cur = Math.min(tab, scenarios.length - 1);
  const scenario = scenarios[cur];
  const runKey = `${cur}:${nonce}`;
  const live = prog.key === runKey ? prog : IDLE;
  const shown = reduced ? scenario.blocks.length : live.n;
  const thinking = !reduced && live.thinking;

  /* play the current scenario; resumes where it left off after leaving/re-entering view */
  useEffect(() => {
    if (!inView || reduced) return;
    let on = true;
    const wait = (ms: number) => new Promise<boolean>((r) => setTimeout(() => r(on), ms));
    const set = (p: Omit<Progress, "key">) => {
      progRef.current = { key: runKey, ...p };
      setProg(progRef.current);
    };
    const blocks = scenario.blocks;
    void (async () => {
      const prev = progRef.current.key === runKey ? progRef.current : IDLE;
      let i = prev.thinking ? prev.n - 1 : prev.n;
      if (!prev.done) {
        if (!(await wait(PACE.start))) return;
        for (; i < blocks.length; i++) {
          const b = blocks[i];
          if (b.k === "w") {
            set({ n: i + 1, thinking: true, done: false });
            if (!(await wait(PACE.think))) return;
            set({ n: i + 1, thinking: false, done: false });
            if (!(await wait(PACE.worked))) return;
          } else {
            set({ n: i + 1, thinking: false, done: false });
            if (!(await wait(PACE[b.k]))) return;
          }
        }
        set({ n: blocks.length, thinking: false, done: true });
      }
      if (!auto || scenarios.length < 2) return;
      if (!(await wait(holdMs))) return;
      setTab((t) => (t + 1) % scenarios.length);
    })();
    return () => {
      on = false;
    };
  }, [inView, reduced, runKey, scenario, scenarios.length, auto, holdMs]);

  /* keep the active tab centred in the scrollable tab row (phones) */
  useEffect(() => {
    const list = tabsRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const btn = list.querySelectorAll<HTMLElement>("[role=tab]")[cur];
    if (!btn) return;
    list.scrollTo({
      left: btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [cur, reduced]);

  const onTab = (i: number) => {
    setPicked(true);
    setTab(i);
    setNonce((n) => n + 1);
  };

  return (
    <section ref={sectionRef} id={id || undefined} className={["g2a", className].filter(Boolean).join(" ")}>
      <RingBackdrop target={sectionRef} reduced={reduced} />
      <div className="g2a__inner">
        <SectionHeading heading={heading} subtitle={subtitle} maxWidth={headingMaxWidth} className="g2a__heading" />

        <motion.div
          className="g2a__tabs-wrap"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: E, delay: 0.1 }}
        >
          <LayoutGroup id={uid}>
            <div className="g2a__tabs" role="tablist" aria-label="Apollo scenarios" ref={tabsRef}>
              {scenarios.map((s, i) => (
                <button
                  key={s.tab}
                  type="button"
                  role="tab"
                  aria-selected={cur === i}
                  className={cur === i ? "g2a__tab g2a__tab--on" : "g2a__tab"}
                  onClick={() => onTab(i)}
                >
                  {cur === i && (
                    <motion.span
                      layoutId="g2aPill"
                      className="g2a__pill"
                      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: E }}
                    />
                  )}
                  <span className="g2a__tab-label">{s.tab}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </motion.div>

        <div ref={clipRef} className="g2a__clip">
          <motion.div
            className="g2a__stage"
            initial={reduced ? false : { opacity: 0, scale: 0.56, y: 140, rotateX: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              default: { duration: 1.35, ease: E },
              opacity: { duration: 0.6 },
            }}
          >
            <ApChat scenario={scenario} runKey={runKey} shown={shown} thinking={thinking} reduced={reduced} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
