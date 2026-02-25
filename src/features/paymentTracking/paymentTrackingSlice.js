import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  addPaymentSidebarOpen: false,
  selectedPayment: null,
  selectedCancelItem: null,
  searchTerm: '',
  statusFilter: '',
};

const paymentTrackingSlice = createSlice({
  name: 'paymentTracking',
  initialState,
  reducers: {
    openAddPaymentSidebar(state, { payload }) {
      state.addPaymentSidebarOpen = true;
      state.selectedPayment = payload ?? null;
    },
    closeAddPaymentSidebar(state) {
      state.addPaymentSidebarOpen = false;
      state.selectedPayment = null;
    },
    setSelectedCancelItem(state, { payload }) {
      state.selectedCancelItem = payload ?? null;
    },
    setSearchTerm(state, { payload }) {
      state.searchTerm = payload ?? '';
    },
    setStatusFilter(state, { payload }) {
      state.statusFilter = payload ?? '';
    },
    resetPaymentTrackingUI(state) {
      state.addPaymentSidebarOpen = false;
      state.selectedPayment = null;
      state.selectedCancelItem = null;
    },
  },
});

export const {
  openAddPaymentSidebar,
  closeAddPaymentSidebar,
  setSelectedCancelItem,
  setSearchTerm,
  setStatusFilter,
  resetPaymentTrackingUI,
} = paymentTrackingSlice.actions;

export default paymentTrackingSlice.reducer;
