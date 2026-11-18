import Gen2Journey from "./Gen2Journey";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  heading?: string;
  subtitle?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
  p6?: string;
}

function Gen2JourneyAdapter({ heading, subtitle, p1, p2, p3, p4, p5, p6 }: AdapterProps) {
  const products = [p1, p2, p3, p4, p5, p6].map((p) => p ?? "");
  return <Gen2Journey heading={heading} subtitle={subtitle} products={products} />;
}

const TIP = "Clockwise from the top. Leave empty for the default label.";

export default declareComponent(Gen2JourneyAdapter, {
  name: "Gen2 — Renter Journey",
  description:
    "“The Ideal Renter Journey”: heading + subtitle above a ring of six products around the Apollo mark. A clockwise sweep lights each product, holds, rewinds and loops while in view. Scales to fit on mobile.",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "The Ideal Renter Journey" }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue: "From first inquiry to lease renewal, Elise handles it all across text, voice, email, and web chat.",
    }),
    p1: props.Text({ name: "Product 1", defaultValue: "LeasingAI", tooltip: TIP }),
    p2: props.Text({ name: "Product 2", defaultValue: "Tour Intelligence", tooltip: TIP }),
    p3: props.Text({ name: "Product 3", defaultValue: "AI-Guided Touring", tooltip: TIP }),
    p4: props.Text({ name: "Product 4", defaultValue: "Maintenance", tooltip: TIP }),
    p5: props.Text({ name: "Product 5", defaultValue: "Delinquency", tooltip: TIP }),
    p6: props.Text({ name: "Product 6", defaultValue: "Renewals", tooltip: TIP }),
  },
});
