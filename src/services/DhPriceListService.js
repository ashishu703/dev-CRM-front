import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

export async function list(query = '') {
  return apiClient.get(API_ENDPOINTS.DH_PRICE_LIST(query));
}

export async function getByProductSpec(productSpec) {
  return apiClient.get(API_ENDPOINTS.DH_PRICE_LIST_BY_SPEC(productSpec));
}

export async function upload(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postFormData(API_ENDPOINTS.DH_PRICE_LIST_UPLOAD(), formData);
}

export async function downloadTemplate() {
  const url = API_ENDPOINTS.DH_PRICE_LIST_TEMPLATE();
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || 'Download failed');
  }
  const blob = await res.blob();
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error('Invalid template response');
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'DH_Price_List_Template.xlsx';
  link.click();
  URL.revokeObjectURL(link.href);
}
