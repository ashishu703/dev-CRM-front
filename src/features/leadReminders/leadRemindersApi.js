'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';

export const leadRemindersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRemindersByLeadId: build.query({
      query: ({ leadId, page = 1, limit = 20 }) => {
        const q = new URLSearchParams({ page, limit }).toString();
        return { url: API_ENDPOINTS.LEAD_REMINDERS_BY_LEAD(leadId, q) };
      },
      providesTags: (result, err, { leadId }) => [{ type: 'LeadReminders', id: `lead-${leadId}` }, 'LeadReminders'],
      transformResponse: (res) => {
        const body = res?.data ?? res;
        return { reminders: body?.reminders ?? [], pagination: body?.pagination ?? {} };
      },
    }),
    createReminder: build.mutation({
      query: ({ leadId, title, due_at, repeat_type }) => ({
        url: API_ENDPOINTS.LEAD_REMINDER_CREATE(leadId),
        method: 'POST',
        body: { title, due_at, repeat_type: repeat_type || 'none' },
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadReminders', id: `lead-${leadId}` }, 'LeadReminders'],
    }),
    updateReminder: build.mutation({
      query: ({ leadId, reminderId, ...payload }) => ({
        url: API_ENDPOINTS.LEAD_REMINDER_UPDATE(leadId, reminderId),
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadReminders', id: `lead-${leadId}` }, 'LeadReminders'],
    }),
    completeReminder: build.mutation({
      query: ({ leadId, reminderId }) => ({
        url: API_ENDPOINTS.LEAD_REMINDER_COMPLETE(leadId, reminderId),
        method: 'POST',
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadReminders', id: `lead-${leadId}` }, 'LeadReminders'],
    }),
    deleteReminder: build.mutation({
      query: ({ leadId, reminderId }) => ({
        url: API_ENDPOINTS.LEAD_REMINDER_DELETE(leadId, reminderId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadReminders', id: `lead-${leadId}` }, 'LeadReminders'],
    }),
  }),
});

export const {
  useGetRemindersByLeadIdQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useCompleteReminderMutation,
  useDeleteReminderMutation,
} = leadRemindersApi;
