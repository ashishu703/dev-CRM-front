'use strict';

import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from './api';

export {
  DepartmentType,
  Role,
  apiToUiDepartment,
  uiToApiDepartment,
  apiToUiRole,
  uiToApiRole,
} from '../../constants/department';

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      q.append(key, String(value).trim());
    }
  });
  return q.toString();
}

export async function listUsers(params = {}) {
  const query = buildQuery(params);
  const res = await apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_LIST(query));
  return res?.data ?? res;
}

export async function listSummary(params = {}) {
  const query = buildQuery(params);
  const res = await apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_SUMMARY(query));
  return res?.data ?? res;
}

export async function getStats() {
  const res = await apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_STATS());
  return res?.data ?? res;
}

export async function getByHeadId(headUserId) {
  const res = await apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_BY_HEAD(headUserId));
  return res?.data ?? res;
}

export async function getUserById(id) {
  const res = await apiClient.get(API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id));
  return res?.data ?? res;
}

export async function createUser(payload) {
  const res = await apiClient.post(API_ENDPOINTS.DEPARTMENT_USERS_CREATE(), payload);
  return res?.data ?? res;
}

export async function updateUser(id, payload) {
  const res = await apiClient.put(API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id), payload);
  return res?.data ?? res;
}

export async function updateStatus(id, isActive) {
  const res = await apiClient.put(API_ENDPOINTS.DEPARTMENT_USER_STATUS(id), { isActive });
  return res?.data ?? res;
}

export async function deleteUser(id) {
  await apiClient.request(API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id), { method: 'DELETE' });
}

const departmentUsersApi = {
  listUsers,
  listSummary,
  getStats,
  getByHeadId,
  getUserById,
  createUser,
  updateUser,
  updateStatus,
  deleteUser,
};

export default departmentUsersApi;
