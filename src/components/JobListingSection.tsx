import { useEffect, useRef, useState } from "react";
import "./JobListingSection.css";

interface Job {
  id: string;
  title: string;
  departmentName?: string;
  externalLink?: string;
  locationIds: {
    primaryLocationId: string;
    secondaryLocationIds?: string[];
  };
}

interface LocationsMap {
  [id: string]: string;
}

interface JobListingSectionProps {
  apiUrl?: string;
  singleOpen?: boolean;
}

const JOBS_API =
  "https://nodejs-serverless-function-express-blush-two.vercel.app/api/jobs";

const getLocationNames = (job: Job, locationsMap: LocationsMap): string => {
  const names: string[] = [];
  const primary = locationsMap[job.locationIds.primaryLocationId];
  if (primary) names.push(primary);
  (job.locationIds.secondaryLocationIds || []).forEach((id) => {
    const secondary = locationsMap[id];
    if (secondary && !names.includes(secondary)) names.push(secondary);
  });
  return names.join(", ");
};

const buildJobUrl = (job: Job): string => {
  const base = job.externalLink || `https://jobs.ashbyhq.com/eliseai/${job.id}`;
  try {
    const jobUrl = new URL(base);
    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.forEach((value, key) => {
      if (key.toLowerCase().startsWith("utm_")) {
        jobUrl.searchParams.set(key, value);
      }
    });
    return jobUrl.toString();
  } catch {
    return base;
  }
};

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
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
  >
    <path
      d="M5 12H19"
      stroke="#7A7977"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 5V19"
      stroke="#7A7977"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#838385"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SelectChevron = () => (
  <span className="custom-select-icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#838385"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
);

interface DepartmentAccordionProps {
  department: string;
  jobs: Job[];
  locationsMap: LocationsMap;
  singleOpen: boolean;
  isOpen: boolean;
  onToggle: (dept: string) => void;
}

const DepartmentAccordion = ({
  department,
  jobs,
  locationsMap,
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
          {jobs.map((job) => (
            <a
              key={job.id}
              className="job-item"
              href={buildJobUrl(job)}
              target="_blank"
              rel="noopener noreferrer"
              data-careers-job-click="true"
            >
              <div className="job-item-content">
                <div className="name-location-wrapper">
                  <p className="job-item-name">{job.title}</p>
                  <p className="job-item-location">
                    {getLocationNames(job, locationsMap)}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default function JobListingSection({
  apiUrl = JOBS_API,
  singleOpen = false,
}: JobListingSectionProps) {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [locationsMap, setLocationsMap] = useState<LocationsMap>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLoc, setSelectedLoc] = useState("");
  const [openDepartments, setOpenDepartments] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const openDeptRef = useRef(openDepartments);
  openDeptRef.current = openDepartments;

  useEffect(() => {
    fetch(apiUrl, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.jobs && data?.locations) {
          const lMap: LocationsMap = {};
          data.locations.forEach((loc: { id: string; name: string }) => {
            lMap[loc.id] = loc.name;
          });
          setLocationsMap(lMap);
          setAllJobs(data.jobs);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [apiUrl]);

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

  const filteredJobs = allJobs.filter((job) => {
    const title = job.title.toLowerCase();
    const dept = job.departmentName || "Other";
    const loc = getLocationNames(job, locationsMap).toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !q ||
      title.includes(q) ||
      dept.toLowerCase().includes(q) ||
      loc.includes(q);

    const matchesDept = !selectedDept || dept === selectedDept;
    const matchesLoc = !selectedLoc || loc.includes(selectedLoc.toLowerCase());

    return matchesSearch && matchesDept && matchesLoc;
  });

  const grouped: Record<string, Job[]> = {};
  filteredJobs.forEach((job) => {
    const dept = job.departmentName || "Other";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(job);
  });
  const sortedDepts = Object.keys(grouped).sort();

  const departments = Array.from(
    new Set(allJobs.map((j) => j.departmentName || "Other")),
  ).sort();

  const locationOptions = Array.from(
    new Set(
      allJobs.flatMap((job) =>
        getLocationNames(job, locationsMap)
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      ),
    ),
  ).sort();

  return (
    <div className="job-listing-wrapper">
      <div className="filters-wrapper">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input
            id="job-search"
            className="search-input"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="select-wrapper">
          <select
            id="department-filter"
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
          <select
            id="location-filter"
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
        {loading && <p style={{ color: "#515152" }}>Loading jobs…</p>}
        {error && (
          <p style={{ color: "#515152" }}>
            Failed to load jobs. Please try again.
          </p>
        )}
        {!loading && !error && sortedDepts.length === 0 && (
          <p style={{ color: "#515152" }}>No jobs match your search.</p>
        )}
        {sortedDepts.map((dept) => (
          <DepartmentAccordion
            key={dept}
            department={dept}
            jobs={grouped[dept]}
            locationsMap={locationsMap}
            singleOpen={singleOpen}
            isOpen={openDepartments.has(dept)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
