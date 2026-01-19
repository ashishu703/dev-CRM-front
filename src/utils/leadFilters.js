import { IDMatcher } from '../services/LeadsFilterService';
import { processInChunks } from './debounce';

export const calculateAssignedCounts = (leads, isLeadAssigned) => {
  let assignedCount = 0;
  let unassignedCount = 0;
  
  for (let i = 0; i < leads.length; i++) {
    if (isLeadAssigned(leads[i])) {
      assignedCount++;
    } else {
      unassignedCount++;
    }
  }
  
  return { assignedCount, unassignedCount };
};

export const getUnassignedLeadIds = (leads, isLeadAssigned) => {
  const ids = [];
  for (let i = 0; i < leads.length; i++) {
    if (!isLeadAssigned(leads[i])) {
      ids.push(leads[i].id);
    }
  }
  return ids;
};

const includes = (val, q) => String(val || '').toLowerCase().includes(String(q || '').toLowerCase());

// OPTIMIZED: Filter leads with optimized loop (chunk processing for large arrays)
export const filterLeads = (activeLeadPool, searchTerm, assignmentFilter, statusFilter, filteredCustomerIds, isLeadAssigned, assignedSalespersonFilter, assignedTelecallerFilter, columnFilters = {}) => {
  const searchLower = searchTerm?.toLowerCase() || '';
  const hasStatusFilter = Boolean(statusFilter.type && statusFilter.status);
  const hasCustomerIdFilter = hasStatusFilter && filteredCustomerIds.size > 0;
  
  // For very large arrays, use chunk processing helper
  if (activeLeadPool.length > 1000) {
    return filterChunk(activeLeadPool, searchLower, assignmentFilter, statusFilter, filteredCustomerIds, isLeadAssigned, assignedSalespersonFilter, assignedTelecallerFilter, columnFilters, hasCustomerIdFilter);
  }
  
  // For smaller arrays, process directly
  return filterChunk(activeLeadPool, searchLower, assignmentFilter, statusFilter, filteredCustomerIds, isLeadAssigned, assignedSalespersonFilter, assignedTelecallerFilter, columnFilters, hasCustomerIdFilter);
};

const filterChunk = (chunk, searchLower, assignmentFilter, statusFilter, filteredCustomerIds, isLeadAssigned, assignedSalespersonFilter, assignedTelecallerFilter, columnFilters, hasCustomerIdFilter) => {
  const filtered = [];
  
  for (let i = 0; i < chunk.length; i++) {
    const lead = chunk[i];
    
    let matchesSearch = true;
    if (searchLower) {
      const customer = lead.customer?.toLowerCase() || '';
      const email = lead.email?.toLowerCase() || '';
      const business = lead.business?.toLowerCase() || '';
      matchesSearch = customer.includes(searchLower) || email.includes(searchLower) || business.includes(searchLower);
    }
    
    if (!matchesSearch) continue;
    
    if (assignmentFilter) {
      const isAssigned = isLeadAssigned(lead);
      if ((assignmentFilter === 'assigned' && !isAssigned) || (assignmentFilter === 'unassigned' && isAssigned)) {
        continue;
      }
    }
    
    if (assignedSalespersonFilter) {
      const leadSalesperson = (lead.assignedSalesperson || '').trim();
      if (assignedSalespersonFilter === 'Unassigned') {
        if (leadSalesperson && leadSalesperson.toLowerCase() !== 'n/a' && leadSalesperson.toLowerCase() !== 'na' && leadSalesperson !== '-') {
          continue;
        }
      } else if (leadSalesperson !== assignedSalespersonFilter) {
        continue;
      }
    }
    
    if (assignedTelecallerFilter) {
      const leadTelecaller = (lead.assignedTelecaller || '').trim();
      if (assignedTelecallerFilter === 'Unassigned') {
        if (leadTelecaller && leadTelecaller.toLowerCase() !== 'n/a' && leadTelecaller.toLowerCase() !== 'na' && leadTelecaller !== '-') {
          continue;
        }
      } else if (leadTelecaller !== assignedTelecallerFilter) {
        continue;
      }
    }
    
    if (hasCustomerIdFilter) {
      const matches = IDMatcher.matchesLead(lead, filteredCustomerIds);
      if (filtered.length < 3 && filteredCustomerIds.size > 0 && filteredCustomerIds.size < 10) {
        const leadIds = [lead.id, lead.customerId, lead.customer_id].filter(id => id != null);
        console.log(`[Filter Match] Lead ID: ${lead.id}, Lead IDs: [${leadIds.join(', ')}], Customer ID Set: [${Array.from(filteredCustomerIds).join(', ')}], Match: ${matches}`);
      }
      if (!matches) {
        continue;
      }
    }
    
    const cf = columnFilters || {};
    if (
      (cf.customerId && !includes(lead.customerId, cf.customerId)) ||
      (cf.customer && !includes(lead.customer, cf.customer)) ||
      (cf.business && !includes(lead.business, cf.business)) ||
      (cf.address && !includes(lead.address, cf.address)) ||
      (cf.state && !includes(lead.state, cf.state)) ||
      (cf.phone && !includes(lead.phone, cf.phone)) ||
      (cf.email && !includes(lead.email, cf.email)) ||
      (cf.gstNo && !includes(lead.gstNo, cf.gstNo)) ||
      (cf.leadSource && !includes(lead.leadSource, cf.leadSource)) ||
      (cf.productNames && !includes(lead.productNames || lead.productNamesText, cf.productNames)) ||
      (cf.category && !includes(lead.category, cf.category)) ||
      (cf.followUpStatus && !includes(lead.followUpStatus || lead.connectedStatus || lead.telecallerStatus, cf.followUpStatus)) ||
      (cf.salesStatus && !includes(lead.salesStatus, cf.salesStatus)) ||
      (cf.telecallerStatus && !includes(lead.telecallerStatus, cf.telecallerStatus)) ||
      (cf.paymentStatus && !includes(lead.paymentStatus, cf.paymentStatus)) ||
      (cf.createdAt && !includes(lead.createdAt, cf.createdAt)) ||
      (cf.updatedAt && !includes(lead.updated_at || lead.createdAt, cf.updatedAt))
    ) {
      continue;
    }
    
    filtered.push(lead);
  }
  
  return filtered;
};

