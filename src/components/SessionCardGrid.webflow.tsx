import SessionCardGrid from "./SessionCardGrid";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  theme?: string;
  lockedVideo?: boolean | string;
  gatedVideo?: boolean | string;
  image?: ImageValue;
  vimeoId?: string;
  title?: string;
  details?: string;
  slug?: string;
  ctaLabel?: string;
  slugPrefix?: string;
}

function SessionCardGridAdapter({
  theme,
  lockedVideo,
  gatedVideo,
  image,
  vimeoId,
  title,
  details,
  slug,
  ctaLabel,
  slugPrefix,
}: AdapterProps) {
  return (
    <SessionCardGrid
      imageSrc={image?.src}
      imageAlt={image?.alt}
      vimeoId={vimeoId}
      title={title}
      details={details}
      slug={slug}
      ctaLabel={ctaLabel}
      slugPrefix={slugPrefix}
      lockedVideo={lockedVideo}
      gatedVideo={gatedVideo}
      darkMode={String(theme || "").toLowerCase() === "dark"}
    />
  );
}

export default declareComponent(SessionCardGridAdapter, {
  name: "Session Card",
  description:
    "A single session talk card. Bind Locked Video to the CMS Locked Video Switch for the lock icon and HubSpot form. Gated Video is a separate boolean and does not control the lock. Drop it in a Collection List and bind fields from the CMS.",
  group: "Media",

  props: {
    theme: props.Variant({
      name: "Theme",
      options: ["light", "dark"],
      defaultValue: "light",
      tooltip:
        "Light for light sections. Dark for dark section backgrounds (light title, subtitle, and CTA).",
    }),
    lockedVideo: props.Boolean({
      name: "Locked Video",
      defaultValue: false,
      trueLabel: "On",
      falseLabel: "Off",
      tooltip:
        "Bind this to the CMS Locked Video Switch. On: lock icon plus HubSpot form on click. Off: no lock — the card goes to the URL Slug.",
    }),
    gatedVideo: props.Boolean({
      name: "Gated Video",
      defaultValue: false,
      trueLabel: "On",
      falseLabel: "Off",
      tooltip:
        "Separate from Locked Video and from the Gated Vimeo Form component. Does not show the lock or open the session form.",
    }),
    image: props.Image({
      name: "Image",
      tooltip:
        "Card thumbnail (upload or paste a URL). Takes priority over the Vimeo thumbnail when both are set.",
    }),
    vimeoId: props.Text({
      name: "Vimeo ID",
      defaultValue: "",
      tooltip:
        "Numeric Vimeo video ID (or a vimeo.com URL). Used for the thumbnail when no image is set.",
    }),
    title: props.Text({
      name: "Session Title",
      defaultValue: "Session Title",
    }),
    details: props.Text({
      name: "Session Details",
      defaultValue: "Session Details...",
    }),
    slug: props.Text({
      name: "URL Slug",
      defaultValue: "",
      tooltip:
        "CMS slug or full URL. Used when Locked Video is off — the whole card links here. Ignored while Locked Video is on.",
    }),
    ctaLabel: props.Text({
      name: "Link Label",
      defaultValue: "View Talk",
      tooltip:
        "Visual label at the bottom of the card. The whole card is the click target.",
    }),
    slugPrefix: props.Text({
      name: "URL Prefix",
      defaultValue: "/",
      tooltip:
        'Prepended to a bare slug, e.g. "/elise-beyond/" + "opening-keynote". Ignored when the slug is already a full URL or starts with /.',
    }),
  },
});
