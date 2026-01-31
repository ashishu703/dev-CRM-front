import { useState } from 'react'
import { proformaInvoiceService, apiClient, quotationService } from '../utils/globalImports'
import Toast from '../utils/Toast'

export function usePIFlow(viewingCustomer, viewingCustomerForQuotation, selectedBranch) {
  const [quotationPIs, setQuotationPIs] = useState({})
  const [quotationPayments, setQuotationPayments] = useState({})
  const [savedPiPreview, setSavedPiPreview] = useState(null)
  const [showPIPreview, setShowPIPreview] = useState(false)

  const fetchPIsForQuotation = async (quotationId) => {
    try {
      const response = await proformaInvoiceService.getPIsByQuotation(quotationId)
      if (response?.success) {
        setQuotationPIs(prev => ({ ...prev, [quotationId]: response.data || [] }))
      }
    } catch (error) {
      Toast.error('Failed to fetch PIs')
    }
  }

  const fetchPaymentsForQuotation = async (quotationId) => {
    try {
      const payRes = await apiClient.get(`/api/payments/quotation/${quotationId}`)
      const allPayments = payRes?.data || []
      const approvedAmount = allPayments
        .filter(p => (p.approval_status || p.accounts_approval_status || '').toLowerCase() === 'approved')
        .reduce((sum, p) => sum + (Number(p.installment_amount || p.paid_amount || p.amount || 0) || 0), 0)
      setQuotationPayments(prev => ({ ...prev, [quotationId]: approvedAmount }))
      return approvedAmount
    } catch (e) {
      return 0
    }
  }

  const handleSendPIForApproval = async (piId, quotationId) => {
    try {
      await proformaInvoiceService.updatePI(piId, { status: 'pending_approval' })
      Toast.success('PI sent for approval!')
      await fetchPIsForQuotation(quotationId)
    } catch (error) {
      Toast.error('Failed to send PI for approval')
    }
  }

  const handleDeletePI = async (piId, quotationId) => {
    if (!window.confirm('Are you sure you want to delete this PI?')) return
    try {
      await proformaInvoiceService.deletePI(piId)
      Toast.success('PI deleted successfully!')
      await fetchPIsForQuotation(quotationId)
    } catch (error) {
      Toast.error('Failed to delete PI')
    }
  }

  const handleViewPI = async (piId, quotation) => {
    try {
      const piResponse = await proformaInvoiceService.getPI(piId)
      if (!piResponse?.success) {
        Toast.error('Failed to fetch PI details')
        return
      }
      const pi = piResponse.data || piResponse
      if (!pi) {
        Toast.error('PI data not found')
        return
      }
      const quotationResponse = await quotationService.getCompleteData(quotation.id)
      if (!quotationResponse?.success) {
        Toast.error('Failed to fetch quotation details')
        return
      }
      const completeQuotation = quotationResponse.data?.quotation || quotationResponse.data
      if (!completeQuotation) {
        Toast.error('Quotation data not found')
        return
      }
      const quotationItems = completeQuotation.items || []
      const mappedItems = quotationItems.map(item => ({
        id: item.id || Math.random(), 
        productName: item.product_name || item.productName || item.description || 'Product',
        description: item.product_name || item.productName || item.description || 'Product', 
        subDescription: item.description || '',
        hsn: item.hsn_code || item.hsn || item.hsnCode || '85446090',
        hsnCode: item.hsn_code || item.hsn || item.hsnCode || '85446090',
        dueOn: new Date().toISOString().split('T')[0],
        quantity: Number(item.quantity) || 1, 
        unit: item.unit || 'Nos',
        rate: Number(item.buyer_rate || item.unit_price || item.unitPrice || item.buyerRate || 0),
        buyerRate: Number(item.unit_price || item.buyer_rate || item.unitPrice || item.buyerRate || 0),
        amount: Number(item.taxable_amount ?? item.amount ?? item.taxable ?? item.total_amount ?? item.total ?? 0),
        gstRate: Number(item.gst_rate ?? item.gstRate ?? 18), 
        gstMultiplier: 1 + Number(item.gst_rate ?? item.gstRate ?? 18) / 100
      }))
      
      const toInt = (v) => Math.round(Number(v) || 0)
      const subtotal = toInt(mappedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0))
      const discountRate = Number(completeQuotation.discount_rate ?? completeQuotation.discountRate ?? 0)
      const discountAmount = toInt(Number(completeQuotation.discount_amount ?? completeQuotation.discountAmount ?? (subtotal * discountRate) / 100))
      const taxableAmount = toInt(Math.max(0, subtotal - discountAmount))
      const taxRate = Number(completeQuotation.tax_rate ?? completeQuotation.taxRate ?? 18)
      const taxAmount = toInt(Number(completeQuotation.tax_amount ?? completeQuotation.taxAmount ?? (taxableAmount * taxRate) / 100))
      const piTotal = Number(pi.total_amount ?? pi.totalAmount ?? 0)
      const quotationTotal = Number(completeQuotation.total_amount ?? completeQuotation.total ?? 0)
      const total = piTotal > 0 ? piTotal : (quotationTotal > 0 ? quotationTotal : (taxableAmount + taxAmount))
      
      let advancePayment = 0
      let originalQuotationTotal = quotationTotal
      let approvedPayments = []
      try {
        const payRes = await apiClient.get(`/api/payments/quotation/${quotation.id}`)
        const allPayments = payRes?.data || []
        const approvedOnly = allPayments.filter(
          p => (p.approval_status || p.accounts_approval_status || '').toLowerCase() === 'approved'
        )
        advancePayment = approvedOnly.reduce(
          (sum, p) => sum + (Number(p.installment_amount || p.paid_amount || p.amount || 0) || 0),
          0
        )
        approvedPayments = approvedOnly.map((payment) => {
          const paymentDate = payment.payment_date || payment.created_at || ''
          let formattedDate = ''
          if (paymentDate) {
            try {
              formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            } catch (e) {
              formattedDate = paymentDate
            }
          }
          const amountRaw = Number(payment.installment_amount || payment.paid_amount || payment.amount || 0)
          return {
            date: formattedDate,
            mode: payment.payment_method || 'N/A',
            refNo: payment.payment_reference || payment.id || '',
            amount: amountRaw.toFixed(2),
            amountRaw
          }
        })
        if (advancePayment > 0 && quotationTotal > 0) originalQuotationTotal = quotationTotal
      } catch (e) {
        if (piTotal > 0 && quotationTotal > 0 && piTotal < quotationTotal) {
          advancePayment = quotationTotal - piTotal
          originalQuotationTotal = quotationTotal
        }
      }

      const totalAdvanceRaw = approvedPayments.reduce((sum, payment) => sum + (payment.amountRaw || 0), 0)
      const totalAdvanceValue = totalAdvanceRaw || advancePayment || 0
      const balanceDue = Math.max(0, quotationTotal - totalAdvanceValue)
      const formattedTotalAdvance = totalAdvanceValue.toFixed(2)
      const formattedBalanceDue = balanceDue.toFixed(2)
      
      let finalTotal = total
      if (advancePayment > 0 && originalQuotationTotal > 0) {
        finalTotal = originalQuotationTotal - advancePayment
        if (piTotal > 0 && Math.abs(piTotal - finalTotal) > 0.01 && piTotal <= originalQuotationTotal) finalTotal = piTotal
      }
      
      const customerData = viewingCustomerForQuotation || viewingCustomer
      if (!customerData) {
        Toast.error('Customer data not found')
        return
      }
      
      // Extract raw values
      const rawBusiness = customerData.business || customerData.business_name || completeQuotation.customer_business || ''
      const rawName = customerData.name || customerData.contact_person || completeQuotation.contact_person || ''
      
      // Build billTo object - if business is N/A, use name as business
      const billTo = {
        business: (rawBusiness && rawBusiness !== 'N/A') ? rawBusiness : rawName,
        buyerName: rawName,
        name: rawName,
        address: customerData.address || completeQuotation.customer_address || '',
        phone: customerData.phone || customerData.mobile || completeQuotation.customer_phone || '',
        gstNo: (customerData.gstNo || customerData.gst_no || completeQuotation.customer_gst_no || '') !== 'N/A' 
          ? (customerData.gstNo || customerData.gst_no || completeQuotation.customer_gst_no || '') 
          : '',
        state: customerData.state || completeQuotation.customer_state || ''
      }

      // Normalize PI date
      const rawPiDate = pi.pi_date || pi.piDate || pi.created_at
      const piDate = rawPiDate ? new Date(rawPiDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      const validUntil = pi.valid_until || pi.validUntil || completeQuotation.valid_until || ''

      // Parse bank details from quotation
      const rawBankDetails = completeQuotation.bank_details || completeQuotation.bankDetails
      let bankDetails = null
      try {
        if (rawBankDetails) {
          bankDetails = typeof rawBankDetails === 'string' ? JSON.parse(rawBankDetails) : rawBankDetails
        }
      } catch (e) {
        // Bank details parsing failed, will use null
      }

      // Parse terms from quotation
      const rawTerms = completeQuotation.terms_sections || completeQuotation.termsSections
      let terms = []
      try {
        const baseTerms = typeof rawTerms === 'string' ? JSON.parse(rawTerms) : rawTerms
        if (Array.isArray(baseTerms)) {
          terms = baseTerms.map(sec => ({
            title: sec.title || '',
            points: Array.isArray(sec.points) ? sec.points : []
          }))
        }
      } catch (e) {
        // Terms parsing failed, will use empty array
      }

      const piPreviewData = {
        // Quotation ref
        quotationNumber: quotation.quotationNumber || quotation.quotation_number || pi.pi_number || '',
        quotationDate: piDate,
        
        // PI header identifiers (for template)
        invoiceNumber: pi.pi_number || pi.piNumber || '',
        invoiceDate: piDate,
        piNumber: pi.pi_number || pi.piNumber || '',
        piDate: piDate,
        piId: pi.pi_number || pi.id,
        validUpto: validUntil,
        piValidUpto: validUntil,
        
        // Items with HSN
        items: mappedItems.map(item => ({
          ...item,
          hsn: item.hsn || '85446090',
          hsnCode: item.hsn || '85446090'
        })),
        
        // Financial totals
        subtotal, 
        discountRate, 
        discountAmount, 
        taxableAmount, 
        taxRate, 
        taxAmount, 
        total: finalTotal,
        originalQuotationTotal: totalAdvanceValue > 0 ? originalQuotationTotal : 0,
        advancePayment: totalAdvanceValue,
        advancePayments: approvedPayments,
        totalAdvance: formattedTotalAdvance,
        balanceDue: formattedBalanceDue,
        
        // Customer details
        billTo,
        
        // Additional details from quotation (for template)
        paymentMode: completeQuotation.payment_mode || completeQuotation.paymentMode || '',
        transportTc: completeQuotation.transport_tc || completeQuotation.transportTc || '',
        dispatchThrough: completeQuotation.dispatch_through || completeQuotation.dispatchThrough || '',
        deliveryTerms: completeQuotation.delivery_terms || completeQuotation.deliveryTerms || '',
        materialType: completeQuotation.material_type || completeQuotation.materialType || '',
        
        // Textual terms
        paymentTerms: completeQuotation.payment_terms || completeQuotation.paymentTerms || '',
        validity: validUntil,
        warranty: completeQuotation.warranty || '',
        
        // Dispatch mode & shipping
        dispatchMode: pi.dispatch_mode || pi.dispatchMode || null,
        shippingDetails: {
          transportName: pi.transport_name || pi.transportName || null, 
          vehicleNumber: pi.vehicle_number || pi.vehicleNumber || null,
          transportId: pi.transport_id || pi.transportId || null, 
          lrNo: pi.lr_no || pi.lrNo || null,
          courierName: pi.courier_name || pi.courierName || null, 
          consignmentNo: pi.consignment_no || pi.consignmentNo || null,
          byHand: pi.by_hand || pi.byHand || null, 
          postService: pi.post_service || pi.postService || null,
          carrierName: pi.carrier_name || pi.carrierName || null, 
          carrierNumber: pi.carrier_number || pi.carrierNumber || null
        },
        
        // Bank details & terms & conditions (for template footer)
        bankDetails,
        terms,

        // RFP ID from quotation (for PI template - Lead → RFP → Quotation → PI)
        rfpId: completeQuotation.rfp_id || completeQuotation.rfpId || pi.master_rfp_id || null,
        masterRfpId: completeQuotation.master_rfp_id || completeQuotation.masterRfpId || pi.master_rfp_id || null,
        rfp_id: completeQuotation.rfp_id || completeQuotation.rfpId || null,
        master_rfp_id: completeQuotation.master_rfp_id || completeQuotation.masterRfpId || pi.master_rfp_id || null
      }
      
      // PI must use its own template key
      const templateKey = pi.template;
      if (!templateKey) {
        Toast.error('This PI has no template. Please delete and recreate this PI with a PI template.')
        return
      }
      
      setSavedPiPreview({ 
        data: piPreviewData, 
        selectedBranch: completeQuotation.branch || selectedBranch, 
        template: templateKey
      })
      setShowPIPreview(true)
    } catch (error) {
      Toast.error(`Failed to load PI details: ${error.message || 'Unknown error'}`)
    }
  }

  return {
    quotationPIs, quotationPayments, savedPiPreview, showPIPreview, setShowPIPreview,
    fetchPIsForQuotation, fetchPaymentsForQuotation, handleSendPIForApproval, handleDeletePI, handleViewPI
  }
}
