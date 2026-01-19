import proformaInvoiceService from '../api/admin_api/proformaInvoiceService';
import quotationService from '../api/admin_api/quotationService';
import apiClient from '../utils/apiClient';
import toastManager from '../utils/ToastManager';

class PIService {
  async fetchAllPIs() {
    try {
      const response = await proformaInvoiceService.getAllPIs();
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching PIs:', error);
      return [];
    }
  }

  async approvePI(piId) {
    if (!confirm('Are you sure you want to approve this PI?')) return false;
    try {
      await proformaInvoiceService.updatePI(piId, { status: 'approved' });
      toastManager.success('PI approved successfully!');
      return true;
    } catch (error) {
      console.error('Error approving PI:', error);
      toastManager.error('Failed to approve PI');
      return false;
    }
  }

  async rejectPI(piId, reason) {
    if (!reason) return false;
    try {
      await proformaInvoiceService.updatePI(piId, { 
        status: 'rejected',
        rejection_reason: reason 
      });
      toastManager.success('PI rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting PI:', error);
      toastManager.error('Failed to reject PI');
      return false;
    }
  }

  async fetchPIWithQuotation(piId) {
    try {
      const piResponse = await proformaInvoiceService.getPI(piId);
      if (!piResponse || !piResponse.success) {
        alert('Failed to fetch PI details');
        return null;
      }

      const pi = piResponse.data;
      const quotationResponse = await quotationService.getCompleteData(pi.quotation_id);
      
      if (!quotationResponse || !quotationResponse.success) {
        alert('Failed to fetch quotation details');
        return null;
      }

      const completeQuotation = quotationResponse.data?.quotation || quotationResponse.data || {};
      const quotationItems = completeQuotation.items || [];

      if (!quotationItems || quotationItems.length === 0) {
        alert(`No items found in quotation!\n\nQuotation ID: ${pi.quotation_id}`);
        return null;
      }

      return { pi, completeQuotation, quotationItems };
    } catch (error) {
      console.error('Error fetching PI with quotation:', error);
      toastManager.error('Failed to load PI details');
      return null;
    }
  }

  buildPIItems(quotationItems) {
    return quotationItems.map((item) => ({
      id: item.id || Math.random(),
      description: item.product_name || item.productName || item.description || 'Product',
      subDescription: item.description || '',
      hsn: item.hsn_code || item.hsn || item.hsnCode || '85446090',
      dueOn: new Date().toISOString().split('T')[0],
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'Nos',
      rate: Number(item.unit_price || item.buyer_rate || item.unitPrice || 0),
      buyerRate: Number(item.unit_price || item.buyer_rate || item.unitPrice || 0),
      amount: Number(item.taxable_amount ?? item.amount ?? item.taxable ?? item.total_amount ?? item.total ?? 0),
      gstRate: Number(item.gst_rate ?? item.gstRate ?? 18),
      gstMultiplier: 1 + Number(item.gst_rate ?? item.gstRate ?? 18) / 100
    }));
  }

