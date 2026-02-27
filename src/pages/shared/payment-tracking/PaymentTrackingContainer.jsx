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
import Toast from '../../../utils/Toast';

/**
 * Data + orchestration. Role-based payment tracking with single Refresh and clean tabs.
 */
export default function PaymentTrackingContainer(props = {}) {
  const { title = 'Payment Tracking' } = props;
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('orders');
  const roleScope = useRoleScope();

  const data = usePaymentTrackingData();
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
        Toast.success((res?.data?.data?.updatedCount ?? 0) > 0 ? 'Saved' : 'No payment record to update');
        data.refresh();
      } else {
        Toast.error(res?.data?.message || 'Failed to save');
      }
    } catch (e) {
      Toast.error(e?.response?.data?.message || e?.message || 'Failed to save');
    }
  }, [data]);

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
    />
  );
}
