// Per-line call audio for the Product Showcase.
//
// The Webflow CLI's bundler only handles image/font assets — it can't bundle
// .mp3 files. So the clips are hosted in the Webflow Asset Manager (Assets panel
// → upload the .mp3 → copy its URL) and referenced by URL instead of imported.
//
// Paste each uploaded asset URL below. Keys are "folder/filename" (folder
// lowercased, filename without extension), e.g. AUDIO["housing/Jordan-Hey"].
// These are the defaults for both the local preview and the Webflow component;
// in Webflow each clip's URL can also be overridden per-message in the Designer
// (see ProductShowcase.webflow.tsx).
export const AUDIO: Record<string, string> = {
  "housing/Jordan-No-Hot-Water": "",
  "housing/Elise-Sorry-Maintenance": "",
  "housing/Jordan-Name-Unit": "",
  "housing/Elise-Everywhere-Or-Kitchen": "",
  "housing/Jordan-Just-Kitchen": "",
  "housing/Elise-Got-It-Work-Order": "",
  "housing/Jordan-They-Can-Come": "",
  "housing/Elise-Perfect-Submitted": "",
  "housing/Jordan-Thanks": "",

  "healthcare/Elise-Hi-Mia": "",
  "healthcare/Mia-Yes-I-Swithced": "",
  "healthcare/Mia-XJH": "",
  "healthcare/Elise-Thanks": "",
};
