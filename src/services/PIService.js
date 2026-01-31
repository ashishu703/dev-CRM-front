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
      const id = typeof piId === 'object' ? piId?.id : piId;
      if (!id) {
        toastManager.error('Invalid PI');
        return false;
      }
      const summaryRes = await proformaInvoiceService.getSummary(id).catch(() => null);
      const pi = summaryRes?.data ?? summaryRes;
      if (pi?.parent_pi_id) {
        await proformaInvoiceService.approveRevisedPI(id);
      } else {
        await proformaInvoiceService.updatePI(id, { status: 'approved' });
      }
      toastManager.success('PI approved successfully!');
      return true;
    } catch (error) {
      console.error('Error approving PI:', error);
      const msg = error?.data?.message ?? error?.message ?? 'Failed to approve PI';
      toastManager.error(msg);
      return false;
    }
  }

  async rejectPI(piId, reason) {
    if (!reason) return false;
    try {
      const id = typeof piId === 'object' ? piId?.id : piId;
      if (!id) {
        toastManager.error('Invalid PI');
        return false;
      }
      const summaryRes = await proformaInvoiceService.getSummary(id).catch(() => null);
      const pi = summaryRes?.data ?? summaryRes;
      if (pi?.parent_pi_id) {
        await proformaInvoiceService.rejectRevisedPI(id, reason);
      } else {
        await proformaInvoiceService.updatePI(id, { status: 'rejected', rejection_reason: reason });
      }
      toastManager.success('PI rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting PI:', error);
      const msg = error?.data?.message ?? error?.message ?? 'Failed to reject PI';
      toastManager.error(msg);
      return false;
    }
  }

  /**
   * Fetch PI for View: summary first, then quotation + products + payments in parallel.
   * Does not mutate original PI or quotation. Uses split APIs for fast load.
   */
  async fetchPIWithQuotation(piId) {
    try {
      const summaryRes = await proformaInvoiceService.getSummary(piId);
      if (!summaryRes || !summaryRes.success) {
        alert('Failed to fetch PI details');
        return null;
      }

      const pi = summaryRes.data;
      const quotationId = pi.quotation_id;

      const [quotationResponse, productsRes, paymentsRes] = await Promise.all([
        quotationService.getQuotation(quotationId),
        proformaInvoiceService.getProducts(piId).catch(() => ({ success: true, data: [] })),
        proformaInvoiceService.getPaymentsOnly(piId).catch(() => ({ success: true, data: [] }))
      ]);

      if (!quotationResponse || !quotationResponse.success) {
        alert('Failed to fetch quotation details');
        return null;
      }

      const completeQuotation = quotationResponse.data || {};
      const rawItems = Array.isArray(productsRes?.data) ? productsRes.data : [];
      const quotationItems = rawItems.map((item) => ({
        id: item.id || Math.random(),
        description: item.product_name || item.productName || item.description || 'Product',
        subDescription: item.description || '',
        hsn: item.hsn_code || item.hsn || item.hsnCode || '85446090',
        dueOn: new Date().toISOString().split('T')[0],
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'Nos',
        rate: Number(item.unit_price ?? item.buyer_rate ?? item.unitPrice ?? 0),
        buyerRate: Number(item.unit_price ?? item.buyer_rate ?? item.unitPrice ?? 0),
        amount: Number(item.taxable_amount ?? item.amount ?? item.total_amount ?? 0),
        gstRate: Number(item.gst_rate ?? item.gstRate ?? 18),
        gstMultiplier: 1 + Number(item.gst_rate ?? item.gstRate ?? 18) / 100
      }));
      const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];

      return { pi, completeQuotation, quotationItems, payments };
    } catch (error) {
      console.error('Error fetching PI with quotation:', error);
      toastManager.error('Failed to load PI details');
      return null;
    }
  }

  /**
   * Build PI line items from quotation items (display only; never mutates original PI or quotation).
   * When pi is a revised PI (parent_pi_id + amendment_detail), only effective items are returned:
   * - Items in removed_item_ids are excluded.
   * - Items in reduced_items get the reduced quantity and recalculated amount.
   * @param {Array} quotationItems - quotation items
   * @param {Object|null} pi - PI row (optional); if revised, amendment_detail is applied for display only
   */
  buildPIItems(quotationItems, pi = null) {
    let effectiveItems = quotationItems;
    let amendmentDetail = null;
    if (pi?.parent_pi_id && pi?.amendment_detail) {
      try {
        amendmentDetail = typeof pi.amendment_detail === 'string'
          ? JSON.parse(pi.amendment_detail)
          : pi.amendment_detail;
      } catch (e) {
        amendmentDetail = null;
      }
    }
    if (amendmentDetail) {
      const removedIds = new Set((amendmentDetail.removed_item_ids || []).map((id) => String(id)));
      const reducedMap = (amendmentDetail.reduced_items || []).reduce((acc, item) => {
        const qid = item.quotation_item_id ?? item.quotationItemId;
        if (qid != null) acc[String(qid)] = Number(item.quantity) || 0;
        return acc;
      }, {});
      effectiveItems = quotationItems
        .filter((item) => !removedIds.has(String(item.id ?? item.quotation_item_id ?? '')))
        .map((item) => {
          const id = String(item.id ?? item.quotation_item_id ?? '');
          const origQty = Number(item.quantity) || 1;
          const origAmount = Number(item.taxable_amount ?? item.amount ?? item.total_amount ?? item.total ?? 0);
          const qty = reducedMap[id] !== undefined ? reducedMap[id] : origQty;
          const amount = origQty > 0 ? (origAmount / origQty) * qty : 0;
          const unitPrice = Number(item.unit_price ?? item.buyer_rate ?? item.unitPrice ?? 0);
          return {
            id: item.id || Math.random(),
            description: item.product_name || item.productName || item.description || 'Product',
            subDescription: item.description || '',
            hsn: item.hsn_code || item.hsn || item.hsnCode || '85446090',
            dueOn: new Date().toISOString().split('T')[0],
            quantity: qty,
            unit: item.unit || 'Nos',
            rate: unitPrice,
            buyerRate: unitPrice,
            amount,
            gstRate: Number(item.gst_rate ?? item.gstRate ?? 18),
            gstMultiplier: 1 + Number(item.gst_rate ?? item.gstRate ?? 18) / 100
          };
        });
      return effectiveItems;
    }
    return effectiveItems.map((item) => ({
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
    const toInt = (v) => Math.round(Number(v) || 0);
    // Revised PI: use stored totals from the PI row so approval view shows correct figures
    const isRevised = pi?.parent_pi_id != null;
    const piSubtotal = Number(pi?.subtotal);
    const piTaxAmount = Number(pi?.tax_amount);
    const piTotal = Number(pi?.total_amount ?? 0);
    const quotationTotal = Number(completeQuotation.total_amount ?? completeQuotation.total ?? 0);
    const taxRate = Number(completeQuotation.tax_rate ?? completeQuotation.taxRate ?? 18);

    if (isRevised && (piSubtotal >= 0 || piTaxAmount >= 0) && piTotal > 0) {
      const subtotalRaw = !isNaN(piSubtotal) && piSubtotal >= 0 ? piSubtotal : mappedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
      const subtotal = toInt(subtotalRaw);
      const taxAmountRaw = !isNaN(piTaxAmount) && piTaxAmount >= 0 ? piTaxAmount : (subtotal * taxRate) / 100;
      const taxAmount = toInt(taxAmountRaw);
      const discountRate = Number(completeQuotation.discount_rate ?? completeQuotation.discountRate ?? 0);
      const discountAmount = toInt(Number(completeQuotation.discount_amount ?? completeQuotation.discountAmount ?? (subtotal * discountRate) / 100));
      const taxableAmount = toInt(Math.max(0, subtotal - discountAmount));
      return {
        subtotal,
        discountRate,
        discountAmount,
        taxableAmount,
        taxRate,
        taxAmount,
        piTotal,
        quotationTotal
      };
    }

    const subtotalRaw = mappedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const subtotal = toInt(subtotalRaw);
    const discountRate = Number(completeQuotation.discount_rate ?? completeQuotation.discountRate ?? 0);
    const discountAmount = toInt(Number(completeQuotation.discount_amount ?? completeQuotation.discountAmount ?? (subtotal * discountRate) / 100));
    const taxableAmount = toInt(Math.max(0, subtotal - discountAmount));
    const taxAmount = toInt(Number(completeQuotation.tax_amount ?? completeQuotation.taxAmount ?? (taxableAmount * taxRate) / 100));

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

