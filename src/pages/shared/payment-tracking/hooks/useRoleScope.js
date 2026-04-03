import { useState, useMemo } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import {
  normalizeRole,
  isPaymentTrackingSuperAdmin,
  isPaymentTrackingSalesHead,
  userCanDeletePaymentTracking,
} from '../utils/paymentTrackingRoles';

const ROLES = {
  SALESPERSON: 'salesperson',
  DEPARTMENT_USER: 'department_user',
};

/**
 * Role and scope for payment tracking. Drives column visibility and data filtering.
 * Salesperson column hidden for salesperson/department_user; shown for super_admin and department_head.
 */
export function useRoleScope() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [salespersonFilter, setSalespersonFilter] = useState('');

  const isSalesperson = role === ROLES.SALESPERSON || role === ROLES.DEPARTMENT_USER;
  const isSuperAdmin = isPaymentTrackingSuperAdmin(user?.role);
  const isSalesHead = isPaymentTrackingSalesHead(user?.role, user?.departmentType);
  const canDeletePaymentTracking = userCanDeletePaymentTracking(user);
  const showSalespersonColumn = !isSalesperson;
  const showSalespersonFilter = isSalesHead || isSuperAdmin;

  return useMemo(
    () => ({
      role,
      isSalesperson,
      isSalesHead,
      isSuperAdmin,
      canDeletePaymentTracking,
      showSalespersonColumn,
      showSalespersonFilter,
      salespersonFilter,
      setSalespersonFilter,
      userId: user?.id,
    }),
    [
      role,
      isSalesperson,
      isSalesHead,
      isSuperAdmin,
      canDeletePaymentTracking,
      showSalespersonColumn,
      showSalespersonFilter,
      salespersonFilter,
      user?.id,
    ]
  );
}
