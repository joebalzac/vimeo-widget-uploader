// ─── Healthcare tracking persistence ────────────────────────────────────────
//
// Healthcare HubSpot forms use "Most Recent" UTM fields plus click IDs and
// GA4 client ID. This is separate from `utm.ts`, which remains first-touch
// UTM-only for housing and other forms.
//
// Submissions prefer the current URL (most recent), then the stored value, so
// HubSpot "Most Recent" hidden fields stay accurate on tagged landing pages
// and still survive internal navigation after the query string is dropped.
// Stored values use the same `elise_utm_` sessionStorage prefix.

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const CLICK_ID_KEYS = [
  "gclid",
  "li_fat_id",
  "msclkid",
  "fbclid",
] as const;

const TRACKING_KEYS = [...UTM_KEYS, ...CLICK_ID_KEYS] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type TrackingKey = (typeof TRACKING_KEYS)[number];

const STORAGE_PREFIX = "elise_utm_";

/** HubSpot form field names to populate for each captured param. */
const HUBSPOT_FIELD_NAMES: Record<TrackingKey, string[]> = {
  utm_source: ["utm_source", "utm_source_most_recent"],
  utm_medium: ["utm_medium", "utm_medium_most_recent"],
  utm_campaign: ["utm_campaign", "utm_campaign_most_recent"],
  utm_content: ["utm_content", "utm_content_most_recent"],
  utm_term: ["utm_term", "utm_term_most_recent"],
  gclid: ["gclid"],
  li_fat_id: ["li_fat_id"],
  msclkid: ["msclkid"],
  fbclid: ["fbclid"],
};

function getQueryParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

/**
 * Persist any tracking values present in the current URL to sessionStorage,
 * but only if not already set. Call once on mount.
 */
export function storeUtms(): void {
  try {
    TRACKING_KEYS.forEach((key) => {
      const fromUrl = getQueryParam(key);
      if (fromUrl && !sessionStorage.getItem(STORAGE_PREFIX + key)) {
        sessionStorage.setItem(STORAGE_PREFIX + key, fromUrl);
      }
    });
  } catch {
    // sessionStorage can throw in private mode / sandboxed iframes — ignore.
  }
}

/**
 * Resolve a tracking value: prefer the current URL (most recent), fall back
 * to the stored first-touch value from earlier in the session.
 */
export function getUtm(key: TrackingKey): string {
  const fromUrl = getQueryParam(key);
  if (fromUrl) return fromUrl;
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return stored;
  } catch {
    // ignore
  }
  return "";
}

/** GA4 client ID from the `_ga` cookie (`GA1.1.XXXXXXXX.YYYYYYYY`). */
function getGa4ClientId(): string {
  try {
    const match = document.cookie.match(/(?:^|; )_ga=GA\d+\.\d+\.([^;]+)/);
    return match?.[1] ? decodeURIComponent(match[1].trim()) : "";
  } catch {
    return "";
  }
}

/**
 * Build HubSpot form fields for every tracking key that has a value,
 * including "Most Recent" aliases, click IDs, and GA4 client ID.
 */
export function getUtmFields(): Array<{ name: string; value: string }> {
  const fields: Array<{ name: string; value: string }> = [];
  const seen = new Set<string>();

  TRACKING_KEYS.forEach((key) => {
    const value = getUtm(key);
    if (!value) return;
    HUBSPOT_FIELD_NAMES[key].forEach((name) => {
      if (seen.has(name)) return;
      seen.add(name);
      fields.push({ name, value });
    });
  });

  const ga4ClientId = getGa4ClientId();
  if (ga4ClientId) {
    fields.push({ name: "ga4_client_id", value: ga4ClientId });
  }

  return fields;
}
