import type { ProfileOptions } from "./profile-editor";
import { API_BASE } from "./reerhub";
import { sharedRead } from "./read-sharing";
let catalog: ProfileOptions | undefined,
  checkedAt = 0;
// Revalidate after the public API's five-minute lifetime; don't extend it on reads.
export const readProfileOptions = () => {
  if (catalog && Date.now() - checkedAt < 300000)
    return Promise.resolve(catalog);
  return sharedRead("profile-options", async () => {
    const res = await fetch(`${API_BASE}/profile-options`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Could not load profile choices.");
    const json = await res.json();
    if (!json.data?.tracks || !json.data?.skills || !json.data?.cities)
      throw new Error("Profile choices are unavailable.");
    // A version change replaces the entire catalog; no mixed-version choices.
    catalog = json.data;
    checkedAt = Date.now();
    return catalog!;
  });
};
