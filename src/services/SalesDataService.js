import departmentHeadService from '../api/admin_api/departmentHeadService';
import quotationService from '../api/admin_api/quotationService';
import paymentService from '../api/admin_api/paymentService';
import proformaInvoiceService from '../api/admin_api/proformaInvoiceService';
import departmentUserService from '../api/admin_api/departmentUserService';
import { toDateOnly } from '../utils/dateOnly';

class SalesDataService {
  async fetchAllLeads(departmentType = null) {
    // OPTIMIZED: Fetch first page to get total count, then fetch all pages in parallel
    const pageSize = 100;
    const params = { page: 1, limit: pageSize };
    if (departmentType) {
      params.departmentType = departmentType;
    }
    
    const firstResponse = await departmentHeadService.getAllLeads(params);
    const firstPageData = firstResponse?.data || [];
    const pagination = firstResponse?.pagination || {};
    const total = pagination.total || firstPageData.length;
    const totalPages = pagination.pages || Math.ceil(total / pageSize);
    
    // If only one page, return early
    if (totalPages <= 1) {
      return firstPageData;
    }
    
    // Fetch remaining pages in parallel
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { page, limit: pageSize };
      if (departmentType) {
        pageParams.departmentType = departmentType;
      }
      pagePromises.push(departmentHeadService.getAllLeads(pageParams));
    }
    
    const remainingResponses = await Promise.all(pagePromises);
    let allLeads = [...firstPageData];
    
    remainingResponses.forEach(response => {
      const leadsData = response?.data || [];
      allLeads = allLeads.concat(leadsData);
    });
    
