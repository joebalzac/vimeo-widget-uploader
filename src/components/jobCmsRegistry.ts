export interface CmsJob {
  id: string;
  title: string;
  department: string;
  location: string;
  url: string;
  company: string;
}

export const CMS_JOBS_CHANGE_EVENT = "elise-cms-jobs-change";

const REGISTRY_KEY = "__eliseCmsJobs";

type Store = Map<string, CmsJob>;

function store(): Store | null {
  if (typeof window === "undefined") return null;
  const target = window as Window & { [REGISTRY_KEY]?: Store };
  if (!target[REGISTRY_KEY]) target[REGISTRY_KEY] = new Map();
  return target[REGISTRY_KEY];
}

export function registerCmsJob(job: CmsJob) {
  const jobs = store();
  if (!jobs || !job.id || !job.title) return;
  jobs.set(job.id, job);
  window.dispatchEvent(new Event(CMS_JOBS_CHANGE_EVENT));
}

export function unregisterCmsJob(id: string) {
  const jobs = store();
  if (!jobs || !id) return;
  jobs.delete(id);
  window.dispatchEvent(new Event(CMS_JOBS_CHANGE_EVENT));
}

export function listCmsJobs(): CmsJob[] {
  const jobs = store();
  if (!jobs) return [];
  return Array.from(jobs.values());
}
