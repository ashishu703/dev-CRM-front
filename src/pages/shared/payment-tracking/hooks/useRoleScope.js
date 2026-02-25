import { useState, useMemo } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

const ROLES = {
  SALESPERSON: 'salesperson',
  DEPARTMENT_USER: 'department_user',
  SALES_HEAD: 'sales_head',
  SUPER_ADMIN: 'super_admin',
};

/**
 * Role and scope for payment tracking. Drives column visibility and data filtering.
 * Salesperson column hidden for salesperson/department_user; shown for super_admin and department_head.
 */
export function useRoleScope() {
  const { user } = useAuth();
  const role = (user?.role || 'salesperson').toLowerCase().replace(/\s+/g, '_');
  const [salespersonFilter, setSalespersonFilter] = useState('');

  const isSalesperson = role === ROLES.SALESPERSON || role === ROLES.DEPARTMENT_USER;
  const isSalesHead = role === ROLES.SALES_HEAD || role === 'department_head' || role === 'sales_department_head';
  const isSuperAdmin = role === ROLES.SUPER_ADMIN || role === 'superadmin';
  const showSalespersonColumn = !isSalesperson;
  const showSalespersonFilter = isSalesHead || isSuperAdmin;

  return useMemo(
    () => ({
      role,
      isSalesperson,
      isSalesHead,
      isSuperAdmin,
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
      showSalespersonColumn,
      showSalespersonFilter,
      salespersonFilter,
      user?.id,
    ]
  );
}
