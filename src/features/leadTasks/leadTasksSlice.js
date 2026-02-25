'use strict';

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { leadTasksApi } from './leadTasksApi';

const tasksAdapter = createEntityAdapter({
  selectId: (task) => String(task?.id ?? task?.taskId ?? ''),
  sortComparer: (a, b) => new Date(a.due_at || 0) - new Date(b.due_at || 0),
});

const initialState = tasksAdapter.getInitialState();

const leadTasksSlice = createSlice({
  name: 'leadTasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(leadTasksApi.endpoints.getTasksByLeadId.matchFulfilled, (state, action) => {
        const list = Array.isArray(action.payload) ? action.payload : [];
        tasksAdapter.upsertMany(state, list);
      })
      .addMatcher(leadTasksApi.endpoints.getTasksByUser.matchFulfilled, (state, action) => {
        const list = Array.isArray(action.payload) ? action.payload : [];
        tasksAdapter.upsertMany(state, list);
      })
      .addMatcher(leadTasksApi.endpoints.createTask.matchFulfilled, (state, action) => {
        const task = action.payload?.task ?? action.payload;
        if (task) tasksAdapter.upsertOne(state, task);
      })
      .addMatcher(leadTasksApi.endpoints.updateTask.matchFulfilled, (state, action) => {
        const task = action.payload?.task ?? action.payload;
        if (task) tasksAdapter.upsertOne(state, task);
      })
      .addMatcher(leadTasksApi.endpoints.completeTask.matchFulfilled, (state, action) => {
        const task = action.payload?.task ?? action.payload;
        if (task) tasksAdapter.upsertOne(state, task);
      });
  },
});

export const { selectById: selectTaskById, selectAll: selectAllTasks, selectIds: selectTaskIds } = tasksAdapter.getSelectors((state) => state.leadTasks ?? initialState);

export default leadTasksSlice.reducer;
