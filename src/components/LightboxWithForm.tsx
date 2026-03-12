/**
 * LightboxWithForm.tsx
 *
 * MultiStepForm is rendered as a sibling to the lightbox, never inside it.
 * The lightbox shows headline/body/hero. Once the user submits their email,
 * MultiStepForm advances to step 2 and its own full-screen overlay takes over.
 * We then close the lightbox shell so nothing sits behind it.
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
  const observerRef = useRef<MutationObserver | null>(null);

  const handleClose = (): void => setOpen(false);

  // Watch for hsf__overlay — once it appears the form has gone fullscreen,
  // dismiss the lightbox shell + overlay behind it.
  useEffect(() => {
    if (!open) return;

    observerRef.current = new MutationObserver(() => {
      const overlay = document.querySelector(".hsf__overlay");
      if (overlay) {
        setOpen(false);
        observerRef.current?.disconnect();
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observerRef.current?.disconnect();
  }, [open]);

  return (
    <>
      {/* ── Preview trigger — remove in Webflow, use your own trigger ── */}
      <div className="lb-preview-trigger">
        <button onClick={() => setOpen(true)} className="lb-trigger-btn">
          Open Lightbox
        </button>
      </div>

      {/* MultiStepForm always mounted as a sibling — never inside the lightbox.
          Step 1 (email input) is inline and invisible until lightbox opens.
          Steps 2+ render their own fullscreen overlay above everything. */}
      <MultiStepForm
        portalId={portalId}
        formGuid={formGuid}
        enableNavTrigger={enableNavTrigger}
      />

      {/* Lightbox shell — only the chrome, no form inside */}
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
