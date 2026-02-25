'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';

export const leadTasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasksByLeadId: build.query({
      query: (leadId) => ({ url: API_ENDPOINTS.LEAD_TASKS_BY_LEAD(leadId) }),
      providesTags: (result, err, leadId) => [{ type: 'LeadTasks', id: `lead-${leadId}` }, 'LeadTasks'],
      transformResponse: (res) => res?.data?.tasks ?? res?.tasks ?? [],
    }),
    getTasksByUser: build.query({
      query: () => ({ url: API_ENDPOINTS.LEAD_TASKS_MY() }),
      providesTags: () => ['LeadTasks'],
      transformResponse: (res) => res?.data?.tasks ?? res?.tasks ?? [],
    }),
    createTask: build.mutation({
      query: ({ leadId, title, description, due_at, assigned_to }) => ({
        url: API_ENDPOINTS.LEAD_TASK_CREATE(leadId),
        method: 'POST',
        body: { title, description, due_at, assigned_to },
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadTasks', id: `lead-${leadId}` }, 'LeadTasks'],
    }),
    updateTask: build.mutation({
      query: ({ leadId, taskId, ...payload }) => ({
        url: API_ENDPOINTS.LEAD_TASK_UPDATE(leadId, taskId),
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadTasks', id: `lead-${leadId}` }, 'LeadTasks'],
    }),
    completeTask: build.mutation({
      query: ({ leadId, taskId }) => ({
        url: API_ENDPOINTS.LEAD_TASK_COMPLETE(leadId, taskId),
        method: 'POST',
      }),
      invalidatesTags: (result, err, { leadId }) => [{ type: 'LeadTasks', id: `lead-${leadId}` }, 'LeadTasks'],
      async onQueryStarted({ leadId, taskId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          leadTasksApi.util.updateQueryData('getTasksByLeadId', leadId, (draft) => {
            const task = Array.isArray(draft) ? draft.find((t) => String(t?.id) === String(taskId)) : null;
            if (task) task.completed_at = new Date().toISOString();
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetTasksByLeadIdQuery,
  useGetTasksByUserQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCompleteTaskMutation,
} = leadTasksApi;
