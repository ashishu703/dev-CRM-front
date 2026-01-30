import apiClient from '../utils/apiClient';
import quotationService from '../api/admin_api/quotationService';

/**
 * Utility for robust ID comparison between quotations/PIs and leads.
 * Works with numeric IDs, strings, and UUIDs in a DRY/OOP style.
 */
class IDMatcher {
  static normalizeId(id) {
    if (id === null || id === undefined) return null;
    const numId = Number(id);
    const strId = String(id);
    return {
      numeric: !Number.isNaN(numId) ? numId : null,
      string: strId,
      uuid: typeof id === 'string' && id.includes('-') ? id : null
    };
  }

  static getCustomerIdRaw(entity) {
    return entity.customer_id ?? entity.customerId ?? entity.customerID ?? null;
  }

  /**
   * Build a flexible Set of customer identifiers from a list of entities.
   * The set can be matched against both numeric and string lead IDs.
   */
  static buildCustomerIdSet(entities) {
    const customerIds = new Set();
    if (!Array.isArray(entities) || entities.length === 0) {
      return customerIds;
    }
    
    entities.forEach((e) => {
      const customerId = IDMatcher.getCustomerIdRaw(e);
      if (customerId !== null && customerId !== undefined) {
        const normalized = IDMatcher.normalizeId(customerId);
        if (normalized.numeric !== null) {
          customerIds.add(normalized.numeric);
        }
        customerIds.add(normalized.string);
        if (normalized.uuid) {
          customerIds.add(normalized.uuid);
        }
      }
    });
    
    return customerIds;
  }

  /**
   * Test whether a lead matches any customer ID from a pre-built set.
   */
  static matchesLead(lead, customerIdSet) {
    if (!lead || !customerIdSet || customerIdSet.size === 0) {
      return false;
    }
    
    const leadIdFields = [lead.id, lead.customerId, lead.customer_id].filter(
      (id) => id !== null && id !== undefined
    );
    
    for (const leadId of leadIdFields) {
      const normalized = IDMatcher.normalizeId(leadId);
      
      // Try numeric match first
      if (normalized.numeric !== null && customerIdSet.has(normalized.numeric)) {
        return true;
      }
      
      // Try string match
      if (customerIdSet.has(normalized.string)) {
        return true;
      }
      
      // Try UUID match
      if (normalized.uuid && customerIdSet.has(normalized.uuid)) {
        return true;
      }
      
      // Also try the raw value as string (in case of type mismatches)
      if (customerIdSet.has(String(leadId))) {
        return true;
      }
    }
    
    return false;
  }
}

// Small helper to keep customer-based de-duplication DRY
const getCustomerKeyFromEntity = (entity) => {
  const raw = IDMatcher.getCustomerIdRaw(entity);
  return raw === null || raw === undefined ? null : String(raw);
};

const collectUniqueByCustomer = (items, existingKeys = new Set()) => {
  const list = [];
  const keys = existingKeys;

  if (!Array.isArray(items)) return { list, keys };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const key = getCustomerKeyFromEntity(item);
    if (!key || keys.has(key)) continue;
    keys.add(key);
    list.push(item);
  }

  return { list, keys };
};

