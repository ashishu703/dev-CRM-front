import React, { useState, useEffect } from 'react';
import { Search, Filter, User, DollarSign, Clock, Calendar, Link, Eye, CreditCard, AlertCircle, CheckCircle, XCircle, ChevronDown, Edit, FileText, RotateCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';
import workOrderService from '../../services/WorkOrderService';
import DynamicWorkOrderRenderer from '../../components/WorkOrder/DynamicWorkOrderRenderer';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';

const PaymentsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  const [selectedPaymentForWorkOrder, setSelectedPaymentForWorkOrder] = useState(null);
  const [workOrderData, setWorkOrderData] = useState(null);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);
  const [workOrderError, setWorkOrderError] = useState(null);
  const [showWorkOrderView, setShowWorkOrderView] = useState(false);
  const [showWorkOrderDelete, setShowWorkOrderDelete] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workOrders, setWorkOrders] = useState({});
  
  // Date range filter
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
  
  const [allPaymentsData, setAllPaymentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments({
        page: 1,
        limit: 10000
      });
      
      const paymentsData = response?.data || [];
      const transformedPayments = paymentsData.map(payment => {
        const paymentAmount = Number(payment.installment_amount || payment.paid_amount || 0);
        const quotationTotal = Number(payment.quotation_total_amount || payment.total_quotation_amount || 0);
        const quotationTotalPaid = Number(payment.quotation_total_paid || 0);
        const quotationRemainingDue = Number(payment.quotation_remaining_due || 0);
        
        const approvalStatus = (payment.approval_status || '').toLowerCase();
        let displayStatus = 'Due';
        
        if (approvalStatus === 'rejected') {
          displayStatus = 'Rejected';
        } else if (quotationTotal > 0) {
            if (quotationTotalPaid >= quotationTotal) {
              displayStatus = 'Paid';
            } else if (quotationTotalPaid > 0) {
              displayStatus = 'Advance';
            }
          } else if (quotationTotalPaid > 0) {
            displayStatus = 'Advance';
        }
        
        const paymentDateObj = payment.payment_date ? new Date(payment.payment_date) : (payment.created_at ? new Date(payment.created_at) : null);
        const formattedPaymentDate = paymentDateObj ? paymentDateObj.toLocaleDateString('en-GB') : 'N/A';
        
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
          quotationIdRaw: payment.quotation_id || null,
          piId: payment.pi_number || `PI-${String(payment.pi_id || '').slice(-4)}`,
          purchaseOrderId: payment.purchase_order_id || 'N/A',
          deliveryDate: payment.delivery_date ? new Date(payment.delivery_date).toLocaleDateString('en-GB') : 'N/A',
          deliveryStatus: payment.delivery_status || 'pending',
          paymentData: payment
        };
      });
      
      setAllPaymentsData(transformedPayments);
    } catch (e) {
      console.error('Failed to load payments:', e);
      setAllPaymentsData([]);
      setPagination({ page: 1, limit: 50 });
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  const fetchWorkOrderForPayment = React.useCallback(async (payment) => {
    const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
    if (!quotationId) return null;
    
    try {
      const response = await workOrderService.checkQuotationWorkOrder(quotationId);
      if (response?.success && response.exists && response.data && !response.data.is_deleted) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching work order:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      if (allPaymentsData.length === 0) return;
      
      const workOrdersMap = {};
      const uniqueQuotationIds = new Set();
      
      allPaymentsData.forEach(payment => {
        const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
        if (quotationId) uniqueQuotationIds.add(quotationId);
      });
      
      const promises = Array.from(uniqueQuotationIds).map(async (quotationId) => {
        try {
          const mockPayment = { quotationId, orderId: quotationId, quotation_number: quotationId };
          const wo = await fetchWorkOrderForPayment(mockPayment);
          if (wo && !wo.is_deleted && (wo.work_order_number || wo.id)) {
            workOrdersMap[quotationId] = wo;
          }
        } catch (error) {
          console.error('Error fetching work order:', error);
        }
      });
      
      await Promise.all(promises);
      setWorkOrders(workOrdersMap);
    };

    fetchWorkOrders();
  }, [allPaymentsData, fetchWorkOrderForPayment]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, statusFilter, dateRange.startDate, dateRange.endDate]);

  const filteredPayments = allPaymentsData.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.leadIdDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.quotationId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All Status') {
      if (statusFilter === 'Due') {
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
          if (paymentDate < startDate) matchesDateRange = false;
        }
        
        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (paymentDate > endDate) matchesDateRange = false;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

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

  // Calculate stats based on filtered payments
  // Group by quotation_id to avoid counting same quotation multiple times
  // One quotation can have multiple payment installments, but should be counted once
  const quotationMap = new Map();
  
  filteredPayments.forEach(payment => {
    // Use quotation_id if available, otherwise use quotationId as fallback
    const quotationKey = payment.quotationIdRaw || payment.quotationId;
    
    if (!quotationMap.has(quotationKey)) {
      quotationMap.set(quotationKey, {
        quotationId: quotationKey,
        quotationTotal: Number(payment.quotationTotal || payment.totalAmount || 0),
        quotationTotalPaid: Number(payment.quotationTotalPaid || payment.paidAmount || 0),
        quotationRemainingDue: Number(payment.quotationRemainingDue || payment.dueAmount || 0),
        status: payment.status || '',
        paymentCount: 0
      });
    }
    
    // Update with latest values (in case different installments have different totals)
    const quotation = quotationMap.get(quotationKey);
    quotation.quotationTotal = Math.max(quotation.quotationTotal, Number(payment.quotationTotal || payment.totalAmount || 0));
    quotation.quotationTotalPaid = Math.max(quotation.quotationTotalPaid, Number(payment.quotationTotalPaid || payment.paidAmount || 0));
    quotation.quotationRemainingDue = Math.max(quotation.quotationRemainingDue, Number(payment.quotationRemainingDue || payment.dueAmount || 0));
    quotation.paymentCount += 1;
    
    // Update status based on latest payment status
    if (payment.status && payment.status !== 'Rejected') {
      if (payment.status === 'Paid') {
        quotation.status = 'Paid';
      } else if (payment.status === 'Advance' && quotation.status !== 'Paid') {
        quotation.status = 'Advance';
      } else if (payment.status === 'Due' && quotation.status !== 'Paid' && quotation.status !== 'Advance') {
        quotation.status = 'Due';
      }
    }
  });
  
  // Convert map to array for counting
  const uniqueQuotations = Array.from(quotationMap.values());
  
  // Count unique quotations with due amount > 0 (not individual payments)
  const dueQuotations = uniqueQuotations.filter(q => {
    const dueAmount = Number(q.quotationRemainingDue || 0);
    const status = q.status || '';
    return dueAmount > 0 && status !== 'Paid' && status !== 'Rejected';
  });
  
  const paidQuotations = uniqueQuotations.filter(q => q.status === 'Paid').length;
  const advanceQuotations = uniqueQuotations.filter(q => q.status === 'Advance').length;
  const rejectedQuotations = uniqueQuotations.filter(q => q.status === 'Rejected').length;
  
  const stats = {
    allPayments: filteredPayments.length,
    totalValue: filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
    paid: paidQuotations,
    advance: advanceQuotations,
    due: dueQuotations.length,
    rejected: rejectedQuotations
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Advance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Advance':
        return <Clock className="w-4 h-4" />;
      case 'Due':
        return <XCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  const handleGenerateWorkOrder = async (payment) => {
    setSelectedPaymentForWorkOrder(payment);
    setShowWorkOrder(true);
    setWorkOrderLoading(true);
    setWorkOrderError(null);
    setWorkOrderData(null);

    try {
      const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
      
      if (quotationId) {
        const checkResponse = await workOrderService.checkQuotationWorkOrder(quotationId);
        if (checkResponse?.success && checkResponse.exists && checkResponse.data) {
          const woData = checkResponse.data;
          setWorkOrderData(woData);
          setWorkOrders(prev => ({ ...prev, [quotationId]: woData }));
          setWorkOrderLoading(false);
          setShowWorkOrder(true);
          alert(`Work order already exists: ${woData.work_order_number}`);
          return;
        }
      }

      const woData = workOrderService.buildWorkOrderFromPayment(payment);
      const saveResponse = await workOrderService.saveWorkOrder(woData, payment);
      
      if (saveResponse?.success && saveResponse.data) {
        setWorkOrderData(saveResponse.data);
        if (quotationId) {
          setWorkOrders(prev => ({ ...prev, [quotationId]: saveResponse.data }));
        }
        alert('Work order created successfully!');
      } else if (saveResponse?.error?.includes('already exists')) {
        if (quotationId) {
          const checkResponse = await workOrderService.checkQuotationWorkOrder(quotationId);
          if (checkResponse?.success && checkResponse.exists && checkResponse.data) {
            const existingWO = checkResponse.data;
            setWorkOrderData(existingWO);
            setShowWorkOrder(true);
            if (quotationId) {
              setWorkOrders(prev => ({ ...prev, [quotationId]: existingWO }));
            }
            alert(`Work order already exists: ${existingWO.work_order_number}`);
            setWorkOrderLoading(false);
            return;
          }
        }
        setWorkOrderError(saveResponse.error);
        alert('Work order already exists. Please refresh the page.');
      } else {
        setWorkOrderError(saveResponse?.error || 'Failed to create work order');
        alert(saveResponse?.error || 'Failed to create work order');
      }
    } catch (error) {
      console.error('Error generating work order:', error);
      setWorkOrderError(error.message || 'Failed to generate work order');
    } finally {
      setWorkOrderLoading(false);
    }
  };

  const handleWorkOrderClose = () => {
    setShowWorkOrder(false);
    setSelectedPaymentForWorkOrder(null);
    setWorkOrderData(null);
    setWorkOrderError(null);
  };

  const handleViewWorkOrder = async (payment) => {
    const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
    if (!quotationId) {
      alert('No quotation ID found for this payment');
      return;
    }

    setWorkOrderLoading(true);
    try {
      // Check if already in state, otherwise fetch
      let wo = workOrders[quotationId];
      if (!wo) {
        wo = await fetchWorkOrderForPayment(payment);
        if (wo) {
          // Update state for future use
          setWorkOrders(prev => ({ ...prev, [quotationId]: wo }));
        }
      }
      
      if (wo) {
        setSelectedWorkOrder(wo);
        setWorkOrderData(wo);
        setShowWorkOrderView(true);
      } else {
        alert('Work order not found for this quotation');
      }
    } catch (error) {
      console.error('Error viewing work order:', error);
      alert('Failed to load work order');
    } finally {
      setWorkOrderLoading(false);
    }
  };

  const handleEditWorkOrder = async (payment) => {
    const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
    if (!quotationId) {
      alert('No quotation ID found for this payment');
      return;
    }

    setWorkOrderLoading(true);
    setWorkOrderError(null);
    try {
      const wo = await fetchWorkOrderForPayment(payment);
      if (wo) {
        setSelectedWorkOrder(wo);
        setWorkOrderData(wo);
        setSelectedPaymentForWorkOrder(payment);
        setShowWorkOrder(true);
      } else {
        alert('Work order not found. Please create one first.');
      }
    } catch (error) {
      console.error('Error editing work order:', error);
      setWorkOrderError('Failed to load work order');
      alert('Failed to load work order');
    } finally {
      setWorkOrderLoading(false);
    }
  };

  const handleDeleteWorkOrder = async (payment) => {
    const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
    if (!quotationId) {
      alert('No quotation ID found for this payment');
      return;
    }

    setWorkOrderLoading(true);
    try {
      let wo = workOrders[quotationId];
      if (!wo) {
        wo = await fetchWorkOrderForPayment(payment);
        if (wo) {
          setWorkOrders(prev => ({ ...prev, [quotationId]: wo }));
        }
      }
      
      if (wo) {
        setSelectedWorkOrder(wo);
        setShowWorkOrderDelete(true);
      } else {
        alert('Work order not found');
      }
    } catch (error) {
      console.error('Error loading work order:', error);
      alert('Failed to load work order');
    } finally {
      setWorkOrderLoading(false);
    }
  };

  const confirmDeleteWorkOrder = async () => {
    if (!selectedWorkOrder || selectedWorkOrder.is_deleted) return;

    try {
      const response = await workOrderService.deleteWorkOrder(selectedWorkOrder.id);
      if (response?.success !== false) {
        alert('Work order deleted successfully');
        setShowWorkOrderDelete(false);
        setSelectedWorkOrder(null);
        
        const quotationId = selectedWorkOrder.bna_number || selectedWorkOrder.quotation_id;
        if (quotationId) {
          setWorkOrders(prev => {
            const updated = { ...prev };
            delete updated[quotationId];
            return updated;
          });
        }
        
        fetchAllPayments();
      } else {
        alert(response?.message || 'Failed to delete work order');
      }
    } catch (error) {
      console.error('Error deleting work order:', error);
      alert(error?.message || 'Failed to delete work order');
    }
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

  // Show skeleton loader on initial load (AFTER all hooks)
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  const StatCard = ({ title, value, subtitle, color, bgColor, icon: Icon }) => (
    <div className={`${bgColor} rounded-lg border p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
      </div>
      <div className="mb-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Stats Cards */}
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Lead ID, customer, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors text-gray-700"
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Filter */}
            <div className="relative date-range-filter">
              <button
                onClick={() => setShowDateRangeFilter(!showDateRangeFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
                {(dateRange.startDate || dateRange.endDate) && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">●</span>
                )}
              </button>
              
              {showDateRangeFilter && (
                <>
                  {/* Mobile overlay */}
                  <div 
                    className="fixed inset-0 bg-black/50 z-[15] sm:hidden"
                    onClick={() => setShowDateRangeFilter(false)}
                  />
                  <div className="fixed sm:absolute top-1/2 sm:top-full right-1/2 sm:right-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm sm:max-w-none bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-3 sm:p-4">
                    {/* Modal Header with Close Button */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Select Date Range</h3>
                      <button
                        onClick={() => setShowDateRangeFilter(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Close"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          setDateRange({ startDate: '', endDate: '' });
                          setShowDateRangeFilter(false);
                        }}
                        className="w-full sm:flex-1 px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowDateRangeFilter(false)}
                        className="w-full sm:flex-1 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Advance">Advance</option>
              <option value="Due">Due</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <button 
              onClick={fetchAllPayments}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              title="Refresh payments"
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[800px] sm:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Lead ID</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Customer Name</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Salesperson</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Product Name</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Address</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Quotation ID</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Payment Status</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Payment Date</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Purchase Order</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Delivery Date</span>
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: pagination.limit }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="flex gap-2"><div className="h-8 w-8 bg-gray-200 rounded"></div><div className="h-8 w-8 bg-gray-200 rounded"></div></div></td>
                  </tr>
                  ))
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-3 sm:px-6 py-6 sm:py-8 text-center">
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
                ) : paginatedPayments.map((payment, index) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900 font-medium">
                        {payment.leadIdDisplay || `LD-${payment.leadId}`}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{payment.customer?.name || 'N/A'}</div>
                        {payment.customer?.phone && (
                          <div className="text-xs text-gray-600 mt-1">{payment.customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900 font-medium">{payment.salespersonName || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900">{payment.productName || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
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
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900 font-mono">{payment.quotationId || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
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
                        {/* Show quotation-level summary for clarity */}
                        {payment.quotationTotal > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Order:</span> ₹{payment.quotationTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} | 
                            <span className="text-green-600 font-medium"> Paid:</span> ₹{payment.quotationTotalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })} | 
                            <span className="text-red-600 font-medium"> Due:</span> ₹{payment.quotationRemainingDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900">{payment.formattedPaymentDate || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-sm text-gray-900">{payment.purchaseOrderId || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{payment.deliveryDate || 'N/A'}</span>
                        <span className={`text-xs mt-1 ${payment.deliveryStatus === 'delivered' ? 'text-green-600' : payment.deliveryStatus === 'pending' ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {payment.deliveryStatus || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View payment details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(() => {
                          const quotationId = payment.quotationId || payment.orderId || payment.quotation_number;
                          const wo = quotationId ? workOrders[quotationId] : null;
                          const isDeleted = wo?.is_deleted;
                          
                          if (!wo) {
                            return (
                        <button
                          onClick={() => handleGenerateWorkOrder(payment)}
                          className="w-8 h-8 flex items-center justify-center text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Generate Work Order"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                            );
                          }
                          
                          return (
                            <>
                              <button
                                onClick={() => handleViewWorkOrder(payment)}
                                className="w-8 h-8 flex items-center justify-center text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                title={`View Work Order: ${wo.work_order_number || ''}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!isDeleted && (
                                <>
                                  <button
                                    onClick={() => handleEditWorkOrder(payment)}
                                    className="w-8 h-8 flex items-center justify-center text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                                    title="Edit Work Order"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWorkOrder(payment)}
                                    className="w-8 h-8 flex items-center justify-center text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete Work Order"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {isDeleted && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  DELETED
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No results message */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-200 gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, totalFiltered)} of {totalFiltered} payments
              {totalFiltered !== allPaymentsData.length && (
                <span className="ml-2 text-blue-600">
                  (filtered from {allPaymentsData.length} total)
                </span>
              )}
            </div>
            
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Rows per page:</label>
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && totalFiltered > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {/* First page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous page */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
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
              
              {/* Page info */}
              <span className="text-sm text-gray-600 px-2 whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Overview Modal */}
      {showViewModal && viewingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className={`absolute right-0 top-0 h-full w-full sm:w-80 sm:max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto ${
            isModalAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment Overview</h2>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Payment Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{viewingPayment.customerId}</h3>
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

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Customer ID</label>
                      <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">{viewingPayment.customerId}</p>
                    </div>
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
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
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
                      <p className="text-xs text-gray-500 mt-1">Only payments approved by accounts department</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-200">
                      <label className="text-xs font-medium text-gray-700">Remaining Due</label>
                      <p className="text-red-600 font-semibold text-base">{formatCurrency(viewingPayment.quotationRemainingDue || viewingPayment.dueAmount)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Payment Status</label>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingPayment.status)}`}>
                          {getStatusIcon(viewingPayment.status)}
                          {viewingPayment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Timeline */}
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Payment Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Payment Created</p>
                        <p className="text-xs text-gray-500">{viewingPayment.created}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Link */}
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Link className="w-4 h-4 text-cyan-600" />
                    Payment Link
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={viewingPayment.paymentLink}
                      readOnly
                      className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono"
                    />
                    <button
                      onClick={() => handleCopyLink(viewingPayment.paymentLink)}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                    >
                      Copy
                    </button>
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

      {/* Work Order Modal - Dynamic Renderer with Template */}
      {showWorkOrder && selectedPaymentForWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col m-3 sm:m-4">
            {workOrderLoading ? (
              <div className="flex-1 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : workOrderError ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                  <p className="text-red-600 mb-4">{workOrderError}</p>
                  <button
                    onClick={handleWorkOrderClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : workOrderData ? (
              <div className="flex-1 overflow-auto">
                <DynamicWorkOrderRenderer
                  workOrderData={workOrderData}
          onClose={handleWorkOrderClose}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <p className="text-gray-600">No work order data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work Order View Modal */}
      {showWorkOrderView && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col m-3 sm:m-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Work Order Details</h2>
              <button
                onClick={() => {
                  setShowWorkOrderView(false);
                  setSelectedWorkOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <DynamicWorkOrderRenderer
                workOrderData={selectedWorkOrder}
                workOrderId={selectedWorkOrder.id}
                onClose={() => {
                  setShowWorkOrderView(false);
                  setSelectedWorkOrder(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Work Order Delete Confirmation Modal */}
      {showWorkOrderDelete && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 m-3 sm:m-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Work Order</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete work order <span className="font-semibold">{selectedWorkOrder.work_order_number}</span>?
              </p>
              <p className="text-sm text-gray-500">
                The work order will be marked as deleted and the corresponding sales order will also be updated.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowWorkOrderDelete(false);
                  setSelectedWorkOrder(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWorkOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsDashboard;