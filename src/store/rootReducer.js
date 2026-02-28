import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import { salesReducer } from '../features/sales/salesSlice';
import paymentTrackingReducer from '../features/paymentTracking/paymentTrackingSlice';
import { leadTasksReducer } from '../features/leadTasks';
import { leadRemindersReducer } from '../features/leadReminders';
import { chatReducer } from '../features/chat/chatSlice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  sales: salesReducer,
  paymentTracking: paymentTrackingReducer,
  leadTasks: leadTasksReducer,
  leadReminders: leadRemindersReducer,
  chat: chatReducer,
});

export default rootReducer;
