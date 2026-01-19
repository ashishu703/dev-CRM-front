import departmentHeadService from '../api/admin_api/departmentHeadService';
import apiErrorHandler from '../utils/ApiErrorHandler';
import toastManager from '../utils/ToastManager';

class LeadService {
  constructor() {
    this.formatToIST = this.formatToIST.bind(this);
    this.transformApiData = this.transformApiData.bind(this);
  }

  formatToIST(value) {
    if (!value) return 'N/A';
    try {
      const d = new Date(value);
      const date = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      const time = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
      return `${date} ${time}`;
    } catch (e) {
      return String(value);
    }
  }

  transformApiData(apiData) {
    return apiData.map(lead => ({
      id: lead.id,
      customerId: lead.customer_id,
      customer: lead.customer,
      email: lead.email,
      business: lead.business,
      leadSource: lead.lead_source,
      productNamesText: lead.product_names,
      category: lead.category,
      salesStatus: lead.sales_status,
      salesStatusRemark: lead.sales_status_remark || null,
      createdAt: this.formatToIST(lead.created_at),
      assignedSalesperson: (() => {
        const val = lead.assigned_salesperson;
        if (!val) return null;
        const s = String(val).trim().toLowerCase();
        if (s === '' || s === 'unassigned' || s === 'assigned' || s === 'n/a' || s === 'na' || s === '-') return null;
        return lead.assigned_salesperson;
      })(),
      assignedTelecaller: (() => {
        const val = lead.assigned_telecaller;
        if (!val) return null;
        const s = String(val).trim().toLowerCase();
        if (s === '' || s === 'unassigned' || s === 'assigned' || s === 'n/a' || s === 'na' || s === '-') return null;
        return lead.assigned_telecaller;
      })(),
      telecallerStatus: lead.telecaller_status,
      paymentStatus: lead.payment_status,
      phone: lead.phone,
      address: lead.address,
      gstNo: lead.gst_no,
      state: lead.state,
      division: lead.division,
      customerType: lead.customer_type,
      date: lead.date,
      followUpStatus: lead.follow_up_status || lead.connected_status || lead.telecaller_status,
      connectedStatus: lead.follow_up_status || lead.connected_status || lead.telecaller_status,
      followUpRemark: lead.follow_up_remark || null,
      // Follow-up date fields (preserve both camelCase and snake_case for compatibility)
      follow_up_date: lead.follow_up_date || null,
      followUpDate: lead.follow_up_date || null,
      follow_up_time: lead.follow_up_time || null,
      followUpTime: lead.follow_up_time || null,
      next_meeting_date: lead.next_meeting_date || null,
      nextMeetingDate: lead.next_meeting_date || null,
      next_meeting_time: lead.next_meeting_time || null,
      nextMeetingTime: lead.next_meeting_time || null,
      meeting_date: lead.meeting_date || null,
      meetingDate: lead.meeting_date || null,
      meeting_time: lead.meeting_time || null,
      meetingTime: lead.meeting_time || null,
      scheduled_date: lead.scheduled_date || null,
      scheduledDate: lead.scheduled_date || null,
      scheduled_time: lead.scheduled_time || null,
      scheduledTime: lead.scheduled_time || null,
      sales_status: lead.sales_status || null,
      sales_status_remark: lead.sales_status_remark || null,
      finalStatus: lead.final_status,
      whatsapp: lead.whatsapp,
      createdBy: lead.created_by,
      created_at: this.formatToIST(lead.created_at),
      updated_at: this.formatToIST(lead.updated_at)
    }));
  }

  async fetchLeads(params = {}) {
    try {
      const response = await departmentHeadService.getAllLeads(params);
      if (response && response.data) {
        return {
          data: this.transformApiData(response.data),
          pagination: response.pagination
        };
      }
      return { data: [], pagination: null };
    } catch (error) {
      apiErrorHandler.handleError(error, 'fetch leads');
      throw error;
    }
  }

  async fetchAllLeads(batchSize = 200) {
    try {
      const aggregated = [];
      let pageNumber = 1;
      while (true) {
        const response = await departmentHeadService.getAllLeads({
          page: pageNumber,
          limit: batchSize
        });

        const pageData = Array.isArray(response?.data) ? response.data : [];
        if (pageData.length === 0) {
          break;
        }

        aggregated.push(...pageData);

        const total = typeof response?.pagination?.total === 'number'
          ? response.pagination.total
          : null;

        if (total !== null && aggregated.length >= total) {
          break;
        }

        if (pageData.length < batchSize) {
          break;
        }

        pageNumber += 1;
      }

      return this.transformApiData(aggregated);
    } catch (error) {
      throw error;
    }
  }

