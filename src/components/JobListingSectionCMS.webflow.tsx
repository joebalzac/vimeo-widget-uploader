import JobListingSectionCMS from "./JobListingSectionCMS";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(JobListingSectionCMS, {
  name: "Job Listing Section CMS",
  description:
    "Groups CMS jobs by department in collapsible accordions, with search plus department and location filters. Drop the Jobs Collection List into the Jobs slot. UTM params on the page are forwarded to each apply link.",
  group: "Careers",

  props: {
    jobs: props.Slot({
      name: "Jobs",
      tooltip:
        "Drop the Jobs Collection List here. Each item needs the job title, company, department, location, and an apply link.",
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
