import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, LogOut, Trash2, Hash, User, Mail, Shield, Building, Target, Calendar, MoreHorizontal, TrendingUp, AlertTriangle, LogIn, Info } from 'lucide-react';
import departmentUserService, { apiToUiDepartment } from '../../api/admin_api/departmentUserService';
import departmentHeadService from '../../api/admin_api/departmentHeadService';
import { useAuth } from '../../hooks/useAuth';
import toastManager from '../../utils/ToastManager';
import { toDateOnly, toDateOnlyOrEmpty } from '../../utils/dateOnly';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const calculateDaysFromToday = (targetDate) => {
  if (!targetDate || isNaN(targetDate.getTime())) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  if (endDay < today) return 0;
  const diffTime = endDay - today;
  return Math.max(0, Math.round(diffTime / MS_IN_DAY));
};

const SalesDepartmentUser = ({ setActiveView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.achievedTarget.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.remainingTarget.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.duePayment.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // UI state (to preserve previous experience)
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    target: '',
    targetStartDate: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [remainingTarget, setRemainingTarget] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [headTargetStartDate, setHeadTargetStartDate] = useState(null);
  const [targetExpirationDate, setTargetExpirationDate] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});

  const handleAddUser = async () => {
    setShowAddModal(true);
    // Fetch department head info to get remaining days and target
    try {
      if (currentUser?.id) {
        const headRes = await departmentHeadService.getHeadById(currentUser.id);
        const headData = headRes?.data?.user || headRes?.user || headRes?.data || headRes;
        
        if (headData) {
          // Get department head's target start date
          // Prefer backend-normalized date-only field to avoid timezone shifts
          const headStartDate = headData.targetStartDate || headData.target_start_date;
          let formattedStartDate = null;
          if (headStartDate) {
            formattedStartDate = toDateOnly(headStartDate); // YYYY-MM-DD (local-safe)
            setHeadTargetStartDate(formattedStartDate);
            
            // Auto-set target start date in form
            setNewUser(prev => ({
              ...prev,
              targetStartDate: formattedStartDate
            }));
          }
          
          // Calculate remaining days and expiration date (month end logic)
          let daysRemaining = 0;
          let expirationDate = null;
          if (headStartDate) {
            const startDate = new Date(headStartDate);
            const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            
            // Format expiration date for display (DD-MM-YYYY)
            const day = String(monthEnd.getDate()).padStart(2, '0');
            const month = String(monthEnd.getMonth() + 1).padStart(2, '0');
            const year = monthEnd.getFullYear();
            expirationDate = `${day}-${month}-${year}`;
            setTargetExpirationDate(expirationDate);
            
            // Calculate days remaining until month end
            daysRemaining = calculateDaysFromToday(monthEnd);
          } else {
            setTargetExpirationDate(null);
          }
          setRemainingDays(daysRemaining);
          
          // Calculate remaining target
          const headTarget = parseFloat(headData.target || 0);
          const existingUsers = await departmentUserService.listUsers({
            headUserId: currentUser.id
          });
          const users = existingUsers?.data?.users || existingUsers?.users || [];
          const totalDistributed = users.reduce((sum, u) => sum + parseFloat(u.target || 0), 0);
          const remaining = Math.max(0, headTarget - totalDistributed);
          setRemainingTarget(remaining);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch department head info');
    }
  };
  const handleEdit = async (userId) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    
    // Fetch department head info to get remaining days and expiration date
    try {
      if (currentUser?.id) {
        const headRes = await departmentHeadService.getHeadById(currentUser.id);
        const headData = headRes?.data?.user || headRes?.user || headRes?.data || headRes;
        
        if (headData) {
          // Prefer backend-normalized date-only field to avoid timezone shifts
          const headStartDate = headData.targetStartDate || headData.target_start_date;
          let formattedStartDate = null;
          if (headStartDate) {
            formattedStartDate = toDateOnly(headStartDate); // YYYY-MM-DD (local-safe)
            setHeadTargetStartDate(formattedStartDate);
          }
          
          let daysRemaining = 0;
          let expirationDate = null;
          
          if (headStartDate) {
            const startDate = new Date(headStartDate);
            const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            
            // Format expiration date for display (DD-MM-YYYY)
            const day = String(monthEnd.getDate()).padStart(2, '0');
            const month = String(monthEnd.getMonth() + 1).padStart(2, '0');
            const year = monthEnd.getFullYear();
            expirationDate = `${day}-${month}-${year}`;
            setTargetExpirationDate(expirationDate);
            
            // Calculate days remaining until month end
            daysRemaining = calculateDaysFromToday(monthEnd);
          } else {
            setTargetExpirationDate(null);
          }
          setRemainingDays(daysRemaining);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch department head info');
    }
    
    // Format date for input field (YYYY-MM-DD format) - use already formatted input date if available
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      try {
        return toDateOnlyOrEmpty(dateString);
      } catch {
        return '';
      }
    };
    
    setEditingUser({ 
      ...u, 
      targetStartDateInput: u.targetStartDateInput || formatDateForInput(u.targetStartDate || u.target_start_date),
      targetEndDateInput: u.targetEndDateInput || formatDateForInput(u.targetEndDate || u.target_end_date)
    });
    setShowEditModal(true);
  };
  const { impersonate } = useAuth();
  const handleDelete = async (userId) => {
    try {
      await departmentUserService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleStatusToggle = async (user) => {
    if (statusUpdating[user.id]) return;
    const nextStatus = !user.isActive;
    setStatusUpdating(prev => ({ ...prev, [user.id]: true }));
    try {
      await departmentUserService.updateStatus(user.id, nextStatus);
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, isActive: nextStatus } : u))
      );
      toastManager.success(
        `User ${nextStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (err) {
      const message = err?.data?.error || err?.message || 'Failed to update status';
      setError(message);
      toastManager.error(message);
    } finally {
      setStatusUpdating(prev => {
        const copy = { ...prev };
        delete copy[user.id];
        return copy;
      });
    }
  };

  // NOTE: Removed old CSV import helpers (were injecting dummy users into UI state and not used by the UI)

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await departmentUserService.listUsers(params);
      const payload = res.data || res;
      const items = (payload.users || []).map(u => {
        const target = Number(u.target || 0);
        const achievedTarget = Number(u.achieved_target || 0);
        const remainingTarget = Number(u.remaining_target || 0);
        const duePayment = Number(u.duePayment || u.due_payment || 0);
        
        // Format dates properly for display (supports 'YYYY-MM-DD' and full ISO strings)
        const formatDateForDisplay = (dateString) => {
          if (!dateString) return null;
          try {
            const normalized = typeof dateString === 'string' && dateString.includes('T')
              ? dateString
              : `${dateString}T00:00:00`;
            const date = new Date(normalized);
            if (isNaN(date.getTime())) return null;
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
          } catch {
            return null;
          }
        };

        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          try {
            const normalized = typeof dateString === 'string' && dateString.includes('T')
              ? dateString
              : `${dateString}T00:00:00`;
            return toDateOnlyOrEmpty(normalized);
          } catch {
            return '';
          }
        };
        
        // Calculate target days remaining
        let targetDaysRemaining = null;
        if (u.targetEndDate || u.target_end_date) {
          const endDate = new Date(u.targetEndDate || u.target_end_date);
          endDate.setHours(23, 59, 59, 999);
          targetDaysRemaining = calculateDaysFromToday(endDate);
        } else if (u.targetStartDate || u.target_start_date) {
          // If no target_end_date, calculate from target_start_date (month end logic)
          const startDate = new Date(u.targetStartDate || u.target_start_date);
          
          // Calculate month end from start date
          const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          targetDaysRemaining = calculateDaysFromToday(monthEnd);
        } else {
          // If no target dates at all, calculate days left in current month (like dashboard)
          const now = new Date();
          const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          targetDaysRemaining = calculateDaysFromToday(last);
        }
        
        // UI-only: if target period is strictly expired, show 0 values until reassigned.
        // Some older records may not have target_end_date; in that case, treat month-end of target_start_date as the end.
        const isExpired = (() => {
          const now = new Date();
          const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          const rawEnd = u.targetEndDate || u.target_end_date;
          const rawStart = u.targetStartDate || u.target_start_date;

          let endDate = null;
          if (rawEnd) {
            endDate = new Date(rawEnd);
          } else if (rawStart) {
            const startDate = new Date(rawStart);
            if (!isNaN(startDate.getTime())) {
              endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            }
          }

          if (!endDate || isNaN(endDate.getTime())) return false;
          const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          return endDay < todayDay;
        })();

        const displayTarget = isExpired ? 0 : target;
        const displayAchieved = isExpired ? 0 : achievedTarget;
        const displayRemaining = isExpired ? 0 : remainingTarget;
        const displayDue = isExpired ? 0 : duePayment;

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          role: 'DEPARTMENT USER',
          department: apiToUiDepartment(u.departmentType || u.department_type),
          target: String(displayTarget),
          achievedTarget: String(displayAchieved),
          remainingTarget: String(displayRemaining),
          duePayment: String(displayDue),
          isActive: u.isActive ?? u.is_active ?? true,
          targetStartDate: u.targetStartDate || u.target_start_date || null,
          targetEndDate: u.targetEndDate || u.target_end_date || null,
          targetDurationDays: u.targetDurationDays || u.target_duration_days || null,
          targetStatus: u.targetStatus || u.target_status || 'active',
          createdAt: u.createdAt || u.created_at ? new Date(u.createdAt || u.created_at).toDateString() : '',
          targetDaysRemaining: targetDaysRemaining,
          // Add formatted dates for display
          targetStartDateDisplay: formatDateForDisplay(u.targetStartDate || u.target_start_date),
          targetEndDateDisplay: formatDateForDisplay(u.targetEndDate || u.target_end_date),
          // Add formatted dates for input fields
          targetStartDateInput: formatDateForInput(u.targetStartDate || u.target_start_date),
          targetEndDateInput: formatDateForInput(u.targetEndDate || u.target_end_date)
        };
      });
      setUsers(items);
      const pagination = payload.pagination || {};
      setTotal(pagination.total || 0);
      setPages(pagination.pages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm]);

  const getDepartmentBadgeColor = (department) => {
    switch (department) {
      case 'SALES DEPARTMENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OFFICE SALES DEPARTMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MARKETING DEPARTMENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show skeleton loader on initial load
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username, email, department type, target, achieved target, remaining target, or due payment"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
          
          <div className="flex items-center gap-3 ml-6">
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
            {/* Import removed (was unused and referenced removed handlers) */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Hash className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700">#</span>
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <User className="w-4 h-4 text-blue-600" />
                    Username
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Shield className="w-4 h-4 text-orange-600" />
                    Role
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Building className="w-4 h-4 text-indigo-600" />
                    Department Type
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Target className="w-4 h-4 text-cyan-600" />
                    Target
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Achieved Target
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Remaining Target
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Target className="w-4 h-4 text-orange-600" />
                    Due Payment
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Calendar className="w-4 h-4 text-red-600" />
                    Target Expiry
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Status
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    Created At
                  </div>
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <MoreHorizontal className="w-4 h-4" />
                    Action
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="py-8 px-4 text-center text-gray-500" colSpan={13}>Loading...</td></tr>
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr><td className="py-8 px-4 text-center text-gray-500" colSpan={13}>{error || 'No users found'}</td></tr>
              )}
              {!loading && filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-gray-700 font-medium">{user.id}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-gray-900 font-medium">{user.username}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-gray-700">{user.email}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="text-center">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200">
                        DEPARTMENT
                      </span>
                      <div className="text-xs text-gray-600 mt-1">USER</div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getDepartmentBadgeColor(user.department)}`}>
                      {user.department}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-gray-600">{user.target}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    {(() => {
                      const achievedTarget = Number(user.achievedTarget || 0);
                      const target = Number(user.target || 0);
                      const isAchievedGreaterOrEqual = achievedTarget >= target;
                      
                      // Format the actual achieved amount (not the difference)
                      const formatted = achievedTarget.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      });
                      
                      // Color based on whether target is met
                      const achievedClass = isAchievedGreaterOrEqual
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-50';
                      
                      return (
                        <span className={`${achievedClass} font-medium px-2 py-1 rounded-md`}>
                          {formatted}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md">
                      {Number(user.remainingTarget || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md">
                      ₹{Number(user.duePayment || user.due_payment || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {user.targetDaysRemaining !== null && user.targetDaysRemaining !== undefined ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
                        {user.targetDaysRemaining} days left
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-pressed={user.isActive}
                        aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                        disabled={statusUpdating[user.id]}
                        onClick={() => handleStatusToggle(user)}
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          user.isActive ? 'bg-green-500' : 'bg-gray-300'
                        } ${statusUpdating[user.id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                            user.isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-semibold ${user.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="text-gray-700">{user.createdAt}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={user.targetStatus === 'achieved' || user.targetStatus === 'unachieved' || user.targetStatus === 'overachieved' ? 'Set New Target' : 'Edit Target'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          // Login as this specific user
                          try {
                            const result = await impersonate(user.email);
                            if (result.success) {
                              const token = result.token || result?.user?.token || '';
                              const url = `${window.location.origin}/?impersonateToken=${encodeURIComponent(token)}`;
                              window.open(url, '_blank');
                            } else {
                              alert(result.error || 'Failed to login as user');
                            }
                          } catch (err) {
                            alert('Failed to login as user: ' + (err.message || 'Unknown error'));
                          }
                        }}
                        disabled={!user.isActive || statusUpdating[user.id]}
                        className={`p-2 rounded-lg transition-colors ${
                          !user.isActive || statusUpdating[user.id]
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={
                          user.isActive
                            ? 'Login as this user'
                            : 'User is inactive. Activate to allow login.'
                        }
                      >
                        <LogIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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


        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">1</span>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Add User</h3>
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ username: '', email: '', password: '', target: '', targetStartDate: '' });
                  setRemainingTarget(0);
                  setRemainingDays(0);
                  setHeadTargetStartDate(null);
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  // Only set dates if explicitly provided - no auto-selection
                  const payload = {
                    username: newUser.username,
                    email: newUser.email,
                    password: newUser.password,
                    headUserEmail: currentUser?.email,
                    target: Number(newUser.target || 0)
                  };
                  
                  // Always use department head's target start date
                  const targetStartDate = headTargetStartDate 
                    ? new Date(headTargetStartDate)
                    : (newUser.targetStartDate ? new Date(newUser.targetStartDate) : new Date());
                    
                  // Always use exactly remaining days - locked to department head's period (month end)
                  const finalDuration = remainingDays;
                  
                  if (finalDuration > 0 && targetStartDate) {
                    // Calculate target end date as month end (not start date + duration)
                    const monthEnd = new Date(targetStartDate.getFullYear(), targetStartDate.getMonth() + 1, 0);
                    monthEnd.setHours(23, 59, 59, 999);
                    
                    payload.targetStartDate = toDateOnly(targetStartDate);
                    payload.targetDurationDays = finalDuration;

                  }
                  
                  await departmentUserService.createUser(payload);
                  await fetchUsers();
                  setShowAddModal(false);
                  setNewUser({ username: '', email: '', password: '', target: '', targetStartDate: '' });
                  setRemainingTarget(0);
                  setRemainingDays(0);
                  setHeadTargetStartDate(null);
                  toastManager.success('User created successfully');
                } catch (err) {
                  // Extract error message from API response
                  const errorMessage = err?.data?.error || err?.data?.message || err?.message || 'Failed to create user';
                  setError(errorMessage);
                  toastManager.error(errorMessage);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Payment Target (Rs)
                    {remainingTarget > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Remaining: ₹{remainingTarget.toLocaleString('en-IN')})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={remainingTarget || undefined}
                    value={newUser.target}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (remainingTarget > 0 && value > remainingTarget) {
                        toastManager.error(`Target cannot exceed remaining limit: ₹${remainingTarget.toLocaleString('en-IN')}`);
                        return;
                      }
                      setNewUser({ ...newUser, target: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter payment target"
                  />
                  {remainingTarget > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum: ₹{remainingTarget.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Target Start Date
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      (Locked: matches department head)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={newUser.targetStartDate || headTargetStartDate || ''}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <div className="mt-1 flex items-start gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1.5 rounded">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Target start date is automatically set to {headTargetStartDate ? new Date(headTargetStartDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'match department head\'s target start date'}. This cannot be changed.</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Target Duration (Days)
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      (Locked: {remainingDays} days remaining - expires {targetExpirationDate || 'at month end'})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={`${remainingDays} days remaining (expires ${targetExpirationDate || 'at month end'})`}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <div className="mt-1 flex items-start gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1.5 rounded">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Target duration is automatically set to {remainingDays} days (expires on {targetExpirationDate ? new Date(targetExpirationDate.split('-').reverse().join('-')).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'month end'}) to match department head's remaining target period. This cannot be changed.</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowAddModal(false);
                  setNewUser({ username: '', email: '', password: '', target: '', targetStartDate: '' });
                    setRemainingTarget(0);
                  setRemainingDays(0);
                    setHeadTargetStartDate(null);
                    setTargetExpirationDate(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Edit User</h3>
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setTargetExpirationDate(null);
                  setRemainingDays(0);
                  setHeadTargetStartDate(null);
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingEdit(true);
                try {
                  // Build base payload
                  const payload = {
                    username: editingUser.username,
                    email: editingUser.email,
                    target: Number(editingUser.target || 0)
                  };
                  
                  // Always use department head's target start date and remaining days (locked)
                  const targetStartDate = headTargetStartDate 
                    ? new Date(headTargetStartDate)
                    : (editingUser.targetStartDate ? new Date(editingUser.targetStartDate) : 
                       (editingUser.target_start_date ? new Date(editingUser.target_start_date) : new Date()));
                    
                  // Always use exactly remaining days - locked to department head's period (month end)
                  const finalDuration = remainingDays;
                  
                  if (finalDuration > 0 && targetStartDate) {
                    // Calculate target end date as month end (not start date + duration)
                    // This ensures target expires at month end, matching department head's logic
                    const monthEnd = new Date(targetStartDate.getFullYear(), targetStartDate.getMonth() + 1, 0);
                    monthEnd.setHours(23, 59, 59, 999);
                    
                    payload.targetStartDate = toDateOnly(targetStartDate);
                    payload.targetDurationDays = finalDuration;

                  }
                  
                  await departmentUserService.updateUser(editingUser.id, payload);
                  await fetchUsers();
                  
                  // If current logged-in user's username/email was updated, refresh auth context
                  if (currentUser?.id === editingUser.id && (payload.username || payload.email)) {
                    try {
                      // Use refreshUser from AuthContext to update user data
                      const refreshResult = await refreshUser();
                      if (refreshResult?.success) {
                        toastManager.info('User data updated. Refreshing page...');
                        setTimeout(() => {
                          window.location.reload();
                        }, 500);
                        return; // Exit early to prevent closing modal before reload
                      } else {
                        toastManager.warning('User updated but failed to refresh session. Please log out and log in again.');
                      }
                    } catch (refreshError) {
                      console.error('Error refreshing user after update:', refreshError);
                      toastManager.warning('User updated but failed to refresh session. Please log out and log in again.');
                    }
                  }
                  
                  setShowEditModal(false);
                  setEditingUser(null);
                  toastManager.success('User updated successfully');
                } catch (err) {
                  // Extract error message from API response
                  const errorMessage = err?.data?.error || err?.data?.message || err?.message || 'Failed to update user';
                  setError(errorMessage);
                  toastManager.error(errorMessage);
                } finally {
                  setSavingEdit(false);
                }
              }}
            >
              <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Payment Target (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUser.target || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, target: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter payment target"
                  />
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">
                      Target Duration (Days)
                      <span className="ml-2 text-xs text-orange-600 font-medium">
                        (Locked: {remainingDays} days remaining - expires {targetExpirationDate || 'at month end'})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={`${remainingDays} days remaining (expires ${targetExpirationDate || 'at month end'})`}
                      disabled
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                    <div className="mt-1 flex items-start gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1.5 rounded">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>Target duration is automatically set to {remainingDays} days (expires on {targetExpirationDate || 'month end'}) to match department head's remaining target period. This cannot be changed.</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Target Start Date
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      (Locked: matches department head)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={headTargetStartDate || editingUser.targetStartDateInput || editingUser.targetStartDate || 
                          (editingUser.target_start_date ? toDateOnlyOrEmpty(editingUser.target_start_date) : '')}
                    disabled
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <div className="mt-1 flex items-start gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1.5 rounded">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Target start date is automatically set to {headTargetStartDate ? new Date(headTargetStartDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'match department head\'s target start date'}. This cannot be changed.</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDepartmentUser;