  async createLead(leadData) {
    try {
      const resp = await departmentHeadService.createLead(leadData);
      if (resp && resp.data) {
        return this.transformApiData([resp.data])[0];
      }
      return null;
    } catch (error) {
      apiErrorHandler.handleError(error, 'create lead');
      throw error;
    }
  }

  async updateLead(leadId, payload) {
    try {
      await departmentHeadService.updateLead(leadId, payload);
      return true;
    } catch (error) {
      apiErrorHandler.handleError(error, 'update lead');
      throw error;
    }
  }

  async batchUpdateLeads(leadIds, payload) {
    try {
      await departmentHeadService.batchUpdateLeads(leadIds, payload);
      return true;
    } catch (error) {
      apiErrorHandler.handleError(error, 'batch update leads');
      throw error;
    }
  }

  async deleteLead(leadId) {
    try {
      const resp = await departmentHeadService.deleteLead(leadId);
      return resp;
    } catch (error) {
      apiErrorHandler.handleError(error, 'delete lead');
      throw error;
    }
  }

  async batchDeleteLeads(leadIds) {
    try {
      // Delete leads one by one to ensure proper cleanup
      const deletePromises = leadIds.map(id => this.deleteLead(id));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      apiErrorHandler.handleError(error, 'batch delete leads');
      throw error;
    }
  }

  async importLeads(leadsPayload) {
    try {
      const resp = await departmentHeadService.importLeads(leadsPayload);
      // Return full response including skipped rows info
      return resp;
    } catch (error) {
      apiErrorHandler.handleError(error, 'import leads');
      throw error;
    }
  }

  buildLeadPayload(customerData) {
    // Clean phone number - extract only digits and take last 10 digits
    const cleanPhone = (phone) => {
      if (!phone) return null;
      const digits = String(phone).replace(/\D/g, '');
      if (digits.length === 0) return null;
      // Take last 10 digits (in case country code is included)
      return digits.slice(-10);
    };

    // Clean whatsapp number
    const cleanWhatsapp = (whatsapp) => {
      if (!whatsapp) return null;
      const digits = String(whatsapp).replace(/\D/g, '');
      if (digits.length === 0) return null;
      // Take last 10 digits
      return digits.slice(-10);
    };

    const phone = cleanPhone(customerData.mobileNumber);
    const whatsapp = cleanWhatsapp(customerData.whatsappNumber || customerData.mobileNumber);

    return {
      customer: customerData.customerName || null,
      name: customerData.customerName || null, // Also include name for validator
      phone: phone || null,
      email: customerData.email || null,
      business: customerData.businessType || null,
      leadSource: customerData.leadSource || null,
      category: customerData.businessCategory || 'N/A',
      salesStatus: 'PENDING',
      gstNo: customerData.gstNumber || null,
      productNames: Array.isArray(customerData.productNames) 
        ? customerData.productNames.join(', ') 
        : (customerData.productNames || 'N/A'),
      address: customerData.address || null,
      state: customerData.state || null,
      division: customerData.division || null,
      assignedSalesperson: (() => {
        const val = customerData.assignedSalesperson;
        if (!val || val === '' || String(val).trim() === '' || String(val).trim().toLowerCase() === 'unassigned' || String(val).trim().toLowerCase() === 'assigned') return null;
        return String(val).trim();
      })(),
      assignedTelecaller: (() => {
        const val = customerData.assignedTelecaller;
        if (!val || val === '' || String(val).trim() === '' || String(val).trim().toLowerCase() === 'unassigned' || String(val).trim().toLowerCase() === 'assigned') return null;
        return String(val).trim();
      })(),
      whatsapp: whatsapp || null,
      date: customerData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      telecallerStatus: 'INACTIVE',
      paymentStatus: 'PENDING',
      connectedStatus: 'pending',
      finalStatus: 'open',
      customerType: customerData.businessCategory || 'business'
    };
  }

