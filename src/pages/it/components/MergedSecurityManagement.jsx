import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Link, CheckCircle, XCircle, Calendar, Plus, UserPlus, ArrowLeft, X, Edit, Trash2 } from 'lucide-react';
import ScheduleMaintenanceModal from './ScheduleMaintenanceModal';
import AddIntegrationModal from './AddIntegrationModal';
import MaintenanceBanner from './MaintenanceBanner';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import departmentUsersService from '../../../api/admin_api/departmentUsersService';
import toastManager from '../../../utils/ToastManager';

const MergedSecurityManagement = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [itUsers, setItUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [showSendBackModal, setShowSendBackModal] = useState(null);
  const [sendBackReason, setSendBackReason] = useState('');
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [currentMaintenance, setCurrentMaintenance] = useState(null);

  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'IndiaMART API', status: 'Connected', lastSync: '2025-01-27 11:32 AM', apiKey: 'Active' },
    { id: 2, name: 'TradeIndia API', status: 'Connected', lastSync: '2025-01-27 10:15 AM', apiKey: 'Active' },
    { id: 3, name: 'Cloudinary', status: 'Connected', lastSync: '2025-01-27 11:45 AM', apiKey: 'Active' },
    { id: 4, name: 'Payment Gateway', status: 'Degraded', lastSync: '2025-01-27 09:30 AM', apiKey: 'Active' }
  ]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.SECURITY_LOGS_LIST());
      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      toastManager.error('Failed to load security logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await departmentUsersService.getAll({ departmentType: 'it', isActive: true });
      if (response.success && Array.isArray(response.data?.users)) {
        setItUsers(response.data.users);
      } else {
        setItUsers([]);
      }
    } catch (error) {
      toastManager.error('Failed to load IT users');
      setItUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

  useEffect(() => {
    if (showAssignModal) {
      fetchItUsers();
    }
  }, [showAssignModal, fetchItUsers]);

  const handleAssign = useCallback(async () => {
    if (!selectedUser) {
      toastManager.warning('Please select a user to assign');
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.SECURITY_LOG_ASSIGN(showAssignModal), {
        assignedTo: selectedUser
      });
      await fetchLogs();
      toastManager.success('Security log assigned successfully');
      setShowAssignModal(null);
      setSelectedUser('');
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to assign security log';
      toastManager.error(errorMessage);
    }
  }, [selectedUser, showAssignModal, fetchLogs]);

  const handleSendBack = useCallback(async () => {
    if (!sendBackReason.trim()) {
      toastManager.warning('Please provide a reason for sending back');
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.SECURITY_LOG_SEND_BACK(showSendBackModal), {
        reason: sendBackReason.trim()
      });
      await fetchLogs();
      toastManager.success('Security log sent back successfully');
      setShowSendBackModal(null);
      setSendBackReason('');
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to send back security log';
      toastManager.error(errorMessage);
    }
  }, [sendBackReason, showSendBackModal, fetchLogs]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleScheduleMaintenance = (data) => {
    try {
      if (editingSchedule) {
        // Update existing schedule
        setMaintenanceSchedules(prev => prev.map(s => 
          s.id === editingSchedule.id 
            ? { ...s, ...data, updatedAt: new Date().toLocaleString() }
            : s
        ));
        toastManager.success('Maintenance updated successfully');
        setEditingSchedule(null);
      } else {
        // Create new schedule
        const newSchedule = {
          id: Date.now(), // Use timestamp for unique ID
          ...data,
          isMaintenanceMode: false, // Default to false, can be toggled in table
          status: 'Scheduled',
          createdAt: new Date().toLocaleString()
        };
        setMaintenanceSchedules(prev => [...prev, newSchedule]);
        toastManager.success('Maintenance scheduled successfully');
      }
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      toastManager.error('Failed to schedule maintenance');
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    setMaintenanceSchedules(prev => {
      const updated = prev.filter(s => s.id !== scheduleId);
      // If deleted schedule was active, disable maintenance mode
      if (currentMaintenance?.id === scheduleId) {
        setIsMaintenanceActive(false);
        setCurrentMaintenance(null);
      }
      return updated;
    });
    toastManager.success('Maintenance deleted successfully');
    setDeleteConfirmModal(null);
  };

  // Check if we're currently in maintenance window and auto-disable when time ends
  useEffect(() => {
    const checkMaintenanceStatus = () => {
      const now = new Date();
      let activeMaintenance = null;
      
      // Find active maintenance schedule
      for (const schedule of maintenanceSchedules) {
        if (!schedule.isMaintenanceMode || !schedule.scheduledDate) continue;
        
        const scheduleDate = new Date(schedule.scheduledDate);
        const startTime = schedule.startTime ? schedule.startTime.split(':') : null;
        const endTime = schedule.endTime ? schedule.endTime.split(':') : null;
        
        if (!startTime || !endTime) continue;
        
        const startDateTime = new Date(scheduleDate);
        startDateTime.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
        
        const endDateTime = new Date(scheduleDate);
        endDateTime.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0, 0);
        
        // Check if current time is within maintenance window
        if (now >= startDateTime && now <= endDateTime) {
          activeMaintenance = schedule;
          break;
        }
        
        // If maintenance time has passed, automatically disable it
        if (now > endDateTime && schedule.isMaintenanceMode) {
          // Update the schedule to disable maintenance mode
          setMaintenanceSchedules(prev => prev.map(s => 
            s.id === schedule.id 
              ? { ...s, isMaintenanceMode: false, status: 'Completed' }
              : s
          ));
        }
      }
      
      if (activeMaintenance) {
        setIsMaintenanceActive(true);
        setCurrentMaintenance(activeMaintenance);
      } else {
        setIsMaintenanceActive(false);
        setCurrentMaintenance(null);
      }
    };

    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [maintenanceSchedules]);

  const handleAddIntegration = (data) => {
    const newIntegration = {
      id: integrations.length + 1,
      name: data.name,
      status: 'Connected',
      lastSync: new Date().toLocaleString(),
      apiKey: 'Active'
    };
    setIntegrations(prev => [...prev, newIntegration]);
  };

  // Show maintenance banner if maintenance is active
  if (isMaintenanceActive && currentMaintenance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
        <div className="text-center space-y-6">
          <MaintenanceBanner />
          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">System Under Maintenance</h2>
            <p className="text-slate-600">
              {currentMaintenance.title && `Maintenance: ${currentMaintenance.title}`}
            </p>
            {currentMaintenance.description && (
              <p className="text-sm text-slate-500 max-w-md mx-auto">{currentMaintenance.description}</p>
            )}
            <p className="text-sm text-slate-500">
              Scheduled: {currentMaintenance.scheduledDate} {currentMaintenance.startTime} - {currentMaintenance.endTime}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'security', label: 'Security & Logs', icon: Shield },
          { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
          { id: 'integrations', label: 'Integrations', icon: Link }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Audit Logs Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assign</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-500">Loading logs...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-500">No security logs found</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{log.logType}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.userEmail || log.userName || 'system'}</td>
                        <td className="px-6 py-4">
                          {log.assignedTo ? (
                            <span className="text-sm text-slate-600">{log.assignedTo}</span>
                          ) : (
                            <button
                              onClick={() => setShowAssignModal(log.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-cyan-600 bg-cyan-50 rounded hover:bg-cyan-100 transition-colors"
                            >
                              <UserPlus className="w-3 h-3" />
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.createdAt}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(log.status)}`}>
                            {log.status?.toUpperCase() || 'OPEN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                        <td className="px-6 py-4">
                          {log.status === 'assigned' || log.status === 'in_progress' ? (
                            <button
                              onClick={() => setShowSendBackModal(log.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                              title="Send Back"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Scheduled Maintenance</h3>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setShowScheduleModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule Maintenance
            </button>
          </div>
          
          {maintenanceSchedules.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Time Range</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Maintenance Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {maintenanceSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{schedule.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{schedule.scheduledDate}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {schedule.startTime && schedule.endTime 
                            ? `${schedule.startTime} - ${schedule.endTime}`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            schedule.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                            schedule.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {schedule.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{schedule.assignedTo || 'Unassigned'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded">
                            {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => {
                              const newMaintenanceMode = !schedule.isMaintenanceMode;
                              setMaintenanceSchedules(prev => prev.map(s => 
                                s.id === schedule.id 
                                  ? { ...s, isMaintenanceMode: newMaintenanceMode }
                                  : s
                              ));
                              
                              // Check if this schedule should be active now
                              if (newMaintenanceMode) {
                                const now = new Date();
                                const scheduleDate = new Date(schedule.scheduledDate);
                                const startTime = schedule.startTime ? schedule.startTime.split(':') : null;
                                const endTime = schedule.endTime ? schedule.endTime.split(':') : null;
                                
                                if (startTime && endTime) {
                                  const startDateTime = new Date(scheduleDate);
                                  startDateTime.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
                                  
                                  const endDateTime = new Date(scheduleDate);
                                  endDateTime.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0, 0);
                                  
                                  if (now >= startDateTime && now <= endDateTime) {
                                    const updatedSchedule = { ...schedule, isMaintenanceMode: newMaintenanceMode };
                                    setIsMaintenanceActive(true);
                                    setCurrentMaintenance(updatedSchedule);
                                    toastManager.success('Maintenance mode enabled');
                                  } else {
                                    toastManager.info('Maintenance mode will be active during scheduled time');
                                  }
                                }
                              } else {
                                // Disable maintenance mode
                                if (currentMaintenance?.id === schedule.id) {
                                  setIsMaintenanceActive(false);
                                  setCurrentMaintenance(null);
                                  toastManager.success('Maintenance mode disabled');
                                }
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                              schedule.isMaintenanceMode ? 'bg-cyan-600' : 'bg-slate-300'
                            }`}
                            title={schedule.isMaintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                schedule.isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditSchedule(schedule)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                              title="Edit Maintenance"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmModal(schedule.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded hover:bg-rose-100 transition-colors"
                              title="Delete Maintenance"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No maintenance schedules yet</p>
              <p className="text-sm text-slate-500 mt-2">Click "Schedule Maintenance" to create one</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Third-Party Integrations</h3>
            <button
              onClick={() => setShowIntegrationModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{integration.name}</h3>
                  {integration.status === 'Connected' ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600" />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className={`text-sm font-semibold ${integration.status === 'Connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {integration.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last Sync</span>
                    <span className="text-sm font-semibold text-slate-900">{integration.lastSync}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">API Key</span>
                    <span className="text-sm font-semibold text-emerald-600">{integration.apiKey}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Assign Security Log</h3>
              <button 
                onClick={() => {
                  setShowAssignModal(null);
                  setSelectedUser('');
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select IT Department User
              </label>
              {loadingUsers ? (
                <div className="text-center py-4 text-slate-500">Loading users...</div>
              ) : (
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select a user...</option>
                  {itUsers.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAssign}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(null);
                  setSelectedUser('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Back Modal */}
      {showSendBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Send Back Security Log</h3>
              <button 
                onClick={() => {
                  setShowSendBackModal(null);
                  setSendBackReason('');
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason why this security log needs to be sent back:
            </p>
            <textarea
              value={sendBackReason}
              onChange={(e) => setSendBackReason(e.target.value)}
              placeholder="e.g., Requires additional investigation, user needs more information..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4 min-h-[100px]"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendBack}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Send Back
              </button>
              <button
                onClick={() => {
                  setShowSendBackModal(null);
                  setSendBackReason('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleMaintenanceModal
        show={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingSchedule(null);
        }}
        onSchedule={handleScheduleMaintenance}
        editingSchedule={editingSchedule}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Delete Maintenance</h3>
              <button 
                onClick={() => setDeleteConfirmModal(null)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this maintenance schedule? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteSchedule(deleteConfirmModal)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <AddIntegrationModal
        show={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        onAdd={handleAddIntegration}
      />
    </div>
  );
};

export default MergedSecurityManagement;
