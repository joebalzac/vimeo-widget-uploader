import "../../utils/interVariableFont";
import { useRef, useState, type CSSProperties } from "react";
import { MotionConfig, motion, useInView } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { CSS_EASE, EZ, Reveal, useLoop } from "./shared";
import { CRM_CONTACT, CRM_INBOUND, CRM_REPLY, CRM_TASK_COUNT, CRM_TASKS } from "./crm/crmData";
import stageBg from "../../assets/gen2/crm/stage-bg.webp";
import avatarLia from "../../assets/gen2/crm/avatar-lia.jpg";
import iconHistory from "../../assets/gen2/crm/icon-history.svg";
import iconCaret from "../../assets/gen2/crm/icon-caret.svg";
import iconPhone from "../../assets/gen2/crm/icon-phone.svg";
import iconSettings from "../../assets/gen2/crm/icon-settings.svg";
import iconMail from "../../assets/gen2/crm/icon-mail.svg";
import iconFormat from "../../assets/gen2/crm/icon-format.svg";
import iconLink from "../../assets/gen2/crm/icon-link.svg";
import iconAttach from "../../assets/gen2/crm/icon-attach.svg";
import "./Gen2Crm.css";

export interface Gen2CrmProps {
  heading?: string;
  subtitle?: string;
}

/** Per-word fade stagger for the AI reply (handoff 06-crm step 4). */
const WORD_MS = 34;
/** Reply paragraphs → words, each with its global index for the stagger delay. */
const REPLY = (() => {
  let i = 0;
  return CRM_REPLY.map((p) => p.map((word) => ({ ...word, i: i++ })));
})();
const WORD_COUNT = REPLY.reduce((n, p) => n + p.length, 0);

/**
 * Gen2 · 06 EliseCRM (Figma 642:57379). A CRM window on a soft lilac image stage. While in
 * view it loops: inbound message → typing dots → AI reply fading in word by word → hold.
 * The reply's words are laid out from the start so the bubble never resizes.
 */
