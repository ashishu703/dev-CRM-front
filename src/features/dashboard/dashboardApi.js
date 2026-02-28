'use strict';

import { baseApi } from '../../store/baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query({
      query: ({ date } = {}) => ({
        url: '/api/dashboard/summary',
        params: date ? { date } : {},
      }),
      providesTags: ['DashboardSummary'],
      transformResponse: (res) => res?.data ?? res ?? null,
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
