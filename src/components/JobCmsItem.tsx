import { useEffect } from "react";
import { registerCmsJob, unregisterCmsJob } from "./jobCmsRegistry";

interface JobCmsItemProps {
  title?: string;
  department?: string;
  location?: string;
  url?: string;
  jobId?: string;
  company?: string;
}

/** Invisible row. Drop it inside a Collection Item and bind the CMS fields. */
export default function JobCmsItem({
  title = "",
  department = "",
  location = "",
  url = "",
  jobId = "",
  company = "",
}: JobCmsItemProps) {
  useEffect(() => {
    const name = title.trim();
    const id = (jobId || name).trim();
    if (!id || !name) return;

    registerCmsJob({
      id,
      title: name,
      department: department.trim(),
      location: location.trim(),
      url: url.trim(),
      company: company.trim(),
    });

    return () => unregisterCmsJob(id);
  }, [title, department, location, url, jobId, company]);

  return null;
}
