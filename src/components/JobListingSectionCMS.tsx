import "../utils/interVariableFont";
import { useEffect, useRef, useState, type ReactNode } from "react";
import "./JobListingSection.css";
import {
  CMS_JOBS_CHANGE_EVENT,
  listCmsJobs,
  type CmsJob,
} from "./jobCmsRegistry";

/**
 * Drop the Jobs Collection List into the Jobs slot. Each Collection Item
 * should contain the job title, category, company, department, and location
 * text, plus a link for the apply URL. Category subtitles are hardcoded
 * and matched by category name. Custom attributes on the item are used
 * when present.
 */

/** Subtitle under each category. Matched to the job's Category field. */
const CATEGORY_SUBTITLES: Record<string, string> = {
  Centralization:
    "Central teams, regional leasing, and shared-service operations",
  Experience: "Customer experience, training, and team enablement",
  "AI & Technology": "Automation, product management, data, and systems",
  "Corporate Strategy":
    "Performance, optimization, strategic initiatives, and growth",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_SUBTITLES);

interface JobListingSectionCMSProps {
  /** Collection List dropped into the Jobs slot. */
  jobs?: ReactNode;
  /** CSS selector for each Collection Item. */
  sourceSelector?: string;
  singleOpen?: boolean;
  /** When true, only Engineering, Product, and Research are shown. */
  engineeringOnly?: boolean;
}

const FOCUSED_DEPARTMENTS = ["engineering", "product", "research"];
const EXCLUDED_DEPARTMENTS = ["product solutions"];
const DEFAULT_SOURCE = "[data-job-cms-item]";

const isFocusedDept = (department: string): boolean => {
  const dept = department.toLowerCase();
  if (EXCLUDED_DEPARTMENTS.some((d) => dept.includes(d))) return false;
  return FOCUSED_DEPARTMENTS.some((d) => dept.includes(d));
};

const readAttr = (el: HTMLElement, name: string): string =>
  (el.getAttribute(name) || "").trim();

const readChildText = (el: HTMLElement, selector: string): string =>
  (el.querySelector(selector)?.textContent || "").trim();

const readChildUrl = (el: HTMLElement, selector: string): string => {
  const node = el.querySelector(selector);
  if (!node) return "";
  if (node instanceof HTMLAnchorElement && node.getAttribute("href")) {
    return (node.getAttribute("href") || "").trim();
  }
  const href = node.getAttribute("href");
  if (href) return href.trim();
  return (node.textContent || "").trim();
};

function pickField(preferred: string, fallback: string): string {
  return preferred.trim() || fallback.trim();
}

function mergeJob(preferred: CmsJob, fallback: CmsJob): CmsJob {
  return {
    id: preferred.id || fallback.id,
    title: pickField(preferred.title, fallback.title),
    department: pickField(preferred.department, fallback.department),
    location: pickField(preferred.location, fallback.location),
    url: pickField(preferred.url, fallback.url),
    company: pickField(preferred.company, fallback.company),
    category: pickField(preferred.category, fallback.category),
  };
}

function mergeJobs(primary: CmsJob[], secondary: CmsJob[]): CmsJob[] {
  const map = new Map<string, CmsJob>();
  secondary.forEach((job) => map.set(job.id, job));
  primary.forEach((job) => {
    const existing = map.get(job.id);
    map.set(job.id, existing ? mergeJob(job, existing) : job);
  });
  return Array.from(map.values());
}

const ITEM_SELECTOR = "[data-job-cms-item], [data-title], .w-dyn-item";

function leafTexts(el: HTMLElement): string[] {
  const texts: string[] = [];
  el.querySelectorAll("*").forEach((node) => {
    if (node.children.length > 0) return;
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!text || texts.includes(text)) return;
    texts.push(text);
  });
  return texts;
}

/** Direct child text, including empty slots so category stays in position 2. */
function fieldTexts(el: HTMLElement): string[] {
  return Array.from(el.children).map((child) =>
    (child.textContent || "").replace(/\s+/g, " ").trim(),
  );
}

