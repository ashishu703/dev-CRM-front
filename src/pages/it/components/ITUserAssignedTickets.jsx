import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, Eye, Pencil, Clock, ArrowLeft, X } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import { useAuth } from '../../../hooks/useAuth';
import toastManager from '../../../utils/ToastManager';
import TicketPreviewSidebar from './TicketPreviewSidebar';
import TicketEditModal from './TicketEditModal';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-100 text-slate-700',
  default: 'bg-slate-100 text-slate-700'
};

const PRIORITY_COLORS = {
  critical: 'bg-rose-100 text-rose-700 border-rose-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-amber-100 text-amber-700 border-amber-300',
  low: 'bg-green-100 text-green-700 border-green-300',
  default: 'bg-slate-100 text-slate-700 border-slate-300'
};

const ITUserAssignedTickets = () => {
  const { user } = useAuth();
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTicket, setPreviewTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    resolution: '',
    photos: []
  });
  const [showSendBackModal, setShowSendBackModal] = useState(null);
  const [sendBackReason, setSendBackReason] = useState('');

  const getPriorityColor = useCallback((priority) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;
  }, []);

  const getStatusColor = useCallback((status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  }, []);

  const fetchAssignedTickets = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(
        API_ENDPOINTS.TICKETS_LIST(`assignedTo=${encodeURIComponent(user.email || user.username)}`)
      );
      setAssignedTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toastManager.error('Failed to load assigned tickets');
      setAssignedTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedTickets();
  }, [fetchAssignedTickets]);

  const handleStatusChange = useCallback(async (ticketId, newStatus) => {
    try {
      await apiClient.put(API_ENDPOINTS.TICKET_UPDATE(ticketId), { status: newStatus });
      await fetchAssignedTickets();
      toastManager.success(`Ticket status updated to ${newStatus} successfully`);
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to update ticket status. Please try again.';
      toastManager.error(errorMessage);
    }
  }, [fetchAssignedTickets]);

  const handleEditSubmit = useCallback(async () => {
    if (!editTicket) return;
    
    try {
      const hasImage = editFormData.photos?.length > 0;
      
      if (hasImage) {
        const formData = new FormData();
        formData.append('status', editFormData.status);
        formData.append('resolution', editFormData.resolution || '');
        formData.append('screenshot', editFormData.photos[0]);
        await apiClient.putFormData(API_ENDPOINTS.TICKET_UPDATE(editTicket.id), formData);
      } else {
        await apiClient.put(API_ENDPOINTS.TICKET_UPDATE(editTicket.id), {
          status: editFormData.status,
          resolution: editFormData.resolution
        });
      }
      
      await fetchAssignedTickets();
      toastManager.success('Ticket updated successfully');
      setEditTicket(null);
      setEditFormData({ status: '', resolution: '', photos: [] });
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to update ticket. Please try again.';
      toastManager.error(errorMessage);
    }
  }, [editTicket, editFormData, fetchAssignedTickets]);

  const handlePreviewClick = useCallback(async (ticket) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TICKET_BY_ID(ticket.id));
      if (response.success && response.data) {
        setPreviewTicket(response.data);
      } else {
        setPreviewTicket(ticket);
      }
    } catch (error) {
      toastManager.error('Unable to load ticket details');
      setPreviewTicket(ticket);
    }
  }, []);

  const handleEditClick = useCallback(async (ticket) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TICKET_BY_ID(ticket.id));
      const fullTicket = response.success && response.data ? response.data : ticket;
      setEditTicket(fullTicket);
      setEditFormData({
        status: fullTicket.status,
        resolution: fullTicket.resolution || '',
        photos: []
      });
    } catch (error) {
      toastManager.error('Unable to load ticket details');
      setEditTicket(ticket);
      setEditFormData({
        status: ticket.status,
        resolution: ticket.resolution || '',
        photos: []
      });
    }
  }, []);

  const closeEditModal = useCallback(() => {
    setEditTicket(null);
    setEditFormData({ status: '', resolution: '', photos: [] });
  }, []);

  const handleSendBack = useCallback(async (ticketId) => {
    if (!sendBackReason.trim()) {
      toastManager.warning('Please provide a reason for sending back the ticket');
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.TICKET_SEND_BACK(ticketId), {
        reason: sendBackReason.trim()
      });
      await fetchAssignedTickets();
      toastManager.success('Ticket sent back to department head successfully');
      setShowSendBackModal(null);
      setSendBackReason('');
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to send ticket back. Please try again.';
      toastManager.error(errorMessage);
    }
  }, [sendBackReason, fetchAssignedTickets]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-slate-500">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">My Work</p>
        <h1 className="text-2xl font-bold text-slate-900">My Assigned Tickets</h1>
      </div>

      {assignedTickets.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold">No tickets assigned</p>
          <p className="text-sm mt-2">You don't have any tickets assigned to you yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SLA</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {assignedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-cyan-600 cursor-pointer hover:underline">
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ticket.title}</p>
                        {ticket.createdAt && (
                          <p className="text-xs text-slate-500">{ticket.createdAt}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status || 'Open'}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(ticket.status)} border-0 focus:ring-2 focus:ring-cyan-500`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="w-3 h-3" />
                        {ticket.sla || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {ticket.createdAt || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handlePreviewClick(ticket)}
                          className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(ticket)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowSendBackModal(ticket.id)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Send Back to Head"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Sidebar */}
      <TicketPreviewSidebar
        ticket={previewTicket}
        onClose={() => setPreviewTicket(null)}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
      />

      {/* Edit Modal */}
      <TicketEditModal
        ticket={editTicket}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onClose={closeEditModal}
        onSave={handleEditSubmit}
        STATUSES={STATUSES}
      />

      {/* Send Back Modal */}
      {showSendBackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Send Back to Department Head</h3>
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
              Please provide a reason why you cannot resolve this ticket:
            </p>
            <textarea
              value={sendBackReason}
              onChange={(e) => setSendBackReason(e.target.value)}
              placeholder="e.g., Requires additional technical expertise, hardware issue needs department head approval..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4 min-h-[100px]"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleSendBack(showSendBackModal)}
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
    </div>
  );
};

export default ITUserAssignedTickets;
