import { useState } from 'react';
import quotationService from '../api/admin_api/quotationService';
import proformaInvoiceService from '../api/admin_api/proformaInvoiceService';
import paymentService from '../api/admin_api/paymentService';
import Toast from '../utils/Toast';
import { QuotationDataMapper } from '../utils/QuotationDataMapper';

/**
 * Shared hook for viewing Quotations and PIs in modal
 * Follows DRY principle - reusable across all components
 */
export function useViewQuotationPI(companyBranches, user) {
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationModalData, setQuotationModalData] = useState(null);
  const [showPIModal, setShowPIModal] = useState(false);
  const [piModalData, setPiModalData] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * View quotation in modal
   * @param {Object|string} quotation - Quotation object or quotation ID
   */
  const handleViewQuotation = async (quotation) => {
    try {
      setLoading(true);
      
      // Get quotation ID
      const quotationId = typeof quotation === 'object' ? quotation?.id : quotation;
      if (!quotationId) {
        Toast.error('Quotation ID is required');
        return;
      }

      // Fetch complete quotation data with all fields from DB
      const response = await quotationService.getQuotation(quotationId);
      
      if (!response?.success || !response?.data) {
        Toast.error('Failed to fetch quotation details');
        return;
      }

      const dbQuotation = response.data;

      // Parse JSON fields if they are strings
      let bankDetails = null;
      if (dbQuotation.bank_details) {
        bankDetails = typeof dbQuotation.bank_details === 'string' 
          ? JSON.parse(dbQuotation.bank_details) 
          : dbQuotation.bank_details;
      }

      let termsSections = [];
      if (dbQuotation.terms_sections) {
        termsSections = typeof dbQuotation.terms_sections === 'string'
          ? JSON.parse(dbQuotation.terms_sections)
          : dbQuotation.terms_sections;
      }

      let billTo = null;
      if (dbQuotation.bill_to) {
        billTo = typeof dbQuotation.bill_to === 'string'
          ? JSON.parse(dbQuotation.bill_to)
          : dbQuotation.bill_to;
      }

      // Normalize quotation data for preview - ALL FIELDS FROM DB
      const normalized = {
        id: dbQuotation.id,
        quotationNumber: dbQuotation.quotation_number,
        quotationDate: dbQuotation.quotation_date,
        validUpto: dbQuotation.valid_until,
        validUntil: dbQuotation.valid_until,
        selectedBranch: dbQuotation.branch,
        template: dbQuotation.template,
        // RFP tracking (for templates)
        masterRfpId: dbQuotation.master_rfp_id || null,
        rfpId: dbQuotation.rfp_id || null,
        
        // Customer and billing info - EXACT from DB
        customer: {
          id: dbQuotation.customer_id,
          name: dbQuotation.customer_name,
          business: dbQuotation.customer_business,
          phone: dbQuotation.customer_phone,
          email: dbQuotation.customer_email,
          address: dbQuotation.customer_address,
          gstNo: dbQuotation.customer_gst_no,
          state: dbQuotation.customer_state
        },
        billTo: billTo || {
          business: dbQuotation.customer_business,
          buyerName: dbQuotation.customer_business,
          address: dbQuotation.customer_address,
          phone: dbQuotation.customer_phone,
          gstNo: dbQuotation.customer_gst_no,
          state: dbQuotation.customer_state
        },
        
        // Items - EXACT from DB
        items: (dbQuotation.items || []).map(i => ({
          productName: i.product_name,
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          buyerRate: i.unit_price,
          unitPrice: i.unit_price,
          amount: i.taxable_amount,
          total: i.total_amount,
          hsn: i.hsn_code,
          hsnCode: i.hsn_code,
          gstRate: i.gst_rate
        })),
        
        // Financials - EXACT from DB
        subtotal: parseFloat(dbQuotation.subtotal || 0),
        taxAmount: parseFloat(dbQuotation.tax_amount || 0),
        total: parseFloat(dbQuotation.total_amount || 0),
        discountRate: parseFloat(dbQuotation.discount_rate || 0),
        discountAmount: parseFloat(dbQuotation.discount_amount || 0),
        taxRate: parseFloat(dbQuotation.tax_rate || 18),
        
        // Additional fields - EXACT from DB
        paymentMode: dbQuotation.payment_mode || '',
        transportTc: dbQuotation.transport_tc || '',
        dispatchThrough: dbQuotation.dispatch_through || '',
        deliveryTerms: dbQuotation.delivery_terms || '',
        materialType: dbQuotation.material_type || '',
        paymentTerms: dbQuotation.payment_terms || '',
        
        // Bank details and terms - EXACT from DB (parsed JSON)
        bankDetails: bankDetails,
        termsSections: termsSections,
        
        // Status
        status: dbQuotation.status
      };

      // Prepare context using QuotationDataMapper
      const quotationData = QuotationDataMapper.prepareContext(
        normalized,
        companyBranches,
        user,
        normalized.template
      );

      setQuotationModalData(quotationData);
      setShowQuotationModal(true);
    } catch (error) {
      console.error('Error viewing quotation:', error);
      Toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * View PI in modal
   * @param {Object|string} pi - PI object or PI ID
   * @param {Object} quotation - Optional quotation object (if not provided, will fetch from PI)
   */
  const handleViewPI = async (pi, quotation = null) => {
    try {
      setLoading(true);
      
      // Get PI ID
      const piId = typeof pi === 'object' ? pi?.id : pi;
      if (!piId) {
        Toast.error('PI ID is required');
        return;
      }

      // Fetch PI first, then quotation + payments in parallel (faster View open)
      const piResponse = await proformaInvoiceService.getPI(piId);
      if (!piResponse?.success) {
        Toast.error('Failed to fetch PI details');
        return;
      }

      const piData = piResponse.data || piResponse;
      if (!piData) {
        Toast.error('PI data not found');
        return;
      }

      let completeQuotation = quotation;
      let paymentsFromApi = [];
      if (!completeQuotation && piData.quotation_id) {
        const [quotationResponse, payRes] = await Promise.all([
          quotationService.getQuotation(piData.quotation_id),
          paymentService.getPaymentsByQuotation(piData.quotation_id).catch(() => ({ data: [] }))
        ]);
        if (quotationResponse?.success && quotationResponse?.data) {
          completeQuotation = quotationResponse.data;
        }
        paymentsFromApi = Array.isArray(payRes?.data) ? payRes.data : [];
      } else if (completeQuotation && piData.quotation_id) {
        const payRes = await paymentService.getPaymentsByQuotation(piData.quotation_id).catch(() => ({ data: [] }));
        paymentsFromApi = Array.isArray(payRes?.data) ? payRes.data : [];
      }

      if (!completeQuotation) {
        Toast.error('Quotation data not found');
        return;
      }

      // Parse JSON fields - check PI first, then fallback to quotation
      let bankDetails = null;
      // Check PI for bank_details first, then quotation
      if (piData.bank_details) {
        bankDetails = typeof piData.bank_details === 'string'
          ? JSON.parse(piData.bank_details)
          : piData.bank_details;
      } else if (completeQuotation.bank_details) {
        bankDetails = typeof completeQuotation.bank_details === 'string'
          ? JSON.parse(completeQuotation.bank_details)
          : completeQuotation.bank_details;
      }

      // OPTIMIZED: Check PI for terms_sections first, then fallback to quotation
      let termsSections = [];
      if (piData.terms_sections) {
        termsSections = typeof piData.terms_sections === 'string'
          ? JSON.parse(piData.terms_sections)
          : piData.terms_sections;
      } else if (completeQuotation.terms_sections) {
        termsSections = typeof completeQuotation.terms_sections === 'string'
          ? JSON.parse(completeQuotation.terms_sections)
          : completeQuotation.terms_sections;
      }
      const rawTerms = termsSections || completeQuotation.termsSections;
      let terms = [];
      try {
        const baseTerms = Array.isArray(rawTerms) ? rawTerms : (typeof rawTerms === 'string' ? JSON.parse(rawTerms) : []);
        if (Array.isArray(baseTerms)) {
          terms = baseTerms.map((sec) => ({
            title: sec.title || '',
            points: Array.isArray(sec.points) ? sec.points : []
          }));
        }
      } catch (e) {
        // terms parsing failed
      }

      let billToFromQuotation = null;
      if (completeQuotation.bill_to) {
        billToFromQuotation = typeof completeQuotation.bill_to === 'string'
          ? JSON.parse(completeQuotation.bill_to)
          : completeQuotation.bill_to;
      }

      // Map quotation items; for revised PI apply amendment_detail so only effective items and totals are shown
      const quotationItems = completeQuotation.items || [];
      let amendmentDetail = null;
      if (piData.parent_pi_id && piData.amendment_detail) {
        try {
          amendmentDetail = typeof piData.amendment_detail === 'string'
            ? JSON.parse(piData.amendment_detail)
            : piData.amendment_detail;
        } catch (e) {
          amendmentDetail = null;
        }
      }
      let rawItems = quotationItems;
      if (amendmentDetail) {
        const removedIds = new Set((amendmentDetail.removed_item_ids || []).map((id) => String(id)));
        const reducedMap = (amendmentDetail.reduced_items || []).reduce((acc, item) => {
          const qid = item.quotation_item_id ?? item.quotationItemId;
          if (qid != null) acc[String(qid)] = Number(item.quantity) || 0;
          return acc;
        }, {});
        rawItems = quotationItems
          .filter((item) => !removedIds.has(String(item.id ?? item.quotation_item_id ?? '')))
          .map((item) => {
            const id = String(item.id ?? item.quotation_item_id ?? '');
            const origQty = Number(item.quantity) || 1;
            const origAmount = Number(item.taxable_amount ?? item.amount ?? item.total_amount ?? item.total ?? 0);
            const qty = reducedMap[id] !== undefined ? reducedMap[id] : origQty;
            const amount = origQty > 0 ? (origAmount / origQty) * qty : 0;
            return { ...item, quantity: qty, _effectiveAmount: amount };
          });
      }
      const mappedItems = rawItems.map((item) => {
        const amount = item._effectiveAmount != null ? item._effectiveAmount : Number(item.taxable_amount ?? item.amount ?? item.taxable ?? item.total_amount ?? item.total ?? 0);
        return {
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
          amount,
          gstRate: Number(item.gst_rate ?? item.gstRate ?? 18),
          gstMultiplier: 1 + Number(item.gst_rate ?? item.gstRate ?? 18) / 100
        };
      });

      // Calculate totals; for revised PI use stored PI totals so approval view shows correct figures
      const toInt = (v) => Math.round(Number(v) || 0);
      const isRevised = !!(piData.parent_pi_id && (piData.subtotal != null || piData.total_amount > 0));
      const taxRate = Number(completeQuotation.tax_rate ?? completeQuotation.taxRate ?? 18);
      let subtotal;
      let taxableAmount;
      let taxAmount;
      const piTotal = Number(piData.total_amount ?? piData.totalAmount ?? 0);
      const quotationTotal = Number(completeQuotation.total_amount ?? completeQuotation.total ?? 0);
      if (isRevised && (Number(piData.subtotal) >= 0 || piTotal > 0)) {
        const subRaw = Number(piData.subtotal) >= 0 ? Number(piData.subtotal) : mappedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        subtotal = toInt(subRaw);
        taxAmount = toInt(Number(piData.tax_amount) >= 0 ? Number(piData.tax_amount) : (subtotal * taxRate) / 100);
        taxableAmount = toInt(subtotal);
      } else {
        subtotal = toInt(mappedItems.reduce((s, i) => s + (Number(i.amount) || 0), 0));
        const discountRate = Number(completeQuotation.discount_rate ?? completeQuotation.discountRate ?? 0);
        const discountAmount = toInt(Number(completeQuotation.discount_amount ?? completeQuotation.discountAmount ?? (subtotal * discountRate) / 100));
        taxableAmount = toInt(Math.max(0, subtotal - discountAmount));
        taxAmount = toInt(Number(completeQuotation.tax_amount ?? completeQuotation.taxAmount ?? (taxableAmount * taxRate) / 100));
      }
      const discountRate = Number(completeQuotation.discount_rate ?? completeQuotation.discountRate ?? 0);
      const discountAmount = toInt(Number(completeQuotation.discount_amount ?? completeQuotation.discountAmount ?? (subtotal * discountRate) / 100));
      const finalTotal = toInt(piTotal > 0 ? piTotal : (quotationTotal > 0 ? quotationTotal : (taxableAmount + taxAmount)));

      // Use pre-fetched payments (no extra API call; original PI/quotation never mutated)
      const allPayments = paymentsFromApi;
      const approvedOnly = allPayments.filter((p) => {
        const status = (p.approval_status || p.accounts_approval_status || '').toLowerCase();
        return status === 'approved';
      });
      let advancePayment = approvedOnly.reduce((sum, p) => {
        const amount = Number(p.installment_amount || p.paid_amount || p.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      let originalQuotationTotal = quotationTotal;
      if (advancePayment > 0 && quotationTotal > 0) originalQuotationTotal = quotationTotal;
      if (!allPayments.length && piTotal > 0 && quotationTotal > 0 && piTotal < quotationTotal) {
        advancePayment = quotationTotal - piTotal;
        originalQuotationTotal = quotationTotal;
      }
      const approvedPayments = approvedOnly.map((payment) => {
        const paymentDate = payment.payment_date || payment.created_at || '';
        let formattedDate = '';
        if (paymentDate) {
          try {
            formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (e) {
            formattedDate = paymentDate;
          }
        }
        const amountRaw = Number(payment.installment_amount || payment.paid_amount || payment.amount || 0);
        return {
          date: formattedDate,
          mode: payment.payment_method || 'N/A',
          refNo: payment.payment_reference || payment.id || '',
          amount: amountRaw.toFixed(2),
          amountRaw
        };
      });

      const totalAdvanceRaw = approvedPayments.reduce((sum, payment) => sum + (payment.amountRaw || 0), 0);
      const totalAdvanceValue = totalAdvanceRaw || advancePayment || 0;
      const balanceDue = Math.max(0, Number(quotationTotal || 0) - totalAdvanceValue);
      const formattedTotalAdvance = totalAdvanceValue.toFixed(2);
      const formattedBalanceDue = balanceDue.toFixed(2);

      // Build billTo - prefer from quotation bill_to, then fallback
      const billTo = billToFromQuotation || {
        business: completeQuotation.customer_business || completeQuotation.customer?.business || piData.bill_to?.business || '',
        buyerName: completeQuotation.customer_business || completeQuotation.customer?.business || piData.bill_to?.buyerName || '',
        address: completeQuotation.customer_address || completeQuotation.customer?.address || piData.bill_to?.address || '',
        phone: completeQuotation.customer_phone || completeQuotation.customer?.phone || piData.bill_to?.phone || '',
        gstNo: completeQuotation.customer_gst_no || completeQuotation.customer?.gstNo || piData.bill_to?.gstNo || '',
        state: completeQuotation.customer_state || completeQuotation.customer?.state || piData.bill_to?.state || ''
      };

      // Format dates
      const piDate = piData.created_at ? new Date(piData.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const validUntil = completeQuotation.valid_until || completeQuotation.validUpto || '';

      // Build PI preview data
      const piPreviewData = {
        quotationNumber: completeQuotation.quotation_number || completeQuotation.quotationNumber || piData.pi_number || '',
        quotationDate: piDate,
        invoiceNumber: piData.pi_number || piData.piNumber || '',
        invoiceDate: piDate,
        piNumber: piData.pi_number || piData.piNumber || '',
        piDate: piDate,
        piId: piData.pi_number || piData.id,
        validUpto: validUntil,
        piValidUpto: validUntil,
        items: mappedItems.map(item => ({
          ...item,
          hsn: item.hsn || '85446090',
          hsnCode: item.hsn || '85446090'
        })),
        subtotal,
        discountRate,
        discountAmount,
        taxableAmount,
        taxRate,
        taxAmount,
        total: finalTotal,
        originalQuotationTotal: advancePayment > 0 ? originalQuotationTotal : 0,
        advancePayment: totalAdvanceValue,
        advancePayments: approvedPayments,
        totalAdvance: formattedTotalAdvance,
        balanceDue: formattedBalanceDue,
        billTo,
        paymentMode: completeQuotation.payment_mode || completeQuotation.paymentMode || '',
        transportTc: completeQuotation.transport_tc || completeQuotation.transportTc || '',
        dispatchThrough: completeQuotation.dispatch_through || completeQuotation.dispatchThrough || '',
        deliveryTerms: completeQuotation.delivery_terms || completeQuotation.deliveryTerms || '',
        materialType: completeQuotation.material_type || completeQuotation.materialType || '',
        paymentTerms: completeQuotation.payment_terms || completeQuotation.paymentTerms || '',
        selectedBranch: completeQuotation.branch || piData.branch || 'ANODE',
        template: piData.template || piData.templateKey || completeQuotation.template,
        templateKey: piData.template || piData.templateKey || completeQuotation.template,
        rfpId: completeQuotation.rfp_id || completeQuotation.rfpId || piData.rfp_id || piData.master_rfp_id || null,
        masterRfpId: completeQuotation.master_rfp_id || completeQuotation.masterRfpId || piData.master_rfp_id || null,
        rfp_id: completeQuotation.rfp_id || completeQuotation.rfpId || piData.rfp_id || null,
        master_rfp_id: completeQuotation.master_rfp_id || completeQuotation.masterRfpId || piData.master_rfp_id || null,
        dispatchMode: piData.dispatch_mode,
        shippingDetails: {
          transportName: piData.transport_name,
          vehicleNumber: piData.vehicle_number,
          transportId: piData.transport_id,
          lrNo: piData.lr_no,
          courierName: piData.courier_name,
          consignmentNo: piData.consignment_no,
          byHand: piData.by_hand,
          postService: piData.post_service,
          carrierName: piData.carrier_name,
          carrierNumber: piData.carrier_number
        },
        // Bank details and terms from quotation - ALL FROM DB
        bankDetails: bankDetails,
        termsSections: termsSections,
        terms
      };

      setPiModalData(piPreviewData);
      setShowPIModal(true);
    } catch (error) {
      console.error('Error viewing PI:', error);
      Toast.error('Failed to load PI');
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    showQuotationModal,
    quotationModalData,
    showPIModal,
    piModalData,
    loading,
    
    // Actions
    handleViewQuotation,
    handleViewPI,
    closeQuotationModal: () => {
      setShowQuotationModal(false);
      setQuotationModalData(null);
    },
    closePIModal: () => {
      setShowPIModal(false);
      setPiModalData(null);
    }
  };
}

