import { useState, useEffect } from "react";

const CONTACT_CHECK_URL =
  "https://contact-checker-backend.vercel.app/api/check-contact";

const LIST_MEMBERSHIP_URL =
  "https://contact-checker-backend.vercel.app/api/check-list-membership";

interface UseHubSpotContactCheckResult {
  isKnown: boolean;
  isLoading: boolean;
}

export function useHubSpotContactCheck(): UseHubSpotContactCheckResult {
  const [isKnown, setIsKnown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const utk = document.cookie.match(/hubspotutk=([^;]+)/)?.[1];

    if (!utk) {
      setIsKnown(false);
      setIsLoading(false);
      return;
    }

    const check = async (): Promise<void> => {
      try {
        const contactRes = await fetch(`${CONTACT_CHECK_URL}?utk=${utk}`);
        const contactData = await contactRes.json();
        console.log("[useHubSpotContactCheck] isKnown:", contactData.isKnown);

        if (!contactData.isKnown) {
          setIsKnown(false);
          return;
        }

        const listRes = await fetch(`${LIST_MEMBERSHIP_URL}?utk=${utk}`);
        const listData = await listRes.json();
        console.log(
          "[useHubSpotContactCheck] isEligible:",
          listData.isEligible,
          "reason:",
          listData.reason,
        );

        setIsKnown(!listData.isEligible);
      } catch (err) {
        setIsKnown(false);
      } finally {
        setIsLoading(false);
      }
    };

    void check();
  }, []);

  return { isKnown, isLoading };
}
