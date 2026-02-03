"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Package, Eye, X, Edit, Clock, CheckCircle, MessageCircle, Mail, DollarSign, CreditCard, XCircle, AlertCircle, MoreHorizontal, User, Building2, MapPin, FileText, Calendar, Ban } from 'lucide-react';
import Toolbar, { ProductPagination } from './PaymentTracking';
import apiClient from '../../utils/apiClient';
import quotationService from '../../api/admin_api/quotationService';
import paymentService from '../../api/admin_api/paymentService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';
import uploadService from '../../api/admin_api/uploadService';
import { toDateOnly } from '../../utils/dateOnly';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import SalespersonCustomerTimeline from '../../components/SalespersonCustomerTimeline';
import { useAuth } from '../../hooks/useAuth';
import { useViewQuotationPI } from '../../hooks/useViewQuotationPI';
import QuotationPreview from '../../components/QuotationPreview';
import PIPreview from '../../components/PIPreview';
import CompanyBranchService from '../../services/CompanyBranchService';
import CancelOrderModal from '../../components/salesperson/CancelOrderModal';
import AmendPIModal from '../../components/salesperson/AmendPIModal';

class DataExtractor {
  static extractArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  }
}

class PaymentValidator {
  static isValid(payment) {
    return !payment.is_refund;
  }

  static isApproved(payment) {
    const approvalStatus = (payment.approval_status || payment.status || '').toLowerCase();
    return approvalStatus === 'approved';
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

  // OPTIMIZED: Bulk fetch quotation items with memoization
  async _fetchQuotationItemsBulk(quotationIds) {
    if (quotationIds.length === 0) return new Map();
    
    const itemsMap = new Map();
    const quotationsToFetch = [];
    
    for (const id of quotationIds) {
      quotationsToFetch.push(id);
    }

    if (quotationsToFetch.length === 0) return itemsMap;

    // OPTIMIZED: Fetch all quotations in parallel (batch of 20 to avoid overwhelming)
    const batchSize = 20;
    for (let i = 0; i < quotationsToFetch.length; i += batchSize) {
      const batch = quotationsToFetch.slice(i, i + batchSize);
      const quotationPromises = batch.map(id =>
        this.quotationService.getQuotation(id)
          .then(res => ({ id, items: res?.data?.items || res?.items || [] }))
          .catch(() => ({ id, items: [] }))
      );

      const results = await Promise.all(quotationPromises);
      results.forEach(({ id, items }) => {
        if (items && items.length > 0) {
          itemsMap.set(id, items);
        }
      });
    }

    return itemsMap;
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

  async buildAdvancePaymentData(paymentMap) {
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

    // OPTIMIZED: Parallel bulk fetch of PIs and quotation items for all quotations
    const [bulkPIsResult, quotationItemsMap] = await Promise.all([
      quotationIds.length > 0 
        ? this.proformaInvoiceService.getBulkPIsByQuotations(quotationIds).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
      this._fetchQuotationItemsBulk(quotationIds)
    ]);

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

      // Filter approved payments to only those with valid payment status
      const approvedPaymentsForDate = approvedPayments.filter(p => {
        const status = (p.payment_status || '').toLowerCase();
        return ['completed', 'paid', 'success', 'advance'].includes(status);
      });

      const totalPaid = approvedPaymentsForDate
        .reduce((sum, p) => sum + Number(p.installment_amount || p.paid_amount || 0), 0);
      
      // Only process if there's at least one approved payment (not all rejected)
      if (approvedPaymentsForDate.length === 0) {
        continue;
      }

      const quotationTotal = Number(quotation.total_amount || 0);
      const remainingAmount = Math.max(0, quotationTotal - totalPaid);
      const { paymentStatus, displayStatus } = this.calculatePaymentStatus(quotationTotal, totalPaid);
      // Use only approved payments for delivery info
      const { deliveryDate, deliveryStatus, purchaseOrderId } = this.extractDeliveryInfo(approvedPaymentsForDate, quotation);
      
      const advanceDate = approvedPaymentsForDate.length > 0 
        ? (approvedPaymentsForDate[0]?.payment_date || approvedPaymentsForDate[0]?.created_at?.split('T')[0])
        : null;
      const firstPayment = approvedPaymentsForDate.length > 0 ? approvedPaymentsForDate[0] : null;

      // Get quotation items from pre-fetched map
      let quotationItems = quotationItemsMap.get(quotation.id) || quotation?.items || [];
      
      // Fetch product names from PI (via quotation items that PI references)
      let productNames = 'N/A';
      
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
        advanceAmount: totalPaid,
        advanceDate,
        dueDate: deliveryDate,
        deliveryStatus,
        remainingAmount,
        totalAmount: quotationTotal,
        paidAmount: totalPaid,
        workOrderId: purchaseOrderId ? `PO-${purchaseOrderId}` : (quotation?.work_order_id ? `PO-${quotation.work_order_id}` : 'N/A'),
        leadData: lead,
        quotationData: {
          ...quotation,
          paid_amount: totalPaid,
          remaining_amount: remainingAmount,
          delivery_date: deliveryDate,
          delivery_status: deliveryStatus
        },
        paymentsData: approvedPaymentsForDate  // Only include approved payments (exclude rejected)
      });
    }

