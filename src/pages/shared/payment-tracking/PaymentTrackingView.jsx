import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, FileText, CreditCard, FileSpreadsheet, BarChart3, Wallet, Search } from 'lucide-react';
import CancelOrderModal from '../../../components/salesperson/CancelOrderModal';
import {
  ActiveOrdersTable,
  PendingPaymentsTable,
  StatementTable,
  TargetSummary,
  PartyCreditTable,
  Pagination,
} from './components';
import AddPaymentSidebar from './components/AddPaymentSidebar';
import { closeAddPaymentSidebar } from '../../../features/paymentTracking/paymentTrackingSlice';
import { useCallback } from 'react';

const TABS = [
  { id: 'orders', label: 'Active Orders', Icon: FileText },
  { id: 'pending', label: 'Pending Payment', Icon: CreditCard },
  { id: 'statement', label: 'Statement', Icon: FileSpreadsheet },
  { id: 'target', label: 'Target', Icon: BarChart3 },
  { id: 'credit', label: 'Party Credit', Icon: Wallet },
];

/**
 * Presentational: role-based payment tracking UI. No data fetching.
 */
export default function PaymentTrackingView({
  title = 'Payment Tracking',
  activeTab,
  setActiveTab,
  data,
  filters,
  pagination,
  roleScope,
  salespersonOptions = [],
  getPaymentForRow,
  cancelOrderItemForPayment,
  setSelectedForAddPayment,
  selectedForCancelOrder,
  setSelectedForCancelOrder,
  onRefresh,
  onSaveOrderDelivery,
  canDelete,
  onDeleteQuotation,
  onBulkDeleteQuotations,
  onDeletePaymentHistory,
  onDeleteCreditRow,
}) {
  const dispatch = useDispatch();
  const { addPaymentSidebarOpen, selectedPayment } = useSelector((state) => state.paymentTracking);
  const { searchTerm, setSearchTerm, filteredRows } = filters;
  const {
    paginatedRows,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setPage,
    setLimit,
  } = pagination;
  const showSalespersonColumn = roleScope?.showSalespersonColumn ?? false;
  const showSalespersonFilter = roleScope?.showSalespersonFilter ?? false;
  const isSalesperson = roleScope?.isSalesperson ?? true;
  const salespersonFilter = roleScope?.salespersonFilter ?? '';
  const setSalespersonFilter = roleScope?.setSalespersonFilter ?? (() => {});

  const handleEditPendingRow = useCallback(
    (row) => {
      const qn = row?.quotationNumber || row?.quotationId;
      if (qn) setSearchTerm(String(qn));
      setActiveTab('orders');
    },
    [setSearchTerm, setActiveTab]
  );

  const showPagination = activeTab !== 'target' && totalItems > 0;
  const renderLoadingSkeleton = () => (
    <div className="p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="h-9 rounded-lg bg-slate-100" />
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2">
          <div className="h-7 rounded-md bg-slate-100 col-span-2" />
          <div className="h-7 rounded-md bg-slate-100" />
          <div className="h-7 rounded-md bg-slate-100" />
          <div className="h-7 rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 p-3 sm:p-4 md:p-6 overflow-x-hidden min-w-0">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Left side: search */}
        <div className="flex items-center gap-2 flex-wrap justify-start w-full sm:w-auto">
          <div className="flex shadow-sm rounded-xl overflow-hidden flex-1 sm:flex-initial border border-slate-200 bg-white">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none w-full sm:w-64 bg-white text-slate-900 placeholder-slate-400"
            />
            <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:brightness-110 transition-all duration-200">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right side: salesperson filter + refresh */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
          {showSalespersonFilter && salespersonOptions.length > 0 && (
            <select
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="">All Salespersons</option>
              {salespersonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={data.loading}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white shadow-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:brightness-110 disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${data.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        {/* Search moved to the header row */}
        <div className="rounded-xl border border-slate-200 overflow-hidden min-w-0">
          <div className="border-b border-slate-200 flex overflow-x-auto scrollbar-thin bg-slate-50/70">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-shrink-0 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-600 hover:bg-white/70'
                }`}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </button>
            ))}
          </div>

          {data.loading ? (
            renderLoadingSkeleton()
          ) : activeTab === 'orders' ? (
            <ActiveOrdersTable
              rows={paginatedRows}
              showSalespersonColumn={showSalespersonColumn}
              getPaymentForRow={getPaymentForRow}
              onAddPayment={setSelectedForAddPayment}
              cancelOrderItemForPayment={cancelOrderItemForPayment}
              onCancelOrder={(item) => setSelectedForCancelOrder(item)}
              onCancelProduct={(item) => setSelectedForCancelOrder(item)}
              onSaveOrderDelivery={onSaveOrderDelivery}
              canDelete={canDelete}
              onDeleteQuotation={onDeleteQuotation}
              onBulkDeleteQuotations={onBulkDeleteQuotations}
            />
          ) : activeTab === 'pending' ? (
            <PendingPaymentsTable
              rows={paginatedRows}
              onAddPayment={setSelectedForAddPayment}
              getPaymentForRow={getPaymentForRow}
              canDelete={canDelete}
              onDeleteQuotation={onDeleteQuotation}
              onBulkDeleteQuotations={onBulkDeleteQuotations}
              onEditQuotation={handleEditPendingRow}
            />
          ) : activeTab === 'statement' ? (
            <StatementTable rows={paginatedRows} canDelete={canDelete} onDeletePaymentHistory={onDeletePaymentHistory} />
          ) : activeTab === 'target' ? (
            <TargetSummary
              isSalesperson={isSalesperson}
              targetSummary={data.targetSummary}
              targetList={data.targetList}
            />
          ) : activeTab === 'credit' ? (
            <PartyCreditTable
              rows={paginatedRows}
              showSalespersonColumn={showSalespersonColumn}
              canDelete={canDelete}
              onDeleteCreditRow={onDeleteCreditRow}
            />
          ) : null}
        </div>

        {showPagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onItemsPerPageChange={setLimit}
          />
        )}
      </div>

      {addPaymentSidebarOpen && selectedPayment && (
        <AddPaymentSidebar
          payment={selectedPayment}
          onClose={() => dispatch(closeAddPaymentSidebar())}
          onSuccess={() => {
            dispatch(closeAddPaymentSidebar());
            onRefresh();
          }}
        />
      )}
      {selectedForCancelOrder && (
        <CancelOrderModal
          item={selectedForCancelOrder}
          onClose={() => setSelectedForCancelOrder(null)}
          onCancelRequested={() => {
            setSelectedForCancelOrder(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
