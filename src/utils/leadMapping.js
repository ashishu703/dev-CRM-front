/**
 * Maps API lead row to frontend lead object. Used by useSalespersonLeads and handleRefresh.
 */
export function mapApiRowToLead(r) {
  const productType = r.product_type || r.productType || r.product_name || r.productName || ''
  const productNameValue = productType && productType.trim() !== '' ? productType.trim() : 'N/A'
  const divisionRaw = r.division || r.Division || null
  let division = null
  if (divisionRaw) {
    const trimmed = String(divisionRaw).trim()
    if (trimmed && trimmed.toLowerCase() !== 'n/a' && trimmed !== '') {
      division = trimmed
    }
  }
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email || 'N/A',
    business: r.business || 'N/A',
    address: r.address || 'N/A',
    gstNo: r.gst_no || 'N/A',
    productName: productNameValue,
    product_type: productNameValue,
    state: r.state || 'N/A',
    division,
    enquiryBy: r.lead_source || 'N/A',
    customerType: r.customer_type || 'N/A',
    date: r.date ? new Date(r.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    salesStatus: r.sales_status || 'pending',
    salesStatusRemark: r.sales_status_remark || null,
    salesStatusDate: new Date(r.updated_at || r.created_at || Date.now()).toLocaleString(),
    whatsapp: r.whatsapp ? `+91${String(r.whatsapp).replace(/\D/g, '').slice(-10)}` : null,
    transferredTo: r.transferred_to || null,
    callDurationSeconds: r.call_duration_seconds || null,
    quotationUrl: r.quotation_url || null,
    proformaInvoiceUrl: r.proforma_invoice_url || null,
    paymentReceiptUrl: r.payment_receipt_url || null,
    quotationCount: typeof r.quotation_count === 'number' ? r.quotation_count : (parseInt(r.quotation_count) || 0),
    paymentStatusDb: r.payment_status || null,
    paymentModeDb: r.payment_mode || null,
    followUpStatus: r.follow_up_status || null,
    followUpRemark: r.follow_up_remark || null,
    followUpDate: r.follow_up_date ? new Date(r.follow_up_date).toISOString().split('T')[0] : null,
    followUpTime: r.follow_up_time || null,
    leadPriority: (r.lead_priority || 'LOW').toUpperCase(),
    leadScore: r.lead_score != null ? r.lead_score : 0,
    assigned_at: r.assigned_at || null,
    assignedAt: r.assigned_at || null,
    first_worked_at: r.first_worked_at || null,
    last_activity_at: r.last_activity_at || null
  }
}
