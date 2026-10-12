"use client";
import { useId } from "react";
import { locationScopeLabel, type LocationScope } from "@/lib/location-scope";

export default function LocationScopeControl({
  value,
  onChange,
}: {
  value: LocationScope;
  onChange: (value: LocationScope) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex min-w-0 flex-wrap items-center gap-2">
      <legend className="mb-2 text-xs font-semibold text-slate-600">
        Job locations
      </legend>
      {(["india", "international", "all"] as const).map((scope) => (
        <label key={scope} className="cursor-pointer">
          <input
            type="radio"
            className="peer sr-only"
            name={name}
            value={scope}
            checked={value === scope}
            onChange={() => onChange(scope)}
          />
          <span className="flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600">
            {locationScopeLabel(scope)}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
