'use strict';

import { baseApi } from '../../store/baseApi';
import { API_ENDPOINTS } from '../../api/admin_api/api';

const extract = (res) => res?.data?.data ?? res?.data;

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChatUsers: build.query({
      query: () => ({ url: API_ENDPOINTS.CHAT_USERS() }),
      transformResponse: (res) => extract(res) ?? [],
      providesTags: ['ChatUsers'],
    }),
    getUnreadCount: build.query({
      query: () => ({ url: API_ENDPOINTS.CHAT_UNREAD() }),
      transformResponse: (res) => extract(res)?.total ?? 0,
      providesTags: ['ChatUnread'],
    }),
    getConversations: build.query({
      query: () => ({ url: API_ENDPOINTS.CHAT_CONVERSATIONS() }),
      transformResponse: (res) => extract(res) ?? [],
      providesTags: ['ChatConversations'],
    }),
    getOrCreateDm: build.mutation({
      query: (otherUserEmail) => ({
        url: API_ENDPOINTS.CHAT_CONVERSATIONS_DM(),
        method: 'POST',
        body: { otherUserEmail },
      }),
      transformResponse: (res) => extract(res),
      invalidatesTags: ['ChatConversations'],
    }),
    getMessages: build.query({
      query: ({ conversationId, limit = 50, beforeId }) => {
        const q = [];
        if (limit != null) q.push(`limit=${limit}`);
        if (beforeId != null) q.push(`beforeId=${beforeId}`);
        return { url: API_ENDPOINTS.CHAT_CONVERSATION_MESSAGES(conversationId, q.join('&')) };
      },
      transformResponse: (res) => extract(res) ?? [],
      providesTags: (result, err, { conversationId }) => [{ type: 'ChatMessages', id: conversationId }],
    }),
    sendMessage: build.mutation({
      query: ({ conversationId, payload }) => ({
        url: API_ENDPOINTS.CHAT_CONVERSATION_MESSAGES(conversationId),
        method: 'POST',
        body: { payload },
      }),
      transformResponse: (res) => extract(res),
      invalidatesTags: (result, err, { conversationId }) => [
        'ChatConversations',
        { type: 'ChatMessages', id: conversationId },
        'ChatUnread',
      ],
    }),
    markConversationRead: build.mutation({
      query: (conversationId) => ({
        url: API_ENDPOINTS.CHAT_CONVERSATION_READ(conversationId),
        method: 'POST',
      }),
      invalidatesTags: ['ChatConversations', 'ChatUnread'],
    }),
    getTeams: build.query({
      query: () => ({ url: API_ENDPOINTS.CHAT_TEAMS() }),
      transformResponse: (res) => extract(res) ?? [],
      providesTags: ['ChatTeams'],
    }),
    createTeam: build.mutation({
      query: (name) => ({
        url: API_ENDPOINTS.CHAT_TEAMS(),
        method: 'POST',
        body: { name },
      }),
      transformResponse: (res) => extract(res),
      invalidatesTags: ['ChatTeams'],
    }),
    getTeamConversation: build.query({
      query: (teamId) => ({ url: API_ENDPOINTS.CHAT_TEAM_CONVERSATION(teamId) }),
      transformResponse: (res) => extract(res),
      providesTags: (result, err, teamId) => [{ type: 'ChatTeamConv', id: teamId }],
    }),
    getTeamMembers: build.query({
      query: (teamId) => ({ url: API_ENDPOINTS.CHAT_TEAM_MEMBERS(teamId) }),
      transformResponse: (res) => extract(res) ?? [],
      providesTags: (result, err, teamId) => [{ type: 'ChatTeamMembers', id: teamId }],
    }),
    addTeamMember: build.mutation({
      query: ({ teamId, userEmail }) => ({
        url: `${API_ENDPOINTS.CHAT_TEAMS().replace(/\/$/, '')}/${teamId}/members`,
        method: 'POST',
        body: { userEmail },
      }),
      invalidatesTags: (result, err, args) => ['ChatTeams', 'ChatTeamConv', ...(args?.teamId ? [{ type: 'ChatTeamMembers', id: args.teamId }] : [])],
    }),
    getMyTodos: build.query({
      query: () => ({ url: API_ENDPOINTS.CHAT_TODOS_MINE() }),
      transformResponse: (res) => extract(res) ?? [],
      providesTags: ['ChatTodos'],
    }),
    getAssignedByMeTodos: build.query({
      query: () => ({ url: API_ENDPOINTS.CHAT_TODOS_ASSIGNED() }),
      transformResponse: (res) => extract(res) ?? [],
      providesTags: ['ChatTodos'],
    }),
    createTodo: build.mutation({
      query: ({ title, description, assigneeEmail }) => ({
        url: API_ENDPOINTS.CHAT_TODOS(),
        method: 'POST',
        body: { title, description, assigneeEmail },
      }),
      invalidatesTags: ['ChatTodos'],
    }),
    completeTodo: build.mutation({
      query: (todoId) => ({
        url: API_ENDPOINTS.CHAT_TODO_COMPLETE(todoId),
        method: 'POST',
      }),
      invalidatesTags: ['ChatTodos'],
    }),
  }),
});

export const {
  useGetChatUsersQuery,
  useGetUnreadCountQuery,
  useGetConversationsQuery,
  useGetOrCreateDmMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useGetTeamsQuery,
  useCreateTeamMutation,
  useGetTeamConversationQuery,
  useLazyGetTeamConversationQuery,
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useGetMyTodosQuery,
  useGetAssignedByMeTodosQuery,
  useCreateTodoMutation,
  useCompleteTodoMutation,
} = chatApi;
