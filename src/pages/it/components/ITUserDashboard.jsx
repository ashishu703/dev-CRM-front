import React, { useState, useEffect } from 'react';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../../utils/apiClient';
import { API_ENDPOINTS } from '../../../api/admin_api/api';
import { useAuth } from '../../../hooks/useAuth';
import toastManager from '../../../utils/ToastManager';

const ITUserDashboard = ({ activeView, setActiveView }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    inProgress: 0,
    resolvedToday: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAssignedTickets(),
        fetchResolvedToday()
      ]);
    } catch (error) {
      toastManager.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTickets = async () => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.TICKETS_LIST(`assignedTo=${encodeURIComponent(user.email || user.username)}`)
      );
      const tickets = Array.isArray(response.data) ? response.data : [];
      const inProgress = tickets.filter(t => 
        t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'open'
      ).length;
      
      setStats(prev => ({
        ...prev,
        totalTickets: tickets.length,
        inProgress
      }));
      
      setRecentTickets(tickets.slice(0, 5));
    } catch (error) {
      toastManager.error('Failed to load tickets');
    }
  };

  const fetchResolvedToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(
        API_ENDPOINTS.TICKETS_LIST(`assignedTo=${encodeURIComponent(user.email || user.username)}&status=resolved`)
      );
      const tickets = Array.isArray(response.data) ? response.data : [];
      const resolvedToday = tickets.filter(t => {
        if (!t.updatedAt && !t.createdAt) return false;
        const ticketDate = new Date(t.updatedAt || t.createdAt).toISOString().split('T')[0];
        return ticketDate === today;
      }).length;
      
      setStats(prev => ({
        ...prev,
        resolvedToday
      }));
    } catch (error) {
      // Silently fail for resolved count
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">My Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">IT User Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your assigned work and system status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Ticket className="w-6 h-6 text-cyan-600" />
            <span className="text-xs font-semibold text-slate-500">My Tickets</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalTickets}</p>
          <p className="text-xs text-slate-600 mt-1">Assigned to me</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.inProgress}</p>
          <p className="text-xs text-slate-600 mt-1">Currently working</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-500">Resolved Today</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.resolvedToday}</p>
          <p className="text-xs text-slate-600 mt-1">Completed today</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">My Recent Tickets</h3>
          <button
            onClick={() => setActiveView('it-assigned-tickets')}
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            View All →
          </button>
        </div>
        {recentTickets.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No tickets assigned</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{ticket.id}</p>
                    <p className="text-sm text-slate-600">{ticket.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {ticket.createdAt || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView('it-assigned-tickets')}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ITUserDashboard;