    return allLeads;
  }

  calculateLeadStatuses(allLeads) {
    const statusCounts = { 
      all: 0, 
      pending: 0, 
      running: 0, 
      converted: 0, 
      interested: 0, 
      'win/closed': 0, 
      closed: 0, 
      lost: 0 
    };
    
    statusCounts.all = allLeads.length;
    allLeads.forEach(l => {
      const status = String(l.sales_status || l.salesStatus || '').toLowerCase().trim();
      
      if (status === 'win/closed' || status === 'win closed') {
        statusCounts['win/closed'] += 1;
      } else if (statusCounts[status] != null) {
        statusCounts[status] += 1;
      }
    });
    
    const followUpCounts = { 
      'appointment scheduled': 0, 
      'closed/lost': 0, 
      'quotation sent': 0 
    };
    allLeads.forEach(l => {
      // Use follow_up_status first, then fallback to followUpStatus
      const status = String(l.follow_up_status || l.followUpStatus || '').toLowerCase().trim();
      if (followUpCounts[status] != null) {
        followUpCounts[status] += 1;
      }
    });
    
    return {
      total: statusCounts.all,
      pending: statusCounts.pending,
      running: statusCounts.running,
      converted: statusCounts.converted,
      interested: statusCounts.interested,
      winClosed: statusCounts['win/closed'] || 0, // Use 'win/closed' key if exists
      closed: statusCounts.closed,
      lost: statusCounts.lost,
      meetingScheduled: followUpCounts['appointment scheduled'] || 0,
      quotationSent: followUpCounts['quotation sent'] || 0,
      closedLostFollowup: followUpCounts['closed/lost'] || 0
    };
  }

  async fetchQuotations(leadIds) {
    if (leadIds.length === 0) return [];
    
    const response = await quotationService.getBulkQuotationsByCustomers(leadIds);
    const allQuotations = response?.data || [];
    
    const uniqueQuotations = new Map();
    allQuotations.forEach(q => {
      if (q.id && !uniqueQuotations.has(q.id)) {
        uniqueQuotations.set(q.id, q);
      }
    });
    
    return Array.from(uniqueQuotations.values());
  }

  calculateQuotationMetrics(allQuotations) {
    return {
      total: allQuotations.length,
      approved: allQuotations.filter(q => (q.status || '').toLowerCase() === 'approved').length,
      pending: allQuotations.filter(q => {
        const status = (q.status || '').toLowerCase();
        return status === 'pending' || status === 'pending_approval' || status === 'draft';
      }).length,
      rejected: allQuotations.filter(q => (q.status || '').toLowerCase() === 'rejected').length
    };
  }

  async fetchPayments(quotationIds, leadIds) {
    if (quotationIds.length === 0 && leadIds.length === 0) return [];

    const [quotationPaymentsRes, customerPaymentsRes] = await Promise.all([
      quotationIds.length > 0 ? paymentService.getBulkPaymentsByQuotations(quotationIds) : Promise.resolve({ data: [] }),
      paymentService.getBulkPaymentsByCustomers(leadIds)
    ]);

    const quotationPayments = quotationPaymentsRes?.data || [];
    const customerPayments = customerPaymentsRes?.data || [];
    
    const paymentMap = new Map();
    [...quotationPayments, ...customerPayments].forEach(p => {
      const key = p.id || p.payment_reference || `${p.quotation_id}_${p.lead_id}_${p.payment_date}_${p.installment_amount}`;
      if (!paymentMap.has(key)) {
        paymentMap.set(key, p);
      }
    });

    return Array.from(paymentMap.values());
  }

  calculatePaymentMetrics(allPayments, quotationsWithPI, allQuotations, options = {}) {
    // Use same logic as Sales Department Head dashboard for consistency
    const { startDate = null, endDate = null } = options || {};

    const isPaymentApprovedByAccounts = (payment) => {
      // Check approval_status first (primary field), then fallback to other field names
      const accountsStatus = (payment.approval_status || payment.accounts_approval_status || payment.accountsApprovalStatus || '').toLowerCase();
      return accountsStatus === 'approved';
    };

    const isPaymentCompleted = (payment) => {
      const status = (payment.payment_status || payment.status || '').toLowerCase();
      return status === 'completed' || status === 'paid' || status === 'success' || status === 'advance';
    };

    const isPaymentRefund = (payment) => {
      return payment.is_refund === true || payment.is_refund === 1;
    };

    const isWithinDateRange = (payment) => {
      if (!startDate && !endDate) return true;
      const raw = payment.payment_date || payment.paymentDate;
      if (!raw) return false;
      const pd = toDateOnly(raw);
      if (!pd) return false;
      if (startDate && pd < startDate) return false;
      if (endDate && pd > endDate) return false;
      return true;
    };

    const getPaymentAmount = (p) => {
      const amount = Number(p.installment_amount || p.paid_amount || p.amount || p.payment_amount || 0);
      return isNaN(amount) ? 0 : amount;
    };
    
    const isAdvancePayment = (p) => {
      const paymentType = (p.payment_type || '').toLowerCase();
      const status = (p.payment_status || p.status || '').toLowerCase();
      return paymentType === 'advance' ||
             (p.is_advance || p.isAdvance) ||
             status === 'advance' ||
             (p.installment_number === 1 || p.installment_number === 0);
    };

  
    const completedPayments = allPayments.filter(p => {
      return isPaymentCompleted(p) && !isPaymentRefund(p) && isPaymentApprovedByAccounts(p) && isWithinDateRange(p);
    });

    const totalReceived = completedPayments.reduce((sum, p) => sum + getPaymentAmount(p), 0);
    const totalAdvance = completedPayments.filter(isAdvancePayment).reduce((sum, p) => sum + getPaymentAmount(p), 0);

    return { approvedPayments: completedPayments, totalReceived, totalAdvance };
  }

  async calculateDuePayment(quotationsWithPI, allQuotations, allPayments) {
    if (!quotationsWithPI || quotationsWithPI.length === 0) return 0;

    try {
      // Use same logic as Sales Department Head dashboard for consistency
      const quotationIdsForSummary = quotationsWithPI.map(q => q.id).filter(id => id != null);
      if (quotationIdsForSummary.length === 0) return 0;

      const summariesRes = await quotationService.getBulkSummaries(quotationIdsForSummary);
      const summaries = summariesRes?.data || [];
      
      let summariesArray = [];
      if (Array.isArray(summaries)) {
        summariesArray = summaries;
      } else if (typeof summaries === 'object') {
        summariesArray = Object.values(summaries);
      }

      // Payment filtering functions (matching Sales Department Head logic)
      const isPaymentApprovedByAccounts = (payment) => {
        const accountsStatus = (payment.approval_status || payment.accounts_approval_status || payment.accountsApprovalStatus || '').toLowerCase();
        return accountsStatus === 'approved';
      };

      const isPaymentCompleted = (payment) => {
        const status = (payment.payment_status || payment.status || '').toLowerCase();
        return status === 'completed' || status === 'paid' || status === 'success' || status === 'advance';
      };

      const isPaymentRefund = (payment) => {
        return payment.is_refund === true || payment.is_refund === 1;
      };

      const getPaymentAmount = (p) => {
        const amount = Number(p.installment_amount || p.paid_amount || p.amount || p.payment_amount || 0);
        return isNaN(amount) ? 0 : amount;
      };
      
      let duePayment = 0;
      let totalRevenue = 0;

      // Calculate due payment for each quotation with PI (matching Sales Department Head logic)
      quotationsWithPI.forEach(quotation => {
        // Get summary for this quotation
        let summary = null;
        for (const summaryItem of summariesArray) {
          let s = summaryItem;
          if (summaryItem.summary && typeof summaryItem.summary === 'object') {
            s = summaryItem.summary;
          }
          const qId = summaryItem.quotation_id || (summaryItem.quotation && summaryItem.quotation.id);
          if (qId === quotation.id) {
            summary = s;
            break;
          }
        }

        // Get quotation total from summary or quotation object
        const quotationTotal = Number(
          (summary && (summary.total_amount || summary.total || summary.grand_total)) ||
          quotation.total_amount || 
          quotation.total || 
          0
        );

        // Safeguard against unreasonably large numbers (> 10 crore per quotation)
        if (quotationTotal > 100000000) {
          console.warn('[SalesDataService] Quotation amount too high, skipping:', quotationTotal);
          return;
        }

        if (!isNaN(quotationTotal) && quotationTotal > 0) {
          // Only add to total revenue if quotation is approved
          const status = (quotation.status || '').toLowerCase();
          if (status === 'approved') {
            totalRevenue += quotationTotal;
          }

          // Get all approved payments for this quotation (matching Sales Department Head logic)
          const quotationPayments = (allPayments || []).filter(p => 
            p.quotation_id === quotation.id && 
            isPaymentCompleted(p) && 
            !isPaymentRefund(p) && 
            isPaymentApprovedByAccounts(p)
          );

          // Calculate paid total using installment_amount (matching Sales Department Head logic)
          const paidTotal = quotationPayments.reduce((sum, p) => {
            return sum + getPaymentAmount(p);
          }, 0);

          // Calculate remaining amount (Due Payment)
          const remaining = quotationTotal - paidTotal;
          if (remaining > 0) {
            duePayment += remaining;
          }
        }
      });

      return duePayment;
    } catch (error) {
      console.error('[SalesDataService] Error calculating due payment:', error);
      return 0;
    }
  }

  async fetchProformaInvoices(quotationIds) {
    if (quotationIds.length === 0) return [];
    
    const response = await proformaInvoiceService.getBulkPIsByQuotations(quotationIds);
    return response?.data || [];
  }

  calculatePIMetrics(allPIs) {
    return {
      total: allPIs.length,
      approved: allPIs.filter(pi => (pi.status || '').toLowerCase() === 'approved').length,
      pending: allPIs.filter(pi => {
        const status = (pi.status || '').toLowerCase();
        return status === 'pending' || status === 'pending_approval';
      }).length,
      rejected: allPIs.filter(pi => (pi.status || '').toLowerCase() === 'rejected').length
    };
  }

  async fetchAllDepartmentUsers(departmentType = null) {
    // OPTIMIZED: Fetch first page to get total count, then fetch all pages in parallel
    const pageSize = 100;
    const params = { page: 1, limit: pageSize };
    if (departmentType) {
      params.departmentType = departmentType;
    }
    
    const firstResponse = await departmentUserService.listUsers(params);
    const firstPageData = firstResponse?.data?.users || firstResponse?.data || [];
    const pagination = firstResponse?.pagination || {};
    const total = pagination.total || firstPageData.length;
    const totalPages = pagination.pages || Math.ceil(total / pageSize);
    
    // If only one page, return early
    if (totalPages <= 1) {
      return firstPageData;
    }
    
    // Fetch remaining pages in parallel
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
      const pageParams = { page, limit: pageSize };
      if (departmentType) {
        pageParams.departmentType = departmentType;
      }
      pagePromises.push(departmentUserService.listUsers(pageParams));
    }
    
    const remainingResponses = await Promise.all(pagePromises);
    let allUsers = [...firstPageData];
    
    remainingResponses.forEach(response => {
      const usersData = response?.data?.users || response?.data || [];
      allUsers = allUsers.concat(usersData);
    });
    
    return allUsers;
  }

  async calculateTopPerformers(allPayments, allLeads, allQuotations, departmentType = null, options = {}) {
    try {
      const { startDate = null, endDate = null } = options || {};

      // Filter users by departmentType if provided (for SuperAdmin to filter by office_sales)
      const allUsers = await this.fetchAllDepartmentUsers(departmentType);
      
      const userMap = new Map();
      
      allUsers.forEach(user => {
        const email = (user.email || '').toLowerCase().trim();
        const username = (user.username || '').toLowerCase().trim();
        const name = user.name || user.username || user.email || 'Unknown';
        
        if (email) {
          userMap.set(email, { name, username: user.username || user.email || '', email: user.email || '' });
          const emailLocal = email.includes('@') ? email.split('@')[0] : email;
          if (emailLocal && emailLocal !== email) {
            userMap.set(emailLocal, { name, username: user.username || user.email || '', email: user.email || '' });
          }
        }
        if (username) {
          userMap.set(username, { name, username: user.username || '', email: user.email || '' });
        }
        if (user.id) {
          userMap.set(String(user.id).toLowerCase(), { name, username: user.username || user.email || '', email: user.email || '' });
        }
      });
    
    const performerMap = new Map();
    
    const isPaymentApprovedByAccounts = (payment) => {
      const accountsStatus = (payment.approval_status || payment.accounts_approval_status || payment.accountsApprovalStatus || '').toLowerCase();
      return accountsStatus === 'approved';
    };

    const isPaymentCompleted = (payment) => {
      const status = (payment.payment_status || payment.status || '').toLowerCase();
      return status === 'completed' || status === 'paid' || status === 'success' || status === 'advance';
    };

    const isPaymentRefund = (payment) => {
      return payment.is_refund === true || payment.is_refund === 1;
    };

    const isWithinDateRange = (payment) => {
      if (!startDate && !endDate) return true;
      const raw = payment.payment_date || payment.paymentDate;
      if (!raw) return false;
      const pd = toDateOnly(raw);
      if (!pd) return false;
      if (startDate && pd < startDate) return false;
      if (endDate && pd > endDate) return false;
      return true;
    };

    const approvedPayments = allPayments.filter(p => {
      return isPaymentCompleted(p) && !isPaymentRefund(p) && isPaymentApprovedByAccounts(p) && isWithinDateRange(p);
    });

    const quotationToSalesperson = new Map();
    allQuotations.forEach(q => {
      const salesperson = q.assigned_salesperson || q.assignedSalesperson || q.created_by;
      if (salesperson && q.id) {
        const qId = q.id;
        quotationToSalesperson.set(qId, salesperson);
        if (!isNaN(qId)) {
          quotationToSalesperson.set(String(qId), salesperson);
          quotationToSalesperson.set(Number(qId), salesperson);
        }
      }
    });

    const leadToSalesperson = new Map();
    allLeads.forEach(l => {
      const salesperson = l.assigned_salesperson || l.assignedSalesperson;
      if (salesperson && l.id) {
        const leadId = l.id;
        leadToSalesperson.set(leadId, salesperson);
        if (!isNaN(leadId)) {
          leadToSalesperson.set(String(leadId), salesperson);
          leadToSalesperson.set(Number(leadId), salesperson);
        }
      }
    });

    approvedPayments.forEach(payment => {
      let salespersonId = payment.assigned_salesperson || payment.assignedSalesperson;
      
      // Try to get salesperson from quotation
      if (!salespersonId && payment.quotation_id) {
        salespersonId = quotationToSalesperson.get(payment.quotation_id);
        // Also try with string conversion
        if (!salespersonId) {
          const qId = String(payment.quotation_id);
          salespersonId = quotationToSalesperson.get(qId);
        }
      }
      
      // Try to get salesperson from lead_id (handle both string and number)
      if (!salespersonId && payment.lead_id) {
        const leadId = payment.lead_id;
        salespersonId = leadToSalesperson.get(leadId);
        // Try with number conversion
        if (!salespersonId && !isNaN(leadId)) {
          salespersonId = leadToSalesperson.get(Number(leadId));
        }
        // Try with string conversion
        if (!salespersonId) {
          salespersonId = leadToSalesperson.get(String(leadId));
        }
      }
      
      // Try to get salesperson from customer_id (handle both string and number)
      if (!salespersonId && payment.customer_id) {
        const customerId = payment.customer_id;
        salespersonId = leadToSalesperson.get(customerId);
        // Try with number conversion
        if (!salespersonId && !isNaN(customerId)) {
          salespersonId = leadToSalesperson.get(Number(customerId));
        }
        // Try with string conversion
        if (!salespersonId) {
          salespersonId = leadToSalesperson.get(String(customerId));
        }
      }
      
      const amount = Number(payment.paid_amount || payment.installment_amount || payment.amount || payment.payment_amount || 0);
      
      if (amount <= 0) {
        return;
      }
      
      if (!salespersonId) {
        return;
      }
      
      const salespersonKey = String(salespersonId).toLowerCase().trim();
      
      // Skip if salesperson is "Unassigned" or empty
      if (!salespersonKey || salespersonKey === 'unassigned' || salespersonKey === 'null' || salespersonKey === 'undefined' || salespersonKey === '') {
        return;
      }
      
      // Try multiple matching strategies
      let userInfo = userMap.get(salespersonKey);
      
      if (!userInfo) {
        // Try email local part
        const emailLocal = salespersonKey.includes('@') ? salespersonKey.split('@')[0] : salespersonKey;
        userInfo = userMap.get(emailLocal);
      }
      
      if (!userInfo) {
        // Try matching by username directly (case-insensitive) - optimized with early break
        for (const [key, value] of userMap.entries()) {
          if (key === salespersonKey || value.username?.toLowerCase() === salespersonKey || value.email?.toLowerCase() === salespersonKey) {
            userInfo = value;
            break;
          }
        }
      }
      
      // Fallback to using salespersonId as display name
      if (!userInfo) {
        userInfo = { name: salespersonId, username: salespersonId, email: salespersonKey.includes('@') ? salespersonKey : '' };
      }
      
      // Prefer username over name, but fallback to name if username is not available
      const displayName = userInfo.username || userInfo.name || salespersonId;
      const mapKey = userInfo.username || userInfo.email || salespersonKey;
      
      const current = performerMap.get(mapKey) || { name: displayName, username: userInfo.username || displayName, amount: 0 };
      performerMap.set(mapKey, { 
        ...current, 
        name: displayName,
        username: userInfo.username || displayName,
        amount: current.amount + amount 
      });
    });
    
    const performers = Array.from(performerMap.values())
      .filter(p => p.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return performers;
    } catch (error) {
      console.error('[SalesDataService] Error calculating top performers:', error);
      return [];
    }
  }

  calculateMetrics(leadStatuses) {
    const conversionRate = leadStatuses.total > 0 
      ? parseFloat(((leadStatuses.converted + leadStatuses.winClosed) / leadStatuses.total * 100).toFixed(1))
      : 0;
    
    const pendingRate = leadStatuses.total > 0
      ? parseFloat((leadStatuses.pending / leadStatuses.total * 100).toFixed(1))
      : 0;

    return { conversionRate, pendingRate };
  }

  calculateDaysLeft(targetEndDate) {
    const endDate = new Date(targetEndDate);
    const today = new Date();
    return Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
  }
}

export default new SalesDataService();

