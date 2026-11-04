import JobCmsItem from "./JobCmsItem";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  title?: string;
  department?: string;
  location?: string;
  url?: { href: string; target?: string };
  jobId?: string;
  company?: string;
  category?: string;
  categorySubtitle?: string;
}

function JobCmsItemAdapter({
  title,
  department,
  location,
  url,
  jobId,
  company,
  category,
  categorySubtitle,
}: AdapterProps) {
  return (
    <JobCmsItem
      title={title}
      department={department}
      location={location}
      url={url?.href || ""}
      jobId={jobId}
      company={company}
      category={category}
      categorySubtitle={categorySubtitle}
    />
  );
}

export default declareComponent(JobCmsItemAdapter, {
  name: "Job CMS Item",
  description:
    "Place this inside a Jobs Collection Item and bind each prop to the CMS field. Job Listing Section CMS gathers every item on the page into the accordion.",
  group: "Careers",

  props: {
    title: props.Text({
      name: "Job Title",
      defaultValue: "",
      tooltip: "Bind this to the Job Title field.",
    }),
    department: props.Text({
      name: "Department",
      defaultValue: "",
      tooltip: "Bind this to the Department field.",
    }),
    location: props.Text({
      name: "Location",
      defaultValue: "",
      tooltip:
        'Bind this to the Location field. Separate multiple places with commas, e.g. "New York, Remote".',
    }),
    url: props.Link({
      name: "Apply URL",
      tooltip: "Bind this to the Apply URL link field.",
    }),
    category: props.Text({
      name: "Category",
      defaultValue: "",
      tooltip:
        'Bind this to the Category field. Jobs with the same category are grouped together. Example: "Centralization".',
    }),
    categorySubtitle: props.Text({
      name: "Category Subtitle",
      defaultValue: "",
      tooltip:
        'Short line under the category name. Example: "Central teams, regional leasing, and shared-service operations".',
    }),
    company: props.Text({
      name: "Company",
      defaultValue: "",
      tooltip:
        "Bind this to the Company field. It appears in gray after the job title.",
    }),
    jobId: props.Text({
      name: "Slug",
      defaultValue: "",
      tooltip: "Bind this to the Slug field.",
    }),
  },
});
