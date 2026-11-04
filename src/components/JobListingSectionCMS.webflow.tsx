import type { ComponentProps } from "react";
import JobListingSectionCMS from "./JobListingSectionCMS";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

/** Shown once under each category. Matched to the job's Category field. */
const CATEGORY_SUBTITLES: Record<string, string> = {
  Centralization:
    "Central teams, regional leasing, and shared-service operations",
  Experience: "Customer experience, training, and team enablement",
  "AI & Technology": "Automation, product management, data, and systems",
  "Corporate Strategy":
    "Performance, optimization, strategic initiatives, and growth",
};

function JobListingSectionCMSAdapter(
  props: Omit<
    ComponentProps<typeof JobListingSectionCMS>,
    "categorySubtitles"
  >,
) {
  return (
    <JobListingSectionCMS
      {...props}
      categorySubtitles={CATEGORY_SUBTITLES}
    />
  );
}

export default declareComponent(JobListingSectionCMSAdapter, {
  name: "Job Listing Section CMS",
  description:
    "Groups CMS jobs by category in collapsible accordions. Category subtitles are hardcoded here, and the company name appears in gray after the job title. Includes search plus function, company, and location filters. Drop the Jobs Collection List into the Jobs slot. UTM params on the page are forwarded to each apply link.",
  group: "Careers",

  props: {
    jobs: props.Slot({
      name: "Jobs",
      tooltip:
        "Drop the Jobs Collection List here. Each item needs the job title, category, company, department, location, and an apply link.",
    }),

    sourceSelector: props.Text({
      name: "Job item selector",
      defaultValue: "[data-job-cms-item]",
      tooltip:
        "CSS selector for each Collection Item (or for the Collection List that holds them). Leave the default unless you have more than one job list on the page.",
    }),

    singleOpen: props.Boolean({
      name: "Single Department Open",
      defaultValue: false,
      tooltip:
        "When enabled, opening one department automatically closes all others.",
    }),

    engineeringOnly: props.Boolean({
      name: "Engineering Only",
      defaultValue: false,
      tooltip:
        "When enabled, only departments whose name contains Engineering, Product, or Research are shown. Product Solutions is excluded.",
    }),
  },
});
