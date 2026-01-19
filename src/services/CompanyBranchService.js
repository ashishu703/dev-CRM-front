import organizationService from '../api/admin_api/organizationService';

class CompanyBranchService {
  /**
   * Fetch active organizations and map them into the structure
   * expected by quotation / PI templates.
   */
  async fetchBranches() {
    const response = await organizationService.listOrganizations({ isActive: true });
    const organizations = response.organizations || response.data?.organizations || [];

    const branches = {};

    organizations.forEach((org) => {
      if (!org || org.id == null) {
        return;
      }

      const key = String(org.id);

      const addressLines = [];
      if (org.street_address) {
        addressLines.push(org.street_address);
      }

      const cityStateZip = [org.city, org.state, org.zip_code].filter(Boolean).join(', ');
      if (cityStateZip) {
        addressLines.push(cityStateZip);
      }

      if (org.country) {
        addressLines.push(org.country);
      }

      branches[key] = {
        id: org.id,
        name: org.organization_name || '',
        legalName: org.legal_name || '',
        gstNumber: org.gstin || '',
        description: org.legal_name || '',
        address: addressLines.join('\n'),
        state: org.state || '', // Add state field separately
        tel: org.phone || '',
        web: org.website || '',
        email: org.email || '',
        logoUrl: org.logo_url || ''
      };
    });

    return {
      branches,
      organizations
    };
  }
}

export default new CompanyBranchService();

