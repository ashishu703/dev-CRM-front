import { useAuth } from './useAuth';
import { hasPermission } from '../constants/permissions';

export default function usePermission() {
  const { user } = useAuth();
  const can = (permission, departmentType = 'sales') => hasPermission(user, permission, departmentType);
  return { can };
}


