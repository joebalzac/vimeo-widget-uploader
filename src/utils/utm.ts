// ─── UTM persistence ────────────────────────────────────────────────────────
//
// Mirrors the site-wide inline snippet that patches HubSpot embeds:
//   - First-touch capture: the first UTM value seen in a session wins.
//   - Stored in sessionStorage under the `elise_utm_` prefix (shared with the
//     legacy snippet, so both stay in sync).
//
// The React MultiStep forms POST directly to the HubSpot Forms API instead of
// rendering a HubSpot embed, so the `onFormReady` patch never touches them.
// These helpers give them the same cross-page persistence.

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

const STORAGE_PREFIX = "elise_utm_";

function getQueryParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

/**
 * First-touch store: persist any UTM values present in the current URL to
 * sessionStorage, but only if not already set. Call once on mount.
 */
export function storeUtms(): void {
  try {
    UTM_KEYS.forEach((key) => {
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
 * Resolve a single UTM value: prefer the stored (first-touch) value, fall back
 * to whatever is in the current URL.
 */
export function getUtm(key: UtmKey): string {
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return stored;
  } catch {
    // ignore and fall through to URL
  }
  return getQueryParam(key);
}

/**
 * Build HubSpot form fields for every UTM key that has a value.
 */
export function getUtmFields(): Array<{ name: string; value: string }> {
  return UTM_KEYS.map((key) => ({ name: key, value: getUtm(key) })).filter(
    (f) => f.value !== "",
  );
}
