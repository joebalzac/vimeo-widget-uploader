/**
 * LightboxWithForm.tsx
 *
 * The lightbox owns the email input. On submit it:
 * 1. Creates a HubSpot contact with the email
 * 2. Closes the lightbox
 * 3. Renders MultiStepForm with initialEmail + initialStep=2
 *
 * MultiStepForm starts at step 2 directly with the email pre-filled.
 * No refs, no programmatic clicks, no timing issues.
 */

import React, { useCallback, useEffect, useState } from "react";
import LightboxModal from "./LightboxModal";
import MultiStepForm from "./MultiStepForm";
import { useHubSpotContactCheck } from "../hooks/useHubSpotContactCheck";
import { useVisitTrigger } from "../hooks/useVisitTrigger";

interface LightboxWithFormProps {
  headline?: string;
  bodyText?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  eyebrow?: string;
  termsUrl?: string;
  className?: string;
  defaultOpen?: boolean;
  removeOnSubmit?: boolean;
  triggerPages?: string;
  triggerAfter?: number;
  triggerDelay?: number;
  portalId?: string;
  formGuid?: string;
  enableNavTrigger?: boolean;
  eventEmailSubmit?: string;
  eventStepTwo?: string;
  eventStepThree?: string;
  eventLightboxView?: string;
  emailInputPlaceholder?: string;
  emailCTAText?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "https://contact-checker-backend.vercel.app";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createContact(email: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/create-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.warn("[createContact] failed silently", err);
  }
}

function pushEvent(event: string): void {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event });
}

function validateEmail(val: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
  const domain = val.split("@")[1].toLowerCase();
  return !BLOCKED_DOMAINS.has(domain);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LightboxWithForm({
  headline,
  bodyText,
  heroImageUrl,
  heroImageAlt,
  eyebrow,
  termsUrl,
  className,
  defaultOpen = false,
  removeOnSubmit = true,
  triggerPages = "",
  triggerAfter = 2,
  triggerDelay = 0,
  portalId,
  formGuid,
  enableNavTrigger,
  eventEmailSubmit = "multi_form_email_submit",
  eventStepTwo = "multi_form_step_two",
  eventStepThree = "multi_form_step_three",
  eventLightboxView = "incentive_lightbox_viewed",
  emailInputPlaceholder = "What's your work email?",
  emailCTAText = "Book a free demo",
}: LightboxWithFormProps): React.ReactElement {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { isKnown, isLoading } = useHubSpotContactCheck();

  // ── Preview mode — ?preview=lightbox bypasses all trigger logic ────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "lightbox") {
      setOpen(true);
    }
  }, []);

  const handleTrigger = useCallback(() => {
    setOpen(true);
    pushEvent(eventLightboxView);
  }, [eventLightboxView]);

  useVisitTrigger({
    triggerPages,
    triggerAfter,
    triggerDelay,
    isKnown,
    isLoading,
    onTrigger: handleTrigger,
  });

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
    // Create contact in HubSpot as soon as email is submitted
    void createContact(email);
    pushEvent(eventEmailSubmit);
    setSubmitted(true);
    if (removeOnSubmit) setOpen(false);
  };

  return (
    <>
      {/* ── Preview trigger — uncomment to use when styling ──
      {!submitted && (
        <div className="lb-preview-trigger">
          <button onClick={() => { setSubmitted(false); setOpen(true); }} className="lb-trigger-btn">
            Open Lightbox
          </button>
        </div>
      )}
      ── */}

      {open && !submitted && (
        <LightboxModal
          eyebrow={eyebrow}
          headline={headline}
          bodyText={bodyText}
          heroImageUrl={heroImageUrl}
          heroImageAlt={heroImageAlt}
          termsUrl={termsUrl}
          className={className}
          onClose={handleClose}
        >
          <div className="lb-email-capture">
            <div
              className={`emailCapture${
                emailError ? " emailCapture--error" : ""
              }`}
            >
              <input
                type="email"
                className="emailCapture__input"
                placeholder={emailInputPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClaim()}
              />
              <button
                className="defaultButton emailCapture__btn"
                onClick={handleClaim}
              >
                {emailCTAText}
              </button>
            </div>
            {emailError && <span className="fieldError">{emailError}</span>}
          </div>
        </LightboxModal>
      )}

      {/* Once submitted, render MultiStepForm starting at step 2 with email pre-filled */}
      {submitted && (
        <MultiStepForm
          portalId={portalId}
          formGuid={formGuid}
          enableNavTrigger={enableNavTrigger}
          initialEmail={email}
          initialStep={2}
          eventEmailSubmit={eventEmailSubmit}
          eventStepTwo={eventStepTwo}
          eventStepThree={eventStepThree}
          emailInputPlaceholder={emailInputPlaceholder}
          emailCTAText={emailCTAText}
        />
      )}
    </>
  );
}
