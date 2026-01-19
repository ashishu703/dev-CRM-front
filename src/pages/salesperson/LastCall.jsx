"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Edit, Mail, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, FileText, Receipt, CreditCard, Phone, Calendar, MoreHorizontal, RefreshCcw, User, Building2, MapPin, Filter } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import quotationService from '../../api/admin_api/quotationService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';
import SalespersonCustomerTimeline from '../../components/SalespersonCustomerTimeline';
import toastManager from '../../utils/ToastManager';
import { useAuth } from '../../hooks/useAuth';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import { useSalespersonLeads } from '../../hooks/useSalespersonLeads';
import LeadFilters from '../../components/salesperson/LeadFilters';

// Lead Status Preview Modal Component
const LeadStatusPreview = ({ lead, onClose }) => {
  if (!lead) return null;

  const [latestQuotation, setLatestQuotation] = useState(null);
  const [latestPI, setLatestPI] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [history, setHistory] = useState([]);

  const formatIndianDateTime = (dateStr, timeStr, createdAt) => {
    try {
      if (dateStr || timeStr) {
        const date = dateStr ? new Date(dateStr) : new Date(createdAt || Date.now());
        if (timeStr) {
          const [hh, mm] = String(timeStr).split(':');
          date.setHours(Number(hh || 0), Number(mm || 0), 0, 0);
        }
        return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      if (createdAt) return new Date(createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (_) {}
    return '';
  };

  useEffect(() => {
    let cancelled = false;
    async function loadDocs() {
      try {
        if (!lead?.id) return;
        // Load lead history for full timeline
        try {
          const hRes = await apiClient.get(API_ENDPOINTS.SALESPERSON_LEAD_HISTORY(lead.id));
          if (!cancelled) setHistory(hRes?.data?.data || hRes?.data || []);
        } catch (_) {}
        const qRes = await quotationService.getQuotationsByCustomer(lead.id);
        const qList = (qRes?.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const q = qList[0] || null;
        if (!cancelled) setLatestQuotation(q);
        if (q?.id) {
          const piRes = await proformaInvoiceService.getPIsByQuotation(q.id);
          const piList = (piRes?.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          if (!cancelled) setLatestPI(piList[0] || null);
          const payRes = await apiClient.get(`/api/payments/quotation/${q.id}`);
          if (!cancelled) setPayments(payRes?.data || []);
          const sumRes = await apiClient.get(`/api/quotations/${q.id}/summary`);
          if (!cancelled) setPaymentSummary(sumRes?.data || null);
        } else if (!cancelled) {
          setLatestPI(null);
          setPayments([]);
          setPaymentSummary(null);
        }
      } catch (e) {
        console.warn('Failed to load quotation/PI for lead preview', e);
      }
    }
    loadDocs();
    return () => { cancelled = true; };
  }, [lead?.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-[110]">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Timeline</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Customer Details */}
          <div className="mb-6">
            <h4 className="text-md font-bold text-gray-900 mb-3">Customer Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Customer Name:</span>
                <span className="ml-2 text-gray-900">{lead.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Business Name:</span>
                <span className="ml-2 text-gray-900">{lead.business || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Contact No:</span>
                <span className="ml-2 text-gray-900">{lead.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email Address:</span>
                <span className="ml-2 text-gray-900">{lead.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <h4 className="text-md font-bold text-gray-900 mb-4">Timeline</h4>
            
            {/* Timeline Line */}
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
            
            <div className="space-y-6">
              {/* Customer Created */}
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">Customer Created</h5>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        COMPLETED
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{new Date(lead.created_at).toLocaleDateString('en-GB')}</div>
                      <div>Lead ID: LD-{lead.id}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical follow ups */}
              {[...history].sort((a,b)=> new Date(a.created_at || a.follow_up_date || 0) - new Date(b.created_at || b.follow_up_date || 0)).map((h, idx) => (
                <div key={`${h.id || idx}`} className="relative flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center z-10 ${h.follow_up_status ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    <span className="text-[10px] text-white font-semibold">{idx + 1}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="bg-white border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 text-sm">Follow Up</h5>
                        {h.sales_status && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-medium rounded">{String(h.sales_status).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="text-[13px] text-gray-700">
                        <div className="mb-0.5"><span className="font-medium">Status:</span> {h.follow_up_status || '—'}</div>
                        {h.follow_up_remark && <div className="mb-0.5"><span className="font-medium">Remark:</span> {h.follow_up_remark}</div>}
                        {(h.follow_up_date || h.follow_up_time || h.created_at) && (
                          <div className="text-[11px] text-gray-500">{formatIndianDateTime(h.follow_up_date, h.follow_up_time, h.created_at)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Follow Up Status (current) - removed to avoid duplication */}
              {/* Lead Status - removed to avoid duplication */}

              {/* Quotation Status */}
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center z-10">
                  <FileText className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900 text-sm">Quotation Status</h5>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        (latestQuotation?.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                        (latestQuotation?.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                        (latestQuotation?.status ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                      }`}>
                        {(latestQuotation?.status || 'PENDING').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[13px] text-gray-700">
                      <div>Date: {latestQuotation?.quotation_date ? new Date(latestQuotation.quotation_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A'}</div>
                      <div>No.: {latestQuotation?.quotation_number || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PI Status */}
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center z-10">
                  <Receipt className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900 text-sm">PI Status</h5>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        (latestPI?.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                        (latestPI?.status || '').toLowerCase() === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        (latestPI?.status ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800')
                      }`}>
                        {(latestPI?.status || 'PENDING').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[13px] text-gray-700">
                      <div>Date: {latestPI?.created_at ? new Date(latestPI.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A'}</div>
                      <div>No.: {latestPI?.pi_number || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10">
                  <CreditCard className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900 text-sm">Payment Status</h5>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        paymentSummary && paymentSummary.remaining <= 0 ? 'bg-green-100 text-green-800' :
                        paymentSummary && paymentSummary.paid > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {paymentSummary && paymentSummary.remaining <= 0 ? 'COMPLETED' :
                         paymentSummary && paymentSummary.paid > 0 ? 'PARTIAL' : 'PENDING'}
                      </span>
                    </div>
                    <div className="text-[13px] text-gray-700 space-y-1">
                      {paymentSummary && (
                        <>
                          <div className="font-medium text-gray-900">Total: ₹{Number(paymentSummary.total || 0).toLocaleString('en-IN')}</div>
                          <div className="text-green-700">Paid: ₹{Number(paymentSummary.paid || 0).toLocaleString('en-IN')}</div>
                          <div className="text-red-700">Due: ₹{Number(paymentSummary.remaining || 0).toLocaleString('en-IN')}</div>
                          {payments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="font-medium text-gray-700 mb-2 text-xs">Payment History:</div>
                              {payments.map((payment, idx) => (
                                <div key={payment.id} className="text-xs mb-1.5 p-2 bg-gray-50 rounded">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Advance Payment #{idx + 1}</span>
                                    <span className="text-green-700 font-medium">₹{Number(payment.installment_amount || 0).toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="text-gray-500 mt-0.5">
                                    Method: {payment.payment_method || 'N/A'}
                                  </div>
                                  <div className="text-gray-500">
                                    Date: {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                                  </div>
                                  {payment.quotation_number && (
                                    <div className="text-gray-500">Quotation: {payment.quotation_number}</div>
                                  )}
                                  {payment.pi_number && (
                                    <div className="text-gray-500">PI: {payment.pi_number}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      {!paymentSummary && <div>No payment data available</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Lead Status Modal Component
const EditLeadStatusModal = ({ lead, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sales_status: lead?.sales_status || '',
    sales_status_remark: lead?.sales_status_remark || '',
    follow_up_status: lead?.follow_up_status || '',
    follow_up_remark: lead?.follow_up_remark || '',
    follow_up_date: lead?.follow_up_date || '',
    follow_up_time: lead?.follow_up_time || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(lead.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status');
    }
  };

  const statusOptions = [
    { value: '', label: 'Select Lead Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'running', label: 'Running' },
    { value: 'converted', label: 'Converted' },
    { value: 'interested', label: 'Interested' },
    { value: 'loose', label: 'Loose' },
    { value: 'win/closed', label: 'Win/Closed' },
    { value: 'lost', label: 'Lost' },
    { value: 'closed', label: 'Closed' },
  ];

  const followUpOptions = [
    { value: '', label: 'Select Follow Up Status' },
    { value: 'appointment scheduled', label: 'Appointment Scheduled' },
    { value: 'not interested', label: 'Not Interested' },
    { value: 'interested', label: 'Interested' },
    { value: 'quotation sent', label: 'Quotation Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'close order', label: 'Close Order' },
    { value: 'closed/lost', label: 'Closed/Lost' },
    { value: 'call back request', label: 'Call Back Request' },
    { value: 'unreachable/call not connected', label: 'Unreachable/Call Not Connected' },
    { value: 'currently not required', label: 'Currently Not Required' },
    { value: 'not relevant', label: 'Not Relevant' }
  ];

  // Check if date/time fields should be shown
  const showDateTimeFields = ['appointment scheduled', 'interested', 'negotiation', 'call back request'].includes(formData.follow_up_status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110]">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Update Lead Status & Follow Up</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow Up Status
            </label>
            <select
              name="follow_up_status"
              value={formData.follow_up_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {followUpOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow Up Remark
            </label>
            <textarea
              name="follow_up_remark"
              value={formData.follow_up_remark}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any remarks about the follow up..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Status *
            </label>
            <select
              name="sales_status"
              value={formData.sales_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Status Remark
            </label>
            <textarea
              name="sales_status_remark"
              value={formData.sales_status_remark}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any remarks about the lead status..."
            />
          </div>

          {showDateTimeFields && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow Up Date *
                </label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={showDateTimeFields}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow Up Time *
                </label>
                <input
                  type="time"
                  name="follow_up_time"
                  value={formData.follow_up_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={showDateTimeFields}
                />
                <p className="text-xs text-gray-500 mt-1">Time will be saved in Indian Standard Time (IST)</p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Status & Follow Up
          </button>
        </div>
      </div>
    </div>
  );
};


export default function LastCall() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // Store all leads for filter options
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [timelineLead, setTimelineLead] = useState(null);
  const [showCustomerTimeline, setShowCustomerTimeline] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination state - show all date groups by default, allow pagination if needed
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Show up to 100 date groups by default
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user for role-based filtering
  const { user } = useAuth();
  const currentUserId = user?.id;
  const lastUserIdRef = React.useRef(null);

  // Convert ALL leads to format expected by useSalespersonLeads hook (for filter options)
  const convertedAllLeads = React.useMemo(() => {
    return allLeads.map(lead => {
      // Better product type handling - check multiple fields
      const productType = lead.product_type || lead.productType || lead.product_name || lead.productName || ''
      const productNameValue = productType && productType.trim() !== '' ? productType.trim() : 'N/A'
      
      return {
        id: lead.id,
        name: lead.name || 'N/A',
        phone: lead.phone || 'N/A',
        email: lead.email || 'N/A',
        business: lead.business || 'N/A',
        address: lead.address || 'N/A',
        gstNo: lead.gst_no || 'N/A',
        productName: productNameValue,
        product_type: productNameValue, // Store both for compatibility
        state: lead.state || 'N/A',
        enquiryBy: lead.lead_source || 'N/A',
        customerType: lead.customer_type || 'N/A',
        date: lead.date ? new Date(lead.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        salesStatus: lead.sales_status || 'pending',
        salesStatusRemark: lead.sales_status_remark || null,
        followUpStatus: lead.follow_up_status || null,
        followUpRemark: lead.follow_up_remark || null,
        followUpDate: lead.follow_up_date ? new Date(lead.follow_up_date).toISOString().split('T')[0] : null,
        followUpTime: lead.follow_up_time || null,
      }
    });
  }, [allLeads]);

  // Use the filter hook with ALL leads (so filter options are complete)
  const filterHook = useSalespersonLeads(convertedAllLeads);
  
  // Update hook's customers when all leads change (for filter options)
  React.useEffect(() => {
    filterHook.setCustomers(convertedAllLeads);
  }, [convertedAllLeads]);

  // Apply filters to filteredLeads (but only from last call leads)
  React.useEffect(() => {
    // First apply the last call leads filter
    const lastCallLeadIds = new Set(leads.map(l => l.id));
    
    // Then apply the filter hook filters
    if (filterHook.filteredCustomers.length > 0) {
      const filteredIds = new Set(filterHook.filteredCustomers.map(c => c.id));
      // Intersection: must be in both last call leads AND filter results
      const newFiltered = leads.filter(lead => filteredIds.has(lead.id) && lastCallLeadIds.has(lead.id));
      setFilteredLeads(newFiltered);
    } else {
      setFilteredLeads(leads);
    }
  }, [filterHook.filteredCustomers, leads]);

  // Fetch leads data with user change detection
  useEffect(() => {
    // If no user is logged in, do nothing
    if (!currentUserId) {
      return;
    }

    // If user has changed, clear existing leads
    if (lastUserIdRef.current !== null && lastUserIdRef.current !== currentUserId) {
      console.log('[LastCall] User changed, clearing leads. Old:', lastUserIdRef.current, 'New:', currentUserId);
      setLeads([]);
      setFilteredLeads([]);
      setError(null);
    }

    // Update last user ID
    lastUserIdRef.current = currentUserId;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Global cache busting is automatically applied by apiClient.get()
        const response = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME());
        const leadsData = response?.data || [];
        
        console.log(`[LastCall] Received ${leadsData.length} leads from API for user: ${user?.email}`);
        
        // Store ALL leads for filter options
        setAllLeads(leadsData);
        
        // Get today's date at midnight in local timezone for proper comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        
        const lastCallLeads = leadsData.filter(lead => {
          const hasFollowUpStatus = lead.follow_up_status && lead.follow_up_status.trim() !== '';
          const hasFollowUpRemark = lead.follow_up_remark && lead.follow_up_remark.trim() !== '';
          
          // Check for scheduled dates (same logic as ScheduledCall page)
          const hasFollowUpDate = lead.follow_up_date && lead.follow_up_date !== 'N/A' && lead.follow_up_date !== '';
          const hasFollowUpTime = lead.follow_up_time && lead.follow_up_time !== 'N/A' && lead.follow_up_time !== '';
          const hasNextMeetingDate = lead.next_meeting_date && lead.next_meeting_date !== 'N/A' && lead.next_meeting_date !== '';
          const hasNextMeetingTime = lead.next_meeting_time && lead.next_meeting_time !== 'N/A' && lead.next_meeting_time !== '';
          const hasMeetingDate = lead.meeting_date && lead.meeting_date !== 'N/A' && lead.meeting_date !== '';
          const hasMeetingTime = lead.meeting_time && lead.meeting_time !== 'N/A' && lead.meeting_time !== '';
          const hasScheduledDate = lead.scheduled_date && lead.scheduled_date !== 'N/A' && lead.scheduled_date !== '';
          const hasScheduledTime = lead.scheduled_time && lead.scheduled_time !== 'N/A' && lead.scheduled_time !== '';
          const hasNextMeetingStatus = lead.sales_status === 'next_meeting' && lead.sales_status_remark;
          
          const hasScheduledDateOrTime = hasFollowUpDate || hasFollowUpTime || hasNextMeetingDate || hasNextMeetingTime || 
                                         hasMeetingDate || hasMeetingTime || hasScheduledDate || hasScheduledTime || hasNextMeetingStatus;
          
          // Include leads that have follow-up status/remark OR scheduled dates
          if (!hasFollowUpStatus && !hasFollowUpRemark && !hasScheduledDateOrTime) {
            return false;
          }
          
          // Check if the follow-up/scheduled date is <= today
          let callDate = null;
          
          // Priority: follow_up_date > next_meeting_date > meeting_date > scheduled_date
          if (lead.follow_up_date) {
            callDate = new Date(lead.follow_up_date);
            callDate.setHours(0, 0, 0, 0); // Normalize to start of day
          } else if (lead.next_meeting_date) {
            callDate = new Date(lead.next_meeting_date);
            callDate.setHours(0, 0, 0, 0);
          } else if (lead.meeting_date) {
            callDate = new Date(lead.meeting_date);
            callDate.setHours(0, 0, 0, 0);
          } else if (lead.scheduled_date) {
            callDate = new Date(lead.scheduled_date);
            callDate.setHours(0, 0, 0, 0);
          } else if (lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
            // Extract date from remark format like "2025-10-28 AT 19:10"
            const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
              callDate = new Date(dateMatch[1]);
              callDate.setHours(0, 0, 0, 0);
            }
          } else if (lead.updated_at) {
            callDate = new Date(lead.updated_at);
            callDate.setHours(0, 0, 0, 0);
          }
          
          // If no date is available, exclude the lead
          if (!callDate || isNaN(callDate.getTime())) {
            return false;
          }
          
          // Only include if call/scheduled date is <= today (compare dates, not times)
          return callDate <= today;
        });
        
        console.log(`[LastCall] Filtered to ${lastCallLeads.length} last call leads for user: ${user?.email}`);
        
        // Debug: Log date distribution
        const dateCounts = {};
        lastCallLeads.forEach(lead => {
          let dateKey = '';
          if (lead.follow_up_date) {
            const d = new Date(lead.follow_up_date);
            dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } else if (lead.next_meeting_date) {
            const d = new Date(lead.next_meeting_date);
            dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } else if (lead.updated_at) {
            const d = new Date(lead.updated_at);
            dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
          if (dateKey) {
            dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
          }
        });
        console.log('[LastCall] Date distribution:', Object.keys(dateCounts).sort().reverse().slice(0, 10).map(d => `${d}: ${dateCounts[d]} leads`));
        
        setLeads(lastCallLeads);
        setFilteredLeads(lastCallLeads);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load last call data');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.action-menu-container')) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterPanel = document.getElementById('filter-panel');
      const filterButton = document.getElementById('filter-button');
      if (filterPanel && !filterPanel.contains(event.target) && !filterButton?.contains(event.target)) {
        filterHook.setShowFilterPanel(false);
      }
    };
    
    if (filterHook.showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [filterHook.showFilterPanel]);

  // Handle search
  // Handle search - integrate with filter hook
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterHook.setSearchQuery(query);
  };

  // Handle lead status update
  const handleUpdateLeadStatus = async (leadId, statusData) => {
    try {
      const payload = {
        sales_status: statusData.sales_status ?? statusData.salesStatus ?? '',
        sales_status_remark: statusData.sales_status_remark ?? statusData.salesStatusRemark ?? '',
        follow_up_status: statusData.follow_up_status ?? statusData.followUpStatus ?? '',
        follow_up_remark: statusData.follow_up_remark ?? statusData.followUpRemark ?? '',
        follow_up_date: statusData.follow_up_date ?? statusData.followUpDate ?? '',
        follow_up_time: statusData.follow_up_time ?? statusData.followUpTime ?? '',
      }
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v == null ? '' : v))
      const response = await apiClient.putFormData(`/api/leads/assigned/salesperson/lead/${leadId}`, fd);
      
      if (response.success) {
        // Update the leads list
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId 
              ? { ...lead, ...payload, updated_at: new Date().toISOString() }
              : lead
          )
        );
        
        // Update filtered leads
        setFilteredLeads(prevFiltered => 
          prevFiltered.map(lead => 
            lead.id === leadId 
              ? { ...lead, ...payload, updated_at: new Date().toISOString() }
              : lead
          )
        );
        
        alert('Lead status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  };

  // Handle preview
  const handlePreview = (lead) => {
    setTimelineLead(lead);
    setShowCustomerTimeline(true);
  };

  // Handle edit
  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'running': 'bg-blue-100 text-blue-800 border border-blue-200',
      'converted': 'bg-green-100 text-green-800 border border-green-200',
      'lost/closed': 'bg-red-100 text-red-800 border border-red-200',
      'interested': 'bg-purple-100 text-purple-800 border border-purple-200',
      'win lead': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    };

    const statusText = {
      'pending': 'Pending',
      'running': 'Running',
      'converted': 'Converted',
      'lost/closed': 'Lost/Closed',
      'interested': 'Interested',
      'win lead': 'Win Lead',
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}
      >
        {statusText[status] || status}
      </span>
    );
  };

  // Get follow up badge
  const getFollowUpBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const followUpClasses = {
      'appointment scheduled': 'bg-blue-100 text-blue-800 border border-blue-200',
      'not interested': 'bg-red-100 text-red-800 border border-red-200',
      'interested': 'bg-green-100 text-green-800 border border-green-200',
      'quotation sent': 'bg-purple-100 text-purple-800 border border-purple-200',
      'negotiation': 'bg-orange-100 text-orange-800 border border-orange-200',
      'close order': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'closed/lost': 'bg-gray-100 text-gray-800 border border-gray-200',
      'call back request': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'unreachable/call not connected': 'bg-red-100 text-red-800 border border-red-200',
      'currently not required': 'bg-gray-100 text-gray-800 border border-gray-200',
      'not relevant': 'bg-gray-100 text-gray-800 border border-gray-200',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    };

    const followUpText = {
      'appointment scheduled': 'Appointment Scheduled',
      'not interested': 'Not Interested',
      'interested': 'Interested',
      'quotation sent': 'Quotation Sent',
      'negotiation': 'Negotiation',
      'close order': 'Close Order',
      'closed/lost': 'Closed/Lost',
      'call back request': 'Call Back Request',
      'unreachable/call not connected': 'Unreachable',
      'currently not required': 'Not Required',
      'not relevant': 'Not Relevant',
      'pending': 'Pending',
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${followUpClasses[statusLower] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}
      >
        {followUpText[statusLower] || status || 'Pending'}
      </span>
    );
  };

  // Format date for display (short format like "10 Dec")
  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Format date for grouping (full format)
  const formatDateForGrouping = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to normalize date string to YYYY-MM-DD format
  const normalizeDateKey = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      // Extract YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return null;
    }
  };

  // Group leads by date (last call date)
  const groupedLeads = useMemo(() => {
    const groups = {};
    
    filteredLeads.forEach(lead => {
      // Priority: follow_up_date > next_meeting_date > meeting_date > scheduled_date > updated_at
      let dateObj = null;
      let dateKey = '';
      
      if (lead.follow_up_date) {
        dateObj = new Date(lead.follow_up_date);
        dateKey = normalizeDateKey(lead.follow_up_date);
      } else if (lead.next_meeting_date) {
        dateObj = new Date(lead.next_meeting_date);
        dateKey = normalizeDateKey(lead.next_meeting_date);
      } else if (lead.meeting_date) {
        dateObj = new Date(lead.meeting_date);
        dateKey = normalizeDateKey(lead.meeting_date);
      } else if (lead.scheduled_date) {
        dateObj = new Date(lead.scheduled_date);
        dateKey = normalizeDateKey(lead.scheduled_date);
      } else if (lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
        // Extract date from remark format like "2025-10-28 AT 19:10"
        const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          dateObj = new Date(dateMatch[1]);
          dateKey = dateMatch[1]; // Already in YYYY-MM-DD format
        }
      } else if (lead.updated_at) {
        dateObj = new Date(lead.updated_at);
        dateKey = normalizeDateKey(lead.updated_at);
      } else {
        dateKey = 'No Date';
        dateObj = new Date(0); // Use epoch for sorting
      }
      
      // Skip if dateKey is null (invalid date)
      if (!dateKey || dateKey === 'No Date') {
        if (!groups['No Date']) {
          groups['No Date'] = {
            dateObj: new Date(0),
            dateKey: 'No Date',
            leads: []
          };
        }
        groups['No Date'].leads.push(lead);
        return;
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateObj: dateObj,
          dateKey: dateKey,
          leads: []
        };
      }
      groups[dateKey].leads.push(lead);
    });
    
    // Sort dates in descending order (most recent first)
    // Normalize date objects for proper comparison
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      
      // Normalize dates to start of day for consistent comparison
      const dateA = new Date(groups[a].dateObj);
      dateA.setHours(0, 0, 0, 0);
      const dateB = new Date(groups[b].dateObj);
      dateB.setHours(0, 0, 0, 0);
      
      return dateB.getTime() - dateA.getTime();
    });
    
    return sortedDates.map(dateKey => ({
      dateKey,
      dateObj: groups[dateKey].dateObj,
      leads: groups[dateKey].leads
    }));
  }, [filteredLeads]);

  // Pagination logic for grouped leads
  const totalPages = Math.ceil(groupedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = groupedLeads.slice(startIndex, endIndex);
  
  // Debug: Log grouped dates
  React.useEffect(() => {
    if (groupedLeads.length > 0) {
      console.log(`[LastCall] Total date groups: ${groupedLeads.length}, Showing: ${startIndex + 1}-${Math.min(endIndex, groupedLeads.length)}`);
      console.log('[LastCall] Date groups:', groupedLeads.slice(0, 10).map(g => `${g.dateKey} (${g.leads.length} leads)`));
    }
  }, [groupedLeads, startIndex, endIndex]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Show skeleton loader on initial load
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ${showCustomerTimeline ? 'pr-0 lg:pr-[360px]' : ''}`}>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
            <div className="flex shadow-lg rounded-xl overflow-hidden flex-1 sm:flex-initial">
              <input 
                type="text" 
                placeholder="Search items..." 
                value={filterHook.searchQuery || searchQuery} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white border-gray-200 text-gray-900 placeholder-gray-500" 
              />
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => filterHook.setShowFilterPanel(!filterHook.showFilterPanel)} 
              className={`p-2.5 rounded-xl border-2 inline-flex items-center relative transition-all duration-200 shadow-md ${
                filterHook.showFilterPanel 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-blue-200/50' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`} 
              id="filter-button"
            >
              <Filter className={`h-4 w-4 ${filterHook.showFilterPanel ? 'text-blue-600' : 'text-gray-600'}`} />
              {Object.values(filterHook.enabledFilters).some(Boolean) && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
                  {Object.values(filterHook.enabledFilters).filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const response = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME());
                  const leadsData = response?.data || [];
                  
                  // Store ALL leads for filter options
                  setAllLeads(leadsData);
                  
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  const lastCallLeads = leadsData.filter(lead => {
                    const hasFollowUpStatus = lead.follow_up_status && lead.follow_up_status.trim() !== '';
                    const hasFollowUpRemark = lead.follow_up_remark && lead.follow_up_remark.trim() !== '';
                    const hasFollowUpDate = lead.follow_up_date && lead.follow_up_date !== 'N/A' && lead.follow_up_date !== '';
                    const hasNextMeetingDate = lead.next_meeting_date && lead.next_meeting_date !== 'N/A' && lead.next_meeting_date !== '';
                    const hasMeetingDate = lead.meeting_date && lead.meeting_date !== 'N/A' && lead.meeting_date !== '';
                    const hasScheduledDate = lead.scheduled_date && lead.scheduled_date !== 'N/A' && lead.scheduled_date !== '';
                    const hasScheduledDateOrTime = hasFollowUpDate || hasNextMeetingDate || hasMeetingDate || hasScheduledDate;
                    if (!hasFollowUpStatus && !hasFollowUpRemark && !hasScheduledDateOrTime) return false;
                    let callDate = null;
                    if (lead.follow_up_date) callDate = new Date(lead.follow_up_date);
                    else if (lead.next_meeting_date) callDate = new Date(lead.next_meeting_date);
                    else if (lead.meeting_date) callDate = new Date(lead.meeting_date);
                    else if (lead.scheduled_date) callDate = new Date(lead.scheduled_date);
                    else if (lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
                      const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
                      if (dateMatch) callDate = new Date(dateMatch[1]);
                    } else if (lead.updated_at) callDate = new Date(lead.updated_at);
                    if (!callDate || isNaN(callDate.getTime())) return false;
                    return callDate <= today;
                  });
                  setLeads(lastCallLeads);
                  setFilteredLeads(lastCallLeads);
                } catch (err) {
                  console.error('Error refreshing leads:', err);
                  setError('Failed to refresh last call data');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters {...filterHook} sortBy={filterHook.sortBy} setSortBy={filterHook.setSortBy} sortOrder={filterHook.sortOrder} setSortOrder={filterHook.setSortOrder} handleSortChange={filterHook.handleSortChange} handleSortOrderChange={filterHook.handleSortOrderChange} />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : groupedLeads.length > 0 ? (
        <div className="space-y-6">
          {paginatedGroups.map((group) => {
            const dateDisplay = group.dateKey === 'No Date' 
              ? 'No Date' 
              : formatDateShort(group.dateKey);
            const dateFull = group.dateKey === 'No Date' 
              ? 'No Date' 
              : formatDateForGrouping(group.dateKey);
            
            return (
              <div key={group.dateKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          {dateDisplay}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">{dateFull}</p>
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {group.leads.length} call{group.leads.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="min-w-[800px] sm:w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">LEAD ID</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span>CUSTOMER</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-600" />
                            <span>BUSINESS</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span>ADDRESS</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-teal-600" />
                            <span>FOLLOW UP</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span>SALES STATUS</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">LAST CALL</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            <span>ACTION</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {lead.id}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-[200px]">
                            <div>
                              <div className="font-semibold truncate" title={lead.name}>{lead.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 truncate" title={lead.phone}>
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{lead.phone}</span>
                              </div>
                              {lead.email && lead.email !== "N/A" && (
                                <div className="text-xs mt-1 text-cyan-600 truncate">
                                  <button 
                                    onClick={() => window.open(`mailto:${lead.email}?subject=Follow up from ANOCAB&body=Dear ${lead.name},%0D%0A%0D%0AThank you for your interest in our products.%0D%0A%0D%0ABest regards,%0D%0AANOCAB Team`, '_blank')}
                                    className="inline-flex items-center gap-1 transition-colors hover:text-cyan-700 truncate"
                                    title={lead.email}
                                  >
                                    <Mail className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{lead.email}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px]">
                            <div className="truncate" title={lead.business || 'N/A'}>{lead.business || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                            <div className="truncate" title={lead.address || 'N/A'}>{lead.address || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              {getFollowUpBadge(lead.follow_up_status)}
                              {lead.follow_up_remark && (
                                <div className="text-xs text-gray-600 italic truncate max-w-[200px]" title={lead.follow_up_remark}>
                                  "{lead.follow_up_remark}"
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              {getStatusBadge(lead.sales_status)}
                              {lead.sales_status_remark && (
                                <div className="text-xs text-gray-600 italic truncate max-w-[200px]" title={lead.sales_status_remark}>
                                  "{lead.sales_status_remark}"
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(() => {
                              // Priority: follow_up_date > next_meeting_date > meeting_date > scheduled_date > updated_at
                              let dateToDisplay = null;
                              
                              if (lead.follow_up_date) {
                                dateToDisplay = lead.follow_up_date;
                              } else if (lead.next_meeting_date) {
                                dateToDisplay = lead.next_meeting_date;
                              } else if (lead.meeting_date) {
                                dateToDisplay = lead.meeting_date;
                              } else if (lead.scheduled_date) {
                                dateToDisplay = lead.scheduled_date;
                              } else if (lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
                                // Extract date from remark format like "2025-10-28 AT 19:10"
                                const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
                                if (dateMatch) {
                                  dateToDisplay = dateMatch[1];
                                }
                              } else if (lead.updated_at) {
                                dateToDisplay = lead.updated_at;
                              }
                              
                              return dateToDisplay 
                                ? new Date(dateToDisplay).toLocaleDateString('en-GB') 
                                : 'N/A';
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="relative action-menu-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenu(openActionMenu === lead.id ? null : lead.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                              </button>
                              {openActionMenu === lead.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreview(lead);
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md">
                                        <Eye className="h-3.5 w-3.5 text-white" />
                                      </div>
                                      View Details
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(lead);
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
                                        <Edit className="h-3.5 w-3.5 text-white" />
                                      </div>
                                      Edit Status
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}  
          
          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 border-t-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>All</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-700">
              {groupedLeads.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(endIndex, groupedLeads.length)} of {groupedLeads.length} date groups ({filteredLeads.length} total calls)
                </>
              ) : (
                <>No results found</>
              )}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || filteredLeads.length === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || filteredLeads.length === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next page */}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || filteredLeads.length === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || filteredLeads.length === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-6 py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No last call data</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any last call activities at the moment.
            </p>
          </div>
        </div>
      )}

      {/* Global Customer Timeline Sidebar (salesperson view) */}
      {showCustomerTimeline && timelineLead && (
        <SalespersonCustomerTimeline
          lead={timelineLead}
          onClose={() => {
            setShowCustomerTimeline(false);
            setTimelineLead(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditLeadStatusModal
          lead={selectedLead}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLead(null);
          }}
          onSave={handleUpdateLeadStatus}
        />
      )}
    </div>
  );
}
