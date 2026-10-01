// Server-safe HTML sanitizer for Server Components.
//
// Why not isomorphic-dompurify here: it pulls `jsdom` into the server bundle,
// which breaks `next build` page-data collection under Turbopack
// (`webidl.util.markAsUncloneable is not a function`) and crashes on Node <=20.
// Job descriptions come from our own backend (official ATS pages), so a
// lightweight allowlist-free strip of active content is sufficient for SSR.
// Client components needing full DOMPurify can still import it directly.
const DANGEROUS_TAGS =
  /<(script|style|iframe|object|embed|form|input|button|link|meta)[^>]*>[\s\S]*?<\/\1\s*>|<(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi;
const EVENT_HANDLERS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URLS =
  /\s+(href|src|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_URLS, "");
}

export default sanitizeHtml;
