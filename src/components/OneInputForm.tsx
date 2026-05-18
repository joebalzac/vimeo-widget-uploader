import { useState } from "react";
import "./MultiFormStyling.css";

const VIP_REGEX = /^ELISEVIP-[A-Z0-9-]{2,}$/i;
const REDIRECT_BASE = "/elise-beyond/registration";

interface Props {
  className?: string;
}

export default function OneInputForm({ className = "" }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function normalize(input: string) {
    return input
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/[‐-―]/g, "-")
      .replace(/[''""]/g, "");
  }

  function handleSubmit() {
    const normalized = normalize(code);
    if (!normalized) {
      setError("Please enter your invitation code.");
      return;
    }
    if (!VIP_REGEX.test(normalized)) {
      setError("Invalid invitation code. Please try again.");
      return;
    }
    window.location.href = `${REDIRECT_BASE}?coupon=${encodeURIComponent(normalized)}`;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  function handleWaitlistClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const calendly = document.querySelector<HTMLElement>(".calendly-modal-backdrop");
    if (calendly) calendly.style.display = "flex";
    const zuddl = document.querySelector<HTMLElement>(".zuddl-modal-backdrop");
    if (zuddl) zuddl.style.display = "none";
  }

  return (
    <div className={`hsf ${className}`}>
      <h1 className="oif__title">Enter YourInvite Code</h1>
      <p className="oif__subtitle">Enter your invite code to unlock early access.</p>
      <div className="hsf__fields">
        <label className="field-label field-label-required" htmlFor="invite-code">
          Promo Code
        </label>
        <div className={`emailCapture emailCapture--standalone${error ? " emailCapture--error" : ""}`}>
          <input
            id="invite-code"
            className="emailCapture__input"
            type="text"
            placeholder="Enter invite code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
        {error && <span className="fieldError">{error}</span>}
      </div>
      <div className="oif__footer">
        <button
          className="defaultButton oif__submit-btn"
          type="button"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <p className="oif__waitlist">
          Dont have an invite code?{" "}
          <a href="#" className="oif__waitlist-link" onClick={handleWaitlistClick}>Join the waitlist</a>
        </p>
      </div>
    </div>
  );
}
