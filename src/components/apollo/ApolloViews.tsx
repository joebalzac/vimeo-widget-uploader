import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  OBJECTION_TABLE,
  type ApolloView,
  type ViewState,
} from "./apolloData";
import iconMenu from "../../assets/apollo/menu.svg";
import iconSearch from "../../assets/apollo/search.svg";
import iconNewChat from "../../assets/apollo/new-chat.svg";
import iconHistory from "../../assets/apollo/history.svg";
import iconSkills from "../../assets/apollo/skills.svg";
import iconRoutines from "../../assets/apollo/routines.svg";
import iconProductivity from "../../assets/apollo/productivity.svg";
import iconSettings from "../../assets/apollo/settings.svg";
import iconAdmin from "../../assets/apollo/admin.svg";
import iconChevron from "../../assets/apollo/chevron.svg";
import iconShare from "../../assets/apollo/share.svg";
import iconEdit from "../../assets/apollo/edit.svg";
import iconMinimize from "../../assets/apollo/minimize.svg";
import iconClose from "../../assets/apollo/close.svg";
import iconWorked from "../../assets/apollo/worked.svg";
import pdfTop from "../../assets/apollo/pdf-top.svg";
import pdfLabel from "../../assets/apollo/pdf-label.svg";
import iconDownload from "../../assets/apollo/download.svg";
import iconPlus from "../../assets/apollo/plus.svg";
import iconMic from "../../assets/apollo/microphone.svg";
import iconSend from "../../assets/apollo/send.svg";

/* ---------------- shared pieces ---------------- */

const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;

function Fx({ show, className, style, children }: { show: boolean; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ opacity: { duration: 0.4, ease: CSS_EASE }, y: { duration: 0.5, ease: EZ } }}
    >
      {children}
    </motion.div>
  );
}

const Icon = ({ src, size = 17.5 }: { src: string; size?: number }) => (
  <img className="apl-icon" src={src} alt="" style={{ width: size, height: size }} />
);

function PdfIcon() {
  return (
    <span className="apl-pdf">
      <span className="apl-pdf__top">
        <img src={pdfTop} alt="" />
      </span>
      <img className="apl-pdf__label" src={pdfLabel} alt="" />
    </span>
  );
}

function Messages({ v, s, phone }: { v: ApolloView; s: ViewState; phone?: boolean }) {
  return (
    <div className={phone ? "apl-msgs apl-msgs--phone" : "apl-msgs"}>
      <Fx
        show={s.bubble}
        className="apl-bubble"
        style={phone ? undefined : { width: v.bubbleWidth ?? 366 }}
      >
        {v.question}
      </Fx>
      {s.thinking && <div className="apl-thinking">Planning next moves</div>}
      {s.answer && (
        <div className="apl-answer">
          <Fx show={s.worked} className="apl-worked">
            <Icon src={iconWorked} size={21} />
            Worked for a few seconds
          </Fx>
          <div className="apl-paras">
            {v.paragraphs.map((p, k) => (
              <p key={k} className="apl-para">
                {p.split(" ").slice(0, s.words[k]).join(" ")}
              </p>
            ))}
          </div>
          {v.extra === "file" && (
            <Fx show={s.extras >= 1} className="apl-file">
              <PdfIcon />
              <span className="apl-file__name">Oakview Gym Coaching Plan</span>
              <Icon src={iconDownload} />
            </Fx>
          )}
          {v.extra === "table" && (
            <Fx show={s.extras >= 1} className="apl-table">
              {OBJECTION_TABLE.map((r, i) => {
                const cells = r.map((c) => (
                  <span key={c} className="apl-table__cell">
                    {c}
                  </span>
                ));
                return i ? (
                  <Fx key={i} show={s.extras >= 1 + i} className="apl-table__row">
                    {cells}
                  </Fx>
                ) : (
                  <div key={i} className="apl-table__row apl-table__row--head">
                    {cells}
                  </div>
                );
              })}
            </Fx>
          )}
        </div>
      )}
    </div>
  );
}

function InputBar() {
  return (
    <div className="apl-input">
      <div className="apl-input__left">
        <Icon src={iconPlus} />
        Add a follow up...
      </div>
      <div className="apl-input__right">
        <Icon src={iconMic} />
        <Icon src={iconSend} />
      </div>
    </div>
  );
}

