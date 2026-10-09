"use client";

import { useEffect, useRef, useState } from "react";
import {
  searchOptions,
  selectOption,
  type CatalogOption,
} from "@/lib/profile-editor";
import styles from "@/app/profile/Profile.module.css";

// Native checkbox choices retain expected Tab/Space behavior; search never commits
// free text or silently chooses a result.
export default function ProfileOptionPicker({
  id,
  label,
  options,
  values,
  limit,
  onChange,
  error,
  suggestions = [],
}: {
  id: string;
  label: string;
  options: CatalogOption[];
  values: string[];
  limit: number;
  onChange: (values: string[]) => void;
  error?: string;
  suggestions?: string[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const suppressFocusOpen = useRef(false);
  const results = searchOptions(options, query).sort((a, b) => {
    if (query.trim()) return 0;
    const priority = (value: string) =>
      values.includes(value) ? 0 : suggestions.includes(value) ? 1 : 2;
    return priority(a.value) - priority(b.value);
  });
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function showOptions() {
    const rect = search.current?.getBoundingClientRect();
    if (rect)
      setAbove(
        window.innerHeight - rect.bottom < 250 &&
          rect.top > window.innerHeight - rect.bottom,
      );
    setOpen(true);
  }
  function closeOptions() {
    setOpen(false);
    if (document.activeElement !== search.current) {
      suppressFocusOpen.current = true;
      search.current?.focus();
    }
  }
  function toggle(value: string) {
    if (values.includes(value))
      onChange(values.filter((current) => current !== value));
    else {
      const result = selectOption(values, value, options, limit);
      if (!result.error) onChange(result.values);
    }
  }
  return (
    <div className={styles.field}>
      <div className={styles.skillsLabel}>
        <label htmlFor={id}>{label}</label>
        <span aria-live="polite">
          {values.length} / {limit}
        </span>
      </div>
      {values.length > 0 && (
        <ul
          className={styles.chips}
          aria-label={`Selected ${label.toLowerCase()}`}
        >
          {values.map((value) => (
            <li key={value}>
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => toggle(value)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        ref={container}
        className={styles.picker}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closeOptions();
          }
        }}
      >
        <div className={styles.pickerInput}>
          <input
            ref={search}
            id={id}
            type="search"
            value={query}
            placeholder={`Search ${label.toLowerCase()}`}
            autoComplete="off"
            aria-controls={open ? `${id}-options` : undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-hint${error ? ` error-${id}` : ""}`}
            onFocus={() => {
              if (suppressFocusOpen.current) suppressFocusOpen.current = false;
              else showOptions();
            }}
            onClick={() => {
              if (!open) showOptions();
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              showOptions();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                showOptions();
              }
            }}
          />
          <button
            type="button"
            className={styles.pickerToggle}
            aria-label={`${open ? "Close" : "Browse"} ${label.toLowerCase()}`}
            aria-expanded={open}
            aria-controls={open ? `${id}-options` : undefined}
            onClick={() => (open ? closeOptions() : showOptions())}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d={open ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {open && (
          <div
            className={`${styles.optionPanel} ${above ? styles.optionPanelAbove : ""}`}
            id={`${id}-options`}
          >
            <div className={styles.optionPanelHeader}>
              <span>{results.length} options</span>
              <button type="button" onClick={closeOptions}>
                Done
              </button>
            </div>
            <div
              className={styles.optionList}
              role="group"
              aria-label={`Available ${label.toLowerCase()}`}
            >
              {results.map((option) => (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    checked={values.includes(option.value)}
                    disabled={
                      !values.includes(option.value) && values.length >= limit
                    }
                    onChange={() => toggle(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
              {!results.length && (
                <p role="status">
                  No options found. Try another name or abbreviation.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <p id={`${id}-hint`}>
        Select up to {limit}.{" "}
        {values.length >= limit
          ? "Limit reached—remove one to add another."
          : "Search, then select from the list."}
      </p>
      {error && (
        <p className={styles.error} id={`error-${id}`} role="alert">
          {error}
        </p>
      )}
      {suggestions.some((value) => !values.includes(value)) && (
        <div className={styles.suggestions}>
          <span>Suggestions for your track · select only what you know</span>
          <div>
            {suggestions
              .filter((value) => !values.includes(value))
              .map((value) => (
                <button
                  type="button"
                  key={value}
                  disabled={values.length >= limit}
                  onClick={() => toggle(value)}
                >
                  + {value}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
