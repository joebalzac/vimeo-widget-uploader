import HeroVimeo from "./HeroVimeo";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(HeroVimeo, {
  name: "Hero Vimeo",
  description:
    "Full-bleed conference hero. Paste a Vimeo ID — the video loops muted in the background, and the play button opens it in a lightbox.",
  group: "Media",

  props: {
    vimeoId: props.Text({
      name: "Vimeo ID",
      defaultValue: "1225976653",
      tooltip:
        "Numeric Vimeo ID, or a full vimeo.com / player URL (include h= for unlisted videos).",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Elise Beyond 2026",
    }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue:
        "EliseAI’s first marquee conference on mastering AI in multifamily.",
    }),
    ctaLabel: props.Text({
      name: "CTA Label",
      defaultValue: "Get Access to Beyond 2027",
    }),
    ctaHref: props.Text({
      name: "CTA URL",
      defaultValue: "#",
    }),
  },
});
