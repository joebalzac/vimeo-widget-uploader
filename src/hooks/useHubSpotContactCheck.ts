/**
 * useHubSpotContactCheck.ts
 *
 * Reads the hubspotutk cookie and checks against the Vercel endpoint
 * to determine if the current visitor is a known HubSpot contact.
 *
 * Returns:
 *  - isKnown: true if existing contact, false if net new or check failed
 *  - isLoading: true while the check is in flight
 */

import { useState, useEffect } from "react";

const CONTACT_CHECK_URL =
  "https://contact-checker-backend.vercel.app/api/check-contact";

interface UseHubSpotContactCheckResult {
  isKnown: boolean;
  isLoading: boolean;
}

export function useHubSpotContactCheck(): UseHubSpotContactCheckResult {
  const [isKnown, setIsKnown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const utk = document.cookie.match(/hubspotutk=([^;]+)/)?.[1];
    console.log("[useHubSpotContactCheck] utk:", utk);

    if (!utk) {
      setIsKnown(false);
      setIsLoading(false);
      return;
    }

    const check = async (): Promise<void> => {
      try {
        const res = await fetch(`${CONTACT_CHECK_URL}?utk=${utk}`);
        const data = await res.json();
        console.log("[useHubSpotContactCheck] isKnown:", data.isKnown);
        setIsKnown(data.isKnown ?? false);
      } catch {
        setIsKnown(false);
      } finally {
        console.log("[useHubSpotContactCheck] isLoading: false");
        setIsLoading(false);
      }
    };

    void check();
  }, []);

  return { isKnown, isLoading };
}