    // Filter to only show advance payments (items already have only approved payments in paymentsData)
    const advancePayments = paymentTrackingData.filter(item => 
      item.paidAmount > 0 && item.remainingAmount > 0 && item.paymentStatus === 'advance'
    );

    return advancePayments.sort((a, b) => {
      const aDate = a.paymentsData?.length > 0 ? new Date(a.paymentsData[a.paymentsData.length - 1].payment_date || a.paymentsData[a.paymentsData.length - 1].created_at) : new Date(0);
      const bDate = b.paymentsData?.length > 0 ? new Date(b.paymentsData[b.paymentsData.length - 1].payment_date || b.paymentsData[b.paymentsData.length - 1].created_at) : new Date(0);
      return bDate - aDate;
    });
  }

  // OPTIMIZED: Parallel API calls with memoization
  async fetchAdvancePaymentData() {
    const leads = await this.fetchAssignedLeads();
    const leadIds = leads.map(lead => lead.id);
    const leadsMap = this.buildLeadsMap(leads);

    if (leadIds.length === 0) {
      return [];
    }

    // OPTIMIZED: Fetch all data in parallel
    const [allPayments, allQuotations] = await Promise.all([
      this.fetchBulkPaymentsByCustomers(leadIds),
      this.fetchBulkQuotationsByCustomers(leadIds)
    ]);

    const allQuotationsFiltered = (allQuotations || []).filter(q => (q.status || '').toLowerCase() !== 'cancelled');
    const quotationIds = allQuotationsFiltered.map(q => q.id).filter(Boolean);
    
    // OPTIMIZED: Fetch quotation payments in parallel (no need to wait)
    const quotationPaymentsPromise = quotationIds.length > 0 
      ? this.fetchBulkPaymentsByQuotations(quotationIds)
      : Promise.resolve([]);

    // Process while fetching quotation payments
    const quotationPayments = await quotationPaymentsPromise;
    const mergedPayments = this.mergePayments(allPayments, quotationPayments);

    const paymentMap = this.buildPaymentMap(allQuotationsFiltered, mergedPayments, leadsMap);
    return await this.buildAdvancePaymentData(paymentMap);
  }
}

