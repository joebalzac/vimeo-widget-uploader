import { useState } from "react";
import "./MultiFormStyling.css";

const VIP_REGEX = /^ELISEVIP-[A-Z0-9-]{2,}$/i;
const REDIRECT_BASE = "/beyond/registration";

interface Props {
  className?: string;
}

export default function OneInputForm({ className = "" }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!code.trim()) {
      setError("Please enter your invitation code.");
      return;
    }
    if (!VIP_REGEX.test(code.trim())) {
      setError("Invalid invitation code. Please try again.");
      return;
    }
    window.location.href = `${REDIRECT_BASE}?coupon=${encodeURIComponent(code.trim())}`;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className={`hsf ${className}`}>
      <div className="hsf__step-1-container">
        <div className="hsf__fields">
          <label className="field-label field-label-required" htmlFor="invite-code">
            Enter your invitation code
          </label>
          <div className={`emailCapture${error ? " emailCapture--error" : ""}`}>
            <input
              id="invite-code"
              className="emailCapture__input"
              type="text"
              placeholder="_________________"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              className="defaultButton emailCapture__btn"
              type="button"
              onClick={handleSubmit}
            >
              Continue →
            </button>
          </div>
          {error && <span className="fieldError">{error}</span>}
        </div>
      </div>
    </div>
  );
}
