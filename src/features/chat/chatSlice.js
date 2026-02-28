'use strict';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedConversationId: null,
  selectedConversationMeta: null, // { type: 'dm'|'team', teamName?, otherUser? }
  unreadCount: 0,
  activeTab: 'internal', // internal | team | emails | todo
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversationId = action.payload?.id ?? null;
      state.selectedConversationMeta = action.payload?.meta ?? null;
    },
    clearSelectedConversation: (state) => {
      state.selectedConversationId = null;
      state.selectedConversationMeta = null;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload || 'internal';
    },
  },
});

export const { setSelectedConversation, clearSelectedConversation, setUnreadCount, setActiveTab } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
export default chatSlice.reducer;
