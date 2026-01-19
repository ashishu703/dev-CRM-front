import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, Search, Edit, LogIn, Trash2 } from 'lucide-react';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import departmentUsersService from '../../../api/admin_api/departmentUsersService';
import toastManager from '../../../utils/ToastManager';
import { useAuth } from '../../../hooks/useAuth';

const UserAccessManagement = () => {
  const { user: currentUser, impersonate } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await departmentUsersService.listUsers({ page: 1, limit: 100 });
      const data = response.data || response;
      const usersList = (data.users || []).map(user => {
        const isActive = user.isActive !== undefined ? user.isActive : (user.is_active !== undefined ? user.is_active : true);
        return {
          id: user.id,
          name: user.username || 'N/A',
          email: user.email,
          status: isActive ? 'Active' : 'Inactive',
          lastLogin: user.lastLogin || user.last_login || 'Never',
          assignedTickets: 0,
          username: user.username,
          isActive: isActive
        };
      });
      setUsers(usersList);
      
      await Promise.all(usersList.map(async (user) => {
        try {
          const ticketsRes = await apiClient.get(
            API_ENDPOINTS.TICKETS_LIST(`assignedTo=${encodeURIComponent(user.email)}`)
          );
          if (ticketsRes.success && Array.isArray(ticketsRes.data)) {
            const tickets = ticketsRes.data.filter(ticket => 
              ticket.assignedTo && 
              ticket.assignedTo.toLowerCase().trim() === user.email.toLowerCase().trim()
            );
            setUsers(prev => prev.map(u => 
              u.id === user.id ? { ...u, assignedTickets: tickets.length } : u
            ));
          }
        } catch (err) {
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, assignedTickets: 0 } : u
          ));
        }
      }));
    } catch (error) {
      toastManager.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        toastManager.error('User not found');
        return;
      }
      const newStatus = !user.isActive;
      await departmentUsersService.updateStatus(userId, newStatus);
    setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus ? 'Active' : 'Inactive', isActive: newStatus } : u
      ));
      toastManager.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toastManager.error(error.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await departmentUsersService.deleteUser(userId);
      toastManager.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      toastManager.error(error.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleCreateUser = async (userData) => {
    if (!currentUser?.email) {
      toastManager.error('Unable to determine department head. Please refresh and try again.');
      return;
    }

    try {
      const targetValue = userData.target !== undefined && userData.target !== null && userData.target !== ''
        ? parseFloat(userData.target)
        : 0;
      
      const payload = {
        username: userData.username || userData.fullName?.toLowerCase().replace(/\s+/g, ''),
        email: userData.email,
        password: userData.password,
        target: isNaN(targetValue) ? 0 : targetValue,
        headUserEmail: currentUser.email
      };
      
      await departmentUsersService.createUser(payload);
      toastManager.success('User created successfully');
      setShowCreateModal(false);
      await fetchUsers();
    } catch (error) {
      toastManager.error(error.message || error.error || 'Failed to create user');
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await departmentUsersService.updateUser(userData.id, userData);
      toastManager.success('User updated successfully');
      setShowEditModal(false);
      await fetchUsers();
    } catch (error) {
      toastManager.error(error.message || 'Failed to update user');
    }
  };

  const handleLoginAs = async (user) => {
    if (!user.isActive) {
      toastManager.error('Cannot login as inactive user. Please activate the user first.');
      return;
    }

    try {
      const result = await impersonate(user.email);
      if (result.success) {
        const token = result.token || result?.user?.token || '';
        const url = `${window.location.origin}/?impersonateToken=${encodeURIComponent(token)}`;
        window.open(url, '_blank');
        toastManager.success(`Opening dashboard for ${user.name}`);
      } else {
        toastManager.error(result.error || 'Failed to login as user');
      }
    } catch (error) {
      toastManager.error(error.message || 'Failed to login as user');
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assign Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.status === 'Active'}
                        onChange={() => handleToggleStatus(user.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-700">
                            {user.status}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{user.assignedTickets}</span>
                  </td>
                  <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoginAs(user)}
                            disabled={!user.isActive}
                            className={`p-1.5 rounded transition-colors ${
                              user.isActive
                                ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                            title={user.isActive ? 'Login As' : 'User is inactive'}
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                    <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                      className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                            className={`p-1.5 rounded transition-colors ${
                              deletingUserId === user.id
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                  </td>
                </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
      />

      <EditUserModal
        show={showEditModal}
        user={editingUser}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSave={handleEditUser}
      />
    </div>
  );
};

export default UserAccessManagement;
