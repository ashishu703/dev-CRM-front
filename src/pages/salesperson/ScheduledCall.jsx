"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, Mail, Search, X, RefreshCw, User, Building2, MapPin, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import CustomerDetailSidebar from '../../components/salesperson/CustomerDetailSidebar';
import SendEmailForm from '../../components/salesperson/SendEmailForm';
import UploadDocs from '../../components/salesperson/UploadDocs';
import toastManager from '../../utils/ToastManager';
import { useAuth } from '../../hooks/useAuth';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import { useSalespersonLeads } from '../../hooks/useSalespersonLeads';
import { useQuotationFlow } from '../../hooks/useQuotationFlow';
import { usePIFlow } from '../../hooks/usePIFlow';
import LeadFilters from '../../components/salesperson/LeadFilters';
import { EditLeadStatusModal } from './LeadStatus';

export default function ScheduledCall() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // Store all leads for filter options
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [sidebarUpdateStatusLead, setSidebarUpdateStatusLead] = useState(null);
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
  const quotationHook = useQuotationFlow(viewingCustomer?.id ?? viewingCustomer?._id ?? null);
  const piHook = usePIFlow(viewingCustomer, null, null);

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
      
      // Filter leads that have a real scheduled date (avoid counting all assigned as "scheduled")
      const scheduledLeads = leadsData.filter(lead => {
        const hasFollowUpDate = lead.follow_up_date && String(lead.follow_up_date).trim() !== '' && lead.follow_up_date !== 'N/A';
        const hasNextMeetingDate = lead.next_meeting_date && String(lead.next_meeting_date).trim() !== '' && lead.next_meeting_date !== 'N/A';
        const hasMeetingDate = lead.meeting_date && String(lead.meeting_date).trim() !== '' && lead.meeting_date !== 'N/A';
        const hasScheduledDate = lead.scheduled_date && String(lead.scheduled_date).trim() !== '' && lead.scheduled_date !== 'N/A';
        const hasDateFromRemark = lead.sales_status === 'next_meeting' && lead.sales_status_remark && /(\d{4}-\d{2}-\d{2})/.test(lead.sales_status_remark);
        return hasFollowUpDate || hasNextMeetingDate || hasMeetingDate || hasScheduledDate || hasDateFromRemark;
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

  // Get sortable date for a lead (for latest-first sort) — must be before any early return (Rules of Hooks)
  const getScheduledDate = React.useCallback((lead) => {
    let date = lead.follow_up_date || lead.next_meeting_date || lead.meeting_date || lead.scheduled_date;
    if (!date && lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
      const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) date = dateMatch[1];
    }
    return date ? new Date(date).getTime() : 0;
  }, []);

  const sortedLeads = React.useMemo(() => {
    return [...filteredLeads].sort((a, b) => getScheduledDate(b) - getScheduledDate(a));
  }, [filteredLeads, getScheduledDate]);

  // Date key YYYY-MM-DD for a lead's scheduled date (for grouping/counts)
  const getScheduledDateKey = React.useCallback((lead) => {
    let date = lead.follow_up_date || lead.next_meeting_date || lead.meeting_date || lead.scheduled_date;
    if (!date && lead.sales_status === 'next_meeting' && lead.sales_status_remark) {
      const dateMatch = lead.sales_status_remark.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) date = dateMatch[1];
    }
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Total calls per day (recent first); include last 7 days with 0 as "No calls on that day"
  const callsByDate = React.useMemo(() => {
    const countByKey = {};
    sortedLeads.forEach((lead) => {
      const key = getScheduledDateKey(lead);
      if (key) countByKey[key] = (countByKey[key] || 0) + 1;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;
      days.push({ key, count: countByKey[key] || 0 });
    }
    return days;
  }, [sortedLeads, getScheduledDateKey]);

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  const handlePageChange = React.useCallback((page) => setCurrentPage(Math.max(1, Math.min(page, totalPages))), [totalPages]);
  const handleItemsPerPageChange = React.useCallback((val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  }, []);

  // Show skeleton loader on initial load (after all hooks)
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

  return (
    <div className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ${viewingCustomer ? 'pr-0 lg:pr-[360px]' : ''}`}>

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
      ) : sortedLeads.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Last 7 days total calls - rounded, light colourful strip */}
          <div className="mx-3 sm:mx-6 mt-3 mb-3 sm:mt-4 sm:mb-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100/60">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">Last 7 days total calls</p>
            <div className="flex flex-wrap gap-2">
              {callsByDate.map((day) => (
                <span
                  key={day.key}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    day.count === 0
                      ? 'bg-amber-50/80 text-amber-800 border border-amber-200/70'
                      : 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/70'
                  }`}
                >
                  <span>{formatDateShort(day.key)}:</span>
                  <span className="ml-1">{day.count === 0 ? 'No calls' : `${day.count} call${day.count !== 1 ? 's' : ''}`}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] sm:min-w-[1200px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">DATE</th>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewingCustomer(lead)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getScheduledDateKey(lead) ? formatDateShort(getScheduledDateKey(lead)) : 'N/A'}
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
                                  onClick={(e) => { e.stopPropagation(); window.open(`mailto:${lead.email}?subject=Follow up from ANOCAB&body=Dear ${lead.name},%0D%0A%0D%0AThank you for your interest in our products.%0D%0A%0D%0ABest regards,%0D%0AANOCAB Team`, '_blank'); }}
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
                      </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination - match Last Call */}
          <div className="px-3 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Showing {startIndex + 1}-{Math.min(endIndex, sortedLeads.length)} of {sortedLeads.length}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  title="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm font-medium">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  title="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
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

      {/* Customer Detail Sidebar (same as salesperson leads) */}
      {viewingCustomer && (
        <CustomerDetailSidebar
          customer={viewingCustomer}
          onClose={() => { setViewingCustomer(null); setSidebarUpdateStatusLead(null); }}
          quotations={quotationHook.quotations}
          onViewQuotation={quotationHook.handleViewQuotation}
          onEditQuotation={undefined}
          onDeleteQuotation={quotationHook.handleDeleteQuotation}
          quotationPIs={piHook.quotationPIs}
          piHook={piHook}
          onViewPI={piHook.handleViewPI}
          onUpdateStatus={() => { setSelectedLead(viewingCustomer); setShowEditModal(true); }}
          onUpdateStatusTabSelect={(c) => setSidebarUpdateStatusLead(c)}
          renderUpdateStatusContent={(onClose) => sidebarUpdateStatusLead && (
            <EditLeadStatusModal
              lead={sidebarUpdateStatusLead}
              onClose={() => { onClose(); setSidebarUpdateStatusLead(null); }}
              onSave={async (id, payload) => { await handleUpdateLeadStatus(id, payload); setSidebarUpdateStatusLead(null); }}
              embedInSidebar={true}
            />
          )}
          renderSendEmailContent={(onClose) => (
            <SendEmailForm customer={viewingCustomer} onClose={onClose} />
          )}
          renderDocsContent={(onClose) => {
            const leadId = viewingCustomer?.id ?? viewingCustomer?._id;
            return leadId ? <UploadDocs leadId={leadId} onClose={onClose} /> : null;
          }}
        />
      )}

      {/* Edit Modal (standalone overlay when opened from sidebar header action) */}
      {showEditModal && selectedLead && (
        <EditLeadStatusModal
          lead={selectedLead}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLead(null);
          }}
          onSave={async (id, payload) => { await handleUpdateLeadStatus(id, payload); setShowEditModal(false); setSelectedLead(null); }}
          embedInSidebar={false}
        />
      )}
    </div>
  );
}
