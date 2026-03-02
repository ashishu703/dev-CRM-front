'use strict';

import { baseApi } from '../../store/baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query({
      query: ({ date, userId } = {}) => {
        const params = {};
        if (date) params.date = date;
        if (userId) params.userId = userId;
        return { url: '/api/dashboard/summary', params: Object.keys(params).length ? params : {} };
      },
      providesTags: ['DashboardSummary'],
      transformResponse: (res) => res?.data ?? res ?? null,
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
