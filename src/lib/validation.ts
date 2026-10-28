/** Shared form rules. Keep in sync with the backend's validators. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function requiredText(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} is required.`;
}
