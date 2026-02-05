/** Format date and time for appointment display */
export function formatAppointmentDisplay(dateStr, timeStr) {
  if (!dateStr && !timeStr) return null;
  const parts = [];
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      parts.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    } catch {
      parts.push(dateStr);
    }
  }
  if (timeStr) {
    const t = String(timeStr).trim();
    if (t) parts.push(t.length <= 5 ? t : t.slice(0, 5));
  }
  return parts.length ? parts.join(', ') : null;
}