// Timeline Sidebar component for viewing payment tracking details
const PaymentTimelineSidebar = ({ item, onClose, refreshKey = 0, companyBranches, user, viewHook }) => {
  const [customerQuotations, setCustomerQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [quotationError, setQuotationError] = useState(null);
  const [quotationSummary, setQuotationSummary] = useState(null);
  const [paymentsForQuotation, setPaymentsForQuotation] = useState([]);
  const [pisByQuotationId, setPisByQuotationId] = useState({});

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
            const [sRes, pRes, piRes] = await Promise.all([
              quotationService.getSummary(chosenQuotationId),
              paymentService.getPaymentsByQuotation(chosenQuotationId),
              proformaInvoiceService.getPIsByQuotation(chosenQuotationId)
            ]);
            setCustomerQuotations([item.quotationData]);
            setQuotationSummary(sRes?.data || null);
            setPaymentsForQuotation(pRes?.data || []);
            const pis = DataExtractor.extractArray(piRes);
            setPisByQuotationId({ [chosenQuotationId]: pis });
            return;
          } catch (innerErr) {
          }
        }

        // Fallback: fetch quotations for this customer/lead and then pick latest approved
        const quotationsResponse = await quotationService.getQuotationsByCustomer(item.leadData.id);
        const qList = quotationsResponse?.data || [];
        setCustomerQuotations(qList);
        
        // Fetch PIs for all quotations
        const pisMap = {};
        for (const q of qList) {
          try {
            const piRes = await proformaInvoiceService.getPIsByQuotation(q.id);
            const pis = DataExtractor.extractArray(piRes);
            if (pis.length > 0) {
              pisMap[q.id] = pis;
            }
          } catch (err) {
          }
        }
        setPisByQuotationId(pisMap);
        
        const latestApproved = qList.filter(q => q.status === 'approved').slice(-1)[0];
        if (latestApproved?.id) {
          const [sRes, pRes] = await Promise.all([
            quotationService.getSummary(latestApproved.id),
            paymentService.getPaymentsByQuotation(latestApproved.id)
          ]);
          setQuotationSummary(sRes?.data || null);
          setPaymentsForQuotation(pRes?.data || []);
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

  // Handle view quotation and PI using shared hook
  const handleViewQuotation = viewHook?.handleViewQuotation;
  const handleViewPI = viewHook?.handleViewPI;

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
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'REJECTED' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'PAID' },
      'partial': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'PARTIAL' },
      'overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'OVERDUE' },
      'due': { bg: 'bg-red-100', text: 'text-red-800', label: 'PENDING' },
      'deal-closed': { bg: 'bg-green-100', text: 'text-green-800', label: 'DEAL CLOSED' }
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
    const approvedQuotations = customerQuotations.filter(q => q.status === 'approved');
    
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

    // Get the latest approved quotation amount
    const latestApprovedQuotation = approvedQuotations[approvedQuotations.length - 1];
    // Prefer backend summary if available for accuracy
    const totalAmount = (quotationSummary?.total_amount ?? latestApprovedQuotation.total_amount) || 0;
    const paidAmount = typeof quotationSummary?.total_paid === 'number'
      ? quotationSummary.total_paid
      : (typeof quotationSummary?.paid === 'number'
        ? quotationSummary.paid
        : (Array.isArray(paymentsForQuotation)
            ? paymentsForQuotation.filter(p => (p.payment_status || p.status || '').toLowerCase() === 'completed')
                .reduce((sum, p) => sum + (Number((p.paid_amount ?? p.installment_amount ?? p.amount) || 0)), 0)
            : 0));
    const remainingAmount = typeof quotationSummary?.current_remaining === 'number'
      ? quotationSummary.current_remaining
      : (typeof quotationSummary?.remaining === 'number'
        ? quotationSummary.remaining
        : Math.max(0, Number(totalAmount) - Number(paidAmount)));
    
    // Calculate advance (first payment), partial (subsequent payments), due (remaining)
    let advanceAmount = 0;
    let partialAmount = 0;
    
    const pmts = Array.isArray(paymentsForQuotation) ? paymentsForQuotation.slice().sort((a,b)=> new Date(a.payment_date) - new Date(b.payment_date)) : [];
    if (pmts.length > 0) {
      advanceAmount = Number((pmts[0]?.paid_amount ?? pmts[0]?.installment_amount ?? pmts[0]?.amount) || 0);
      if (pmts.length > 1) {
        partialAmount = pmts.slice(1).reduce((sum, p) => sum + (Number((p.paid_amount ?? p.installment_amount ?? p.amount) || 0)), 0);
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

  // Build chronological payment timeline with running remaining balance
  const buildPaymentTimeline = () => {
    const approvedQuotations = customerQuotations.filter(q => q.status === 'approved');
    if (approvedQuotations.length === 0) return [];
    const latestApprovedQuotation = approvedQuotations[approvedQuotations.length - 1];
    const totalAmount = (quotationSummary?.total_amount ?? latestApprovedQuotation.total_amount) || 0;
    const pmts = Array.isArray(paymentsForQuotation)
      ? paymentsForQuotation.slice().sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))
      : [];
    let cumulativePaid = 0;
    return pmts.map((p, idx) => {
      const amountNum = Number(p.paid_amount ?? p.installment_amount ?? p.amount ?? 0);
      cumulativePaid += amountNum;
      const remaining = Math.max(0, Number(totalAmount) - cumulativePaid);
      // Label logic: If cumulative paid >= total amount, it's "Full Payment", otherwise "Advance Payment"
      const isFullPayment = cumulativePaid >= totalAmount && totalAmount > 0;
      const label = isFullPayment ? 'Full Payment' : 'Advance Payment';
      return { ...p, amount: amountNum, label, remainingAfter: remaining };
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
  const hasPendingAmount = dataReady && paymentSummary?.dueAmount > 0;


  // Timeline events data - complete sequence (include payments inline)
  // Use useMemo to recalculate when pisByQuotationId or customerQuotations change
  const timelineEvents = useMemo(() => [
    {
      id: 'customer-created',
      title: 'Customer Created',
      date: formatIndianDate(item.leadData?.created_at),
      status: 'completed',
      icon: '✓',
      description: `Lead ID: ${item.leadId}`
    },
    ...customerQuotations.flatMap((quotation, index) => {
      const quotationEvent = {
        id: `quotation-${quotation.id}`,
        title: `Quotation ${index + 1}`,
        date: formatIndianDateTime(quotation.created_at),
        status: quotation.status === 'approved' ? 'approved' : 'pending',
        icon: quotation.status === 'approved' ? '✓' : '⏳',
        description: `ID: ${quotation.quotation_number || `QT-${quotation.id}`} | Purchase Order: ${quotation.work_order_id ? `PO-${quotation.work_order_id}` : 'N/A'}`,
        amount: quotation.total_amount || 0,
        quotationId: quotation.id,
        quotationStatus: quotation.status
      };
      
      // Get PIs for this quotation
      const pis = pisByQuotationId[quotation.id] || [];
      const piEvents = pis.map((pi, piIndex) => ({
        id: `pi-${pi.id}`,
        title: `PI ${piIndex + 1}`,
        date: formatIndianDateTime(pi.created_at || pi.createdAt),
        status: (pi.status || 'pending').toLowerCase() === 'approved' ? 'approved' : ((pi.status || 'pending').toLowerCase() === 'rejected' ? 'rejected' : 'pending'),
        icon: (pi.status || 'pending').toLowerCase() === 'approved' ? '✓' : ((pi.status || 'pending').toLowerCase() === 'rejected' ? '✕' : '⏳'),
        description: `PI Number: ${pi.pi_number || pi.piNumber || `PI-${pi.id}`}`,
        amount: pi.total_amount || pi.totalAmount || 0,
        piId: pi.id,
        piStatus: pi.status
      }));
      
      return [quotationEvent, ...piEvents];
    }),
    ...paymentTimeline.map((payment, index) => ({
      id: `payment-${index + 1}`,
      title: `${payment.label} Payment #${index + 1}`,
      date: formatIndianDateTime(payment.payment_date),
      status: (payment.status || 'completed').toLowerCase(),
      icon: '₹',
      description: `Method: ${payment.payment_method || 'N/A'}`,
      amount: payment.amount ?? payment.installment_amount,
      remainingAmount: payment.remainingAfter
    })),
    ...(hasPendingAmount ? [{
      id: 'due-payment',
      title: 'DUE',
      date: dueDate ? formatIndianDate(dueDate) : 'N/A',
      status: 'due',
      icon: '⚠',
      description: dueDate ? `Due Date: ${formatIndianDate(dueDate)}` : 'Payment pending',
      amount: paymentSummary.dueAmount,
      isDue: true
    }] : []),
    ...((paymentSummary && paymentSummary.paymentStatus === 'paid') ? [{
      id: 'deal-closed',
      title: 'Deal Closed',
      date: Array.isArray(item.paymentsData) && item.paymentsData.length > 0 ? formatIndianDateTime(item.paymentsData[item.paymentsData.length - 1]?.payment_date) : 'N/A',
      status: 'completed',
      icon: '✓',
      description: 'Full and final payment received'
    }] : [])
  ], [customerQuotations, pisByQuotationId, paymentTimeline, hasPendingAmount, dueDate, paymentSummary, item.paymentsData, item.leadData?.created_at, item.leadId]);

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
                    : event.id?.startsWith('payment-')
                    ? 'bg-yellow-500'
                    : event.status === 'rejected'
                    ? 'bg-red-500'
                    : event.status === 'completed' || event.status === 'approved' || event.status === 'paid'
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}>
                  <span className="text-white text-sm font-bold">{event.icon}</span>
                </div>
                
                {/* Event card */}
                <div className={`ml-4 flex-1 p-3 rounded-lg ${
                  event.isDue
                    ? 'bg-red-50 border border-red-300'
                    : event.id?.startsWith('payment-')
                    ? 'bg-yellow-50'
                    : event.status === 'rejected'
                    ? 'bg-red-50 border border-red-300'
                    : event.status === 'completed' || event.status === 'approved' || event.status === 'paid'
                    ? 'bg-green-50'
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
                      
                      {/* View buttons for quotations and PIs */}
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
                      {/* View button for PIs */}
                      {event.piId && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPI(event.piId)}
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
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
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

// Payment Modal component for adding payments
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
  const [installments, setInstallments] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        if (!item?.leadData?.id) return;
        const [qRes, cRes] = await Promise.all([
          quotationService.getApproved(item.leadData.id),
          paymentService.getCustomerCredit(item.leadData.id)
        ]);
        
        // Filter quotations to only show those with PI created
        const allApprovedQuotations = qRes?.data || [];
        const quotationsWithPI = [];
        
        for (const q of allApprovedQuotations) {
          try {
            const piRes = await proformaInvoiceService.getPIsByQuotation(q.id);
            const pis = piRes?.data || [];
            if (pis.length > 0) {
              quotationsWithPI.push(q);
            }
          } catch (err) {
          }
        }
        
        setApprovedQuotations(quotationsWithPI);
        setCredit(cRes?.data?.balance || 0);
        
        // Pre-select quotation if available
        const qid = item.quotationData?.id || (quotationsWithPI?.[0]?.id || '');
        if (qid) {
          setSelectedQuotationId(qid);
          const [sRes, pRes, piRes] = await Promise.all([
            quotationService.getSummary(qid),
            paymentService.getPaymentsByQuotation(qid),
            proformaInvoiceService.getPIsByQuotation(qid)
          ]);
          const s = sRes?.data || { total: 0, paid: 0, remaining: 0 };
          setSummary(s);
          setInstallments(pRes?.data || []);
          const pis = piRes?.data || [];
          setProformaInvoices(pis);
          
          // Auto-select first PI if available
          if (pis.length > 0) {
            setSelectedPIId(pis[0].id);
          }
          
          setPaymentData((p) => ({ 
            ...p, 
            installment_amount: String(s.remaining || ''),
            purchase_order_id: item.quotationData?.work_order_id || ''
          }));
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
      const [sRes, pRes, piRes] = await Promise.all([
        quotationService.getSummary(qid),
        paymentService.getPaymentsByQuotation(qid),
        proformaInvoiceService.getPIsByQuotation(qid)
      ]);
      const s = sRes?.data || { total: 0, paid: 0, remaining: 0 };
      setSummary(s);
      setInstallments(pRes?.data || []);
      const pis = piRes?.data || [];
      setProformaInvoices(pis);
      
      // Auto-select first PI if available
      if (pis.length > 0) {
        setSelectedPIId(pis[0].id);
      }
      
      setPaymentData((p) => ({ ...p, installment_amount: String(s.remaining || '') }));
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{item.customerName && item.customerName !== 'N/A' ? item.customerName : (item.leadData?.name || 'N/A')}</h4>
            <p className="text-sm text-gray-600">Lead ID: {item.leadId}</p>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quotation (approved only)</label>
            <select
              value={selectedQuotationId}
              onChange={(e) => handleSelectQuotation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Approved Quotation --</option>
              {approvedQuotations.map((q) => (
                <option key={q.id} value={q.id}>{q.quotation_number || q.id} - ₹{Number(q.total_amount || q.totalAmount || 0).toLocaleString()}</option>
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
                <p className="text-sm text-yellow-800 font-medium">⚠ No quotations with PI available</p>
                <p className="text-xs text-yellow-700 mt-1">Please create a PI for an approved quotation first, then you can add payment.</p>
              </div>
            )}
          </div>

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

// Tooltip component
const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-1">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default function AdvancePaymentPage({ isDarkMode = false }) {
  const [paymentTracking, setPaymentTracking] = useState([]);
  const [filteredPaymentTracking, setFilteredPaymentTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [selectedCancelOrderItem, setSelectedCancelOrderItem] = useState(null);
  const [showAmendPIModal, setShowAmendPIModal] = useState(false);
  const [selectedAmendPIItem, setSelectedAmendPIItem] = useState(null);
  const [companyBranches, setCompanyBranches] = useState({});
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPaymentTracking.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPaymentTracking = filteredPaymentTracking.slice(startIndex, endIndex);

  const paymentTrackingService = new PaymentTrackingService(
    apiClient,
    paymentService,
    quotationService,
    proformaInvoiceService
  );

  // Get current user for role-based filtering
  const { user } = useAuth();
  const currentUserId = user?.id;
  const lastUserIdRef = React.useRef(null);

  // Setup view hook for quotations and PIs
  const viewHook = useViewQuotationPI(companyBranches, user);
  
  // Handle view quotation and PI using shared hook
  const handleViewQuotation = viewHook?.handleViewQuotation || (() => {});
  const handleViewPI = viewHook?.handleViewPI || (() => {});

  useEffect(() => {
    // If no user is logged in, do nothing
    if (!currentUserId) {
      return;
    }

    // If user has changed, clear existing data
    if (lastUserIdRef.current !== null && lastUserIdRef.current !== currentUserId) {
      setPaymentTracking([]);
      setFilteredPaymentTracking([]);
      setError(null);
    }

    // Update last user ID
    lastUserIdRef.current = currentUserId;

    const fetchPaymentTracking = async () => {
      try {
        setLoading(true);
        setError(null);
        // Global cache busting is automatically applied by apiClient.get()
        const advancePayments = await paymentTrackingService.fetchAdvancePaymentData();
        setPaymentTracking(advancePayments);
        setFilteredPaymentTracking(advancePayments);
      } catch (error) {
        console.error('Error fetching payment tracking data:', error);
        setError('Failed to load payment tracking data');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchPaymentTracking();
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

  // Load company branches from database
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const { branches } = await CompanyBranchService.fetchBranches();
        setCompanyBranches(branches);
      } catch (error) {
        console.error('Failed to load company branches:', error);
      }
    };
    loadBranches();
  }, []);

  // Handle search and filtering
  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredPaymentTracking(paymentTracking);
      return;
    }

    const filtered = paymentTracking.filter(item => 
      item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.leadId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.quotationId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.leadData?.phone?.includes(searchQuery) ||
      item.leadData?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredPaymentTracking(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters) => {
    let filtered = [...paymentTracking];

    // Apply quotation ID filter
    if (filters.quotationId) {
      filtered = filtered.filter(item => 
        item.quotationId?.toLowerCase().includes(filters.quotationId.toLowerCase())
      );
    }

    // Apply payment type filter
    if (filters.paymentType) {
      filtered = filtered.filter(item => {
        switch (filters.paymentType) {
          case 'advance':
            return item.paymentStatus === 'advance';
          case 'partial':
            return item.remainingAmount > 0;
          default:
            return true;
        }
      });
    }

    setFilteredPaymentTracking(filtered);
    setCurrentPage(1);
  };

  const handleAddProduct = (paymentData, editingItem) => {
    if (editingItem) {
      setPaymentTracking(prev => 
        prev.map(item => item.id === editingItem.id ? { ...item, ...paymentData } : item)
      );
      setFilteredPaymentTracking(prev => 
        prev.map(item => item.id === editingItem.id ? { ...item, ...paymentData } : item)
      );
    } else {
      const newItem = { ...paymentData, id: Date.now() };
      setPaymentTracking(prev => [...prev, newItem]);
      setFilteredPaymentTracking(prev => [...prev, newItem]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleViewPayment = (item) => {
    setSelectedProduct(item);
  };

  const handleAddPayment = (item) => {
    if (!item) {
      alert('Please select a payment record from the table to add payment');
      return;
    }
    setSelectedPaymentItem(item);
    setShowPaymentModal(true);
  };

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

  const getPaymentStatusBadge = (status, item) => {
    // Check if payment is rejected
    const hasRejectedPayment = item?.paymentsData?.some(p => 
      (p.approval_status || '').toLowerCase() === 'rejected'
    ) || false;

    if (hasRejectedPayment) {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor('Rejected')}`}>
          {getStatusIcon('Rejected')}
          Rejected
        </span>
      );
    }

    const statusText = item.remainingAmount > 0 ? 'Advance' : 'Paid';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(statusText)}`}>
        {getStatusIcon(statusText)}
        {statusText}
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen pb-24 sm:pb-6`}>
      {/* Toolbar */}
      <Toolbar
        onSearch={handleSearch}
        onAddProduct={handleAddProduct}
        onFilterChange={handleFilterChange}
        onRefresh={() => window.location.reload()}
        products={paymentTracking}
        loading={loading}
      />

      {/* Table */}
      {filteredPaymentTracking.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-3 sm:px-6 py-3 sm:py-4 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No advance payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no advance payments for tracking.
            </p>
          </div>
        </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-[800px] sm:w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Lead ID</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-violet-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-indigo-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quotation ID</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Status</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Advance Amount</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Remaining Amount</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery Date</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <MoreHorizontal className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Action</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPaymentTracking.length > 0 ? (
                  paginatedPaymentTracking.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
                              onClick={() => window.open(`mailto:${item.leadData.email}?subject=Advance Payment Follow up from ANOCAB&body=Dear ${item.customerName},%0D%0A%0D%0AThank you for your advance payment.%0D%0A%0D%0ABest regards,%0D%0AANOCAB Team`, '_blank')}
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
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {getPaymentStatusBadge(item.paymentStatus, item)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-green-600 font-semibold">
                        ₹{item.advanceAmount?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-blue-600 font-semibold">
                          ₹{item.remainingAmount?.toFixed(2) || '0.00'}
                        </span>
                        {item.remainingAmount > 0 && item.totalAmount > 0 && (
                          <span className="text-xs text-gray-600 mt-1">
                            {((item.remainingAmount / item.totalAmount) * 100).toFixed(1)}% remaining
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {item.dueDate ? 
                            new Date(item.dueDate).toLocaleDateString('en-GB') : 
                            'N/A'
                          }
                        </span>
                        {item.deliveryStatus && (
                          <span className="text-xs text-gray-600 mt-1">
                            "{item.deliveryStatus}"
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
                    <td colSpan="9" className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                      No advance payment records found matching your criteria
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
      
      {/* Global Customer Timeline Sidebar (salesperson view) */}
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
            if (piId) {
              handleViewPI(piId);
            }
          }}
          onCancelOrder={(quotation) => {
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
          onPaymentAdded={async () => {
            setShowPaymentModal(false);
            setSelectedPaymentItem(null);
            try {
              setLoading(true);
              const advancePayments = await paymentTrackingService.fetchAdvancePaymentData();
              setPaymentTracking(advancePayments);
              setFilteredPaymentTracking(advancePayments);
            } catch (error) {
              console.error('Error refreshing payment tracking data:', error);
            } finally {
              setLoading(false);
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
              const advancePayments = await paymentTrackingService.fetchAdvancePaymentData();
              setPaymentTracking(advancePayments);
              setFilteredPaymentTracking(advancePayments);
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
              const advancePayments = await paymentTrackingService.fetchAdvancePaymentData();
              setPaymentTracking(advancePayments);
              setFilteredPaymentTracking(advancePayments);
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
