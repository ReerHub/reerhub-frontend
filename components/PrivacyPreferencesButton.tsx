"use client";

import { OPEN_PRIVACY_EVENT } from "@/lib/consent";

export default function PrivacyPreferencesButton() {
  return (
    <button
      type="button"
      data-privacy-preferences
      onClick={(event) => {
        window.dispatchEvent(
          new CustomEvent(OPEN_PRIVACY_EVENT, {
            detail: { opener: event.currentTarget },
          }),
        );
      }}
    >
      Privacy preferences
    </button>
  );
}
