export function formatCompact(num) {
  const n = Number(num);
  if (isNaN(n)) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toFixed(2);
}

export function formatCr(num) {
  const n = Number(num);
  if (isNaN(n)) return '₹0';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  return `₹${n.toLocaleString('en-IN')}`;
}
