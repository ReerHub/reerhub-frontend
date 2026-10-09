// Share only in-flight reads, never persist private response data here.
const pending = new Map<string, Promise<unknown>>();
export const clearSharedReads = () => pending.clear();
export function sharedRead<T>(key: string, load: () => Promise<T>): Promise<T> {
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;
  const promise = load().finally(() => {
    if (pending.get(key) === promise) pending.delete(key);
  });
  pending.set(key, promise);
  return promise;
}
let config: Promise<Record<string, string>> | undefined;
export const publicConfig = () =>
  (config ||= fetch("/api/config")
    .then(async (res) => {
      if (!res.ok) throw new Error("Could not load sign-in configuration");
      return res.json();
    })
    .catch((error) => {
      config = undefined;
      throw error;
    }));
