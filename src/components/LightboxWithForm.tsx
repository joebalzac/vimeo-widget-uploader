/**
 * LightboxWithForm.tsx
 *
 * Wraps LightboxModal + MultiStepForm.
 * The MultiStepForm lives inside the lightbox on step 1 (email capture).
 * The moment the form advances to step 2 it renders its own full-screen
 * overlay (hsf__overlay) — at that point we just close the lightbox shell
 * so it doesn't sit behind the form.
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

  useEffect(() => {
    if (!open) return;

    // Watch for hsf__overlay mounting in the DOM —
    // that means the form has moved past step 1, so we close the lightbox shell.
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

      {/* Lightbox shell — dismissed once hsf__overlay mounts */}
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
          <MultiStepForm
            portalId={portalId}
            formGuid={formGuid}
            enableNavTrigger={enableNavTrigger}
          />
        </LightboxModal>
      )}
    </>
  );
}