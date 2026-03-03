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
      // Backend returns { success: true, data: payload }; result is axios response so result.data = body
      transformResponse: (result) => {
        const body = result?.data ?? result ?? {};
        return (body && typeof body === 'object' && body.data !== undefined) ? body.data : body;
      },
    }),
  }),
});

export const { useGetPaymentTrackingQuery } = paymentTrackingApi;
