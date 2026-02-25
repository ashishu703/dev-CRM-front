import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

// Small helpers copied from existing PaymentInfo logic
export const getStatusColorClass = (status) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'advance':
    case 'partial':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'due':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusIconComponent = (status) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'paid':
      return CheckCircle;
    case 'advance':
    case 'partial':
      return Clock;
    case 'due':
    case 'rejected':
      return XCircle;
    case 'pending':
      return Clock;
    default:
      return AlertCircle;
  }
};

/**
 * Build aggregated rows for Active Orders, Pending Due, Statement and Credit tabs.
 * Input: array of transformed payment objects (from paymentService.getAllPayments / backend),
 *        optional creditBalances map (customerId -> credit).
 */
export const buildAggregatesFromPayments = (filteredPayments = [], creditBalances = {}) => {
  const quotationMap = new Map();
  const ordersByQuotation = new Map();

  filteredPayments.forEach((payment) => {
    const quotationKey = payment.quotationIdRaw || payment.quotationId;
    if (!quotationKey) return;

    if (!quotationMap.has(quotationKey)) {
      quotationMap.set(quotationKey, {
        quotationId: quotationKey,
        quotationTotal: Number(payment.quotationTotal || payment.totalAmount || 0),
        quotationTotalPaid: Number(payment.quotationTotalPaid || payment.paidAmount || 0),
        quotationRemainingDue: Number(payment.quotationRemainingDue || payment.dueAmount || 0),
        status: payment.status || '',
        paymentCount: 0,
      });
    }

    const quotation = quotationMap.get(quotationKey);
    quotation.quotationTotal = Math.max(
      quotation.quotationTotal,
      Number(payment.quotationTotal || payment.totalAmount || 0),
    );
    quotation.quotationTotalPaid = Math.max(
      quotation.quotationTotalPaid,
      Number(payment.quotationTotalPaid || payment.paidAmount || 0),
    );
    quotation.quotationRemainingDue = Math.max(
      quotation.quotationRemainingDue,
      Number(payment.quotationRemainingDue || payment.dueAmount || 0),
    );
    quotation.paymentCount += 1;

    if (payment.status && payment.status !== 'Rejected') {
      if (payment.status === 'Paid') {
        quotation.status = 'Paid';
      } else if (payment.status === 'Advance' && quotation.status !== 'Paid') {
        quotation.status = 'Advance';
      } else if (payment.status === 'Due' && quotation.status !== 'Paid' && quotation.status !== 'Advance') {
        quotation.status = 'Due';
      }
    }

    // Orders rows (quotation-level)
    if (!ordersByQuotation.has(quotationKey)) {
      ordersByQuotation.set(quotationKey, {
        quotationId: quotationKey,
        quotationNumber: payment.quotationId || quotationKey,
        piNumber: payment.piId || payment.pi_number || 'N/A',
        orderId: payment.purchaseOrderId || payment.work_order_id || payment.orderId || 'N/A',
        partyName: payment.customer?.name || 'N/A',
        salespersonName: payment.salespersonName || 'N/A',
        productName: payment.productName || 'N/A',
        orderAmount: Number(payment.quotationTotal || payment.totalAmount || 0),
        paid: Number(payment.quotationTotalPaid || payment.paidAmount || 0),
        due: Number(payment.quotationRemainingDue || payment.dueAmount || 0),
        status: payment.status || 'Due',
      });
    } else {
      const agg = ordersByQuotation.get(quotationKey);
      agg.orderAmount = Math.max(
        agg.orderAmount,
        Number(payment.quotationTotal || payment.totalAmount || 0),
      );
      agg.paid = Math.max(
        agg.paid,
        Number(payment.quotationTotalPaid || payment.paidAmount || 0),
      );
      agg.due = Math.max(
        agg.due,
        Number(payment.quotationRemainingDue || payment.dueAmount || 0),
      );
      agg.status = payment.status || agg.status;
    }
  });

  const uniqueQuotations = Array.from(quotationMap.values());
  const ordersRowsAll = Array.from(ordersByQuotation.values());
  const pendingOrderRowsAll = ordersRowsAll
    .filter((r) => Number(r.due || 0) > 0)
    .sort((a, b) => Number(b.due || 0) - Number(a.due || 0));

  const statementRowsAll = filteredPayments
    .slice()
    .sort((a, b) => {
      const ad = new Date(a.paymentDate || a.created);
      const bd = new Date(b.paymentDate || b.created);
      return bd - ad;
    })
    .map((p) => ({
      id: p.id,
      partyName: p.customer?.name || 'N/A',
      amount: Number(p.amount || 0),
      paymentDate: p.paymentDate || p.created,
      method: p.paymentData?.payment_method || p.payment_method || 'N/A',
      reference: p.paymentData?.payment_reference || p.payment_reference || 'N/A',
      approvalStatus: (p.approvalStatus || p.approval_status || 'pending').toLowerCase(),
      paymentStatus: (p.paymentStatus || p.payment_status || 'pending').toLowerCase(),
      type: p.quotationId ? 'Order' : 'Advance',
      quotationId: p.quotationIdRaw || p.quotationId || null,
      remarks: p.paymentData?.remarks || p.paymentData?.notes || p.remarks || p.notes || '',
    }));

  const creditByParty = new Map();
  filteredPayments.forEach((p) => {
    const partyName = p.customer?.name || 'N/A';
    const leadId = p.leadId;
    const key = leadId || p.leadIdDisplay || partyName;
    const date = p.paymentDate || p.created;
    const creditBalanceRaw = leadId ? creditBalances[Number(leadId)] || 0 : 0;

    if (!creditByParty.has(key)) {
      creditByParty.set(key, {
        partyKey: key,
        partyName,
        lastPaymentDate: date ? new Date(date) : null,
        creditBalance: creditBalanceRaw,
      });
    } else {
      const agg = creditByParty.get(key);
      const d = date ? new Date(date) : null;
      if (d && (!agg.lastPaymentDate || d > agg.lastPaymentDate)) {
        agg.lastPaymentDate = d;
      }
      if (typeof creditBalanceRaw === 'number') {
        agg.creditBalance = creditBalanceRaw;
      }
    }
  });

  const creditRowsAll = Array.from(creditByParty.values())
    .filter((r) => Number(r.creditBalance || 0) > 0)
    .sort((a, b) => (a.partyName || '').localeCompare(b.partyName || ''))
    .map((r) => ({
      partyKey: r.partyKey,
      partyName: r.partyName,
      creditBalance: Number(r.creditBalance || 0),
      lastPaymentDate: r.lastPaymentDate,
      status: 'Credit',
    }));

  const dueQuotations = uniqueQuotations.filter((q) => {
    const dueAmount = Number(q.quotationRemainingDue || 0);
    const status = q.status || '';
    return dueAmount > 0 && status !== 'Paid' && status !== 'Rejected';
  });

  const paidQuotations = uniqueQuotations.filter((q) => q.status === 'Paid').length;
  const advanceQuotations = uniqueQuotations.filter((q) => q.status === 'Advance').length;
  const rejectedQuotations = uniqueQuotations.filter((q) => q.status === 'Rejected').length;

  const stats = {
    allPayments: filteredPayments.length,
    totalValue: filteredPayments.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0,
    ),
    paid: paidQuotations,
    advance: advanceQuotations,
    due: dueQuotations.length,
    rejected: rejectedQuotations,
  };

  return {
    ordersRowsAll,
    pendingOrderRowsAll,
    statementRowsAll,
    creditRowsAll,
    stats,
  };
};

