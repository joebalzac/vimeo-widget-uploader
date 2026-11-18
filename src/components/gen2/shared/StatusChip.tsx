import { AnimatePresence, motion } from "framer-motion";
import { SPRING_CHIP } from "./motion";
import { chipSpins, chipTone, type ChipTone } from "./chipTones";
import "./shared.css";

export type { ChipTone } from "./chipTones";

export function Spinner({ size = 10 }: { size?: number }) {
  return (
    <svg className="g2-spin" width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" />
      <path d="M6 1.5a4.5 4.5 0 0 1 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export interface StatusChipProps {
  label: string;
  tone?: ChipTone;
  /** Force the spinner on/off (defaults by label). */
  spinner?: boolean;
  /** Animate label changes (slide old up/out, new rises in). */
  animate?: boolean;
  size?: "md" | "sm";
  className?: string;
}

/**
 * Plex Mono uppercase chip (22 tall, radius 3). When `label` changes the old chip slides
 * up and out (y −12, 0.28s) and the new one rises in (y 12 → 0, scale .9 → 1, spring).
 * The chip never changes colour in place: the swap carries the new tone.
 */
export default function StatusChip({ label, tone, spinner, animate = true, size = "md", className }: StatusChipProps) {
  const t = tone ?? chipTone(label);
  const spin = spinner ?? chipSpins(label);
  const chip = (
    <span className={`g2-chip g2-chip--${t} g2-chip--${size}`}>
      {spin && <Spinner />}
      {label}
    </span>
  );
  if (!animate) return <span className={["g2-chipwrap", className].filter(Boolean).join(" ")}>{chip}</span>;
  return (
    <span className={["g2-chipwrap", className].filter(Boolean).join(" ")}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          style={{ display: "inline-flex" }}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_CHIP }}
          exit={{ opacity: 0, y: -12, transition: { duration: 0.28 } }}
        >
          {chip}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
