import React from 'react';
import CustomerTimeline from './CustomerTimeline';

/**
 * Salesperson-specific customer timeline
 * Thin wrapper over the generic `CustomerTimeline` so we have a single
 * import point to reuse across all salesperson pages.
 *
 * Props:
 * - lead: lead object (for salesperson, usually `item.leadData` or a lead row)
 * - item: alternative prop - if provided, extracts leadData from it
 * - onClose: callback to close the sidebar
 * - onQuotationView: callback to view quotation (optional)
 * - onPIView: callback to view PI (optional)
 */
const SalespersonCustomerTimeline = ({ lead, item, onClose, onQuotationView, onPIView }) => {
  // Support both direct lead prop and item.leadData structure
  const leadData = lead || item?.leadData || item;
  
  if (!leadData) return null;
  return (
    <CustomerTimeline 
      lead={leadData} 
      onClose={onClose}
      onQuotationView={onQuotationView}
      onPIView={onPIView}
    />
  );
};

export default SalespersonCustomerTimeline;


