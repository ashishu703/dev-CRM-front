"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Package, Eye, X, Clock, CheckCircle, MessageCircle, Mail, CreditCard, Receipt, XCircle, AlertCircle, MoreHorizontal, User, Building2, MapPin, FileText, Calendar, Ban } from 'lucide-react';
import Toolbar, { ProductPagination } from './PaymentTracking';
import apiClient from '../../utils/apiClient';
import quotationService from '../../api/admin_api/quotationService';
import paymentService from '../../api/admin_api/paymentService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';
import uploadService from '../../api/admin_api/uploadService';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import SalespersonCustomerTimeline from '../../components/SalespersonCustomerTimeline';
import { useAuth } from '../../hooks/useAuth';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import { useViewQuotationPI } from '../../hooks/useViewQuotationPI';
import CompanyBranchService from '../../services/CompanyBranchService';
import QuotationPreview from '../../components/QuotationPreview';
import PIPreview from '../../components/PIPreview';
import CancelOrderModal from '../../components/salesperson/CancelOrderModal';
import AmendPIModal from '../../components/salesperson/AmendPIModal';
import { toDateOnly } from '../../utils/dateOnly';

class DataExtractor {
  static extractArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  }

  static extractSummary(response) {
    return response?.data ? response.data : response;
  }
}

class StatusNormalizer {
  static normalizeQuotationStatus(status = '') {
    const normalized = String(status).toLowerCase();
    if (normalized.includes('reject')) return 'rejected';
    if (normalized.includes('approve') || normalized === 'paid' || normalized === 'completed') return 'approved';
    return 'pending';
  }

  static normalizeApprovalStatus(payment = {}) {
    return (payment.approval_status || payment.status || '').toLowerCase() || 'pending';
  }
}

class CreditCalculator {
  static calculate(summary = {}, apiCredit = 0) {
    if (!summary || typeof summary !== 'object') {
      return Math.max(0, Number(apiCredit || 0));
    }
    const total = Number(summary.total ?? summary.total_amount ?? summary.totalAmount ?? 0);
    const paid = Number(summary.paid ?? summary.total_paid ?? summary.paidAmount ?? 0);
    const derived = Math.max(0, paid - total);
    return Math.max(Number(apiCredit || 0), derived);
  }
}

class PaymentValidator {
  static isApproved(payment) {
    return StatusNormalizer.normalizeApprovalStatus(payment) === 'approved';
  }

  static isPendingApproval(payment) {
    return StatusNormalizer.normalizeApprovalStatus(payment) === 'pending';
  }

  static isRejected(payment) {
    return StatusNormalizer.normalizeApprovalStatus(payment) === 'rejected';
  }

  static isValid(payment) {
    return !payment.is_refund;
  }
}

class PaymentTrackingService {
  constructor(apiClient, paymentService, quotationService, proformaInvoiceService) {
    this.apiClient = apiClient;
    this.paymentService = paymentService;
    this.quotationService = quotationService;
    this.proformaInvoiceService = proformaInvoiceService;
  }

  async fetchAssignedLeads() {
    const response = await this.apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME());
    return response?.data || [];
  }

  async fetchBulkPaymentsByCustomers(leadIds) {
    if (leadIds.length === 0) return [];
    const response = await this.paymentService.getBulkPaymentsByCustomers(leadIds);
    return DataExtractor.extractArray(response);
  }

  async fetchBulkQuotationsByCustomers(leadIds) {
    if (leadIds.length === 0) return [];
    const response = await this.quotationService.getBulkQuotationsByCustomers(leadIds);
    return DataExtractor.extractArray(response);
  }

  async fetchBulkPaymentsByQuotations(quotationIds) {
    if (quotationIds.length === 0) return [];
    const response = await this.paymentService.getBulkPaymentsByQuotations(quotationIds);
    return DataExtractor.extractArray(response);
  }

  async checkPIExists(quotationId) {
    const response = await this.proformaInvoiceService.getPIsByQuotation(quotationId);
    const pis = DataExtractor.extractArray(response);
    return pis.length > 0;
  }

  /**
   * Filter quotations to only include those with at least one PI
   * @param {Array} quotations - Array of quotations
   * @returns {Promise<Array>} Filtered quotations with PI info
   */
  async filterQuotationsWithPI(quotations) {
    if (!Array.isArray(quotations) || quotations.length === 0) return [];
    
    const piCheckPromises = quotations.map(async (q) => {
      try {
        const response = await this.proformaInvoiceService.getPIsByQuotation(q.id);
        const pis = DataExtractor.extractArray(response);
        return { quotation: q, hasPI: pis.length > 0, pis };
      } catch (error) {
        console.warn(`Failed to check PI for quotation ${q.id}:`, error);
        return { quotation: q, hasPI: false, pis: [] };
      }
    });

    const results = await Promise.allSettled(piCheckPromises);
    return results
      .filter(r => r.status === 'fulfilled' && r.value.hasPI)
      .map(r => ({
        ...r.value.quotation,
        pis: r.value.pis
      }));
  }

  mergePayments(existingPayments, newPayments) {
    const merged = [...existingPayments];
    newPayments.forEach(payment => {
      const exists = merged.some(existing => 
        existing.id === payment.id || 
        (existing.payment_reference && payment.payment_reference && 
         existing.payment_reference === payment.payment_reference)
      );
      if (!exists) {
        merged.push(payment);
      }
    });
    return merged;
  }

  buildLeadsMap(leads) {
    const map = {};
    leads.forEach(lead => {
      map[lead.id] = lead;
    });
    return map;
  }

  buildPaymentMap(quotations, payments, leadsMap) {
    const paymentMap = new Map();

    quotations.forEach(quotation => {
      const lead = leadsMap[quotation.customer_id] || {};
      const key = quotation.id || `lead_${quotation.customer_id}`;
      if (!paymentMap.has(key)) {
        paymentMap.set(key, {
          quotation,
          lead,
          payments: []
        });
      }
    });

    payments.forEach(payment => {
      const key = payment.quotation_id || `lead_${payment.lead_id}`;
      if (paymentMap.has(key)) {
        paymentMap.get(key).payments.push(payment);
      } else {
        const lead = leadsMap[payment.lead_id] || {};
        paymentMap.set(key, {
          quotation: null,
          lead,
          payments: [payment]
        });
      }
    });

    return paymentMap;
  }

  calculatePaymentStatus(quotationTotal, totalPaid) {
    if (quotationTotal > 0) {
      if (totalPaid >= quotationTotal) {
        return { paymentStatus: 'paid', displayStatus: 'Paid' };
      } else if (totalPaid > 0) {
        return { paymentStatus: 'advance', displayStatus: 'Advance' };
      }
    } else if (totalPaid > 0) {
      return { paymentStatus: 'advance', displayStatus: 'Advance' };
    }
    return { paymentStatus: 'due', displayStatus: 'Due' };
  }

  extractDeliveryInfo(validPayments, quotation) {
    const paymentsWithDates = validPayments.filter(p => p.revised_delivery_date || p.delivery_date);
    let deliveryDate = null;
    let deliveryStatus = 'pending';
    let purchaseOrderId = null;

    if (paymentsWithDates.length > 0) {
      const latestPayment = paymentsWithDates[paymentsWithDates.length - 1];
      deliveryDate = latestPayment.revised_delivery_date || latestPayment.delivery_date;
      deliveryStatus = latestPayment.delivery_status || 'pending';
    }

    if (validPayments.length > 0) {
      const latestPayment = validPayments[validPayments.length - 1];
      purchaseOrderId = latestPayment.purchase_order_id || quotation?.work_order_id || null;
    }

    return { deliveryDate, deliveryStatus, purchaseOrderId };
  }

  async buildPaymentTrackingData(paymentMap) {
    const paymentTrackingData = [];
    
    // OPTIMIZED: Collect all quotation IDs first for bulk operations
    const quotationIds = [];
    const quotationEntries = [];
    for (const [key, { quotation, lead, payments }] of paymentMap.entries()) {
      if (quotation?.id) {
        quotationIds.push(quotation.id);
        quotationEntries.push({ key, quotation, lead, payments });
      }
    }

    // OPTIMIZED: Parallel bulk fetch of PIs for all quotations
    const bulkPIsResult = quotationIds.length > 0 
      ? await this.proformaInvoiceService.getBulkPIsByQuotations(quotationIds).catch(() => ({ data: [] }))
      : { data: [] };

    // Build PI map by quotation ID
    const pisByQuotationId = new Map();
    const allPIs = DataExtractor.extractArray(bulkPIsResult);
    allPIs.forEach(pi => {
      if (pi.quotation_id) {
        if (!pisByQuotationId.has(pi.quotation_id)) {
          pisByQuotationId.set(pi.quotation_id, []);
        }
        pisByQuotationId.get(pi.quotation_id).push(pi);
      }
    });

    // Process each quotation with pre-fetched data
    for (const { quotation, lead, payments } of quotationEntries) {
      // Get PIs from pre-fetched map
      const pis = pisByQuotationId.get(quotation.id) || [];

      // Only include if PI exists
      if (pis.length === 0) {
        continue;
      }

      const validPayments = payments.filter(PaymentValidator.isValid);
      const approvedPayments = validPayments.filter(PaymentValidator.isApproved);
      const pendingApprovals = validPayments.filter(PaymentValidator.isPendingApproval);
      const rejectedApprovals = validPayments.filter(PaymentValidator.isRejected);

      const totalPaid = approvedPayments
        .filter(p => {
          const status = (p.payment_status || '').toLowerCase();
          return ['completed', 'paid', 'success', 'advance'].includes(status);
        })
        .reduce((sum, p) => sum + Number(p.installment_amount || p.paid_amount || 0), 0);

      const quotationTotal = Number(quotation.total_amount || 0);
      const remainingAmount = Math.max(0, quotationTotal - totalPaid);
      const { paymentStatus, displayStatus } = this.calculatePaymentStatus(quotationTotal, totalPaid);
      const { deliveryDate, deliveryStatus, purchaseOrderId } = this.extractDeliveryInfo(validPayments, quotation);

      const firstPayment = validPayments.length > 0 ? validPayments[0] : null;

      // Fetch product names from PI (via quotation items that PI references)
      let productNames = 'N/A';
      
      // Fetch quotation items if not already included
      let quotationItems = quotation?.items;
      if (!quotationItems || !Array.isArray(quotationItems) || quotationItems.length === 0) {
        try {
          const quotationWithItems = await this.quotationService.getQuotation(quotation.id);
          quotationItems = quotationWithItems?.data?.items || quotationWithItems?.items || [];
        } catch (error) {
          quotationItems = [];
        }
      }
      
      // PI references quotation, so get product names from quotation items
      // Since PI is created from quotation, items are the same
      if (quotationItems && Array.isArray(quotationItems) && quotationItems.length > 0) {
        productNames = quotationItems
          .map(item => item.product_name || item.productName || item.description)
          .filter(Boolean)
          .join(', ');
      } else if (lead.product_type) {
        productNames = lead.product_type;
      } else if (firstPayment?.product_name) {
        productNames = firstPayment.product_name;
      }

      paymentTrackingData.push({
        id: `${quotation.customer_id || lead.id}-${quotation.id}`,
        leadId: `LD-${quotation.customer_id || lead.id}`,
        customerName: quotation?.customer_name || lead?.name || lead?.customer_name || firstPayment?.customer_name || 'N/A',
        productName: productNames,
        address: quotation?.customer_address || lead.address || firstPayment?.address || 'N/A',
        quotationId: quotation?.quotation_number || `QT-${quotation.id}`,
        paymentStatus,
        displayStatus,
        paidAmount: totalPaid,
        totalAmount: quotationTotal,
        remainingAmount,
        workOrderId: purchaseOrderId ? `PO-${purchaseOrderId}` : (quotation?.work_order_id ? `PO-${quotation.work_order_id}` : 'N/A'),
        leadData: lead,
        quotationData: {
          ...quotation,
          paid_amount: totalPaid,
          remaining_amount: remainingAmount,
          delivery_date: deliveryDate,
          delivery_status: deliveryStatus,
          pi_id: pis.length > 0 ? pis[0].id : null // Add PI ID for view button
        },
        paymentsData: validPayments,
        approvalSummary: {
          pending: pendingApprovals.length,
          rejected: rejectedApprovals.length,
          latestNote: pendingApprovals[0]?.approval_notes || rejectedApprovals[0]?.approval_notes || ''
        }
      });
    }

    return paymentTrackingData.sort((a, b) => {
      const aDate = a.paymentsData?.length > 0 
        ? new Date(a.paymentsData[a.paymentsData.length - 1].payment_date || a.paymentsData[a.paymentsData.length - 1].created_at) 
        : new Date(0);
      const bDate = b.paymentsData?.length > 0 
        ? new Date(b.paymentsData[b.paymentsData.length - 1].payment_date || b.paymentsData[b.paymentsData.length - 1].created_at) 
        : new Date(0);
      return bDate - aDate;
    });
  }

  async fetchAllPaymentTrackingData() {
    const leads = await this.fetchAssignedLeads();
    const leadIds = leads.map(lead => lead.id);
    const leadsMap = this.buildLeadsMap(leads);

    const [allPayments, allQuotations] = await Promise.all([
      this.fetchBulkPaymentsByCustomers(leadIds),
      this.fetchBulkQuotationsByCustomers(leadIds)
    ]);

    const allQuotationsFiltered = (allQuotations || []).filter(q => (q.status || '').toLowerCase() !== 'cancelled');
    const quotationIds = allQuotationsFiltered.map(q => q.id).filter(Boolean);
    const quotationPayments = await this.fetchBulkPaymentsByQuotations(quotationIds);
    const mergedPayments = this.mergePayments(allPayments, quotationPayments);

    const paymentMap = this.buildPaymentMap(allQuotationsFiltered, mergedPayments, leadsMap);
    return await this.buildPaymentTrackingData(paymentMap);
  }
}

