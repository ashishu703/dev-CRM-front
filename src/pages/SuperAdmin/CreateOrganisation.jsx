import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, FileText, DollarSign, Clock, Upload, Save, X, Plus, Edit2, Trash2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import organizationService from '../../api/admin_api/organizationService';
import toastManager from '../../utils/ToastManager';
import { SkeletonTable } from '../../components/dashboard/DashboardSkeleton';

const initialFormState = {
  organizationName: '',
  legalName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  },
  contact: {
    phone: '',
    email: '',
    website: ''
  },
  taxInfo: {
    gstin: '',
    pan: '',
    tan: ''
  },
  financial: {
    currency: 'INR',
    fiscalYearStart: 'April',
    fiscalYearEnd: 'March'
  },
  timezone: 'Asia/Kolkata',
  logo: null,
  logoUrl: ''
};

const CreateOrganisation = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isEditMode = !!selectedOrgId;

  const mapApiOrgToForm = (org) => ({
    organizationName: org.organization_name || '',
    legalName: org.legal_name || '',
    address: {
      street: org.street_address || '',
      city: org.city || '',
      state: org.state || '',
      zipCode: org.zip_code || '',
      country: org.country || 'India'
    },
    contact: {
      phone: org.phone || '',
      email: org.email || '',
      website: org.website || ''
    },
    taxInfo: {
      gstin: org.gstin || '',
      pan: org.pan || '',
      tan: org.tan || ''
    },
    financial: {
      currency: org.currency || 'INR',
      fiscalYearStart: org.fiscal_year_start || 'April',
      fiscalYearEnd: org.fiscal_year_end || 'March'
    },
    timezone: org.timezone || 'Asia/Kolkata',
    logo: null,
    logoUrl: org.logo_url || ''
  });

  const resetToInitial = () => {
    setSelectedOrgId(null);
    setFormData(initialFormState);
    setErrors({});
    setIsSidebarOpen(false);
  };

  const openCreateSidebar = () => {
    resetToInitial();
    setIsSidebarOpen(true);
  };

  const openEditSidebar = (org) => {
    setSelectedOrgId(org.id);
    setFormData(mapApiOrgToForm(org));
    setErrors({});
    setIsSidebarOpen(true);
  };

  const fetchOrganizations = async () => {
    setListLoading(true);
    try {
      const res = await organizationService.listOrganizations({ isActive: true });
      const items = res.organizations || res.data?.organizations || [];
      setOrganizations(items);
    } catch (error) {
      toastManager.handleApiError(error);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: 'Logo size should be less than 2MB'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
      setErrors(prev => ({
        ...prev,
        logo: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    if (!formData.legalName.trim()) {
      newErrors.legalName = 'Legal name is required';
    }
    
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    }
    
    if (formData.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
      newErrors['contact.email'] = 'Invalid email format';
    }
    
    if (formData.contact.phone && !/^[0-9]{10}$/.test(formData.contact.phone.replace(/[\s-]/g, ''))) {
      newErrors['contact.phone'] = 'Invalid phone number';
    }
    
    if (formData.taxInfo.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.taxInfo.gstin)) {
      newErrors['taxInfo.gstin'] = 'Invalid GSTIN format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let logoUrl = '';

      if (formData.logo) {
        const uploadForm = new FormData();
        uploadForm.append('file', formData.logo);
        const uploadRes = await apiClient.postFormData(
          `${API_ENDPOINTS.API_BASE_URL}/api/upload?folder=organizations`,
          uploadForm
        );
        logoUrl = uploadRes?.data?.url || '';
      } else if (formData.logoUrl) {
        logoUrl = formData.logoUrl;
      }

      const payload = {
        organizationName: formData.organizationName,
        legalName: formData.legalName,
        logoUrl: logoUrl,
        streetAddress: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.zipCode,
        country: formData.address.country,
        phone: formData.contact.phone,
        email: formData.contact.email,
        website: formData.contact.website,
        gstin: formData.taxInfo.gstin,
        pan: formData.taxInfo.pan,
        tan: formData.taxInfo.tan,
        currency: formData.financial.currency,
        fiscalYearStart: formData.financial.fiscalYearStart,
        fiscalYearEnd: formData.financial.fiscalYearEnd,
        timezone: formData.timezone
      };

      if (isEditMode && selectedOrgId) {
        await organizationService.updateOrganization(selectedOrgId, payload);
        toastManager.handleApiSuccess('updated', 'Organization');
      } else {
        await organizationService.createOrganization(payload);
        toastManager.handleApiSuccess('created', 'Organization');
      }

      await fetchOrganizations();
      resetToInitial();
    } catch (error) {
      console.error('Error saving organization:', error);
      toastManager.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    
    try {
      await organizationService.deleteOrganization(orgId);
      toastManager.handleApiSuccess('deleted', 'Organization');
      if (selectedOrgId === orgId) {
        resetToInitial();
      }
      await fetchOrganizations();
    } catch (error) {
      toastManager.handleApiError(error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Organisation</h1>
                <p className="text-sm text-gray-500">Set up your organization profile and details</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCreateSidebar}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Organisation</span>
            </button>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {listLoading ? (
            <SkeletonTable rows={10} />
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No organizations found. Click "New Organisation" to create your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Legal Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {org.logo_url ? (
                          <img
                            src={org.logo_url}
                            alt={org.organization_name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{org.organization_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{org.legal_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {org.street_address ? (
                            <>
                              <div>{org.street_address}</div>
                              <div className="text-gray-500">{org.city}, {org.state} {org.zip_code}</div>
                              <div className="text-gray-500">{org.country || 'India'}</div>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {org.phone && <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{org.phone}</span>
                          </div>}
                          {org.email && <div className="flex items-center space-x-1 mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{org.email}</span>
                          </div>}
                          {org.website && <div className="flex items-center space-x-1 mt-1">
                            <Globe className="w-3 h-3" />
                            <span className="text-blue-600">{org.website}</span>
                          </div>}
                          {!org.phone && !org.email && !org.website && 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {org.gstin && <div>GSTIN: {org.gstin}</div>}
                          {org.pan && <div>PAN: {org.pan}</div>}
                          {org.tan && <div>TAN: {org.tan}</div>}
                          {!org.gstin && !org.pan && !org.tan && 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditSidebar(org)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(org.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={resetToInitial}
          />
          
          {/* Sidebar */}
          <div
            className="fixed top-0 right-0 h-screen z-50 bg-gray-50 shadow-xl border-l border-gray-200 overflow-y-auto"
            style={{ width: 500 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-gray-200 p-4 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Organization' : 'Create Organization'}
                      </h2>
                      <p className="text-xs text-gray-500">Set up your organization profile and details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetToInitial}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Organization Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                      Organization Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.organizationName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter organization name"
                        />
                        {errors.organizationName && (
                          <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Legal Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="legalName"
                          value={formData.legalName}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.legalName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter legal name"
                        />
                        {errors.legalName && (
                          <p className="mt-1 text-sm text-red-500">{errors.legalName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Logo
                        </label>
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                          {formData.logo ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={URL.createObjectURL(formData.logo)}
                                alt="Logo preview"
                                className="h-20 w-auto object-contain"
                              />
                              <span className="mt-2 text-sm text-gray-600">{formData.logo.name}</span>
                            </div>
                          ) : formData.logoUrl ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={formData.logoUrl}
                                alt="Logo preview"
                                className="h-20 w-auto object-contain"
                              />
                              <span className="mt-2 text-sm text-gray-600">Current logo</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="w-8 h-8 text-gray-400" />
                              <span className="mt-2 text-sm text-gray-600">Click to upload logo</span>
                              <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {errors.logo && (
                          <p className="mt-1 text-sm text-red-500">{errors.logo}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter street address"
                        />
                        {errors['address.street'] && (
                          <p className="mt-1 text-sm text-red-500">{errors['address.street']}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter city"
                          />
                          {errors['address.city'] && (
                            <p className="mt-1 text-sm text-red-500">{errors['address.city']}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter state"
                          />
                          {errors['address.state'] && (
                            <p className="mt-1 text-sm text-red-500">{errors['address.state']}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter ZIP code"
                          />
                          {errors['address.zipCode'] && (
                            <p className="mt-1 text-sm text-red-500">{errors['address.zipCode']}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <select
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="contact.phone"
                          value={formData.contact.phone}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors['contact.phone'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter phone number"
                        />
                        {errors['contact.phone'] && (
                          <p className="mt-1 text-sm text-red-500">{errors['contact.phone']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="contact.email"
                          value={formData.contact.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors['contact.email'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter email address"
                        />
                        {errors['contact.email'] && (
                          <p className="mt-1 text-sm text-red-500">{errors['contact.email']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="contact.website"
                          value={formData.contact.website}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Tax Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GSTIN
                        </label>
                        <input
                          type="text"
                          name="taxInfo.gstin"
                          value={formData.taxInfo.gstin}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                            errors['taxInfo.gstin'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="15-character GSTIN"
                          maxLength={15}
                        />
                        {errors['taxInfo.gstin'] && (
                          <p className="mt-1 text-sm text-red-500">{errors['taxInfo.gstin']}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            PAN
                          </label>
                          <input
                            type="text"
                            name="taxInfo.pan"
                            value={formData.taxInfo.pan}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                            placeholder="10-character PAN"
                            maxLength={10}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            TAN
                          </label>
                          <input
                            type="text"
                            name="taxInfo.tan"
                            value={formData.taxInfo.tan}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                            placeholder="10-character TAN"
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Settings */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                      Financial Settings
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          name="financial.currency"
                          value={formData.financial.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="INR">INR - Indian Rupee</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fiscal Year Start
                          </label>
                          <select
                            name="financial.fiscalYearStart"
                            value={formData.financial.fiscalYearStart}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="January">January</option>
                            <option value="April">April</option>
                            <option value="July">July</option>
                            <option value="October">October</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-0">
                    <div className="flex items-center justify-end space-x-4">
                      <button
                        type="button"
                        onClick={resetToInitial}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Organization' : 'Create Organization')}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateOrganisation;
