import React, { useState, useCallback } from 'react';
import { getActionRules, isDelivered } from '../constants/actionRules';
import StatusBadge from './StatusBadge';
import ActionMenu from './ActionMenu';

const th = 'px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 tracking-wider whitespace-nowrap';
// Sticky first column can visually overlap adjacent columns unless it keeps its background + separator.
const thSticky = th + ' max-md:static md:sticky md:left-0 md:z-10 bg-gray-50 min-w-[120px] border-r border-gray-200';

function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function getRowKey(r, i) {
  return `${r.quotationId ?? ''}-${r.productName ?? ''}-${i}`;
}

/** Product name: compact; long names split into 2 lines. */
function ProductCell({ productName }) {
  const name = productName || '—';
  const isLong = name.length > 42;
  const main = isLong ? name.slice(0, 40) + '…' : name;
  const sub = isLong ? name.slice(40) : null;
  return (
    <div className="min-w-[140px]">
      <div className="text-sm font-medium text-gray-900">{main}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ActiveOrdersTable({
  rows,
  showSalespersonColumn,
  getPaymentForRow,
  onAddPayment,
  cancelOrderItemForPayment,
  onCancelOrder,
  onCancelProduct,
  onSaveOrderDelivery,
}) {
  const [localDelivery, setLocalDelivery] = useState({});
  const handleDeliveryChange = useCallback((rowKey, field, value, row) => {
    setLocalDelivery((prev) => {
      const next = { ...prev, [rowKey]: { ...(prev[rowKey] || {}), [field]: value } };
      const cell = next[rowKey] || {};
      if (row?.quotationId && onSaveOrderDelivery && (field === 'deliveryStatus' || field === 'deliveryDate')) {
        const delivery_date = field === 'deliveryDate' ? value : (cell.deliveryDate ?? formatDate(row.deliveryDate) ?? '');
        const delivery_status = field === 'deliveryStatus' ? value : (cell.deliveryStatus ?? (row.deliveryStatus && row.deliveryStatus !== '—' ? row.deliveryStatus : 'Pending'));
        onSaveOrderDelivery(row.quotationId, { delivery_date: delivery_date || null, delivery_status: delivery_status || null });
      }
      return next;
    });
  }, [onSaveOrderDelivery]);

  const colSpan = (showSalespersonColumn ? 9 : 8) + 1;
  return (
    // Avoid negative horizontal margins: sticky `left: 0` alignment is affected and can look like overlap.
    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="min-w-[900px] w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {showSalespersonColumn && <th className={th + ' min-w-[100px]'}>Salesperson</th>}
            <th className={thSticky}>Party</th>
            <th className={th + ' min-w-[80px]'}>Quotation</th>
            <th className={th + ' min-w-[140px]'}>Product</th>
            <th className={th + ' min-w-[80px]'}>Rate</th>
            <th className={th + ' min-w-[70px]'}>Qty</th>
            <th className={th + ' min-w-[120px]'}>Confirmation</th>
            <th className={th + ' min-w-[110px]'}>Status</th>
            <th className={th + ' min-w-[120px]'}>Delivery Date</th>
            <th className="px-2 sm:px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600 tracking-wider w-14 min-w-[80px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-500 text-center" colSpan={colSpan}>No active orders</td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const rowKey = getRowKey(r, i);
              const local = localDelivery[rowKey] || {};
              const confirmationDate = local.confirmationDate ?? formatDate(r.confirmationDate) ?? '';
              const deliveryStatus = local.deliveryStatus ?? (r.deliveryStatus && r.deliveryStatus !== '—' ? r.deliveryStatus : 'Pending');
              const deliveryDate = local.deliveryDate ?? formatDate(r.deliveryDate) ?? '';
              const payment = getPaymentForRow ? getPaymentForRow(r) : null;
              const cancelItemFull = cancelOrderItemForPayment && payment ? cancelOrderItemForPayment(payment) : null;
              const rules = getActionRules(deliveryStatus);
              const delivered = isDelivered(deliveryStatus);
              const isRowCancelled = r.quotationStatus === 'cancelled' || r.quotationStatus === 'partially_cancelled' || r.isItemCancelled;
              const rowClass = isRowCancelled
                ? 'bg-red-50/50 hover:bg-red-50/70 border-l-4 border-l-red-500'
                : delivered
                  ? 'bg-emerald-50/30 hover:bg-emerald-50/50 border-l-4 border-l-emerald-500'
                  : 'hover:bg-gray-50/50';

              return (
                <tr key={rowKey} className={rowClass}>
                  {showSalespersonColumn && <td className="px-3 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.salespersonName || '—'}</td>}
                  <td className="max-md:static md:sticky md:left-0 md:z-10 bg-white px-3 sm:px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap min-w-[120px] border-r border-gray-100">{r.partyName}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">{r.quotationNumber || '—'}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-800 min-w-0">
                    <ProductCell productName={r.productName} />
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{typeof r.rate === 'number' ? formatCurrency(r.rate) : r.rate}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.quantity != null ? (String(r.quantity) + ' ' + (r.unit || '').trim()).trim() || '—' : '—'}</td>
                  <td className="px-3 sm:px-4 py-2 min-w-[120px]">
                    {rules.editable ? (
                      <input
                        type="date"
                        value={confirmationDate}
                        onChange={(e) => handleDeliveryChange(rowKey, 'confirmationDate', e.target.value, r)}
                        className="w-full min-w-0 sm:min-w-[110px] px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 whitespace-nowrap">{confirmationDate || '—'}</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 min-w-[110px] whitespace-nowrap">
                    {(r.quotationStatus === 'cancelled' || r.quotationStatus === 'partially_cancelled' || r.isItemCancelled) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium bg-red-100 text-red-800 border-red-200 whitespace-nowrap">
                        Cancelled
                      </span>
                    ) : (
                      <StatusBadge
                        value={deliveryStatus}
                        onChange={(val) => handleDeliveryChange(rowKey, 'deliveryStatus', val, r)}
                        editable={rules.editable}
                      />
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 min-w-[120px]">
                    {rules.editable ? (
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => handleDeliveryChange(rowKey, 'deliveryDate', e.target.value, r)}
                        className="w-full min-w-0 sm:min-w-[110px] px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 whitespace-nowrap">{deliveryDate || '—'}</span>
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <ActionMenu
                      deliveryStatus={deliveryStatus}
                      onAddPayment={onAddPayment}
                      onCancelProduct={onCancelProduct}
                      onCancelOrder={onCancelOrder}
                      payment={payment}
                      cancelItemFull={cancelItemFull}
                      productName={r.productName}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
