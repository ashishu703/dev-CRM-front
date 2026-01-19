"use client"

import React, { useState, useEffect } from 'react';
import { Eye, Edit, Calendar, Clock, Phone, Mail, Search, X, RefreshCw, MoreHorizontal, User, Building2, MapPin, Filter } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import SalespersonCustomerTimeline from '../../components/SalespersonCustomerTimeline';
import toastManager from '../../utils/ToastManager';
import { useAuth } from '../../hooks/useAuth';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import { useSalespersonLeads } from '../../hooks/useSalespersonLeads';
import LeadFilters from '../../components/salesperson/LeadFilters';

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


export default function ScheduledCall() {
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search and filter state
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

  // Apply filters to filteredLeads (but only from scheduled leads)
  React.useEffect(() => {
    // First apply the scheduled leads filter
    const scheduledLeadIds = new Set(leads.map(l => l.id));
    
    // Then apply the filter hook filters
    if (filterHook.filteredCustomers.length > 0) {
      const filteredIds = new Set(filterHook.filteredCustomers.map(c => c.id));
      // Intersection: must be in both scheduled leads AND filter results
      const newFiltered = leads.filter(lead => filteredIds.has(lead.id) && scheduledLeadIds.has(lead.id));
      setFilteredLeads(newFiltered);
    } else {
      setFilteredLeads(leads);
    }
  }, [filterHook.filteredCustomers, leads]);

  // Refresh function
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Global cache busting is automatically applied by apiClient.get()
      const response = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME());
      const leadsData = response?.data || [];
      
      console.log(`[ScheduledCall] Received ${leadsData.length} leads from API for user: ${user?.email}`);
      
      // Store ALL leads for filter options
      setAllLeads(leadsData);
      
      // Filter leads that have scheduled meetings
      const scheduledLeads = leadsData.filter(lead => {
        const hasFollowUpDate = lead.follow_up_date && lead.follow_up_date !== 'N/A' && lead.follow_up_date !== '';
        const hasFollowUpTime = lead.follow_up_time && lead.follow_up_time !== 'N/A' && lead.follow_up_time !== '';
        const hasNextMeetingDate = lead.next_meeting_date && lead.next_meeting_date !== 'N/A' && lead.next_meeting_date !== '';
        const hasNextMeetingTime = lead.next_meeting_time && lead.next_meeting_time !== 'N/A' && lead.next_meeting_time !== '';
        const hasMeetingDate = lead.meeting_date && lead.meeting_date !== 'N/A' && lead.meeting_date !== '';
        const hasMeetingTime = lead.meeting_time && lead.meeting_time !== 'N/A' && lead.meeting_time !== '';
        const hasScheduledDate = lead.scheduled_date && lead.scheduled_date !== 'N/A' && lead.scheduled_date !== '';
        const hasScheduledTime = lead.scheduled_time && lead.scheduled_time !== 'N/A' && lead.scheduled_time !== '';
        const hasNextMeetingStatus = lead.sales_status === 'next_meeting' && lead.sales_status_remark;
        
        return hasFollowUpDate || hasFollowUpTime || hasNextMeetingDate || hasNextMeetingTime || 
               hasMeetingDate || hasMeetingTime || hasScheduledDate || hasScheduledTime || hasNextMeetingStatus;
      });
      
      console.log(`[ScheduledCall] Filtered to ${scheduledLeads.length} scheduled leads for user: ${user?.email}`);
      
      setLeads(scheduledLeads);
      setFilteredLeads(scheduledLeads);
    } catch (err) {
      console.error('Error refreshing leads:', err);
      setError('Failed to refresh scheduled calls data');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch leads data with user change detection
  useEffect(() => {
    // If no user is logged in, do nothing
    if (!currentUserId) {
      return;
    }

    // If user has changed, clear existing leads
    if (lastUserIdRef.current !== null && lastUserIdRef.current !== currentUserId) {
      console.log('[ScheduledCall] User changed, clearing leads. Old:', lastUserIdRef.current, 'New:', currentUserId);
      setLeads([]);
      setFilteredLeads([]);
      setError(null);
    }

    // Update last user ID
    lastUserIdRef.current = currentUserId;

    refreshData();
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

  // Show skeleton loader on initial load
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

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
    const statusLower = status?.toLowerCase() || '';
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'running': 'bg-blue-100 text-blue-800 border border-blue-200',
      'converted': 'bg-green-100 text-green-800 border border-green-200',
      'interested': 'bg-purple-100 text-purple-800 border border-purple-200',
      'win/closed': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'win': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'win lead': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'closed': 'bg-gray-100 text-gray-800 border border-gray-200',
      'lost': 'bg-red-100 text-red-800 border border-red-200',
      'lost/closed': 'bg-red-100 text-red-800 border border-red-200',
      'loose': 'bg-red-100 text-red-800 border border-red-200',
      'follow up': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'not interested': 'bg-gray-100 text-gray-800 border border-gray-200',
    };

    const statusText = {
      'pending': 'Pending',
      'running': 'Running',
      'converted': 'Converted',
      'interested': 'Interested',
      'win/closed': 'Win/Closed',
      'win': 'Win',
      'win lead': 'Win Lead',
      'closed': 'Closed',
      'lost': 'Lost',
      'lost/closed': 'Lost/Closed',
      'loose': 'Loose',
      'follow up': 'Follow Up',
      'not interested': 'Not Interested',
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[statusLower] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}
      >
        {statusText[statusLower] || status || 'Unknown'}
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

  // Format date for display (short format like "28 Oct")
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

  // Group leads by follow_up_date
  const groupedLeads = filteredLeads.reduce((groups, lead) => {
    let date = lead.follow_up_date || lead.next_meeting_date || lead.meeting_date || lead.scheduled_date;
    
    // For next_meeting status, extract date from sales_status_remark
    if (!date && lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
      // Extract date from remark format like "2025-10-28 AT 19:10"
      const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        date = dateMatch[1];
      }
    }
    
    if (date) {
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(lead);
    }
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedLeads).sort((a, b) => new Date(a) - new Date(b));

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
              onClick={refreshData}
              disabled={loading}
              className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
      ) : leads.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Scheduled Calls Found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>No leads with scheduled follow-up dates found. Make sure you have scheduled meetings with follow-up dates and times.</p>
              </div>
            </div>
          </div>
        </div>
      ) : sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {formatDateShort(date)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">{formatDateForGrouping(date)}</p>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {groupedLeads[date].length} appointment{groupedLeads[date].length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="min-w-[800px] sm:min-w-[1200px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">LEAD ID</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span>CUSTOMER</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          <span>BUSINESS</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span>ADDRESS</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-teal-600" />
                          <span>FOLLOW UP</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span>SALES STATUS</span>
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">SCHEDULED CALL</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          <span>ACTION</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupedLeads[date].map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px]">
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <div className="space-y-1">
                            {getFollowUpBadge(lead.follow_up_status)}
                            {lead.follow_up_remark && (
                              <div className="text-xs text-gray-600 italic truncate max-w-[200px]" title={lead.follow_up_remark}>
                                "{lead.follow_up_remark}"
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
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
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {(() => {
                                // For next_meeting status, extract date from sales_status_remark
                                if (lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
                                  const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
                                  return dateMatch ? formatDateShort(dateMatch[1]) : 'N/A';
                                }
                                const date = lead.follow_up_date || lead.next_meeting_date || lead.meeting_date || lead.scheduled_date;
                                return date ? formatDateShort(date) : 'N/A';
                              })()}
                            </div>
                            {(() => {
                              // For next_meeting status, extract time from sales_status_remark
                              if (lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
                                const timeMatch = lead.sales_status_remark.match(/AT (\d{2}:\d{2})/);
                                return timeMatch ? (
                                  <div className="text-xs text-blue-600 font-medium">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {timeMatch[1]}
                                  </div>
                                ) : null;
                              }
                              const time = lead.follow_up_time || lead.next_meeting_time || lead.meeting_time || lead.scheduled_time;
                              return time ? (
                                <div className="text-xs text-blue-600 font-medium">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {time}
                                </div>
                              ) : null;
                            })()}
                          </div>
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
          ))}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-6 py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled calls</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any scheduled follow-up calls at the moment.
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
