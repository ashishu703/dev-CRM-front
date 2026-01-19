const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Convert a date-like value to YYYY-MM-DD using LOCAL calendar values (no UTC shifting).
 * Accepts:
 * - Date
 * - "YYYY-MM-DD"
 * - ISO datetime strings (e.g. "2025-12-31T18:30:00.000Z")
 */
export function toDateOnly(value) {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  return null;
}

export function toDateOnlyOrEmpty(value) {
  return toDateOnly(value) || '';
}