  buildCSVLeadPayload(row, index, validationErrors) {
    // Helper function to normalize empty/NA values
    const normalizeValue = (val) => {
      const trimmed = (val || '').trim().toUpperCase();
      return (trimmed === '' || trimmed === 'NA' || trimmed === 'N/A' || trimmed === '-' || trimmed === 'NULL') ? 'N/A' : (val || '').trim();
    };
    
    let customer = normalizeValue(row['Customer Name']);
    let phone = (row['Mobile Number'] || '').trim();
    let whatsapp = (row['WhatsApp Number'] || '').trim();
    const email = normalizeValue(row['Email']);
    const address = normalizeValue(row['Address']);
    const business = normalizeValue(row['Business Name']);
    const gstNo = normalizeValue(row['GST Number']);
    
    // Validate customer name (required, cannot be N/A)
    if (!customer || customer === 'N/A' || customer.length < 2) {
      validationErrors.push(`Row ${index + 2}: Customer Name is required and must be at least 2 characters`);
      customer = customer === 'N/A' ? '' : customer;
    }
    
    // Process phone number
    if (phone) {
      phone = phone.replace(/\D/g, '');
      if (phone.length > 50) {
        validationErrors.push(`Row ${index + 2}: Mobile Number exceeds 50 characters. Truncating.`);
        phone = phone.substring(0, 50);
      }
    }
    
    // Validate phone (required, cannot be empty/NA)
    if (!phone || phone.length === 0 || phone === 'NA' || phone === 'N/A') {
      validationErrors.push(`Row ${index + 2}: Mobile Number is required`);
    } else if (phone.length < 10) {
      validationErrors.push(`Row ${index + 2}: Mobile Number seems too short (${phone.length} digits). Minimum 10 digits required.`);
    }
    
    // Process WhatsApp number
    if (whatsapp && whatsapp.trim() && whatsapp.toUpperCase() !== 'NA' && whatsapp.toUpperCase() !== 'N/A') {
      whatsapp = whatsapp.replace(/\D/g, '');
      if (whatsapp.length > 50) {
        validationErrors.push(`Row ${index + 2}: WhatsApp Number exceeds 50 characters. Truncating.`);
        whatsapp = whatsapp.substring(0, 50);
      }
      if (whatsapp.length > 0 && whatsapp.length < 10) {
        validationErrors.push(`Row ${index + 2}: WhatsApp Number seems too short (${whatsapp.length} digits). Minimum 10 digits recommended.`);
      }
    } else {
      // Use phone as fallback if WhatsApp is NA or empty
      whatsapp = phone;
    }
    
    // Normalize other fields
    const leadSource = normalizeValue(row['Lead Source']);
    const category = normalizeValue(row['Business Category']);
    const productNames = normalizeValue(row['Product Names (comma separated)']);
    const state = normalizeValue(row['State']);
    const division = normalizeValue(row['Division']);
    
    // Handle date - support both DD/MM/YYYY and YYYY-MM-DD formats
    let dateValue = (row['Date (DD/MM/YYYY or YYYY-MM-DD)'] || row['Date (YYYY-MM-DD)'] || row['Date'] || '').trim();
    if (!dateValue || dateValue.toUpperCase() === 'NA' || dateValue.toUpperCase() === 'N/A') {
      dateValue = new Date().toISOString().split('T')[0];
    } else {
      // Try DD/MM/YYYY format first
      const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const ddmmyyyyMatch = dateValue.match(ddmmyyyyRegex);
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        dateValue = `${year}-${month}-${day}`;
      } else if (!dateValue.includes('-') || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        // If not in expected format, try to parse as date
        try {
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            dateValue = parsedDate.toISOString().split('T')[0];
          } else {
            dateValue = new Date().toISOString().split('T')[0];
          }
        } catch (e) {
          dateValue = new Date().toISOString().split('T')[0];
        }
      }
    }
    
    return {
      customer: customer || null,
      phone: phone || null,
      email: email === 'N/A' ? null : (email || null),
      address: address === 'N/A' ? null : (address || null),
      business: business === 'N/A' ? null : (business || null),
      leadSource: leadSource === 'N/A' ? null : (leadSource || null),
      category: category === 'N/A' ? 'N/A' : category,
      salesStatus: 'PENDING',
      gstNo: gstNo === 'N/A' ? null : (gstNo || null),
      productNames: productNames === 'N/A' ? 'N/A' : productNames,
      state: state === 'N/A' ? null : (state || null),
      division: division === 'N/A' ? null : (division || null),
      assignedSalesperson: (() => {
        const val = (row['Assigned Salesperson'] || '').trim();
        if (!val || val === '' || val.toLowerCase() === 'unassigned' || val.toLowerCase() === 'assigned' || val.toUpperCase() === 'NA' || val.toUpperCase() === 'N/A') return null;
        return val;
      })(),
      assignedTelecaller: (() => {
        const val = (row['Assigned Telecaller'] || '').trim();
        if (!val || val === '' || val.toLowerCase() === 'unassigned' || val.toLowerCase() === 'assigned' || val.toUpperCase() === 'NA' || val.toUpperCase() === 'N/A') return null;
        return val;
      })(),
      whatsapp: whatsapp || phone || null,
      date: dateValue,
      createdAt: new Date().toISOString().split('T')[0],
      telecallerStatus: 'INACTIVE',
      paymentStatus: 'PENDING',
      connectedStatus: 'pending',
      finalStatus: 'open',
      customerType: category === 'N/A' ? 'business' : category.toLowerCase()
    };
  }
}

export default LeadService;

