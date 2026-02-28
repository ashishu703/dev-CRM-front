export function formatCompact(num) {
  const n = Number(num);
  if (isNaN(n)) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toFixed(2);
}

/** INR with Cr/L/K shorthand (dashboard standard) */
export function formatCr(num) {
  const n = Number(num);
  if (!Number.isFinite(n)) return '₹0';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

/** Alias for dashboard currency (same as formatCr) */
export function formatAmountINR(num) {
  return formatCr(num);
}

/** L/K only (e.g. payment aging) */
export function formatLac(num) {
  const n = Number(num);
  if (!Number.isFinite(n) || n === 0) return '₹0';
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

/** Alias: currency (INR Cr/L/K) */
export function formatCurrency(val) {
  return formatCr(val);
}

/** Percent: 0–100 number to "X%" */
export function formatPercent(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return '—';
  return `${Number(n).toFixed(1)}%`;
}
