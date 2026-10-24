/** Content-free hints only: every recipient verifies the shared HTTP-only session. */
const channelName = "reerhub-session-check";
const storageKey = "reerhub-session-check";
let source: string | undefined;
const sender = () => (source ||= crypto.randomUUID());

export function notifySessionChange() {
  const message = { type: "check-session", source: sender() };
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage(message);
    channel.close();
  } else {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...message, nonce: crypto.randomUUID() }),
      );
      localStorage.removeItem(storageKey);
    } catch {
      /* A blocked storage mechanism never blocks authentication. */
    }
  }
}

export function subscribeSessionChange(check: () => void) {
  const receive = (value: unknown) => {
    if (
      value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "check-session" &&
      "source" in value &&
      value.source !== sender()
    )
      check();
  };
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event) => receive(event.data);
    return () => channel.close();
  }
  const storage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) return;
    try {
      receive(JSON.parse(event.newValue));
    } catch {
      /* Ignore unrelated invalid hints. */
    }
  };
  window.addEventListener("storage", storage);
  return () => window.removeEventListener("storage", storage);
}
