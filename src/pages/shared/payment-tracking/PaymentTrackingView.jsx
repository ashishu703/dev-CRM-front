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

  const showPagination = activeTab !== 'target' && totalItems > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 overflow-x-hidden min-w-0">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {showSalespersonFilter && salespersonOptions.length > 0 && (
            <select
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Salespersons</option>
              {salespersonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={data.loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${data.loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
        {activeTab !== 'target' && (
          <div className="mb-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 overflow-hidden min-w-0">
          <div className="border-b border-gray-200 flex overflow-x-auto scrollbar-thin">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-shrink-0 min-w-[100px] sm:min-w-[120px] px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 ${
                  activeTab === id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
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
            <div className="p-8 text-sm text-gray-500 text-center">Loading...</div>
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
            />
          ) : activeTab === 'pending' ? (
            <PendingPaymentsTable
              rows={paginatedRows}
              onAddPayment={setSelectedForAddPayment}
              getPaymentForRow={getPaymentForRow}
            />
          ) : activeTab === 'statement' ? (
            <StatementTable rows={paginatedRows} />
          ) : activeTab === 'target' ? (
            <TargetSummary
              isSalesperson={isSalesperson}
              targetSummary={data.targetSummary}
              targetList={data.targetList}
            />
          ) : activeTab === 'credit' ? (
            <PartyCreditTable rows={paginatedRows} showSalespersonColumn={showSalespersonColumn} />
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
