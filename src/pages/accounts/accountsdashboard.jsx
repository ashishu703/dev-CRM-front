import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Banknote, Clock, Medal, RefreshCw } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';
import { AccountsDashboardSkeleton } from '../../components/accounts/AccountsSkeletons';
import AccountsPayInfo from './accountspayinfo';
import PriceManagement from './PriceManagement';
import RfpWorkflow from '../shared/RfpWorkflow';

const sortPaymentsLatestFirst = (rows) =>
  [...rows].sort((a, b) => {
    const ta = new Date(a.created_at || a.payment_date || 0).getTime();
    const tb = new Date(b.created_at || b.payment_date || 0).getTime();
    if (tb !== ta) return tb - ta;
    return Number(b.id || 0) - Number(a.id || 0);
  });

const AccountsOverview = ({ onViewPayments }) => {
  const [stats, setStats] = useState({
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 }
  });
  const [recentPending, setRecentPending] = useState([]);
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setOverviewError(null);
    try {
      const statuses = ['pending', 'approved', 'rejected'];
      const [overviewRes, ...responses] = await Promise.all([
        paymentService.getAccountsOverview().catch((e) => ({ __failed: true, message: e?.message })),
        ...statuses.map((status) =>
          paymentService.getAllPayments({
            approvalStatus: status,
            limit: status === 'pending' ? 200 : 1
          })
        )
      ]);

      if (overviewRes?.__failed) {
        setOverview(null);
        setOverviewError(overviewRes.message || 'Could not load monthly summary.');
      } else if (overviewRes?.data) {
        setOverview(overviewRes.data);
      } else {
        setOverview(null);
      }

      const nextStats = {};
      responses.forEach((res, idx) => {
        const status = statuses[idx];
        const rows = Array.isArray(res?.data) ? res.data : [];
        const formattedRows = sortPaymentsLatestFirst(
          rows.map((payment) => ({
            ...payment,
            displayQuotation: payment.quotation_number || payment.quotation_id || 'N/A'
          }))
        );
        const total = res?.pagination?.total ?? rows.length;
        const totalAmount = formattedRows.reduce((sum, row) => sum + Number(row.installment_amount || 0), 0);
        nextStats[status] = { count: total, amount: totalAmount };
        if (status === 'pending') {
          setRecentPending(formattedRows.slice(0, 5));
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
    return <AccountsDashboardSkeleton />;
  }

  const topPerformer = overview?.topPerformers?.[0];
  const mtdAmount = overview?.mtdApproved?.amount ?? null;
  const mtdCount = overview?.mtdApproved?.count ?? null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Overview &amp; insights</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">Payment summary</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Collections approved this month, items awaiting approval, and the leading salesperson.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={fetchStats}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-700 border border-slate-200 rounded-xl bg-white hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onViewPayments}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-sm"
          >
            Open payment info
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {overviewError && !error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {overviewError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Received this month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {mtdAmount != null
                  ? `₹${mtdAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {mtdCount != null
                  ? `${mtdCount} approved payment${mtdCount === 1 ? '' : 's'}`
                  : overviewError
                    ? 'Monthly total unavailable'
                    : 'Approved in the current calendar month'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending approval</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{stats.pending?.count ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Approx. ₹{(stats.pending?.amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}{' '}
                {(stats.pending?.count ?? 0) > 200 ? ' (from 200 most recent)' : ' outstanding'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Medal className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Top performer (MTD)</p>
              {topPerformer ? (
                <>
                  <p className="text-lg font-semibold text-slate-900 mt-1 truncate">
                    {topPerformer.username || topPerformer.email || 'Sales executive'}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                    ₹{Number(topPerformer.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {topPerformer.paymentCount} approved payment
                    {topPerformer.paymentCount === 1 ? '' : 's'} this month
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 mt-2">
                  No approved payments this month yet. Rankings appear after approvals are posted.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">Pending approvals</h3>
            <p className="text-xs sm:text-sm text-slate-500">Newest entries first</p>
          </div>
          <button
            type="button"
            onClick={onViewPayments}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 self-start sm:self-auto"
          >
            View full queue
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
                    No pending approvals.
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
            <div className="text-center py-8 text-sm text-slate-500">No pending approvals.</div>
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
    return <PriceManagement />;
  }
  if (activeView === 'rfp-workflow') {
    return <RfpWorkflow />;
  }

  return <AccountsOverview onViewPayments={() => setActiveView('accounts-payments')} />;
};

export default AccountsDashboard;

