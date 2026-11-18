import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApBlock from "./ApBlock";
import type { ApScenario } from "./gen2ApolloData";
import iconChevron from "../../../assets/apollo/chevron.svg";
import iconLink from "../../../assets/gen2/apollo/link.svg";
import iconEdit from "../../../assets/apollo/edit.svg";
import iconClose from "../../../assets/apollo/close.svg";
import iconPlus from "../../../assets/apollo/plus.svg";
import iconMic from "../../../assets/apollo/microphone.svg";
import iconSend from "../../../assets/apollo/send.svg";

export interface ApChatProps {
  scenario: ApScenario;
  /** Changes whenever a scenario (re)starts: resets scroll + auto-follow. */
  runKey: string;
  /** Number of blocks currently shown. */
  shown: number;
  /** The last shown block is a `w` still in its "Thinking" phase. */
  thinking: boolean;
  reduced: boolean;
}

const Icon = ({ src, className }: { src: string; className?: string }) => (
  <img className={["g2a-icon", className].filter(Boolean).join(" ")} src={src} alt="" />
);

/**
 * The 420×940 Apollo phone (Figma 677:174757; mobile 667:141085): header with title +
 * link/edit/close, a really scrollable chat viewport, and the composer pinned below it.
 * The viewport follows new content until the user wheels, touches, drags or keys in it.
 */
export default function ApChat({ scenario, runKey, shown, thinking, reduced }: ApChatProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  /* new scenario: back to the top, follow again */
  useEffect(() => {
    follow.current = true;
    if (viewRef.current) viewRef.current.scrollTop = 0;
  }, [runKey]);

  /* follow content growth (new blocks, thinking → worked swaps) */
  useEffect(() => {
    const view = viewRef.current;
    const body = bodyRef.current;
    if (!view || !body || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (!follow.current) return;
      const top = view.scrollHeight - view.clientHeight;
      if (top <= view.scrollTop + 1) return;
      view.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    });
    ro.observe(body);
    return () => ro.disconnect();
  }, [reduced]);

  const stop = () => {
    follow.current = false;
  };

  return (
    <div className="g2a-phone">
      <div className="g2a-phone__btns g2a-phone__btns--l" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="g2a-phone__btns g2a-phone__btns--r" aria-hidden>
        <i />
      </div>
      <div className="g2a-phone__body">
        <div className="g2a-phone__screen">
          <div className="g2a-phone__island" aria-hidden>
            <i />
          </div>
          <div className="g2a-phone__bar">
            <div className="g2a-phone__title">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={scenario.title}
                  className="g2a-phone__title-text"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.35 } }}
                  exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.2 } }}
                >
                  {scenario.title}
                </motion.span>
              </AnimatePresence>
              <Icon src={iconChevron} className="g2a-phone__chev" />
            </div>
            <div className="g2a-phone__actions" aria-hidden>
              <Icon src={iconLink} className="g2a-phone__act-opt" />
              <Icon src={iconEdit} className="g2a-phone__act-opt" />
              <Icon src={iconClose} />
            </div>
          </div>
          <div className="g2a-phone__content">
            <div
              ref={viewRef}
              className="g2a-chat"
              tabIndex={0}
              role="log"
              aria-label={`Apollo conversation: ${scenario.title}`}
              onWheel={stop}
              onTouchStart={stop}
              onPointerDown={stop}
              onKeyDown={stop}
            >
              <div ref={bodyRef} className="g2a-chat__body">
                {scenario.blocks.slice(0, shown).map((b, i) => (
                  <ApBlock
                    key={`${runKey}:${i}`}
                    b={b}
                    reduced={reduced}
                    thinking={b.k === "w" && thinking && i === shown - 1}
                  />
                ))}
              </div>
            </div>
            <div className="g2a-input" aria-hidden>
              <div className="g2a-input__l">
                <Icon src={iconPlus} />
                Add a follow up...
              </div>
              <div className="g2a-input__r">
                <Icon src={iconMic} />
                <Icon src={iconSend} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
