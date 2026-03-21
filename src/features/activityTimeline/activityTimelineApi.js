'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';

export const activityTimelineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLeadHistory: build.query({
      query: (arg) => {
        const leadId = typeof arg === 'object' ? arg.leadId : arg;
        const page = typeof arg === 'object' ? (arg.page ?? 1) : 1;
        const limit = typeof arg === 'object' ? (arg.limit ?? 20) : 20;
        const q = new URLSearchParams({ page, limit }).toString();
        return { url: API_ENDPOINTS.SALESPERSON_LEAD_HISTORY(leadId, q) };
      },
      providesTags: (result, err, arg) => {
        const leadId = typeof arg === 'object' ? arg.leadId : arg;
        return [{ type: 'ActivityTimeline', id: `history-${leadId}` }];
      },
      transformResponse: (res) => {
        if (!res) return { data: [], pagination: {} };
        const rows = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        return { data: rows, pagination: res.pagination ?? {} };
      },
    }),
    getOrderCancelsByCustomer: build.query({
      query: (customerId) => ({ url: API_ENDPOINTS.ORDER_CANCEL_BY_CUSTOMER(customerId) }),
      providesTags: (result, err, customerId) => [{ type: 'ActivityTimeline', id: `cancel-${customerId}` }],
      transformResponse: (res) => res?.data?.data ?? res?.data ?? res ?? [],
    }),
  }),
});

export const { useGetLeadHistoryQuery, useGetOrderCancelsByCustomerQuery } = activityTimelineApi;
