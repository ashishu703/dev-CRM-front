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
    // Resolve bank details from selected company/branch.
    
    const orgNameUpper = String(branch.name || '').toUpperCase();
    const shouldUseSamriddhiCable =
      orgNameUpper.includes('CABLE') &&
      (orgNameUpper.includes('RIDDHI') || orgNameUpper.includes('RIDHI') || orgNameUpper.includes('SAMR') || orgNameUpper.includes('SAMM'));

    const resolvedBankDetailsRaw = shouldUseSamriddhiCable
      ? {
          accountHolderName: 'SAMRIDDHI CABLE INDUSTRIES PRIVATE LIMITED',
          bankName: 'ICICI Bank',
          branchName: 'Niwarganj Branch',
          accountNumber: '777705336601',
          ifscCode: 'ICIC0007345'
        }
      : {
          accountHolderName: 'ANODE ELECTRIC PVT. LTD.',
          bankName: 'ICICI Bank',
          branchName: 'WRIGHT TOWN JABALPUR',
          accountNumber: '657605601783',
          ifscCode: 'ICIC0006576'
        };

    const bankDetails = this.normalizeBankDetails(resolvedBankDetailsRaw, branch.name);
    const items = this.normalizeItems(quotationData.items);
    const terms = this.normalizeTerms(quotationData.termsSections);
    const bank = bankDetails || {};

    const normalizedQuotationData = {
      ...quotationData,
      items,
      products: items,
      productDetails: items,
      quotationItems: items,
      quotation_items: items,
      bankDetails,
      terms,
      termsSections: quotationData.termsSections
    };

    const bankdetails = {
      bankname: bank.bankName || '',
      bankName: bank.bankName || '',
      accountnumber: bank.accountNumber || '',
      accountNumber: bank.accountNumber || '',
      ifsccode: bank.ifscCode || '',
      ifscCode: bank.ifscCode || '',
      branch: bank.branchName || bank.branch || '',
      branchName: bank.branchName || bank.branch || '',
      accountholdername: bank.accountHolderName || '',
      accountHolderName: bank.accountHolderName || '',
      account_holder_name: bank.accountHolderName || '',
      account_holder_name: bank.accountHolderName || ''
    };

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
      quotationData: normalizedQuotationData,
      quotation: normalizedQuotationData,
      products: items,
      productDetails: items,
      quotationItems: items,
      quotation_items: items,
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
      bankdetails,
      // Compatibility aliases: some templates reference bank fields directly
      // instead of `bankDetails.<field>`.
      ifscCode: bank.ifscCode || '',
      bankName: bank.bankName || '',
      accountNumber: bank.accountNumber || '',
      accountHolderName: bank.accountHolderName || '',
      branchName: bank.branchName || '',
      // Also expose some lowercase variants.
      ifsccode: bank.ifscCode || '',
      bankname: bank.bankName || '',
      accountnumber: bank.accountNumber || '',
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
      let hsnValue = item.hsnCode || item.hsn || '';
      if (hsnValue === '' && (item.productName || item.name)) {
        hsnValue = '8544';
      }
      let qtyValue = item.quantity ?? item.qty ?? item.length ?? '';
      if (qtyValue === '' && item.amount != null && (item.buyerRate || item.rate || item.unitPrice)) {
        const rate = Number(item.buyerRate || item.rate || item.unitPrice) || 0;
        if (rate > 0) qtyValue = Number(item.amount) / rate;
      }
      const rateValue = item.rate || item.buyerRate || item.unitPrice || '';
      const qtyStr = qtyValue !== '' && qtyValue != null ? String(qtyValue) : '';
      const hsnStr = hsnValue !== '' && hsnValue != null ? String(hsnValue) : '';
      const remarkValue =
        item.remark ??
        item.product_remark ??
        item.productRemark ??
        item.requirement_detail ??
        item.requirementDetail ??
        '';
      return {
        ...item,
        hsnCode: hsnStr,
        hsn: hsnStr,
        quantity: qtyStr,
        qty: qtyStr,
        length: qtyStr,
        product_quantity: qtyStr,
        rate: rateValue !== '' && rateValue != null ? String(rateValue) : '',
        buyerRate: rateValue !== '' && rateValue != null ? String(rateValue) : '',
        productName: item.productName || item.name || '',
        unit: item.unit || item.per || '',
        amount: item.amount || 0,
        remark: String(remarkValue || ''),
        product_remark: String(remarkValue || ''),
        requirement_detail: String(remarkValue || ''),
        productRemark: String(remarkValue || '')
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
