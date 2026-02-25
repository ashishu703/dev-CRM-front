'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import apiClient from '../../utils/apiClient';

export const leadDocsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDocsByLeadId: build.query({
      query: (leadId) => ({ url: API_ENDPOINTS.LEAD_DOCS(leadId) }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result, err, leadId) => [{ type: 'LeadDocs', id: leadId }, 'LeadDocs'],
    }),
    getPhotosByLeadId: build.query({
      query: (leadId) => ({ url: API_ENDPOINTS.LEAD_PHOTOS(leadId) }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result, err, leadId) => [{ type: 'LeadDocs', id: `photos-${leadId}` }],
    }),
    uploadLeadDoc: build.mutation({
      queryFn: async ({ leadId, file }) => {
        try {
          const fd = new FormData();
          fd.append('file', file);
          const url = API_ENDPOINTS.UPLOAD_LEAD_DOC(leadId);
          const data = await apiClient.postFormData(url, fd);
          return { data };
        } catch (e) {
          return { error: { status: e?.status, data: e?.data, message: e?.message } };
        }
      },
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadDocs', id: leadId }],
    }),
    uploadLeadPhoto: build.mutation({
      queryFn: async ({ leadId, file, metadata }) => {
        try {
          const fd = new FormData();
          fd.append('file', file);
          if (metadata?.reason) fd.append('reason', metadata.reason);
          if (metadata?.meeting_notes) fd.append('meeting_notes', metadata.meeting_notes);
          if (metadata?.expense != null && metadata.expense !== '') fd.append('expense', metadata.expense);
          if (metadata?.gps_lat != null) fd.append('gps_lat', String(metadata.gps_lat));
          if (metadata?.gps_lng != null) fd.append('gps_lng', String(metadata.gps_lng));
          const url = API_ENDPOINTS.UPLOAD_LEAD_PHOTO(leadId);
          const data = await apiClient.postFormData(url, fd);
          return { data };
        } catch (e) {
          return { error: { status: e?.status, data: e?.data, message: e?.message } };
        }
      },
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadDocs', id: leadId }, { type: 'LeadDocs', id: `photos-${leadId}` }],
    }),
  }),
});

export const {
  useGetDocsByLeadIdQuery,
  useGetPhotosByLeadIdQuery,
  useUploadLeadDocMutation,
  useUploadLeadPhotoMutation,
} = leadDocsApi;
