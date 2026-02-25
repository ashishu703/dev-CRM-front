/**
 * Pure mapping from payment tracking API response to UI-ready rows.
 * No React, no side effects — fully testable.
 */

function mapOrderRow(o) {
  return {
    partyName: o.party_name || 'N/A',
    orderId: o.quotation_id || 'N/A',
    quotationNumber: o.quotation_number || '',
    quotationId: o.quotation_id,
    piNumber: o.pi_number || 'N/A',
    productName: o.product_name || 'N/A',
    orderAmount: Number(o.order_amount || 0),
    paid: Number(o.total_paid || 0),
    due: Number(o.due_amount || 0),
    status: o.status || 'Due',
    salespersonName: o.salesperson_name || null,
  };
}

/** One row per product (or per order if no items). For Active Orders tab. */
function mapActiveOrderProductRow(o, item = null) {
  const base = {
    partyName: o.party_name || 'N/A',
    quotationNumber: o.quotation_number || '',
    quotationId: o.quotation_id,
    salespersonName: o.salesperson_name || null,
    confirmationDate: o.confirmation_date || null,
    deliveryStatus: o.delivery_status || '—',
    deliveryDate: o.delivery_date || null,
  };
  if (item && typeof item === 'object') {
    return {
      ...base,
      productName: item.product_name || item.productName || 'N/A',
      rate: item.rate != null ? Number(item.rate) : '—',
      quantity: item.quantity != null ? item.quantity : '—',
      unit: item.unit || '',
    };
  }
  return {
    ...base,
    productName: o.product_name || 'N/A',
    rate: o.rate != null ? Number(o.rate) : '—',
    quantity: o.quantity != null ? o.quantity : '—',
    unit: o.unit || '',
  };
}

/** Pending tab: Party, Quotation Number, Quotation ID, Pending Amount, (Salesperson). */
function mapPendingRow(o) {
  return {
    partyName: o.party_name || 'N/A',
    quotationNumber: o.quotation_number || '',
    quotationId: o.quotation_id,
    pendingAmount: Number(o.due_amount || 0),
    salespersonName: o.salesperson_name || null,
    orderId: o.quotation_id,
  };
}

function mapStatementRow(s) {
  return {
    id: s.id,
    partyName: s.customer_name || 'N/A',
    amount: Number(s.amount || 0),
    paymentDate: s.payment_date || null,
    method: s.payment_method || 'N/A',
    reference: s.payment_reference || 'N/A',
    approvalStatus: (s.approval_status || 'pending').toLowerCase(),
    paymentStatus: (s.payment_status || 'pending').toLowerCase(),
    type: s.quotation_id ? 'Order' : 'Advance',
    quotationId: s.quotation_id || null,
    remarks: '',
    receiptUrl: s.payment_receipt_url || s.receipt_url || null,
  };
}

/** Party Credit: advance (overpayment) or outstanding (delivered but due). */
function mapCreditRow(c) {
  const balance = Number(c.balance || 0);
  const creditType = balance > 0 ? 'advance' : (c.credit_type || 'advance');
  return {
    partyKey: c.customer_id,
    partyName: c.party_name || 'N/A',
    creditBalance: balance,
    lastPaymentDate: null,
    status: balance > 0 ? 'Advance Credit' : 'Outstanding Balance',
    creditType: balance > 0 ? 'advance' : 'outstanding',
    salespersonName: c.salesperson_name || null,
  };
}

/** Outstanding = delivered but due (when API provides delivery_status). */
function mapOutstandingRow(o) {
  return {
    partyKey: o.party_id || o.quotation_id,
    partyName: o.party_name || 'N/A',
    creditBalance: Number(o.due_amount || 0),
    status: 'Outstanding Balance',
    creditType: 'outstanding',
    salespersonName: o.salesperson_name || null,
  };
}

function mapSyntheticPayment(o) {
  return {
    id: o.quotation_id,
    leadId: o.lead_id,
    leadIdDisplay: o.lead_id ? `LD-${o.lead_id}` : '',
    customer: { name: o.party_name || 'N/A', email: 'N/A', phone: 'N/A' },
    productName: o.product_name || 'N/A',
    quotationTotal: Number(o.order_amount || 0),
    quotationTotalPaid: Number(o.total_paid || 0),
    quotationRemainingDue: Number(o.due_amount || 0),
    totalAmount: Number(o.order_amount || 0),
    paidAmount: Number(o.total_paid || 0),
    dueAmount: Number(o.due_amount || 0),
    status: o.status || 'Due',
    quotationId: o.quotation_number,
    quotationIdRaw: o.quotation_id,
    paymentData: o,
  };
}

/** Dedupe by quotation_id (backend may return one row per quotation_item). */
function uniqueByQuotationId(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    const id = r.quotation_id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * Map API response to all UI data structures.
 * Backend orders: one row per quotation_item (product_name, rate, quantity, unit from quotation_items).
 */
export function mapPaymentTrackingResponse(data) {
  const orders = data?.orders || [];
  const pendingDue = data?.pendingDue || [];
  const statement = data?.statement || [];
  const credit = data?.credit || [];

  const activeOrderProductRows = orders.map((o) => mapActiveOrderProductRow(o));
  const uniqueOrders = uniqueByQuotationId(orders);
  const orderRows = uniqueOrders.map(mapOrderRow);
  const pendingRows = uniqueByQuotationId(pendingDue).map(mapPendingRow);
  const statementRows = statement.map(mapStatementRow);
  const creditRows = credit.map(mapCreditRow);
  const outstandingRows = (data?.outstanding || []).map(mapOutstandingRow);
  const allPayments = uniqueOrders.map(mapSyntheticPayment);

  const targetSummary = data?.targetSummary && typeof data.targetSummary === 'object'
    ? {
        totalTarget: Number(data.targetSummary.totalTarget || 0),
        achieved: Number(data.targetSummary.achieved || 0),
        remaining: Math.max(0, Number(data.targetSummary.remaining ?? (data.targetSummary.totalTarget - data.targetSummary.achieved))),
        progressPct: Number(data.targetSummary.progressPct ?? 0),
      }
    : { totalTarget: 0, achieved: 0, remaining: 0, progressPct: 0 };

  const targetList = Array.isArray(data?.targetList)
    ? data.targetList.map((t) => ({
        salespersonName: t.salesperson_name || t.salespersonName || 'N/A',
        target: Number(t.target || 0),
        achieved: Number(t.achieved || 0),
        remaining: Math.max(0, Number(t.remaining ?? ((t.target || 0) - (t.achieved || 0)))),
        progressPct: Number(t.progressPct ?? (t.target ? ((t.achieved || 0) / t.target) * 100 : 0)),
      }))
    : [];

  return {
    orderRows,
    activeOrderProductRows,
    pendingRows,
    statementRows,
    creditRows,
    outstandingRows,
    allPayments,
    targetSummary,
    targetList,
  };
}
