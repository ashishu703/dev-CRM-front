import baseApiClient from '../../utils/apiClient';

const isClientError = (status) => status >= 400 && status < 500;
const isServerError = (status) => status >= 500;

export class ApiError extends Error {
  constructor(message, { status, data, endpoint } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
  }
}

export async function request(endpoint, options = {}) {
  try {
    const response = await baseApiClient.request(endpoint, options);
    return response;
  } catch (err) {
    const status = err?.status;
    const data = err?.data;
    const message = err?.message || data?.message || data?.error || 'Request failed';
    if (isServerError(status)) {
      throw new ApiError(message, { status, data, endpoint });
    }
    if (status === 401) {
      throw new ApiError('Session expired', { status, data, endpoint });
    }
    throw new ApiError(message, { status, data, endpoint });
  }
}

export async function get(endpoint, useCacheBusting = true) {
  return baseApiClient.get(endpoint, useCacheBusting);
}

export async function post(endpoint, data = {}) {
  return baseApiClient.post(endpoint, data);
}

export async function put(endpoint, data = {}) {
  return baseApiClient.put(endpoint, data);
}

export async function del(endpoint, data = {}) {
  return baseApiClient.delete(endpoint, data);
}

export default { request, get, post, put, delete: del, ApiError };
