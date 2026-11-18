import Gen2Footer from "./Gen2Footer";
import { DEFAULT_FOOTER_COLUMNS } from "./gen2FooterData";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  columns?: string;
  logo?: ImageValue;
  logoHref?: string;
  logoAlt?: string;
}

function Gen2FooterAdapter({ columns, logo, logoHref, logoAlt }: AdapterProps) {
  return <Gen2Footer columns={columns} logoSrc={logo?.src} logoHref={logoHref} logoAlt={logoAlt} />;
}

export default declareComponent(Gen2FooterAdapter, {
  name: "Gen2 — Footer",
  description:
    "Full-width footer: EliseAI logo in a 300px column, then link columns (mono heading + links). Columns come from a JSON prop. Stacks to a two-up grid on mobile.",
  group: "Gen2",
  props: {
    columns: props.Text({
      name: "Columns (JSON)",
      defaultValue: JSON.stringify(DEFAULT_FOOTER_COLUMNS),
      tooltip:
        'JSON array: [{"heading":"Products","links":[{"label":"LeasingAI","href":"/leasing"},{"label":"Help Center","href":"https://…","external":true}]}]. "external" opens a new tab and adds ↗. Invalid/empty JSON falls back to the defaults.',
    }),
    logo: props.Image({ name: "Logo", tooltip: "Defaults to the EliseAI wordmark." }),
    logoHref: props.Text({ name: "Logo Link", defaultValue: "/" }),
    logoAlt: props.Text({ name: "Logo Alt Text", defaultValue: "EliseAI" }),
  },
});
