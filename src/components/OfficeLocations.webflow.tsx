import OfficeLocations from "./OfficeLocations";
import type { OfficeLocation } from "./OfficeLocations";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  perRow?: number;
  // Location slots — only included if a city is set.
  l1City?: string; l1Addr1?: string; l1Addr2?: string; l1Href?: string; l1Cta?: string; l1Image?: string;
  l2City?: string; l2Addr1?: string; l2Addr2?: string; l2Href?: string; l2Cta?: string; l2Image?: string;
  l3City?: string; l3Addr1?: string; l3Addr2?: string; l3Href?: string; l3Cta?: string; l3Image?: string;
  l4City?: string; l4Addr1?: string; l4Addr2?: string; l4Href?: string; l4Cta?: string; l4Image?: string;
  l5City?: string; l5Addr1?: string; l5Addr2?: string; l5Href?: string; l5Cta?: string; l5Image?: string;
  l6City?: string; l6Addr1?: string; l6Addr2?: string; l6Href?: string; l6Cta?: string; l6Image?: string;
}

function OfficeLocationsAdapter({
  eyebrow, heading, perRow,
  l1City, l1Addr1, l1Addr2, l1Href, l1Cta, l1Image,
  l2City, l2Addr1, l2Addr2, l2Href, l2Cta, l2Image,
  l3City, l3Addr1, l3Addr2, l3Href, l3Cta, l3Image,
  l4City, l4Addr1, l4Addr2, l4Href, l4Cta, l4Image,
  l5City, l5Addr1, l5Addr2, l5Href, l5Cta, l5Image,
  l6City, l6Addr1, l6Addr2, l6Href, l6Cta, l6Image,
}: AdapterProps) {
  const slots = [
    { city: l1City, addressLine1: l1Addr1, addressLine2: l1Addr2, href: l1Href, ctaLabel: l1Cta, imageSrc: l1Image },
    { city: l2City, addressLine1: l2Addr1, addressLine2: l2Addr2, href: l2Href, ctaLabel: l2Cta, imageSrc: l2Image },
    { city: l3City, addressLine1: l3Addr1, addressLine2: l3Addr2, href: l3Href, ctaLabel: l3Cta, imageSrc: l3Image },
    { city: l4City, addressLine1: l4Addr1, addressLine2: l4Addr2, href: l4Href, ctaLabel: l4Cta, imageSrc: l4Image },
    { city: l5City, addressLine1: l5Addr1, addressLine2: l5Addr2, href: l5Href, ctaLabel: l5Cta, imageSrc: l5Image },
    { city: l6City, addressLine1: l6Addr1, addressLine2: l6Addr2, href: l6Href, ctaLabel: l6Cta, imageSrc: l6Image },
  ];

  const items: OfficeLocation[] = slots
    .filter((s) => s.city)
    .map((s) => ({
      city: s.city || "",
      addressLine1: s.addressLine1 || undefined,
      addressLine2: s.addressLine2 || undefined,
      href: s.href || undefined,
      ctaLabel: s.ctaLabel || undefined,
      imageSrc: s.imageSrc || undefined,
    }));

  return (
    <OfficeLocations
      eyebrow={eyebrow}
      heading={heading}
      perRow={perRow || undefined}
      items={items.length ? items : undefined}
    />
  );
}

function locationProps(n: number) {
  return {
    [`l${n}City`]: props.Text({
      name: `Location ${n} — City`,
      defaultValue: "",
      tooltip: `Office / city name, e.g. "San Francisco". Leave blank to hide this cell.`,
    }),
    [`l${n}Addr1`]: props.Text({
      name: `Location ${n} — Address line 1`,
      defaultValue: "",
      tooltip: `First address line, e.g. "55 2nd Street".`,
    }),
    [`l${n}Addr2`]: props.Text({
      name: `Location ${n} — Address line 2`,
      defaultValue: "",
      tooltip: `Second address line, e.g. "San Francisco, CA 94105".`,
    }),
    [`l${n}Href`]: props.Text({
      name: `Location ${n} — Link URL`,
      defaultValue: "",
      tooltip: `Destination for the "View Roles" link.`,
    }),
    [`l${n}Cta`]: props.Text({
      name: `Location ${n} — Link label`,
      defaultValue: "",
      tooltip: `Link label. Defaults to "View Roles".`,
    }),
    [`l${n}Image`]: props.Text({
      name: `Location ${n} — Image URL`,
      defaultValue: "",
      tooltip: `Optional photo URL for this location. When set, the photo (with a dark overlay) fades in on hover. Leave blank for a flat card.`,
    }),
  };
}

export default declareComponent(OfficeLocationsAdapter, {
  name: "Office Locations",
  description:
    '"In Person, By Design" dark office-locations grid. Add up to 6 locations — each shows a city, address, and a "View Roles" link, with an optional background photo.',
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "Built by people from",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "In Person, By Design",
      tooltip: "Main section heading.",
    }),
    perRow: props.Number({
      name: "Cells per row",
      defaultValue: 3,
      min: 1,
      max: 6,
      tooltip: "How many cells per row before wrapping. Default 3 (5 locations → a 3 + 2 layout).",
    }),
    ...locationProps(1),
    ...locationProps(2),
    ...locationProps(3),
    ...locationProps(4),
    ...locationProps(5),
    ...locationProps(6),
  },
});
