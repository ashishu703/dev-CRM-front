import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Clock, Phone, CheckCircle, XCircle, UserX, Calendar, Edit, ArrowRight, Search, RefreshCw, BarChart3, Users, DollarSign, Eye } from 'lucide-react';
import departmentUserService from '../../api/admin_api/departmentUserService';
import departmentHeadService from '../../api/admin_api/departmentHeadService';
import apiErrorHandler from '../../utils/ApiErrorHandler';
import toastManager from '../../utils/ToastManager';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';

const SalesDashboard = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Fetch user performance data
  useEffect(() => {
    const fetchUserPerformance = async () => {
      try {
        setLoading(true);
        const response = await departmentUserService.listUsers({ page: 1, limit: 100 });
        if (!response || !response.data) return setUserData([]);

        const users = response.data.users || response.data;

        // Helper: aggregate lead metrics for a user with all requested statuses
        const aggregateMetrics = (leads) => {
          const result = {
            totalLeads: 0,
            pending: 0,
            running: 0,
            converted: 0,
            interested: 0,
            winClosed: 0,
            closed: 0,
            lost: 0,
            meetingScheduled: 0,
            quotationSent: 0,
            closedLostFollowup: 0,
          };

          const total = Array.isArray(leads) ? leads.length : 0;
          result.totalLeads = total;
          
          for (const l of leads || []) {
            const salesStatus = String(l.sales_status || '').toLowerCase();
            const followUpStatus = String(l.follow_up_status || '').toLowerCase();
            
            // Count by sales_status
            switch (salesStatus) {
              case 'pending':
                result.pending += 1; break;
              case 'running':
              case 'in_progress':
                result.running += 1; break;
              case 'converted':
                result.converted += 1; break;
              case 'interested':
                result.interested += 1; break;
              case 'win/closed':
              case 'win':
              case 'win lead':
                result.winClosed += 1; break;
              case 'closed':
                result.closed += 1; break;
              case 'lost':
              case 'loose':
                result.lost += 1; break;
              default:
                break;
            }
            
            // Count by follow_up_status
            switch (followUpStatus) {
              case 'appointment scheduled':
              case 'meeting scheduled':
                result.meetingScheduled += 1; break;
              case 'quotation sent':
                result.quotationSent += 1; break;
              case 'closed/lost':
                result.closedLostFollowup += 1; break;
              default:
                break;
            }
          }
          
          return result;
        };

        // Fetch leads for each user in parallel and build performance rows
        const rows = await Promise.all(users.map(async (u) => {
          try {
            const leadsRes = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_BY_USERNAME(u.username));
            const leads = leadsRes?.data || leadsRes?.rows || [];
            const metrics = aggregateMetrics(leads);

            const target = parseFloat(u.target || u.target_amount || 0) || 0;
            const achieved = parseFloat(u.achieved_target || 0) || 0;
            const remaining = Math.max(target - achieved, 0);
            
            // Calculate days left
            let daysLeft = null;
            if (u.target_end_date || u.targetEndDate) {
              const endDate = new Date(u.target_end_date || u.targetEndDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);
              const diffTime = endDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              daysLeft = diffDays > 0 ? diffDays : 0;
            }

            return {
              id: u.id,
              username: u.username,
              email: u.email,
              department: u.departmentType === 'office_sales' ? 'Sales Department' : u.departmentType === 'marketing_sales' ? 'Marketing Department' : 'HR Department',
              role: u.isActive ? 'Department User' : 'Inactive User',
              associatedEmail: u.email,
              date: (u.createdAt || u.created_at) ? new Date(u.createdAt || u.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '',
              ...metrics,
              target: target,
              achievedTarget: achieved,
              remainingTarget: remaining,
              daysLeft: daysLeft,
            };
          } catch (e) {
            // Fallback if leads fetch fails for this user
            return {
              id: u.id,
              username: u.username,
              email: u.email,
              department: u.departmentType === 'office_sales' ? 'Sales Department' : u.departmentType === 'marketing_sales' ? 'Marketing Department' : 'HR Department',
              role: u.isActive ? 'Department User' : 'Inactive User',
              associatedEmail: u.email,
              date: (u.createdAt || u.created_at) ? new Date(u.createdAt || u.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '',
              totalLeads: 0,
              pending: 0,
              running: 0,
              converted: 0,
              interested: 0,
              winClosed: 0,
              closed: 0,
              lost: 0,
              meetingScheduled: 0,
              quotationSent: 0,
              closedLostFollowup: 0,
              target: parseFloat(u.target || 0) || 0,
              achievedTarget: parseFloat(u.achieved_target || 0) || 0,
              remainingTarget: Math.max(parseFloat(u.target || 0) - (parseFloat(u.achieved_target || 0) || 0), 0),
              daysLeft: null
            };
          }
        }));

        setUserData(rows);
      } catch (error) {
        apiErrorHandler.handleError(error, 'fetch user performance');
        toastManager.error('Failed to load user performance data');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchUserPerformance();
  }, []);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    setEditingUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      department: user.department,
      role: user.role,
      associatedEmail: user.associatedEmail,
      totalAmount: user.target,
      dueAmount: user.remainingTarget
    });
    setShowEditModal(true);
  };


  const handleViewUser = (user) => {
    console.log('View user:', user);
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({});
  };

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      // Update the user data (in a real app, this would be an API call)
      const userIndex = userData.findIndex(user => user.id === editingUser.id);
      
      if (userIndex !== -1) {
        // Update the user data
        const updatedUser = {
          ...userData[userIndex],
          ...editFormData
        };
        
        // In a real application, you would update the state or make an API call
        console.log('Updated user:', updatedUser);
        alert(`User ${editFormData.username} updated successfully!`);
      }
    }
    closeEditModal();
  };

  const getDepartmentPillStyle = (department) => {
    switch (department) {
      case 'Sales Department':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Automation Department':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Telesales Department':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRolePillStyle = (role) => {
    switch (role) {
      case 'Department Head':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Department User':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Filter users based on search term and date range
  const filterUsers = (users) => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      let matchesDateRange = true;
      if (dateRange.startDate || dateRange.endDate) {
        const userDate = new Date(user.date);
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

        if (startDate && endDate) {
          matchesDateRange = userDate >= startDate && userDate <= endDate;
        } else if (startDate) {
          matchesDateRange = userDate >= startDate;
        } else if (endDate) {
          matchesDateRange = userDate <= endDate;
        }
      }

      return matchesSearch && matchesDateRange;
    });
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearDateRange = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  const getFilteredUsers = () => {
    return filterUsers(userData);
  };

  // Show skeleton loader on initial load
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by username, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <div className="relative" ref={datePickerRef}>
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center space-x-2 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {dateRange.startDate && dateRange.endDate 
                    ? `${dateRange.startDate} - ${dateRange.endDate}`
                    : dateRange.startDate 
                    ? `From ${dateRange.startDate}`
                    : dateRange.endDate
                    ? `Until ${dateRange.endDate}`
                    : 'Select date range'
                  }
                </span>
              </button>
              
              {showDatePicker && (
                <>
                  {/* Mobile overlay */}
                  <div 
                    className="fixed inset-0 bg-black/50 z-[5] sm:hidden"
                    onClick={() => setShowDatePicker(false)}
                  />
                  <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm sm:max-w-none bg-white border border-gray-300 rounded-lg shadow-lg p-3 sm:p-4 z-10">
                    {/* Modal Header with Close Button */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Select Date Range</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Close"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
                        <button
                          onClick={clearDateRange}
                          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-700">
                  Showing {getFilteredUsers().length} of {userData.length} users
                </span>
                {(searchTerm || dateRange.startDate || dateRange.endDate) && (
                  <span className="text-xs text-blue-600">
                    {searchTerm && `Search: "${searchTerm}"`}
                    {searchTerm && (dateRange.startDate || dateRange.endDate) && ' • '}
                    {dateRange.startDate && `From: ${dateRange.startDate}`}
                    {dateRange.startDate && dateRange.endDate && ' • '}
                    {dateRange.endDate && `To: ${dateRange.endDate}`}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearDateRange();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* User Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[1000px] sm:min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase">#</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sales User</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Total Leads</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Pending</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Running</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Converted</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Interested</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Win/Closed</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Closed</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Lost</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Meeting Scheduled</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Quotation Sent</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Closed/Lost (F/U)</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Target</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Achieved</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Remaining</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Days Left</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="18" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading user performance data...</span>
                      </div>
                    </td>
                  </tr>
                ) : getFilteredUsers().length === 0 ? (
                  <tr>
                    <td colSpan="18" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                      No users found. Create some department users to see their performance.
                    </td>
                  </tr>
                ) : (
                  getFilteredUsers().map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-xs text-gray-500">{index + 1}</td>
                      <td className="px-3 py-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.totalLeads || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.pending || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.running || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.converted || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.interested || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.winClosed || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.closed || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.lost || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.meetingScheduled || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.quotationSent || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.closedLostFollowup || 0}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">₹{(user.target || 0).toLocaleString('en-IN')}</td>
                      <td className="px-2 py-3 text-center text-sm text-green-600 font-medium">₹{(user.achievedTarget || 0).toLocaleString('en-IN')}</td>
                      <td className="px-2 py-3 text-center text-sm text-red-600 font-medium">₹{(user.remainingTarget || 0).toLocaleString('en-IN')}</td>
                      <td className="px-2 py-3 text-center text-sm text-gray-900">{user.daysLeft !== null ? user.daysLeft : 'N/A'}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="w-6 h-6 flex items-center justify-center text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="w-6 h-6 flex items-center justify-center text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* User Details Right Sidebar */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex z-50">
          <div className="bg-white h-full w-full max-w-md ml-auto shadow-xl overflow-y-auto">
            <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">User Performance</h2>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Username</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Department</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.department}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Role</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Created Date</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedUser.date}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total Leads</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.totalLeads || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Pending</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Running</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.running || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Converted</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.converted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Interested</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.interested || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Win/Closed</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.winClosed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Closed</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.closed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Lost</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.lost || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Meeting Scheduled</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.meetingScheduled || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Quotation Sent</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.quotationSent || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Closed/Lost (Follow-up)</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.closedLostFollowup || 0}</span>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Financial Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Target</span>
                    <span className="text-sm font-semibold text-gray-900">₹{(selectedUser.target || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Achieved Target</span>
                    <span className="text-sm font-semibold text-green-600">₹{(selectedUser.achievedTarget || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Remaining Target</span>
                    <span className="text-sm font-semibold text-red-600">₹{(selectedUser.remainingTarget || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Days Left</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUser.daysLeft !== null ? selectedUser.daysLeft : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* User Information Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editFormData.username || ''}
                        onChange={(e) => handleFormChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={editFormData.department || ''}
                        onChange={(e) => handleFormChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Sales Department">Sales Department</option>
                        <option value="Automation Department">Automation Department</option>
                        <option value="Telesales Department">Telesales Department</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={editFormData.role || ''}
                        onChange={(e) => handleFormChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Sales Head">Sales Head</option>
                        <option value="Sales Rep">Sales Rep</option>
                        <option value="Office Sales Agent">Office Sales Agent</option>
                        <option value="Automation System">Automation System</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Associated Email</label>
                      <input
                        type="email"
                        value={editFormData.associatedEmail || ''}
                        onChange={(e) => handleFormChange('associatedEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Target (₹)</label>
                      <input
                        type="number"
                        value={editFormData.totalAmount || ''}
                        onChange={(e) => handleFormChange('totalAmount', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Target (₹)</label>
                      <input
                        type="number"
                        value={editFormData.dueAmount || ''}
                        onChange={(e) => handleFormChange('dueAmount', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
          </div>
        </div>
      </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Font Awesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
      />
    </div>
  );
};

export default SalesDashboard;