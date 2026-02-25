'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';

export const emailApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEmailConfig: build.query({
      query: () => ({ url: API_ENDPOINTS.EMAIL_CONFIG() }),
      providesTags: ['EmailConfig'],
    }),
    saveEmailConfig: build.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.EMAIL_CONFIG(),
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EmailConfig'],
    }),
    getEmailsByLeadId: build.query({
      query: (leadId) => ({ url: API_ENDPOINTS.EMAILS_BY_LEAD(leadId) }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result, err, leadId) => [{ type: 'EmailConfig', id: `emails-${leadId}` }],
    }),
    sendEmail: build.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.EMAIL_SEND(),
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetEmailConfigQuery,
  useSaveEmailConfigMutation,
  useSendEmailMutation,
  useGetEmailsByLeadIdQuery,
} = emailApi;
