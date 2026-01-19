import departmentUserService from '../api/admin_api/departmentUserService';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

class CSVImportValidationService {
  constructor(headUserId) {
    this.headUserId = headUserId;
    this.departmentUsers = null;
    this.userEmailMap = null;
    this.existingPhones = new Set();
    this.validationErrors = [];
    this.skippedLeads = [];
  }

  async initialize() {
    try {
      const usersResponse = await departmentUserService.getByHeadId(this.headUserId);
      
      let users = [];
      if (usersResponse?.data?.users && Array.isArray(usersResponse.data.users)) {
        users = usersResponse.data.users;
      } else if (Array.isArray(usersResponse?.data)) {
        users = usersResponse.data;
      } else if (Array.isArray(usersResponse)) {
        users = usersResponse;
      } else if (usersResponse?.success && usersResponse.data?.users && Array.isArray(usersResponse.data.users)) {
        users = usersResponse.data.users;
      } else if (usersResponse?.success && Array.isArray(usersResponse.data)) {
        users = usersResponse.data;
      }

      this.departmentUsers = users;
      this.userEmailMap = new Map();
      users.forEach(user => {
        if (user.email) {
          this.userEmailMap.set(user.email.toLowerCase(), {
            email: user.email,
            username: user.username || user.name,
            id: user.id
          });
        }
      });

      await this.loadExistingPhones();
    } catch (error) {
      console.error('Error initializing CSV validation service:', error);
      throw new Error('Failed to initialize validation service');
    }
  }

  async loadExistingPhones() {
    try {
      let page = 1;
      const limit = 200;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient.get(API_ENDPOINTS.LEADS_LIST(`?page=${page}&limit=${limit}`));
        
        if (response?.data && Array.isArray(response.data)) {
          response.data.forEach(lead => {
            if (lead.phone) {
              const normalizedPhone = this.normalizePhone(lead.phone);
              if (normalizedPhone) {
                this.existingPhones.add(normalizedPhone);
              }
            }
          });

          const total = response?.pagination?.total || 0;
          const currentCount = page * limit;
          hasMore = currentCount < total && response.data.length === limit;
          page++;
        } else {
          hasMore = false;
        }
      }
    } catch (error) {
      console.warn('Could not load existing phones for duplicate check:', error);
    }
  }

  normalizePhone(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '').trim();
    return digits.length === 10 ? digits : null;
  }

  validatePhone(phone, rowIndex) {
    if (!phone || !phone.trim()) {
      return { valid: false, reason: 'Phone number is required' };
    }

    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) {
      const digits = phone.replace(/\D/g, '').trim();
      if (digits.length > 10) {
        return { valid: false, reason: `Phone number has more than 10 digits (${digits.length} digits found)` };
      }
      if (digits.length < 10) {
        return { valid: false, reason: `Phone number has less than 10 digits (${digits.length} digits found)` };
      }
      return { valid: false, reason: 'Invalid phone number format' };
    }

    return { valid: true, normalizedPhone };
  }

  /**
   * Validate if email belongs to department users under this head
   */
  validateDepartmentUserEmail(email) {
    if (!email || !email.trim()) {
      return { valid: false, reason: 'Email is empty' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = this.userEmailMap.get(normalizedEmail);

    if (!user) {
      return { valid: false, reason: `Email ${email} does not belong to any department user under this head` };
    }

    return { valid: true, user };
  }

  validateLead(lead, rowIndex) {
    const errors = [];

    const phoneValidation = this.validatePhone(lead.phone, rowIndex);
    if (!phoneValidation.valid) {
      errors.push(`Row ${rowIndex + 2}: ${phoneValidation.reason}`);
      return { valid: false, errors, skip: true };
    }

    if (this.existingPhones.has(phoneValidation.normalizedPhone)) {
      errors.push(`Row ${rowIndex + 2}: Duplicate phone number ${lead.phone} already exists in database`);
      return { valid: false, errors, skip: true };
    }

    lead.phone = phoneValidation.normalizedPhone;

    if (lead.assignedSalesperson) {
      const assignedValue = lead.assignedSalesperson.trim();
      if (!assignedValue) {
        lead.assignedSalesperson = null;
      } else if (assignedValue.includes('@')) {
        const salespersonValidation = this.validateDepartmentUserEmail(assignedValue);
        if (!salespersonValidation.valid) {
          errors.push(`Row ${rowIndex + 2}: ${salespersonValidation.reason}`);
          return { valid: false, errors, skip: true };
        }
        lead.assignedSalesperson = salespersonValidation.user.username;
      }
    }

    if (lead.assignedTelecaller) {
      const assignedValue = lead.assignedTelecaller.trim();
      if (!assignedValue) {
        lead.assignedTelecaller = null;
      } else if (assignedValue.includes('@')) {
        const telecallerValidation = this.validateDepartmentUserEmail(assignedValue);
        if (!telecallerValidation.valid) {
          errors.push(`Row ${rowIndex + 2}: ${telecallerValidation.reason}`);
          return { valid: false, errors, skip: true };
        }
        lead.assignedTelecaller = telecallerValidation.user.username;
      }
    }

    return { valid: true, errors, skip: false };
  }

  /**
   * Process and validate all leads from CSV
   * STRICT: No fallbacks, exact data only
   */
  processLeads(leads) {
    const validLeads = [];
    const processedPhones = new Set();

    leads.forEach((lead, index) => {
      try {
        // STRICT: Check for duplicate within the same CSV
        if (!lead.phone) {
          this.skippedLeads.push({
            row: index + 2,
            lead,
            reason: 'Phone number is missing'
          });
          this.validationErrors.push(`Row ${index + 2}: Phone number is missing`);
          return;
        }

        const normalizedPhone = this.normalizePhone(lead.phone);
        if (!normalizedPhone) {
          this.skippedLeads.push({
            row: index + 2,
            lead,
            reason: `Phone number must be exactly 10 digits (found: ${lead.phone})`
          });
          this.validationErrors.push(`Row ${index + 2}: Phone number must be exactly 10 digits`);
          return;
        }

        if (processedPhones.has(normalizedPhone)) {
          this.skippedLeads.push({
            row: index + 2,
            lead,
            reason: `Duplicate phone number in CSV: ${lead.phone}`
          });
          this.validationErrors.push(`Row ${index + 2}: Duplicate phone number in CSV`);
          return;
        }

        // STRICT: Validate lead
        const validation = this.validateLead(lead, index);
        
        if (!validation.valid || validation.skip) {
          this.skippedLeads.push({
            row: index + 2,
            lead,
            reason: validation.errors.join('; ')
          });
          this.validationErrors.push(...validation.errors);
          return;
        }

        // Add phone to processed set
        processedPhones.add(normalizedPhone);
        this.existingPhones.add(normalizedPhone);

        // Add to valid leads
        validLeads.push(lead);
      } catch (error) {
        // STRICT: Skip lead if any error occurs
        this.skippedLeads.push({
          row: index + 2,
          lead,
          reason: `Error processing lead: ${error.message}`
        });
        this.validationErrors.push(`Row ${index + 2}: ${error.message}`);
      }
    });

    return validLeads;
  }

  getSummary() {
    return {
      total: this.validationErrors.length + (this.skippedLeads.length > 0 ? this.skippedLeads.length : 0),
      errors: this.validationErrors,
      skipped: this.skippedLeads,
      skippedCount: this.skippedLeads.length
    };
  }
}

export default CSVImportValidationService;
