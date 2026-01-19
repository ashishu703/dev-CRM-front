import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../constants/permissions';

const PermissionGuard = ({ anyOf = [], departmentType = 'production', children, fallback = null }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return fallback;
  if (anyOf.length === 0) return children;
  const allowed = anyOf.some((perm) => hasPermission(user, perm, departmentType));
  return allowed ? children : fallback;
};

export default PermissionGuard;


