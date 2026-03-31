import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FileText, Package, RefreshCw, Filter, Phone, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Activity, X, Ban } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import QuotationPreview from '../../components/QuotationPreview';
import PIPreview from '../../components/PIPreview';
import CustomerDetailSidebar from '../../components/salesperson/CustomerDetailSidebar';
import SendEmailForm from '../../components/salesperson/SendEmailForm';
import UploadDocs from '../../components/salesperson/UploadDocs';
import FilterBadges from '../../components/FilterBadges';
import SearchBar from '../../components/SearchBar';
import LeadTable from '../../components/LeadTable';
import LeadFilters from '../../components/salesperson/LeadFilters';
import ColumnFilterModal from '../../components/ColumnFilterModal';
import EditLeadModal from '../../components/EditLeadModal';
import AssignLeadModal from '../../components/AssignLeadModal';
import ImportCSVModal from '../../components/ImportCSVModal';
import ImportPreviewModal from '../../components/ImportPreviewModal';
import LeadPreviewDrawer from '../../components/LeadPreviewDrawer';
import OrderCancelApprovals from './OrderCancelApprovals';
import apiErrorHandler from '../../utils/ApiErrorHandler';
import toastManager from '../../utils/ToastManager';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import { LeadsFilterService, IDMatcher } from '../../services/LeadsFilterService';
import LeadService from '../../services/LeadService';
import UserService from '../../services/UserService';
import PIService from '../../services/PIService';
import QuotationService from '../../services/QuotationService';
import { generateQuotationPDF } from '../../utils/pdfUtils';
import { downloadCSVTemplate, parseCSV, exportToExcel, formatDate } from '../../utils/csvUtils';
import { getStatusBadge as getStatusBadgeUtil } from '../../utils/statusUtils';
import { calculateAssignedCounts, getUnassignedLeadIds, filterLeads } from '../../utils/leadFilters';
import { COMPANY_BRANCHES, DEFAULT_USER, DEFAULT_BRANCH } from '../../config/appConfig';
import { useAuth } from '../../hooks/useAuth';
import CSVImportValidationService from '../../services/CSVImportValidationService';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import EnquiryTable from '../../components/EnquiryTable';
import departmentHeadService from '../../api/admin_api/departmentHeadService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';
import { DASHBOARD_FILTER_KEY } from '../salesperson/dashboard/utils/dashboardNavigation';

const DEFAULT_COLUMN_FILTERS = {
  customerId: '',
  customer: '',
  business: '',
  address: '',
  state: '',
  division: '',
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
};

const DEFAULT_ENQUIRY_FILTERS = {
  salesperson: '',
  telecaller: '',
  state: '',
  division: '',
  follow_up_status: '',
  sales_status: '',
  enquiry_date: ''
};

const DEFAULT_ENQUIRY_VISIBLE_COLUMNS = {
  customer_name: true,
  business: true,
  state: true,
  division: true,
  generated_by: true,
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
};

const ALL_ENQUIRY_VISIBLE_COLUMNS = {
  ...DEFAULT_ENQUIRY_VISIBLE_COLUMNS,
  follow_up_status: true,
  follow_up_remark: true,
  sales_status: true,
  sales_status_remark: true,
  salesperson: true,
  telecaller: true,
  enquiry_date: true
};

const DEFAULT_VISIBLE_COLUMNS = {
  customerId: false,
  customer: true,
  business: true,
  address: true,
  state: true,
  division: false,
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
};