export default function Gen2Crm({
  heading = "EliseCRM Takes the Work off Your Team",
  subtitle = "The AI workspace for your team.",
}: Gen2CrmProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const winIn = useInView(stageRef, { once: true, amount: 0.3 });

  const { reduced } = useLoop(stageRef, async ({ wait }) => {
    let first = true;
    for (;;) {
      setStep(0);
      if (!(await wait(first ? 1100 : 700))) return;
      first = false;
      setStep(1);
      if (!(await wait(900))) return;
      setStep(2);
      if (!(await wait(1400))) return;
      setStep(3);
      if (!(await wait(WORD_COUNT * WORD_MS + 6000))) return;
    }
  });

  const s = reduced ? 3 : step;

  return (
    <MotionConfig reducedMotion="user">
      <section className="g2c">
        <SectionHeading heading={heading} subtitle={subtitle} maxWidth={418} />
        <Reveal className="g2c__stage">
          <img className="g2c__bg" src={stageBg} alt="" aria-hidden draggable={false} />
          <div ref={stageRef} className="g2c__probe" aria-hidden />
          <motion.div
            className="g2c__win"
            initial={reduced ? false : { opacity: 0, y: 60 }}
            animate={winIn || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{
              opacity: { duration: 0.5, delay: 0.12, ease: CSS_EASE },
              y: { duration: 0.9, delay: 0.12, ease: EZ },
            }}
          >
            <div className="g2c__lights" aria-hidden>
              <i style={{ background: "#ff5f57" }} />
              <i style={{ background: "#ffbc00" }} />
              <i style={{ background: "#00b080" }} />
            </div>
            <div className="g2c__app">
              {/* ── Task list ── */}
              <aside className="g2c__list">
                <div className="g2c__list-head">
                  <div className="g2c__list-row">
                    <span className="g2c__list-title">Tasks</span>
                    <span className="g2c__list-meta">
                      <img src={iconHistory} width={17.5} height={17.5} alt="" />
                      <span className="g2c__count">{CRM_TASK_COUNT}</span>
                    </span>
                  </div>
                  <div className="g2c__filters">
                    <span className="g2c__filter">
                      {CRM_CONTACT.property}
                      <img src={iconCaret} width={12} height={12} alt="" />
                    </span>
                    <span className="g2c__filter">
                      Prospects + Residents
                      <img src={iconCaret} width={12} height={12} alt="" />
                    </span>
                  </div>
                </div>
                <ul className="g2c__tasks">
                  {CRM_TASKS.map((t, i) => (
                    <li key={t.label + t.name} className={i === 0 ? "g2c__task g2c__task--on" : "g2c__task"}>
                      <div className="g2c__task-top">
                        <span className="g2c__task-label">{t.label}</span>
                        <i className="g2c__task-bar" />
                      </div>
                      <div className="g2c__task-name">{t.name}</div>
                    </li>
                  ))}
                </ul>
                <div className="g2c__list-fade" aria-hidden />
              </aside>

              {/* ── Conversation ── */}
              <div className="g2c__main">
                <header className="g2c__head">
                  <img className="g2c__avatar" src={avatarLia} width={40} height={40} alt="" />
                  <div className="g2c__who">
                    <div className="g2c__who-row">
                      <span className="g2c__name">{CRM_CONTACT.name}</span>
                      <span className="g2c__chip g2c__chip--prospect">Prospect</span>
                      <span className="g2c__chip g2c__chip--toured">Toured</span>
                    </div>
                    <span className="g2c__prop">{CRM_CONTACT.property}</span>
                  </div>
                  <div className="g2c__head-actions" aria-hidden>
                    <img src={iconPhone} width={17.5} height={17.5} alt="" />
                    <img src={iconSettings} width={17.5} height={17.5} alt="" />
                  </div>
                </header>

                <div className="g2c__msgs">
                  <div className={s >= 1 ? "g2c__msg g2c__msg--in is-on" : "g2c__msg g2c__msg--in"}>
                    <div className="g2c__bubble">{CRM_INBOUND}</div>
                    <div className="g2c__meta">
                      <img src={iconMail} width={12} height={12} alt="" />
                      {CRM_CONTACT.name}
                    </div>
                  </div>

                  <div className="g2c__msg g2c__msg--out">
                    <div className="g2c__reply-slot">
                      <div className={s === 2 ? "g2c__typing is-on" : "g2c__typing"} aria-hidden>
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className={s >= 3 ? "g2c__bubble g2c__reply is-on" : "g2c__bubble g2c__reply"}>
                        {REPLY.map((p, pi) => (
                          <p key={pi} className="g2c__para">
                            {p.map(({ w, link, i }, wi) => (
                              <span key={i} className="g2c__w" style={{ "--i": i } as CSSProperties}>
                                {link ? <span className="g2c__link">{w}</span> : w}
                                {wi < p.length - 1 ? " " : ""}
                              </span>
                            ))}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className={s >= 3 ? "g2c__meta is-on" : "g2c__meta"}>
                      <img src={iconMail} width={12} height={12} alt="" />
                      AI Assistant
                    </div>
                  </div>
                </div>

                <div className="g2c__composer" aria-hidden>
                  <div className="g2c__composer-top">
                    <span className="g2c__channel">
                      Email
                      <img src={iconCaret} width={12} height={12} alt="" />
                    </span>
                    <span className="g2c__placeholder">Type a message...</span>
                  </div>
                  <div className="g2c__composer-bar">
                    <div className="g2c__tools">
                      <img src={iconFormat} width={17.5} height={17.5} alt="" />
                      <img src={iconLink} width={17.5} height={17.5} alt="" />
                      <img src={iconAttach} width={17.5} height={17.5} alt="" />
                    </div>
                    <div className="g2c__actions">
                      <span className="g2c__dismiss">Dismiss</span>
                      <span className="g2c__send">Send</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </section>
    </MotionConfig>
  );
}
