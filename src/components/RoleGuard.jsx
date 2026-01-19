import React from 'react';
import { useAuth } from '../hooks/useAuth';

const RoleGuard = ({ allow = [], allowDepartmentTypes = [], children, fallback = null }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return fallback;
  
  const roleAllowed = allow.length === 0 || allow.includes(user.role);
  const deptAllowed = allowDepartmentTypes.length === 0 || allowDepartmentTypes.includes(user.departmentType);
  
  return roleAllowed && deptAllowed ? children : fallback;
};

export default RoleGuard;
