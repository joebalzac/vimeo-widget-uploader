/** Shared work-email blocklist for gated forms. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BLOCKED_EMAIL_DOMAINS = new Set([
  "aigentless.com",
  "anyonehome.com",
  "aol.com",
  "apartmentlist.com",
  "apartments.com",
  "appfolio.com",
  "appworkco.com",
  "assorthealth.com",
  "betterbot.com",
  "brightlysoftware.com",
  "buildium.com",
  "callrail.com",
  "callsara.ai",
  "capterra.com",
  "cherre.com",
  "doorloop.com",
  "duck.com",
  "email.com",
  "entrata.com",
  "fastmail.com",
  "fastmail.fm",
  "foft.com",
  "funnelleasing.com",
  "getalfred.com",
  "getzuma.com",
  "gmail.com",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "google.com",
  "googlemail.com",
  "happy.co",
  "hey.com",
  "hire.mavenai",
  "hiremaven.ai",
  "hotmail.co.uk",
  "hotmail.com",
  "hotmail.de",
  "hotmail.es",
  "hotmail.fr",
  "hyly.ai",
  "icloud.com",
  "intelligencebank.com",
  "iriscx.com",
  "knockcrm.com",
  "leasehawk.com",
  "leonardo247.com",
  "live.co.uk",
  "live.com",
  "live.fr",
  "mac.com",
  "mail.com",
  "me.com",
  "microsoft.com",
  "msn.com",
  "nurtureboss.io",
  "outlook.co.uk",
  "outlook.com",
  "outlook.fr",
  "papaya.com",
  "perq.com",
  "proton.me",
  "protonmail.com",
  "realpage.com",
  "rentredi.com",
  "respage.com",
  "roofstock.com",
  "tenantcloud.com",
  "tour24.io",
  "turbotenant.com",
  "tutamail.com",
  "tutanota.com",
  "vendoroo.ai",
  "verbaflo.ai",
  "vidabypropertyvista.com",
  "x.com",
  "xfavaj.com",
  "xn--ldr802c.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "yahoo.com",
  "yahoo.de",
  "yahoo.es",
  "yahoo.fr",
  "yandex.com",
  "yandex.ru",
  "yardi.com",
  "yardibreeze.com",
  "yopmail.com",
  "zoho.com",
]);

const BLOCKED_EMAILS = new Set([
  "81035677@xn--ldr802c.com",
  "eriks@tour24.io",
  "mahadabdi1999@outlook.com",
  "vp@verbaflo.ai",
]);

function isBlockedDomain(domain: string): boolean {
  let current = domain;
  while (current) {
    if (BLOCKED_EMAIL_DOMAINS.has(current)) return true;
    const dot = current.indexOf(".");
    if (dot === -1) return false;
    current = current.slice(dot + 1);
  }
  return false;
}

export function isBlockedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (BLOCKED_EMAILS.has(normalized)) return true;
  const at = normalized.lastIndexOf("@");
  if (at === -1) return false;
  return isBlockedDomain(normalized.slice(at + 1));
}

export function isValidWorkEmail(email: string): boolean {
  const normalized = email.trim();
  if (!EMAIL_PATTERN.test(normalized)) return false;
  return !isBlockedEmail(normalized);
}

export const WORK_EMAIL_ERROR = "Please use your work email address.";
