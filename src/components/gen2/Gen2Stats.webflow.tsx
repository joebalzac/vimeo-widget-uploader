import Gen2Stats from "./Gen2Stats";
import { DEFAULT_STATS, type Gen2Stat } from "./gen2StatsData";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = 3;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  heading?: string;
  subtitle?: string;
  logoBlend?: boolean;
  [key: string]: ImageValue | string | number | boolean | undefined;
}

function Gen2StatsAdapter(p: AdapterProps) {
  const stats: Gen2Stat[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const d = DEFAULT_STATS[n - 1];
    const img = p[`s${n}Logo`] as ImageValue | undefined;
    const url = (p[`s${n}LogoUrl`] as string | undefined)?.trim();
    stats.push({
      value: (p[`s${n}Value`] as string | undefined) ?? "",
      label: (p[`s${n}Label`] as string | undefined) ?? "",
      // Empty image + URL falls back to the bundled Figma logo for this slot.
      logoSrc: img?.src || url || d.logoSrc || "",
      logoName: (p[`s${n}LogoName`] as string | undefined) ?? "",
      logoWidth: (p[`s${n}LogoW`] as number | undefined) ?? d.logoWidth,
      logoHeight: (p[`s${n}LogoH`] as number | undefined) ?? d.logoHeight,
      // Keep the Figma crop only while the bundled logo is in use.
      ...(img?.src || url ? {} : { logoFit: d.logoFit, logoPosition: d.logoPosition }),
    });
  }
  return <Gen2Stats heading={p.heading} subtitle={p.subtitle} logoBlend={p.logoBlend} stats={stats} />;
}

function statProps(n: number) {
  const d = DEFAULT_STATS[n - 1];
  return {
    [`s${n}Value`]: props.Text({
      name: `Stat ${n} — Value`,
      defaultValue: d.value,
      tooltip: "The number counts up; any prefix/suffix (+, %) stays fixed. Clear value and label to hide.",
    }),
    [`s${n}Label`]: props.Text({ name: `Stat ${n} — Label`, defaultValue: d.label }),
    [`s${n}Logo`]: props.Image({
      name: `Stat ${n} — Logo`,
      tooltip: "White or transparent logo. Leave empty to use Logo URL, or the bundled default logo.",
    }),
    [`s${n}LogoUrl`]: props.Text({ name: `Stat ${n} — Logo URL`, defaultValue: "", tooltip: "Used when no Logo image is set." }),
    [`s${n}LogoName`]: props.Text({
      name: `Stat ${n} — Source Name`,
      defaultValue: d.logoName ?? "",
      tooltip: "Logo alt text.",
    }),
    [`s${n}LogoW`]: props.Number({ name: `Stat ${n} — Logo Width`, defaultValue: d.logoWidth ?? 100, min: 16, max: 320, decimals: 1 }),
    [`s${n}LogoH`]: props.Number({ name: `Stat ${n} — Logo Height`, defaultValue: d.logoHeight ?? 32, min: 8, max: 120, decimals: 1 }),
  };
}

export default declareComponent(Gen2StatsAdapter, {
  name: "Gen2 — Stats (Dark)",
  description:
    "Full-bleed dark section (#131115, own padding; turns the nav dark): heading + subtitle and three boxed stats that count up, each with a source logo. Stacks on mobile.",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "AI That Drives Asset Performance" }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: "The right AI product directly produces financial results, unlike previous technologies." }),
    logoBlend: props.Boolean({
      name: "Logo Blend",
      defaultValue: false,
      tooltip:
        "Screen-blend + grayscale for raster logos with a grey box baked in. Leave off for transparent logos (the defaults).",
    }),
    ...statProps(1),
    ...statProps(2),
    ...statProps(3),
  },
});
