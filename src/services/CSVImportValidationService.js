import departmentUsersApi from '../api/admin_api/departmentUsersApi';

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
      const usersResponse = await departmentUsersApi.getByHeadId(this.headUserId);
      
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
    } catch (error) {
      console.error('Error initializing CSV validation service:', error);
      throw new Error('Failed to initialize validation service');
    }
  }

  async loadExistingPhones() {
    return Promise.resolve();
  }

  normalizePhone(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '').trim();
    return digits.length === 10 ? digits : null;
  }

  validatePhone(phone) {
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

    const phoneValidation = this.validatePhone(lead.phone);
    if (!phoneValidation.valid) {
      errors.push(`Row ${rowIndex + 2}: ${phoneValidation.reason}`);
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

  processLeads(leads) {
    const validLeads = [];
    const csvPhones = new Set();

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const rowNum = i + 2;

      if (!lead.phone) {
        this.skippedLeads.push({ row: rowNum, lead, reason: 'Phone number is missing' });
        this.validationErrors.push(`Row ${rowNum}: Phone number is missing`);
        continue;
      }

      const normalizedPhone = this.normalizePhone(lead.phone);
      if (!normalizedPhone) {
        this.skippedLeads.push({ row: rowNum, lead, reason: `Phone must be 10 digits (found: ${lead.phone})` });
        this.validationErrors.push(`Row ${rowNum}: Phone must be 10 digits`);
        continue;
      }

      if (csvPhones.has(normalizedPhone)) {
        this.skippedLeads.push({ row: rowNum, lead, reason: `Duplicate in CSV: ${lead.phone}` });
        this.validationErrors.push(`Row ${rowNum}: Duplicate in CSV`);
        continue;
      }

      const validation = this.validateLead(lead, i);
      if (!validation.valid || validation.skip) {
        this.skippedLeads.push({ row: rowNum, lead, reason: validation.errors.join('; ') });
        this.validationErrors.push(...validation.errors);
        continue;
      }

      csvPhones.add(normalizedPhone);
      validLeads.push(lead);
    }

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
