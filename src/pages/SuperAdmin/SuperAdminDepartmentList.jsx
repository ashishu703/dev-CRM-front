import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, RefreshCw, Edit, Trash2, LogOut, Calendar, Users, Building, User, Mail, Filter, Eye, EyeOff, X } from 'lucide-react';
import departmentHeadService, { uiToApiDepartment, apiToUiDepartment } from '../../api/admin_api/departmentHeadService';
import departmentUserService from '../../api/admin_api/departmentUserService';
import { useAuth } from '../../hooks/useAuth';
import organizationService from '../../api/admin_api/organizationService';
import { SkeletonTable, SkeletonStatCard } from '../../components/dashboard/DashboardSkeleton';

const DepartmentManagement = () => {
  const { login, impersonate, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Departments');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const searchTimeoutRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [newDept, setNewDept] = useState({
    username: '',
    email: '',
    password: '',
    departmentType: '',
    companyName: '',
    role: 'department_head',
    monthlyTarget: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [companies, setCompanies] = useState([]);
  const isSuperAdmin = (user?.role === 'superadmin');

  const getDepartmentTypeColor = (type) => {
    switch (type) {
      case 'Sales Department':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300';
      case 'Marketing Department':
        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-300';
      case 'HR Department':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300';
      case 'Production Department':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-300';
      case 'Telesales Department':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300';
      case 'Accounts Department':
        return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-300';
      case 'IT Department':
        return 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-300';
      default:
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-300';
    }
  };

  const getRoleColor = (role) => {
    return role === 'Department Head' 
      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-300'
      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300';
  };

  const mapUserFromApi = (user) => {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: '',
      departmentType: apiToUiDepartment(user.departmentType || user.department_type),
      companyName: user.companyName || user.company_name,
      role: 'Department Head',
      target: user.target ?? user.monthlyTarget ?? '',
      isActive: user.isActive ?? user.is_active,
      createdAt: user.createdAt || user.created_at ? new Date(user.createdAt || user.created_at).toDateString() : '',
      targetDaysRemaining: user.targetDaysRemaining ?? null,
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
      };
      if (selectedFilter !== 'All Departments') params.departmentType = uiToApiDepartment(selectedFilter);
      if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();
      
      const headsRes = await departmentHeadService.listHeads(params);
      const heads = (headsRes.users || headsRes.data?.users || []).map(mapUserFromApi);
      const sorted = heads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDepartments(sorted);
      
      const pagination = headsRes.pagination || headsRes.data?.pagination || {};
      if (pagination) {
        setTotal(pagination.total || 0);
        setPages(pagination.pages || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await departmentUserService.getStats();
      setStats(res);
    } catch (err) {
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await organizationService.listActive();
      const items = res.organizations || res.data?.organizations || [];
      setCompanies(items);
    } catch (err) {
      console.error('Failed to load organizations for company list', err);
    }
  };

  const reload = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setIsRefreshing(false);
  };

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [page, limit, selectedFilter, debouncedSearchTerm]);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin && user?.departmentType) {
      setSelectedFilter(apiToUiDepartment(user.departmentType));
    }
  }, [isSuperAdmin, user?.departmentType]);

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setShowEditModal(true);
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentHeadService.deleteHead(deptId);
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // Update department function
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        username: selectedDept.username,
        email: selectedDept.email,
        departmentType: uiToApiDepartment(selectedDept.departmentType),
        companyName: selectedDept.companyName,
        role: 'department_head',
      };
      const apiDeptType = uiToApiDepartment(selectedDept.departmentType);
      if (apiDeptType === 'office_sales' || 
          apiDeptType === 'marketing_sales' || 
          apiDeptType === 'telesales') {
        payload.monthlyTarget = selectedDept.monthlyTarget || selectedDept.target || 0;
      }
      if (selectedDept.password) payload.password = selectedDept.password;
      await departmentHeadService.updateHead(selectedDept.id, payload);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedDept(null);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Frontend date filtering (backend doesn't support date filters)
  const isWithinDateRange = (dateStr) => {
    if (!dateFrom && !dateTo) return true;
    if (!dateStr) return false;
    try {
      const parsed = new Date(dateStr);
      const fromOk = dateFrom ? parsed >= new Date(dateFrom + 'T00:00:00') : true;
      const toOk = dateTo ? parsed <= new Date(dateTo + 'T23:59:59') : true;
      return fromOk && toOk;
    } catch (e) {
      return false;
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    return isWithinDateRange(dept.createdAt);
  });

  // Show skeleton loader on initial load
  if (initialLoading) {
    return (
      <div className="p-6 min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
        </div>
        <SkeletonTable rows={10} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-xl border border-blue-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" style={{
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {total}
              </div>
                <div className="text-gray-600 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Total Departments</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-xl border border-purple-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" style={{
            boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.2), 0 10px 10px -5px rgba(168, 85, 247, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {total}
              </div>
                <div className="text-gray-600 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Department Heads</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-xl border border-green-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" style={{
            boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.2), 0 10px 10px -5px rgba(34, 197, 94, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {(stats?.byDepartment || []).length || new Set(departments.map(dept => dept.departmentType)).size}
              </div>
                <div className="text-gray-600 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Department Types</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8" style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div className="flex items-center justify-between gap-6">
            <div className="relative w-full sm:w-1/4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 h-12 border-2 border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400 text-sm font-medium shadow-sm transition-all duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            
            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <button
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Department
                </button>
              )}

              <button
                className="p-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                aria-label="Refresh"
                title="Refresh"
                onClick={() => reload()}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <select 
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                disabled={!isSuperAdmin}
                className={`h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/90 backdrop-blur-sm text-sm font-medium shadow-sm transition-all duration-200 ${!isSuperAdmin ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                title="Department Type"
                aria-label="Department Type"
              >
                <option>All Departments</option>
                <option>Sales Department</option>
                <option>Marketing Department</option>
                <option>HR Department</option>
                <option>Production Department</option>
                <option>Accounts Department</option>
                <option>IT Department</option>
                <option>Telesales Department</option>
              </select>

              <button
                className="p-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                onClick={() => setShowFilters((s) => !s)}
                aria-expanded={showFilters}
                aria-controls="advanced-filters"
                aria-label="Filter"
                title="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          {showFilters && (
            <div id="advanced-filters" className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setPage(1); // Reset to first page when clearing filters
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    // Date filter is applied on frontend, no need to refetch
                    setShowFilters(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8" style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          {loading ? (
            <SkeletonTable rows={10} />
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No departments found</h3>
              <p className="text-gray-600 mb-6 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {departments.length === 0 
                  ? "Get started by adding your first department user."
                  : "No departments match your current filters. Try adjusting your search criteria."
                }
              </p>
              {departments.length === 0 && (
                <button
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 mx-auto font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add First Department
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {error && (
                <div className="text-sm text-red-600 p-3">{error}</div>
              )}
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200 text-gray-700">
                    <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 w-12">#</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span>Username</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <span>Department Type</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <span>Company Name</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span>Role</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span>Target (Rs)</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span>Target Expiry</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span>Created At</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <Edit className="w-4 h-4 text-white" />
                        </div>
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept, index) => (
                    <tr key={dept.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                      <td className="py-4 px-5 text-xs text-gray-500 align-top font-medium">{index + 1}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>{dept.username}</td>
                      <td className="py-4 px-6 text-sm text-gray-700 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{dept.email}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getDepartmentTypeColor(dept.departmentType)}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {dept.departmentType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {dept.companyName || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getRoleColor(dept.role)}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {dept.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{String(dept.target ?? '')}</td>
                      <td className="py-4 px-6 text-xs whitespace-nowrap">
                        {dept.targetDaysRemaining !== null && dept.targetDaysRemaining !== undefined ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200 shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {dept.targetDaysRemaining} days left
                          </span>
                        ) : (
                          <span className="text-gray-400 italic font-medium">Not set</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{dept.createdAt}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => handleEdit(dept)}
                            title="Edit Department"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => handleDelete(dept.id)}
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-green-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={async () => {
                              // Use current authenticated user from context instead of localStorage
                              if (user && user.role === 'superadmin') {
                                // Superadmin can directly switch without password (opens in new tab)
                                try {
                                  const result = await impersonate(dept.email);
                                  if (result.success) {
                                    const token = result.token || result?.user?.token || '';
                                    const url = `${window.location.origin}/?impersonateToken=${encodeURIComponent(token)}`;
                                    window.open(url, '_blank');
                                  } else {
                                    alert(result.error || 'Failed to switch user');
                                  }
                                } catch (err) {
                                  alert(err.message || 'Failed to switch user');
                                }
                              } else {
                                // Non‑superadmin must log in with password (no impersonation token)
                                setLoginData({
                                  email: dept.email,
                                  password: ''
                                });
                                setShowLoginModal(true);
                              }
                            }}
                            title="Login as this user"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between p-5 border-t-2 border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="text-sm text-gray-700 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Page <span className="text-blue-600">{page}</span> of <span className="text-blue-600">{Math.max(pages, 1)}</span> • Total <span className="text-purple-600">{total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600 font-medium transition-all duration-200 shadow-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-600 font-medium transition-all duration-200 shadow-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    disabled={page >= pages}
                    onClick={() => setPage((p) => (pages ? Math.min(pages, p + 1) : p + 1))}
                  >
                    Next
                  </button>
                  <select
                    className="ml-2 h-10 px-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium shadow-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    value={limit}
                    onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Department Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Add Department User</h3>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddModal(false)}
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
                    // Prevent accidental defaulting to Sales – department type must be chosen
                    if (!newDept.departmentType) {
                      alert('Please select a Department Type');
                      setSaving(false);
                      return;
                    }

                    // Validate company name is selected
                    if (!newDept.companyName || newDept.companyName.trim() === '') {
                      alert('Please select a Company Name');
                      setSaving(false);
                      return;
                    }

                    const payload = {
                      username: newDept.username.trim(),
                      email: newDept.email.trim(),
                      password: newDept.password,
                      departmentType: newDept.departmentType,
                      companyName: newDept.companyName.trim(),
                      role: newDept.role,
                    };
                    if (newDept.departmentType === 'office_sales' || 
                        newDept.departmentType === 'marketing_sales' || 
                        newDept.departmentType === 'telesales') {
                      payload.monthlyTarget = newDept.monthlyTarget || 0;
                    }
                    
                    console.log('📤 Submitting department head payload:', payload);
                    await departmentHeadService.createHead(payload);
                    await fetchUsers();
                    setShowAddModal(false);
                    setNewDept({
                      username: '',
                      email: '',
                      password: '',
                      departmentType: '',
                      companyName: 'Anode Electric Pvt. Ltd.',
                      role: 'department_head',
                      monthlyTarget: ''
                    });
                  } catch (err) {
                    alert(err.message || 'Failed to create user');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={newDept.username}
                      onChange={(e) => setNewDept({ ...newDept, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. john_doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newDept.email}
                      onChange={(e) => setNewDept({ ...newDept, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newDept.password}
                        onChange={(e) => setNewDept({ ...newDept, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Department Type</label>
                    <select
                      value={newDept.departmentType}
                      onChange={(e) => setNewDept({ ...newDept, departmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="">Select Department Type</option>
                      <option value="office_sales">Sales Department</option>
                      <option value="marketing_sales">Marketing Department</option>
                      <option value="hr">HR Department</option>
                      <option value="production">Production Department</option>
                      <option value="accounts">Accounts Department</option>
                      <option value="it">IT Department</option>
                      <option value="telesales">Telesales Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Company Name *</label>
                    <select
                      value={newDept.companyName}
                      onChange={(e) => {
                        console.log('🏢 Company selected:', e.target.value);
                        setNewDept({ ...newDept, companyName: e.target.value });
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="">Select Company Name</option>
                      {companies.length === 0 ? (
                        <option value="" disabled>No organizations available</option>
                      ) : (
                        companies.map((org) => (
                          <option key={org.id} value={org.name}>
                            {org.name}
                          </option>
                        ))
                      )}
                    </select>
                    {!newDept.companyName && (
                      <p className="text-red-500 text-xs mt-1">Please select a company name</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Role</label>
                    <select
                      value={newDept.role}
                      onChange={(e) => setNewDept({ ...newDept, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="department_head">Department Head</option>
                    </select>
                  </div>
                  {(newDept.departmentType === 'office_sales' || 
                    newDept.departmentType === 'marketing_sales' || 
                    newDept.departmentType === 'telesales') && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Monthly Target (Rs)</label>
                      <input
                        type="number"
                        required
                        value={newDept.monthlyTarget}
                        onChange={(e) => setNewDept({ ...newDept, monthlyTarget: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter monthly target in Rs"
                      />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {showEditModal && selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Edit Department User</h3>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDept(null);
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={selectedDept.username}
                      onChange={(e) => setSelectedDept({ ...selectedDept, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. john_doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={selectedDept.email}
                      onChange={(e) => setSelectedDept({ ...selectedDept, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        
                        value={selectedDept.password}
                        onChange={(e) => setSelectedDept({ ...selectedDept, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Leave blank to keep current password (min 6 if set)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Department Type</label>
                    <select
                      value={selectedDept.departmentType}
                      onChange={(e) => setSelectedDept({ ...selectedDept, departmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option>Sales Department</option>
                      <option>Marketing Department</option>
                      <option>Production Department</option>
                      <option>Accounts Department</option>
                      <option>IT Department</option>
                      <option>Telesales Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Company Name</label>
                    <select
                      value={selectedDept.companyName}
                      onChange={(e) => setSelectedDept({ ...selectedDept, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus-border-blue-500 outline-none bg-white"
                    >
                      {companies.length === 0 ? (
                        <option value={selectedDept.companyName || ''}>
                          {selectedDept.companyName || 'No organizations available'}
                        </option>
                      ) : (
                        companies.map((org) => (
                          <option key={org.id} value={org.name}>
                            {org.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Role</label>
                    <select
                      value={selectedDept.role}
                      onChange={(e) => setSelectedDept({ ...selectedDept, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option>Department Head</option>
                    </select>
                  </div>
                  {(selectedDept.departmentType === 'Sales Department' || 
                    selectedDept.departmentType === 'Marketing Department' || 
                    selectedDept.departmentType === 'Telesales Department') && (
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Monthly Target (Rs)</label>
                      <input
                        type="number"
                        value={selectedDept.monthlyTarget || selectedDept.target || ''}
                        onChange={(e) => setSelectedDept({ ...selectedDept, monthlyTarget: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter monthly target in Rs"
                      />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedDept(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Login as User</h3>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowLoginModal(false)}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const result = await login(loginData.email, loginData.password);
                    if (result.success) {
                      setShowLoginModal(false);
                      // The App component will automatically redirect based on user role
                    } else {
                      alert(result.error || 'Login failed');
                    }
                  } catch (err) {
                    alert(err.message || 'Login failed');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    onClick={() => setShowLoginModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagement;
