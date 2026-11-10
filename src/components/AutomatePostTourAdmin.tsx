import "../utils/interVariableFont";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./AutomatePostTourAdmin.css";
import iconCheck from "../assets/bento/icon-check.svg";
import iconPlay from "../assets/bento/icon-play-triangle.svg";
import cursorArrow from "../assets/bento/cursor.svg";

interface AdminRow {
  label: string;
  value: string;
  time: string;
}

const ROWS: AdminRow[] = [
  { label: "Move-in", value: "Dec 1 – Dec 15, 2026", time: "2:20" },
  { label: "Budget", value: "Up to $2,200", time: "8:35" },
  { label: "Lease Length", value: "12 Months", time: "2:07" },
  { label: "Pets", value: "Dog (1), Corgi named Biscuit", time: "7:05" },
];

const DESIGN_WIDTH = 718;
/** Pointer tip inside the 48x48 cursor.svg, so the tip (not the box corner) lands on target. */
const CURSOR_TIP = { x: 16.5, y: 14.7 };

interface Point {
  x: number;
  y: number;
}

/** Position of `el`'s center, in the unscaled 718-wide canvas coordinate space. */
function centerInCanvas(el: Element | null, canvas: Element | null): Point {
  if (!el || !canvas) return { x: 0, y: 0 };
  const canvasRect = canvas.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const scale = canvasRect.width / DESIGN_WIDTH || 1;
  return {
    x: (elRect.left - canvasRect.left + elRect.width / 2) / scale,
    y: (elRect.top - canvasRect.top + elRect.height / 2) / scale,
  };
}

/**
 * Drives the "cards in → cursor checks each in sequence → converge → success"
 * loop. Positions are measured live off the DOM (in canvas space) so the
 * cursor and convergence always land exactly on the rendered checkboxes.
 */
function useAdminSequence(count: number) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const checkboxRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [entered, setEntered] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => Array(count).fill(false));
  const [cursor, setCursor] = useState<{ pos: Point; visible: boolean; clickKey: number }>({
    pos: { x: 0, y: 0 },
    visible: false,
    clickKey: 0,
  });
  const [converging, setConverging] = useState(false);
  const [convergeOffsets, setConvergeOffsets] = useState<number[]>(() => Array(count).fill(0));
  const [cardsGone, setCardsGone] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (fn: () => void, ms: number) => {
      timers.push(setTimeout(() => !cancelled && fn(), ms));
    };

    const run = () => {
      setShowSuccess(false);
      setCardsGone(false);
      setConverging(false);
      setChecked(Array(count).fill(false));
      setCursor((c) => ({ ...c, visible: false }));
      setEntered(false);

      after(() => setEntered(true), 60);

      after(() => {
        const checkNext = (i: number) => {
          const pos = centerInCanvas(checkboxRefs.current[i], canvasRef.current);
          setCursor({ pos, visible: true, clickKey: i });

          after(() => {
            setCursor((c) => ({ ...c, clickKey: c.clickKey + 100 }));
            setChecked((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });

            if (i < count - 1) {
              after(() => checkNext(i + 1), 340);
            } else {
              after(() => {
                setCursor((c) => ({ ...c, visible: false }));

                const centers = cardRefs.current.map((el) =>
                  centerInCanvas(el, canvasRef.current)
                );
                const avgY =
                  centers.reduce((sum, p) => sum + p.y, 0) / (centers.length || 1);
                setConvergeOffsets(centers.map((p) => avgY - p.y));
                setConverging(true);

                after(() => {
                  setCardsGone(true);
                  setShowSuccess(true);
                  after(run, 2400);
                }, 480);
              }, 420);
            }
          }, 460);
        };

        checkNext(0);
      }, 760);
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [count]);

  return {
    canvasRef,
    cardRefs,
    checkboxRefs,
    entered,
    checked,
    cursor,
    converging,
    convergeOffsets,
    cardsGone,
    showSuccess,
  };
}

/**
 * AutomatePostTourAdmin — guest-card checklist preview for the "Automate
 * Post-Tour Admin" bento card. Figma: node 325:27255 (.com_2027).
 *
 * Loops: cards animate in → the cursor checks each one in sequence → the
 * checked stack converges and gives way to a success state → resets.
 */
export default function AutomatePostTourAdmin() {
  const {
    canvasRef,
    cardRefs,
    checkboxRefs,
    entered,
    checked,
    cursor,
    converging,
    convergeOffsets,
    cardsGone,
    showSuccess,
  } = useAdminSequence(ROWS.length);

  return (
    <div className="apa__wrap">
      <div className="apa" ref={canvasRef}>
        {!cardsGone && (
          <div className="apa__cards">
            {ROWS.map((row, i) => (
              <div
                className={
                  "apa__card" +
                  (entered ? " apa__card--in" : "") +
                  (converging ? " apa__card--converge" : "")
                }
                style={
                  {
                    transitionDelay: entered && !converging ? `${i * 70}ms` : "0ms",
                    transform: converging
                      ? `translateY(${convergeOffsets[i]}px) scale(0.92)`
                      : undefined,
                  } as CSSProperties
                }
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                key={row.label}
              >
                <div className="apa__card-left">
                  <span
                    className={
                      "apa__checkbox" + (checked[i] ? " apa__checkbox--checked" : "")
                    }
                    ref={(el) => {
                      checkboxRefs.current[i] = el;
                    }}
                  >
                    {checked[i] && <img key="on" src={iconCheck} alt="" />}
                  </span>
                  <span className="apa__card-text">
                    <span className="apa__card-label">{row.label}</span>
                    <span className="apa__card-value">{row.value}</span>
                  </span>
                </div>
                <span className="apa__chip">
                  <img className="apa__chip-icon" src={iconPlay} alt="" />
                  {row.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {cursor.visible && (
          <>
            <img
              className="apa__cursor"
              style={{
                transform: `translate(${cursor.pos.x - CURSOR_TIP.x}px, ${
                  cursor.pos.y - CURSOR_TIP.y
                }px)`,
              }}
              src={cursorArrow}
              alt=""
            />
            <span
              className="apa__ripple"
              key={cursor.clickKey}
              style={{ left: cursor.pos.x, top: cursor.pos.y }}
            />
          </>
        )}

        {showSuccess && (
          <div className="apa__success">
            <span className="apa__success-icon">
              <img src={iconCheck} alt="" />
            </span>
            <span className="apa__success-text">
              <span className="apa__success-title">Guest card updated</span>
              <span className="apa__success-subtitle">
                Synced to EliseCRM — follow-up drafted.
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
