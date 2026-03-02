'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') q.append(k, String(v).trim());
  });
  return q.toString();
}

export const departmentUsersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listDepartmentUsers: build.query({
      query: (params) => ({
        url: API_ENDPOINTS.DEPARTMENT_USERS_LIST(buildQuery(params)),
      }),
      providesTags: (result, err, arg) =>
        result?.users ? [{ type: 'DepartmentUsers', id: buildQuery(arg) }, 'DepartmentUsers'] : ['DepartmentUsers'],
      transformResponse: (res) => {
        const data = res?.data ?? res;
        return {
          users: data?.users ?? [],
          pagination: data?.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 },
        };
      },
    }),
    listDepartmentUsersSummary: build.query({
      query: (params) => ({
        url: API_ENDPOINTS.DEPARTMENT_USERS_SUMMARY(buildQuery(params)),
      }),
      providesTags: (result, err, arg) =>
        result?.users ? [{ type: 'DepartmentUsers', id: `summary-${buildQuery(arg)}` }, 'DepartmentUsers'] : ['DepartmentUsers'],
      transformResponse: (res) => ({
        users: res?.users ?? [],
        pagination: res?.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 },
      }),
    }),
    getDepartmentUserById: build.query({
      query: (id) => ({ url: API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id) }),
      providesTags: (result, err, id) => (result?.user ? [{ type: 'DepartmentUser', id }, 'DepartmentUser'] : ['DepartmentUser']),
      transformResponse: (res) => res?.user ?? res,
    }),
    getDepartmentUsersByHeadId: build.query({
      query: (headUserId) => ({ url: API_ENDPOINTS.DEPARTMENT_USERS_BY_HEAD(headUserId) }),
      providesTags: (result, err, headUserId) =>
        result?.users ? [{ type: 'DepartmentUsers', id: `head-${headUserId}` }, 'DepartmentUsers'] : ['DepartmentUsers'],
      transformResponse: (res) => {
        const data = res?.data ?? res;
        return { users: data?.users ?? [] };
      },
    }),
    getDepartmentUsersStats: build.query({
      query: () => ({ url: API_ENDPOINTS.DEPARTMENT_USERS_STATS() }),
      providesTags: ['DepartmentUsers'],
    }),
    createDepartmentUser: build.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.DEPARTMENT_USERS_CREATE(),
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['DepartmentUsers'],
    }),
    updateDepartmentUser: build.mutation({
      query: ({ id, _listQueryArg, _summaryQueryArg, ...payload }) => ({
        url: API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id),
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, err, { id }) => ['DepartmentUsers', { type: 'DepartmentUser', id }],
      async onQueryStarted({ id, _listQueryArg, _summaryQueryArg, ...payload }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const updated = data?.user ?? data;
          if (!updated) return;
          dispatch(departmentUsersApi.util.updateQueryData('getDepartmentUserById', id, () => updated));
          if (_listQueryArg) {
            const listArg = typeof _listQueryArg === 'object' && _listQueryArg !== null ? _listQueryArg : {};
            dispatch(
              departmentUsersApi.util.updateQueryData('listDepartmentUsers', listArg, (draft) => {
                if (!draft?.users) return;
                const i = draft.users.findIndex((u) => (u?.id ?? u?.userId) === id);
                if (i !== -1) draft.users[i] = { ...draft.users[i], ...updated };
              })
            );
          }
          if (_summaryQueryArg) {
            const sumArg = typeof _summaryQueryArg === 'object' && _summaryQueryArg !== null ? _summaryQueryArg : {};
            dispatch(
              departmentUsersApi.util.updateQueryData('listDepartmentUsersSummary', sumArg, (draft) => {
                if (!draft?.users) return;
                const i = draft.users.findIndex((u) => (u?.id ?? u?.userId) === id);
                if (i !== -1) draft.users[i] = { ...draft.users[i], ...updated };
              })
            );
          }
        } catch (_) {}
      },
    }),
    updateDepartmentUserStatus: build.mutation({
      query: ({ id, isActive }) => ({
        url: API_ENDPOINTS.DEPARTMENT_USER_STATUS(id),
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, err, { id }) => ['DepartmentUsers', { type: 'DepartmentUser', id }],
    }),
    deleteDepartmentUser: build.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['DepartmentUsers'],
    }),
  }),
});

export const {
  useListDepartmentUsersQuery,
  useListDepartmentUsersSummaryQuery,
  useGetDepartmentUserByIdQuery,
  useGetDepartmentUsersByHeadIdQuery,
  useGetDepartmentUsersStatsQuery,
  useCreateDepartmentUserMutation,
  useUpdateDepartmentUserMutation,
  useUpdateDepartmentUserStatusMutation,
  useDeleteDepartmentUserMutation,
} = departmentUsersApi;
