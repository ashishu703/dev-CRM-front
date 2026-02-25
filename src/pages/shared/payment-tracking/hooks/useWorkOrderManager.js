import { useState, useCallback, useEffect } from 'react';
import workOrderService from '../../../../services/WorkOrderService';

/**
 * Encapsulates all work order state and actions (fetch, generate, view, edit, delete).
 * Removes ~200 lines of domain logic from the UI component.
 */
export function useWorkOrderManager(allPaymentsData, onRefresh) {
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  const [selectedPaymentForWorkOrder, setSelectedPaymentForWorkOrder] = useState(null);
  const [workOrderData, setWorkOrderData] = useState(null);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);
  const [workOrderError, setWorkOrderError] = useState(null);
  const [showWorkOrderView, setShowWorkOrderView] = useState(false);
  const [showWorkOrderDelete, setShowWorkOrderDelete] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workOrders, setWorkOrders] = useState({});

  const fetchWorkOrderForPayment = useCallback(async (payment) => {
    const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
    if (!quotationId) return null;
    try {
      const response = await workOrderService.checkQuotationWorkOrder(quotationId);
      if (response?.success && response.exists && response.data && !response.data.is_deleted)
        return response.data;
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!allPaymentsData?.length) return;
    const uniqueQuotationIds = new Set(
      allPaymentsData.map((p) => p.quotationId || p.orderId || p.quotation_number).filter(Boolean)
    );
    const workOrdersMap = {};
    Promise.all(
      Array.from(uniqueQuotationIds).map(async (quotationId) => {
        try {
          const wo = await fetchWorkOrderForPayment({
            quotationId,
            orderId: quotationId,
            quotation_number: quotationId,
          });
          if (wo && !wo.is_deleted && (wo.work_order_number || wo.id)) workOrdersMap[quotationId] = wo;
        } catch {}
      })
    ).then((result) => setWorkOrders((prev) => ({ ...prev, ...workOrdersMap })));
  }, [allPaymentsData, fetchWorkOrderForPayment]);

  const openWorkOrder = useCallback(async (payment) => {
    setSelectedPaymentForWorkOrder(payment);
    setShowWorkOrder(true);
    setWorkOrderLoading(true);
    setWorkOrderError(null);
    setWorkOrderData(null);
    const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
    try {
      if (quotationId) {
        const checkResponse = await workOrderService.checkQuotationWorkOrder(quotationId);
        if (checkResponse?.success && checkResponse.exists && checkResponse.data) {
          setWorkOrderData(checkResponse.data);
          setWorkOrders((prev) => ({ ...prev, [quotationId]: checkResponse.data }));
          setWorkOrderLoading(false);
          return;
        }
      }
      const woData = workOrderService.buildWorkOrderFromPayment(payment);
      const saveResponse = await workOrderService.saveWorkOrder(woData, payment);
      if (saveResponse?.success && saveResponse.data) {
        setWorkOrderData(saveResponse.data);
        if (quotationId) setWorkOrders((prev) => ({ ...prev, [quotationId]: saveResponse.data }));
      } else setWorkOrderError(saveResponse?.error || 'Failed');
    } catch (e) {
      setWorkOrderError(e.message || 'Failed');
    } finally {
      setWorkOrderLoading(false);
    }
  }, []);

  const closeWorkOrder = useCallback(() => {
    setShowWorkOrder(false);
    setSelectedPaymentForWorkOrder(null);
    setWorkOrderData(null);
    setWorkOrderError(null);
  }, []);

  const viewWorkOrder = useCallback(
    async (payment) => {
      const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
      if (!quotationId) return;
      setWorkOrderLoading(true);
      try {
        let wo = workOrders[quotationId];
        if (!wo) wo = await fetchWorkOrderForPayment(payment);
        if (wo) {
          setWorkOrders((prev) => ({ ...prev, [quotationId]: wo }));
          setSelectedWorkOrder(wo);
          setWorkOrderData(wo);
          setShowWorkOrderView(true);
        }
      } catch {} finally {
        setWorkOrderLoading(false);
      }
    },
    [workOrders, fetchWorkOrderForPayment]
  );

  const editWorkOrder = useCallback(
    async (payment) => {
      const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
      if (!quotationId) return;
      setWorkOrderLoading(true);
      try {
        const wo = await fetchWorkOrderForPayment(payment);
        if (wo) {
          setSelectedWorkOrder(wo);
          setWorkOrderData(wo);
          setSelectedPaymentForWorkOrder(payment);
          setShowWorkOrder(true);
        }
      } catch {} finally {
        setWorkOrderLoading(false);
      }
    },
    [fetchWorkOrderForPayment]
  );

  const requestDeleteWorkOrder = useCallback(
    async (payment) => {
      const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
      if (!quotationId) return;
      setWorkOrderLoading(true);
      try {
        let wo = workOrders[quotationId] || (await fetchWorkOrderForPayment(payment));
        if (wo) {
          setSelectedWorkOrder(wo);
          setShowWorkOrderDelete(true);
        }
      } catch {} finally {
        setWorkOrderLoading(false);
      }
    },
    [workOrders, fetchWorkOrderForPayment]
  );

  const closeWorkOrderView = useCallback(() => {
    setShowWorkOrderView(false);
    setSelectedWorkOrder(null);
  }, []);

  const confirmDeleteWorkOrder = useCallback(async () => {
    if (!selectedWorkOrder?.id) return;
    try {
      const response = await workOrderService.deleteWorkOrder(selectedWorkOrder.id);
      if (response?.success !== false) {
        setShowWorkOrderDelete(false);
        const qid = selectedWorkOrder.bna_number || selectedWorkOrder.quotation_id;
        if (qid)
          setWorkOrders((prev) => {
            const u = { ...prev };
            delete u[qid];
            return u;
          });
        setSelectedWorkOrder(null);
        onRefresh?.();
      }
    } catch {}
  }, [selectedWorkOrder, onRefresh]);

  const closeWorkOrderDelete = useCallback(() => {
    setShowWorkOrderDelete(false);
    setSelectedWorkOrder(null);
  }, []);

  return {
    showWorkOrder,
    selectedPaymentForWorkOrder,
    workOrderData,
    workOrderLoading,
    workOrderError,
    showWorkOrderView,
    showWorkOrderDelete,
    selectedWorkOrder,
    openWorkOrder,
    closeWorkOrder,
    viewWorkOrder,
    editWorkOrder,
    requestDeleteWorkOrder,
    closeWorkOrderView,
    confirmDeleteWorkOrder,
    closeWorkOrderDelete,
  };
}
