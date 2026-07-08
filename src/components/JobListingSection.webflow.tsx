import JobListingSection from "./JobListingSection";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(JobListingSection, {
  name: "Job Listing Section",
  description:
    "Fetches open roles from Ashby, groups them by department in collapsible accordions, and provides search + department/location filters. UTM params on the page are forwarded to each job link.",
  group: "Careers",

  props: {
    apiUrl: props.Text({
      name: "Jobs API URL",
      defaultValue:
        "https://nodejs-serverless-function-express-blush-two.vercel.app/api/jobs",
      tooltip: "POST endpoint that returns { jobs, locations }.",
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
        "When enabled, only the Engineering department is shown (listing and filters).",
    }),
  },
});
