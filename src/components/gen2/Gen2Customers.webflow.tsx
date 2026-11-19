import Gen2Customers from "./Gen2Customers";
import { DEFAULT_CUSTOMERS, DEFAULT_CUSTOMERS_HEADING, parseCustomers } from "./gen2CustomersData";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = DEFAULT_CUSTOMERS.length;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  heading?: string;
  customersJson?: string;
  [key: string]: ImageValue | string | undefined;
}

/** JSON overrides first, then an uploaded logo image per position wins over both. */
function Gen2CustomersAdapter(p: AdapterProps) {
  const customers = parseCustomers(p.customersJson).map((c, i) => {
    const img = p[`logo${i + 1}`] as ImageValue | undefined;
    return img?.src ? { ...c, logo: img.src, width: undefined, height: undefined } : c;
  });
  return <Gen2Customers heading={p.heading} customers={customers} />;
}

const logoProps = Object.fromEntries(
  DEFAULT_CUSTOMERS.slice(0, SLOTS).map((c, i) => [
    `logo${i + 1}`,
    props.Image({
      name: `Logo ${i + 1} — ${c.name}`,
      tooltip: "Optional replacement logo for this cell. Empty uses the built-in logo (or the JSON “logo” URL).",
    }),
  ]),
);

export default declareComponent(Gen2CustomersAdapter, {
  name: "Gen2 — Customers",
  description:
    "“Trusted by” logo grid: centred H2 above a 5×2 hairline grid (2 columns on mobile). Case-study cells link out (new tab) with an arrow badge. Place inside the main padding section (120/40 desktop · 96 top ≤1000 · 72/24 mobile).",
  group: "Gen2",
  props: {
    heading: props.Text({ name: "Heading", defaultValue: DEFAULT_CUSTOMERS_HEADING, tooltip: "Leave empty to hide." }),
    customersJson: props.Text({
      name: "Cells (JSON)",
      defaultValue: JSON.stringify(DEFAULT_CUSTOMERS.map((c) => ({ name: c.name, href: c.href ?? "" }))),
      tooltip:
        'Array of up to 10 cells in grid order: {"name","href","logo"}. Fields left out keep the built-in default for that position; "href": "" removes the case-study link; "logo" is an image URL. Invalid JSON falls back to the defaults.',
    }),
    ...logoProps,
  },
});
