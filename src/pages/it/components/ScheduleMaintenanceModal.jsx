import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import departmentUsersService from '../../../api/admin_api/departmentUsersService';

const ScheduleMaintenanceModal = ({ show, onClose, onSchedule, editingSchedule }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    priority: 'medium',
    assignedTo: ''
  });

  // Load editing schedule data when modal opens
  useEffect(() => {
    if (editingSchedule && show) {
      setFormData({
        title: editingSchedule.title || '',
        description: editingSchedule.description || '',
        scheduledDate: editingSchedule.scheduledDate || '',
        startTime: editingSchedule.startTime || '',
        endTime: editingSchedule.endTime || '',
        priority: editingSchedule.priority || 'medium',
        assignedTo: editingSchedule.assignedTo || ''
      });
    } else if (!editingSchedule && show) {
      // Reset form when creating new schedule
      setFormData({
        title: '',
        description: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        priority: 'medium',
        assignedTo: ''
      });
      setUsers([]);
      setShowUserDropdown(false);
    }
  }, [editingSchedule, show]);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (show && showUserDropdown && users.length === 0) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, showUserDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      startTime: '',
      endTime: '',
      priority: 'medium',
      assignedTo: ''
    });
    setUsers([]);
    setShowUserDropdown(false);
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Try admin users API first
      const response = await apiClient.get(API_ENDPOINTS.ADMIN_USERS_LIST('limit=100&page=1&isActive=true'));
      
      if (response) {
        // Check different response structures
        const usersList = response.data?.users || response.users || [];
        if (Array.isArray(usersList) && usersList.length > 0) {
          setUsers(usersList);
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // If admin API fails, try department users API as fallback
      try {
        const deptResponse = await departmentUsersService.listUsers({ isActive: true, limit: 100 });
        if (deptResponse?.success && Array.isArray(deptResponse.data?.users)) {
          setUsers(deptResponse.data.users);
        } else {
          setUsers([]);
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        setUsers([]);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.title || !formData.scheduledDate || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate time range
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }
    
    onSchedule(formData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Don't disable form when maintenance mode is enabled - it just means maintenance will be active
  const isDisabled = false;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-4 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingSchedule ? 'Edit Maintenance' : 'Schedule Maintenance'}
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[60px]"
              placeholder="Enter maintenance details..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Date</label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Start Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDisabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                  }`}
                  required
                />
                <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">End Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDisabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                  }`}
                  required
                />
                <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className={`w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isDisabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-900 mb-1">Assigned To</label>
            <div className="relative">
              <input
                type="text"
                value={formData.assignedTo}
                onClick={() => {
                  setShowUserDropdown(true);
                  if (users.length === 0) {
                    fetchUsers();
                  }
                }}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, assignedTo: e.target.value }));
                  setShowUserDropdown(true);
                }}
                className={`w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isDisabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                }`}
                placeholder="Enter assignee name"
              />
              {showUserDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="px-4 py-2 text-sm text-slate-500">Loading users...</div>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, assignedTo: user.email }));
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-900"
                      >
                        {user.username} ({user.email})
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-slate-500">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {editingSchedule ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMaintenanceModal;

