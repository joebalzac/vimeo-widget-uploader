import SessionCardGrid from "./SessionCardGrid";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  image?: ImageValue;
  vimeoId?: string;
  title?: string;
  details?: string;
  slug?: string;
  ctaLabel?: string;
  slugPrefix?: string;
}

function SessionCardGridAdapter({
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
    />
  );
}

export default declareComponent(SessionCardGridAdapter, {
  name: "Session Card",
  description:
    "A single session talk card. The whole card links to the URL Slug. Drop it in a Collection List (3 columns on desktop) and bind Image, Vimeo ID, Session Title, Session Details, and URL Slug from the CMS.",
  group: "Media",

  props: {
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
        "CMS slug or full URL. The whole card links here. Bare slugs are prefixed with the URL Prefix field.",
    }),
    ctaLabel: props.Text({
      name: "Link Label",
      defaultValue: "View Talk",
      tooltip:
        "Visual label at the bottom of the card. The whole card is the link.",
    }),
    slugPrefix: props.Text({
      name: "URL Prefix",
      defaultValue: "/",
      tooltip:
        'Prepended to a bare slug, e.g. "/elise-beyond/" + "opening-keynote". Ignored when the slug is already a full URL or starts with /.',
    }),
  },
});
