export const SALES_STATUS = {
  WIN_CLOSED: 'win/closed',
  PENDING: 'pending',
  RUNNING: 'running',
  CONVERTED: 'converted',
  INTERESTED: 'interested',
  CLOSED: 'closed',
  LOST: 'lost',
};

export function mapSalesStatusToBucket(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'converted' || s === 'win lead') return 'converted';
  if (s === 'pending') return 'not-connected';
  if (s === 'running' || s === 'interested') return 'connected';
  if (s === 'lost/closed') return 'closed';
  return 'not-connected';
}
