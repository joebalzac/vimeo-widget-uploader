import type { CSSProperties, ReactNode } from "react";
import "./shared.css";

export interface PhoneProps {
  children?: ReactNode;
  /** Rendered width in px. The phone is designed at 360 wide and scales uniformly. */
  width?: number;
  /** Design height at 360 wide. */
  height?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Generic Gen2 phone frame (360-wide design, dark bezel, notch). Children are laid out
 * in the 360-wide coordinate space and the whole frame scales to `width`.
 */
export default function Phone({ children, width = 360, height = 740, className, style }: PhoneProps) {
  const s = width / 360;
  return (
    <div
      className={["g2-phone-box", className].filter(Boolean).join(" ")}
      style={{ width, height: height * s, ...style }}
    >
      <div className="g2-phone" style={{ height, transform: `scale(${s})` }}>
        <div className="g2-phone__screen">
          <div className="g2-phone__notch" />
          {children}
        </div>
      </div>
    </div>
  );
}
