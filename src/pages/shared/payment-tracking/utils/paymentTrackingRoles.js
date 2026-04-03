/** Align with backend `canUserDeletePaymentTracking` (paymentRepository). */

export function normalizeRole(role) {
  return String(role || 'salesperson').toLowerCase().replace(/\s+/g, '_');
}

export function isPaymentTrackingSuperAdmin(role) {
  const r = normalizeRole(role);
  return r === 'super_admin' || r === 'superadmin';
}

export function isPaymentTrackingSalesHead(role, departmentType) {
  const r = normalizeRole(role);
  const dt = String(departmentType || '').toLowerCase();
  return (
    r === 'sales_head' ||
    r === 'sales_department_head' ||
    (r === 'department_head' && dt.includes('sales'))
  );
}

export function userCanDeletePaymentTracking(user) {
  if (!user) return false;
  return isPaymentTrackingSuperAdmin(user.role) || isPaymentTrackingSalesHead(user.role, user.departmentType);
}
