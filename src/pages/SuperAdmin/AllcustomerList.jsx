import React, { useState } from 'react';
import { Search, Plus, RefreshCw, Eye, MoreVertical, Download, Upload, Edit, Trash2, X, CheckCircle, Clock, Calendar, User, Mail, Phone, Building } from 'lucide-react';

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMenuId, setShowMenuId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    businessName: '',
    businessInfo: '',
    contact: '',
    email: '',
    phone: ''
  });

  const customers = [
    {
      id: 1,
      createdAt: "9, Sep 9, 2025",
      createdTime: "8 AM",
      businessName: "Cyber trunk MBG",
      businessInfo: "Cyber trunk MBG",
      contact: "7619438764",
      onboardingStatus: "COMPLETED",
      onboardingText: "Onboarded",
      servicesStatus: "PENDING",
      servicesExpiry: "Expires: Dec 9, 2026"
    },
    {
      id: 2,
      createdAt: "9, Sep 9, 2025",
      createdTime: "4 AM",
      businessName: "Aadhyarma Business",
      businessInfo: "Nikung",
      contact: "9904433214",
      onboardingStatus: "COMPLETED",
      onboardingText: "Onboarded",
      servicesStatus: "PENDING",
      servicesExpiry: "Expires: Dec 9, 2026"
    },
    {
      id: 3,
      createdAt: "9, Sep 9, 2025",
      createdTime: "36 AM",
      businessName: "investic solutions",
      businessInfo: "Harsh Srivastava",
      contact: "harshsrivastava6900@gmail.com",
      contactPhone: "9651801407",
      onboardingStatus: "COMPLETED",
      onboardingText: "Onboarded",
      servicesStatus: "PENDING",
      servicesExpiry: "Expires: Sep 9, 2026"
    },
    {
      id: 4,
      createdAt: "9, Sep 9, 2025",
      createdTime: "48 AM",
      businessName: "DIP COMPUTER NEW & RIFURBISHD LAPTOP , DESKTOP WHOLESALER",
      businessInfo: "Dipak sir",
      contact: "dipakdipcomputer@gmail.com",
      contactPhone: "9011077365",
      onboardingStatus: "COMPLETED",
      onboardingText: "Onboarded",
      servicesStatus: "PENDING",
      servicesExpiry: "Expires: Sep 9, 2026"
    },
    {
      id: 5,
      createdAt: "9, Sep 9, 2025",
      createdTime: "12 AM",
      businessName: "Blue Star Industries Pvt Ltd",
      businessInfo: "Blue Star Industries Pvt Ltd",
      contact: "bluestarindustriespvtltd@gmail.com",
      contactPhone: "9876543210",
      onboardingStatus: "COMPLETED",
      onboardingText: "Onboarded",
      servicesStatus: "PENDING",
      servicesExpiry: "Expires: Dec 9, 2026"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.businessInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (newCustomer.businessName && newCustomer.contact) {
      // Add customer logic here
      console.log('Adding customer:', newCustomer);
      setNewCustomer({ businessName: '', businessInfo: '', contact: '', email: '', phone: '' });
      setShowAddModal(false);
    }
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    setShowMenuId(null);
  };

  const handleEdit = (customer) => {
    console.log('Edit customer:', customer);
    setShowMenuId(null);
  };

  const handleDelete = (customer) => {
    console.log('Delete customer:', customer);
    setShowMenuId(null);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Business Name,Business Info,Contact,Email,Phone\nSample Business,Sample Info,1234567890,sample@email.com,9876543210";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Uploading file:', file);
      // Handle CSV upload logic here
    }
  };

  const getStatusBadge = (status, type) => {
    if (type === 'onboarding') {
      return (
        <div className="flex flex-col items-center">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
          <span className="text-xs text-gray-500 mt-1">Onboarded</span>
        </div>
      );
    } else if (type === 'services') {
      return (
        <div className="flex flex-col items-center">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
          <span className="text-xs text-gray-500 mt-1">Expires: Dec 9, 2026</span>
        </div>
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Management</h1>
        <p className="text-gray-600">Manage and track all your customers</p>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
            <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Created At</span>
              </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Business Info</span>
              </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Contact</span>
              </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Onboarding Status</span>
              </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Services Status</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{customer.createdAt}</div>
                        <div className="text-gray-500">{customer.createdTime}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{customer.businessName}</div>
                        <div className="text-sm text-gray-500">{customer.businessInfo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{customer.contact}</div>
                        {customer.contactPhone && (
                          <div className="text-sm text-gray-500">{customer.contactPhone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(customer.onboardingStatus, 'onboarding')}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(customer.servicesStatus, 'services')}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowMenuId(showMenuId === customer.id ? null : customer.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenuId === customer.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleEdit(customer)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(customer)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.businessName}
                  onChange={(e) => setNewCustomer({...newCustomer, businessName: e.target.value})}
                  placeholder="Enter business name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Info
                </label>
                <input
                  type="text"
                  value={newCustomer.businessInfo}
                  onChange={(e) => setNewCustomer({...newCustomer, businessInfo: e.target.value})}
                  placeholder="Enter business information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.contact}
                  onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                  placeholder="Enter contact information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
          </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedCustomer.businessName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Info</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedCustomer.businessInfo}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedCustomer.contact}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedCustomer.contactPhone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedCustomer.createdAt} {selectedCustomer.createdTime}</div>
                    </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusBadge(selectedCustomer.onboardingStatus, 'onboarding')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusBadge(selectedCustomer.servicesStatus, 'services')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Expiry</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{selectedCustomer.servicesExpiry}</div>
                </div>
                  </div>
                </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
                    </button>
              <button
                onClick={() => handleEdit(selectedCustomer)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Customer
                    </button>
                  </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Import Customers</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
                </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload a CSV file to import customers</p>
                <button
                  onClick={() => document.getElementById('csv-upload').click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select CSV File
                </button>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>Download the template first to see the required format.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No customers found</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
      </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
