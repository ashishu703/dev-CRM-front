import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PaymentTrackingView from './PaymentTrackingView';
import PaymentInfoSkeleton from '../../../components/payment/PaymentInfoSkeleton';
import { useRoleScope } from './hooks/useRoleScope';
import { usePaymentTrackingData } from './hooks/usePaymentTrackingData';
import { usePaymentFilters } from './hooks/usePaymentFilters';
import { usePagination } from './hooks/usePagination';
import { openAddPaymentSidebar } from '../../../features/paymentTracking/paymentTrackingSlice';
import paymentService from '../../../api/admin_api/paymentService';
import quotationService from '../../../api/admin_api/quotationService';
import Toast from '../../../utils/Toast';

/**
 * Data + orchestration. Role-based payment tracking with single Refresh and clean tabs.
 */
export default function PaymentTrackingContainer(props = {}) {
  const { title = 'Payment Tracking' } = props;
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('orders');
  const roleScope = useRoleScope();
  const canDelete = roleScope?.canDeletePaymentTracking;

  const data = usePaymentTrackingData(true);
  const filters = usePaymentFilters(data, activeTab, roleScope.salespersonFilter);
  const pagination = usePagination(filters.filteredRows, { initialLimit: 10 });

  const [selectedForCancelOrder, setSelectedForCancelOrder] = useState(null);
  const setSelectedForAddPayment = useCallback((payment) => dispatch(openAddPaymentSidebar(payment)), [dispatch]);

  useEffect(() => {
    pagination.setPage(1);
  }, [filters.searchTerm, activeTab]);

  const paymentByQuotationId = useMemo(() => {
    const map = new Map();
    (data.allPayments || []).forEach((x) => {
      const key = x.quotationIdRaw || x.quotationId;
      if (key) map.set(key, x);
    });
    return map;
  }, [data.allPayments]);

  const getPaymentForRow = useCallback(
    (r) => paymentByQuotationId.get(r.quotationId) ?? null,
    [paymentByQuotationId]
  );

  const cancelOrderItemForPayment = useCallback((payment) => {
    if (!payment) return null;
    const id = payment.quotationIdRaw || payment.quotationId;
    return { quotationData: { id, quotationId: id } };
  }, []);

  const onSaveOrderDelivery = useCallback(async (quotationId, payload) => {
    if (!quotationId) return;
    try {
      const res = await paymentService.updateOrderDelivery(quotationId, payload);
      if (res?.data?.success !== false) {
        Toast.success((res?.data?.data?.updatedCount ?? 0) > 0 ? 'Saved' : 'No payment record to update for this order.');
        data.refresh();
      } else {
        Toast.error(res?.data?.message || 'Failed to save');
      }
    } catch (e) {
      Toast.error(e?.response?.data?.message || e?.message || 'Failed to save');
    }
  }, [data]);

  const handleDeleteQuotation = useCallback(
    async (quotationId) => {
      if (!quotationId) return;
      if (!window.confirm('Are you sure you want to delete this order?')) return;
      try {
        const res = await quotationService.deleteQuotation(quotationId);
        if (res?.data?.success === false) {
          Toast.error(res?.data?.message || 'Failed to delete order');
          return;
        }
        Toast.success(res?.data?.message || 'Order deleted');
        data.refresh();
      } catch (e) {
        Toast.error(e?.response?.data?.message || e?.message || 'Failed to delete order');
      }
    },
    [data]
  );

  const handleBulkDeleteQuotations = useCallback(
    async (quotationIds = []) => {
      if (!quotationIds.length) return;
      if (!window.confirm(`Are you sure you want to delete ${quotationIds.length} order(s)?`)) return;
      try {
        for (const id of quotationIds) {
          // eslint-disable-next-line no-await-in-loop
          await quotationService.deleteQuotation(id);
        }
        Toast.success('Selected orders deleted');
        data.refresh();
      } catch (e) {
        Toast.error(e?.response?.data?.message || e?.message || 'Failed to delete selected orders');
      }
    },
    [data]
  );

  const handleDeletePaymentHistory = useCallback(
    async (row) => {
      const paymentHistoryId = row?.id;
      if (!paymentHistoryId) return;
      if (!window.confirm('Are you sure you want to delete this payment entry?')) return;
      try {
        const res = await paymentService.deletePayment(paymentHistoryId);
        if (res?.data?.success === false) {
          Toast.error(res?.data?.message || 'Failed to delete payment');
          return;
        }
        Toast.success(res?.data?.message || 'Payment deleted');
        data.refresh();
      } catch (e) {
        Toast.error(e?.response?.data?.message || e?.message || 'Failed to delete payment');
      }
    },
    [data]
  );

  const handleDeleteCreditRow = useCallback(
    async (row) => {
      if (!row) return;
      if (row.creditType === 'advance') {
        const customerId = row.partyKey;
        if (!customerId) return;
        if (!window.confirm('Are you sure you want to delete this advance credit?')) return;
        try {
          const res = await paymentService.deleteAdvanceCredit(customerId);
          if (res?.data?.success === false) {
            Toast.error(res?.data?.message || 'Failed to delete credit');
            return;
          }
          Toast.success(res?.data?.message || 'Advance credit deleted');
          data.refresh();
        } catch (e) {
          Toast.error(e?.response?.data?.message || e?.message || 'Failed to delete credit');
        }
      } else {
        await handleDeleteQuotation(row.quotationId);
      }
    },
    [data, handleDeleteQuotation]
  );

  const salespersonOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    const rows = (data.orderRows || []).concat(data.pendingRows || []);
    rows.forEach((r) => {
      const name = r.salespersonName || r.salesperson_name;
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({ value: name, label: name });
      }
    });
    return list;
  }, [data.orderRows, data.pendingRows]);

  if (data.initialLoading) return <PaymentInfoSkeleton />;

  return (
    <PaymentTrackingView
      title={title}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      data={data}
      filters={filters}
      pagination={pagination}
      roleScope={roleScope}
      salespersonOptions={salespersonOptions}
      getPaymentForRow={getPaymentForRow}
      cancelOrderItemForPayment={cancelOrderItemForPayment}
      setSelectedForAddPayment={setSelectedForAddPayment}
      selectedForCancelOrder={selectedForCancelOrder}
      setSelectedForCancelOrder={setSelectedForCancelOrder}
      onRefresh={data.refresh}
      onSaveOrderDelivery={onSaveOrderDelivery}
      canDelete={canDelete}
      onDeleteQuotation={handleDeleteQuotation}
      onBulkDeleteQuotations={handleBulkDeleteQuotations}
      onDeletePaymentHistory={handleDeletePaymentHistory}
      onDeleteCreditRow={handleDeleteCreditRow}
    />
  );
}
