/**
 * ContentFormWrapper.tsx
 *
 * Wraps MultiStepForm and replaces the fullscreen hsf__overlay on steps 2 & 3
 * with a split layout — form on the left, content panel on the right.
 * Step 1 (email capture) renders inline on the page as normal.
 */

import React, { useState } from "react";
import MultiStepForm from "./MultiStepForm";
import "./ContentFormWrapper.css";

interface ContentFormWrapperProps {
  // Form props
  portalId?: string;
  formGuid?: string;
  className?: string;
  enableNavTrigger?: boolean;
  eventEmailSubmit?: string;
  eventStepTwo?: string;
  eventStepThree?: string;
  emailInputPlaceholder?: string;
  emailCTAText?: string;
  promoOffering?: string;

  // Content panel props
  contentHeadline?: string;
  contentBody?: string;
  contentImageUrl?: string;
  contentImageAlt?: string;
  contentBackgroundColor?: string;
  contentOnlyLogoUrl?: string;
  contentLogoAlt?: string;
  contentMainTitle?: string;
  contentMainSubtitle?: string;
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialTitle?: string;
  testimonialCompany?: string;
  testimonialAvatarUrl?: string;
}

export default function ContentFormWrapper({
  // Form props
  portalId,
  formGuid,
  className = "",
  enableNavTrigger,
  eventEmailSubmit,
  eventStepTwo,
  eventStepThree,
  emailInputPlaceholder,
  emailCTAText,
  promoOffering,

  // Content panel props
  contentHeadline = "See why thousands trust us.",
  contentBody = "Our platform helps you save time, reduce waste, and take control.",
  contentImageUrl = "",
  contentImageAlt = "",
  contentBackgroundColor = "",
  contentOnlyLogoUrl = "",
  contentLogoAlt = "",
  testimonialQuote = "",
  testimonialName = "",
  testimonialTitle = "",
  testimonialCompany = "",
  testimonialAvatarUrl = "",
}: ContentFormWrapperProps): React.ReactElement {
  const [step, setStep] = useState<number>(1);
  const [completed, setCompleted] = useState<boolean>(false);

  const handleStepChange = (newStep: number): void => setStep(newStep);
  const handleComplete = (): void => setCompleted(true);

  if (completed) return <></>;

  return (
    <>
      {/* Step 1 — email input renders inline, no layout change */}
      {step === 1 && (
        <MultiStepForm
          portalId={portalId}
          formGuid={formGuid}
          className={className}
          enableNavTrigger={enableNavTrigger}
          eventEmailSubmit={eventEmailSubmit}
          eventStepTwo={eventStepTwo}
          eventStepThree={eventStepThree}
          emailInputPlaceholder={emailInputPlaceholder}
          emailCTAText={emailCTAText}
          promoOffering={promoOffering}
          onStepChange={handleStepChange}
          onComplete={handleComplete}
          disableOverlay
        />
      )}

      {/* Steps 2 & 3 — split layout */}
      {step > 1 && (
        <div className="cfw__overlay">
          <div className="cfw__grid">
            {/* Left — Form */}
            <div className="cfw__form-col">
              <MultiStepForm
                portalId={portalId}
                formGuid={formGuid}
                className={className}
                enableNavTrigger={enableNavTrigger}
                eventEmailSubmit={eventEmailSubmit}
                eventStepTwo={eventStepTwo}
                eventStepThree={eventStepThree}
                emailInputPlaceholder={emailInputPlaceholder}
                emailCTAText={emailCTAText}
                promoOffering={promoOffering}
                initialStep={step}
                onStepChange={handleStepChange}
                onComplete={handleComplete}
                disableOverlay
              />
            </div>

            {/* Right — Content panel */}
            <div
              className="cfw__content-col"
              style={
                contentImageUrl
                  ? { backgroundImage: `url(${contentImageUrl})` }
                  : { backgroundColor: contentBackgroundColor }
              }
            >
              <div className="cfw__content-inner">
                <div className="cfw__content-headline-body">
                  {contentHeadline && (
                    <h2 className="cfw__headline">{contentHeadline}</h2>
                  )}
                  {contentBody && <p className="cfw__body">{contentBody}</p>}
                </div>
                {contentOnlyLogoUrl && (
                  <img
                    src={contentOnlyLogoUrl}
                    alt={contentLogoAlt}
                    className="cfw__logo"
                  />
                )}
             
                <div className="cfw__content-testimonial-cta">
                  {testimonialQuote && (
                    <div className="cfw__testimonial">
                      <div className="cfw__testimonial-quote">
                        {testimonialQuote}
                      </div>
                      <div className="cfw__testimonial-author">
                        {testimonialAvatarUrl && (
                          <img
                            src={testimonialAvatarUrl}
                            alt={testimonialName}
                            className="cfw__testimonial-avatar"
                          />
                        )}
                        <div className="cfw__testimonial-meta">
                          {testimonialName && (
                            <span className="cfw__testimonial-name">
                              {testimonialName}
                            </span>
                          )}
                          {testimonialTitle && (
                            <span className="cfw__testimonial-title">
                              {testimonialTitle}
                            </span>
                          )}
                          {testimonialCompany && (
                            <span className="cfw__testimonial-company">
                              {testimonialCompany}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
