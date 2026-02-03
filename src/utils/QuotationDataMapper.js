/**
 * Utility class for mapping quotation data to template context.
 * Follows OOP principles to encapsulate data transformation logic.
 */
export class QuotationDataMapper {
  /**
   * Prepares the full context for the quotation template.
   * @param {Object} quotationData - The raw quotation form data.
   * @param {Object} companyBranches - Map of company branches.
   * @param {Object} user - The current user.
   * @param {String} selectedTemplateKey - Key of the selected template.
   * @returns {Object} The formatted context for the template renderer.
   */
  static prepareContext(quotationData, companyBranches, user, selectedTemplateKey) {
    const rawBranch = this.getBranchData(quotationData.selectedBranch, companyBranches);
    const branch = this.normalizeBranch(rawBranch);
    const bankDetails = this.normalizeBankDetails(quotationData.bankDetails, branch.name);
    const items = this.normalizeItems(quotationData.items);
    const terms = this.normalizeTerms(quotationData.termsSections);

    // RFP ID (Pricing & RFP Decision) - pull from form data OR sessionStorage fallback.
    // This is used in HTML templates (e.g. {{rfpId}}) and also supports legacy placeholders
    // like {{rfp_requests.id}} by exposing a small compatibility object.
    let sessionRfpId = '';
    let sessionDecisionRfpId = '';
    try {
      if (typeof window !== 'undefined' && window?.sessionStorage) {
        sessionRfpId = window.sessionStorage.getItem('pricingRfpDecisionId') || '';
        const rawDecision = window.sessionStorage.getItem('pricingRfpDecisionData');
        if (rawDecision) {
          const parsed = JSON.parse(rawDecision);
          sessionDecisionRfpId = parsed?.rfp_id || '';
        }
      }
    } catch (e) {
      // ignore sessionStorage/JSON errors
    }

    const resolvedRfpId =
      quotationData?.rfpId ||
      quotationData?.rfp_id ||
      quotationData?.masterRfpId ||
      quotationData?.master_rfp_id ||
      sessionRfpId ||
      sessionDecisionRfpId ||
      '';

    const resolvedMasterRfpId =
      quotationData?.masterRfpId ||
      quotationData?.master_rfp_id ||
      resolvedRfpId ||
      sessionRfpId ||
      sessionDecisionRfpId ||
      '';

    // Extract customer ID properly
    const customerId = quotationData.customerId || 
                      quotationData.customer?.id || 
                      quotationData.customer?.lead_id || 
                      quotationData.customer?.leadId || 
                      'N/A';
    
    // Format dates properly
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (e) {
        return dateStr;
      }
    };
    
    return {
      ...quotationData,
      // RFP fields for templates
      rfpId: resolvedRfpId,
      masterRfpId: resolvedMasterRfpId,
      // Legacy compatibility for templates that use {{rfp_requests.*}}
      rfp_requests: {
        id: resolvedRfpId || resolvedMasterRfpId,
        rfp_id: resolvedRfpId || resolvedMasterRfpId,
      },
      // Formatted dates
      quotationDate: formatDate(quotationData.quotationDate),
      validUpto: formatDate(quotationData.validUpto || quotationData.validUntil),
      
      // Customer ID
      customerId: customerId,
      
      // Delivery & Payment fields (ensure they're strings)
      paymentMode: quotationData.paymentMode || '',
      transportTc: quotationData.transportTc || '',
      dispatchThrough: quotationData.dispatchThrough || '',
      deliveryTerms: quotationData.deliveryTerms || '',
      materialType: quotationData.materialType || '',
      
      // Objects
      branch,
      billTo: quotationData.billTo,
      user,
      templateKey: selectedTemplateKey,
      templateType: 'quotation',
      bankDetails,
      items,
      terms
    };
  }

  static getBranchData(selectedBranchId, companyBranches) {
    return (selectedBranchId && companyBranches[selectedBranchId]) ||
      Object.values(companyBranches)[0] ||
      {};
  }

  static normalizeBranch(rawBranch) {
    const extractStateFromAddress = (address) => {
      if (!address) return '';
      const stateMatch = address.match(/(?:MADHYA PRADESH|MP|Maharashtra|Gujarat|Rajasthan|Uttar Pradesh|Delhi)/i);
      return stateMatch ? stateMatch[0] : '';
    };

    // Default logo URL if not provided
    const defaultLogoUrl = 'https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png';
    
    return {
      ...rawBranch,
      name: rawBranch.name || rawBranch.companyName || '',
      address: rawBranch.address || rawBranch.companyAddress || '',
      state: rawBranch.state || rawBranch.companyState || extractStateFromAddress(rawBranch.address || ''),
      gstNumber: rawBranch.gstNumber || rawBranch.gstin || rawBranch.companyGstin || '',
      tel: rawBranch.tel || rawBranch.phone || rawBranch.companyContact || '',
      email: rawBranch.email || rawBranch.companyEmail || '',
      web: rawBranch.web || rawBranch.website || rawBranch.companyWebsite || '',
      logoUrl: rawBranch.logoUrl || rawBranch.logo || defaultLogoUrl,
      logo: rawBranch.logo || rawBranch.logoUrl || defaultLogoUrl
    };
  }

  static normalizeBankDetails(bankDetails, branchName) {
    if (!bankDetails) return null;

    const details = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;
    const branchVal = details.branch || details.branchName || '';
    let accountHolder =
      details.accountHolderName ||
      details.account_holder_name ||
      branchName ||
      '';
    const strVal = String(accountHolder).trim();
    if (!strVal || /^\d+$/.test(strVal) || strVal.length < 2) {
      accountHolder = branchName || 'ANODE ELECTRIC PVT. LTD.';
    }

    return {
      ...details,
      branch: String(branchVal),
      branchName: String(branchVal),
      bankName: String(details.bankName || ''),
      accountNumber: String(details.accountNumber || ''),
      ifscCode: String(details.ifscCode || ''),
      accountHolderName: String(accountHolder),
      account_holder_name: String(accountHolder)
    };
  }

  static normalizeItems(items) {
    if (!Array.isArray(items)) return [];

    return items.map(item => {
      // Explicitly handle HSN, Quantity, and Rate - ensure correct column mapping for Live Preview
      const hsnValue = item.hsnCode || item.hsn || '';
      const qtyValue = item.quantity ?? item.qty ?? item.length ?? '';
      const rateValue = item.rate || item.buyerRate || item.unitPrice || '';
      
      return {
        ...item,
        // HSN/SAC column - must show HSN code, NOT quantity
        hsnCode: String(hsnValue),
        hsn: String(hsnValue),
        // QUANTITY column - quantity, qty, length (legacy) for template compatibility
        quantity: String(qtyValue),
        qty: String(qtyValue),
        length: String(qtyValue), // Legacy: some templates use {{this.length}} for quantity
        rate: String(rateValue),
        buyerRate: String(rateValue),
        productName: item.productName || item.name || '',
        unit: item.unit || item.per || '',
        amount: item.amount || 0,
        remark: item.remark || ''
      };
    });
  }

  static normalizeTerms(termsSections) {
    if (!Array.isArray(termsSections)) return [];
    
    return termsSections.map(section => ({
      title: section.title || '',
      points: Array.isArray(section.points) ? section.points : []
    }));
  }
}
