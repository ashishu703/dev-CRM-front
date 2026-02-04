import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, User, DollarSign, Clock, Calendar, Link, Copy, Eye, MoreHorizontal, CreditCard, AlertCircle, CheckCircle, XCircle, ChevronDown, Edit, Package, RotateCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Building2, Users, Hash, MapPin, FileText, ShoppingCart, Truck, Settings, BarChart3, RotateCcw } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';
import departmentHeadService from '../../api/admin_api/departmentHeadService';
import PaymentInfoTable from '../../components/payment/PaymentInfoTable';
import { SkeletonTable, SkeletonStatCard } from '../../components/dashboard/DashboardSkeleton';

const PAYMENT_INFO_TABS = [
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'payment-status', label: 'Payment Status', icon: BarChart3 }
];

const PaymentInfo = () => {
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [departmentHeadsMap, setDepartmentHeadsMap] = useState({}); // Map to store department head info
  const [leadsMap, setLeadsMap] = useState({}); // Map lead_id -> {companyName, departmentType}
  
  // Date range filter
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  
  const [payments, setPayments] = useState([]);
  const [allPaymentsData, setAllPaymentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Initial page load state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Payment Status tab: by lead (salesperson, lead name, total/paid/pending)
  const [paymentStatusRows, setPaymentStatusRows] = useState([]);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentStatusSearch, setPaymentStatusSearch] = useState('');
  const [showPaymentStatusFilter, setShowPaymentStatusFilter] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState({
    department_head: '',
    salesperson: '',
    lead_name: '',
    start_date: '',
    end_date: ''
  });
  const [paymentStatusOptions, setPaymentStatusOptions] = useState({
    departmentHeads: [],
    salespersons: []
  });
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [leadDetailsData, setLeadDetailsData] = useState(null);
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false);
  const [selectedLeadName, setSelectedLeadName] = useState('');

  const openLeadDetails = async (row) => {
    if (row.lead_id == null) return;
    setSelectedLeadName(row.lead_name || 'Lead');
    setShowLeadDetailsModal(true);
    setLeadDetailsData(null);
    setLeadDetailsLoading(true);
    try {
      const res = await paymentService.getLeadDetails(row.lead_id);
      if (res?.success && res?.data) setLeadDetailsData(res.data);
      else setLeadDetailsData(null);
    } catch {
      setLeadDetailsData(null);
    } finally {
      setLeadDetailsLoading(false);
    }
  };

  const fetchPaymentStatus = async (filterOverrides = null) => {
    setPaymentStatusLoading(true);
    const filters = filterOverrides !== null ? filterOverrides : paymentStatusFilter;
    const params = {};
    if (filters.department_head) params.department_head = filters.department_head;
    if (filters.salesperson) params.salesperson = filters.salesperson;
    if (filters.lead_name) params.lead_name = filters.lead_name;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    try {
      const res = await paymentService.getPaymentStatusByLead(params);
      if (res?.success && Array.isArray(res?.data)) {
        setPaymentStatusRows(res.data);
        if (Object.keys(params).length === 0) {
          const dhSet = new Set();
          const spSet = new Set();
          res.data.forEach((r) => {
            if (r.department_head_name) dhSet.add(r.department_head_name);
            if (r.salesperson_name) spSet.add(r.salesperson_name);
          });
          setPaymentStatusOptions({
            departmentHeads: [...dhSet].sort(),
            salespersons: [...spSet].sort()
          });
        }
      } else {
        setPaymentStatusRows([]);
      }
    } catch (e) {
      setPaymentStatusRows([]);
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  const applyPaymentStatusFilter = () => {
    setShowPaymentStatusFilter(false);
    fetchPaymentStatus();
  };

  const clearPaymentStatusFilter = () => {
    const empty = { department_head: '', salesperson: '', lead_name: '', start_date: '', end_date: '' };
    setPaymentStatusFilter(empty);
    setShowPaymentStatusFilter(false);
    fetchPaymentStatus(empty);
  };

  useEffect(() => {
    if (activeTab === 'payment-status') {
      fetchPaymentStatus();
    }
  }, [activeTab]);

  // Fetch all leads to get company name and department type
  const fetchLeads = async () => {
    try {
      let allLeads = [];
      let page = 1;
      const limit = 100;
      
      while (true) {
        const response = await departmentHeadService.getAllLeads({
          page,
          limit
        });
        
        const leadsData = response?.data || response?.leads || [];
        if (!leadsData || leadsData.length === 0) break;
        
        allLeads = allLeads.concat(leadsData);
        
        const pagination = response?.pagination;
        if (!pagination || page >= pagination.pages || leadsData.length < limit) break;
        page += 1;
      }
      
      // Create a map: lead_id -> {companyName, departmentType}
      // Store both string and number versions of ID for matching
      const leadsDataMap = {};
      allLeads.forEach(lead => {
        if (lead.id) {
          const leadId = String(lead.id);
          const leadIdNum = Number(lead.id);
          const leadInfo = {
            companyName: lead.company_name || lead.companyName || 'N/A',
            departmentType: lead.department_type || lead.departmentType || ''
          };
          // Store with both string and number keys for flexible matching
          leadsDataMap[leadId] = leadInfo;
          if (!isNaN(leadIdNum)) {
            leadsDataMap[leadIdNum] = leadInfo;
          }
        }
      });
      
      setLeadsMap(leadsDataMap);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Fetch all department heads to map company + department to department head name
  const fetchDepartmentHeads = async () => {
    try {
      let allHeads = [];
      let page = 1;
      const limit = 100;
      
      while (true) {
        const response = await departmentHeadService.listHeads({
          page,
          limit,
          isActive: true
        });
        
        const heads = response?.users || response?.data?.users || [];
        if (!heads || heads.length === 0) break;
        
        allHeads = allHeads.concat(heads);
        
        const pagination = response?.pagination || response?.data?.pagination;
        if (!pagination || page >= pagination.pages || heads.length < limit) break;
        page += 1;
      }
      
      // Create a map: "companyName|departmentType" -> department head name
      const headsMap = {};
      allHeads.forEach(head => {
        const companyName = head.company_name || head.companyName || '';
        const departmentType = head.department_type || head.departmentType || '';
        const key = `${companyName}|${departmentType}`;
        if (key !== '|') { 
          headsMap[key] = head.username || head.email || 'N/A';
        }
      });
      
      setDepartmentHeadsMap(headsMap);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Fetch all payments from all companies and departments
  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      
      const response = await paymentService.getAllPayments({
        page: 1,
        limit: 10000
      });
      
      const paymentsData = response?.data || [];
      
      // Transform payment data
      const transformedPayments = paymentsData.map((payment) => {
        const paymentAmount = Number(payment.installment_amount || payment.paid_amount || 0);
        const quotationTotal = Number(payment.quotation_total_amount || payment.total_quotation_amount || 0);
        const quotationTotalPaid = Number(payment.quotation_total_paid || 0);
        const quotationRemainingDue = Number(payment.quotation_remaining_due || 0);
        
        const approvalStatus = (payment.approval_status || '').toLowerCase();
        let displayStatus = 'Due';
        
        if (approvalStatus === 'rejected') {
          displayStatus = 'Rejected';
        } else {
          if (quotationTotal > 0) {
            if (quotationTotalPaid >= quotationTotal) {
              displayStatus = 'Paid';
            } else if (quotationTotalPaid > 0) {
              displayStatus = 'Advance';
            }
          } else if (quotationTotalPaid > 0) {
            displayStatus = 'Advance';
          }
        }
        
        const paymentDateObj = payment.payment_date ? new Date(payment.payment_date) : (payment.created_at ? new Date(payment.created_at) : null);
        const formattedPaymentDate = paymentDateObj ? paymentDateObj.toLocaleDateString('en-GB') : 'N/A';
        
        // Get company name, department type, and department head name from backend response
        // Fallback to mapping if backend data is not available
        const companyName = payment.lead_company_name && payment.lead_company_name !== 'N/A' 
          ? payment.lead_company_name 
          : (leadsMap[payment.lead_id]?.companyName || 'N/A');
        
        const departmentType = payment.lead_department_type && payment.lead_department_type !== 'N/A'
          ? payment.lead_department_type
          : (leadsMap[payment.lead_id]?.departmentType || '');
        
        const departmentHeadName = payment.department_head_name && payment.department_head_name !== 'N/A'
          ? payment.department_head_name
          : (departmentHeadsMap[`${companyName}|${departmentType}`] || 'N/A');
        
        return {
          id: payment.id,
          leadId: payment.lead_id,
          leadIdDisplay: `LD-${payment.lead_id}`,
          customer: {
            name: payment.customer_name || payment.lead_customer_name || 'N/A',
            email: payment.lead_email || 'N/A',
            phone: payment.lead_phone || 'N/A'
          },
          productName: payment.product_name_from_quotation || payment.product_name || 'N/A',
          address: payment.address || 'N/A',
          salespersonName: payment.salesperson_name || payment.salespersonName || 'N/A',
          companyName: companyName,
          departmentHeadName: departmentHeadName,
          amount: paymentAmount,
          quotationTotal: quotationTotal,
          quotationTotalPaid: quotationTotalPaid,
          quotationRemainingDue: quotationRemainingDue,
          totalAmount: quotationTotal,
          paidAmount: quotationTotalPaid,
          dueAmount: quotationRemainingDue,
          status: displayStatus,
          paymentStatus: payment.payment_status || 'pending',
          approvalStatus: payment.approval_status || 'pending',
          created: payment.payment_date ? new Date(payment.payment_date).toLocaleString() : (payment.created_at ? new Date(payment.created_at).toLocaleString() : ''),
          paymentDate: payment.payment_date || payment.created_at,
          formattedPaymentDate: formattedPaymentDate,
          paymentLink: payment.payment_receipt_url || '',
          quotationId: payment.quotation_number || `QT-${String(payment.quotation_id || '').slice(-4)}`,
          quotationIdRaw: payment.quotation_id || null, // Store raw quotation_id for grouping
          piId: payment.pi_number || `PI-${String(payment.pi_id || '').slice(-4)}`,
          purchaseOrderId: payment.purchase_order_id || 'N/A',
          deliveryDate: payment.delivery_date ? new Date(payment.delivery_date).toLocaleDateString('en-GB') : 'N/A',
          deliveryStatus: payment.delivery_status || 'pending',
          paymentData: payment
        };
      });
      
      setAllPaymentsData(transformedPayments);
      setPayments(transformedPayments);
      return true;
    } catch (e) {
      setAllPaymentsData([]);
      setPayments([]);
      setPagination({ page: 1, limit: 50, total: 0, pages: 0 });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load fallback data on component mount (optional, backend provides this data)
  useEffect(() => {
    Promise.all([fetchLeads(), fetchDepartmentHeads()]).catch(() => {
      // Silently fail - backend provides the main data
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch payments - no longer need to wait for maps since backend provides the data
  useEffect(() => {
    const loadPayments = async () => {
      if (initialLoading) {
        await fetchAllPayments();
        setInitialLoading(false);
      }
    };
    
    loadPayments();
  }, [initialLoading]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, statusFilter, dateRange.startDate, dateRange.endDate]);

  // Client-side filtering
  const filteredPayments = allPaymentsData.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.leadIdDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.quotationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.departmentHeadName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All Status') {
      if (statusFilter === 'Due') {
        // For "Due" filter, check if payment has a due amount > 0
        const dueAmount = Number(payment.quotationRemainingDue || payment.dueAmount || 0);
        matchesStatus = dueAmount > 0 && payment.status !== 'Paid' && payment.status !== 'Rejected';
      } else {
        matchesStatus = payment.status === statusFilter;
      }
    }
    
    let matchesDateRange = true;
    if (dateRange.startDate || dateRange.endDate) {
      if (!payment.paymentDate) {
        matchesDateRange = false;
      } else {
        const paymentDate = new Date(payment.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        
        if (dateRange.startDate) {
          const startDate = new Date(dateRange.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (paymentDate < startDate) {
            matchesDateRange = false;
          }
        }
        
        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (paymentDate > endDate) {
            matchesDateRange = false;
          }
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Calculate pagination
  const totalFiltered = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.limit));
  
  useEffect(() => {
    if (totalPages > 0 && pagination.page > totalPages) {
      setPagination(prev => ({ ...prev, page: totalPages }));
    }
  }, [totalPages, pagination.page]);
  
  const currentPage = Math.min(Math.max(1, pagination.page), totalPages);
  const startIndex = (currentPage - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + pagination.limit, totalFiltered);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    if (validPage >= 1 && validPage <= totalPages && validPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: validPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(pagination.page - 1);
  const goToNextPage = () => goToPage(pagination.page + 1);

  // Calculate stats using PaymentInfoTable utility
  const stats = PaymentInfoTable.calculateStats(filteredPayments);

  const getStatusColor = PaymentInfoTable.getStatusColor;
  const formatCurrency = PaymentInfoTable.formatCurrency;
  
  const getStatusIcon = (status) => {
    const Icon = PaymentInfoTable.getStatusIcon(status);
    return <Icon className="w-4 h-4" />;
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
  };

  const handleViewPayment = (payment) => {
    setViewingPayment(payment);
    setShowViewModal(true);
    setTimeout(() => {
      setIsModalAnimating(true);
    }, 10);
  };

  const closeViewModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setShowViewModal(false);
      setViewingPayment(null);
    }, 300);
  };


  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setEditFormData({
      customerId: payment.customerId,
      customerName: payment.customer.name,
      customerEmail: payment.customer.email,
      customerPhone: payment.customer.phone,
      amount: payment.amount,
      totalAmount: payment.totalAmount,
      dueAmount: payment.dueAmount,
      status: payment.status,
      paymentLink: payment.paymentLink
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPayment(null);
    setEditFormData({});
  };

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (editingPayment) {
      console.log('Updated payment:', editFormData);
      alert(`Payment updated successfully!`);
    }
    closeEditModal();
  };

  // Handle click outside to close filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
      if (showDateRangeFilter && !event.target.closest('.date-range-filter')) {
        setShowDateRangeFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown, showDateRangeFilter]);

  const StatCard = ({ title, value, subtitle, color, bgColor, icon: Icon }) => {
    const gradientMap = {
      'text-blue-600': 'from-blue-500 to-cyan-500',
      'text-green-600': 'from-green-500 to-emerald-500',
      'text-purple-600': 'from-purple-500 to-pink-500',
      'text-red-600': 'from-red-500 to-rose-500'
    };
    const gradient = gradientMap[color] || 'from-blue-500 to-cyan-500';
    
    return (
      <div className={`${bgColor} rounded-2xl border-2 p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`} style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
          </div>
        </div>
        <div className="mt-3">
          <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`} style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
          <p className="text-xs text-gray-600 mt-2 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>
        </div>
      </div>
    );
  };

  // Show skeleton loader while initial data is loading
  if (initialLoading) {
    return (
      <div className="min-h-screen p-6" style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        </div>

        {/* Stats Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Search and filters skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-10 bg-gray-200 rounded w-96 animate-pulse"></div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
          </div>

          {/* Table skeleton */}
          <SkeletonTable rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Info</h1>
            <p className="text-sm text-gray-600 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>View payment details from all companies and department heads</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {PAYMENT_INFO_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/90 border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Payment Status tab content */}
      {activeTab === 'payment-status' && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-xl mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Status by Lead</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by lead, salesperson, department head..."
                  value={paymentStatusSearch}
                  onChange={(e) => setPaymentStatusSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPaymentStatusFilter(!showPaymentStatusFilter)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    showPaymentStatusFilter || [paymentStatusFilter.department_head, paymentStatusFilter.salesperson, paymentStatusFilter.lead_name, paymentStatusFilter.start_date, paymentStatusFilter.end_date].some(Boolean)
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {[paymentStatusFilter.department_head, paymentStatusFilter.salesperson, paymentStatusFilter.lead_name, paymentStatusFilter.start_date, paymentStatusFilter.end_date].filter(Boolean).length > 0 && (
                    <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {[paymentStatusFilter.department_head, paymentStatusFilter.salesperson, paymentStatusFilter.lead_name, paymentStatusFilter.start_date, paymentStatusFilter.end_date].filter(Boolean).length}
                    </span>
                  )}
                </button>
                {showPaymentStatusFilter && (
                  <>
                    <div className="absolute right-0 top-full mt-2 z-20 w-80 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4">
                      <div className="text-sm font-semibold text-gray-800 mb-3">Quick filters</div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Department Head</label>
                          <select
                            value={paymentStatusFilter.department_head}
                            onChange={(e) => setPaymentStatusFilter((f) => ({ ...f, department_head: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="">All</option>
                            {paymentStatusOptions.departmentHeads.map((name) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Salesperson</label>
                          <select
                            value={paymentStatusFilter.salesperson}
                            onChange={(e) => setPaymentStatusFilter((f) => ({ ...f, salesperson: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="">All</option>
                            {paymentStatusOptions.salespersons.map((name) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Lead Name</label>
                          <input
                            type="text"
                            value={paymentStatusFilter.lead_name}
                            onChange={(e) => setPaymentStatusFilter((f) => ({ ...f, lead_name: e.target.value }))}
                            placeholder="Type to filter..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                            <input
                              type="date"
                              value={paymentStatusFilter.start_date}
                              onChange={(e) => setPaymentStatusFilter((f) => ({ ...f, start_date: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                            <input
                              type="date"
                              value={paymentStatusFilter.end_date}
                              onChange={(e) => setPaymentStatusFilter((f) => ({ ...f, end_date: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={clearPaymentStatusFilter}
                          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={applyPaymentStatusFilter}
                          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <div
                      className="fixed inset-0 z-10"
                      aria-hidden
                      onClick={() => setShowPaymentStatusFilter(false)}
                    />
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => fetchPaymentStatus()}
                disabled={paymentStatusLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 text-sm font-medium"
              >
                <RotateCcw className={`w-4 h-4 ${paymentStatusLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Department Head</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Salesperson</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Lead Name</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentStatusLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent" />
                        Loading payment status...
                      </div>
                    </td>
                  </tr>
                ) : (() => {
                  const filtered = paymentStatusRows.filter((row) => {
                    if (!paymentStatusSearch.trim()) return true;
                    const q = paymentStatusSearch.toLowerCase();
                    return (
                      (row.lead_name || '').toLowerCase().includes(q) ||
                      (row.salesperson_name || '').toLowerCase().includes(q) ||
                      (row.department_head_name || '').toLowerCase().includes(q)
                    );
                  });
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No payment status data. Ensure leads have approved/completed quotations.
                        </td>
                      </tr>
                    );
                  }
                  return filtered.map((row, idx) => (
                    <tr key={row.lead_id != null ? `lead-${row.lead_id}` : `row-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.department_head_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.salesperson_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className="inline-flex items-center gap-2">
                          <span>{row.lead_name}</span>
                          <button
                            type="button"
                            onClick={() => openLeadDetails(row)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="View lead details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        ₹{Number(row.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                        ₹{Number(row.paid_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                        ₹{Number(row.pending_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead details modal (Payment Status tab) */}
      {showLeadDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLeadDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Lead details – {selectedLeadName}</h3>
              <button type="button" onClick={() => setShowLeadDetailsModal(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                <span className="sr-only">Close</span>×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {leadDetailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent" />
                </div>
              ) : leadDetailsData ? (
                <>
                  {leadDetailsData.lead && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" /> Lead info
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Name</span><br />{leadDetailsData.lead.name}</div>
                        {leadDetailsData.lead.phone && <div><span className="text-gray-500">Phone</span><br />{leadDetailsData.lead.phone}</div>}
                        {leadDetailsData.lead.email && <div><span className="text-gray-500">Email</span><br />{leadDetailsData.lead.email}</div>}
                        {leadDetailsData.lead.business && <div><span className="text-gray-500">Business</span><br />{leadDetailsData.lead.business}</div>}
                        {leadDetailsData.lead.address && <div className="sm:col-span-2"><span className="text-gray-500">Address</span><br />{leadDetailsData.lead.address}</div>}
                        {leadDetailsData.lead.gst_no && <div><span className="text-gray-500">GST No</span><br />{leadDetailsData.lead.gst_no}</div>}
                      </div>
                    </div>
                  )}
                  {(leadDetailsData.payment_summary || (leadDetailsData.quotations && leadDetailsData.quotations.length > 0)) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Payment summary
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        {leadDetailsData.payment_summary && (
                          <div className="flex flex-wrap gap-4">
                            <span>Total: <strong>₹{Number(leadDetailsData.payment_summary.total_quotation_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
                            <span className="text-green-600">Paid: <strong>₹{Number(leadDetailsData.payment_summary.total_paid || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
                            <span className="text-red-600">Remaining: <strong>₹{Number(leadDetailsData.payment_summary.current_remaining || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
                            {Number(leadDetailsData.payment_summary.current_credit || 0) > 0 && (
                              <span className="text-blue-600">Credit: <strong>₹{Number(leadDetailsData.payment_summary.current_credit).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
                            )}
                          </div>
                        )}
                        {leadDetailsData.quotations && leadDetailsData.quotations.length > 0 && (
                          <div>
                            <p className="text-gray-500 mt-2 mb-1">Quotations</p>
                            <ul className="divide-y divide-gray-200">
                              {leadDetailsData.quotations.map((q) => (
                                <li key={q.id} className="py-2 flex justify-between items-center">
                                  <span>{q.quotation_number}</span>
                                  <span>₹{Number(q.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} (Paid: ₹{Number(q.paid_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {leadDetailsData.payments && leadDetailsData.payments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Payment history
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b"><th className="text-left py-2">Quotation</th><th className="text-left py-2">Date</th><th className="text-right py-2">Amount</th><th className="text-left py-2">Status</th></tr></thead>
                          <tbody>
                            {leadDetailsData.payments.map((p) => (
                              <tr key={p.id} className="border-b border-gray-100">
                                <td className="py-2">{p.quotation_number || '–'}</td>
                                <td className="py-2">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN') : '–'}</td>
                                <td className="py-2 text-right">₹{Number(p.installment_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                <td className="py-2">{p.approval_status || '–'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {leadDetailsData.rfps && leadDetailsData.rfps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> RFP details
                      </h4>
                      <div className="space-y-4">
                        {leadDetailsData.rfps.map((rfp) => (
                          <div key={rfp.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <span className="font-medium">{rfp.rfp_id}</span>
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">{rfp.status}</span>
                              {rfp.company_name && <span className="text-gray-500 text-sm">{rfp.company_name}</span>}
                              {rfp.created_at && <span className="text-gray-400 text-xs">{new Date(rfp.created_at).toLocaleString('en-IN')}</span>}
                            </div>
                            {rfp.delivery_timeline && <p className="text-sm text-gray-600 mb-1"><span className="text-gray-500">Delivery:</span> {rfp.delivery_timeline}</p>}
                            {rfp.special_requirements && <p className="text-sm text-gray-600 mb-2"><span className="text-gray-500">Requirements:</span> {rfp.special_requirements}</p>}
                            {rfp.products && rfp.products.length > 0 && (
                              <table className="w-full text-sm mt-2">
                                <thead><tr className="border-b text-gray-500"><th className="text-left py-1">Product</th><th className="text-right py-1">Qty</th><th className="text-left py-1">Unit</th><th className="text-right py-1">Target price</th></tr></thead>
                                <tbody>
                                  {rfp.products.map((prod) => (
                                    <tr key={prod.id} className="border-b border-gray-100">
                                      <td className="py-1">{prod.product_spec || '–'}</td>
                                      <td className="py-1 text-right">{prod.quantity != null ? prod.quantity : '–'}</td>
                                      <td className="py-1">{prod.length_unit || '–'}</td>
                                      <td className="py-1 text-right">{prod.target_price != null ? `₹${Number(prod.target_price).toLocaleString('en-IN')}` : '–'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!leadDetailsData.lead && !leadDetailsData.payment_summary && (!leadDetailsData.quotations || leadDetailsData.quotations.length === 0) && (!leadDetailsData.rfps || leadDetailsData.rfps.length === 0) && (
                    <p className="text-gray-500 text-sm">No details found for this lead.</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">Failed to load lead details.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payments tab: Stats Cards + table */}
      {activeTab === 'payments' && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <StatCard
          title="All Payments"
          value={stats.allPayments}
          subtitle={`₹${stats.totalValue.toLocaleString('en-IN')} total value`}
          color="text-blue-600"
          bgColor="bg-blue-50 border-blue-200"
          icon={CreditCard}
        />
        <StatCard
          title="Paid"
          value={stats.paid}
          subtitle="Fully paid"
          color="text-green-600"
          bgColor="bg-green-50 border-green-200"
          icon={CheckCircle}
        />
        <StatCard
          title="Advance"
          value={stats.advance}
          subtitle="Partial payments"
          color="text-purple-600"
          bgColor="bg-purple-50 border-purple-200"
          icon={Clock}
        />
        <StatCard
          title="Due"
          value={stats.due}
          subtitle="Pending payments"
          color="text-red-600"
          bgColor="bg-red-50 border-red-200"
          icon={XCircle}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-xl" style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="flex items-center justify-between mb-6">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Lead ID, customer, company, department head..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium shadow-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Filter */}
            <div className="relative date-range-filter">
              <button
                onClick={() => setShowDateRangeFilter(!showDateRangeFilter)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-200 shadow-sm font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
                {(dateRange.startDate || dateRange.endDate) && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">●</span>
                )}
              </button>
              
              {showDateRangeFilter && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setDateRange({ startDate: '', endDate: '' });
                        setShowDateRangeFilter(false);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowDateRangeFilter(false)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-200 shadow-sm font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">Status Filter</div>
                    <button 
                      onClick={() => { setStatusFilter('All Status'); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === 'All Status' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      All Status
                    </button>
                    <button 
                      onClick={() => { setStatusFilter('Paid'); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === 'Paid' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      Paid
                    </button>
                    <button 
                      onClick={() => { setStatusFilter('Advance'); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === 'Advance' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      Advance
                    </button>
                    <button 
                      onClick={() => { setStatusFilter('Due'); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === 'Due' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      Due
                    </button>
                    <button 
                      onClick={() => { setStatusFilter('Rejected'); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === 'Rejected' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer min-w-[140px] font-medium shadow-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Advance">Advance</option>
              <option value="Due">Due</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <button 
              onClick={() => {
                Promise.all([
                  fetchLeads(),
                  fetchDepartmentHeads()
                ]).then(() => {
                  fetchAllPayments();
                });
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold"
              style={{
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                fontFamily: 'Inter, sans-serif'
              }}
              title="Refresh payments"
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden" style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Hash className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Lead ID</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Customer Name</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Company</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Department Head</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Salesperson</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Product Name</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Address</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Quotation ID</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Status</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Date</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Purchase Order</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Delivery Date</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>Action</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="13" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                        Loading payments...
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-lg font-medium mb-1">No Payments Found</p>
                        <p className="text-sm">
                          {allPaymentsData.length === 0 
                            ? 'No payment data available. Payments will appear here once quotations have PIs and payments are approved.'
                            : 'No payments match your current filters. Try adjusting your search or filter criteria.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">
                        {payment.leadIdDisplay || `LD-${payment.leadId}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{payment.customer?.name || 'N/A'}</div>
                        {payment.customer?.phone && (
                          <div className="text-xs text-gray-600 mt-1">{payment.customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{payment.companyName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{payment.departmentHeadName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{payment.salespersonName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{payment.productName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        {(() => {
                          const address = payment.address || 'N/A';
                          if (!address || address === 'N/A') return <span className="text-sm text-gray-700">N/A</span>;
                          const parts = address.split(',').map(part => part.trim()).filter(part => part);
                          return parts.length > 0 ? parts.map((part, idx) => (
                            <span key={idx} className="text-sm text-gray-700">{part}</span>
                          )) : <span className="text-sm text-gray-700">N/A</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-mono">{payment.quotationId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </span>
                          {payment.amount > 0 && (
                            <span className="text-sm text-gray-600">₹{payment.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          )}
                        </div>
                        {payment.quotationTotal > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Order:</span> ₹{payment.quotationTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} | 
                            <span className="text-green-600 font-medium"> Paid:</span> ₹{payment.quotationTotalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })} | 
                            <span className="text-red-600 font-medium"> Due:</span> ₹{payment.quotationRemainingDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{payment.formattedPaymentDate || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{payment.purchaseOrderId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{payment.deliveryDate || 'N/A'}</span>
                        <span className={`text-xs mt-1 ${payment.deliveryStatus === 'delivered' ? 'text-green-600' : payment.deliveryStatus === 'pending' ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {payment.deliveryStatus || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View payment details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, totalFiltered)} of {totalFiltered} payments
              {totalFiltered !== allPaymentsData.length && (
                <span className="ml-2 text-blue-600">
                  (filtered from {allPaymentsData.length} total)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page:</label>
              <select
                value={pagination.limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
          
          {totalPages > 1 && totalFiltered > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {totalPages > 0 && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <span className="text-sm text-gray-600 px-2 whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* View Payment Modal - Same as SalesDepartmentHead */}
      {showViewModal && viewingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className={`absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto ${
            isModalAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Payment Overview</h2>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{viewingPayment.leadIdDisplay}</h3>
                      <p className="text-sm text-gray-600">Payment Details</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingPayment.status)}`}>
                        {getStatusIcon(viewingPayment.status)}
                        {viewingPayment.status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Customer Name</label>
                      <p className="text-sm text-gray-900">{viewingPayment.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Email Address</label>
                      <p className="text-sm text-gray-900">{viewingPayment.customer.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Phone Number</label>
                      <p className="text-sm text-gray-900">{viewingPayment.customer.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Company</label>
                      <p className="text-sm text-gray-900">{viewingPayment.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Department Head</label>
                      <p className="text-sm text-gray-900">{viewingPayment.departmentHeadName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <label className="text-xs font-medium text-gray-700">This Payment Amount</label>
                      <p className="text-green-600 font-semibold text-base">{formatCurrency(viewingPayment.amount)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <label className="text-xs font-medium text-gray-700">Quotation Total (Order Amount)</label>
                      <p className="text-gray-900 font-semibold text-base">{formatCurrency(viewingPayment.quotationTotal || viewingPayment.totalAmount)}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <label className="text-xs font-medium text-gray-700">Total Paid (All Approved Payments)</label>
                      <p className="text-green-600 font-semibold text-base">{formatCurrency(viewingPayment.quotationTotalPaid || viewingPayment.paidAmount)}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-200">
                      <label className="text-xs font-medium text-gray-700">Remaining Due</label>
                      <p className="text-red-600 font-semibold text-base">{formatCurrency(viewingPayment.quotationRemainingDue || viewingPayment.dueAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={closeViewModal}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInfo;

