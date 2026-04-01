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
  multipleLogos?: boolean;
  contentOneLogoUrl?: string;
  contentTwoLogoUrl?: string;
  contentThreeLogoUrl?: string;
  contentLogoAlt?: string;
  contentMainTitle?: string;
  contentMainSubtitle?: string;
  mainQuote?: string;
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

  multipleLogos = false,
  contentOneLogoUrl = "",
  contentTwoLogoUrl = "",
  contentThreeLogoUrl = "",
  contentLogoAlt = "",
  mainQuote = "",
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
            {/* Left — Conten Panel*/}
            <div
              className="cfw__content-col"
              style={
                contentImageUrl
                  ? {
                      backgroundImage: `url(${contentImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }
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
                    className="cfw__main-logo"
                  />
                )}

                {multipleLogos && (
                  <div className="cfw__multiple-logos">
                    <div className="cfw__multiple-logo-container">
                      <img
                        src={contentOneLogoUrl}
                        alt={contentLogoAlt}
                        className="cfw__multiple-logo"
                      />
                    </div>
                    <div className="cfw__multiple-logo-container">
                      <img
                        src={contentTwoLogoUrl}
                        alt={contentLogoAlt}
                        className="cfw__multiple-logo"
                      />
                    </div>
                    <div className="cfw__multiple-logo-container">
                      <img
                        src={contentThreeLogoUrl}
                        alt={contentLogoAlt}
                        className="cfw__multiple-logo"
                      />
                    </div>
                  </div>
                )}

                {mainQuote && (
                  <div className="cfw__main-quote">
                    <div className="cfw__main-quote-quote">{mainQuote}</div>
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

                <div className="cfw__content-testimonial-cta">
                  {testimonialQuote && (
                    <div className="cfw__testimonial">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="31"
                        height="24"
                        viewBox="0 0 31 24"
                        fill="none"
                      >
                        <path
                          d="M29.1827 13.1561V24H18.3389V10.3655C18.3389 7.17608 19.216 4.65117 20.9701 2.7907C22.7774 0.930233 25.4352 0 28.9435 0H30.3787V4.06645H29.103C24.9037 4.06645 22.804 6.08638 22.804 10.1262V13.1561H29.1827ZM10.8439 13.1561V24H0V10.3655C0 7.17608 0.877077 4.65117 2.63123 2.7907C4.43854 0.930233 7.09635 0 10.6047 0H12.0399V4.06645H10.7641C6.56478 4.06645 4.46512 6.08638 4.46512 10.1262V13.1561H10.8439Z"
                          fill="#A594FF"
                        />
                      </svg>
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
            {/* Right — Form */}

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
          </div>
        </div>
      )}
    </>
  );
}
