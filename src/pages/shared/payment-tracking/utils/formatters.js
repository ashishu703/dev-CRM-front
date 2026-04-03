export function formatCurrencyINR(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}
