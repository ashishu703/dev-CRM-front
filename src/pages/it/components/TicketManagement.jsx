import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, UserPlus, Clock, X, Eye, Pencil } from 'lucide-react';
import TicketPreviewSidebar from './TicketPreviewSidebar';
import TicketEditModal from './TicketEditModal';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import departmentUsersService from '../../../api/admin_api/departmentUsersService';
import toastManager from '../../../utils/ToastManager';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const PRIORITY_COLORS = {
  critical: 'bg-rose-100 text-rose-700 border-rose-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-amber-100 text-amber-700 border-amber-300',
  default: 'bg-slate-100 text-slate-700 border-slate-300'
};

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-100 text-slate-700',
  default: 'bg-slate-100 text-slate-700'
};

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itUsers, setItUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTicket, setPreviewTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    resolution: '',
    photos: []
  });

  const getPriorityColor = useCallback((priority) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;
  }, []);

  const getStatusColor = useCallback((status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.TICKETS_LIST());
      if (response.success) {
        setTickets(response.data || []);
      }
    } catch (error) {
      toastManager.error('Unable to load tickets. Please refresh the page.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await departmentUsersService.listUsers({ 
        page: 1, 
        limit: 100,
        departmentType: 'it',
        isActive: true
      });
      const data = response.data || response;
      const usersList = (data.users || []).map(user => ({
        id: user.id,
        name: user.username || 'N/A',
        email: user.email
      }));
      setItUsers(usersList);
    } catch (error) {
      toastManager.error('Unable to load IT team members. Please refresh the page.');
      setItUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchItUsers();
  }, [fetchTickets, fetchItUsers]);

  const handleAssign = useCallback(async (ticketId) => {
    if (!selectedUser) {
      toastManager.warning('Please select a user to assign the ticket');
      return;
    }
    
    const assignedUser = itUsers.find(u => u.email === selectedUser);
    if (!assignedUser) {
      toastManager.error('Selected user not found');
      return;
    }
    
    try {
      await apiClient.put(API_ENDPOINTS.TICKET_UPDATE(ticketId), { assignedTo: assignedUser.email });
      await fetchTickets();
      toastManager.success(`Ticket assigned to ${assignedUser.name} successfully`);
      setShowAssignModal(null);
      setSelectedUser('');
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to assign ticket. Please try again.';
      toastManager.error(errorMessage);
    }
  }, [selectedUser, itUsers, fetchTickets]);

  const handleStatusChange = useCallback(async (ticketId, newStatus) => {
    try {
      await apiClient.put(API_ENDPOINTS.TICKET_UPDATE(ticketId), { status: newStatus });
      await fetchTickets();
      toastManager.success(`Ticket status updated to ${newStatus} successfully`);
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to update ticket status. Please try again.';
      toastManager.error(errorMessage);
    }
  }, [fetchTickets]);

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
      
      await fetchTickets();
      toastManager.success('Ticket updated successfully');
      setEditTicket(null);
      setEditFormData({ status: '', resolution: '', photos: [] });
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to update ticket. Please try again.';
      toastManager.error(errorMessage);
    }
  }, [editTicket, editFormData, fetchTickets]);

  const handleEditClick = useCallback((ticket) => {
    setEditTicket(ticket);
    setEditFormData({
      status: ticket.status,
      resolution: ticket.resolution || '',
      photos: []
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditTicket(null);
    setEditFormData({ status: '', resolution: '', photos: [] });
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = ticket.title?.toLowerCase().includes(searchLower) ||
                           ticket.id?.toLowerCase().includes(searchLower);
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, filterStatus, filterPriority, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SLA</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{ticket.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-500">{ticket.createdAt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{ticket.createdBy}</td>
                    <td className="px-6 py-4">
                      {ticket.assignedTo ? (
                        <span className="text-sm text-slate-600">{ticket.assignedTo}</span>
                      ) : (
                        <button
                          onClick={() => setShowAssignModal(ticket.id)}
                          className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          <UserPlus className="w-3 h-3" />
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(ticket.status)} border-0 focus:ring-2 focus:ring-cyan-500`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="w-3 h-3" />
                        {ticket.sla}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setPreviewTicket(ticket)}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Assign Ticket</h3>
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
            <p className="text-sm text-slate-600 mb-4">Select IT team member to assign this ticket:</p>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
              disabled={loadingUsers}
            >
              <option value="">{loadingUsers ? 'Loading users...' : 'Select User'}</option>
              {itUsers.map(user => (
                <option key={user.id} value={user.email}>{user.name} ({user.email})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => handleAssign(showAssignModal)}
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
    </div>
  );
};

export default TicketManagement;