function sameText(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function parseItem(el: HTMLElement, index: number): CmsJob | null {
  const texts = leafTexts(el);
  const fields = fieldTexts(el);
  const href = (el.querySelector("a")?.getAttribute("href") || "").trim();
  const title =
    readAttr(el, "data-title") ||
    readChildText(el, "[data-job-title]") ||
    fields.find(Boolean) ||
    texts[0] ||
    "";
  if (!title) return null;

  const department =
    readAttr(el, "data-department") ||
    readChildText(el, "[data-job-department]") ||
    el.querySelector("[data-department]")?.getAttribute("data-department") ||
    "";
  const locationAttr =
    readAttr(el, "data-location") ||
    readChildText(el, "[data-job-location]") ||
    el.querySelector("[data-location]")?.getAttribute("data-location") ||
    "";
  const companyAttr =
    readAttr(el, "data-company") ||
    readChildText(el, "[data-job-company]") ||
    el.querySelector("[data-company]")?.getAttribute("data-company") ||
    "";
  const categoryAttr =
    readAttr(el, "data-category") ||
    readChildText(el, "[data-job-category]") ||
    el.querySelector("[data-category]")?.getAttribute("data-category") ||
    "";

  // Collection item order: title, category, company, location.
  // The category element stays in the DOM even when the CMS value is empty.
  const categorySlot = fields.length >= 4 ? fields[1] : "";
  const companySlot = fields.length >= 4 ? fields[2] : "";
  const locationSlot = fields.length >= 4 ? fields[3] : "";
  const categoryFromText =
    fields.map((text) => canonicalCategory(text)).find(Boolean) ||
    texts.map((text) => canonicalCategory(text)).find(Boolean) ||
    "";
  const category =
    canonicalCategory(categoryAttr) ||
    categoryAttr.trim() ||
    canonicalCategory(categorySlot) ||
    categorySlot.trim() ||
    categoryFromText ||
    canonicalCategory(department);

  const used = new Set(
    [title, locationAttr, category, categorySlot, categoryFromText]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  const leftovers = fields.filter(
    (text) => text && !used.has(text.trim().toLowerCase()),
  );
  const company =
    companyAttr.trim() ||
    companySlot.trim() ||
    leftovers.find((text) => !sameText(text, locationSlot)) ||
    "";
  const location =
    locationAttr.trim() ||
    locationSlot.trim() ||
    leftovers.find((text) => !sameText(text, company)) ||
    "";
  const attrUrl = readAttr(el, "data-url") || readChildUrl(el, "[data-job-url]");
  const url = attrUrl || (href && href !== "#" ? href : "");
  const explicitId =
    readAttr(el, "data-id") ||
    el.querySelector("[data-id]")?.getAttribute("data-id")?.trim() ||
    "";
  const id = explicitId || `${title}-${index}`;

  return {
    id,
    title,
    department,
    location,
    url,
    company,
    category,
  };
}

function canonicalCategory(value: string): string {
  const label = value.trim().replace(/\s+/g, " ");
  if (!label) return "";
  if (CATEGORY_SUBTITLES[label]) return label;
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const target = normalize(label);
  const key = CATEGORY_ORDER.find((name) => normalize(name) === target);
  return key || "";
}

function subtitleFor(label: string): string {
  const key = canonicalCategory(label);
  return key ? CATEGORY_SUBTITLES[key] : "";
}

function isItem(el: HTMLElement): boolean {
  return (
    el.hasAttribute("data-title") ||
    el.hasAttribute("data-job-cms-item") ||
    el.classList.contains("w-dyn-item") ||
    el.getAttribute("role") === "listitem"
  );
}

function siblingItems(el: HTMLElement): HTMLElement[] {
  if (!isItem(el)) {
    const inner = itemsIn(el);
    return inner.length ? inner : [el];
  }
  const parent = el.parentElement;
  if (!parent) return [el];

  const siblings = Array.from(parent.children).filter((child): child is HTMLElement => {
    if (!(child instanceof HTMLElement)) return false;
    if (child.classList.contains("w-dyn-empty")) return false;
    return (child.textContent || "").trim().length > 0;
  });

  return siblings.length ? siblings : [el];
}

function outermost(nodes: HTMLElement[]): HTMLElement[] {
  return nodes.filter(
    (el) => !nodes.some((other) => other !== el && other.contains(el)),
  );
}

function itemsIn(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
}

function readCmsJobs(
  sourceSelector = DEFAULT_SOURCE,
  anchor?: HTMLElement | null,
): CmsJob[] {
  const scoped: HTMLElement[] = [];
  const page: HTMLElement[] = [];

  if (anchor) {
    const rootNode = anchor.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      rootNode.querySelectorAll("slot").forEach((slot) => {
        if (!(slot instanceof HTMLSlotElement)) return;
        slot.assignedElements({ flatten: true }).forEach((el) => {
          if (!(el instanceof HTMLElement)) return;
          scoped.push(...itemsIn(el));
          if (el.matches(ITEM_SELECTOR)) scoped.push(el);
        });
      });
      scoped.push(...itemsIn(rootNode.host));
    }
  }

  document.querySelectorAll<HTMLElement>(sourceSelector).forEach((el) => {
    page.push(el);
  });
  document.querySelectorAll<HTMLElement>("[data-title], [data-job-cms-item]").forEach((el) => {
    page.push(el);
  });

  const jobs: CmsJob[] = [];
  const items = outermost(
    Array.from(new Set([...scoped, ...page].flatMap(siblingItems))),
  );
  items.forEach((el, index) => {
    const job = parseItem(el, index);
    if (job) jobs.push(job);
  });

  return jobs;
}

const buildJobUrl = (url: string): string => {
  if (!url) return "";
  try {
    const jobUrl = new URL(url, window.location.href);
    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.forEach((value, key) => {
      if (key.toLowerCase().startsWith("utm_")) {
        jobUrl.searchParams.set(key, value);
      }
    });
    return jobUrl.toString();
  } catch {
    return url;
  }
};

/** Different spellings of one city, keyed by lowercase name. */
const CITY_ALIASES: Record<string, string> = {
  "new york city": "New York",
  nyc: "New York",
};

/** State codes ("MA", "D.C.") and country names, which aren't cities. */
const isRegion = (part: string): boolean => {
  const text = part.replace(/\./g, "");
  return /^[A-Z]{2}$/.test(text) || /^(usa|united states)$/i.test(text);
};

/** The cities in a location field: "Boston, MA; NYC" -> Boston, New York. */
const jobCities = (location: string): string[] =>
  location
    .split(/[,;|/]/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part && !isRegion(part))
    .map((part) => CITY_ALIASES[part.toLowerCase()] || part);

/** Each city once, ignoring case, in alphabetical order. */
const uniqueCities = (jobs: CmsJob[]): string[] => {
  const cities = new Map<string, string>();
  jobs.flatMap((job) => jobCities(job.location)).forEach((city) => {
    const key = city.toLowerCase();
    if (!cities.has(key)) cities.set(key, city);
  });
  return Array.from(cities.values()).sort((a, b) => a.localeCompare(b));
};

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <title>Collapse</title>
    <path
      d="M5 12H19"
      stroke="#0E0D0C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <title>Expand</title>
    <path
      d="M5 12H19"
      stroke="#A9A8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 5V19"
      stroke="#A9A8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <title>Search</title>
    <path
      d="M21.0002 21.0002L16.6602 16.6602"
      stroke="#A9A8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke="#A9A8A6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SelectChevron = () => (
  <span className="custom-select-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <title>Toggle dropdown</title>
      <path
        d="M6 9L12 15L18 9"
        stroke="#A9A8A6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/** Company names stay on the job row. The accordion title is the category. */
const groupLabel = (job: CmsJob): string =>
  canonicalCategory(job.category) ||
  job.category.trim() ||
  canonicalCategory(job.department) ||
  "Other";

const companyLabel = (job: CmsJob): string => {
  if (job.company) return job.company;
  if (canonicalCategory(job.department)) return "";
  return job.department;
};

interface DepartmentAccordionProps {
  department: string;
  subtitle?: string;
  jobs: CmsJob[];
  isOpen: boolean;
  onToggle: (dept: string) => void;
}

const DepartmentAccordion = ({
  department,
  subtitle,
  jobs,
  isOpen,
  onToggle,
}: DepartmentAccordionProps) => {
  return (
    <div className={`department-group${isOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="department-title"
        aria-expanded={isOpen}
        onClick={() => onToggle(department)}
      >
        <span className="department-heading">
          <span className="department-name">{department}</span>
          {subtitle ? (
            <span className="department-subtitle">{subtitle}</span>
          ) : null}
        </span>
        <span className="department-meta">
          <span className="department-count">{jobs.length}</span>
          <span className="department-chevron" aria-hidden="true">
            {isOpen ? <MinusIcon /> : <PlusIcon />}
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="department-jobs">
          {jobs.map((job) => {
            const href = buildJobUrl(job.url);
            const content = (
              <div className="job-item-content">
                <div className="name-location-wrapper">
                  <p className="job-item-name">
                    {job.title}
                    {companyLabel(job) ? (
                      <>
                        {job.title.trimEnd().endsWith(",") ? " " : ", "}
                        <span className="job-item-company">
                          {companyLabel(job)}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="job-item-location">{job.location}</p>
                </div>
              </div>
            );

            if (!href) {
              return (
                <div key={job.id} className="job-item">
                  {content}
                </div>
              );
            }

            return (
              <a
                key={job.id}
                className="job-item"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-careers-job-click="true"
              >
                {content}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function JobListingSectionCMS({
  jobs,
  sourceSelector = DEFAULT_SOURCE,
  singleOpen = false,
  engineeringOnly = false,
}: JobListingSectionCMSProps) {
  const [allJobs, setAllJobs] = useState<CmsJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedLoc, setSelectedLoc] = useState("");
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(
    new Set(),
  );
  const [ready, setReady] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stopped = false;
    let lastSignature = "";
    const cleanups: Array<() => void> = [];

    const publish = () => {
      if (stopped) return;
      const merged = mergeJobs(
        listCmsJobs(),
        readCmsJobs(sourceSelector, slotRef.current),
      );
      // Only re-render when the job data actually changed. Otherwise our own
      // DOM updates trigger the MutationObserver and loop forever.
      const signature = JSON.stringify(merged);
      if (signature === lastSignature) return;
      lastSignature = signature;
      setAllJobs(merged);
      if (merged.length) setReady(true);
    };

    publish();
    window.addEventListener(CMS_JOBS_CHANGE_EVENT, publish);

    const rootNode = slotRef.current?.getRootNode();
    const host =
      rootNode instanceof ShadowRoot ? rootNode.host : document.body;
    const observer = new MutationObserver(() => publish());
    observer.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const slots =
      rootNode instanceof ShadowRoot
        ? rootNode.querySelectorAll("slot")
        : [];
    slots.forEach((slot) => {
      slot.addEventListener("slotchange", publish);
      cleanups.push(() => slot.removeEventListener("slotchange", publish));
    });

    const timeout = window.setTimeout(() => {
      if (stopped) return;
      publish();
      setReady(true);
    }, 2500);

    return () => {
      stopped = true;
      window.removeEventListener(CMS_JOBS_CHANGE_EVENT, publish);
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      window.clearTimeout(timeout);
    };
  }, [sourceSelector, jobs]);

  const handleToggle = (dept: string) => {
    setOpenDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        if (singleOpen) next.clear();
        next.add(dept);
      }
      return next;
    });
  };

  const visibleJobs = engineeringOnly
    ? allJobs.filter((job) => isFocusedDept(job.department))
    : allJobs;

  const filteredJobs = visibleJobs.filter((job) => {
    const title = job.title.toLowerCase();
    const group = groupLabel(job);
    const loc = job.location.toLowerCase();
    const company = companyLabel(job).toLowerCase();
    const subtitle = subtitleFor(group).toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !q ||
      title.includes(q) ||
      group.toLowerCase().includes(q) ||
      subtitle.includes(q) ||
      loc.includes(q) ||
      company.includes(q) ||
      job.department.toLowerCase().includes(q);

    const matchesFunction = !selectedFunction || group === selectedFunction;
    const matchesCompany =
      !selectedCompany || companyLabel(job) === selectedCompany;
    const matchesLoc =
      !selectedLoc ||
      jobCities(job.location).some((city) => sameText(city, selectedLoc));

    return matchesSearch && matchesFunction && matchesCompany && matchesLoc;
  });

  const grouped: Record<string, CmsJob[]> = {};
  filteredJobs.forEach((job) => {
    const dept = groupLabel(job);
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(job);
  });
  const sortedDepts = Object.keys(grouped).sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const functions = Array.from(
    new Set(visibleJobs.map((job) => groupLabel(job))),
  ).sort();

  const companies = Array.from(
    new Set(visibleJobs.map((job) => companyLabel(job)).filter(Boolean)),
  ).sort();

  const locationOptions = uniqueCities(visibleJobs);

  return (
    <div className="job-listing-wrapper job-listing-cms">
      <div ref={slotRef} className="job-cms-slot">
        {jobs}
      </div>
      <div className="filters-wrapper">
        <div className="search-input-wrapper">
          <SearchIcon />
          <label htmlFor="job-cms-search" className="sr-only">
            Search jobs
          </label>
          <input
            id="job-cms-search"
            className="search-input"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="select-wrapper">
          <label htmlFor="job-cms-function-filter" className="sr-only">
            Function
          </label>
          <select
            id="job-cms-function-filter"
            className="filters-select"
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(e.target.value)}
          >
            <option value="">All Functions</option>
            {functions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>

        <div className="select-wrapper">
          <label htmlFor="job-cms-company-filter" className="sr-only">
            Company
          </label>
          <select
            id="job-cms-company-filter"
            className="filters-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>

        <div className="select-wrapper">
          <label htmlFor="job-cms-location-filter" className="sr-only">
            Location
          </label>
          <select
            id="job-cms-location-filter"
            className="filters-select"
            value={selectedLoc}
            onChange={(e) => setSelectedLoc(e.target.value)}
          >
            <option value="">All Locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>

      <div className="collection-list">
        {!ready && <p style={{ color: "#515152" }}>Loading jobs…</p>}
        {ready && visibleJobs.length === 0 && (
          <p style={{ color: "#515152" }}>No open roles right now.</p>
        )}
        {ready && visibleJobs.length > 0 && sortedDepts.length === 0 && (
          <p style={{ color: "#515152" }}>No jobs match your search.</p>
        )}
        {sortedDepts.map((dept) => (
          <DepartmentAccordion
            key={dept}
            department={dept}
            subtitle={subtitleFor(dept)}
            jobs={grouped[dept]}
            isOpen={openDepartments.has(dept)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
