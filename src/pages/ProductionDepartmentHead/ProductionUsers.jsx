import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Hash, User, Users, Mail, Shield, Building, Plus, X, LogIn } from 'lucide-react';
import departmentUsersService, { apiToUiDepartment } from '../../api/admin_api/departmentUsersService';
import { useAuth } from '../../hooks/useAuth';

const ProductionUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser, impersonate } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    userId: '',
    username: '',
    email: '',
    password: '',
    department: 'Production',
    role: '',
    unit: '',
    newUnit: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Available roles
  const roles = ['PPC', 'QA', 'MAINTENANCE', 'SUPERVISOR', 'STORE', 'HR', 'DISPATCH'];
  
  // Units - stored in localStorage for persistence
  const [units, setUnits] = useState(() => {
    const stored = localStorage.getItem('production_units');
    return stored ? JSON.parse(stored) : ['UNIT 1', 'UNIT 2', 'UNIT 3'];
  });

  // Save units to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('production_units', JSON.stringify(units));
  }, [units]);

  const filteredUsers = users.filter(user =>
    user.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    setNewUser({
      userId: '',
      username: '',
      email: '',
      password: '',
      department: 'Production',
      role: '',
      unit: '',
      newUnit: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      // Find user by ID and delete
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      // If user has database ID, call API to delete
      if (userId && typeof userId === 'string' && userId.includes('-')) {
        await departmentUsersService.deleteUser(userId);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const addNewUnit = () => {
    const newUnitName = newUser.newUnit.trim().toUpperCase();
    if (newUnitName && !units.includes(newUnitName)) {
      setUnits([...units, newUnitName]);
      setNewUser({ ...newUser, unit: newUnitName, newUnit: '' });
    }
  };

  const addNewUnitInEdit = () => {
    const newUnitName = editingUser.newUnit.trim().toUpperCase();
    if (newUnitName && !units.includes(newUnitName)) {
      setUnits([...units, newUnitName]);
      setEditingUser({ ...editingUser, unit: newUnitName, newUnit: '' });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: 1, limit: 100, departmentType: 'production' };
      const res = await departmentUsersService.listUsers(params);
      const payload = res.data || res;
      const items = (payload.users || []).map(u => ({
        id: u.id,
        userId: u.id?.substring(0, 8).toUpperCase() || u.username?.substring(0, 8).toUpperCase() || 'N/A',
        username: u.username,
        email: u.email,
        department: apiToUiDepartment(u.departmentType || u.department_type) || 'Production Department',
        role: u.role || 'N/A',
        unit: u.unit || 'N/A',
        // Store additional fields in a metadata object or extend user object
        metadata: {
          role: u.role || '',
          unit: u.unit || ''
        }
      }));
      setUsers(items);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        headUserEmail: currentUser?.email,
        target: 0,
        // Store role and unit as metadata or in a custom field
        // Note: Backend may need to be updated to support these fields
        metadata: {
          userId: newUser.userId || newUser.username,
          role: newUser.role,
          unit: newUser.unit
        }
      };

      const response = await departmentUsersService.createUser(payload);
      const createdUser = response.data?.user || response.user;
      
      // Add to local state with role and unit
      const userWithMetadata = {
        id: createdUser.id,
        userId: newUser.userId || createdUser.id?.substring(0, 8).toUpperCase() || newUser.username.substring(0, 8).toUpperCase(),
        username: createdUser.username,
        email: createdUser.email,
        department: 'Production Department',
        role: newUser.role,
        unit: newUser.unit,
        metadata: {
          userId: newUser.userId || newUser.username,
          role: newUser.role,
          unit: newUser.unit
        }
      };

      setUsers([...users, userWithMetadata]);
      setShowAddModal(false);
      setNewUser({
        userId: '',
        username: '',
        email: '',
        password: '',
        department: 'Production',
        role: '',
        unit: '',
        newUnit: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSavingEdit(true);
    try {
      const payload = {
        username: editingUser.username,
        email: editingUser.email,
        ...(editingUser.password ? { password: editingUser.password } : {}),
        metadata: {
          userId: editingUser.userId || editingUser.username,
          role: editingUser.role,
          unit: editingUser.unit
        }
      };

      if (editingUser.id) {
        await departmentUsersService.updateUser(editingUser.id, payload);
      }

      // Update local state
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? {
          ...u,
          userId: editingUser.userId || u.userId,
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role,
          unit: editingUser.unit,
          metadata: {
            userId: editingUser.userId || editingUser.username,
            role: editingUser.role,
            unit: editingUser.unit
          }
        } : u
      );
      setUsers(updatedUsers);
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-orange-600" />
              Production Department Users
            </h1>
            <p className="text-gray-600 mt-1">Manage production department staff and their roles</p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID, username, email, role, unit, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-orange-600" />
                    User ID
                  </div>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Username
                  </div>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email
                  </div>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    Department
                  </div>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    Role
                  </div>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-teal-600" />
                    Unit
                  </div>
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td className="py-8 px-6 text-center text-gray-500" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td className="py-8 px-6 text-center text-gray-500" colSpan={7}>
                    {error || 'No users found'}
                  </td>
                </tr>
              )}
              {!loading && filteredUsers.map((user) => (
                <tr key={user.id || user.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-gray-900 font-medium">{user.userId}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900 font-medium">{user.username}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{user.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                      {user.department}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                      {user.role || user.metadata?.role || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                      {user.unit || user.metadata?.unit || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
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
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Login as this user"
                      >
                        <LogIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id || user.userId)}
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
      </div>

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Create Department User</h3>
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.userId}
                    onChange={(e) => setNewUser({ ...newUser, userId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={newUser.unit}
                      onChange={(e) => setNewUser({ ...newUser, unit: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newUser.newUnit}
                      onChange={(e) => setNewUser({ ...newUser, newUnit: e.target.value.toUpperCase() })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addNewUnit();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Create new unit (e.g. UNIT 4)"
                    />
                    <button
                      type="button"
                      onClick={addNewUnit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Edit Department User</h3>
              <button
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={editingUser.userId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, userId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="User ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-gray-400">(Leave empty to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingUser.department || 'Production'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editingUser.role || editingUser.metadata?.role || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={editingUser.unit || editingUser.metadata?.unit || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, unit: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editingUser.newUnit || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, newUnit: e.target.value.toUpperCase() })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addNewUnitInEdit();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Create new unit (e.g. UNIT 4)"
                    />
                    <button
                      type="button"
                      onClick={addNewUnitInEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {savingEdit ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionUsers;
