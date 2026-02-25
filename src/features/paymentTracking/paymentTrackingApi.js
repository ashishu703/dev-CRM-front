'use strict';

import { baseApi } from '../../store/baseApi';

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') q.append(k, String(v).trim());
  });
  return q.toString();
}

export const paymentTrackingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPaymentTracking: build.query({
      query: (params) => ({
        url: `/api/payments/tracking${buildQuery(params) ? `?${buildQuery(params)}` : ''}`,
      }),
      providesTags: ['PaymentTracking'],
      transformResponse: (res) => res?.data ?? res ?? {},
    }),
  }),
});

export const { useGetPaymentTrackingQuery } = paymentTrackingApi;
