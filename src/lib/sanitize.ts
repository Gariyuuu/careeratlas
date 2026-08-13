const SENSITIVE_PATTERN = /\b(key|token|secret|password)\s*[:=]\s*[^\s&"']+/gi;
const MAX_LENGTH = 200;

/**
 * Defensive truncation/redaction for connector error and warning strings
 * before they render on /admin/data-status. No current provider interpolates
 * a key into an error message, but a future provider SDK change could leak
 * one via a raw fetch error or an unhandled response body.
 */
export function sanitizeErrorText(text: string | null | undefined): string | null {
  if (!text) return null;
  const redacted = text.replace(SENSITIVE_PATTERN, (_match, label: string) => `${label}=[redacted]`);
  return redacted.length > MAX_LENGTH ? `${redacted.slice(0, MAX_LENGTH)}…` : redacted;
}
