'use strict';

export const DepartmentType = {
  OFFICE_SALES: 'office_sales',
  MARKETING_SALES: 'marketing_sales',
  HR: 'hr',
  PRODUCTION: 'production',
  ACCOUNTS: 'accounts',
  IT: 'it',
};

export const Role = {
  DEPARTMENT_USER: 'department_user',
  DEPARTMENT_HEAD: 'department_head',
};

const DEPARTMENT_LABELS = {
  [DepartmentType.OFFICE_SALES]: 'Office Sales Department',
  [DepartmentType.MARKETING_SALES]: 'Marketing Department',
  [DepartmentType.HR]: 'HR Department',
  [DepartmentType.PRODUCTION]: 'Production Department',
  [DepartmentType.ACCOUNTS]: 'Accounts Department',
  [DepartmentType.IT]: 'IT Department',
};

const LABEL_TO_API = {
  'Office Sales Department': DepartmentType.OFFICE_SALES,
  'Sales Department': DepartmentType.OFFICE_SALES,
  'Marketing Department': DepartmentType.MARKETING_SALES,
  'HR Department': DepartmentType.HR,
  'Production Department': DepartmentType.PRODUCTION,
  'Accounts Department': DepartmentType.ACCOUNTS,
  'IT Department': DepartmentType.IT,
};

export function apiToUiDepartment(apiValue) {
  return DEPARTMENT_LABELS[apiValue] ?? apiValue;
}

export function uiToApiDepartment(uiValue) {
  return LABEL_TO_API[uiValue] ?? uiValue;
}

export function uiToApiRole(uiValue) {
  const m = { 'Department User': Role.DEPARTMENT_USER, 'Department Head': Role.DEPARTMENT_HEAD };
  return m[uiValue] ?? uiValue;
}

export function apiToUiRole(apiValue) {
  const m = { [Role.DEPARTMENT_USER]: 'Department User', [Role.DEPARTMENT_HEAD]: 'Department Head' };
  return m[apiValue] ?? apiValue;
}
