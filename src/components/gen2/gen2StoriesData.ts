/* Default stories — handoff 09 (Figma 642:58325). Mirrors operatorTestimonialsData's shape. */
import posterUrl from "../../assets/gen2/stories/poster.jpg";
/* Per-story video thumbnails (handoff 09 v120, Figma 886:180453): 1422×800 (2×) WebP renders */
import posterSarah from "../../assets/gen2/stories/poster-sarah.webp";
import posterAriel from "../../assets/gen2/stories/poster-ariel.webp";
import posterCarynes from "../../assets/gen2/stories/poster-carynes.webp";

/** Figma 642:58347 ("launch-trailer-poster"): the poster used when a story has none. */
export const DEFAULT_POSTER = posterUrl;

export interface Gen2Story {
  quote: string;
  name: string;
  role: string;
  /** Poster image URL for the video card. */
  posterSrc?: string;
  /** Vimeo ID / vimeo.com URL, or a direct video file URL (.mp4, .webm). Empty shows the play badge without making it clickable. */
  videoUrl?: string;
}

export const DEFAULT_STORIES: Gen2Story[] = [
  {
    quote:
      "“Centralizing pieces of our maintenance roles and our online leasing tools as well with EliseAI.”",
    name: "Sarah Corvington",
    role: "Operations Speciality, Summit Property Management",
    posterSrc: posterSarah,
  },
  {
    quote:
      "“EliseAI and EliseCRM are obviously fantastic lead nurturing tools, but to GoldOller they’re more than that—they’re also employee nurturing tools.”",
    name: "Ariel Hanson",
    role: "Director of Operations, GoldOller",
    posterSrc: posterAriel,
  },
  {
    quote: "“Centralized leasing is a strategic imperative that continues to reshape our industry”",
    name: "Carynes Gitler",
    role: "VP of Centralized Operations Services, Cardinal Group Companies",
    posterSrc: posterCarynes,
  },
];