const LeadsSimplified = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [dashboardFilterPayload, setDashboardFilterPayload] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DASHBOARD_FILTER_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw);
      sessionStorage.removeItem(DASHBOARD_FILTER_KEY);
      setDashboardFilterPayload(payload || null);
      if (payload?.filter === 'last_call') setActiveTab('lastCall');
      else if (payload?.filter === 'enquiries') setActiveTab('enquiry');
      else setActiveTab('leads');
    } catch (_) {}
  }, []);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesGroupedByDate, setEnquiriesGroupedByDate] = useState({});
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiryPage, setEnquiryPage] = useState(1);
  const [enquiryLimit, setEnquiryLimit] = useState(50);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  
  const [enquiryFilters, setEnquiryFilters] = useState(DEFAULT_ENQUIRY_FILTERS);
  const [showEnquiryFilters, setShowEnquiryFilters] = useState(false);
  
  const [enquiryVisibleColumns, setEnquiryVisibleColumns] = useState(DEFAULT_ENQUIRY_VISIBLE_COLUMNS);
  const [showEnquiryColumnModal, setShowEnquiryColumnModal] = useState(false);
  const [showEnquiryEditModal, setShowEnquiryEditModal] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [enquiryEditForm, setEnquiryEditForm] = useState({
    customer_name: '',
    business: '',
    address: '',
    state: '',
    division: '',
    enquired_product: '',
    product_quantity: '',
    product_remark: '',
    follow_up_status: '',
    follow_up_remark: '',
    sales_status: '',
    sales_status_remark: '',
    salesperson: '',
    telecaller: ''
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLead, setPreviewLead] = useState(null);
  const [showCustomerTimeline, setShowCustomerTimeline] = useState(false);
  const [timelineLead, setTimelineLead] = useState(null);
  const [quotationCounts, setQuotationCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [piCounts, setPiCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loadingCounts, setLoadingCounts] = useState(false);
  /** DH: Pending order cancel & PI amendment counts (notification pills) */
  const [orderCancelPendingCount, setOrderCancelPendingCount] = useState(0);
  const [piAmendmentPendingCount, setPiAmendmentPendingCount] = useState(0);
  const [loadingApprovalCounts, setLoadingApprovalCounts] = useState(false);
  const [statusFilter, setStatusFilter] = useState({ type: null, status: null });
  const [assignmentFilter, setAssignmentFilter] = useState(null);
  const [filteredCustomerIds, setFilteredCustomerIds] = useState(new Set());
  const [columnFilters, setColumnFilters] = useState(DEFAULT_COLUMN_FILTERS);
  const [showColumnFilterRow, setShowColumnFilterRow] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [assignForm, setAssignForm] = useState({ salesperson: '', telecaller: '' });
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    tag: '', followUpStatus: '', salesStatus: '', state: '', leadSource: '', productType: '', dateFrom: '', dateTo: ''
  });
  const [enabledFilters, setEnabledFilters] = useState({
    tag: false, followUpStatus: false, salesStatus: false, state: false, leadSource: false, productType: false, dateRange: false
  });
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [editFormData, setEditFormData] = useState({
    customer: '',
    email: '',
    business: '',
    address: '',
    state: '',
    division: '',
    leadSource: '',
    category: '',
    salesStatus: '',
    phone: '',
    gstNo: '',
    productNames: '',
    assignedSalesperson: '',
    assignedTelecaller: '',
    telecallerStatus: '',
    paymentStatus: ''
  });
  const [usernames, setUsernames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [loadingPIs, setLoadingPIs] = useState(false);
  const [allLeadsData, setAllLeadsData] = useState([]);
  const [loadingAllLeads, setLoadingAllLeads] = useState(false);
  const [allLeadsRefreshKey, setAllLeadsRefreshKey] = useState(0);
  const allLeadsFetchPromiseRef = useRef(null);
  const allLeadsDataRef = useRef([]);
  const [showPIPreview, setShowPIPreview] = useState(false);
  const [piPreviewData, setPiPreviewData] = useState(null);

  // Activity viewing states
  const [viewingActivity, setViewingActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // DH: Order Cancel & PI Amendment approvals (inside lead drawer)
  const [pendingOrderCancels, setPendingOrderCancels] = useState([]);
  const [pendingRevisedPIs, setPendingRevisedPIs] = useState([]);
  const [loadingOrderCancels, setLoadingOrderCancels] = useState(false);
  const [loadingRevisedPIs, setLoadingRevisedPIs] = useState(false);
  
  // Last Call pagination state
  const [lastCallPage, setLastCallPage] = useState(1);
  const [lastCallLimit, setLastCallLimit] = useState(50);
  const [lastCallTotal, setLastCallTotal] = useState(0);
  const [lastCallSummaryData, setLastCallSummaryData] = useState([]);
  const [lastCallLoading, setLastCallLoading] = useState(false);
  const [lastCallInitialLoading, setLastCallInitialLoading] = useState(false);
  const [expandedLastCallRows, setExpandedLastCallRows] = useState({});
  
  // Cache for enquiries and last call
  const enquiriesCacheRef = useRef(new Map());
  const lastCallCacheRef = useRef(new Map());
  const ENQUIRIES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const LAST_CALL_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const fetchEnquiriesAbortControllerRef = useRef(null);
  const fetchLastCallAbortControllerRef = useRef(null);
  const statusFilterLeadsRef = useRef([]);

  const importFileInputRef = useRef(null);

  const leadService = useMemo(() => new LeadService(), []);
  const userService = useMemo(() => new UserService(), []);
  const piService = useMemo(() => new PIService(), []);
  const quotationServiceInstance = useMemo(() => new QuotationService(), []);
  const leadsFilterService = useMemo(() => new LeadsFilterService(apiClient), []);

  const fetchEnquiries = useCallback(async (forceRefresh = false, page = enquiryPage, limit = enquiryLimit) => {
    if (activeTab !== 'enquiry') return;
    
    if (fetchEnquiriesAbortControllerRef.current) {
      fetchEnquiriesAbortControllerRef.current.abort();
    }
    fetchEnquiriesAbortControllerRef.current = new AbortController();
    
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
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (enquiryFilters.enquiry_date) params.append('enquiryDate', enquiryFilters.enquiry_date);
      
      const groupedParams = new URLSearchParams();
      if (enquiryFilters.enquiry_date) groupedParams.append('enquiryDate', enquiryFilters.enquiry_date);

      const isSuperAdmin = (user?.role || '').toLowerCase() === 'superadmin';
      const enquiriesEndpoint = isSuperAdmin
        ? API_ENDPOINTS.ENQUIRIES_SUPERADMIN()
        : API_ENDPOINTS.ENQUIRIES_DEPARTMENT_HEAD();
      
      const [paginatedResponse, groupedResponse] = await Promise.all([
        apiClient.get(`${enquiriesEndpoint}?${params.toString()}`),
        apiClient.get(`${enquiriesEndpoint}?${groupedParams.toString()}`)
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
  }, [activeTab, enquiryPage, enquiryLimit, enquiryFilters, user?.role]);

  // Fetch enquiries when tab changes or pagination/filters change
  useEffect(() => {
    if (activeTab === 'enquiry') {
      fetchEnquiries(false, enquiryPage, enquiryLimit);
    }
  }, [activeTab, enquiryPage, enquiryLimit, fetchEnquiries]);

  // Define loadAllLeadsForFilters before fetchLastCallLeads to avoid initialization error
  const loadAllLeadsForFiltersRef = useRef(null);
  
  const fetchLastCallSummary = useCallback(async (forceRefresh = false, page = lastCallPage, limit = lastCallLimit) => {
    if (activeTab !== 'lastCall') return;
    
    if (fetchLastCallAbortControllerRef.current) {
      fetchLastCallAbortControllerRef.current.abort();
    }
    fetchLastCallAbortControllerRef.current = new AbortController();
    
    const cacheKey = `summary-${page}-${limit}-${user?.departmentType || 'all'}`;
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
      
      const params = {
        limit,
        page
      };
      
      if (user?.departmentType) {
        params.departmentType = user.departmentType;
      }
      
      const response = await departmentHeadService.getLastCallSummary(params);
      const summary = response?.data || [];
      const resolvedTotal = response?.pagination?.total || 0;
      
      lastCallCacheRef.current.set(cacheKey, {
        data: summary,
        total: resolvedTotal,
        timestamp: now
      });
      
      setLastCallSummaryData(summary);
      setLastCallTotal(resolvedTotal);
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
  }, [activeTab, lastCallPage, lastCallLimit, user?.departmentType]);

  useEffect(() => {
    if (activeTab === 'lastCall') {
      fetchLastCallSummary(false, lastCallPage, lastCallLimit);
    }
  }, [activeTab, lastCallPage, lastCallLimit, fetchLastCallSummary]);

  const enquiryFilterOptions = useMemo(() => {
    const allEnquiries = Object.values(enquiriesGroupedByDate).flat();
    if (allEnquiries.length === 0 && enquiries.length > 0) {
      allEnquiries.push(...enquiries);
    }
    
    const followUpFromData = [...new Set(allEnquiries.map(e => e.follow_up_status).filter(Boolean))];
    const salesFromData = [...new Set(allEnquiries.map(e => e.sales_status).filter(Boolean))];
    
    // Use salesperson_name for display, but store both name and username for filtering
    const salespersonOptions = [...new Set(allEnquiries.map(e => e.salesperson_name || e.salesperson).filter(Boolean))].sort();
    
    return {
      salespersons: salespersonOptions,
      telecallers: [...new Set(allEnquiries.map(e => e.telecaller).filter(Boolean))].sort(),
      states: [...new Set(allEnquiries.map(e => e.state).filter(Boolean))].sort(),
      divisions: [...new Set(allEnquiries.map(e => e.division).filter(Boolean))].sort(),
      followUpStatuses: [...new Set([...followUpFromData, 'pending'])].sort(),
      salesStatuses: [...new Set([...salesFromData, 'pending'])].sort()
    };
  }, [enquiries, enquiriesGroupedByDate]);

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

  const filteredEnquiries = useMemo(() => {
    // Use paginated enquiries directly (server-side pagination)
    if (!enquiries.length) return [];
    
    // Apply client-side filters on paginated data
    const hasFilters = enquiryFilters.salesperson || enquiryFilters.telecaller || 
                       enquiryFilters.state || enquiryFilters.division || 
                       enquiryFilters.follow_up_status || enquiryFilters.sales_status ||
                       enquiryFilters.enquiry_date;
    
    if (!hasFilters) return enquiries;
    
    return enquiries.filter(enquiry => {
      // Match by salesperson_name or salesperson field
      if (enquiryFilters.salesperson) {
        const salespersonMatch = (enquiry.salesperson_name || enquiry.salesperson) === enquiryFilters.salesperson;
        if (!salespersonMatch) return false;
      }
      if (enquiryFilters.telecaller && enquiry.telecaller !== enquiryFilters.telecaller) return false;
      if (enquiryFilters.state && enquiry.state !== enquiryFilters.state) return false;
      if (enquiryFilters.division && enquiry.division !== enquiryFilters.division) return false;
      if (enquiryFilters.follow_up_status && enquiry.follow_up_status !== enquiryFilters.follow_up_status) return false;
      if (enquiryFilters.sales_status && enquiry.sales_status !== enquiryFilters.sales_status) return false;
      
      // Filter by enquiry date
      if (enquiryFilters.enquiry_date) {
        const enquiryDate = enquiry.enquiry_date || enquiry.created_at;
        if (!enquiryDate) return false;
        
        // Extract date part (YYYY-MM-DD) from enquiry date
        const enquiryDateStr = enquiryDate.split('T')[0];
        if (enquiryDateStr !== enquiryFilters.enquiry_date) return false;
      }
      
      return true;
    });
  }, [enquiries, enquiryFilters]);

  // Group filtered enquiries by date - apply filters to grouped data
  const filteredEnquiriesGroupedByDate = useMemo(() => {
    // Apply filters to grouped data
    const hasFilters = enquiryFilters.salesperson || enquiryFilters.telecaller || 
                       enquiryFilters.state || enquiryFilters.division || 
                       enquiryFilters.follow_up_status || enquiryFilters.sales_status ||
                       enquiryFilters.enquiry_date;
    
    if (!hasFilters) {
      return enquiriesGroupedByDate;
    }
    
    // Filter each date group
    const filtered = {};
    Object.keys(enquiriesGroupedByDate).forEach(dateKey => {
      const dateEnquiries = enquiriesGroupedByDate[dateKey];
      const filteredDateEnquiries = dateEnquiries.filter(enquiry => {
        // Match by salesperson_name or salesperson field
        if (enquiryFilters.salesperson) {
          const salespersonMatch = (enquiry.salesperson_name || enquiry.salesperson) === enquiryFilters.salesperson;
          if (!salespersonMatch) return false;
        }
        if (enquiryFilters.telecaller && enquiry.telecaller !== enquiryFilters.telecaller) return false;
        if (enquiryFilters.state && enquiry.state !== enquiryFilters.state) return false;
        if (enquiryFilters.division && enquiry.division !== enquiryFilters.division) return false;
        if (enquiryFilters.follow_up_status && enquiry.follow_up_status !== enquiryFilters.follow_up_status) return false;
        if (enquiryFilters.sales_status && enquiry.sales_status !== enquiryFilters.sales_status) return false;
        
        // Filter by enquiry date
        if (enquiryFilters.enquiry_date) {
          const enquiryDate = enquiry.enquiry_date || enquiry.created_at;
          if (!enquiryDate) return false;
          
          // Extract date part (YYYY-MM-DD) from enquiry date
          const enquiryDateStr = enquiryDate.split('T')[0];
          if (enquiryDateStr !== enquiryFilters.enquiry_date) return false;
        }
        
        return true;
      });
      
      if (filteredDateEnquiries.length > 0) {
        filtered[dateKey] = filteredDateEnquiries;
      }
    });
    
    return filtered;
  }, [enquiriesGroupedByDate, enquiryFilters]);

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

  const handleEditEnquiry = (enquiry) => {
    setEditingEnquiry(enquiry);
    setEnquiryEditForm({
      customer_name: enquiry.customer_name || '',
      business: enquiry.business || '',
      address: enquiry.address || '',
      state: enquiry.state || '',
      division: enquiry.division || '',
      enquired_product: enquiry.enquired_product || '',
      product_quantity: enquiry.product_quantity || '',
      product_remark: enquiry.product_remark || '',
      follow_up_status: enquiry.follow_up_status || '',
      follow_up_remark: enquiry.follow_up_remark || '',
      sales_status: enquiry.sales_status || '',
      sales_status_remark: enquiry.sales_status_remark || '',
      salesperson: enquiry.salesperson || '',
      telecaller: enquiry.telecaller || ''
    });
    setShowEnquiryEditModal(true);
  };

  const handleSaveEnquiryEdit = async () => {
    if (!editingEnquiry?.id) return;
    try {
      setEnquiriesLoading(true);
      const payload = {
        customer_name: enquiryEditForm.customer_name,
        business: enquiryEditForm.business,
        address: enquiryEditForm.address,
        state: enquiryEditForm.state,
        division: enquiryEditForm.division,
        enquired_product: enquiryEditForm.enquired_product,
        product_quantity: enquiryEditForm.product_quantity,
        product_remark: enquiryEditForm.product_remark,
        follow_up_status: enquiryEditForm.follow_up_status,
        follow_up_remark: enquiryEditForm.follow_up_remark,
        sales_status: enquiryEditForm.sales_status,
        sales_status_remark: enquiryEditForm.sales_status_remark,
        salesperson: enquiryEditForm.salesperson,
        telecaller: enquiryEditForm.telecaller
      };
      const response = await apiClient.put(API_ENDPOINTS.ENQUIRY_UPDATE(editingEnquiry.id), payload);
      if (response.success) {
        toastManager.success('Enquiry updated successfully');
        setShowEnquiryEditModal(false);
        setEditingEnquiry(null);
        enquiriesCacheRef.current.clear();
        await fetchEnquiries(true, enquiryPage, enquiryLimit);
      }
    } catch (error) {
      apiErrorHandler.handleError(error, 'update enquiry');
    } finally {
      setEnquiriesLoading(false);
    }
  };

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

  const toggleEnquiryColumn = (columnKey) => {
    setEnquiryVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const resetEnquiryColumns = () => {
    setEnquiryVisibleColumns(DEFAULT_ENQUIRY_VISIBLE_COLUMNS);
  };

  const showAllEnquiryColumns = () => {
    setEnquiryVisibleColumns(ALL_ENQUIRY_VISIBLE_COLUMNS);
  };

  const fetchQuotations = async (leadId) => {
    setLoadingQuotations(true);
    try {
      const quotations = await quotationServiceInstance.fetchQuotationsByCustomer(leadId);
      setQuotations(quotations);
    } finally {
      setLoadingQuotations(false);
    }
  };

  const handleApproveQuotation = async (quotationId) => {
    const previewLeadId = previewLead?.id || null;
    const updatedQuotations = await quotationServiceInstance.approveQuotation(quotationId, previewLeadId);
    if (updatedQuotations.length > 0) {
      setQuotations(updatedQuotations);
    }
  };

  const buildPreviewQuotation = (dbQuotation) => {
    if (!dbQuotation) return null;

    // Normalized shape compatible with QuotationPreview / QuotationDataMapper
    return {
      // Core identifiers
      id: dbQuotation.id,
      quotationNumber: dbQuotation.quotation_number,
      quotationDate: dbQuotation.quotation_date,
      validUpto: dbQuotation.valid_until,
      selectedBranch: dbQuotation.branch || DEFAULT_BRANCH,
      template: dbQuotation.template || '',

      // Customer / bill-to
      customerId: dbQuotation.customer_id,
      billTo: typeof dbQuotation.bill_to === 'string'
        ? JSON.parse(dbQuotation.bill_to)
        : (dbQuotation.bill_to || {
            business: dbQuotation.customer_business,
            buyerName: dbQuotation.customer_business,
            address: dbQuotation.customer_address,
            phone: dbQuotation.customer_phone,
            gstNo: dbQuotation.customer_gst_no,
            state: dbQuotation.customer_state
          }),

      // Line items
      items: (dbQuotation.items || []).map(i => ({
        productName: i.product_name || i.productName,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit || 'Nos',
        buyerRate: i.unit_price || i.buyerRate,
        unitPrice: i.unit_price || i.buyerRate,
        amount: i.taxable_amount || i.amount,
        total: i.total_amount || i.total,
        hsn: i.hsn_code || i.hsn,
        hsnCode: i.hsn_code || i.hsn,
        gstRate: i.gst_rate || i.gstRate || 18,
        remark: i.remark || '',
        product_remark: i.remark || ''
      })),

      // Financial summary
      subtotal: parseFloat(dbQuotation.subtotal || 0),
      discountRate: parseFloat(dbQuotation.discount_rate || 0),
      discountAmount: parseFloat(dbQuotation.discount_amount || 0),
      taxRate: parseFloat(dbQuotation.tax_rate || 0),
      taxAmount: parseFloat(dbQuotation.tax_amount || 0),
      total: parseFloat(dbQuotation.total_amount || 0),

      // Extra fields used by templates
      paymentMode: dbQuotation.payment_mode || '',
      transportTc: dbQuotation.transport_tc || '',
      dispatchThrough: dbQuotation.dispatch_through || '',
      deliveryTerms: dbQuotation.delivery_terms || '',
      materialType: dbQuotation.material_type || '',
      bankDetails: typeof dbQuotation.bank_details === 'string'
        ? JSON.parse(dbQuotation.bank_details)
        : dbQuotation.bank_details,
      termsSections: typeof dbQuotation.terms_sections === 'string'
        ? JSON.parse(dbQuotation.terms_sections)
        : dbQuotation.terms_sections,

      // Status
      status: dbQuotation.status
    };
  };

  const handleRejectQuotation = async (quotationId) => {
    const previewLeadId = previewLead?.id || null;
    const updatedQuotations = await quotationServiceInstance.rejectQuotation(quotationId, previewLeadId);
    if (updatedQuotations.length > 0) {
      setQuotations(updatedQuotations);
    }
  };

  const handleViewQuotation = async (quotationId) => {
    try {
      const dbQuotation = await quotationServiceInstance.getQuotation(quotationId);
      if (!dbQuotation) {
        toastManager.error('Failed to load quotation details');
        return;
      }
      const normalized = buildPreviewQuotation(dbQuotation);
      if (!normalized) {
        toastManager.error('Unable to prepare quotation for preview');
        return;
      }
      setSelectedQuotation(normalized);
      setShowQuotationModal(true);
    } catch (error) {
      apiErrorHandler.handleError(error, 'view quotation');
    }
  };

  const handleDownloadPDF = async (quotationId) => {
    const quotation = await quotationServiceInstance.getQuotation(quotationId);
    if (quotation) {
      await generateQuotationPDF(quotation);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const parsedData = parseCSV(csvText);
        setImportPreview(parsedData);
        setShowImportModal(true);
        if (importFileInputRef.current) {
          importFileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } else {
      toastManager.error('Please select a valid CSV file');
    }
  };

  const handleImportLeads = async () => {
    if (importPreview.length === 0) {
      toastManager.error('No data to import');
      return;
    }

    if (!user?.id) {
      toastManager.error('User information not available. Please refresh and try again.');
      return;
    }

    setImporting(true);

    try {
      // Initialize validation service
      const validationService = new CSVImportValidationService(user.id);
      await validationService.initialize();

      // Build initial payloads - STRICT: filter out null payloads (invalid rows)
      const validationErrors = [];
      const initialPayloads = importPreview
        .map((row, index) => {
          const payload = leadService.buildCSVLeadPayload(row, index, validationErrors);
          if (!payload) {
            return null; // Row was skipped due to validation
          }
          payload.date = formatDate(row['Date (DD/MM/YYYY or YYYY-MM-DD)'] || row['Date (YYYY-MM-DD)'] || row['Date'] || '');
          return payload;
        })
        .filter(payload => payload !== null); // Remove null payloads (skipped rows)

      // Show initial validation errors (from buildCSVLeadPayload)
      if (validationErrors.length > 0) {
        const errorPreview = validationErrors.slice(0, 3).join('; ');
        const errorMsg = `${validationErrors.length} row(s) skipped due to validation errors. Examples: ${errorPreview}${validationErrors.length > 3 ? ` and ${validationErrors.length - 3} more...` : ''}`;
        toastManager.warning(errorMsg);
      }

      // Validate and process leads (further validation)
      const validLeads = validationService.processLeads(initialPayloads);
      const summary = validationService.getSummary();

      // Show validation summary
      const frontendSkipped = validationErrors.length + summary.skippedCount;
      if (frontendSkipped > 0) {
        const skippedMsg = `${frontendSkipped} lead(s) skipped due to validation errors`;
        const allErrors = [...validationErrors, ...summary.errors];
        const errorPreview = allErrors.slice(0, 3).join('; ');
        const fullMsg = errorPreview 
          ? `${skippedMsg}. Examples: ${errorPreview}${allErrors.length > 3 ? ` and ${allErrors.length - 3} more...` : ''}`
          : skippedMsg;
        toastManager.warning(fullMsg);
      }

      if (validLeads.length === 0) {
        toastManager.error('No valid leads to import. Please check your CSV data.');
        setImporting(false);
        return;
      }

      const importResult = await leadService.importLeads(validLeads);
      const response = await leadService.fetchLeads({ page, limit });
      if (response.data) {
        setLeadsData(response.data);
        if (response.pagination) {
          setTotal(Number(response.pagination.total) || 0);
        }
        if (hasActiveLeadFilters()) {
          requestAllLeadsRefresh();
        }
      }

      const totalSkipped = validationErrors.length + summary.skippedCount + (importResult?.data?.skippedCount || 0);
      const backendSkipped = importResult?.data?.skippedRows || [];
      const allSkippedReasons = [
        ...validationErrors,
        ...summary.errors,
        ...backendSkipped.map(s => `Row ${s.row}: ${s.reason}`)
      ];
      
      if (totalSkipped > 0) {
        const errorPreview = allSkippedReasons.slice(0, 5).join('; ');
        const warningMsg = `${totalSkipped} row(s) skipped due to validation errors. Examples: ${errorPreview}${allSkippedReasons.length > 5 ? ` and ${allSkippedReasons.length - 5} more...` : ''}`;
        toastManager.warning(warningMsg);
      }
      
      const importedCount = importResult?.data?.importedCount || validLeads.length;
      const successMsg = `Successfully imported ${importedCount} lead(s)`;
      toastManager.success(successMsg);
      
      setShowImportModal(false);
      setImportPreview([]);
      if (importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('CSV Import Error:', error);
      apiErrorHandler.handleError(error, 'import leads');
      toastManager.error(`Failed to import leads: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };


  const requestAllLeadsRefresh = useCallback(() => {
    setAllLeadsRefreshKey((prev) => prev + 1);
  }, []);

  const hasActiveLeadFilters = useCallback(() => (
    Boolean(statusFilter.type || assignmentFilter) ||
    Object.values(columnFilters).some(Boolean) ||
    Object.values(enabledFilters).some(Boolean)
  ), [statusFilter.type, assignmentFilter, columnFilters, enabledFilters]);

  const buildLeadFetchParams = useCallback(() => {
    const params = { page };
    params.limit = Math.max(1, Number(limit) || 20);
    const trimmedSearch = debouncedSearchTerm.trim();
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }
    return params;
  }, [page, limit, debouncedSearchTerm]);

  const normalizeLeadDateFields = useCallback((lead) => ({
    ...lead,
    follow_up_date: lead.follow_up_date || lead.followUpDate || null,
    follow_up_time: lead.follow_up_time || lead.followUpTime || null,
    follow_up_remark: lead.follow_up_remark || lead.followUpRemark || null,
    follow_up_status: lead.follow_up_status || lead.followUpStatus || null,
    next_meeting_date: lead.next_meeting_date || lead.nextMeetingDate || null,
    next_meeting_time: lead.next_meeting_time || lead.nextMeetingTime || null,
    meeting_date: lead.meeting_date || lead.meetingDate || null,
    meeting_time: lead.meeting_time || lead.meetingTime || null,
    scheduled_date: lead.scheduled_date || lead.scheduledDate || null,
    scheduled_time: lead.scheduled_time || lead.scheduledTime || null,
    sales_status: lead.sales_status || lead.salesStatus || null,
    sales_status_remark: lead.sales_status_remark || lead.salesStatusRemark || null,
    updated_at: lead.updated_at || lead.updatedAt || null
  }), []);

  const applyLeadResponse = useCallback((response, { refreshAll = false } = {}) => {
    if (!response?.data) return;
    const leadsWithDates = response.data.map(normalizeLeadDateFields);
    setLeadsData(leadsWithDates);
    if (response.pagination) {
      setTotal(Number(response.pagination.total) || 0);
    }
    if (refreshAll) {
      requestAllLeadsRefresh();
    }
  }, [normalizeLeadDateFields, requestAllLeadsRefresh]);

  const loadAllLeadsForFilters = useCallback(async (force = false) => {
    if (!force) {
      if (allLeadsFetchPromiseRef.current) {
        await allLeadsFetchPromiseRef.current;
        return allLeadsDataRef.current;
      }
      if (allLeadsDataRef.current.length > 0) {
        return allLeadsDataRef.current;
      }
    }

    if (allLeadsFetchPromiseRef.current) {
      return allLeadsFetchPromiseRef.current;
    }

    const fetchPromise = (async () => {
      setLoadingAllLeads(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 0));
        const transformed = await leadService.fetchAllLeads();
        const leadsWithDates = transformed.map(normalizeLeadDateFields);
        setAllLeadsData(leadsWithDates);
        allLeadsDataRef.current = leadsWithDates;
        return leadsWithDates;
      } catch (error) {
        throw error;
      } finally {
        setLoadingAllLeads(false);
        allLeadsFetchPromiseRef.current = null;
      }
    })();

    allLeadsFetchPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, [leadService, normalizeLeadDateFields]);

  useEffect(() => {
    loadAllLeadsForFiltersRef.current = loadAllLeadsForFilters;
  }, [loadAllLeadsForFilters]);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await leadService.fetchLeads(buildLeadFetchParams());
      applyLeadResponse(response);
    } catch (error) {
      apiErrorHandler.handleError(error, 'fetch leads');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [buildLeadFetchParams, leadService, applyLeadResponse]);

  const handleManualRefresh = () => {
    fetchLeads();
    if (hasActiveLeadFilters()) {
      requestAllLeadsRefresh();
    }
  };

  
  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) {
      toastManager.warning('Please select leads to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} lead(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.delete(API_ENDPOINTS.LEADS_BATCH_DELETE(), {
        ids: selectedLeadIds
      });

      if (response.success) {
        toastManager.success(`Successfully deleted ${response.deletedCount || selectedLeadIds.length} lead(s)`);
        setSelectedLeadIds([]);
        setIsAllSelected(false);
        await fetchLeads();
        if (hasActiveLeadFilters()) {
          requestAllLeadsRefresh();
        }
      } else {
        toastManager.error(response.message || 'Failed to delete leads');
      }
    } catch (error) {
      apiErrorHandler.handleError(error, 'bulk delete leads');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    const leadsToExport = uniqueFilteredLeads.length > 0 ? uniqueFilteredLeads : leadsData;
    
    if (!leadsToExport || leadsToExport.length === 0) {
      toastManager.warning('No leads to export');
      return;
    }

    exportToExcel(leadsToExport, 'leads_export');
  };

  const fetchQuotationAndPICounts = useCallback(async () => {
    try {
      setLoadingCounts(true);
      const result = await leadsFilterService.fetchQuotationAndPICounts();
      setQuotationCounts(result.quotationCounts);
      setPiCounts(result.piCounts);
      return result;
    } catch (error) {
      return null;
    } finally {
      setLoadingCounts(false);
    }
  }, [leadsFilterService]);

  /** DH: Fetch pending order cancel and PI amendment counts for notification pills */
  const fetchApprovalCounts = useCallback(async () => {
    try {
      setLoadingApprovalCounts(true);
      const [cancelRes, revisedRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.ORDER_CANCEL_PENDING()).catch(() => ({ data: { data: [] } })),
        proformaInvoiceService.getPendingRevisedPIs().catch(() => ({ data: { data: [] } }))
      ]);
      const cancelList = cancelRes?.data?.data ?? cancelRes?.data ?? [];
      const revisedList = revisedRes?.data?.data ?? revisedRes?.data ?? [];
      setOrderCancelPendingCount(Array.isArray(cancelList) ? cancelList.length : 0);
      setPiAmendmentPendingCount(Array.isArray(revisedList) ? revisedList.length : 0);
    } catch (e) {
      setOrderCancelPendingCount(0);
      setPiAmendmentPendingCount(0);
    } finally {
      setLoadingApprovalCounts(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchQuotationAndPICounts().catch(() => {});
    fetchApprovalCounts().catch(() => {});
  }, [fetchQuotationAndPICounts, fetchApprovalCounts]);

  useEffect(() => {
    if (statusFilter.type || assignmentFilter) return;
    fetchLeads();
  }, [page, limit, debouncedSearchTerm, statusFilter.type, assignmentFilter, fetchLeads]);

  useEffect(() => {
    if (hasActiveLeadFilters() || allLeadsRefreshKey > 0) {
      loadAllLeadsForFilters(true).catch(() => {});
    }
  }, [allLeadsRefreshKey, hasActiveLeadFilters, loadAllLeadsForFilters]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    const result = await userService.fetchUsers();
    setUsernames(result.usernames);
    setUsersError(result.error);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (showEditModal || showAssignModal) {
      fetchUsers();
    }
  }, [showEditModal, showAssignModal]);

  useEffect(() => {
    if (showPreviewModal && previewLead && previewLead.id) {
      fetchQuotations(previewLead.id);
    }
  }, [showPreviewModal, previewLead]);

  useEffect(() => {
    if (showCustomerTimeline && timelineLead && timelineLead.id) {
      fetchQuotations(timelineLead.id);
      fetchPIsForLead();
    }
  }, [showCustomerTimeline, timelineLead]);

  // Group PIs by quotation ID for sidebar
  const quotationPIsMap = useMemo(() => {
    const pisByQuotation = {};
    proformaInvoices.forEach(pi => {
      if (pi.quotation_id) {
        if (!pisByQuotation[pi.quotation_id]) {
          pisByQuotation[pi.quotation_id] = [];
        }
        pisByQuotation[pi.quotation_id].push(pi);
      }
    });
    return pisByQuotation;
  }, [proformaInvoices]);
  // DH: Fetch pending order cancels and revised PIs for this lead (when drawer open)
  const fetchPendingApprovalsForLead = useCallback(async () => {
    if (!previewLead?.id) return;
    const leadId = String(previewLead.id);
    setLoadingOrderCancels(true);
    setLoadingRevisedPIs(true);
    try {
      const [cancelRes, revisedRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.ORDER_CANCEL_PENDING()).catch(() => ({ data: { data: [] } })),
        proformaInvoiceService.getPendingRevisedPIs().catch(() => ({ data: { data: [] } }))
      ]);
      const allCancels = cancelRes?.data?.data ?? cancelRes?.data ?? [];
      const allRevised = revisedRes?.data?.data ?? revisedRes?.data ?? [];
      setPendingOrderCancels(Array.isArray(allCancels) ? allCancels.filter(r => String(r.customer_id || r.customerId) === leadId) : []);
      setPendingRevisedPIs(Array.isArray(allRevised) ? allRevised.filter(pi => String(pi.customer_id || pi.customerId) === leadId) : []);
    } catch (e) {
      setPendingOrderCancels([]);
      setPendingRevisedPIs([]);
    } finally {
      setLoadingOrderCancels(false);
      setLoadingRevisedPIs(false);
    }
  }, [previewLead?.id]);

  useEffect(() => {
    if (showPreviewModal && previewLead?.id) {
      fetchPendingApprovalsForLead();
    } else {
      setPendingOrderCancels([]);
      setPendingRevisedPIs([]);
    }
  }, [showPreviewModal, previewLead?.id]);

  const openAssignModal = (lead) => {
    setAssigningLead(lead);
    setAssignForm({
      salesperson: lead.assignedSalesperson || '',
      telecaller: lead.assignedTelecaller || ''
    });
    setShowAssignModal(true);
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const isValueAssigned = useCallback((val) => {
    if (!val) return false;
    const s = String(val).trim().toLowerCase();
    return s !== 'unassigned' && s !== 'n/a' && s !== 'na' && s !== '-';
  }, []);

  const isLeadAssigned = useCallback(
    (lead) =>
      isValueAssigned(lead.assignedSalesperson) || isValueAssigned(lead.assignedTelecaller),
    [isValueAssigned]
  );

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  };

  const showAllColumns = () => {
    setVisibleColumns(prev => {
      const allTrue = {};
      for (const key in prev) {
        if (prev.hasOwnProperty(key)) {
          allTrue[key] = true;
        }
      }
      return allTrue;
    });
  };

  const hasStatusFilter = Boolean(statusFilter.type && statusFilter.status);
  const hasAssignmentFilter = Boolean(assignmentFilter);
  const activeLeadPool = (hasStatusFilter || hasAssignmentFilter)
    ? (statusFilterLeadsRef.current?.length > 0 ? statusFilterLeadsRef.current : allLeadsDataRef.current?.length > 0 ? allLeadsDataRef.current : allLeadsData?.length > 0 ? allLeadsData : []) 
    : leadsData;

  const getUniqueFilterOptions = useMemo(() => {
    const cleanValue = (value) => {
      if (!value) return null;
      const trimmed = String(value).trim();
      return trimmed && trimmed !== 'N/A' && trimmed !== 'null' && trimmed !== '' && trimmed.toLowerCase() !== 'n/a' ? trimmed : null;
    };

    const allData = allLeadsData.length > 0 ? allLeadsData : leadsData;
    
    // Extract products
    const allProductValues = [];
    allData.forEach(lead => {
      const product = lead.productNames || lead.product_type || lead.productType || lead.productNamesText || '';
      if (typeof product === 'string' && product.includes(',')) {
        const splitProducts = product.split(',').map(p => cleanValue(p)).filter(Boolean);
        allProductValues.push(...splitProducts);
      } else {
        const cleaned = cleanValue(product);
        if (cleaned) allProductValues.push(cleaned);
      }
    });

    const followUpFromData = [...new Set(allData.map(lead => cleanValue(lead.followUpStatus || lead.connectedStatus || lead.telecallerStatus)).filter(Boolean))];
    const salesFromData = [...new Set(allData.map(lead => cleanValue(lead.salesStatus)).filter(Boolean))];
    return {
      tags: [...new Set(allData.map(lead => cleanValue(lead.customerType || lead.category)).filter(Boolean))].sort(),
      followUpStatuses: [...new Set([...followUpFromData, 'pending'])].sort(),
      salesStatuses: [...new Set([...salesFromData, 'pending'])].sort(),
      states: [...new Set(allData.map(lead => cleanValue(lead.state)).filter(Boolean))].sort(),
      leadSources: [...new Set(allData.map(lead => cleanValue(lead.leadSource)).filter(Boolean))].sort(),
      products: [...new Set(allProductValues)].sort()
    };
  }, [allLeadsData, leadsData]);

  const handleAdvancedFilterChange = useCallback((filterKey, value) => {
    setAdvancedFilters(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  const toggleFilterSection = useCallback((filterKey) => {
    setEnabledFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
    // Clear the filter value when disabling
    if (enabledFilters[filterKey]) {
      if (filterKey === 'dateRange') {
        setAdvancedFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
      } else {
        setAdvancedFilters(prev => ({ ...prev, [filterKey]: '' }));
      }
    }
  }, [enabledFilters]);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      tag: '', followUpStatus: '', salesStatus: '', state: '', leadSource: '', productType: '', dateFrom: '', dateTo: ''
    });
    setEnabledFilters({
      tag: false, followUpStatus: false, salesStatus: false, state: false, leadSource: false, productType: false, dateRange: false
    });
    setSortBy('none');
    setSortOrder('asc');
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    if (newSortBy === 'none') {
      setSortOrder('asc');
    }
  }, []);

  const handleSortOrderChange = useCallback((newSortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  const normalizeText = useCallback((value) => String(value || '').trim().toLowerCase(), []);
  const toDateKey = useCallback((value) => {
    if (!value) return null;
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);
  const isSameLeadDate = useCallback((lead, date) => {
    if (!date) return true;
    const leadDate = toDateKey(lead?.createdAt || lead?.created_at || lead?.date || lead?.enquiryDate);
    return leadDate === date;
  }, [toDateKey]);

  const filteredLeads = useMemo(() => {
    let result = filterLeads(
      activeLeadPool,
      debouncedSearchTerm, // Use debounced search instead of immediate
      assignmentFilter,
      statusFilter,
      filteredCustomerIds,
      isLeadAssigned,
      '', // removed inline salesperson filter
      '', // removed inline telecaller filter
      columnFilters
    );

    const hasAdvancedFilters = Object.values(enabledFilters).some(Boolean);
    if (hasAdvancedFilters) {
      result = result.filter(lead => {
        if (enabledFilters.tag && advancedFilters.tag) {
          const leadTag = (lead.customerType || lead.category || '').toLowerCase();
          if (!leadTag.includes(advancedFilters.tag.toLowerCase())) return false;
        }
        
        if (enabledFilters.followUpStatus && advancedFilters.followUpStatus) {
          const status = (lead.followUpStatus || lead.connectedStatus || lead.telecallerStatus || '').toLowerCase();
          if (!status.includes(advancedFilters.followUpStatus.toLowerCase())) return false;
        }
        
        // Sales Status filter
        if (enabledFilters.salesStatus && advancedFilters.salesStatus) {
          const status = (lead.salesStatus || '').toLowerCase();
          if (!status.includes(advancedFilters.salesStatus.toLowerCase())) return false;
        }
        
        // State filter
        if (enabledFilters.state && advancedFilters.state) {
          const state = (lead.state || '').toLowerCase();
          if (!state.includes(advancedFilters.state.toLowerCase())) return false;
        }
        
        // Lead Source filter
        if (enabledFilters.leadSource && advancedFilters.leadSource) {
          const source = (lead.leadSource || '').toLowerCase();
          if (!source.includes(advancedFilters.leadSource.toLowerCase())) return false;
        }
        
        // Product Type filter
        if (enabledFilters.productType && advancedFilters.productType) {
          const product = (lead.productNames || lead.product_type || lead.productNamesText || '').toLowerCase();
          if (!product.includes(advancedFilters.productType.toLowerCase())) return false;
        }
        
        // Date Range filter
        if (enabledFilters.dateRange && (advancedFilters.dateFrom || advancedFilters.dateTo)) {
          const leadDate = lead.createdAt ? new Date(lead.createdAt) : null;
          if (leadDate) {
            if (advancedFilters.dateFrom && leadDate < new Date(advancedFilters.dateFrom)) return false;
            if (advancedFilters.dateTo && leadDate > new Date(advancedFilters.dateTo + 'T23:59:59')) return false;
          }
        }
        
        return true;
      });
    }

    // Apply sorting
    if (sortBy !== 'none') {
      result = [...result].sort((a, b) => {
        let valA, valB;
        
        switch (sortBy) {
          case 'name':
            valA = (a.customer || a.name || '').toLowerCase();
            valB = (b.customer || b.name || '').toLowerCase();
            break;
          case 'business':
            valA = (a.business || '').toLowerCase();
            valB = (b.business || '').toLowerCase();
            break;
          case 'state':
            valA = (a.state || '').toLowerCase();
            valB = (b.state || '').toLowerCase();
            break;
          case 'salesStatus':
            valA = (a.salesStatus || '').toLowerCase();
            valB = (b.salesStatus || '').toLowerCase();
            break;
          case 'followUpStatus':
            valA = (a.followUpStatus || a.connectedStatus || '').toLowerCase();
            valB = (b.followUpStatus || b.connectedStatus || '').toLowerCase();
            break;
          case 'date':
            valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
          case 'phone':
            valA = a.phone || '';
            valB = b.phone || '';
            break;
          default:
            return 0;
        }
        
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (dashboardFilterPayload?.filter) {
      const filterType = dashboardFilterPayload.filter;
      const filterDate = dashboardFilterPayload.date || null;
      const stageKey = normalizeText(dashboardFilterPayload.stageKey);
      const focusLeadId = dashboardFilterPayload.leadId != null ? String(dashboardFilterPayload.leadId) : null;

      result = result.filter((lead) => {
        const leadId = lead?.id != null ? String(lead.id) : '';
        const followUpStatus = normalizeText(lead?.followUpStatus || lead?.connectedStatus || lead?.telecallerStatus);
        const hasFollowUp = Boolean(followUpStatus && !['pending', 'none', 'new'].includes(followUpStatus));
        const hasQuotation = Number(lead?.quotationCount || lead?.quotation_count || lead?.totalQuotation || 0) > 0;
        const hasPi = Number(lead?.piCount || lead?.pi_count || lead?.totalPI || 0) > 0;

        switch (filterType) {
          case 'new_leads_added':
            return isSameLeadDate(lead, filterDate);
          case 'no_follow_up':
            return isSameLeadDate(lead, filterDate) && !hasFollowUp;
          case 'pipeline_stage':
            return (!filterDate || isSameLeadDate(lead, filterDate)) && (!stageKey || followUpStatus === stageKey);
          case 'quotation_created':
            return (!filterDate || isSameLeadDate(lead, filterDate)) && hasQuotation;
          case 'pi_created':
            return (!filterDate || isSameLeadDate(lead, filterDate)) && hasPi;
          case 'lead_priority':
            return focusLeadId ? leadId === focusLeadId : true;
          default:
            return true;
        }
      });
    }

    return result;
  }, [activeLeadPool, debouncedSearchTerm, assignmentFilter, statusFilter, filteredCustomerIds, isLeadAssigned, columnFilters, enabledFilters, advancedFilters, sortBy, sortOrder, dashboardFilterPayload, isSameLeadDate, normalizeText]);

  const uniqueFilteredLeads = useMemo(() => {
    const seen = new Set();
    const result = [];

    for (let i = 0; i < filteredLeads.length; i++) {
      const lead = filteredLeads[i];
      const key = lead?.id ?? lead?.customerId;
      if (key == null) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(lead);
    }

    return result;
  }, [filteredLeads]);

  const unassignedLeadIds = useMemo(() => 
    getUnassignedLeadIds(uniqueFilteredLeads, isLeadAssigned), 
    [uniqueFilteredLeads, isLeadAssigned]
  );

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
      setIsAllSelected(false);
      return;
    }
    const allVisibleLeadIds = uniqueFilteredLeads.map(l => l.id).filter(id => id != null);
    setSelectedLeadIds([...allVisibleLeadIds]);
    setIsAllSelected(allVisibleLeadIds.length > 0);
  }, [isAllSelected, uniqueFilteredLeads]);

  const toggleSelectOne = useCallback((id) => {
    setSelectedLeadIds((prev) => {
      const prevSet = new Set(prev);
      if (prevSet.has(id)) {
        prevSet.delete(id);
      } else {
        prevSet.add(id);
      }
      const next = Array.from(prevSet);
      setIsAllSelected(next.length > 0 && next.length === uniqueFilteredLeads.length);
      return next;
    });
  }, [uniqueFilteredLeads]);

  const tableLoading = loading || ((hasStatusFilter || hasAssignmentFilter) && loadingAllLeads && allLeadsData.length === 0);
  const paginationDisabled = false;
  const hasClientSideFilteredPagination = hasStatusFilter || hasAssignmentFilter;
  const displayTotal = hasClientSideFilteredPagination ? uniqueFilteredLeads.length : total;
  const effectiveLimit = Math.max(1, Number(limit) || 20);
  const totalPages = Math.max(1, Math.ceil(displayTotal / effectiveLimit) || 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = displayTotal === 0 ? 0 : (safePage - 1) * effectiveLimit + 1;
  const pageEnd = displayTotal === 0 ? 0 : Math.min(safePage * effectiveLimit, displayTotal);
  const leadsForTable = useMemo(() => {
    if (!hasClientSideFilteredPagination) {
      return uniqueFilteredLeads;
    }
    const start = (safePage - 1) * effectiveLimit;
    return uniqueFilteredLeads.slice(start, start + effectiveLimit);
  }, [hasClientSideFilteredPagination, safePage, effectiveLimit, uniqueFilteredLeads]);
  const paginationSummary = `${pageStart} - ${pageEnd} of ${displayTotal}`;
  
  const { assignedCount, unassignedCount } = useMemo(() => {
    const leadsToCount = allLeadsData.length > 0 ? allLeadsData : leadsData;
    return calculateAssignedCounts(leadsToCount, isLeadAssigned);
  }, [allLeadsData, leadsData, isLeadAssigned]);

  const handleBadgeClick = async (type, status) => {
    if (statusFilter.type === type && statusFilter.status === status) {
      setStatusFilter({ type: null, status: null });
      setFilteredCustomerIds(new Set());
      statusFilterLeadsRef.current = [];
      return;
    }
    
    try {
      setStatusFilter({ type, status });
      setPage(1); // Reset to first page when filter is applied
      
      // Show loading state immediately
      setLoadingAllLeads(true);
      
      // Load all leads first (required for PI/Quotation/approval filter to show correct leads)
      const loadedLeads = await loadAllLeadsForFilters(true).catch(err => {
        console.error('Error loading all leads:', err);
        return [];
      });
      statusFilterLeadsRef.current = Array.isArray(loadedLeads) ? loadedLeads : [];

      let customerIds = new Set();

      if (type === 'order_cancel') {
        const cancelRes = await apiClient.get(API_ENDPOINTS.ORDER_CANCEL_PENDING()).catch(() => ({ data: { data: [] } }));
        const cancelList = cancelRes?.data?.data ?? cancelRes?.data ?? [];
        if (Array.isArray(cancelList) && cancelList.length > 0) {
          customerIds = IDMatcher.buildCustomerIdSet(cancelList);
        }
        if (customerIds.size === 0 && cancelList.length > 0) {
          toastManager.warning('Could not match order cancel requests to leads. Please try again.');
        }
      } else if (type === 'pi_amendment') {
        const revisedRes = await proformaInvoiceService.getPendingRevisedPIs().catch(() => ({ data: { data: [] } }));
        const revisedList = revisedRes?.data?.data ?? revisedRes?.data ?? [];
        if (Array.isArray(revisedList) && revisedList.length > 0) {
          customerIds = await leadsFilterService.extractCustomerIdsFromPIs(revisedList);
        }
        if (customerIds.size === 0 && revisedList.length > 0) {
          toastManager.warning('Could not match PI amendments to leads. Please try again.');
        }
      } else {
        // Fetch counts + extract customer IDs for PI/Quotation filter
        const countsResult = await fetchQuotationAndPICounts().catch(err => {
          console.error('Error loading counts:', err);
          return null;
        });
        if (type === 'pi') {
          const relevantPIs = countsResult?.filteredPIs?.[status] || [];
          if (relevantPIs.length > 0) {
            customerIds = await leadsFilterService.extractCustomerIdsFromPIs(relevantPIs);
          }
        } else if (type === 'quotation') {
          const relevantQuotations = countsResult?.filteredQuotations?.[status] || [];
          if (relevantQuotations.length > 0) {
            customerIds = await leadsFilterService.extractCustomerIdsFromQuotations(relevantQuotations);
          }
        }
      }
      
      setFilteredCustomerIds(customerIds);
      if (type === 'pi' && status === 'pending' && customerIds.size === 0) {
        const countsResult = await fetchQuotationAndPICounts().catch(() => null);
        if ((countsResult?.piCounts?.pending || 0) > 0) {
          toastManager.warning('Could not match pending PIs to leads. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in handleBadgeClick:', err);
      toastManager.error('Failed to load leads for filtering');
      setStatusFilter({ type: null, status: null });
      setFilteredCustomerIds(new Set());
      statusFilterLeadsRef.current = [];
    } finally {
      setLoadingAllLeads(false);
    }
  };

  const handleAssignmentFilterChange = useCallback(async (filter) => {
    if (filter && allLeadsDataRef.current.length === 0) {
      setLoadingAllLeads(true);
      try {
        await loadAllLeadsForFilters(true);
      } catch (err) {
        console.error('Error loading all leads for assignment filter:', err);
        toastManager.error('Failed to load leads for filtering');
      } finally {
        setLoadingAllLeads(false);
      }
    }
    setAssignmentFilter(filter);
    setPage(1);
  }, [loadAllLeadsForFilters]);

  const handleClearAllFilters = useCallback(() => {
    setStatusFilter({ type: null, status: null });
    setAssignmentFilter(null);
    setFilteredCustomerIds(new Set());
    statusFilterLeadsRef.current = [];
    setColumnFilters(DEFAULT_COLUMN_FILTERS);
  }, []);

  const handleViewTimeline = useCallback((lead) => {
    setTimelineLead(lead);
    setShowCustomerTimeline(true);
  }, []);

  const handleColumnFilterChange = useCallback((key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleToggleColumnFilterRow = useCallback(() => {
    setShowColumnFilterRow(prev => !prev);
  }, []);

  const handleCustomerSave = async (customerData) => {
    try {
      setLoading(true);
      const newCustomer = leadService.buildLeadPayload(customerData);
      const transformedLead = await leadService.createLead(newCustomer);
      
      if (transformedLead) {
        setLeadsData(prevLeads => {
          if (prevLeads && prevLeads.length > 0) {
            return [...prevLeads, transformedLead];
          } else {
            return [transformedLead];
          }
        });
        requestAllLeadsRefresh();
        toastManager.success('Customer created successfully');
        setShowAddCustomer(false);
        
        setTimeout(async () => {
          try {
            const response = await leadService.fetchLeads(buildLeadFetchParams());
            applyLeadResponse(response, { refreshAll: true });
          } catch (error) {
            console.error('Error refreshing leads:', error);
          }
        }, 100);
      }
    } catch (error) {
      apiErrorHandler.handleError(error, 'create customer');
    } finally {
      setLoading(false);
    }
  };


  const fetchPIsForLead = async () => {
    try {
      setLoadingPIs(true);
      // Fetch PIs for all quotations of the current lead
      const allPIs = [];
      for (const quotation of quotations) {
        if (quotation.id) {
          const response = await proformaInvoiceService.getPIsByQuotation(quotation.id);
          if (response?.success && response.data) {
            allPIs.push(...response.data);
          }
        }
      }
      setProformaInvoices(allPIs);
    } catch (error) {
      console.error('Error fetching PIs:', error);
      setProformaInvoices([]);
    } finally {
      setLoadingPIs(false);
    }
  };

  const handleApprovePI = async (piId) => {
    const success = await piService.approvePI(piId);
    if (success && previewLead) {
      await fetchPIsForLead();
    }
  };

  const handleRejectPI = async (piId) => {
    const reason = prompt('Please enter rejection reason:');
    const success = await piService.rejectPI(piId, reason);
    if (success && previewLead) {
      await fetchPIsForLead();
    }
  };

  // DH: Order Cancel approval (inside lead drawer)
  const handleApproveOrderCancel = async (id) => {
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL_APPROVE(id));
      if (res?.data?.success) {
        toastManager.success(res.data.message || 'Order cancel approved.');
        await fetchPendingApprovalsForLead();
        fetchApprovalCounts().catch(() => {});
        if (previewLead?.id) await fetchQuotations(previewLead.id);
      } else {
        toastManager.error(res?.data?.message || 'Failed to approve');
      }
    } catch (err) {
      apiErrorHandler.handleError(err, 'approve order cancel');
    }
  };

  const handleRejectOrderCancel = async (id, rejectionReason) => {
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL_REJECT(id), {
        rejectionReason: rejectionReason || undefined
      });
      if (res?.data?.success) {
        toastManager.success(res.data.message || 'Request rejected.');
        await fetchPendingApprovalsForLead();
        fetchApprovalCounts().catch(() => {});
      } else {
        toastManager.error(res?.data?.message || 'Failed to reject');
      }
    } catch (err) {
      apiErrorHandler.handleError(err, 'reject order cancel');
    }
  };

  // DH: Revised PI (PI Amendment) approval (inside lead drawer)
  const handleApproveRevisedPI = async (id) => {
    try {
      const res = await proformaInvoiceService.approveRevisedPI(id);
      if (res?.data?.success) {
        toastManager.success(res.data.message || 'Revised PI approved.');
        await fetchPendingApprovalsForLead();
        fetchApprovalCounts().catch(() => {});
        if (previewLead) await fetchPIsForLead();
      } else {
        toastManager.error(res?.data?.message || 'Failed to approve');
      }
    } catch (err) {
      apiErrorHandler.handleError(err, 'approve revised PI');
    }
  };

  const handleRejectRevisedPI = async (id, reason) => {
    try {
      const res = await proformaInvoiceService.rejectRevisedPI(id, reason);
      if (res?.data?.success) {
        toastManager.success(res.data.message || 'Revised PI rejected.');
        await fetchPendingApprovalsForLead();
        fetchApprovalCounts().catch(() => {});
        if (previewLead) await fetchPIsForLead();
      } else {
        toastManager.error(res?.data?.message || 'Failed to reject');
      }
    } catch (err) {
      apiErrorHandler.handleError(err, 'reject revised PI');
    }
  };

  const handleViewPI = async (piId) => {
    try {
      const result = await piService.fetchPIWithQuotation(piId);
      if (!result) return;

      const { pi, completeQuotation, quotationItems, payments = [] } = result;
      // quotationItems from fetchPIWithQuotation are already amendment-aware (from /products API)
      const mappedItems = quotationItems;
      const totals = piService.calculatePITotals(mappedItems, completeQuotation, pi);

      const approvedOnly = (payments || []).filter((p) => {
        const status = (p.approval_status || p.accounts_approval_status || '').toLowerCase();
        return status === 'approved';
      });
      const advancePayment = approvedOnly.reduce((sum, p) => sum + (Number(p.installment_amount ?? p.paid_amount ?? p.amount ?? 0) || 0), 0);
      const originalQuotationTotal = totals.quotationTotal;
      const finalTotal = piService.calculateFinalTotal(
        totals.piTotal,
        totals.quotationTotal,
        advancePayment,
        originalQuotationTotal
      );

      const approvedPayments = approvedOnly.map((payment) => {
        const paymentDate = payment.payment_date || payment.created_at || '';
        let formattedDate = '';
        if (paymentDate) {
          try {
            formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (e) {
            formattedDate = paymentDate;
          }
        }
        const amountRaw = Number(payment.installment_amount || payment.paid_amount || payment.amount || 0);
        return {
          date: formattedDate,
          mode: payment.payment_method || 'N/A',
          refNo: payment.payment_reference || payment.id || '',
          amount: amountRaw.toFixed(2),
          amountRaw
        };
      });

      const totalAdvanceRaw = approvedPayments.reduce((sum, payment) => sum + (payment.amountRaw || 0), 0);
      const totalAdvanceValue = totalAdvanceRaw || advancePayment || 0;
      const quotationTotalAmount = Number(totals.quotationTotal || completeQuotation.total_amount || completeQuotation.total || 0);
      const balanceDue = Math.max(0, quotationTotalAmount - totalAdvanceValue);
      const formattedTotalAdvance = totalAdvanceValue.toFixed(2);
      const formattedBalanceDue = balanceDue.toFixed(2);
      
      // Get customer data for billTo
      const customerData = allLeadsDataRef.current?.find(lead => lead.id === Number(pi.customer_id)) || null;
      const billTo = piService.buildBillTo(completeQuotation, pi, customerData);
      
      // Build PI data in the same shape used by salesperson PI preview / templates
      const quotationNumber = completeQuotation.quotation_number || pi.pi_number || pi.id;
      const rawPiDate = pi.pi_date || pi.piDate || pi.created_at;
      const piDate = rawPiDate ? new Date(rawPiDate).toISOString().split('T')[0] : '';
      const validUntil = pi.valid_until || pi.validUntil || completeQuotation.valid_until || '';

      const rawBankDetails = completeQuotation.bank_details || completeQuotation.bankDetails;
      let bankDetails = null;
      try {
        if (rawBankDetails) {
          bankDetails = typeof rawBankDetails === 'string' ? JSON.parse(rawBankDetails) : rawBankDetails;
        }
      } catch (e) {
      }

      const rawTerms = completeQuotation.terms_sections || completeQuotation.termsSections;
      let terms = [];
      try {
        const baseTerms = typeof rawTerms === 'string' ? JSON.parse(rawTerms) : rawTerms;
        if (Array.isArray(baseTerms)) {
          terms = baseTerms.map((sec) => ({
            title: sec.title || '',
            points: Array.isArray(sec.points) ? sec.points : []
          }));
        }
      } catch (e) {
        // Terms parsing failed, will use empty array
      }

      // For PI preview we must use the PI's own template key (type "pi")
      // Do NOT fall back to the quotation's template key, since that is a different template type.
      const templateKey = pi.template || null;
      if (!templateKey) {
        toastManager.error('This PI has no template configured. Please recreate the PI with a PI template.');
        return;
      }
      const selectedBranch = completeQuotation.branch || DEFAULT_BRANCH;

      const formattedPiData = {
        quotationNumber,
        quotationDate: piDate,
        invoiceNumber: pi.pi_number || pi.piNumber || quotationNumber,
        invoiceDate: piDate,
        piNumber: pi.pi_number || pi.piNumber || quotationNumber,
        piDate,
        piId: pi.pi_number || pi.id,
        validUpto: validUntil,
        piValidUpto: validUntil,

        // Parties & template context
        billTo,
        items: mappedItems.map((item) => ({
          productName: item.description,
          description: item.subDescription || item.description,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          buyerRate: item.buyerRate,
          amount: item.amount,
          hsn: item.hsn || '85446090',
          hsnCode: item.hsn || '85446090'
        })),
        subtotal: totals.subtotal,
        discountRate: totals.discountRate,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        total: finalTotal,
        originalQuotationTotal: totalAdvanceValue > 0 ? originalQuotationTotal : 0,
        advancePayment: totalAdvanceValue,
        advancePayments: approvedPayments,
        totalAdvance: formattedTotalAdvance,
        balanceDue: formattedBalanceDue,

        // Party credit adjustment (persisted on PI as credit_adjusted)
        credit_adjusted: Number(pi.credit_adjusted ?? pi.creditAdjusted ?? pi.creditAdjustment ?? pi.credit_adjustment ?? 0) || 0,

        // Additional details from quotation
        paymentMode: completeQuotation.payment_mode || completeQuotation.paymentMode || '',
        transportTc: completeQuotation.transport_tc || completeQuotation.transportTc || '',
        dispatchThrough: completeQuotation.dispatch_through || completeQuotation.dispatchThrough || '',
        deliveryTerms: completeQuotation.delivery_terms || completeQuotation.deliveryTerms || '',
        materialType: completeQuotation.material_type || completeQuotation.materialType || '',

        paymentTerms: completeQuotation.payment_terms || completeQuotation.paymentTerms || '',
        validity: validUntil,
        warranty: completeQuotation.warranty || '',

        bankDetails,
        terms,

        // RFP ID from quotation (for PI template - Lead → RFP → Quotation → PI)
        rfpId: completeQuotation.rfp_id || completeQuotation.rfpId || pi.master_rfp_id || null,
        masterRfpId: completeQuotation.master_rfp_id || completeQuotation.masterRfpId || pi.master_rfp_id || null,
        rfp_id: completeQuotation.rfp_id || completeQuotation.rfpId || null,
        master_rfp_id: completeQuotation.master_rfp_id || completeQuotation.masterRfpId || pi.master_rfp_id || null,

        // Meta
        template: templateKey,
        selectedBranch
      };

      // Add common aliases + formatted values for templates / injected block
      {
        const creditAdjustedRaw = Number(formattedPiData.credit_adjusted || 0) || 0;
        const totalBeforeCredit = Number(pi.total_amount ?? pi.totalAmount ?? finalTotal ?? 0) || 0;
        const netPayableAfterCredit = Math.max(0, totalBeforeCredit - creditAdjustedRaw);
        const formatMoney = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        Object.assign(formattedPiData, {
          creditAdjusted: creditAdjustedRaw,
          creditAdjustment: creditAdjustedRaw,
          credit_adjustment: creditAdjustedRaw,
          creditAdjustedFormatted: formatMoney(creditAdjustedRaw),
          partyCreditAdjustEnabled: creditAdjustedRaw > 0,
          partyCreditApplied: creditAdjustedRaw,
          partyCreditAppliedFormatted: formatMoney(creditAdjustedRaw),
          piTotalBeforeCredit: totalBeforeCredit,
          piTotalBeforeCreditFormatted: formatMoney(totalBeforeCredit),
          piNetPayableAfterCredit: netPayableAfterCredit,
          piNetPayableAfterCreditFormatted: formatMoney(netPayableAfterCredit),
          netPayable: netPayableAfterCredit,
          net_payable: netPayableAfterCredit,
          netPayableFormatted: formatMoney(netPayableAfterCredit),
        });
      }

      setPiPreviewData(formattedPiData);
      setShowPIPreview(true);
    } catch (error) {
      console.error('Error viewing PI:', error);
      toastManager.error('Failed to load PI details');
    }
  };

  const handleEdit = (lead) => {
    if (!lead) return;
    setEditingLead(lead);
    setEditFormData({
      customer: lead.customer && lead.customer !== 'N/A' ? lead.customer : '',
      email: lead.email && lead.email !== 'N/A' ? lead.email : '',
      business: lead.business && lead.business !== 'N/A' ? lead.business : '',
      address: lead.address && lead.address !== 'N/A' ? lead.address : '',
      state: lead.state && lead.state !== 'N/A' ? lead.state : '',
      division: lead.division && lead.division !== 'N/A' ? lead.division : '',
      leadSource: lead.leadSource || '',
      category: lead.category || '',
      salesStatus: lead.salesStatus || '',
      phone: lead.phone || '',
      gstNo: lead.gstNo || '',
      productNames: lead.productNamesText || '',
      assignedSalesperson: lead.assignedSalesperson || '',
      assignedTelecaller: lead.assignedTelecaller || '',
      telecallerStatus: lead.telecallerStatus || '',
      paymentStatus: lead.paymentStatus || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (editingLead && editingLead.id) {
        await leadService.updateLead(editingLead.id, editFormData);

        const updatedLeads = [];
        for (let i = 0; i < leadsData.length; i++) {
          const lead = leadsData[i];
          updatedLeads.push(lead.id === editingLead.id ? { ...lead, ...editFormData } : lead);
        }
        setLeadsData(updatedLeads);
        requestAllLeadsRefresh();

        toastManager.success('Lead updated successfully');
        setShowEditModal(false);
        setEditingLead(null);
      }
    } catch (error) {
      apiErrorHandler.handleError(error, 'update lead');
    }
  };

  const handleViewActivity = (activity) => {
    const activityType = activity.activity_type;
    const metadata = activity.metadata || {};

    switch (activityType) {
      case 'document_uploaded':
        // Open document in new tab
        if (metadata.url) {
          window.open(metadata.url, '_blank');
        } else {
          toastManager.info('Document URL not available');
        }
        break;
      
      case 'mail_sent':
        // Show email details in modal
        setViewingActivity(activity);
        setShowActivityModal(true);
        break;
      
      case 'enquiry_added':
      case 'enquiry_edited':
        // Show enquiry details in modal
        setViewingActivity(activity);
        setShowActivityModal(true);
        break;
      
      case 'quotation_created':
      case 'quotation_edited':
      case 'quotation_approved':
      case 'quotation_rejected':
        // View quotation
        if (metadata.quotationId) {
          handleViewQuotation(metadata.quotationId);
        } else {
          toastManager.info('Quotation ID not available');
        }
        break;
      
      case 'pi_created':
        // View PI
        if (metadata.piId) {
          handleViewPI(metadata.piId);
        } else {
          toastManager.info('PI ID not available');
        }
        break;
      
      default:
        // Show generic activity details
        setViewingActivity(activity);
        setShowActivityModal(true);
    }
  };

  const handleDeleteActivity = async (activity) => {
    const activityType = activity.activity_type;
    const metadata = activity.metadata || {};

    try {
      switch (activityType) {
        case 'document_uploaded':
          // Delete document
          toastManager.info('Document deletion will be implemented');
          break;
        
        case 'mail_sent':
          // Delete email
          toastManager.info('Email deletion will be implemented');
          break;
        
        default:
          toastManager.info('This activity cannot be deleted');
      }
    } catch (error) {
      toastManager.error('Failed to delete activity');
    }
  };

  const handleEditEnquiryFromActivity = (activity) => {
    const metadata = activity.metadata || {};
    toastManager.info('Enquiry editing will be implemented');
    setViewingActivity(activity);
    setShowActivityModal(true);
  };

  const handleStatusChange = useCallback(async (leadId, field, newStatus) => {
    try {
      await leadService.updateLead(leadId, { [field]: newStatus });
      setLeadsData(prev =>
        prev.map((l) => (l.id === leadId ? { ...l, [field]: newStatus } : l))
      );
      requestAllLeadsRefresh();
      toastManager.success(`${field === 'followUpStatus' ? 'Follow up' : 'Sales'} status updated`);
    } catch (err) {
      apiErrorHandler.handleError(err, `update ${field}`);
    }
  }, [requestAllLeadsRefresh, leadService]);

  const handleFollowUpStatusChange = useCallback(
    (id, status) => handleStatusChange(id, 'followUpStatus', status),
    [handleStatusChange]
  );
  const handleSalesStatusChangeTable = useCallback(
    (id, status) => handleStatusChange(id, 'salesStatus', status),
    [handleStatusChange]
  );

  const handleAppointmentChange = useCallback(async (leadId, { followUpDate, followUpTime }) => {
    try {
      await leadService.updateLead(leadId, {
        followUpStatus: 'appointment scheduled',
        followUpDate: followUpDate || '',
        followUpTime: followUpTime || ''
      });
      setLeadsData(prev =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, followUpDate: followUpDate || '', followUpTime: followUpTime || '' }
            : l
        )
      );
      requestAllLeadsRefresh();
      toastManager.success('Appointment updated');
    } catch (err) {
      apiErrorHandler.handleError(err, 'update appointment');
    }
  }, [requestAllLeadsRefresh, leadService]);

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 overflow-x-hidden min-w-0">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 -mx-3 sm:mx-0 px-3 sm:px-0">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Leads
          </button>
          <button
            onClick={() => setActiveTab('enquiry')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'enquiry'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4" />
            Enquiry
          </button>
          <button
            onClick={() => setActiveTab('lastCall')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'lastCall'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Phone className="w-4 h-4" />
            Last Call
          </button>
          <button
            onClick={() => setActiveTab('orderCancelApprovals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'orderCancelApprovals'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Ban className="w-4 h-4" />
            Order Cancel Approvals
            {orderCancelPendingCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-amber-600 rounded-full">
                {orderCancelPendingCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'leads' && (
        <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onImportClick={() => setShowImportPopup(true)}
            onAddCustomer={() => setShowAddCustomer(true)}
            onAssignSelected={() => {
              setAssigningLead(null);
              setAssignForm({ salesperson: '', telecaller: '' });
              setShowAssignModal(true);
            }}
            onBulkDelete={handleBulkDelete}
            onExportExcel={handleExportToExcel}
            selectedCount={selectedLeadIds.length}
            onRefresh={handleManualRefresh}
          />
        </div>
        
        {/* Global Filter Button */}
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`relative p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
            showFilterPanel 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300'
          }`}
          title="Filter Leads"
        >
          <Filter className="w-4 h-4" />
          {Object.values(enabledFilters).some(Boolean) && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
              {Object.values(enabledFilters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Global Filters Panel */}
      <LeadFilters
        showFilterPanel={showFilterPanel}
        setShowFilterPanel={setShowFilterPanel}
        enabledFilters={enabledFilters}
        advancedFilters={advancedFilters}
        getUniqueFilterOptions={getUniqueFilterOptions}
        handleAdvancedFilterChange={handleAdvancedFilterChange}
        toggleFilterSection={toggleFilterSection}
        clearAdvancedFilters={clearAdvancedFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        handleSortChange={handleSortChange}
        handleSortOrderChange={handleSortOrderChange}
      />

      <FilterBadges
        quotationCounts={quotationCounts}
        piCounts={piCounts}
        loadingCounts={loadingCounts}
        statusFilter={statusFilter}
        assignmentFilter={assignmentFilter}
        assignedCount={assignedCount}
        unassignedCount={unassignedCount}
        orderCancelPendingCount={orderCancelPendingCount}
        piAmendmentPendingCount={piAmendmentPendingCount}
        loadingApprovalCounts={loadingApprovalCounts}
        onBadgeClick={handleBadgeClick}
        onAssignmentFilter={handleAssignmentFilterChange}
        onClearFilter={handleClearAllFilters}
      />

      <LeadTable
        filteredLeads={leadsForTable}
        tableLoading={tableLoading}
        hasStatusFilter={hasStatusFilter}
        visibleColumns={visibleColumns}
        isAllSelected={isAllSelected}
        selectedLeadIds={selectedLeadIds}
        isLeadAssigned={isLeadAssigned}
        isValueAssigned={isValueAssigned}
        getStatusBadge={getStatusBadgeUtil}
        toggleSelectAll={toggleSelectAll}
        toggleSelectOne={toggleSelectOne}
        onEdit={handleEdit}
        onViewTimeline={handleViewTimeline}
        onAssign={openAssignModal}
        setShowColumnFilter={setShowColumnFilter}
        allLeadsData={allLeadsData}
        usernames={usernames}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        showColumnFilterRow={showColumnFilterRow}
        onToggleColumnFilterRow={handleToggleColumnFilterRow}
        onFollowUpStatusChange={handleFollowUpStatusChange}
        onSalesStatusChange={handleSalesStatusChangeTable}
        onAppointmentChange={handleAppointmentChange}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-2 sm:p-3 border-t border-gray-200 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
            }}
            disabled={paginationDisabled}
            className={`border border-gray-300 rounded px-1.5 py-0.5 text-xs ${paginationDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <span>{paginationSummary}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={paginationDisabled || page === 1}
            className={`px-3 py-1 border rounded ${
              paginationDisabled || page === 1
                ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            {`Page ${safePage} of ${totalPages}`}
          </span>
          <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={paginationDisabled || safePage >= totalPages || displayTotal === 0}
            className={`px-3 py-1 border rounded ${
              paginationDisabled || safePage >= totalPages || displayTotal === 0
                ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
        </>
      )}

      {activeTab === 'lastCall' && (
        <>
          {lastCallInitialLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => fetchLastCallSummary(true, lastCallPage, lastCallLimit)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Refresh
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Rows per page:</span>
                  <select
                    value={lastCallLimit}
                    onChange={(e) => {
                      setLastCallLimit(Number(e.target.value));
                      setLastCallPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {lastCallLoading ? (
                <DashboardSkeleton />
              ) : groupedLastCallSummary.length > 0 ? (
                <div className="space-y-4">
                  {groupedLastCallSummary.map((group) => (
                    <div key={group.dateKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {new Date(group.dateKey).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px]">
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
                  <p className="text-gray-500">No last call summary available.</p>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between gap-3 mt-4">
                <span className="text-sm text-gray-600">
                  Page {lastCallPage} of {Math.max(1, Math.ceil(lastCallTotal / lastCallLimit))}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLastCallPage(1)}
                    disabled={lastCallPage === 1}
                    className={`px-3 py-1 text-sm rounded border ${
                      lastCallPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setLastCallPage(p => Math.max(1, p - 1))}
                    disabled={lastCallPage === 1}
                    className={`px-3 py-1 text-sm rounded border ${
                      lastCallPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setLastCallPage(p => p < Math.ceil(lastCallTotal / lastCallLimit) ? p + 1 : p)}
                    disabled={lastCallPage >= Math.ceil(lastCallTotal / lastCallLimit)}
                    className={`px-3 py-1 text-sm rounded border ${
                      lastCallPage >= Math.ceil(lastCallTotal / lastCallLimit) ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setLastCallPage(Math.ceil(lastCallTotal / lastCallLimit))}
                    disabled={lastCallPage >= Math.ceil(lastCallTotal / lastCallLimit)}
                    className={`px-3 py-1 text-sm rounded border ${
                      lastCallPage >= Math.ceil(lastCallTotal / lastCallLimit) ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'enquiry' && (
        <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Enquiries</h2>
            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={fetchEnquiries}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filter by Salesperson */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Salesperson</label>
                  <select
                    value={enquiryFilters.salesperson}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, salesperson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Salespersons</option>
                    {enquiryFilterOptions.salespersons.map(sp => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Enquiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Enquiry Date</label>
                  <input
                    type="date"
                    value={enquiryFilters.enquiry_date}
                    onChange={(e) => setEnquiryFilters(prev => ({ ...prev, enquiry_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setEnquiryFilters(DEFAULT_ENQUIRY_FILTERS);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-t border-gray-200 bg-white rounded-lg shadow-sm mt-4">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
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
                    <span className="whitespace-nowrap">Showing {Math.min(((enquiryPage - 1) * enquiryLimit) + 1, enquiryTotal)} to {Math.min(enquiryPage * enquiryLimit, enquiryTotal)} of {enquiryTotal} enquiries</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => setEnquiryPage(1)}
                      disabled={enquiryPage === 1}
                      className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEnquiryPage(p => Math.max(1, p - 1))}
                      disabled={enquiryPage === 1}
                      className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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
                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border ${
                              enquiryPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 px-1 sm:px-2 whitespace-nowrap">
                      Page {enquiryPage} of {Math.ceil(enquiryTotal / enquiryLimit) || 1}
                    </span>
                    <button
                      onClick={() => setEnquiryPage(p => p < Math.ceil(enquiryTotal / enquiryLimit) ? p + 1 : p)}
                      disabled={enquiryPage >= Math.ceil(enquiryTotal / enquiryLimit)}
                      className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEnquiryPage(Math.ceil(enquiryTotal / enquiryLimit))}
                      disabled={enquiryPage >= Math.ceil(enquiryTotal / enquiryLimit)}
                      className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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

      <ColumnFilterModal
        isOpen={showColumnFilter}
        onClose={() => setShowColumnFilter(false)}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onResetColumns={resetColumns}
        onShowAllColumns={showAllColumns}
      />

      <input
        ref={importFileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {activeTab === 'orderCancelApprovals' && (
        <OrderCancelApprovals setActiveView={setActiveTab} />
      )}

      <ImportCSVModal
        isOpen={showImportPopup}
        onClose={() => setShowImportPopup(false)}
        onDownloadTemplate={downloadCSVTemplate}
        onFileSelect={handleFileUpload}
        fileInputRef={importFileInputRef}
      />

      <LeadPreviewDrawer
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewLead={previewLead}
        loadingQuotations={loadingQuotations}
        quotations={quotations}
        proformaInvoices={proformaInvoices}
        isValueAssigned={isValueAssigned}
        onViewQuotation={handleViewQuotation}
        onDownloadPDF={handleDownloadPDF}
        onApproveQuotation={handleApproveQuotation}
        onRejectQuotation={handleRejectQuotation}
        canApproveQuotations={['department_head', 'superadmin'].includes((user?.role || '').toLowerCase())}
        onViewPI={handleViewPI}
        onApprovePI={handleApprovePI}
        onRejectPI={handleRejectPI}
        pendingOrderCancels={pendingOrderCancels}
        pendingRevisedPIs={pendingRevisedPIs}
        loadingOrderCancels={loadingOrderCancels}
        loadingRevisedPIs={loadingRevisedPIs}
        onApproveOrderCancel={handleApproveOrderCancel}
        onRejectOrderCancel={handleRejectOrderCancel}
        onApproveRevisedPI={handleApproveRevisedPI}
        onRejectRevisedPI={handleRejectRevisedPI}
      />

      <ImportPreviewModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        importPreview={importPreview}
        importing={importing}
        onImport={handleImportLeads}
      />

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onSave={handleCustomerSave}
        />
      )}

      <EditLeadModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editFormData={editFormData}
        onFormChange={setEditFormData}
        onSave={handleSaveEdit}
        usernames={usernames}
        loadingUsers={loadingUsers}
        usersError={usersError}
      />

      <AssignLeadModal
        isOpen={showAssignModal && (assigningLead || selectedLeadIds.length > 0)}
        onClose={() => setShowAssignModal(false)}
        assigningLead={assigningLead}
        selectedLeadIds={selectedLeadIds}
        assignForm={assignForm}
        onFormChange={setAssignForm}
        onAssign={async () => {
          try {
            if (assigningLead) {
              const leadId = assigningLead.id;
              // Preserve existing status fields during reassignment
              const payload = {
                assignedSalesperson: assignForm.salesperson || null,
                assignedTelecaller: assignForm.telecaller || null,
                // Preserve status fields
                salesStatus: assigningLead.salesStatus || assigningLead.sales_status || '',
                followUpStatus: assigningLead.followUpStatus || assigningLead.follow_up_status || '',
                salesStatusRemark: assigningLead.salesStatusRemark || assigningLead.sales_status_remark || '',
                followUpRemark: assigningLead.followUpRemark || assigningLead.follow_up_remark || '',
              };
              await leadService.updateLead(leadId, payload);
              setLeadsData(prev => {
                const updated = [];
                for (let i = 0; i < prev.length; i++) {
                  const l = prev[i];
                  if (l.id === leadId) {
                    updated.push({
                      ...l,
                      assignedSalesperson: payload.assignedSalesperson || '',
                      assignedTelecaller: payload.assignedTelecaller || '',
                      // Preserve status
                      salesStatus: payload.salesStatus,
                      followUpStatus: payload.followUpStatus,
                    });
                  } else {
                    updated.push(l);
                  }
                }
                return updated;
              });
              toastManager.success('Lead reassigned successfully');
              setAssigningLead(null);
            } else {
              // For bulk reassign, preserve status from each lead
              const selectedLeads = leadsData.filter(l => selectedLeadIds.includes(l.id));
              const basePayload = {
                assignedSalesperson: assignForm.salesperson || null,
                assignedTelecaller: assignForm.telecaller || null,
              };
              
              // Update each lead individually to preserve status
              const updatePromises = selectedLeads.map(lead => {
                const payload = {
                  ...basePayload,
                  // Preserve status for each lead
                  salesStatus: lead.salesStatus || lead.sales_status || '',
                  followUpStatus: lead.followUpStatus || lead.follow_up_status || '',
                  salesStatusRemark: lead.salesStatusRemark || lead.sales_status_remark || '',
                  followUpRemark: lead.followUpRemark || lead.follow_up_remark || '',
                };
                return leadService.updateLead(lead.id, payload);
              });
              
              await Promise.all(updatePromises);
              
              const selectedSet = new Set(selectedLeadIds);
              setLeadsData(prev => {
                return prev.map(l => {
                  if (selectedSet.has(l.id)) {
                    const lead = selectedLeads.find(sl => sl.id === l.id);
                    return {
                      ...l,
                      assignedSalesperson: basePayload.assignedSalesperson || '',
                      assignedTelecaller: basePayload.assignedTelecaller || '',
                      // Preserve status
                      salesStatus: lead?.salesStatus || lead?.sales_status || l.salesStatus || l.sales_status || '',
                      followUpStatus: lead?.followUpStatus || lead?.follow_up_status || l.followUpStatus || l.follow_up_status || '',
                    };
                  }
                  return l;
                });
              });
              toastManager.success(`Reassigned ${selectedLeadIds.length} leads successfully`);
              setSelectedLeadIds([]);
              setIsAllSelected(false);
            }
            try {
              const response = await leadService.fetchLeads(buildLeadFetchParams());
              applyLeadResponse(response, { refreshAll: true });
            } catch (e) {}
            setShowAssignModal(false);
          } catch (err) {
            apiErrorHandler.handleError(err, 'assign lead');
          }
        }}
        usernames={usernames}
        loadingUsers={loadingUsers}
        usersError={usersError}
      />

      {showEnquiryEditModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setShowEnquiryEditModal(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-[51] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Enquiry</h3>
                <button
                  onClick={() => setShowEnquiryEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <input
                    type="text"
                    value={enquiryEditForm.customer_name}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                  <input
                    type="text"
                    value={enquiryEditForm.business}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, business: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    rows="2"
                    value={enquiryEditForm.address}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={enquiryEditForm.state}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <input
                    type="text"
                    value={enquiryEditForm.division}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, division: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enquired Product</label>
                  <input
                    type="text"
                    value={enquiryEditForm.enquired_product}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, enquired_product: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={enquiryEditForm.product_quantity}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, product_quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Remark</label>
                  <textarea
                    rows="2"
                    value={enquiryEditForm.product_remark}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, product_remark: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up Status</label>
                  <input
                    type="text"
                    value={enquiryEditForm.follow_up_status}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, follow_up_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up Remark</label>
                  <input
                    type="text"
                    value={enquiryEditForm.follow_up_remark}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, follow_up_remark: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Status</label>
                  <input
                    type="text"
                    value={enquiryEditForm.sales_status}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, sales_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Status Remark</label>
                  <input
                    type="text"
                    value={enquiryEditForm.sales_status_remark}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, sales_status_remark: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson</label>
                  <input
                    type="text"
                    value={enquiryEditForm.salesperson}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, salesperson: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telecaller</label>
                  <input
                    type="text"
                    value={enquiryEditForm.telecaller}
                    onChange={(e) => setEnquiryEditForm(prev => ({ ...prev, telecaller: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEnquiryEditModal(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEnquiryEdit}
                  className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showQuotationModal && selectedQuotation && (
        <QuotationPreview
          quotationData={selectedQuotation}
          companyBranches={COMPANY_BRANCHES}
          user={DEFAULT_USER}
          onClose={() => setShowQuotationModal(false)}
        />
      )}

      {showPIPreview && piPreviewData && (
        <PIPreview
          piData={piPreviewData}
          companyBranches={COMPANY_BRANCHES}
          user={DEFAULT_USER}
          onClose={() => {
            setShowPIPreview(false);
            setPiPreviewData(null);
          }}
        />
      )}

      {showActivityModal && viewingActivity && (
        <div className="fixed inset-0 bg-black/50 z-[160] flex items-center justify-center p-4" onClick={() => setShowActivityModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activity Details</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Activity Type</label>
                  <p className="text-base text-gray-900 mt-1">{viewingActivity.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Performed By</label>
                  <p className="text-base text-gray-900 mt-1">{viewingActivity.performed_by_name || viewingActivity.performed_by || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Date & Time</label>
                  <p className="text-base text-gray-900 mt-1">{new Date(viewingActivity.created_at).toLocaleString('en-IN')}</p>
                </div>
                {viewingActivity.metadata && Object.keys(viewingActivity.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Details</label>
                    <div className="mt-2 bg-gray-50 rounded-lg p-4">
                      {Object.entries(viewingActivity.metadata).map(([key, value]) => (
                        <div key={key} className="mb-2 last:mb-0">
                          <span className="text-sm font-medium text-gray-700">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
                          <span className="text-sm text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button onClick={() => setShowActivityModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomerTimeline && timelineLead && (
        <CustomerDetailSidebar
          customer={timelineLead}
          onClose={() => {
            setShowCustomerTimeline(false);
            setTimelineLead(null);
          }}
          onEdit={(lead) => {
            if (lead) handleEdit(lead);
          }}
          onQuotation={(customer) => {
            setShowCustomerTimeline(false);
            toastManager.info('Please use the quotation creation workflow from the main page');
          }}
          quotations={quotations.filter(q => (q.customerId || q.customer_id) === timelineLead?.id)}
          onViewQuotation={(quotation) => {
            if (quotation?.id) {
              handleViewQuotation(quotation.id);
            } else {
              toastManager.error('Quotation data is missing');
            }
          }}
          onApproveQuotation={handleApproveQuotation}
          onRejectQuotation={handleRejectQuotation}
          canApproveQuotations={['department_head', 'superadmin'].includes((user?.role || '').toLowerCase())}
          onEditQuotation={(quotation, customer) => {
            setShowCustomerTimeline(false);
            toastManager.info('Please use the quotation editing workflow from the main page');
          }}
          onDeleteQuotation={(quotation) => {
            if (window.confirm('Are you sure you want to delete this quotation?')) {
              toastManager.success('Quotation deleted successfully');
            }
          }}
          onCreatePI={(quotation, customer) => {
            setShowCustomerTimeline(false);
            toastManager.info('Please use the PI creation workflow from the main page');
          }}
          quotationPIs={quotationPIsMap}
          piHook={{
            fetchPIsForQuotation: async (quotationId) => {
              await fetchPIsForLead();
            },
            handleDeletePI: async (piId) => {
              if (window.confirm('Are you sure you want to delete this PI?')) {
                toastManager.info('PI deletion not implemented');
              }
            },
            handleApprovePI: handleApprovePI,
            handleRejectPI: handleRejectPI
          }}
          onViewPI={(piId) => {
            if (piId) {
              handleViewPI(piId);
            }
          }}
          onUpdateStatus={() => {
            setShowCustomerTimeline(false);
            toastManager.info('Please use the status update workflow from the main page');
          }}
          onPricingRfp={() => {
            setShowCustomerTimeline(false);
            toastManager.info('Please use the RFP workflow from the main page');
          }}
          onSendEmail={() => {}}
          onDocs={() => {}}
          renderUpdateStatusContent={null}
          renderRfpContent={null}
          renderSendEmailContent={(onClose) => {
            const leadFormat = (lead) => ({
              id: lead?.id ?? lead?._id,
              name: lead?.name || lead?.customer,
              email: lead?.email,
              phone: lead?.phone,
              business: lead?.business
            });
            return <SendEmailForm customer={leadFormat(timelineLead)} onClose={onClose} />;
          }}
          renderDocsContent={(onClose) => {
            const leadId = timelineLead?.id ?? timelineLead?._id;
            return leadId ? <UploadDocs leadId={leadId} onClose={onClose} /> : null;
          }}
          onViewActivity={handleViewActivity}
          onDeleteActivity={handleDeleteActivity}
          onEditEnquiry={handleEditEnquiryFromActivity}
        />
      )}

    </div>
  );
};

export default LeadsSimplified;
