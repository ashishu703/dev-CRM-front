import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Filter, RefreshCw, Eye, X, FileText, Phone, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import LeadTable from '../../components/LeadTable';
import CustomerTimeline from '../../components/CustomerTimeline';
import ColumnFilterModal from '../../components/ColumnFilterModal';
import EnquiryTable from '../../components/EnquiryTable';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import departmentHeadService from '../../api/admin_api/departmentHeadService';
import LeadService from '../../services/LeadService';
import salesDataService from '../../services/SalesDataService';
import { getStatusBadge as getStatusBadgeUtil } from '../../utils/statusUtils';
import { useAuth } from '../../hooks/useAuth';
import { SkeletonTable } from '../../components/dashboard/DashboardSkeleton';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import apiErrorHandler from '../../utils/ApiErrorHandler';
import toastManager from '../../utils/ToastManager';

const AllLeads = () => {
  const { user } = useAuth();
  const [leadsData, setLeadsData] = useState([]);
  const [allLeadsData, setAllLeadsData] = useState([]);
  const [lastCallSummaryData, setLastCallSummaryData] = useState([]);
  const [lastCallLoading, setLastCallLoading] = useState(false);
  const [lastCallInitialLoading, setLastCallInitialLoading] = useState(false);
  const [lastCallPage, setLastCallPage] = useState(1);
  const [lastCallLimit, setLastCallLimit] = useState(50);
  const [lastCallTotal, setLastCallTotal] = useState(0);
  const [expandedLastCallRows, setExpandedLastCallRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [showColumnFilterRow, setShowColumnFilterRow] = useState(false);
  const [showCustomerTimeline, setShowCustomerTimeline] = useState(false);
  const [timelineLead, setTimelineLead] = useState(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [assignedSalespersonFilter, setAssignedSalespersonFilter] = useState('');
  const [assignedTelecallerFilter, setAssignedTelecallerFilter] = useState('');
  
  const [columnFilters, setColumnFilters] = useState({
    customerId: '',
    customer: '',
    business: '',
    address: '',
    state: '',
    phone: '',
    email: '',
    gstNo: '',
    leadSource: '',
    productNames: '',
    category: '',
    followUpStatus: '',
    salesStatus: '',
    telecallerStatus: '',
    paymentStatus: '',
    createdAt: '',
    updatedAt: ''
  });

  const [visibleColumns, setVisibleColumns] = useState({
    customerId: false,
    customer: true,
    business: true,
    address: true,
    state: true,
    followUpStatus: true,
    salesStatus: true,
    assignedSalesperson: true,
    assignedTelecaller: true,
    gstNo: false,
    leadSource: false,
    productNames: false,
    category: false,
    createdAt: false,
    telecallerStatus: false,
    paymentStatus: false,
    updatedAt: false
  });

  const searchTimeoutRef = useRef(null);
  const leadService = useMemo(() => new LeadService(), []);
  
  // Cache for leads data
  const leadsCacheRef = useRef({ data: null, timestamp: null, params: null });
  const LEADS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const fetchLeadsAbortControllerRef = useRef(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('leads');

  // Enquiry state with pagination
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesGroupedByDate, setEnquiriesGroupedByDate] = useState({});
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiryPage, setEnquiryPage] = useState(1);
  const [enquiryLimit, setEnquiryLimit] = useState(50);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  
  // Enquiry filters
  const [enquiryFilters, setEnquiryFilters] = useState({
    salesperson: '',
    telecaller: '',
    state: '',
    division: '',
    follow_up_status: '',
    sales_status: '',
    enquiry_date: ''
  });
  const [showEnquiryFilters, setShowEnquiryFilters] = useState(false);
  
  // Enquiry column visibility - default visible columns
  const [enquiryVisibleColumns, setEnquiryVisibleColumns] = useState({
    customer_name: true,
    business: true,
    state: true,
    division: true,
    address: true,
    enquired_product: true,
    product_quantity: true,
    product_remark: true,
    // Hidden by default
    follow_up_status: false,
    follow_up_remark: false,
    sales_status: false,
    sales_status_remark: false,
    salesperson: false,
    telecaller: false,
    enquiry_date: false
  });
  const [showEnquiryColumnModal, setShowEnquiryColumnModal] = useState(false);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Memoized test data filter (optimized)
  const isTestDataLead = useCallback((lead) => {
    if (!lead || lead == null) return true;
    const customer = (lead.customer || '').toLowerCase();
    const business = (lead.business || '').toLowerCase();
    const email = (lead.email || '').toLowerCase();
    return customer.includes('sample') || customer.includes('test') || customer.includes('demo') ||
           customer.includes('another customer') || business.includes('sample') || business.includes('test') ||
           business.includes('demo') || business.includes('another business') || email.includes('sample@') ||
           email.includes('test@') || email.includes('demo@');
  }, []);

  // Optimized lead transformation (memoized)
  const transformLead = useCallback((lead) => ({
    ...lead,
    productNames: lead.productNamesText || lead.product_names || '',
    updatedAt: lead.updated_at || lead.created_at || '',
    assignedSalesperson: lead.assignedSalesperson || lead.assigned_salesperson || 'Unassigned',
    assignedTelecaller: lead.assignedTelecaller || lead.assigned_telecaller || 'Unassigned'
  }), []);

  // Optimized data processing (memoized) - with strict duplicate removal
  const processLeadsData = useCallback((rawLeadsData) => {
    // Remove duplicates using Map (O(n) instead of O(n²))
    // Use both id and a combination of fields to ensure uniqueness
    const uniqueLeadsMap = new Map();
    const seenIds = new Set();
    
    rawLeadsData.forEach((lead, index) => {
      if (!lead || lead == null) return;
      
      // Use ID as primary key, but track by index if ID is missing/duplicate
      const leadId = lead.id != null ? lead.id : `temp-${index}`;
      
      // If we've seen this ID before, skip it (keep first occurrence)
      if (seenIds.has(leadId)) {
        return;
      }
      
      seenIds.add(leadId);
      
      // Store with original index to maintain order
      uniqueLeadsMap.set(leadId, { ...lead, _originalIndex: index });
    });
    
    const uniqueLeadsData = Array.from(uniqueLeadsMap.values())
      .sort((a, b) => (a._originalIndex || 0) - (b._originalIndex || 0))
      .map(({ _originalIndex, ...lead }) => lead); // Remove temporary index
    
    // Transform and filter in single pass
    const transformedLeads = leadService.transformApiData(uniqueLeadsData)
      .filter(lead => !isTestDataLead(lead))
      .map(transformLead);
    
    // Final duplicate check by ID to ensure no duplicates
    const finalUniqueMap = new Map();
    transformedLeads.forEach((lead, index) => {
      if (lead?.id != null) {
        // Keep first occurrence of each ID
        if (!finalUniqueMap.has(lead.id)) {
          finalUniqueMap.set(lead.id, { ...lead, _renderIndex: index });
        }
      } else {
        // For leads without ID, use index as key
        finalUniqueMap.set(`temp-${index}`, { ...lead, _renderIndex: index });
      }
    });
    
    return Array.from(finalUniqueMap.values());
  }, [leadService, isTestDataLead, transformLead]);

  // Fetch leads from all departments and companies (SUPERADMIN) - OPTIMIZED
  const fetchLeads = useCallback(async (forceRefresh = false) => {
    // Cancel previous request if still pending
    if (fetchLeadsAbortControllerRef.current) {
      fetchLeadsAbortControllerRef.current.abort();
    }
    fetchLeadsAbortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      
      const params = {
        page,
        limit,
        departmentType: 'office_sales',
      };
      
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }
      
      // Add column filter params
      if (columnFilters.state) params.state = columnFilters.state;
      if (columnFilters.leadSource) params.leadSource = columnFilters.leadSource;
      if (columnFilters.salesStatus) params.salesStatus = columnFilters.salesStatus;
      if (columnFilters.followUpStatus) params.followUpStatus = columnFilters.followUpStatus;
      
      // Check cache
      const cacheKey = JSON.stringify(params);
      const now = Date.now();
      if (!forceRefresh && 
          leadsCacheRef.current.data && 
          leadsCacheRef.current.params === cacheKey &&
          leadsCacheRef.current.timestamp && 
          (now - leadsCacheRef.current.timestamp) < LEADS_CACHE_DURATION) {
        setLeadsData(leadsCacheRef.current.data);
        setAllLeadsData(leadsCacheRef.current.data);
        setTotal(leadsCacheRef.current.total);
        setLoading(false);
        setInitialLoading(false);
        return;
      }
      
      // Fetch data
      const response = await departmentHeadService.getAllLeads(params);
      
      // Handle different response structures
      let leadsData = [];
      if (Array.isArray(response)) {
        leadsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        leadsData = response.data;
      } else if (response?.leads && Array.isArray(response.leads)) {
        leadsData = response.leads;
      }
      
      // Process data (optimized)
      const transformedLeads = processLeadsData(leadsData);
      
      // Update cache
      leadsCacheRef.current = {
        data: transformedLeads,
        timestamp: now,
        params: cacheKey,
        total: response?.pagination?.total ?? response?.stats?.total ?? transformedLeads.length
      };
      
      setLeadsData(transformedLeads);
      setAllLeadsData(transformedLeads);
      
      // Update pagination
      if (response?.pagination?.total != null) {
        setTotal(response.pagination.total);
      } else if (response?.stats?.total != null) {
        setTotal(response.stats.total);
      } else {
        setTotal(transformedLeads.length);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
      console.error('Error fetching leads:', err);
        apiErrorHandler.handleError(err, 'fetch leads');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
      fetchLeadsAbortControllerRef.current = null;
    }
  }, [page, limit, debouncedSearchTerm, columnFilters.state, columnFilters.leadSource, columnFilters.salesStatus, columnFilters.followUpStatus, processLeadsData]);

  // Helper function to filter test data (DRY principle)
  const filterTestData = useCallback((leads) => {
    return leads.filter(lead => {
          if (!lead || lead == null) return false;
          
          const customer = (lead.customer || '').toLowerCase();
          const business = (lead.business || '').toLowerCase();
          const email = (lead.email || '').toLowerCase();
          
          const isTestData = customer.includes('sample') || 
              customer.includes('test') || 
              customer.includes('demo') ||
              business.includes('sample') ||
              business.includes('test') ||
              business.includes('demo') ||
              email.includes('sample@') ||
              email.includes('test@') ||
              email.includes('demo@');
          
          return !isTestData;
    });
  }, []);

  // Helper function to transform leads (DRY principle) - with proper field mapping
  const transformLeads = useCallback((leads) => {
    return leads.map(lead => {
      // Transform using leadService first to get standard fields
      const transformed = leadService.transformApiData([lead])[0] || {};
      
      // Get all possible field name variations
      const followUpStatus = lead.follow_up_status || lead.followUpStatus || transformed.follow_up_status || transformed.followUpStatus || null;
      const followUpRemark = lead.follow_up_remark || lead.followUpRemark || transformed.follow_up_remark || transformed.followUpRemark || null;
      const salesStatus = lead.sales_status || lead.salesStatus || transformed.sales_status || transformed.salesStatus || null;
      const salesStatusRemark = lead.sales_status_remark || lead.salesStatusRemark || transformed.sales_status_remark || transformed.salesStatusRemark || null;
      
      return {
        ...lead,
        ...transformed,
        productNames: lead.productNamesText || lead.product_names || transformed.productNames || '',
        updatedAt: lead.updated_at || lead.created_at || transformed.updatedAt || '',
        assignedSalesperson: lead.assignedSalesperson || lead.assigned_salesperson || transformed.assignedSalesperson || 'Unassigned',
        assignedTelecaller: lead.assignedTelecaller || lead.assigned_telecaller || transformed.assignedTelecaller || 'Unassigned',
        // Preserve date fields for Last Call filtering (snake_case)
        follow_up_date: lead.follow_up_date || lead.followUpDate || transformed.follow_up_date || null,
        follow_up_remark: followUpRemark,
        follow_up_status: followUpStatus,
        next_meeting_date: lead.next_meeting_date || lead.nextMeetingDate || transformed.next_meeting_date || null,
        meeting_date: lead.meeting_date || lead.meetingDate || transformed.meeting_date || null,
        scheduled_date: lead.scheduled_date || lead.scheduledDate || transformed.scheduled_date || null,
        sales_status: salesStatus,
        sales_status_remark: salesStatusRemark,
        updated_at: lead.updated_at || lead.updatedAt || transformed.updated_at || null,
        // Map to camelCase for LeadTable component (required for display)
        followUpStatus: followUpStatus,
        followUpRemark: followUpRemark,
        salesStatus: salesStatus,
        salesStatusRemark: salesStatusRemark
      };
    });
  }, [leadService]);

  // Cache for last call summary (keyed by page)
  const lastCallCacheRef = useRef(new Map());
  const LAST_CALL_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const fetchLastCallAbortControllerRef = useRef(null);

  const fetchLastCallSummary = useCallback(async (forceRefresh = false, page = lastCallPage, limit = lastCallLimit) => {
    if (fetchLastCallAbortControllerRef.current) {
      fetchLastCallAbortControllerRef.current.abort();
    }
    fetchLastCallAbortControllerRef.current = new AbortController();
    
    const cacheKey = `summary-${page}-limit-${limit}`;
    const now = Date.now();
    
    const cached = lastCallCacheRef.current.get(cacheKey);
    if (!forceRefresh && cached && cached.timestamp && (now - cached.timestamp) < LAST_CALL_CACHE_DURATION) {
      setLastCallSummaryData(cached.data);
      setLastCallTotal(cached.total);
      return;
    }

    try {
      setLastCallLoading(true);
      if (page === 1) {
        setLastCallInitialLoading(true);
      }
      
      const response = await departmentHeadService.getLastCallSummary({ page, limit });
      const summary = response?.data || [];
      const total = response?.pagination?.total || 0;
      
      lastCallCacheRef.current.set(cacheKey, {
        data: summary,
        total,
        timestamp: now
      });
      
      setLastCallSummaryData(summary);
      setLastCallTotal(total);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching last call summary:', err);
        apiErrorHandler.handleError(err, 'fetch last call summary');
      }
    } finally {
      setLastCallLoading(false);
      setLastCallInitialLoading(false);
      fetchLastCallAbortControllerRef.current = null;
    }
  }, [lastCallPage, lastCallLimit]);

  // Fetch leads when filters change - with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    fetchLeads();
    }, 300); // Debounce to avoid too many API calls
    
    return () => {
      clearTimeout(timeoutId);
      if (fetchLeadsAbortControllerRef.current) {
        fetchLeadsAbortControllerRef.current.abort();
      }
    };
  }, [fetchLeads]);

  // Fetch last call summary when Last Call tab is active or pagination changes
  useEffect(() => {
    if (activeTab === 'lastCall') {
      fetchLastCallSummary(false, lastCallPage, lastCallLimit);
    }
  }, [activeTab, lastCallPage, lastCallLimit, fetchLastCallSummary]);

  const groupedLastCallSummary = useMemo(() => {
    const groups = {};
    for (let i = 0; i < lastCallSummaryData.length; i++) {
      const row = lastCallSummaryData[i];
      if (!row?.call_date || !row?.salesperson) continue;
      if (!groups[row.call_date]) {
        groups[row.call_date] = [];
      }
      groups[row.call_date].push(row);
    }

    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(dateKey => ({
        dateKey,
        rows: groups[dateKey]
      }));
  }, [lastCallSummaryData]);


  // Optimized search filter (memoized)
  const matchesSearch = useCallback((lead, searchLower) => {
        if (!lead) return false;
        return (
          (lead.customer || '').toLowerCase().includes(searchLower) ||
          (lead.customerId || '').toLowerCase().includes(searchLower) ||
          (lead.email || '').toLowerCase().includes(searchLower) ||
          (lead.business || '').toLowerCase().includes(searchLower) ||
          (lead.phone || '').toLowerCase().includes(searchLower) ||
          (lead.address || '').toLowerCase().includes(searchLower)
        );
  }, []);

  // Optimized column filter check (memoized)
  const matchesColumnFilter = useCallback((lead, key, filterValue) => {
          if (!lead) return false;
          const leadValue = String(lead[key] || '').toLowerCase();
          return leadValue.includes(filterValue);
  }, []);

  // Filter leads based on column filters and search - OPTIMIZED with memoization and duplicate removal
  const filteredLeads = useMemo(() => {
    if (!leadsData.length) return [];
    
    // Pre-compute search term
    const searchLower = debouncedSearchTerm ? debouncedSearchTerm.toLowerCase() : null;
    
    // Single pass filtering (O(n) instead of multiple passes)
    const filtered = leadsData.filter(lead => {
      if (!lead || lead == null || typeof lead !== 'object') return false;
      
      // Search filter
      if (searchLower && !matchesSearch(lead, searchLower)) return false;
      
      // Column filters
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value && !matchesColumnFilter(lead, key, value.toLowerCase())) {
          return false;
        }
      }
      
      // Assigned salesperson filter
      if (assignedSalespersonFilter) {
        const assigned = lead.assignedSalesperson || lead.assigned_salesperson || '';
        if (assignedSalespersonFilter === 'Unassigned') {
          if (assigned && assigned !== 'Unassigned' && assigned !== 'N/A' && assigned !== '') {
            return false;
          }
        } else if (assigned !== assignedSalespersonFilter) {
          return false;
        }
      }
      
      // Assigned telecaller filter
      if (assignedTelecallerFilter) {
        const assigned = lead.assignedTelecaller || lead.assigned_telecaller || '';
        if (assignedTelecallerFilter === 'Unassigned') {
          if (assigned && assigned !== 'Unassigned' && assigned !== 'N/A' && assigned !== '') {
            return false;
          }
        } else if (assigned !== assignedTelecallerFilter) {
          return false;
        }
      }
      
      return true;
    });
    
    // Remove duplicates by ID to ensure unique keys
    const uniqueMap = new Map();
    filtered.forEach((lead, index) => {
      if (lead?.id != null) {
        // Keep first occurrence of each ID
        if (!uniqueMap.has(lead.id)) {
          uniqueMap.set(lead.id, { ...lead, _renderIndex: index });
        }
      } else {
        // For leads without ID, use index as key
        uniqueMap.set(`no-id-${index}`, { ...lead, _renderIndex: index });
      }
    });
    
    return Array.from(uniqueMap.values());
  }, [leadsData, debouncedSearchTerm, columnFilters, assignedSalespersonFilter, assignedTelecallerFilter, matchesSearch, matchesColumnFilter]);

  // Toggle column visibility
  const toggleColumn = useCallback((columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  }, []);

  // Reset columns to default
  const resetColumns = useCallback(() => {
    setVisibleColumns({
      customerId: false,
      customer: true,
      business: true,
      address: true,
      state: true,
      followUpStatus: true,
      salesStatus: true,
      assignedSalesperson: true,
      assignedTelecaller: true,
      gstNo: false,
      leadSource: false,
      productNames: false,
      category: false,
      createdAt: false,
      telecallerStatus: false,
      paymentStatus: false,
      updatedAt: false
    });
  }, []);

  // Show all columns
  const showAllColumns = useCallback(() => {
    setVisibleColumns(prev => {
      const allTrue = {};
      Object.keys(prev).forEach(key => {
        allTrue[key] = true;
      });
      return allTrue;
    });
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
      setIsAllSelected(false);
    } else {
      const validLeadIds = filteredLeads
        .filter(lead => lead != null && lead.id != null)
        .map(lead => lead.id);
      setSelectedLeadIds(validLeadIds);
      setIsAllSelected(validLeadIds.length > 0);
    }
  }, [isAllSelected, filteredLeads]);

  // Toggle select one
  const toggleSelectOne = useCallback((leadId) => {
    if (leadId == null) return;
    setSelectedLeadIds(prev => {
      if (prev.includes(leadId)) {
        setIsAllSelected(false);
        return prev.filter(id => id !== leadId);
      } else {
        const newSelected = [...prev, leadId];
        const validLeadsCount = filteredLeads.filter(lead => lead != null && lead.id != null).length;
        setIsAllSelected(newSelected.length === validLeadsCount && validLeadsCount > 0);
        return newSelected;
      }
    });
  }, [filteredLeads]);

  // Handle edit
  const handleEdit = useCallback((lead) => {
    // Implement edit functionality
    toastManager.info('Edit functionality coming soon');
  }, []);

  // Handle view timeline
  const handleViewTimeline = useCallback((lead) => {
    setTimelineLead(lead);
    setShowCustomerTimeline(true);
  }, []);

  // Handle assign
  const handleAssign = useCallback((lead) => {
    // Implement assign functionality
    toastManager.info('Assign functionality coming soon');
  }, []);

  // Get status badge
  const getStatusBadge = useCallback((status, type) => {
    return getStatusBadgeUtil(status, type);
  }, []);

  // Check if lead is assigned
  const isLeadAssigned = useCallback((lead) => {
    if (!lead || lead === null || lead === undefined) return false;
    const assigned = lead.assignedSalesperson || lead.assigned_salesperson;
    return assigned && assigned !== 'Unassigned' && assigned !== 'N/A' && assigned !== '' && assigned.trim() !== '';
  }, []);

  // Check if value is assigned (for individual field checks - handles both string values and lead objects)
  const isValueAssigned = useCallback((value) => {
    if (value === null || value === undefined) return false;
    
    // If it's a string value (like lead.assignedSalesperson)
    if (typeof value === 'string') {
      return value !== 'Unassigned' && value !== 'N/A' && value !== '' && value.trim() !== '';
    }
    
    // If it's a lead object, use isLeadAssigned
    if (typeof value === 'object') {
      return isLeadAssigned(value);
    }
    
    return false;
  }, [isLeadAssigned]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setColumnFilters({
      customerId: '',
      customer: '',
      business: '',
      address: '',
      state: '',
      phone: '',
      email: '',
      gstNo: '',
      leadSource: '',
      productNames: '',
      category: '',
      followUpStatus: '',
      salesStatus: '',
      telecallerStatus: '',
      paymentStatus: '',
      createdAt: '',
      updatedAt: ''
    });
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setAssignedSalespersonFilter('');
    setAssignedTelecallerFilter('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(columnFilters).some(filter => filter !== '') || 
           debouncedSearchTerm !== '' || 
           assignedSalespersonFilter !== '' || 
           assignedTelecallerFilter !== '';
  }, [columnFilters, debouncedSearchTerm, assignedSalespersonFilter, assignedTelecallerFilter]);

  const totalPages = Math.ceil(total / limit);

  // Cache for enquiries (keyed by page and filters)
  const enquiriesCacheRef = useRef(new Map());
  const ENQUIRIES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const fetchEnquiriesAbortControllerRef = useRef(null);

  // Fetch enquiries for SuperAdmin - OPTIMIZED with pagination and parallel API calls
  const fetchEnquiries = useCallback(async (forceRefresh = false, page = enquiryPage, limit = enquiryLimit) => {
    if (activeTab !== 'enquiry') return;
    
    // Cancel previous request
    if (fetchEnquiriesAbortControllerRef.current) {
      fetchEnquiriesAbortControllerRef.current.abort();
    }
    fetchEnquiriesAbortControllerRef.current = new AbortController();
    
    // Create cache key from page, limit, and filters
    const cacheKey = JSON.stringify({ page, limit, filters: enquiryFilters });
    const now = Date.now();
    
    // Check cache
    const cached = enquiriesCacheRef.current.get(cacheKey);
    if (!forceRefresh && cached && cached.timestamp && (now - cached.timestamp) < ENQUIRIES_CACHE_DURATION) {
      setEnquiries(cached.data.enquiries || []);
      setEnquiriesGroupedByDate(cached.data.groupedByDate || {});
      setEnquiryTotal(cached.data.total || 0);
      return;
    }
    
    setEnquiriesLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (enquiryFilters.enquiry_date) params.append('enquiryDate', enquiryFilters.enquiry_date);
      
      // Fetch paginated data and grouped data in parallel
      const groupedParams = new URLSearchParams();
      if (enquiryFilters.enquiry_date) groupedParams.append('enquiryDate', enquiryFilters.enquiry_date);
      
      const [paginatedResponse, groupedResponse] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.ENQUIRIES_SUPERADMIN()}?${params.toString()}`),
        apiClient.get(`${API_ENDPOINTS.ENQUIRIES_SUPERADMIN()}?${groupedParams.toString()}`)
      ]);
      
      if (paginatedResponse.success && groupedResponse.success) {
        const enquiriesData = {
          enquiries: paginatedResponse.data?.enquiries || [],
          groupedByDate: groupedResponse.data?.groupedByDate || {},
          total: paginatedResponse.data?.pagination?.total || 0
        };
        
        // Update cache
        enquiriesCacheRef.current.set(cacheKey, {
          data: enquiriesData,
          timestamp: now
        });
        
        setEnquiries(enquiriesData.enquiries);
        setEnquiriesGroupedByDate(enquiriesData.groupedByDate);
        setEnquiryTotal(enquiriesData.total);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching enquiries:', error);
        apiErrorHandler.handleError(error, 'fetch enquiries');
      }
    } finally {
      setEnquiriesLoading(false);
      fetchEnquiriesAbortControllerRef.current = null;
    }
  }, [activeTab, enquiryPage, enquiryLimit, enquiryFilters]);

  // Fetch enquiries when tab changes or pagination/filters change
  useEffect(() => {
    if (activeTab === 'enquiry') {
      fetchEnquiries(false, enquiryPage, enquiryLimit);
    }
  }, [activeTab, enquiryPage, enquiryLimit, fetchEnquiries]);

  // Handle enquiry edit
  const handleEditEnquiry = useCallback((enquiry) => {
    toastManager.info('Edit functionality coming soon');
  }, []);

  // Handle enquiry delete
  const handleDeleteEnquiry = async (enquiryId) => {
    try {
      setEnquiriesLoading(true);
      const response = await apiClient.delete(API_ENDPOINTS.ENQUIRY_DELETE(enquiryId));
      if (response.success) {
        toastManager.success('Enquiry deleted successfully');
        // Clear cache and refetch
        enquiriesCacheRef.current.clear();
        await fetchEnquiries(true, enquiryPage, enquiryLimit);
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      apiErrorHandler.handleError(error, 'delete enquiry');
    } finally {
      setEnquiriesLoading(false);
    }
  };

  // Handle enquiry column visibility
  const toggleEnquiryColumn = (columnKey) => {
    setEnquiryVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const resetEnquiryColumns = () => {
    setEnquiryVisibleColumns({
      customer_name: true,
      business: true,
      state: true,
      division: true,
      address: true,
      enquired_product: true,
      product_quantity: true,
      product_remark: true,
      follow_up_status: false,
      follow_up_remark: false,
      sales_status: false,
      sales_status_remark: false,
      salesperson: false,
      telecaller: false,
      enquiry_date: false
    });
  };

  const showAllEnquiryColumns = () => {
    setEnquiryVisibleColumns({
      customer_name: true,
      business: true,
      state: true,
      division: true,
      address: true,
      enquired_product: true,
      product_quantity: true,
      product_remark: true,
      follow_up_status: true,
      follow_up_remark: true,
      sales_status: true,
      sales_status_remark: true,
      salesperson: true,
      telecaller: true,
      enquiry_date: true
    });
  };

  // Extract unique values from enquiries for filter dropdowns
  const enquiryFilterOptions = useMemo(() => {
    const allEnquiries = Object.values(enquiriesGroupedByDate).flat();
    if (allEnquiries.length === 0 && enquiries.length > 0) {
      allEnquiries.push(...enquiries);
    }
    
    return {
      salespersons: [...new Set(allEnquiries.map(e => e.salesperson).filter(Boolean))].sort(),
      telecallers: [...new Set(allEnquiries.map(e => e.telecaller).filter(Boolean))].sort(),
      states: [...new Set(allEnquiries.map(e => e.state).filter(Boolean))].sort(),
      divisions: [...new Set(allEnquiries.map(e => e.division).filter(Boolean))].sort(),
      followUpStatuses: [...new Set(allEnquiries.map(e => e.follow_up_status).filter(Boolean))].sort(),
      salesStatuses: [...new Set(allEnquiries.map(e => e.sales_status).filter(Boolean))].sort()
    };
  }, [enquiries, enquiriesGroupedByDate]);

  // Optimized enquiry filtering - OPTIMIZED
  // Filter enquiries based on selected filters - OPTIMIZED (client-side filtering on paginated data)
  const filteredEnquiries = useMemo(() => {
    // Use paginated enquiries directly (server-side pagination)
    if (!enquiries.length) return [];
    
    // Apply client-side filters on paginated data
    const hasFilters = Object.values(enquiryFilters).some(v => v && v !== 'enquiry_date'); // Exclude enquiry_date as it's handled server-side
    if (!hasFilters) return enquiries;
    
    return enquiries.filter(enquiry => {
      if (enquiryFilters.salesperson && enquiry.salesperson !== enquiryFilters.salesperson) return false;
      if (enquiryFilters.telecaller && enquiry.telecaller !== enquiryFilters.telecaller) return false;
      if (enquiryFilters.state && enquiry.state !== enquiryFilters.state) return false;
      if (enquiryFilters.division && enquiry.division !== enquiryFilters.division) return false;
      if (enquiryFilters.follow_up_status && enquiry.follow_up_status !== enquiryFilters.follow_up_status) return false;
      if (enquiryFilters.sales_status && enquiry.sales_status !== enquiryFilters.sales_status) return false;
      return true;
    });
  }, [enquiries, enquiryFilters]);

  // Group filtered enquiries by date - use server-side grouped data
  const filteredEnquiriesGroupedByDate = useMemo(() => {
    // Use server-side grouped data if available, otherwise group client-side
    if (Object.keys(enquiriesGroupedByDate).length > 0) {
      return enquiriesGroupedByDate;
    }
    
    // Fallback: group client-side
    const grouped = {};
    filteredEnquiries.forEach(enquiry => {
      const dateKey = enquiry.enquiry_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(enquiry);
    });
    return grouped;
  }, [filteredEnquiries, enquiriesGroupedByDate]);

  // Export enquiries to CSV
  const handleExportEnquiries = () => {
    if (filteredEnquiries.length === 0) {
      toastManager.error('No enquiries to export');
      return;
    }

    const headers = [
      'Customer Name',
      'Business',
      'Address',
      'State',
      'Division',
      'Follow Up Status',
      'Follow Up Remark',
      'Sales Status',
      'Sales Status Remark',
      'Enquired Product',
      'Quantity',
      'Product Remark',
      'Salesperson',
      'Telecaller',
      'Enquiry Date'
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredEnquiries.map(enquiry => [
      escapeCSV(enquiry.customer_name || 'N/A'),
      escapeCSV(enquiry.business || 'N/A'),
      escapeCSV(enquiry.address || 'N/A'),
      escapeCSV(enquiry.state || 'N/A'),
      escapeCSV(enquiry.division || 'N/A'),
      escapeCSV(enquiry.follow_up_status || 'N/A'),
      escapeCSV(enquiry.follow_up_remark || 'N/A'),
      escapeCSV(enquiry.sales_status || 'N/A'),
      escapeCSV(enquiry.sales_status_remark || 'N/A'),
      escapeCSV(enquiry.enquired_product || 'N/A'),
      escapeCSV(enquiry.product_quantity || 'N/A'),
      escapeCSV(enquiry.product_remark || 'N/A'),
      escapeCSV(enquiry.salesperson || 'N/A'),
      escapeCSV(enquiry.telecaller || 'N/A'),
      escapeCSV(enquiry.enquiry_date || 'N/A')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enquiries_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toastManager.success(`Exported ${filteredEnquiries.length} enquiry(ies) to CSV`);
  };

  // Show skeleton loader on initial load
  if (initialLoading) {
    return (
      <div className="p-6 min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="h-10 bg-gray-200 rounded w-96 animate-pulse"></div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
            </div>
          </div>
        </div>
        <SkeletonTable rows={10} />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-t-xl px-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-3 border-b-3 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'leads'
                  ? 'border-blue-600 text-blue-600 bg-gradient-to-t from-blue-50 to-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab('enquiry')}
              className={`py-4 px-3 border-b-3 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'enquiry'
                  ? 'border-purple-600 text-purple-600 bg-gradient-to-t from-purple-50 to-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Enquiry
            </button>
            <button
              onClick={() => setActiveTab('lastCall')}
              className={`py-4 px-3 border-b-3 font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
                activeTab === 'lastCall'
                  ? 'border-green-600 text-green-600 bg-gradient-to-t from-green-50 to-transparent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Phone className="w-4 h-4" />
              Last Call
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'leads' && (
        <>
      {/* Search and Action Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-5 mb-6" style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400 text-sm font-medium shadow-sm transition-all duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              className={`px-5 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm font-semibold shadow-md ${
                hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-blue-500 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              style={{
                boxShadow: hasActiveFilters ? '0 4px 15px rgba(99, 102, 241, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Inter, sans-serif'
              }}
              onClick={() => setShowColumnFilterRow(!showColumnFilterRow)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <button
              className="p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm"
              onClick={() => setShowColumnFilter(true)}
              title="Toggle Columns"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button 
              className="p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm" 
                  onClick={() => fetchLeads(true)}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-6 shadow-md" style={{
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {debouncedSearchTerm && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Search: "{debouncedSearchTerm}"
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearchTerm('');
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {assignedSalespersonFilter && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Salesperson: {assignedSalespersonFilter}
                    <button
                      onClick={() => setAssignedSalespersonFilter('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {assignedTelecallerFilter && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Telecaller: {assignedTelecallerFilter}
                    <button
                      onClick={() => setAssignedTelecallerFilter('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {Object.entries(columnFilters).map(([key, value]) => {
                  if (value) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                    return (
                      <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {label}: {value}
                        <button
                          onClick={() => setColumnFilters(prev => ({ ...prev, [key]: '' }))}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Lead Table */}
      <div className="flex gap-0">
        <LeadTable
          filteredLeads={filteredLeads}
          tableLoading={loading}
          hasStatusFilter={hasActiveFilters}
          visibleColumns={visibleColumns}
          isAllSelected={isAllSelected}
          selectedLeadIds={selectedLeadIds}
          isLeadAssigned={isLeadAssigned}
          isValueAssigned={isValueAssigned}
          getStatusBadge={getStatusBadge}
          toggleSelectAll={toggleSelectAll}
          toggleSelectOne={toggleSelectOne}
          onEdit={handleEdit}
          onViewTimeline={handleViewTimeline}
          onAssign={handleAssign}
          showCustomerTimeline={showCustomerTimeline}
          setShowColumnFilter={setShowColumnFilter}
          allLeadsData={allLeadsData}
          assignedSalespersonFilter={assignedSalespersonFilter}
          assignedTelecallerFilter={assignedTelecallerFilter}
          onAssignedSalespersonFilterChange={setAssignedSalespersonFilter}
          onAssignedTelecallerFilterChange={setAssignedTelecallerFilter}
          usernames={[]}
          columnFilters={columnFilters}
          onColumnFilterChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
          showColumnFilterRow={showColumnFilterRow}
          onToggleColumnFilterRow={() => setShowColumnFilterRow(prev => !prev)}
        />
        
        {/* Customer Timeline */}
        {showCustomerTimeline && timelineLead && (
          <CustomerTimeline
            lead={timelineLead}
            onClose={() => {
              setShowCustomerTimeline(false);
              setTimelineLead(null);
          }}
        />
      )}
              </div>
              
      {/* Pagination */}
      <div className="flex items-center justify-between p-5 border-t-2 border-gray-200 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 mt-4" style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="flex items-center space-x-2 text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-gray-700">Rows per page:</span>
                <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="border-2 border-gray-300 rounded-xl px-3 py-1.5 text-sm font-medium bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
                </select>
          <span className="text-gray-700">Showing <span className="text-blue-600">{filteredLeads.length}</span> of <span className="text-purple-600">{total}</span> leads</span>
              </div>
        <div className="flex items-center space-x-2">
                <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 border-2 rounded-xl font-medium transition-all duration-200 shadow-sm ${
              page === 1
                ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                : 'text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Prev
                </button>
          <span className="text-sm font-semibold text-gray-700 px-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Page <span className="text-blue-600">{page}</span> of <span className="text-purple-600">{totalPages || 1}</span>
          </span>
                <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages || total === 0}
            className={`px-4 py-2 border-2 rounded-xl font-medium transition-all duration-200 shadow-sm ${
              page >= totalPages || total === 0
                ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                : 'text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Next
                </button>
              </div>
                      </div>
        </>
      )}

      {activeTab === 'lastCall' && (
        <>
          {/* Show skeleton loader on initial load */}
          {lastCallInitialLoading ? (
            <DashboardSkeleton />
          ) : (
        <>
          {/* Search and Action Bar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-5 mb-6" style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  className="p-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm"
                  onClick={() => fetchLastCallSummary(true)}
                  disabled={lastCallLoading}
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${lastCallLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Last Call Summary - Grouped by Date */}
          {groupedLastCallSummary.length > 0 ? (
            <div className="space-y-6">
              {groupedLastCallSummary.map((group) => (
                <div key={group.dateKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {new Date(group.dateKey).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesperson</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {group.rows.map((row) => (
                          <React.Fragment key={`${group.dateKey}-${row.salesperson}`}>
                            <tr>
                              <td className="px-4 py-2 text-sm text-gray-700">{row.salesperson}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{row.total_calls}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                <button
                                  onClick={() => {
                                    const key = `${group.dateKey}-${row.salesperson}`;
                                    setExpandedLastCallRows(prev => ({
                                      ...prev,
                                      [key]: !prev[key]
                                    }));
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  {expandedLastCallRows[`${group.dateKey}-${row.salesperson}`] ? 'Hide' : 'View'} ({row.leads?.length || 0})
                                </button>
                              </td>
                            </tr>
                            {expandedLastCallRows[`${group.dateKey}-${row.salesperson}`] && (
                              <tr>
                                <td colSpan={3} className="px-4 py-2 bg-gray-50">
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                      <thead>
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {(row.leads || []).map((lead) => (
                                          <tr key={lead.id}>
                                            <td className="px-3 py-2 text-sm text-gray-700">{lead.customer}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{lead.phone}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{lead.business}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{lead.follow_up_status}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{lead.sales_status}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No last call data</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any last call activities at the moment.
              </p>
            </div>
          )}
          
          {/* Last Call Pagination - Show if we have data */}
          {lastCallTotal > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white rounded-lg shadow-sm mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={lastCallLimit}
                  onChange={(e) => {
                    setLastCallPage(1);
                    setLastCallLimit(Number(e.target.value));
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
                <span>Showing {Math.min(((lastCallPage - 1) * lastCallLimit) + 1, lastCallTotal)} to {Math.min(lastCallPage * lastCallLimit, lastCallTotal)} of {lastCallTotal} rows</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLastCallPage(1)}
                  disabled={lastCallPage === 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLastCallPage(p => Math.max(1, p - 1))}
                  disabled={lastCallPage === 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(lastCallTotal / lastCallLimit)) }, (_, i) => {
                    let pageNum;
                    const totalPages = Math.ceil(lastCallTotal / lastCallLimit);
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (lastCallPage <= 3) {
                      pageNum = i + 1;
                    } else if (lastCallPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = lastCallPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setLastCallPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md border ${
                          lastCallPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <span className="text-sm text-gray-600 px-2">
                  Page {lastCallPage} of {Math.ceil(lastCallTotal / lastCallLimit) || 1}
                </span>
                <button
                  onClick={() => setLastCallPage(p => p < Math.ceil(lastCallTotal / lastCallLimit) ? p + 1 : p)}
                  disabled={lastCallPage >= Math.ceil(lastCallTotal / lastCallLimit)}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLastCallPage(Math.ceil(lastCallTotal / lastCallLimit))}
                  disabled={lastCallPage >= Math.ceil(lastCallTotal / lastCallLimit)}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Customer Timeline */}
          {showCustomerTimeline && timelineLead && (
            <CustomerTimeline
              lead={timelineLead}
              onClose={() => {
                setShowCustomerTimeline(false);
                setTimelineLead(null);
              }}
            />
          )}
            </>
          )}
        </>
      )}

      {activeTab === 'enquiry' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Enquiries</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEnquiryFilters(!showEnquiryFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showEnquiryFilters 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Toggle Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportEnquiries}
                disabled={filteredEnquiries.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => fetchEnquiries(true)}
                disabled={enquiriesLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${enquiriesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters - Collapsible */}
          {showEnquiryFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter by Salesperson */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Salesperson</label>
                  <select
                    value={enquiryFilters.salesperson}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, salesperson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Salespersons</option>
                    {enquiryFilterOptions.salespersons.map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Telecaller */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Telecaller</label>
                  <select
                    value={enquiryFilters.telecaller}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, telecaller: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Telecallers</option>
                    {enquiryFilterOptions.telecallers.map(tc => (
                      <option key={tc} value={tc}>{tc}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by State</label>
                  <select
                    value={enquiryFilters.state}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All States</option>
                    {enquiryFilterOptions.states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Division</label>
                  <select
                    value={enquiryFilters.division}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, division: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Divisions</option>
                    {enquiryFilterOptions.divisions.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Follow Up Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Follow Up Status</label>
                  <select
                    value={enquiryFilters.follow_up_status}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, follow_up_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Follow Up Statuses</option>
                    {enquiryFilterOptions.followUpStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Sales Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Sales Status</label>
                  <select
                    value={enquiryFilters.sales_status}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, sales_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sales Statuses</option>
                    {enquiryFilterOptions.salesStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Enquiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Enquiry Date</label>
                  <input
                    type="date"
                    value={enquiryFilters.enquiry_date}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, enquiry_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setEnquiryFilters({
                      salesperson: '',
                      telecaller: '',
                      state: '',
                      division: '',
                      follow_up_status: '',
                      sales_status: '',
                      enquiry_date: ''
                    })}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {enquiriesLoading && enquiryPage === 1 ? (
            <DashboardSkeleton />
          ) : (
            <>
              <EnquiryTable 
                enquiries={filteredEnquiries} 
                loading={enquiriesLoading}
                groupedByDate={filteredEnquiriesGroupedByDate}
                onRefresh={() => fetchEnquiries(true)}
                onEdit={handleEditEnquiry}
                onDelete={handleDeleteEnquiry}
                visibleColumns={enquiryVisibleColumns}
                onToggleColumnVisibility={() => setShowEnquiryColumnModal(true)}
              />
              
              {/* Enquiry Pagination */}
              {enquiryTotal > 0 && (
                <div className="flex items-center justify-between p-5 border-t-2 border-gray-200 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 mt-4" style={{
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Rows per page:</span>
                    <select
                      value={enquiryLimit}
                      onChange={(e) => {
                        setEnquiryPage(1);
                        setEnquiryLimit(Number(e.target.value));
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                    <span>Showing {((enquiryPage - 1) * enquiryLimit) + 1} to {Math.min(enquiryPage * enquiryLimit, enquiryTotal)} of {enquiryTotal} enquiries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEnquiryPage(1)}
                      disabled={enquiryPage === 1}
                      className="p-2.5 rounded-xl border-2 border-gray-300 text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEnquiryPage(p => Math.max(1, p - 1))}
                      disabled={enquiryPage === 1}
                      className="p-2.5 rounded-xl border-2 border-gray-300 text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(enquiryTotal / enquiryLimit)) }, (_, i) => {
                        let pageNum;
                        const totalPages = Math.ceil(enquiryTotal / enquiryLimit);
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (enquiryPage <= 3) {
                          pageNum = i + 1;
                        } else if (enquiryPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = enquiryPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setEnquiryPage(pageNum)}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-200 shadow-sm ${
                              enquiryPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600'
                            }`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-sm text-gray-600 px-2">
                      Page {enquiryPage} of {Math.ceil(enquiryTotal / enquiryLimit) || 1}
                    </span>
                    <button
                      onClick={() => setEnquiryPage(p => p < Math.ceil(enquiryTotal / enquiryLimit) ? p + 1 : p)}
                      disabled={enquiryPage >= Math.ceil(enquiryTotal / enquiryLimit)}
                      className="p-2.5 rounded-xl border-2 border-gray-300 text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEnquiryPage(Math.ceil(enquiryTotal / enquiryLimit))}
                      disabled={enquiryPage >= Math.ceil(enquiryTotal / enquiryLimit)}
                      className="p-2.5 rounded-xl border-2 border-gray-300 text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      title="Last page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Column Visibility Modal */}
          {showEnquiryColumnModal && (
            <ColumnFilterModal
              isOpen={showEnquiryColumnModal}
              onClose={() => setShowEnquiryColumnModal(false)}
              visibleColumns={enquiryVisibleColumns}
              onToggleColumn={toggleEnquiryColumn}
              onResetColumns={resetEnquiryColumns}
              onShowAllColumns={showAllEnquiryColumns}
              columnLabels={{
                customer_name: 'Customer Name',
                business: 'Business',
                state: 'State',
                division: 'Division',
                address: 'Address',
                enquired_product: 'Enquired Product',
                product_quantity: 'Quantity',
                product_remark: 'Product Remark',
                follow_up_status: 'Follow Up Status',
                follow_up_remark: 'Follow Up Remark',
                sales_status: 'Sales Status',
                sales_status_remark: 'Sales Status Remark',
                salesperson: 'Salesperson',
                telecaller: 'Telecaller',
                enquiry_date: 'Enquiry Date'
              }}
            />
          )}
        </div>
      )}

      {/* Column Filter Modal */}
      <ColumnFilterModal
        isOpen={showColumnFilter}
        onClose={() => setShowColumnFilter(false)}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onResetColumns={resetColumns}
        onShowAllColumns={showAllColumns}
      />
    </div>
  );
};

export default AllLeads;
