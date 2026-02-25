const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Get date range from overview date filter string (YYYY-MM-DD).
 * Returns { start, end } as Date or null if no filter.
 */
export function getDateRangeFromFilter(overviewDateFilter) {
  if (!overviewDateFilter) return null;
  const selectedDate = new Date(overviewDateFilter);
  if (isNaN(selectedDate.getTime())) return null;
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  return { start: startOfDay, end: endDate };
}

export function getCalendarDaysRemaining(targetDate) {
  if (!targetDate || isNaN(targetDate.getTime())) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  if (endDay < today) return 0;
  const diffTime = endDay - today;
  return Math.max(0, Math.round(diffTime / MS_IN_DAY));
}

function inRange(d, start, end) {
  return d && !isNaN(d.getTime()) && d >= start && d <= end;
}

export function filterLeadsByDate(leads, dateRange) {
  if (!dateRange || !Array.isArray(leads)) return leads;
  return leads.filter((lead) => {
    if (!lead.created_at) return false;
    const leadDate = new Date(lead.created_at);
    return inRange(leadDate, dateRange.start, dateRange.end);
  });
}

export function filterPaymentsByDate(payments, dateRange) {
  if (!dateRange || !Array.isArray(payments)) return payments;
  return payments.filter((p) => {
    const paymentDate = p.payment_date ? new Date(p.payment_date) : p.created_at ? new Date(p.created_at) : null;
    return paymentDate ? inRange(paymentDate, dateRange.start, dateRange.end) : false;
  });
}

export function filterQuotationsByDate(quotations, dateRange) {
  if (!dateRange || !Array.isArray(quotations)) return quotations;
  return quotations.filter((q) => {
    const quoteDate = q.quotation_date ? new Date(q.quotation_date) : q.created_at ? new Date(q.created_at) : null;
    return quoteDate ? inRange(quoteDate, dateRange.start, dateRange.end) : false;
  });
}
