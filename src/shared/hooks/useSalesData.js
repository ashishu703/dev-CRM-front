import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeadsSalesperson,
  fetchLeadsDepartmentHead,
  fetchUserTarget,
  setBusinessMetrics,
  setChartData,
} from '../../features/sales/salesSlice';
import {
  selectAllLeads,
  selectLeadsLoading,
  selectLeadsError,
  selectUserTarget,
  selectTargetLoading,
  selectBusinessMetrics,
  selectChartData,
} from '../../features/sales/selectors';
import { useAuth } from '../../hooks/useAuth';
import salesDataService from '../../services/SalesDataService';
import quotationService from '../../api/admin_api/quotationService';
import paymentService from '../../api/admin_api/paymentService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';

export function useSalesData(options = {}) {
  const { role = 'salesperson', departmentType = 'office_sales' } = options;
  const { user } = useAuth();
  const dispatch = useDispatch();

  const leads = useSelector(selectAllLeads);
  const leadsLoading = useSelector(selectLeadsLoading);
  const leadsError = useSelector(selectLeadsError);
  const userTarget = useSelector(selectUserTarget);
  const targetLoading = useSelector(selectTargetLoading);
  const businessMetrics = useSelector(selectBusinessMetrics);
  const chartData = useSelector(selectChartData);

  const loadLeads = useCallback(() => {
    if (role === 'department_head') {
      dispatch(fetchLeadsDepartmentHead(departmentType));
    } else {
      dispatch(fetchLeadsSalesperson());
    }
  }, [dispatch, role, departmentType]);

  const loadUserTarget = useCallback(() => {
    dispatch(
      fetchUserTarget({
        role: user?.role || 'department_user',
        userId: user?.id,
      })
    );
  }, [dispatch, user?.id, user?.role]);

  const loadBusinessMetrics = useCallback(
    async (startDate = null, endDate = null) => {
      const leadIds = leads.map((l) => l.id);
      if (leadIds.length === 0) {
        dispatch(
          setBusinessMetrics({
            totalQuotation: 0,
            approvedQuotation: 0,
            pendingQuotation: 0,
            rejectedQuotation: 0,
            totalPI: 0,
            approvedPI: 0,
            pendingPI: 0,
            rejectedPI: 0,
            totalAdvancePayment: 0,
            duePayment: 0,
            totalSaleOrder: 0,
            totalReceivedPayment: 0,
            totalRevenue: 0,
          })
        );
        dispatch(setChartData({ allPayments: [], allQuotations: [], allPIs: [] }));
        return;
      }
      try {
        const [allQuotations, paymentsRes, allPIs] = await Promise.all([
          salesDataService.fetchQuotations(leadIds),
          paymentService.getAllPayments({}),
          (async () => {
            const qList = await salesDataService.fetchQuotations(leadIds);
            const qIds = (Array.isArray(qList) ? qList : []).map((q) => q.id).filter(Boolean);
            return qIds.length ? salesDataService.fetchProformaInvoices(qIds) : [];
          })(),
        ]);
        const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []);
        const quotations = Array.isArray(allQuotations) ? allQuotations : [];
        const pis = Array.isArray(allPIs) ? allPIs : [];

        const quotationMetrics = salesDataService.calculateQuotationMetrics(quotations);
        const piMetrics = salesDataService.calculatePIMetrics(pis);
        const quotationsWithPI = quotations.filter(
          (q) => (q.status || '').toLowerCase() === 'approved' && pis.some((pi) => pi.quotation_id === q.id)
        );
        const duePayment = await salesDataService.calculateDuePayment(quotationsWithPI, quotations, payments);
        const { totalReceived, totalAdvance } = salesDataService.calculatePaymentMetrics(
          payments,
          quotationsWithPI,
          quotations,
          { startDate, endDate }
        );
        const totalRevenue = quotations
          .filter((q) => (q.status || '').toLowerCase() === 'approved')
          .reduce((sum, q) => sum + Number(q.total_amount ?? q.total ?? 0) || 0, 0);

        dispatch(
          setBusinessMetrics({
            totalQuotation: quotationMetrics.total,
            approvedQuotation: quotationMetrics.approved,
            pendingQuotation: quotationMetrics.pending,
            rejectedQuotation: quotationMetrics.rejected ?? 0,
            totalPI: piMetrics.total,
            approvedPI: piMetrics.approved,
            pendingPI: piMetrics.pending,
            rejectedPI: piMetrics.rejected ?? 0,
            totalAdvancePayment: totalAdvance,
            duePayment,
            totalSaleOrder: piMetrics.approved,
            totalReceivedPayment: totalReceived,
            totalRevenue,
          })
        );
        dispatch(setChartData({ allPayments: payments, allQuotations: quotations, allPIs: pis }));
      } catch {
        dispatch(setBusinessMetrics({}));
        dispatch(setChartData({ allPayments: [], allQuotations: [], allPIs: [] }));
      }
    },
    [dispatch, leads]
  );

  const refresh = useCallback(() => {
    loadLeads();
    loadUserTarget();
  }, [loadLeads, loadUserTarget]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    loadUserTarget();
  }, [loadUserTarget]);

  useEffect(() => {
    if (leads.length > 0) {
      loadBusinessMetrics();
    }
  }, [leads.length]);

  return {
    leads,
    leadsLoading,
    leadsError,
    userTarget,
    targetLoading,
    businessMetrics,
    allPayments: chartData.allPayments ?? [],
    allQuotations: chartData.allQuotations ?? [],
    allPIs: chartData.allPIs ?? [],
    loadLeads,
    loadUserTarget,
    loadBusinessMetrics,
    refresh,
  };
}
