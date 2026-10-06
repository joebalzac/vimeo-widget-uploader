import { useEffect, useRef, useState, type ReactNode } from "react";
import "./JobListingSection.css";
import {
  CMS_JOBS_CHANGE_EVENT,
  listCmsJobs,
  type CmsJob,
} from "./jobCmsRegistry";

/**
 * Drop the Jobs Collection List into the Jobs slot. Each Collection Item
 * should contain the job title, company, department, and location text, plus a
 * link for the apply URL. Custom attributes on the item are used when present.
 */

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

function mergeJobs(primary: CmsJob[], secondary: CmsJob[]): CmsJob[] {
  const map = new Map<string, CmsJob>();
  secondary.forEach((job) => map.set(job.id, job));
  primary.forEach((job) => map.set(job.id, job));
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

function parseItem(el: HTMLElement, index: number): CmsJob | null {
  const texts = leafTexts(el);
  const href = (el.querySelector("a")?.getAttribute("href") || "").trim();
  const title =
    readAttr(el, "data-title") ||
    readChildText(el, "[data-job-title]") ||
    texts[0] ||
    "";
  if (!title) return null;

  const department =
    readAttr(el, "data-department") ||
    readChildText(el, "[data-job-department]") ||
    (texts[0] === title ? texts[1] : texts[0]) ||
    "";
  const location =
    readAttr(el, "data-location") ||
    readChildText(el, "[data-job-location]") ||
    texts[texts[0] === title ? 2 : 1] ||
    "";
  const company =
    readAttr(el, "data-company") ||
    readChildText(el, "[data-job-company]") ||
    "";
  const attrUrl = readAttr(el, "data-url") || readChildUrl(el, "[data-job-url]");
  const url = attrUrl || (href && href !== "#" ? href : "");
  const baseId =
    readAttr(el, "data-id") || readChildText(el, "[data-job-id]") || title;
  const id = `${baseId}-${index}`;

  return { id, title, department, location, url, company };
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

const locationParts = (location: string): string[] =>
  location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

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

interface DepartmentAccordionProps {
  department: string;
  jobs: CmsJob[];
  isOpen: boolean;
  onToggle: (dept: string) => void;
}

const DepartmentAccordion = ({
  department,
  jobs,
  isOpen,
  onToggle,
}: DepartmentAccordionProps) => {
  return (
    <div className={`${isOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="department-title"
        aria-expanded={isOpen}
        onClick={() => onToggle(department)}
      >
        <span className="department-name">{department}</span>
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
                    {job.company ? (
                      <>
                        {job.title.trimEnd().endsWith(",") ? " " : ", "}
                        <span className="job-item-company">{job.company}</span>
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
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLoc, setSelectedLoc] = useState("");
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(
    new Set(),
  );
  const [ready, setReady] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stopped = false;
    const cleanups: Array<() => void> = [];

    const publish = () => {
      if (stopped) return;
      const merged = mergeJobs(
        listCmsJobs(),
        readCmsJobs(sourceSelector, slotRef.current),
      );
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
    const dept = job.department || "Other";
    const loc = job.location.toLowerCase();
    const company = job.company.toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !q ||
      title.includes(q) ||
      dept.toLowerCase().includes(q) ||
      loc.includes(q) ||
      company.includes(q);

    const matchesDept = !selectedDept || dept === selectedDept;
    const matchesLoc =
      !selectedLoc || loc.includes(selectedLoc.toLowerCase());

    return matchesSearch && matchesDept && matchesLoc;
  });

  const grouped: Record<string, CmsJob[]> = {};
  filteredJobs.forEach((job) => {
    const dept = job.department || "Other";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(job);
  });
  const sortedDepts = Object.keys(grouped).sort();

  const departments = Array.from(
    new Set(visibleJobs.map((job) => job.department || "Other")),
  ).sort();

  const locationOptions = Array.from(
    new Set(visibleJobs.flatMap((job) => locationParts(job.location))),
  ).sort();

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
          <label htmlFor="job-cms-department-filter" className="sr-only">
            Department
          </label>
          <select
            id="job-cms-department-filter"
            className="filters-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
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
            jobs={grouped[dept]}
            isOpen={openDepartments.has(dept)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