class LeadsFilterService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  static extractArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  }

  async fetchQuotationsByStatus(status) {
    const response = await this.apiClient.get(`/api/quotations/status/${status}`);
    return LeadsFilterService.extractArray(response);
  }

  async fetchPendingVerificationQuotations() {
    const response = await this.apiClient.get('/api/quotations/pending-verification');
    return LeadsFilterService.extractArray(response);
  }

  async fetchAllPIs() {
    const response = await this.apiClient.get('/api/proforma-invoices/all');
    return LeadsFilterService.extractArray(response);
  }

  async fetchQuotationById(quotationId) {
    const response = await quotationService.getQuotation(quotationId);
    return response?.data || null;
  }

  buildQuotationCounts(quotations) {
    const pendingResult1 = collectUniqueByCustomer(quotations.pendingVerification || []);
    const pendingResult2 = collectUniqueByCustomer(quotations.pending || [], pendingResult1.keys);
    const pendingResult3 = collectUniqueByCustomer(
      quotations.sentForApproval || [],
      pendingResult2.keys
    );
    const pendingQuotations = [
      ...pendingResult1.list,
      ...pendingResult2.list,
      ...pendingResult3.list
    ];

    const approvedResult = collectUniqueByCustomer(quotations.approved || []);
    const rejectedResult = collectUniqueByCustomer(quotations.rejected || []);

    return {
      counts: {
        pending: pendingQuotations.length,
        approved: approvedResult.list.length,
        rejected: rejectedResult.list.length
      },
      lists: {
        pending: pendingQuotations,
        approved: approvedResult.list,
        rejected: rejectedResult.list
      }
    };
  }

  buildPICounts(allPIs) {
    const pendingPIs = [];
    const approvedPIs = [];
    const rejectedPIs = [];

    const pendingKeys = new Set();
    const approvedKeys = new Set();
    const rejectedKeys = new Set();

    if (Array.isArray(allPIs)) {
      for (let i = 0; i < allPIs.length; i++) {
        const pi = allPIs[i];
        const status = (pi.status || '').toLowerCase();
        const key = getCustomerKeyFromEntity(pi);
        if (!key) continue;

        if (
          status === 'pending' ||
          status === 'pending_approval' ||
          status === 'sent_for_approval'
        ) {
          if (!pendingKeys.has(key)) {
            pendingKeys.add(key);
            pendingPIs.push(pi);
          }
        } else if (status === 'approved') {
          if (!approvedKeys.has(key)) {
            approvedKeys.add(key);
            approvedPIs.push(pi);
          }
        } else if (status === 'rejected') {
          if (!rejectedKeys.has(key)) {
            rejectedKeys.add(key);
            rejectedPIs.push(pi);
          }
        }
      }
    }

    return {
      counts: {
        pending: pendingPIs.length,
        approved: approvedPIs.length,
        rejected: rejectedPIs.length
      },
      lists: {
        pending: pendingPIs,
        approved: approvedPIs,
        rejected: rejectedPIs
      }
    };
  }

  async fetchQuotationAndPICounts(options = {}) {
    const { includeQuotationPending = true } = options;

    const [pendingVerification, pending, approved, rejected, sentForApproval, allPIs] = await Promise.all([
      includeQuotationPending ? this.fetchPendingVerificationQuotations() : Promise.resolve([]),
      includeQuotationPending ? this.fetchQuotationsByStatus('pending') : Promise.resolve([]),
      this.fetchQuotationsByStatus('approved'),
      this.fetchQuotationsByStatus('rejected'),
      includeQuotationPending ? this.fetchQuotationsByStatus('sent_for_approval') : Promise.resolve([]),
      this.fetchAllPIs()
    ]);

    const quotationData = this.buildQuotationCounts({
      pendingVerification,
      pending,
      approved,
      rejected,
      sentForApproval
    });

    const piData = this.buildPICounts(allPIs);

    return {
      quotationCounts: quotationData.counts,
      piCounts: piData.counts,
      filteredQuotations: quotationData.lists,
      filteredPIs: piData.lists
    };
  }

  async extractCustomerIdsFromQuotations(quotations) {
    if (!Array.isArray(quotations) || quotations.length === 0) {
      console.warn('[LeadsFilterService] No quotations provided to extractCustomerIdsFromQuotations');
      return new Set();
    }
    
    const customerIds = IDMatcher.buildCustomerIdSet(quotations);
    console.log(`[LeadsFilterService] Extracted ${customerIds.size} customer IDs from ${quotations.length} quotations`);
    
    // Debug: Log first few quotations to see their structure
    if (quotations.length > 0) {
      console.log('[LeadsFilterService] Sample quotation structure:', {
        id: quotations[0].id,
        customer_id: quotations[0].customer_id,
        customerId: quotations[0].customerId,
        customerID: quotations[0].customerID,
        full: quotations[0]
      });
    }
    
    return customerIds;
  }

  async extractCustomerIdsFromPIs(pis) {
    if (!Array.isArray(pis) || pis.length === 0) {
      console.warn('[LeadsFilterService] No PIs provided to extractCustomerIdsFromPIs');
      return new Set();
    }
    
    // PIs already carry customer_id that points to department_head_leads.id,
    // so we can build the customer ID set directly without refetching quotations.
    const customerIds = IDMatcher.buildCustomerIdSet(pis || []);
    console.log(`[LeadsFilterService] Extracted ${customerIds.size} customer IDs from ${pis.length} PIs`);
    
    // Debug: Log first few PIs to see their structure
    if (pis.length > 0) {
      console.log('[LeadsFilterService] Sample PI structure:', {
        id: pis[0].id,
        customer_id: pis[0].customer_id,
        customerId: pis[0].customerId,
        customerID: pis[0].customerID,
        full: pis[0]
      });
    }
    
    return customerIds;
  }
}

export { LeadsFilterService, IDMatcher };
