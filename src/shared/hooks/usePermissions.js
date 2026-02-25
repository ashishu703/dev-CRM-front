import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../constants/permissions';

export function usePermissions(departmentType = 'sales') {
  const { user } = useAuth();
  const can = useMemo(
    () => (permission) => hasPermission(user, permission, departmentType),
    [user, departmentType]
  );
  const isDepartmentHead = user?.role === 'department_head';
  const isSuperAdmin = user?.role === 'superadmin';
  const isSalesperson = user?.role === 'department_user';
  return { can, user, isDepartmentHead, isSuperAdmin, isSalesperson };
}

export default usePermissions;
