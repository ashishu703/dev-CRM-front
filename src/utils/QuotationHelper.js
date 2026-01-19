// Utility class for quotation-related operations
export class QuotationHelper {
  static isApproved(quotation) {
    return (quotation?.status || '').toLowerCase() === 'approved'
  }

  static isPaymentCompleted(quotation) {
    const status = (quotation?.status || '').toLowerCase()
    return ['completed', 'paid', 'deal_closed', 'closed'].includes(status)
  }

  static normalizeQuotation(quotation, customer = null) {
    return {
      id: quotation.id,
      quotationNumber: quotation.quotation_number || quotation.quotationNumber,
      customerId: quotation.customer_id || quotation.customerId,
      quotationDate: quotation.quotation_date || quotation.quotationDate,
      total: quotation.total_amount || quotation.total,
      status: quotation.status,
      createdAt: quotation.created_at || quotation.createdAt,
      branch: quotation.branch,
      template: quotation.template,
      billTo: quotation.bill_to || quotation.billTo || this.buildBillTo(quotation, customer),
      items: quotation.items || []
    }
  }

  static buildBillTo(quotation, customer) {
    return {
      business: customer?.business || quotation.customer_business || '',
      address: customer?.address || quotation.customer_address || '',
      phone: customer?.phone || quotation.customer_phone || '',
      gstNo: customer?.gstNo || quotation.customer_gst_no || '',
      state: customer?.state || quotation.customer_state || '',
      transport: quotation.transport || quotation.transport_company || quotation.transportCompany || null
    }
  }
}
