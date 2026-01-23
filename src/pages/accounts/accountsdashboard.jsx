import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle, Clock, FileText, Loader2, RefreshCw, XCircle } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';
import AccountsPayInfo from './accountspayinfo';
import PriceUpdation from './PriceUpdation';
import RfpWorkflow from '../shared/RfpWorkflow';

const STATUS_CONFIG = {
  pending: {
    title: 'Pending Approvals',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock
  },
  approved: {
    title: 'Approved Payments',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle
  },
  rejected: {
    title: 'Rejected Payments',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle
  }
};

const AccountsOverview = ({ onViewPayments }) => {
  const [stats, setStats] = useState({
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 }
  });
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statuses = Object.keys(STATUS_CONFIG);
      const responses = await Promise.all(
        statuses.map((status) =>
          paymentService.getAllPayments({ approvalStatus: status, limit: status === 'pending' ? 5 : 1 })
        )
      );

      const nextStats = {};
      responses.forEach((res, idx) => {
        const status = statuses[idx];
        const rows = Array.isArray(res?.data) ? res.data : [];
        const formattedRows = rows.map((payment) => ({
          ...payment,
          displayQuotation: payment.quotation_number || payment.quotation_id || 'N/A',
          leadSort: Number(payment.lead_id || 0)
        })).sort((a, b) => a.leadSort - b.leadSort);
        const total = res?.pagination?.total ?? rows.length;
        const totalAmount = rows.reduce((sum, row) => sum + Number(row.installment_amount || 0), 0);
        nextStats[status] = { count: total, amount: totalAmount };
        if (status === 'pending') {
          setRecentPending(formattedRows);
        }
      });
      setStats(nextStats);
    } catch (err) {
      console.error('Failed to load accounts stats', err);
      setError(err.message || 'Unable to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading payment insights...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Accounts Control Tower</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Payment & Approval Snapshot</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={onViewPayments}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
          >
            Go to Payment Info
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={key} className={`border rounded-2xl p-5 flex flex-col gap-3 ${meta.color}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/70">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider">{meta.title}</p>
                  <p className="text-2xl font-bold">{stats[key]?.count ?? 0}</p>
                </div>
              </div>
              <p className="text-xs">
                Approx value:{' '}
                <span className="font-semibold">
                  ₹{(stats[key]?.amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">Latest Pending Approvals</h2>
            <p className="text-xs sm:text-sm text-slate-500">Stay on top of every incoming payment</p>
          </div>
          <button
            onClick={onViewPayments}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 self-start sm:self-auto"
          >
            Review all
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Lead ID', 'Customer', 'Business', 'Amount', 'Quotation', 'Payment Date'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentPending.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    All caught up! No pending approvals at the moment.
                  </td>
                </tr>
              )}
              {recentPending.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">LD-{payment.lead_id}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{payment.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{payment.business_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    ₹{Number(payment.installment_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{payment.displayQuotation}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {recentPending.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              All caught up! No pending approvals at the moment.
            </div>
          )}
          {recentPending.map((payment) => (
            <div key={payment.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">LD-{payment.lead_id}</span>
                <span className="text-sm font-semibold text-slate-900">
                  ₹{Number(payment.installment_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Customer</p>
                  <p className="text-slate-700">{payment.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Business</p>
                  <p className="text-slate-700">{payment.business_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Quotation</p>
                  <p className="text-slate-700">{payment.displayQuotation}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Payment Date</p>
                  <p className="text-slate-700">
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AccountsDashboard = ({ activeView, setActiveView }) => {
  useEffect(() => {
    if (!activeView || activeView === 'dashboard') {
      setActiveView('accounts-dashboard');
    }
  }, [activeView, setActiveView]);

  if (activeView === 'accounts-payments') {
    return <AccountsPayInfo setActiveView={setActiveView} />;
  }
  if (activeView === 'price-updation') {
    return <PriceUpdation />;
  }
  if (activeView === 'rfp-workflow') {
    return <RfpWorkflow />;
  }

  return <AccountsOverview onViewPayments={() => setActiveView('accounts-payments')} />;
};

export default AccountsDashboard;