// Legacy helper functions for backward compatibility
const extractApiArray = DataExtractor.extractArray;
const extractSummary = DataExtractor.extractSummary;
const normalizeQuotationStatus = StatusNormalizer.normalizeQuotationStatus;
const calculateCredit = CreditCalculator.calculate;
const isApprovedPayment = PaymentValidator.isApproved;
const isPendingApproval = PaymentValidator.isPendingApproval;
const isRejectedPayment = PaymentValidator.isRejected;

// Timeline Sidebar component for viewing payment tracking details
const PaymentTimelineSidebar = ({ item, onClose, refreshKey = 0 }) => {
  const [customerQuotations, setCustomerQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [quotationError, setQuotationError] = useState(null);
  const [quotationSummary, setQuotationSummary] = useState(null);
  const [paymentsForQuotation, setPaymentsForQuotation] = useState([]);

  if (!item) return null;

  // Fetch quotation summary + payments (avoid listing all quotations if we already have one)
  const fetchedKeyRef = useRef('');
  useEffect(() => {
    const fetchKey = `${item.leadData?.id || ''}-${item.quotationData?.id || ''}-${refreshKey}`;
    if (fetchedKeyRef.current === fetchKey) {
      return; // avoid duplicate fetch in React StrictMode
    }
    fetchedKeyRef.current = fetchKey;
    const fetchCustomerQuotations = async () => {
      if (!item.leadData?.id) return;

      try {
        setLoadingQuotations(true);
        setQuotationError(null);
        
        // If we already have a quotation ID, only fetch its summary and payments
        const chosenQuotationId = item.quotationData?.id;
        if (chosenQuotationId) {
          try {
            const [sRes, pRes] = await Promise.all([
              quotationService.getSummary(chosenQuotationId),
              paymentService.getPaymentsByQuotation(chosenQuotationId)
            ]);
            const summaryData = extractSummary(sRes) || null;
            const paymentsData = extractApiArray(pRes);
            setCustomerQuotations([{
              ...item.quotationData,
              status: summaryData?.status || summaryData?.quotation_status || item.quotationData?.status
            }]);
            setQuotationSummary(summaryData);
            setPaymentsForQuotation(paymentsData);
            return;
          } catch (innerErr) {
            console.warn('Failed to load quotation summary/payments', innerErr);
          }
        }

        // Fallback: fetch quotations for this customer/lead and then pick latest approved
        const quotationsResponse = await quotationService.getQuotationsByCustomer(item.leadData.id);
        const qList = extractApiArray(quotationsResponse).map(q => ({
          ...q,
          status: q?.status || q?.quotation_status
        }));
        setCustomerQuotations(qList);
        const latestApproved = qList
          .filter(q => normalizeQuotationStatus(q.status) === 'approved')
          .slice(-1)[0];
        if (latestApproved?.id) {
          const [sRes, pRes] = await Promise.all([
            quotationService.getSummary(latestApproved.id),
            paymentService.getPaymentsByQuotation(latestApproved.id)
          ]);
          setQuotationSummary(extractSummary(sRes) || null);
          setPaymentsForQuotation(extractApiArray(pRes));
        }
      } catch (error) {
        console.error('Error fetching customer quotations:', error);
        setQuotationError('Failed to load quotations');
      } finally {
        setLoadingQuotations(false);
      }
    };

    fetchCustomerQuotations();
  }, [item.leadData?.id, item.quotationData?.id, refreshKey]);

  // Handle view quotation - show in modal using QuotationPreview format
  const handleViewQuotation = async (quotationId) => {
    try {
      const response = await quotationService.getQuotation(quotationId);
      
      if (response.success) {
        // Open quotation in new tab/window for viewing
        const quotationWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
        
        if (quotationWindow) {
          const quotation = response.data;
          
          // Company branches data (same as in quotation creation)
          const companyBranches = {
            ANODE: {
              name: 'ANODE ELECTRIC PRIVATE LIMITED',
              gstNumber: '(23AANCA7455R1ZX)',
              description: 'MANUFACTURING & SUPPLY OF ELECTRICAL CABLES & WIRES.',
              address: 'KHASRA NO. 805/5, PLOT NO. 10, IT PARK, BARGI HILLS, JABALPUR - 482003, MADHYA PRADESH, INDIA.',
              tel: '6262002116, 6262002113',
              web: 'www.anocab.com',
              email: 'info@anocab.com',
              logo: 'Anocab - A Positive Connection.....'
            }
          };
          
          // Mock user data
          const user = {
            name: 'Salesperson',
            email: 'salesperson@anocab.com'
          };
          
          // Format quotation data to match QuotationPreview component
          const quotationData = {
            quotationNumber: quotation.quotation_number || `QT-${quotation.id}`,
            quotationDate: quotation.quotation_date || quotation.created_at?.split('T')[0],
            validUpto: quotation.valid_until,
            voucherNumber: `VOUCH-${quotation.id?.slice(-4) || '0000'}`,
            billTo: {
              business: quotation.customer_name,
              address: quotation.customer_address,
              phone: quotation.customer_phone,
              gstNo: quotation.customer_gst_no,
              state: quotation.customer_state
            },
            items: quotation.items?.map(item => ({
              productName: item.description || item.product_name,
              description: item.description || item.product_name,
              quantity: item.quantity,
              unit: item.unit || 'Nos',
              buyerRate: item.rate || item.unit_price,
              unitPrice: item.rate || item.unit_price,
              amount: item.amount || item.taxable_amount,
              total: item.total_amount || item.amount,
              hsn: item.hsn_code || '85446090',
              gstRate: item.gst_rate || quotation.tax_rate || 18
            })) || [],
            subtotal: parseFloat(quotation.subtotal || 0),
            taxAmount: parseFloat(quotation.tax_amount || 0),
            total: parseFloat(quotation.total_amount || 0),
            discountRate: parseFloat(quotation.discount_rate || 0),
            discountAmount: parseFloat(quotation.discount_amount || 0),
            taxRate: parseFloat(quotation.tax_rate || 18),
            selectedBranch: 'ANODE'
          };
          
          // Create HTML content using the exact same format as QuotationPreview
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Quotation ${quotationData.quotationNumber}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="bg-gray-100">
              <div class="max-w-4xl mx-auto bg-white font-sans text-sm" id="quotation-content">
                <div class="p-6">
                  <div class="border-2 border-black mb-4">
                    <div class="p-2 flex justify-between items-center">
                      <div>
                        <h1 class="text-xl font-bold">${companyBranches.ANODE.name}</h1>
                        <p class="text-xs font-semibold text-gray-700">${companyBranches.ANODE.gstNumber}</p>
                        <p class="text-xs">${companyBranches.ANODE.description}</p>
                      </div>
                      <div class="text-right">
                        <img
                          src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
                          alt="Company Logo"
                          class="h-12 w-auto bg-white p-1 rounded"
                        />
                      </div>
                    </div>

                    <div class="p-3 bg-gray-50">
                      <div class="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p><strong>${companyBranches.ANODE.address}</strong></p>
                        </div>
                        <div class="text-right">
                          <p>Tel: ${companyBranches.ANODE.tel}</p>
                          <p>Web: ${companyBranches.ANODE.web}</p>
                          <p>Email: ${companyBranches.ANODE.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="border border-black mb-4">
                    <div class="bg-gray-100 p-2 text-center font-bold">
                      <h2>Quotation Details</h2>
                    </div>
                    <div class="grid grid-cols-4 gap-2 p-2 text-xs border-b">
                      <div><strong>Quotation Date</strong></div>
                      <div><strong>Quotation Number</strong></div>
                      <div><strong>Valid Upto</strong></div>
                      <div><strong>Voucher Number</strong></div>
                    </div>
                    <div class="grid grid-cols-4 gap-2 p-2 text-xs">
                      <div>${quotationData.quotationDate}</div>
                      <div>${quotationData.quotationNumber}</div>
                      <div>${quotationData.validUpto}</div>
                      <div>${quotationData.voucherNumber}</div>
                    </div>
                  </div>

                  <div class="border border-black mb-4">
                    <div class="grid grid-cols-2 gap-4 p-3 text-xs">
                      <div>
                        <h3 class="font-bold mb-2">BILL TO:</h3>
                        <p><strong>${quotationData.billTo.business || 'Customer'}</strong></p>
                        ${quotationData.billTo.address ? `<p>${quotationData.billTo.address}</p>` : ''}
                        ${quotationData.billTo.phone ? `<p><strong>PHONE:</strong> ${quotationData.billTo.phone}</p>` : ''}
                        ${quotationData.billTo.gstNo ? `<p><strong>GSTIN:</strong> ${quotationData.billTo.gstNo}</p>` : ''}
                        ${quotationData.billTo.state ? `<p><strong>State:</strong> ${quotationData.billTo.state}</p>` : ''}
                      </div>
                      <div>
                        <p><strong>L.R. No:</strong> -</p>
                        <p><strong>Transport:</strong> STAR TRANSPORTS</p>
                        <p><strong>Transport ID:</strong> 562345</p>
                        <p><strong>Vehicle Number:</strong> GJ01HJ2520</p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-black mb-4">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="bg-gray-100">
                          <th class="border border-gray-300 p-1 text-center w-10">Sr.</th>
                          <th class="border border-gray-300 p-2 text-left">Name of Product / Service</th>
                          <th class="border border-gray-300 p-1 text-center w-16">HSN / SAC</th>
                          <th class="border border-gray-300 p-1 text-center w-12">Qty</th>
                          <th class="border border-gray-300 p-1 text-center w-12">Unit</th>
                          <th class="border border-gray-300 p-1 text-right w-20">Buyer Rate</th>
                          <th class="border border-gray-300 p-1 text-right w-20">Taxable Value</th>
                          <th class="border border-gray-300 p-0.5 text-center w-8 text-[10px] whitespace-nowrap">GST%</th>
                          <th class="border border-gray-300 p-1 text-right w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${quotationData.items && quotationData.items.length > 0 ? 
                          quotationData.items.map((item, index) => `
                            <tr>
                              <td class="border border-gray-300 p-1 text-center">${index + 1}</td>
                              <td class="border border-gray-300 p-2">${item.productName || item.description}</td>
                              <td class="border border-gray-300 p-1 text-center">${item.hsn || '85446090'}</td>
                              <td class="border border-gray-300 p-1 text-center">${item.quantity}</td>
                              <td class="border border-gray-300 p-1 text-center">${item.unit || 'Nos'}</td>
                              <td class="border border-gray-300 p-1 text-right">${parseFloat(item.buyerRate || item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td class="border border-gray-300 p-1 text-right">${parseFloat(item.amount || item.taxable || item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td class="border border-gray-300 p-0 text-center text-xs">${item.gstRate ? `${item.gstRate}%` : '18%'}</td>
                              <td class="border border-gray-300 p-1 text-right">${parseFloat((item.amount ?? item.total ?? 0) * (item.gstMultiplier ?? 1.18)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          `).join('') : 
                          '<tr><td colspan="9" class="border border-gray-300 p-2 text-center">No items</td></tr>'
                        }

                        ${Array.from({ length: 8 }).map((_, i) => `
                          <tr class="h-8">
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                            <td class="border border-gray-300 p-2"></td>
                          </tr>
                        `).join('')}

                        <tr class="bg-gray-100 font-bold">
                          <td class="border border-gray-300 p-2 text-left">Total</td>
                          <td class="border border-gray-300 p-2"></td>
                          <td class="border border-gray-300 p-2"></td>
                          <td class="border border-gray-300 p-2"></td>
                          <td class="border border-gray-300 p-2"></td>
                          <td class="border border-gray-300 p-2"></td>
                          <td class="border border-gray-300 p-2">${quotationData.subtotal?.toFixed ? quotationData.subtotal.toFixed(2) : (quotationData.subtotal || '').toString()}</td>
                          <td class="border border-gray-300 p-2">${quotationData.taxAmount?.toFixed ? quotationData.taxAmount.toFixed(2) : (quotationData.taxAmount || '').toString()}</td>
                          <td class="border border-gray-300 p-2">${quotationData.total?.toFixed ? quotationData.total.toFixed(2) : (quotationData.total || '').toString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="border border-black p-3">
                      <h3 class="font-bold text-xs mb-2">Bank Details</h3>
                      <div class="text-xs space-y-1">
                        <p><strong>Bank Name:</strong> ICICI Bank</p>
                        <p><strong>Branch Name:</strong> WRIGHT TOWN JABALPUR</p>
                        <p><strong>Bank Account Number:</strong> 657605601783</p>
                        <p><strong>Bank Branch IFSC:</strong> ICIC0006576</p>
                      </div>
                    </div>
                    <div class="border border-black p-3">
                      <div class="text-xs space-y-1">
                        <div class="flex justify-between">
                          <span>Subtotal</span>
                          <span>${quotationData.subtotal?.toFixed ? quotationData.subtotal.toFixed(2) : (quotationData.subtotal || '0.00')}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Less: Discount (${quotationData.discountRate || 0}%)</span>
                          <span>${quotationData.discountAmount?.toFixed ? quotationData.discountAmount.toFixed(2) : (quotationData.discountAmount || '0.00')}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Taxable Amount</span>
                          <span>${(typeof quotationData.subtotal === 'number' ? (quotationData.subtotal - (quotationData.discountAmount || 0)).toFixed(2) : (quotationData.taxable || '')).toString()}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Add: Total GST (${quotationData.taxRate || 18}%)</span>
                          <span>${quotationData.taxAmount?.toFixed ? quotationData.taxAmount.toFixed(2) : (quotationData.taxAmount || '0.00')}</span>
                        </div>
                        <div class="flex justify-between font-bold border-t pt-1">
                          <span>Total Amount After Tax</span>
                          <span>₹ ${quotationData.total?.toFixed ? quotationData.total.toFixed(2) : (quotationData.total || '0.00')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="border border-black mb-4">
                    <div class="bg-gray-100 p-2 font-bold text-xs">
                      <h3>Terms and Conditions</h3>
                    </div>
                    <div class="p-3 text-xs space-y-2">
                      <div>
                        <h4 class="font-bold">PRICING & VALIDITY</h4>
                        <p>• Prices are valid for 3 days only from the date of the final quotation/PI unless otherwise specified terms.</p>
                        <p>• The order will be considered confirmed only upon receipt of the advance payment.</p>
                      </div>
                      <div>
                        <h4 class="font-bold">PAYMENT TERMS</h4>
                        <p>• 30% advance payment upon order confirmation</p>
                        <p>• Remaining Balance at time of final dispatch / against LC / Bank Guarantee (if applicable).</p>
                        <p>• Liquidated Damages @ 0.5% to 1% per WEEK will be charged on delayed payments beyond the agreed terms.</p>
                      </div>
                      <div>
                        <h4 class="font-bold">DELIVERY & DISPATCH</h4>
                        <p>• Standard delivery period as per the telecommunication with customer.</p>
                        <p>• Any delays due to unforeseen circumstances (force majeure, strikes, and transportation issues) will be communicated.</p>
                      </div>
                      <div>
                        <h4 class="font-bold">QUALITY & WARRANTY</h4>
                        <p>• Cables will be supplied as per IS and other applicable BIS standards/or as per the agreed specifications mentioned/special demand by the customer.</p>
                        <p>• Any manufacturing defects should be reported immediately, within 3 working days of receipt.</p>
                        <p>• Warranty: 12 months from the date of dispatch for manufacturing defects only in ISI mark products.</p>
                      </div>
                    </div>
                  </div>

                  <div class="text-right text-xs">
                    <p class="mb-4">For <strong>${companyBranches.ANODE.name}</strong></p>
                    <p class="mb-8">This is computer generated invoice no signature required.</p>
                    <p class="font-bold">Authorized Signatory</p>
                    <p class="mt-2 text-sm font-semibold text-gray-800">${user.name || user.email || 'User'}</p>
                  </div>
                </div>
              </div>
              
              <div class="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-300 flex justify-between no-print">
                <button onclick="window.close()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Close</button>
                <button onclick="window.print()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Print PDF</button>
              </div>
            </body>
            </html>
          `;
          
          quotationWindow.document.write(htmlContent);
          quotationWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Error viewing quotation:', error);
      alert('Failed to load quotation');
    }
  };

  // Format date to Indian format (DD/MM/YYYY)
  const formatIndianDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format date and time to Indian format
  const formatIndianDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge component
  const getStatusBadge = (status, type = 'default') => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'COMPLETED' },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'APPROVED' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDING' },
      'pending-approval': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'PENDING APPROVAL' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'REJECTED' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'PAID' },
      'partial': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'PARTIAL' },
      'overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'OVERDUE' },
      'due': { bg: 'bg-red-100', text: 'text-red-800', label: 'PENDING' },
      'deal-closed': { bg: 'bg-green-100', text: 'text-green-800', label: 'DEAL CLOSED' },
      'credit': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'CREDIT' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Calculate payment summary from approved quotations
  const calculatePaymentSummary = () => {
    const approvedQuotations = customerQuotations.filter(
      q => normalizeQuotationStatus(q.status) === 'approved'
    );
    
    if (approvedQuotations.length === 0) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        advanceAmount: 0,
        partialAmount: 0,
        dueAmount: 0,
        paymentStatus: 'pending'
      };
    }

    const latestApprovedQuotation = approvedQuotations[approvedQuotations.length - 1];
    const totalAmount = (quotationSummary?.total_amount ?? latestApprovedQuotation.total_amount) || 0;

    const sortedPayments = Array.isArray(paymentsForQuotation)
      ? paymentsForQuotation.slice().sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))
      : [];
    const approvedPayments = sortedPayments.filter(isApprovedPayment);

    const paidAmount = approvedPayments.reduce(
      (sum, p) => sum + Number((p.paid_amount ?? p.installment_amount ?? p.amount) || 0),
      0
    );
    const remainingAmount = Math.max(0, Number(totalAmount) - Number(paidAmount));
    
    // Calculate advance (first payment), partial (subsequent payments), due (remaining)
    let advanceAmount = 0;
    let partialAmount = 0;
    if (approvedPayments.length > 0) {
      advanceAmount = Number((approvedPayments[0]?.paid_amount ?? approvedPayments[0]?.installment_amount ?? approvedPayments[0]?.amount) || 0);
      if (approvedPayments.length > 1) {
        partialAmount = approvedPayments
          .slice(1)
          .reduce((sum, p) => sum + Number((p.paid_amount ?? p.installment_amount ?? p.amount) || 0), 0);
      }
    }
    
    const dueAmount = remainingAmount;
    
    let paymentStatus = 'pending';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      advanceAmount,
      partialAmount,
      dueAmount,
      paymentStatus
    };
  };

  const dataReady = !loadingQuotations && (
    quotationSummary !== null || (Array.isArray(paymentsForQuotation) && paymentsForQuotation.length > 0)
  );
  const paymentSummary = dataReady ? calculatePaymentSummary() : null;

  // Build chronological payment timeline - using only data from summary and payments APIs
  const buildPaymentTimeline = () => {
    // Get payments array - sorted by payment_date
    const pmts = Array.isArray(paymentsForQuotation) && paymentsForQuotation.length > 0
      ? paymentsForQuotation.slice().sort((a, b) => new Date(a.payment_date || a.created_at) - new Date(b.payment_date || b.created_at))
      : [];
    
    if (pmts.length === 0) return [];

    // Get summary data from API response
    const summaryRemainingForTimeline = Number(quotationSummary?.remaining || 0);
    
    // Track approved payments for labeling
    let approvedPaymentCount = 0;

    return pmts.map((p, idx) => {
      const amountNum = Number(p.paid_amount ?? p.installment_amount ?? p.amount ?? 0);
      const approvalStatus = normalizeApprovalStatus(p);
      const isApproved = approvalStatus === 'approved';
      const isRejected = approvalStatus === 'rejected';
      const paymentRemaining = Number(p.remaining_amount || 0);
      const isLastPayment = idx === pmts.length - 1;
      const piDisplay = p.pi_number || p.pi_full_id || p.pi_id || '';
      
      // Determine label based on payment data
      let label = '';
      if (!isApproved && !isRejected) {
        label = 'Pending Approval';
      } else if (isRejected) {
        label = 'Rejected Payment';
      } else if (isLastPayment && (paymentRemaining === 0 || summaryRemainingForTimeline === 0)) {
        // If last payment and remaining is 0, it's Full Payment
        label = 'Full Payment';
      } else {
        // Advance payment - show #1, #2, etc.
        approvedPaymentCount++;
        label = `Advance Payment #${approvedPaymentCount}`;
      }
      
      // Timeline status
      const timelineStatus = isRejected
        ? 'rejected'
        : isApproved
          ? (paymentRemaining === 0 ? 'paid' : 'approved')
          : 'pending-approval';
      
      const timelineIcon = isRejected ? '✕' : isApproved ? '₹' : '⏳';
      
      return {
        ...p,
        amount: amountNum,
        label,
        remainingAfter: paymentRemaining,
        approvalStatus,
        timelineStatus,
        timelineIcon,
        approvalNotes: p.approval_notes || '',
        piDisplay
      };
    });
  };
  const paymentTimeline = buildPaymentTimeline();

  // Get due date from payments (delivery_date or revised_delivery_date)
  const getDueDate = () => {
    const paymentsWithDates = Array.isArray(paymentsForQuotation) 
      ? paymentsForQuotation.filter(p => p.revised_delivery_date || p.delivery_date) 
      : [];
    if (paymentsWithDates.length > 0) {
      const latestPayment = paymentsWithDates[paymentsWithDates.length - 1];
      return latestPayment.revised_delivery_date || latestPayment.delivery_date;
    }
    return null;
  };

  const dueDate = getDueDate();
  
  // Check payment status from summary API data
  const summaryRemaining = Number(quotationSummary?.remaining || 0);
  const summaryTotal = Number(quotationSummary?.total || quotationSummary?.total_amount || 0);
  const summaryPaid = Number(quotationSummary?.paid || 0);
  const creditAmount = calculateCredit(quotationSummary || {});
  const hasCredit = creditAmount > 0;
  const hasPendingAmount = summaryRemaining > 0;
  const isDealDone = summaryRemaining === 0 && summaryPaid > 0 && summaryTotal > 0;
  const lastPaymentDate = paymentTimeline.length > 0
    ? (paymentTimeline[paymentTimeline.length - 1].payment_date || paymentTimeline[paymentTimeline.length - 1].created_at)
    : new Date().toISOString();

  // Timeline events data - using only data from summary and payments APIs
  const timelineEvents = [
    {
      id: 'customer-created',
      title: 'Customer Created',
      date: formatIndianDate(item.leadData?.created_at),
      status: 'completed',
      icon: '✓',
      description: `Lead ID: ${item.leadId}`
    },
    ...customerQuotations.map((quotation, index) => {
      const quotationStatus = normalizeQuotationStatus(quotation.status);
      return {
        id: `quotation-${quotation.id}`,
        title: `Quotation ${index + 1}`,
        date: formatIndianDateTime(quotation.created_at),
        status: quotationStatus,
        icon: quotationStatus === 'approved' ? '✓' : quotationStatus === 'rejected' ? '✕' : '⏳',
        description: `ID: ${quotation.quotation_number || `QT-${quotation.id}`} | Purchase Order: ${quotation.work_order_id ? `PO-${quotation.work_order_id}` : 'N/A'}`,
        amount: quotation.total_amount || 0,
        quotationId: quotation.id,
        quotationStatus: quotationStatus
      };
    }),
    ...paymentTimeline.map((payment, index) => {
      const approvalStatus = payment.approvalStatus || 'pending';
      let description = `Method: ${payment.payment_method || 'N/A'}`;
      if (approvalStatus === 'pending') {
        description += ' • Awaiting Accounts approval';
      } else if (approvalStatus === 'rejected') {
        description += ' • Rejected by Accounts';
      }
      if (payment.approvalNotes?.trim()) {
        description += ` • Note: ${payment.approvalNotes}`;
      }
      // Combine PI ID and PO together
      const piAndPO = [];
      if (payment.piDisplay) {
        piAndPO.push(`PI: ${payment.piDisplay}`);
      }
      if (payment.purchase_order_id) {
        piAndPO.push(`PO: ${payment.purchase_order_id}`);
      }
      if (piAndPO.length > 0) {
        description += ` • ${piAndPO.join(' | ')}`;
      }
      return {
        id: `payment-${payment.id || index + 1}`,
        title: payment.label, // Already has #1, #2, etc. or "Full Payment", "Pending Approval"
        date: formatIndianDateTime(payment.payment_date || payment.created_at),
        status: payment.timelineStatus || (payment.payment_status || 'completed').toLowerCase(),
        icon: payment.timelineIcon || '₹',
        description,
        amount: payment.amount ?? payment.installment_amount,
        remainingAmount: payment.remainingAfter
      };
    }),
    ...(hasCredit ? [{
      id: 'credit-available',
      title: 'Credit Available',
      date: formatIndianDateTime(lastPaymentDate),
      status: 'credit',
      icon: '₹',
      description: 'Extra amount received; usable as credit for next orders',
      amount: creditAmount
    }] : []),
    // Show DUE if there's remaining amount from summary
    ...(hasPendingAmount && !isDealDone ? [{
      id: 'due-payment',
      title: 'DUE',
      date: dueDate ? formatIndianDate(dueDate) : 'N/A',
      status: 'due',
      icon: '⚠',
      description: dueDate ? `Due Date: ${formatIndianDate(dueDate)}` : 'Payment pending',
      amount: summaryRemaining,
      isDue: true
    }] : []),
    // Show Deal Done if remaining is 0 and payment exists
    ...(isDealDone && paymentTimeline.length > 0 ? [{
      id: 'deal-closed',
      title: 'Deal Done',
      date: formatIndianDateTime(lastPaymentDate),
      status: 'completed',
      icon: '✓',
      description: 'Full and final payment received'
    }] : [])
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[110] flex justify-end">
      <div className="bg-white w-96 h-full overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Customer Timeline</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
            </div>

        {/* Customer Details */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Customer Details</h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Customer Name:</span>
              <span className="ml-2 text-sm text-gray-900">{item.customerName && item.customerName !== 'N/A' ? item.customerName : (item.leadData?.name || 'N/A')}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Lead ID:</span>
              <span className="ml-2 text-sm text-gray-900">{item.leadId}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Product Name:</span>
              <span className="ml-2 text-sm text-gray-900">{item.productName}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Address:</span>
              <span className="ml-2 text-sm text-gray-900">{item.address}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative flex items-start mb-6">
                {/* Timeline icon */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  event.isDue
                    ? 'bg-red-500'
                    : (event.id?.startsWith('payment-') && event.status === 'rejected')
                    ? 'bg-red-500'
                    : (event.id?.startsWith('payment-') && event.status === 'pending-approval')
                    ? 'bg-amber-500'
                    : event.id?.startsWith('payment-')
                    ? 'bg-green-500'
                    : event.status === 'completed' || event.status === 'approved' || event.status === 'paid'
                    ? 'bg-green-500'
                    : event.status === 'credit'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}>
                  <span className="text-white text-sm font-bold">{event.icon}</span>
                </div>
                
                {/* Event card */}
                <div className={`ml-4 flex-1 p-3 rounded-lg ${
                  event.isDue
                    ? 'bg-red-50 border border-red-300'
                    : event.id?.startsWith('payment-') && event.status === 'rejected'
                    ? 'bg-rose-50 border border-rose-200'
                    : event.id?.startsWith('payment-') && event.status === 'pending-approval'
                    ? 'bg-amber-50 border border-amber-200'
                    : event.id?.startsWith('payment-')
                    ? 'bg-green-50 border border-green-200'
                    : event.status === 'completed' || event.status === 'approved' || event.status === 'paid'
                    ? 'bg-green-50 border border-green-200'
                    : event.status === 'credit'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-semibold ${event.isDue ? 'text-red-700' : 'text-gray-900'}`}>{event.title}</h4>
                        {!event.id?.startsWith('payment-') && event.amount && (
                          <span className={`text-sm font-bold ${event.isDue ? 'text-red-700' : 'text-gray-900'}`}>₹{Number(event.amount).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${event.isDue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{event.date}</p>
                      <p className={`text-xs mt-1 ${event.isDue ? 'text-red-600' : 'text-gray-500'}`}>{event.description}</p>
                      {/* PI number intentionally hidden per requirement */}
                      {!event.isDue && event.remainingAmount !== undefined && (
                        <p className="text-xs text-red-600 mt-1 font-medium">Remaining: ₹{Number(event.remainingAmount).toLocaleString('en-IN')}</p>
                      )}
                      
                      {/* View button for quotations */}
                      {event.quotationId && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => handleViewQuotation(event.quotationId)}
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      {event.id?.startsWith('payment-') ? (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            event.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : event.status === 'pending-approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          ₹{Number(event.amount || 0).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        getStatusBadge(event.status)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// Enhanced Payment Modal Component with all required fields
const PaymentModal = ({ item, onClose, onPaymentAdded }) => {
  const [paymentData, setPaymentData] = useState({
    installment_amount: '',
    payment_method: 'cash',
    payment_reference: '',
    delivery_note: '',
    payment_remark: '',
    payment_status: 'advance',
    payment_receipt_url: '',
    purchase_order_id: '',
    payment_date: toDateOnly(new Date()), // Default to today's date (local-safe)
    delivery_date: '',
    delivery_status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [approvedQuotations, setApprovedQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState(item.quotationData?.id || '');
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [selectedPIId, setSelectedPIId] = useState('');
  const [summary, setSummary] = useState({ total: 0, paid: 0, remaining: 0 });
  const [credit, setCredit] = useState(0);
  const [baseCredit, setBaseCredit] = useState(0);
  
  // Initialize payment tracking service instance for filtering quotations with PI
  const paymentTrackingServiceInstance = useMemo(() => new PaymentTrackingService(
    apiClient,
    paymentService,
    quotationService,
    proformaInvoiceService
  ), []);

  const loadQuotationDetails = async (quotationId, creditSource = baseCredit, quotationDetails = null) => {
    if (!quotationId) return;
    
    const quotationWithPIs = approvedQuotations.find(q => q.id === quotationId);
    const existingPIs = quotationWithPIs?.pis || [];
    
    const [sRes, piRes] = await Promise.all([
      quotationService.getSummary(quotationId),
      existingPIs.length > 0 ? Promise.resolve({ data: existingPIs }) : proformaInvoiceService.getPIsByQuotation(quotationId)
    ]);

    const summaryData = extractSummary(sRes) || { total: 0, paid: 0, remaining: 0 };
    const pis = existingPIs.length > 0 ? existingPIs : extractApiArray(piRes);

    setSummary(summaryData);
    setProformaInvoices(pis);
    setCredit(calculateCredit(summaryData, creditSource));

    if (pis.length > 0) {
      setSelectedPIId(pis[0].id);
    } else {
      setSelectedPIId('');
    }

    setPaymentData((p) => ({
      ...p,
      installment_amount: String(summaryData.remaining ?? summaryData.current_remaining ?? summaryData.balance ?? ''),
      purchase_order_id: quotationDetails?.work_order_id || item.quotationData?.work_order_id || p.purchase_order_id || ''
    }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!item?.leadData?.id) return;
        const [qRes, cRes] = await Promise.all([
          quotationService.getApproved(item.leadData.id),
          paymentService.getCustomerCredit(item.leadData.id)
        ]);
        
        const allApprovedQuotations = extractApiArray(qRes);
        
        const quotationsWithPI = await paymentTrackingServiceInstance.filterQuotationsWithPI(allApprovedQuotations);
        setApprovedQuotations(quotationsWithPI);

        const apiCredit = Number(cRes?.data?.balance ?? cRes?.data?.available_credit ?? 0);
        setBaseCredit(apiCredit);
        setCredit(apiCredit);
        
        // Pre-select quotation if available (must have PI)
        const preselectedQuotation = item.quotationData?.id
          ? quotationsWithPI.find(q => q.id === item.quotationData.id)
          : quotationsWithPI?.[0];
        const qid = preselectedQuotation?.id;
        if (qid) {
          setSelectedQuotationId(qid);
          // Use PIs from filtered result if available
          if (preselectedQuotation.pis && preselectedQuotation.pis.length > 0) {
            setProformaInvoices(preselectedQuotation.pis);
            setSelectedPIId(preselectedQuotation.pis[0].id);
          }
          await loadQuotationDetails(qid, apiCredit, preselectedQuotation);
        }
      } catch (e) {
        console.error('Init payment modal failed', e);
        setError('Failed to load quotations. Please try again.');
      }
    };
    init();
  }, [item?.leadData?.id, item.quotationData?.id]);

  const handleSelectQuotation = async (qid) => {
    setSelectedQuotationId(qid);
    setSelectedPIId('');
    setProformaInvoices([]);
    if (!qid) return;
    try {
      const selectedQuotation = approvedQuotations.find(q => q.id === qid);
      // Use PIs from filtered quotation if available, otherwise fetch
      if (selectedQuotation?.pis && selectedQuotation.pis.length > 0) {
        setProformaInvoices(selectedQuotation.pis);
        setSelectedPIId(selectedQuotation.pis[0].id);
      }
      await loadQuotationDetails(qid, baseCredit, selectedQuotation);
    } catch (e) {
      setProformaInvoices([]);
      setError('Failed to load PI for selected quotation');
    }
  };

  const handleReceiptUpload = async (file) => {
    if (!file) return;
    
    setUploadingReceipt(true);
    try {
      const url = await uploadService.uploadFile(file, 'payments');
      setPaymentData(prev => ({ ...prev, payment_receipt_url: url }));
      setReceiptFile(file);
    } catch (error) {
      setError('Failed to upload receipt: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate PI is selected
      if (!selectedPIId) {
        setError('Please create PI first, then add payment. PI (Proforma Invoice) is required to add payment.');
        setLoading(false);
        return;
      }

      if (!selectedQuotationId) {
        setError('Please select a quotation with PI created.');
        setLoading(false);
        return;
      }

      // Upload receipt if file is selected but URL is not set
      let receiptUrl = paymentData.payment_receipt_url;
      if (receiptFile && !receiptUrl) {
        receiptUrl = await uploadService.uploadFile(receiptFile, 'payments');
      }

      // Validate installment amount
      const installmentAmount = parseFloat(paymentData.installment_amount);
      
      if (!installmentAmount || isNaN(installmentAmount) || installmentAmount <= 0) {
        setError('Please enter a valid payment amount greater than 0');
        setLoading(false);
        return;
      }

      // Send payment_date as YYYY-MM-DD (backend will normalize). Avoid timezone shifting.
      const paymentDate = paymentData.payment_date || toDateOnly(new Date());

      const paymentPayload = {
        lead_id: item.leadData?.id,
        quotation_id: selectedQuotationId,
        pi_id: selectedPIId,
        installment_amount: installmentAmount,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        payment_status: paymentData.payment_status,
        payment_receipt_url: receiptUrl || undefined,
        payment_date: paymentDate,
        notes: paymentData.delivery_note,
        remarks: paymentData.payment_remark,
        purchase_order_id: paymentData.purchase_order_id,
        delivery_date: paymentData.delivery_date || null,
        delivery_status: paymentData.delivery_status
      };

      const response = await paymentService.createPayment(paymentPayload);
      if (response.success) {
        const { summary: responseSummary } = response.data;
        onClose();
        onPaymentAdded({ leadId: item.leadData?.id, quotationId: selectedQuotationId });
        alert(`Payment installment #${responseSummary.installment_number} added successfully!\nPaid: ₹${responseSummary.total_paid.toLocaleString('en-IN')}\nRemaining: ₹${responseSummary.remaining.toLocaleString('en-IN')}`);
      } else {
        setError('Failed to add payment');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      setError(error.response?.data?.message || 'Failed to add payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[110]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      {/* Right sidebar panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{item.customerName && item.customerName !== 'N/A' ? item.customerName : (item.leadData?.name || 'N/A')}</h4>
          <p className="text-sm text-gray-600">Lead ID: {item.leadId}</p>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quotation (approved with PI only)
            </label>
            <select
              value={selectedQuotationId}
              onChange={(e) => handleSelectQuotation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Approved Quotation with PI --</option>
              {approvedQuotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotation_number || q.id} - ₹{Number(q.total_amount || q.totalAmount || 0).toLocaleString()}
                  {q.pis && q.pis.length > 0 && ` (${q.pis.length} PI${q.pis.length > 1 ? 's' : ''})`}
                </option>
              ))}
            </select>
              {selectedQuotationId && proformaInvoices.length > 0 && (
                <div className="text-xs text-gray-600 mt-2 grid grid-cols-2 gap-2">
                  <div>Total: ₹{Number(summary.total ?? 0).toLocaleString()}</div>
                  <div>Paid: ₹{Number(summary.paid ?? 0).toLocaleString()}</div>
                  <div>Remaining: ₹{Number(summary.remaining ?? 0).toLocaleString()}</div>
                  <div>Available credit: ₹{Number(credit ?? 0).toLocaleString()}</div>
                </div>
              )}
          </div>

          {selectedQuotationId && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proforma Invoice (PI) <span className="text-red-600">*</span>
              </label>
              {proformaInvoices.length > 0 ? (
                <>
                  <select
                    value={selectedPIId}
                    onChange={(e) => setSelectedPIId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select PI (Required) --</option>
                    {proformaInvoices.map((pi) => (
                      <option key={pi.id} value={pi.id}>
                        {pi.pi_number}
                        {pi.parent_pi_id ? ` (Rev. from ${pi.parent_pi_number || 'Original'})` : ''}
                        {' - ₹' + Number(pi.total_amount || 0).toLocaleString()}
                        {pi.status && ` (${pi.status})`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1 font-medium">PI is required to add payment</p>
                </>
              ) : (
                <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                  <p className="text-sm text-red-600 font-medium">⚠ No PI found for this quotation</p>
                  <p className="text-xs text-red-500 mt-1">Please create PI first before adding payment</p>
                </div>
              )}
            </div>
          )}
          
          {approvedQuotations.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">⚠ No approved quotations with PI available</p>
              <p className="text-xs text-yellow-700 mt-1">Please create a PI for an approved quotation first, then you can add payment.</p>
            </div>
          )}
        </div>

        {/* Payment Installment History */}
        {/* Removed installments list as requested */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installment Amount *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={paymentData.installment_amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, installment_amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter installment amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              required
              value={paymentData.payment_method}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={paymentData.payment_status}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="advance">Advance</option>
              <option value="full">Full Payment</option>
              <option value="completed">Completed</option>
              <option value="due">Due</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Reference
            </label>
            <input
              type="text"
              value={paymentData.payment_reference}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_reference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="UTR/Ref No, UPI Txn ID, Cheque No, Bank Ref No"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Payment Receipt {paymentData.payment_receipt_url && <span className="text-green-600 text-xs">✓ Uploaded</span>}
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleReceiptUpload(file);
                  }
                }}
                disabled={uploadingReceipt}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
              {uploadingReceipt && (
                <p className="text-sm text-blue-600">Uploading...</p>
              )}
              {paymentData.payment_receipt_url && (
                <a
                  href={paymentData.payment_receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block"
                >
                  View Receipt
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Order ID
            </label>
            <input
              type="text"
              value={paymentData.purchase_order_id}
              onChange={(e) => setPaymentData(prev => ({ ...prev, purchase_order_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Purchase order reference"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={paymentData.payment_date}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={paymentData.delivery_date}
                onChange={(e) => setPaymentData(prev => ({ ...prev, delivery_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Status
              </label>
              <select
                value={paymentData.delivery_status}
                onChange={(e) => setPaymentData(prev => ({ ...prev, delivery_status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Remark</label>
            <textarea
              value={paymentData.payment_remark}
              onChange={(e) => setPaymentData(prev => ({ ...prev, payment_remark: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Payment remarks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note</label>
            <textarea
              value={paymentData.delivery_note}
              onChange={(e) => setPaymentData(prev => ({ ...prev, delivery_note: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Delivery note (optional)"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Add Payment Installment'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

// Tooltip component for action buttons
const Tooltip = ({ children, text }) => (
  <div className="relative group">
    {children}
    <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 left-1/2 transform -translate-x-1/2 -translate-y-8 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
      {text}
    </span>
  </div>
);


export default function ProductsPage() {
  const [paymentTracking, setPaymentTracking] = useState([]);
  const [filteredPaymentTracking, setFilteredPaymentTracking] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [selectedCancelOrderItem, setSelectedCancelOrderItem] = useState(null);
  const [showAmendPIModal, setShowAmendPIModal] = useState(false);
  const [selectedAmendPIItem, setSelectedAmendPIItem] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Get current user for role-based filtering
  const { user } = useAuth();
  const currentUserId = user?.id;
  const lastUserIdRef = useRef(null);

  // OPTIMIZED: Fetch company branches from DB
  const [companyBranches, setCompanyBranches] = useState([]);
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branches = await CompanyBranchService.fetchBranches();
        setCompanyBranches(branches);
      } catch (error) {
        console.error('Error fetching company branches:', error);
      }
    };
    fetchBranches();
  }, []);

  // Setup view hook for quotations and PIs (same pattern as DuePayment/AdvancePayment)
  const viewHook = useViewQuotationPI(companyBranches, user);
  
  // Handle view quotation and PI using shared hook
  const handleViewQuotation = viewHook?.handleViewQuotation || (() => {});
  const handleViewPI = viewHook?.handleViewPI || (() => {});

  // Guard to avoid duplicate initial fetches (e.g. React StrictMode)
  const initialFetchDoneRef = useRef(false);
  
  // OPTIMIZED: Memoize payment tracking service instance
  const paymentTrackingService = useMemo(() => new PaymentTrackingService(
    apiClient,
    paymentService,
    quotationService,
    proformaInvoiceService
  ), []);

  const fetchPaymentTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Global cache busting is automatically applied by apiClient.get()
      const paymentTrackingData = await paymentTrackingService.fetchAllPaymentTrackingData();
      console.log(`[PaymentTracking] Received ${paymentTrackingData.length} payment tracking items for user: ${user?.email}`);
      setPaymentTracking(paymentTrackingData);
      setFilteredPaymentTracking(paymentTrackingData);
    } catch (err) {
      console.error('Error fetching payment tracking data:', err);
      setError('Failed to load payment tracking data');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial load with user change detection
  useEffect(() => {
    // If no user is logged in, do nothing
    if (!currentUserId) {
      return;
    }

    // If user has changed, clear existing data
    if (lastUserIdRef.current !== null && lastUserIdRef.current !== currentUserId) {
      console.log('[PaymentTracking] User changed, clearing data. Old:', lastUserIdRef.current, 'New:', currentUserId);
      setPaymentTracking([]);
      setFilteredPaymentTracking([]);
      setError(null);
      initialFetchDoneRef.current = false; // Reset fetch guard
    }

    // Update last user ID
    lastUserIdRef.current = currentUserId;

    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    fetchPaymentTrackingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen && !event.target.closest('.action-menu-container')) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionMenuOpen]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredPaymentTracking(paymentTracking);
      setCurrentPage(1); // Reset to first page
      return;
    }
    
    const lowercasedQuery = query.toLowerCase();
    const filtered = paymentTracking.filter(
      (item) =>
        item.customerName.toLowerCase().includes(lowercasedQuery) ||
        item.productName.toLowerCase().includes(lowercasedQuery) ||
        item.leadId.toLowerCase().includes(lowercasedQuery) ||
        item.quotationId.toLowerCase().includes(lowercasedQuery) ||
        item.workOrderId.toLowerCase().includes(lowercasedQuery) ||
        item.address.toLowerCase().includes(lowercasedQuery) ||
        // Search in customer contact information
        (item.leadData?.phone && item.leadData.phone.toLowerCase().includes(lowercasedQuery)) ||
        (item.leadData?.email && item.leadData.email.toLowerCase().includes(lowercasedQuery)) ||
        (item.leadData?.whatsapp && item.leadData.whatsapp.toLowerCase().includes(lowercasedQuery)) ||
        // Special handling for quotation ID search (QT prefix)
        (lowercasedQuery.startsWith('qt') && item.quotationId.toLowerCase().includes(lowercasedQuery)) ||
        // Also search in the original quotation data for quotation_number
        (lowercasedQuery.startsWith('qt') && item.quotationData?.quotation_number?.toLowerCase().includes(lowercasedQuery))
    );
    setFilteredPaymentTracking(filtered);
    setCurrentPage(1); // Reset to first page
  };

  const handleFilterChange = (filters) => {
    let filtered = [...paymentTracking];
    
    // Handle payment type filter (advance/due/paid)
    if (filters.paymentType) {
      if (filters.paymentType === 'advance') {
        // Show advance payments (partial payments)
        filtered = filtered.filter(item => 
          item.paymentStatus === 'advance' || 
          item.displayStatus === 'Advance'
        );
      } else if (filters.paymentType === 'due') {
        // Show due payments (no payment or partial payment - both show as due)
        filtered = filtered.filter(item => 
          item.paymentStatus === 'due' || 
          item.paymentStatus === 'advance' || // Advance payments also show in due
          item.displayStatus === 'Due' ||
          item.displayStatus === 'Advance'
        );
      } else if (filters.paymentType === 'paid') {
        // Show only fully paid
        filtered = filtered.filter(item => 
          item.paymentStatus === 'paid' || 
          item.displayStatus === 'Paid'
        );
      } else {
        filtered = filtered.filter(item => 
          item.paymentStatus === filters.paymentType || 
          item.displayStatus === filters.paymentType
        );
      }
    }
    
    // Handle legacy paymentStatus filter for backward compatibility
    if (filters.paymentStatus && !filters.paymentType) {
      filtered = filtered.filter(item => 
        item.paymentStatus === filters.paymentStatus || 
        item.displayStatus === filters.paymentStatus
      );
    }
    
    if (filters.quotationId) {
      const quotationIdFilter = filters.quotationId.toLowerCase();
      filtered = filtered.filter(item => 
        item.quotationId.toLowerCase().includes(quotationIdFilter) ||
        item.quotationData?.quotation_number?.toLowerCase().includes(quotationIdFilter)
      );
    }
    if (filters.quotationStatus) {
      const statusKey = String(filters.quotationStatus).toLowerCase();
      filtered = filtered.filter(item => {
        const st = String(item.quotationData?.status || '').toLowerCase();
        return st === statusKey;
      });
    }
    
    setFilteredPaymentTracking(filtered);
    setCurrentPage(1); // Reset to first page
  };

  const totalPages = Math.ceil(filteredPaymentTracking.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPaymentTracking = filteredPaymentTracking.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = async () => {
    await fetchPaymentTrackingData();
  };

  const handleAddPayment = (item) => {
    if (!item) {
      alert('Please select a payment record from the table to add payment');
      return;
    }
    setSelectedPaymentItem(item);
    setShowPaymentModal(true);
  };

  const handleViewPayment = (item) => {
    setSelectedProduct(item);
  };

  // Show skeleton loader on initial load (after all hooks)
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  // Helper function to format address by splitting on commas
  const formatAddress = (address) => {
    if (!address || address === 'N/A') return 'N/A';
    const parts = address.split(',').map(part => part.trim()).filter(part => part);
    return parts.length > 0 ? parts : ['N/A'];
  };

  // Helper function to get status color (matching PaymentInfo.jsx)
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'advance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get status icon (matching PaymentInfo.jsx)
  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'paid':
        return <CheckCircle className="w-3 h-3" />;
      case 'advance':
        return <Clock className="w-3 h-3" />;
      case 'due':
        return <XCircle className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getPaymentStatusBadge = (item) => {
    // Check for rejected payments first
    const rejectedApprovals = item?.approvalSummary?.rejected || 0;
    const pendingApprovals = item?.approvalSummary?.pending || 0;
    const latestNote = item?.approvalSummary?.latestNote;
    
    // Check if any payment has approval_status = 'rejected'
    const hasRejectedPayment = item?.paymentsData?.some(p => 
      (p.approval_status || '').toLowerCase() === 'rejected'
    ) || false;

    if (hasRejectedPayment || rejectedApprovals > 0) {
      return (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor('Rejected')}`}>
            {getStatusIcon('Rejected')}
            Rejected
          </span>
          {rejectedApprovals > 0 && (
            <span className="text-xs text-orange-700">
              {rejectedApprovals} payment{rejectedApprovals > 1 ? 's' : ''} rejected
            </span>
          )}
          {latestNote && (
            <span className="text-xs text-gray-500 truncate">Note: {latestNote}</span>
          )}
        </div>
      );
    }

    if (pendingApprovals > 0) {
      return (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor('Pending')}`}>
            {getStatusIcon('Pending')}
            Pending Accounts Approval
          </span>
          <span className="text-xs text-yellow-700">
            {pendingApprovals} payment{pendingApprovals > 1 ? 's' : ''} awaiting approval
          </span>
          {latestNote && (
            <span className="text-xs text-gray-500 truncate">Note: {latestNote}</span>
          )}
        </div>
      );
    }
    
    // Use displayStatus if available, otherwise fall back to paymentStatus
    const displayStatus = item?.displayStatus || item?.paymentStatus || 'pending';
    const status = displayStatus.toLowerCase();
    
    const statusText = {
      'paid': 'Paid',
      'pending': 'Pending',
      'partial': 'Partial',
      'overdue': 'Due',
      'advance': 'Advance',
      'due': 'Due',
    };

    // Get paid amount from item data
    const paidAmount = Number(item?.paidAmount || item?.quotationData?.paid_amount || 0);
    const amount = paidAmount > 0 ? `₹${paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '';

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          {statusText[status] || displayStatus}
        </span>
        {amount && (
          <span className="text-xs text-gray-600 font-medium">
            {amount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 pb-24 sm:pb-6">

      <Toolbar
        onSearch={handleSearch}
        onAddProduct={() => handleAddPayment(null)}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        products={paymentTracking}
        loading={loading}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleRefresh}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[800px] sm:w-full">
            <thead className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b-2 border-blue-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Lead ID</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-violet-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quotation ID</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Purchase Order</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery Date</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Action</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPaymentTracking.length > 0 ? (
                  paginatedPaymentTracking.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900 font-medium">
                        {item.leadId}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <div className="font-semibold text-sm text-gray-900 truncate max-w-[200px]" title={item.customerName && item.customerName !== 'N/A' ? item.customerName : (item.leadData?.name || 'N/A')}>
                          {item.customerName && item.customerName !== 'N/A' ? item.customerName : (item.leadData?.name || 'N/A')}
                        </div>
                        {item.leadData?.phone && (
                          <div className="text-xs font-semibold text-gray-600 mt-1 truncate max-w-[200px]" title={item.leadData.phone}>{item.leadData.phone}</div>
                        )}
                        {item.leadData?.whatsapp && (
                          <div className="text-xs mt-1 text-green-600">
                            <a href={`https://wa.me/${item.leadData.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" /> WhatsApp
                            </a>
                          </div>
                        )}
                        {item.leadData?.email && item.leadData.email !== "N/A" && (
                          <div className="text-xs mt-1 text-cyan-600 truncate max-w-[200px]">
                            <button 
                              onClick={() => window.open(`mailto:${item.leadData.email}?subject=Follow up from ANOCAB&body=Dear ${item.customerName},%0D%0A%0D%0AThank you for your interest in our products.%0D%0A%0D%0ABest regards,%0D%0AANOCAB Team`, '_blank')}
                              className="inline-flex items-center gap-1 transition-colors hover:text-cyan-700 truncate"
                              title={item.leadData.email}
                            >
                              <Mail className="h-3 w-3 flex-shrink-0" /> <span className="truncate font-semibold">{item.leadData.email}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs text-gray-900 truncate max-w-[150px] block" title={item.productName || 'N/A'}>{item.productName || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="max-w-[180px]">
                        <span className="text-xs text-gray-700 truncate block" title={item.address || 'N/A'}>
                          {item.address || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm font-bold text-gray-900 font-mono">{item.quotationId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPaymentStatusBadge(item)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm text-gray-900">{item.workOrderId || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {item.quotationData?.delivery_date ? 
                            new Date(item.quotationData.delivery_date).toLocaleDateString('en-GB') : 
                            'N/A'
                          }
                        </span>
                        {item.quotationData?.delivery_status && (
                          <span className="text-xs text-gray-600 mt-1">
                            "{item.quotationData.delivery_status}"
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="relative action-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === item.id ? null : item.id);
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {actionMenuOpen === item.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewPayment(item);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md">
                                  <Eye className="h-3.5 w-3.5 text-white" />
                                </div>
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddPayment(item);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
                                  <CreditCard className="h-3.5 w-3.5 text-white" />
                                </div>
                                Add Payment
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCancelOrderItem(item);
                                  setShowCancelOrderModal(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <div className="p-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md">
                                  <Ban className="h-3.5 w-3.5 text-white" />
                                </div>
                                Cancel Order
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAmendPIItem(item);
                                  setShowAmendPIModal(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md">
                                  <FileText className="h-3.5 w-3.5 text-white" />
                                </div>
                                Amend PI (Cancel products)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No payment tracking records found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Pagination */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredPaymentTracking.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      
      {/* Customer Timeline Sidebar */}
      {selectedProduct && (
        <SalespersonCustomerTimeline 
          item={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onQuotationView={(quotation) => {
            const quotationId = typeof quotation === 'object' ? quotation?.id : quotation;
            if (quotationId) {
              handleViewQuotation(quotationId);
            }
          }}
          onPIView={(pi) => {
            const piId = typeof pi === 'object' ? pi?.id : pi;
            const quotation = typeof pi === 'object' ? pi?.quotation : selectedProduct?.quotationData;
            if (piId) {
              handleViewPI(piId, quotation);
            }
          }}
          onCancelOrder={(quotation) => {
            // Open cancel order modal with the quotation's lead data
            const cancelItem = {
              ...selectedProduct,
              quotationData: quotation
            };
            setSelectedCancelOrderItem(cancelItem);
            setShowCancelOrderModal(true);
          }}
        />
      )}
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          item={selectedPaymentItem} 
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPaymentItem(null);
          }}
          onPaymentAdded={async ({ leadId, quotationId }) => {
            // Refresh the selected row's timeline data so it shows the new payment immediately
            try {
              if (!selectedPaymentItem?.leadData?.id) return;
              const quotationsResponse = await quotationService.getQuotationsByCustomer(selectedPaymentItem.leadData.id);
              const quotations = quotationsResponse?.data || [];
              const approvedQuotations = quotations.filter(
                q => normalizeQuotationStatus(q.status) === 'approved'
              );
              let payments = [];
              if (quotationId) {
                const paymentsResponse = await paymentService.getPaymentsByQuotation(quotationId);
                payments = paymentsResponse?.data || [];
              } else {
                const paymentsResponse = await paymentService.getPaymentsByCustomer(selectedPaymentItem.leadData.id);
                payments = paymentsResponse?.data || [];
              }
              const updatedItem = {
                ...selectedPaymentItem,
                quotationData: approvedQuotations[0] || selectedPaymentItem.quotationData,
                paymentsData: payments
              };
              setSelectedPaymentItem(updatedItem);
              setSelectedProduct(updatedItem);
              // bump refresh key to force sidebar to refetch its own summary/payments
              setTimelineRefreshKey((k) => k + 1);
            } catch (e) {
              console.error('Failed to refresh timeline after payment', e);
            }
          }}
        />
      )}

      {/* Cancel Order Modal */}
      {showCancelOrderModal && selectedCancelOrderItem && (
        <CancelOrderModal
          item={selectedCancelOrderItem}
          onClose={() => {
            setShowCancelOrderModal(false);
            setSelectedCancelOrderItem(null);
          }}
          onCancelRequested={async () => {
            try {
              setLoading(true);
              const paymentTrackingData = await paymentTrackingService.fetchAllPaymentTrackingData();
              setPaymentTracking(paymentTrackingData);
              setFilteredPaymentTracking(paymentTrackingData);
            } catch (err) {
              console.error('Error refreshing payment tracking data:', err);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {/* Amend PI Modal */}
      {showAmendPIModal && selectedAmendPIItem && (
        <AmendPIModal
          item={selectedAmendPIItem}
          onClose={() => {
            setShowAmendPIModal(false);
            setSelectedAmendPIItem(null);
          }}
          onRevisedCreated={async () => {
            try {
              setLoading(true);
              const paymentTrackingData = await paymentTrackingService.fetchAllPaymentTrackingData();
              setPaymentTracking(paymentTrackingData);
              setFilteredPaymentTracking(paymentTrackingData);
            } catch (err) {
              console.error('Error refreshing payment tracking data:', err);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
      
      {/* Quotation Preview Modal */}
      {viewHook.showQuotationModal && viewHook.quotationModalData && (
        <QuotationPreview
          quotationData={viewHook.quotationModalData}
          companyBranches={companyBranches}
          user={user}
          onClose={viewHook.closeQuotationModal}
        />
      )}

      {/* PI Preview Modal */}
      {viewHook.showPIModal && viewHook.piModalData && (
        <PIPreview
          piData={viewHook.piModalData}
          companyBranches={companyBranches}
          user={user}
          onClose={viewHook.closePIModal}
        />
      )}
    </div>
  );
}