/* ---------------- Leasing Agents: phone ---------------- */

/** fit = card width on phones (<480px), 0 otherwise. Phone is ~423px wide incl. side buttons. */
export function PhoneView({ v, s, fit }: { v: ApolloView; s: ViewState; fit: number }) {
  const scale = fit ? Math.min(1, (fit - 48) / 423) : undefined;
  return (
    <div className="apl-phone" style={scale ? { transform: `translateX(-50%) scale(${scale})` } : undefined}>
      <div className="apl-phone__buttons apl-phone__buttons--left">
        {[28, 50.5, 50.5].map((h, i) => (
          <i key={i} style={{ height: h }} />
        ))}
      </div>
      <div className="apl-phone__body">
        <div className="apl-phone__screen">
          <div className="apl-phone__island">
            <i />
          </div>
          <div className="apl-phone__bar">
            <div className="apl-phone__title">
              {v.title}
              <Icon src={iconChevron} size={14} />
            </div>
            <div className="apl-phone__actions">
              <Icon src={iconShare} />
              <Icon src={iconEdit} />
              <Icon src={iconClose} />
            </div>
          </div>
          <div className="apl-phone__content">
            <Messages v={v} s={s} phone />
            <InputBar />
          </div>
        </div>
      </div>
      <div className="apl-phone__buttons apl-phone__buttons--right">
        <i />
      </div>
    </div>
  );
}

/* ---------------- Managers / Executives: desktop window (Figma 368:7449) ---------------- */

const SIDE_NAV: [string, string][] = [
  [iconNewChat, "New Chat"],
  [iconHistory, "History"],
  [iconSkills, "Skills"],
  [iconRoutines, "Routines"],
  [iconProductivity, "Productivity"],
  [iconSettings, "Settings"],
  [iconAdmin, "Admin"],
];

/** Phones: the 529px-tall window is scaled to fit the 380px visual area. */
const WIN_SCALE = 380 / 529;

export function WindowView({ v, s, fit }: { v: ApolloView; s: ViewState; fit: number }) {
  const mobile: CSSProperties | undefined = fit
    ? {
        left: "50%",
        right: "auto",
        width: (fit - 48) / WIN_SCALE,
        transform: `translateX(-50%) scale(${WIN_SCALE})`,
        transformOrigin: "50% 0",
      }
    : undefined;
  return (
    <div className="apl-win" style={mobile}>
      <div className="apl-win__lights">
        <i style={{ background: "#ff5f57" }} />
        <i style={{ background: "#ffbc00" }} />
        <i style={{ background: "#00b080" }} />
      </div>
      <div className="apl-win__app">
        <aside className="apl-side">
          <div className="apl-side__head">
            <div className="apl-side__brand">
              <Icon src={iconMenu} />
              Apollo
            </div>
            <Icon src={iconSearch} />
          </div>
          <div>
            {SIDE_NAV.map(([icon, label]) => (
              <div key={label} className="apl-side__item">
                <Icon src={icon} />
                {label}
              </div>
            ))}
          </div>
          <div>
            <div className="apl-side__item apl-side__item--muted">Active</div>
            {v.sessions?.map(([t, sel]) => (
              <div key={t} className={sel ? "apl-side__item apl-side__item--selected" : "apl-side__item"}>
                <i className="apl-side__ring" />
                {t}
              </div>
            ))}
          </div>
        </aside>
        <div className="apl-conv">
          <div className="apl-conv__head">
            <div className="apl-conv__title">
              <span>{v.title}</span>
              <Icon src={iconChevron} size={14} />
            </div>
            <div className="apl-conv__actions">
              <span className="apl-conv__action">
                <Icon src={iconShare} />
                <b>Share</b>
              </span>
              <span className="apl-conv__action">
                <Icon src={iconEdit} />
                <b>New Chat</b>
              </span>
              <Icon src={iconMinimize} />
              <Icon src={iconClose} />
            </div>
          </div>
          <div className="apl-conv__body">
            <Messages v={v} s={s} />
            <InputBar />
          </div>
        </div>
      </div>
    </div>
  );
}
