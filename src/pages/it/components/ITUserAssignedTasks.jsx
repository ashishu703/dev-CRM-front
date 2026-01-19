import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import { useAuth } from '../../../hooks/useAuth';
import toastManager from '../../../utils/ToastManager';

const TASK_STATUS_COLORS = {
  'resolved': 'bg-emerald-100 text-emerald-800',
  'closed': 'bg-slate-100 text-slate-800',
  'in_progress': 'bg-amber-100 text-amber-800',
  'assigned': 'bg-blue-100 text-blue-800',
  'open': 'bg-gray-100 text-gray-800'
};

const ITUserAssignedTasks = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolveModal, setShowResolveModal] = useState(null);
  const [resolution, setResolution] = useState('');

  const fetchAssignedTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(
        API_ENDPOINTS.SECURITY_LOGS_LIST(`assignedTo=${encodeURIComponent(user.email || user.username)}`)
      );
      if (response.success && Array.isArray(response.data)) {
        setAssignedTasks(response.data);
      } else {
        setAssignedTasks([]);
      }
    } catch (error) {
      toastManager.error('Failed to load assigned tasks');
      setAssignedTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedTasks();
  }, [fetchAssignedTasks]);

  const handleResolve = useCallback(async () => {
    if (!showResolveModal) return;

    try {
      await apiClient.put(API_ENDPOINTS.SECURITY_LOG_UPDATE_STATUS(showResolveModal), {
        status: 'resolved',
        resolution: resolution.trim() || 'Issue resolved'
      });
      await fetchAssignedTasks();
      toastManager.success('Task resolved successfully');
      setShowResolveModal(null);
      setResolution('');
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to resolve task';
      toastManager.error(errorMessage);
    }
  }, [showResolveModal, resolution, fetchAssignedTasks]);

  const handleStartProgress = useCallback(async (taskId) => {
    try {
      await apiClient.put(API_ENDPOINTS.SECURITY_LOG_UPDATE_STATUS(taskId), {
        status: 'in_progress'
      });
      await fetchAssignedTasks();
      toastManager.success('Task status updated to In Progress');
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to update task status';
      toastManager.error(errorMessage);
    }
  }, [fetchAssignedTasks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-slate-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">My Work</p>
        <h1 className="text-2xl font-bold text-slate-900">My Assigned Tasks</h1>
        <p className="text-sm text-slate-500">Security logs and system issues assigned to you</p>
      </div>

      {assignedTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
          <CheckSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold">No tasks assigned</p>
          <p className="text-sm mt-2">You don't have any security logs assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedTasks.map((task) => (
            <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      TASK_STATUS_COLORS[task.status] || 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status?.toUpperCase() || 'ASSIGNED'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${
                      task.severity === 'high' ? 'bg-rose-100 text-rose-700 border-rose-300' :
                      task.severity === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                      'bg-blue-100 text-blue-700 border-blue-300'
                    }`}>
                      {task.severity?.toUpperCase() || 'LOW'}
                    </span>
                    {task.createdAt && (
                      <span className="text-xs text-slate-600">
                        {task.createdAt}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {task.logType}
                  </h3>
                  {task.details && (
                    <p className="text-sm text-slate-600 mb-2">{task.details}</p>
                  )}
                  {task.userEmail && (
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">User:</span> {task.userEmail}
                    </p>
                  )}
                  {task.resolution && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded">
                      <p className="text-sm font-medium text-emerald-900 mb-1">Resolution:</p>
                      <p className="text-sm text-emerald-700">{task.resolution}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => handleStartProgress(task.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      Start
                    </button>
                  )}
                  {(task.status === 'assigned' || task.status === 'in_progress') && (
                    <button
                      onClick={() => setShowResolveModal(task.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Resolve Task</h3>
              <button 
                onClick={() => {
                  setShowResolveModal(null);
                  setResolution('');
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Please provide details about how you resolved this issue:
            </p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="e.g., Fixed API endpoint, updated configuration, reset user password..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4 min-h-[100px]"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleResolve}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => {
                  setShowResolveModal(null);
                  setResolution('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITUserAssignedTasks;
