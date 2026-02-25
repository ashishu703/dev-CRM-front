'use strict';

import { createApi } from '@reduxjs/toolkit/query/react';
import apiClient from '../utils/apiClient';

async function baseQuery({ url, method = 'GET', body }) {
  try {
    let res;
    if (method === 'GET') res = await apiClient.get(url);
    else if (method === 'POST') res = await apiClient.post(url, body ?? {});
    else if (method === 'PUT') res = await apiClient.put(url, body ?? {});
    else if (method === 'DELETE') res = await apiClient.request(url, { method: 'DELETE' });
    else res = await apiClient.request(url, { method, body: body ? JSON.stringify(body) : undefined });
    return { data: res };
  } catch (e) {
    return { error: { status: e?.status, data: e?.data, message: e?.message } };
  }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['DepartmentUsers', 'DepartmentUser', 'PaymentTracking', 'LeadTasks', 'LeadTask', 'LeadReminders', 'LeadReminder', 'ActivityTimeline', 'DashboardSummary', 'LeadDocs', 'EmailConfig'],
  endpoints: () => ({}),
});
