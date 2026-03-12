/**
 * LightboxWithForm.tsx
 *
 * MultiStepForm is always mounted so it is never unmounted when the lightbox
 * closes. Step 1 (email input) is hidden until the lightbox is open.
 * When the user clicks "Get A Demo" we close the lightbox and MultiStepForm
 * advances to step 2, rendering its own fullscreen overlay independently.
 */

import React, { useState, useEffect, useRef } from "react";
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
  portalId?: string;
  formGuid?: string;
  enableNavTrigger?: boolean;
}

export default function LightboxWithForm({
  headline,
  bodyText,
  heroImageUrl,
  heroImageAlt,
  termsUrl,
  className,
  defaultOpen = false,
  portalId,
  formGuid,
  enableNavTrigger,
}: LightboxWithFormProps): React.ReactElement {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const formWrapperRef = useRef<HTMLDivElement>(null);

  const handleClose = (): void => setOpen(false);

  // Intercept "Get A Demo" click — close lightbox before MultiStepForm
  // advances to step 2 so the lightbox doesn't clip the fullscreen overlay.
  useEffect(() => {
    const wrapper = formWrapperRef.current;
    if (!wrapper) return;

    const handleCapture = (e: Event): void => {
      const target = e.target as HTMLElement;
      if (target.closest(".emailCapture__btn")) {
        setOpen(false);
      }
    };

    wrapper.addEventListener("click", handleCapture, true);
    return () => wrapper.removeEventListener("click", handleCapture, true);
  }, []); // mount once — wrapper ref is stable

  return (
    <>
      {/* ── Preview trigger — remove in Webflow, use your own trigger ── */}
      <div className="lb-preview-trigger">
        <button onClick={() => setOpen(true)} className="lb-trigger-btn">
          Open Lightbox
        </button>
      </div>

      {/* MultiStepForm is ALWAYS mounted so closing the lightbox never
          unmounts it. On step 1 it renders just the email input inline.
          On steps 2+ it renders its own fullscreen overlay above everything. */}
      <div ref={formWrapperRef}>
        <MultiStepForm
          portalId={portalId}
          formGuid={formGuid}
          enableNavTrigger={enableNavTrigger}
        />
      </div>

      {/* Lightbox shell — conditionally rendered, MultiStepForm is NOT a child */}
      {open && (
        <LightboxModal
          headline={headline}
          bodyText={bodyText}
          heroImageUrl={heroImageUrl}
          heroImageAlt={heroImageAlt}
          termsUrl={termsUrl}
          className={className}
          onClose={handleClose}
        />
      )}
    </>
  );
}
