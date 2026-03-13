/**
 * LightboxWithForm.tsx
 *
 * The lightbox shows headline, body, hero image, and a self-contained
 * email input + CTA button. On submit it validates the email, closes
 * the lightbox, then programmatically fills + submits the hidden
 * MultiStepForm (portaled into document.body) so it picks up from step 2.
 */

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import LightboxModal from "./LightboxModal";
import MultiStepForm from "./MultiStepForm";

interface LightboxWithFormProps {
  headline?: string;
  bodyText?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  termsUrl?: string;
  className?: string;
  defaultOpen?: boolean;
  removeOnSubmit?: boolean;
  portalId?: string;
  formGuid?: string;
  enableNavTrigger?: boolean;
}

const BLOCKED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "fastmail.com",
]);

function validateEmail(val: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
  const domain = val.split("@")[1].toLowerCase();
  return !BLOCKED_DOMAINS.has(domain);
}

export default function LightboxWithForm({
  headline,
  bodyText,
  heroImageUrl,
  heroImageAlt,
  termsUrl,
  className,
  defaultOpen = false,
  removeOnSubmit = true,
  portalId,
  formGuid,
  enableNavTrigger,
}: LightboxWithFormProps): React.ReactElement {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = (): void => setOpen(false);

  const handleClaim = (): void => {
    if (!email) {
      setEmailError("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please use your work email address.");
      return;
    }
    setEmailError("");

    // 1. Close the lightbox
    if (removeOnSubmit) setOpen(false);

    // 2. Programmatically fill + submit the hidden MultiStepForm.
    //    Retries up to 20 times (100ms apart) to handle production timing.
    const triggerHiddenForm = (attempts = 0): void => {
      console.log(`[LightboxWithForm] triggerHiddenForm attempt ${attempts}`);
      if (attempts > 20) {
        console.error("[LightboxWithForm] gave up — refs never resolved");
        return;
      }
      const input = hiddenInputRef.current;
      const btn = hiddenBtnRef.current;
      console.log("[LightboxWithForm] input ref:", input, "btn ref:", btn);
      if (input && btn) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(input, email);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        console.log("[LightboxWithForm] clicking hidden btn");
        btn.click();
      } else {
        setTimeout(() => triggerHiddenForm(attempts + 1), 100);
      }
    };
    requestAnimationFrame(() => triggerHiddenForm());
  };

  return (
    <>
      {/* ── Preview trigger — remove in Webflow ── */}
      <div className="lb-preview-trigger">
        <button onClick={() => setOpen(true)} className="lb-trigger-btn">
          Open Lightbox
        </button>
      </div>

      {/* MultiStepForm portaled into document.body — completely outside
          the lightbox DOM tree, no transform stacking context issues. */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              visibility: open ? "hidden" : "visible",
              pointerEvents: open ? "none" : "auto",
            }}
          >
            <MultiStepForm
              portalId={portalId}
              formGuid={formGuid}
              enableNavTrigger={enableNavTrigger}
              inputRef={hiddenInputRef as React.RefObject<HTMLInputElement>}
              btnRef={hiddenBtnRef as React.RefObject<HTMLButtonElement>}
            />
          </div>,
          document.body,
        )}

      {/* Lightbox — has its own email input, drives the portaled form on submit */}
      {open && (
        <LightboxModal
          headline={headline}
          bodyText={bodyText}
          heroImageUrl={heroImageUrl}
          heroImageAlt={heroImageAlt}
          termsUrl={termsUrl}
          className={className}
          onClose={handleClose}
        >
          <div className="lb-email-capture">
            <input
              type="email"
              className="emailCapture__input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleClaim()}
            />
            <button
              className="defaultButton emailCapture__btn"
              onClick={handleClaim}
            >
              Get A Demo
            </button>
            {emailError && <span className="fieldError">{emailError}</span>}
          </div>
        </LightboxModal>
      )}
    </>
  );
}