  async calculateAdvancePayment(quotationId, piTotal, quotationTotal) {
    let advancePayment = 0;
    let originalQuotationTotal = quotationTotal;
    
    try {
      const payRes = await apiClient.get(`/api/payments/quotation/${quotationId}`);
      const allPayments = payRes?.data || [];
      advancePayment = allPayments
        .filter(p => {
          const approvalStatus = (p.approval_status || p.accounts_approval_status || '').toLowerCase();
          return approvalStatus === 'approved';
        })
        .reduce((sum, p) => {
          const amount = Number(p.installment_amount || p.paid_amount || p.amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      
      if (advancePayment > 0 && quotationTotal > 0) {
        originalQuotationTotal = quotationTotal;
      }
    } catch (e) {
      if (piTotal > 0 && quotationTotal > 0 && piTotal < quotationTotal) {
        advancePayment = quotationTotal - piTotal;
        originalQuotationTotal = quotationTotal;
      }
    }
    
    return { advancePayment, originalQuotationTotal };
  }

  calculatePITotals(mappedItems, completeQuotation, pi) {
    const subtotal = mappedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const discountRate = Number(completeQuotation.discount_rate ?? completeQuotation.discountRate ?? 0);
    const discountAmount = Number(completeQuotation.discount_amount ?? completeQuotation.discountAmount ?? (subtotal * discountRate) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = Number(completeQuotation.tax_rate ?? completeQuotation.taxRate ?? 18);
    const taxAmount = Number(completeQuotation.tax_amount ?? completeQuotation.taxAmount ?? (taxableAmount * taxRate) / 100);
    const piTotal = Number(pi.total_amount ?? 0);
    const quotationTotal = Number(completeQuotation.total_amount ?? completeQuotation.total ?? 0);
    
    return { subtotal, discountRate, discountAmount, taxableAmount, taxRate, taxAmount, piTotal, quotationTotal };
  }

  calculateFinalTotal(piTotal, quotationTotal, advancePayment, originalQuotationTotal) {
    let finalTotal = quotationTotal;
    
    if (advancePayment > 0 && originalQuotationTotal > 0) {
      finalTotal = originalQuotationTotal - advancePayment;
      if (piTotal > 0 && Math.abs(piTotal - finalTotal) > 0.01) {
        if (piTotal <= originalQuotationTotal) {
          finalTotal = piTotal;
        }
      }
    } else if (piTotal > 0) {
      finalTotal = piTotal;
    }
    
    return finalTotal;
  }

  buildBillTo(completeQuotation, pi, customerData = null) {
    // Extract raw values from multiple sources
    const rawBusiness = completeQuotation.customer_business || 
                        completeQuotation.customer_name ||
                        completeQuotation.billTo?.business || 
                        pi.customer_business ||
                        customerData?.business || '';
    
    const rawName = completeQuotation.contact_person || 
                    completeQuotation.customer_contact ||
                    completeQuotation.billTo?.name ||
                    customerData?.name ||
                    customerData?.contact_person || '';
    
    const rawGst = completeQuotation.customer_gst_no || 
                   completeQuotation.billTo?.gstNo || 
                   customerData?.gstNo ||
                   customerData?.gst_no || '';
    
    return {
      // If business is N/A, use name as business
      business: (rawBusiness && rawBusiness !== 'N/A') ? rawBusiness : rawName,
      buyerName: rawName,
      name: rawName,
      address: completeQuotation.customer_address || completeQuotation.billTo?.address || customerData?.address || '',
      phone: completeQuotation.customer_phone || completeQuotation.billTo?.phone || customerData?.phone || customerData?.mobile || '',
      gstNo: (rawGst && rawGst !== 'N/A') ? rawGst : '',
      state: completeQuotation.customer_state || completeQuotation.billTo?.state || customerData?.state || ''
    };
  }

  buildPIPreviewData(pi, completeQuotation, mappedItems, totals, finalTotal, advancePayment, originalQuotationTotal, billTo) {
    return {
      quotationNumber: completeQuotation.quotation_number || pi.pi_number,
      items: mappedItems,
      subtotal: totals.subtotal,
      discountRate: totals.discountRate,
      discountAmount: totals.discountAmount,
      taxableAmount: totals.taxableAmount,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      total: finalTotal,
      originalQuotationTotal: advancePayment > 0 ? originalQuotationTotal : 0,
      advancePayment: advancePayment,
      billTo,
      dispatchMode: pi.dispatch_mode,
      shippingDetails: {
        transportName: pi.transport_name,
        vehicleNumber: pi.vehicle_number,
        transportId: pi.transport_id,
        lrNo: pi.lr_no,
        courierName: pi.courier_name,
        consignmentNo: pi.consignment_no,
        byHand: pi.by_hand,
        postService: pi.post_service,
        carrierName: pi.carrier_name,
        carrierNumber: pi.carrier_number
      }
    };
  }
}

export default PIService;

