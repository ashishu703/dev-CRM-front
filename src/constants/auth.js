export const ROLES = {
  SUPERADMIN: 'superadmin',
  DEPARTMENT_HEAD: 'department_head',
  DEPARTMENT_USER: 'department_user',
  HR_DEPARTMENT_HEAD: 'hr_department_head',
};

export const getUserTypeForRole = (role, departmentType = null) => {
  if (!role) return 'superadmin';
  
  const dept = departmentType ? String(departmentType).toLowerCase().trim() : '';
  
  switch (role) {
    case ROLES.DEPARTMENT_HEAD:
      if (dept === 'hr' || dept === 'human resources') {
        return 'hrdepartmenthead';
      }
      if (dept === 'production' || dept === 'production department') {
        return 'productiondepartmenthead';
      }
      if (dept === 'accounts' || dept === 'accounts department') {
        return 'accountsdepartmenthead';
      }
      if (dept === 'it' || dept === 'it department') {
        return 'itdepartmenthead';
      }
      if (dept === 'office_sales' || dept === 'office sales') {
        return 'salesdepartmenthead';
      }
      return 'salesdepartmenthead';
      
    case ROLES.MARKETING_DEPARTMENT_HEAD:
      return 'marketingdepartmenthead';
      
    case ROLES.HR_DEPARTMENT_HEAD:
      return 'hrdepartmenthead';
      
    case ROLES.DEPARTMENT_USER:
      if (dept === 'production' || dept === 'production department') {
        return 'production-staff';
      }
      if (dept === 'marketing_sales' || dept === 'marketing department' || dept === 'marketing') {
        return 'marketing-salesperson';
      }
      if (dept === 'accounts' || dept === 'accounts department') {
        return 'accounts-user';
      }
      if (dept === 'it' || dept === 'it department') {
        return 'it-user';
      }
      if (dept === 'office_sales' || dept === 'office sales') {
        return 'salesperson';
      }
      return 'salesperson';
      
    case ROLES.SUPERADMIN:
      return 'superadmin';
      
    default:
      return 'superadmin';
  }
};
