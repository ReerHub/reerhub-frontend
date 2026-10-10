"use client";

import { useId, useRef, useState } from "react";
import type { Company, TechTrack } from "@/lib/reerhub";
import { TECH_TRACKS } from "@/lib/reerhub";
import Icon from "@/components/ui/Icon";
import styles from "./SearchFilters.module.css";

export type Filters = {
  q: string;
  companyId: string;
  city: string;
  remoteType: string;
  techTrack: "" | TechTrack;
  techRole: string;
  skills: string;
  seniority: string;
  employmentType: string;
  sort: string;
  indiaOnly: boolean;
};

const secondaryKeys = [
  "techTrack",
  "companyId",
  "remoteType",
  "techRole",
  "skills",
  "seniority",
  "employmentType",
  "sort",
  "indiaOnly",
] as const;
function secondaryFilters(filters: Filters) {
  return Object.fromEntries(
    secondaryKeys.map((key) => [key, filters[key]]),
  ) as Pick<Filters, (typeof secondaryKeys)[number]>;
}
const modes = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

export default function SearchFilters({
  filters,
  companies,
  onChange,
  onSubmit,
  onClear,
}: {
  filters: Filters;
  companies: Company[];
  onChange: (patch: Partial<Filters>) => void;
  onSubmit: (patch?: Partial<Filters>) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => secondaryFilters(filters));
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const chips: {
    key: keyof Filters;
    label: string;
    reset: Partial<Filters>;
  }[] = [];
  const add = (key: keyof Filters, label: string) => {
    if (filters[key]) chips.push({ key, label, reset: { [key]: "" } });
  };
  add("q", `Search: ${filters.q}`);
  add("city", `City: ${filters.city}`);
  add(
    "techTrack",
    `Track: ${TECH_TRACKS.find((track) => track.value === filters.techTrack)?.label || filters.techTrack}`,
  );
  add(
    "companyId",
    `Company: ${companies.find((company) => company._id === filters.companyId)?.name || "Selected company"}`,
  );
  add(
    "remoteType",
    `Work mode: ${modes.find((mode) => mode.value === filters.remoteType)?.label || filters.remoteType}`,
  );
  add("techRole", `Role: ${filters.techRole}`);
  add("skills", `Skills: ${filters.skills}`);
  add("seniority", `Level: ${filters.seniority}`);
  add("employmentType", `Employment: ${filters.employmentType}`);
  add("sort", "Sort: Title A–Z");
  if (!filters.indiaOnly)
    chips.push({
      key: "indiaOnly",
      label: "Including international roles",
      reset: { indiaOnly: true },
    });
  const count = chips.filter((chip) =>
    secondaryKeys.some((key) => key === chip.key),
  ).length;
  function close() {
    setOpen(false);
    toggle.current?.focus();
  }
  function change<K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K],
  ) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  return (
    <section
      className={`search-filters surface-panel ${styles.shell}`}
      aria-label="Find jobs"
    >
      <form
        className={styles.search}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className={styles.searchField}>
          <span className="sr-only">Search engineering and AI roles</span>
          <Icon name="search" />
          <input
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value })}
            placeholder="Job title, skill or keyword"
          />
        </label>
        <label className={styles.searchField}>
          <span className="sr-only">Location</span>
          <Icon name="pin" />
          <input
            value={filters.city}
            onChange={(event) => onChange({ city: event.target.value })}
            placeholder="Any city"
          />
        </label>
        <button type="submit" className={styles.primary}>
          Search jobs <Icon name="arrow" />
        </button>
      </form>
      <div className={styles.toolbar}>
        <button
          ref={toggle}
          type="button"
          className={styles.filterButton}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (open) close();
            else {
              setDraft(secondaryFilters(filters));
              setOpen(true);
            }
          }}
        >
          <Icon name="sliders" /> Filters{" "}
          {count > 0 && <span className={styles.count}>{count}</span>}
          <Icon
            name="chevron"
            className={open ? styles.chevronOpen : styles.chevron}
          />
        </button>
        <p className={styles.scope}>
          {filters.indiaOnly ? "India roles" : "India & international roles"}
          <span aria-hidden="true"> · </span>
          {filters.sort === "az" ? "Title A–Z" : "Newest first"}
        </p>
      </div>
      {chips.length > 0 && (
        <div className={styles.active} aria-label="Active search filters">
          <ul>
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-label={`Remove ${chip.label}`}
                  onClick={() => {
                    onSubmit(chip.reset);
                    if (secondaryKeys.some((key) => key === chip.key)) {
                      setDraft((previous) => ({
                        ...previous,
                        [chip.key]: chip.key === "indiaOnly" ? true : "",
                      }));
                    }
                  }}
                >
                  <span>{chip.label}</span>
                  <Icon name="close" className={styles.closeIcon} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              onClear();
              close();
            }}
          >
            Clear all
          </button>
        </div>
      )}
      <div
        id={panelId}
        hidden={!open}
        className={styles.panel}
        role="region"
        aria-label="Job filters"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      >
        <div className={styles.panelHeading}>
          <div>
            <h3>Narrow your search</h3>
            <p>Choose what matters. Leave the rest open.</p>
          </div>
          <button
            type="button"
            className={styles.dismiss}
            aria-label="Close filters without applying"
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(draft);
            close();
          }}
        >
          <div className={styles.grid}>
            <label>
              Engineering track
              <select
                value={draft.techTrack}
                onChange={(event) =>
                  change(
                    "techTrack",
                    event.target.value as Filters["techTrack"],
                  )
                }
              >
                <option value="">All tracks</option>
                {TECH_TRACKS.map((track) => (
                  <option key={track.value} value={track.value}>
                    {track.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Company
              <select
                value={draft.companyId}
                onChange={(event) => change("companyId", event.target.value)}
              >
                <option value="">All companies</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                    {typeof company.activeJobs === "number"
                      ? ` (${company.activeJobs} open)`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Work mode
              <select
                value={draft.remoteType}
                onChange={(event) => change("remoteType", event.target.value)}
              >
                <option value="">Any work mode</option>
                {modes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Role title
              <input
                value={draft.techRole}
                onChange={(event) => change("techRole", event.target.value)}
                placeholder="e.g. Backend Engineer"
              />
            </label>
            <label>
              Skills
              <input
                value={draft.skills}
                onChange={(event) => change("skills", event.target.value)}
                placeholder="e.g. React, Python"
              />
            </label>
            <label>
              Career level
              <select
                value={draft.seniority}
                onChange={(event) => change("seniority", event.target.value)}
              >
                <option value="">Any level</option>
                {[
                  "Intern",
                  "Junior",
                  "Mid",
                  "Senior",
                  "Lead",
                  "Staff",
                  "Principal",
                  "Director",
                  "VP",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Employment type
              <select
                value={draft.employmentType}
                onChange={(event) =>
                  change("employmentType", event.target.value)
                }
              >
                <option value="">Any employment</option>
                {["Full-time", "Part-time", "Contract", "Internship"].map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Sort results
              <select
                value={draft.sort}
                onChange={(event) => change("sort", event.target.value)}
              >
                <option value="">Newest first</option>
                <option value="az">Title A–Z</option>
              </select>
            </label>
          </div>
          <div className={styles.panelFooter}>
            <label className={styles.india}>
              <input
                type="checkbox"
                checked={draft.indiaOnly}
                onChange={(event) => change("indiaOnly", event.target.checked)}
              />
              India roles only
            </label>
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={close}>
                Cancel
              </button>
              <button type="submit" className={styles.primary}>
                Apply filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
