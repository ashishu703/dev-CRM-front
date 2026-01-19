// Production permissions and helpers

export const Permissions = {
  VIEW_PRODUCTION_DASHBOARD: 'view_production_dashboard',
  VIEW_PRODUCTION_SCHEDULE: 'view_production_schedule',
  EDIT_PRODUCTION_REPORTS: 'edit_production_reports',
  MANAGE_PRODUCTION_STAFF: 'manage_production_staff',
  VIEW_PRODUCTION_TASKS: 'view_production_tasks',
  UPDATE_TASK_STATUS: 'update_task_status',
};

// Map base roles to permissions; departmentType filters applied by helpers
export const RolePermissions = {
  department_head: [
    Permissions.VIEW_PRODUCTION_DASHBOARD,
    Permissions.VIEW_PRODUCTION_SCHEDULE,
    Permissions.EDIT_PRODUCTION_REPORTS,
    Permissions.MANAGE_PRODUCTION_STAFF,
    Permissions.VIEW_PRODUCTION_TASKS,
  ],
  department_user: [
    Permissions.VIEW_PRODUCTION_DASHBOARD,
    Permissions.VIEW_PRODUCTION_TASKS,
    Permissions.UPDATE_TASK_STATUS,
  ],
  superadmin: [
    Permissions.VIEW_PRODUCTION_DASHBOARD,
    Permissions.VIEW_PRODUCTION_SCHEDULE,
    Permissions.EDIT_PRODUCTION_REPORTS,
    Permissions.MANAGE_PRODUCTION_STAFF,
    Permissions.VIEW_PRODUCTION_TASKS,
    Permissions.UPDATE_TASK_STATUS,
  ],
};

export const hasPermission = (user, permission, departmentTypeFilter = 'production') => {
  if (!user) return false;
  const allowed = RolePermissions[user.role] || [];
  const roleOk = allowed.includes(permission);
  const deptOk = !departmentTypeFilter || user.departmentType === departmentTypeFilter || user.departmentType === 'Production Department';
  return roleOk && deptOk;
};


