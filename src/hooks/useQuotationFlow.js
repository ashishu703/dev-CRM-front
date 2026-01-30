import { useState, useEffect } from 'react'
import { quotationService } from '../utils/globalImports'
import { QuotationHelper } from '../utils/QuotationHelper'
import Toast from '../utils/Toast'

export function useQuotationFlow(customerId, isRefreshing = false) {
  const [quotations, setQuotations] = useState([])
  const [quotationPopupData, setQuotationPopupData] = useState(null)
  const [showQuotationPopup, setShowQuotationPopup] = useState(false)

  useEffect(() => {
    if (!customerId) return
    let ignore = false
    const load = async () => {
      try {
        const res = await quotationService.getQuotationsByCustomer(customerId)
        if (!ignore && res?.success) {
          const normalized = (res.data || []).map(q => QuotationHelper.normalizeQuotation(q))
          setQuotations(normalized)
        }
      } catch (e) {
        if (!ignore) Toast.error('Failed to load quotations')
      }
    }
    load()
    return () => { ignore = true }
  }, [customerId, isRefreshing])

  useEffect(() => {
    if (!customerId) return
    const interval = setInterval(async () => {
      try {
        const res = await quotationService.getQuotationsByCustomer(customerId)
        if (res?.success) {
          const normalized = (res.data || []).map(q => QuotationHelper.normalizeQuotation(q))
          setQuotations(prev => {
            const hasChanges = normalized.some(newQ => {
              const oldQ = prev.find(p => p.id === newQ.id)
              return !oldQ || oldQ.status !== newQ.status
            })
            if (hasChanges) {
              normalized.forEach(newQ => {
                const oldQ = prev.find(p => p.id === newQ.id)
                if (oldQ && oldQ.status !== newQ.status) {
                  if (newQ.status === 'approved') Toast.success(`Quotation ${newQ.quotationNumber} has been APPROVED!`)
                  else if (newQ.status === 'rejected') Toast.error(`Quotation ${newQ.quotationNumber} has been REJECTED!`)
                }
              })
              return normalized
            }
            return prev
          })
        }
      } catch (e) {
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [customerId])

  const handleSaveQuotation = async (quotationData, viewingCustomer, quotationId = null) => {
    try {
      console.log('💾 Saving quotation with data:', quotationData);
      const isEdit = !!quotationId;
      
      const quotationPayload = {
        customerId: viewingCustomer.id, 
        customerName: viewingCustomer.name,
        customerBusiness: quotationData.billTo?.business || viewingCustomer.business,
        customerPhone: quotationData.billTo?.phone || viewingCustomer.phone,
        customerEmail: viewingCustomer.email, 
        customerAddress: quotationData.billTo?.address || viewingCustomer.address,
        customerGstNo: quotationData.billTo?.gstNo || viewingCustomer.gstNo,
        customerState: quotationData.billTo?.state || viewingCustomer.state,
        quotationDate: quotationData.quotationDate, 
        validUntil: quotationData.validUpto || quotationData.validUntil,
        branch: quotationData.selectedBranch || '', 
        subtotal: quotationData.subtotal,
        taxRate: quotationData.taxRate || 18.00, 
        taxAmount: quotationData.taxAmount,
        discountRate: quotationData.discountRate || 0, 
        discountAmount: quotationData.discountAmount || 0,
        totalAmount: quotationData.total, 
        // Pricing is already decided upstream; quotation doesn't need DH approval
        status: isEdit ? undefined : 'approved',
        template: quotationData.template || '',
        
        paymentMode: quotationData.paymentMode || '',
        transportTc: quotationData.transportTc || '',
        dispatchThrough: quotationData.dispatchThrough || '',
        deliveryTerms: quotationData.deliveryTerms || '',
        materialType: quotationData.materialType || '',
        
        bankDetails: quotationData.bankDetails || null,
        
        termsSections: quotationData.termsSections || null,
        
        billTo: quotationData.billTo || { 
          business: viewingCustomer.business, 
          buyerName: viewingCustomer.business,
          address: viewingCustomer.address, 
          phone: viewingCustomer.phone, 
          gstNo: viewingCustomer.gstNo, 
          state: viewingCustomer.state 
        },
        
        items: quotationData.items.map(item => ({
          productName: item.productName || item.description || 'Product', 
          description: item.description || item.productName || 'Product',
          hsnCode: item.hsn || item.hsnCode || '', 
          quantity: item.quantity, 
          unit: item.unit || 'Nos',
          unitPrice: item.buyerRate || item.unitPrice, 
          gstRate: item.gstRate || 18.00,
          taxableAmount: item.amount, 
          gstAmount: (item.amount * (item.gstRate || 18.00) / 100),
          totalAmount: item.amount * (1 + (item.gstRate || 18.00) / 100),
          remark: item.remark || ''
        })),
        
        // Master RFP ID for tracking (from sessionStorage)
        masterRfpId: sessionStorage.getItem('pricingRfpDecisionId') || null
      }
      
      console.log('📤 Quotation payload being sent:', quotationPayload);
      
      let response;
      if (isEdit) {
        // Update existing quotation
        response = await quotationService.updateQuotation(quotationId, quotationPayload);
        if (response.success) {
          const updatedQuotation = QuotationHelper.normalizeQuotation(response.data, viewingCustomer);
          setQuotations(prev => prev.map(q => (q.id === quotationId ? updatedQuotation : q)));
          Toast.success('Quotation updated successfully!');
          return true;
        }
      } else {
        // Create new quotation
        response = await quotationService.createQuotation(quotationPayload);
        if (response.success) {
          const newQuotation = QuotationHelper.normalizeQuotation(response.data, viewingCustomer);
          setQuotations(prev => [newQuotation, ...prev]);
          Toast.success('Quotation created and saved successfully!');
          return true;
        }
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      Toast.error(isEdit ? 'Failed to update quotation' : 'Failed to save quotation to database');
    }
    return false;
  }

  const handleViewQuotation = async (quotation) => {
    try {
      if (quotation.id) {
        const response = await quotationService.getQuotation(quotation.id)
        if (response.success) {
          const dbQuotation = response.data
          const normalized = {
            // Core identifiers
            id: dbQuotation.id,
            quotationNumber: dbQuotation.quotation_number,
            quotationDate: dbQuotation.quotation_date,
            validUpto: dbQuotation.valid_until,
            selectedBranch: dbQuotation.branch || '',
            template: dbQuotation.template || '',
            // RFP tracking (used by HTML templates)
            masterRfpId: dbQuotation.master_rfp_id || null,
            rfpId: dbQuotation.rfp_id || null,

            // Customer + bill-to info
            customerId: dbQuotation.customer_id,
            billTo: dbQuotation.bill_to || {
              business: dbQuotation.customer_business,
              buyerName: dbQuotation.customer_business,
              address: dbQuotation.customer_address,
              phone: dbQuotation.customer_phone,
              gstNo: dbQuotation.customer_gst_no,
              state: dbQuotation.customer_state
            },

            // Line items
            items: (dbQuotation.items || []).map(i => ({
              productName: i.product_name || i.productName,
              description: i.description,
              quantity: i.quantity,
              unit: i.unit || 'Nos',
              buyerRate: i.unit_price || i.buyerRate,
              unitPrice: i.unit_price || i.buyerRate,
              amount: i.taxable_amount || i.amount,
              total: i.total_amount || i.total,
              hsn: i.hsn_code || i.hsn,
              hsnCode: i.hsn_code || i.hsn,
              gstRate: i.gst_rate || i.gstRate || 18,
              remark: i.remark || ''
            })),

            // Financial summary
            subtotal: parseFloat(dbQuotation.subtotal || 0),
            discountRate: parseFloat(dbQuotation.discount_rate || 0),
            discountAmount: parseFloat(dbQuotation.discount_amount || 0),
            taxRate: parseFloat(dbQuotation.tax_rate || 18),
            taxAmount: parseFloat(dbQuotation.tax_amount || 0),
            total: parseFloat(dbQuotation.total_amount || 0),

            // Additional delivery & payment details
            paymentMode: dbQuotation.payment_mode || '',
            transportTc: dbQuotation.transport_tc || '',
            dispatchThrough: dbQuotation.dispatch_through || '',
            deliveryTerms: dbQuotation.delivery_terms || '',
            materialType: dbQuotation.material_type || '',

            // Bank + terms (handle JSON string from DB)
            bankDetails: typeof dbQuotation.bank_details === 'string'
              ? JSON.parse(dbQuotation.bank_details)
              : dbQuotation.bank_details || null,
            termsSections: typeof dbQuotation.terms_sections === 'string'
              ? JSON.parse(dbQuotation.terms_sections)
              : dbQuotation.terms_sections || null,

            // Status
            status: dbQuotation.status
          }
          setQuotationPopupData(normalized)
          setShowQuotationPopup(true)
          return
        }
      }
      setQuotationPopupData(quotation)
      setShowQuotationPopup(true)
    } catch (error) {
      Toast.error('Failed to load quotation details')
    }
  }

  const handleSendQuotation = async (quotation) => {
    // Quotation approval is no longer required (pricing already decided upstream)
    if (!quotation?.id) {
      Toast.warning('Please save the quotation first.')
      return
    }
    Toast.info('Quotation approval is not required. You can proceed to create PI.')
  }

  const handleDeleteQuotation = async (quotation) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return
    try {
      if (quotation.id) {
        const response = await quotationService.deleteQuotation(quotation.id)
        if (!response.success) {
          Toast.error('Failed to delete quotation from database')
          return
        }
      }
      setQuotations(prev => prev.filter(q => (q.quotationNumber && quotation.quotationNumber && q.quotationNumber !== quotation.quotationNumber) || (q.id && quotation.id && q.id !== quotation.id) ? false : true))
      Toast.success('Quotation deleted successfully!')
    } catch (error) {
      Toast.error('Failed to delete quotation')
    }
  }

  return {
    quotations, setQuotations, quotationPopupData, showQuotationPopup, setShowQuotationPopup,
    handleSaveQuotation, handleViewQuotation, handleSendQuotation, handleDeleteQuotation
  }
}
