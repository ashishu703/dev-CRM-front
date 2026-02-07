import React from 'react';
import {
  Hash, User, Building, Shield, Tag, Clock, Settings,
  Calendar, CheckCircle, XCircle, Edit, Eye, Phone, RefreshCw
} from 'lucide-react';
import InlineStatusDropdown from './InlineStatusDropdown';
import InlineFollowUpStatusCell from './InlineFollowUpStatusCell';

const TH_CLASS = 'px-1.5 py-1 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider';
const TD_CLASS = 'px-1.5 py-1 text-xs text-gray-900 align-top';
const FILTER_INPUT_CLASS = 'w-full px-1 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500';
const ICON_BOX_CLASS = 'w-5 h-5 rounded flex items-center justify-center flex-shrink-0';

const COL_WIDTHS = {
  checkbox: '32px',
  customerId: '82px',
  customer: '130px',
  business: '110px',
  address: '120px',
  state: '58px',
  division: '58px',
  followUpStatus: '100px',
  salesStatus: '92px',
  assignedSalesperson: '72px',
  assignedTelecaller: '72px',
  gstNo: '82px',
  leadSource: '88px',
  productNames: '110px',
  category: '72px',
  createdAt: '72px',
  telecallerStatus: '88px',
  paymentStatus: '88px',
  updatedAt: '72px',
  actions: '88px'
};

const TruncateCell = ({ value, title, className = '' }) => (
  <td className={`${TD_CLASS} ${className}`} title={title ?? value}>
    <span className="block truncate">{value || '—'}</span>
  </td>
);

const LeadTable = ({
  filteredLeads,
  tableLoading,
  hasStatusFilter,
  visibleColumns,
  isAllSelected,
  selectedLeadIds,
  isLeadAssigned,
  isValueAssigned,
  getStatusBadge,
  toggleSelectAll,
  toggleSelectOne,
  onEdit,
  onViewTimeline,
  onAssign,
  showCustomerTimeline,
  setShowColumnFilter,
  allLeadsData,
  usernames,
  columnFilters = {},
  onColumnFilterChange,
  showColumnFilterRow = false,
  onToggleColumnFilterRow,
  onFollowUpStatusChange,
  onSalesStatusChange,
  onAppointmentChange
}) => {
  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden w-full max-w-full"
      style={{
        borderTopRightRadius: showCustomerTimeline ? 0 : '1rem',
        borderBottomRightRadius: showCustomerTimeline ? 0 : '1rem',
        borderRight: showCustomerTimeline ? 'none' : undefined
      }}
    >
      <div className="overflow-x-auto w-full max-w-full">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: 'fixed', width: '100%', minWidth: '900px' }}
        >
          <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className={TH_CLASS} style={{ width: COL_WIDTHS.checkbox }}>
                <input
                  type="checkbox"
                  checked={isAllSelected && filteredLeads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded-full w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              {visibleColumns.customerId && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.customerId }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-purple-500 to-pink-500`}><Hash className="w-3 h-3 text-white" /></div>
                    <span>Customer ID</span>
                  </div>
                </th>
              )}
              {visibleColumns.customer && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.customer }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-blue-500 to-cyan-500`}><User className="w-3 h-3 text-white" /></div>
                    <span>Customer</span>
                  </div>
                </th>
              )}
              {visibleColumns.business && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.business }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-indigo-500 to-purple-500`}><Building className="w-3 h-3 text-white" /></div>
                    <span>Business</span>
                  </div>
                </th>
              )}
              {visibleColumns.address && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.address }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-orange-500 to-amber-500`}><Building className="w-3 h-3 text-white" /></div>
                    <span>Address</span>
                  </div>
                </th>
              )}
              {visibleColumns.state && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.state }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-green-500 to-emerald-500`}><Building className="w-3 h-3 text-white" /></div>
                    <span>State</span>
                  </div>
                </th>
              )}
              {visibleColumns.division && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.division }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-teal-500 to-cyan-500`}><Building className="w-3 h-3 text-white" /></div>
                    <span>Division</span>
                  </div>
                </th>
              )}
              {visibleColumns.followUpStatus && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.followUpStatus }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-amber-500 to-orange-500`}><Clock className="w-3 h-3 text-white" /></div>
                    <span>Follow Up</span>
                  </div>
                </th>
              )}
              {visibleColumns.salesStatus && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.salesStatus }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-yellow-500 to-amber-500`}><Clock className="w-3 h-3 text-white" /></div>
                    <span>Sales Status</span>
                  </div>
                </th>
              )}
              {visibleColumns.assignedSalesperson && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.assignedSalesperson }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-sky-500 to-blue-500`}><User className="w-3 h-3 text-white" /></div>
                    <span>Salesperson</span>
                  </div>
                </th>
              )}
              {visibleColumns.assignedTelecaller && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.assignedTelecaller }}>
                  <div className="flex items-center gap-1">
                    <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-cyan-500 to-teal-500`}><Phone className="w-3 h-3 text-white" /></div>
                    <span>Telecaller</span>
                  </div>
                </th>
              )}
              {visibleColumns.gstNo && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.gstNo }}>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-indigo-600" />
                    <span>GST No</span>
                  </div>
                </th>
              )}
              {visibleColumns.leadSource && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.leadSource }}>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-orange-600" />
                    <span>Lead Source</span>
                  </div>
                </th>
              )}
              {visibleColumns.productNames && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.productNames }}>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-pink-600" />
                    <span>Product</span>
                  </div>
                </th>
              )}
              {visibleColumns.category && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.category }}>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-pink-600" />
                    <span>Category</span>
                  </div>
                </th>
              )}
              {visibleColumns.createdAt && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.createdAt }}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>Created</span>
                  </div>
                </th>
              )}
              {visibleColumns.telecallerStatus && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.telecallerStatus }}>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Tel. Status</span>
                  </div>
                </th>
              )}
              {visibleColumns.paymentStatus && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.paymentStatus }}>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Payment</span>
                  </div>
                </th>
              )}
              {visibleColumns.updatedAt && (
                <th className={TH_CLASS} style={{ width: COL_WIDTHS.updatedAt }}>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>Updated</span>
                  </div>
                </th>
              )}
              <th className={`${TH_CLASS} text-right`} style={{ width: COL_WIDTHS.actions }}>
                <div className="flex items-center justify-end gap-1">
                  <div className={`${ICON_BOX_CLASS} bg-gradient-to-br from-gray-500 to-slate-500`}><Settings className="w-3 h-3 text-white" /></div>
                  <span>Actions</span>
                </div>
              </th>
            </tr>
            {showColumnFilterRow && (
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-1.5 py-1" />
                {visibleColumns.customerId && <td className="px-1.5 py-1"><input type="text" value={columnFilters.customerId || ''} onChange={(e) => onColumnFilterChange?.('customerId', e.target.value)} placeholder="ID" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.customer && <td className="px-1.5 py-1"><input type="text" value={columnFilters.customer || ''} onChange={(e) => onColumnFilterChange?.('customer', e.target.value)} placeholder="Customer" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.business && <td className="px-1.5 py-1"><input type="text" value={columnFilters.business || ''} onChange={(e) => onColumnFilterChange?.('business', e.target.value)} placeholder="Business" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.address && <td className="px-1.5 py-1"><input type="text" value={columnFilters.address || ''} onChange={(e) => onColumnFilterChange?.('address', e.target.value)} placeholder="Address" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.state && <td className="px-1.5 py-1"><input type="text" value={columnFilters.state || ''} onChange={(e) => onColumnFilterChange?.('state', e.target.value)} placeholder="State" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.division && <td className="px-1.5 py-1"><input type="text" value={columnFilters.division || ''} onChange={(e) => onColumnFilterChange?.('division', e.target.value)} placeholder="Division" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.followUpStatus && <td className="px-1.5 py-1"><input type="text" value={columnFilters.followUpStatus || ''} onChange={(e) => onColumnFilterChange?.('followUpStatus', e.target.value)} placeholder="Status" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.salesStatus && <td className="px-1.5 py-1"><input type="text" value={columnFilters.salesStatus || ''} onChange={(e) => onColumnFilterChange?.('salesStatus', e.target.value)} placeholder="Status" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.assignedSalesperson && <td className="px-1.5 py-1" />}
                {visibleColumns.assignedTelecaller && <td className="px-1.5 py-1" />}
                {visibleColumns.gstNo && <td className="px-1.5 py-1"><input type="text" value={columnFilters.gstNo || ''} onChange={(e) => onColumnFilterChange?.('gstNo', e.target.value)} placeholder="GST" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.leadSource && <td className="px-1.5 py-1"><input type="text" value={columnFilters.leadSource || ''} onChange={(e) => onColumnFilterChange?.('leadSource', e.target.value)} placeholder="Source" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.productNames && <td className="px-1.5 py-1"><input type="text" value={columnFilters.productNames || ''} onChange={(e) => onColumnFilterChange?.('productNames', e.target.value)} placeholder="Product" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.category && <td className="px-1.5 py-1"><input type="text" value={columnFilters.category || ''} onChange={(e) => onColumnFilterChange?.('category', e.target.value)} placeholder="Category" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.createdAt && <td className="px-1.5 py-1"><input type="text" value={columnFilters.createdAt || ''} onChange={(e) => onColumnFilterChange?.('createdAt', e.target.value)} placeholder="Date" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.telecallerStatus && <td className="px-1.5 py-1"><input type="text" value={columnFilters.telecallerStatus || ''} onChange={(e) => onColumnFilterChange?.('telecallerStatus', e.target.value)} placeholder="Status" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.paymentStatus && <td className="px-1.5 py-1"><input type="text" value={columnFilters.paymentStatus || ''} onChange={(e) => onColumnFilterChange?.('paymentStatus', e.target.value)} placeholder="Status" className={FILTER_INPUT_CLASS} /></td>}
                {visibleColumns.updatedAt && <td className="px-1.5 py-1"><input type="text" value={columnFilters.updatedAt || ''} onChange={(e) => onColumnFilterChange?.('updatedAt', e.target.value)} placeholder="Date" className={FILTER_INPUT_CLASS} /></td>}
                <td className="px-1.5 py-1" />
              </tr>
            )}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tableLoading ? (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-3 py-4 text-center text-xs text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading leads...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-3 py-4 text-center text-xs text-gray-500">
                  {hasStatusFilter ? 'No leads match this filter. Clear filter to see all leads.' : 'No leads found. Add a new customer to get started.'}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, index) => {
                const uniqueKey = lead.id != null ? `lead-${lead.id}-${index}${lead._renderIndex != null ? `-${lead._renderIndex}` : ''}` : `lead-no-id-${index}`;
                return (
                  <tr key={uniqueKey} className="hover:bg-blue-50/40 border-b border-gray-100 transition-colors">
                    <td className={TD_CLASS}>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={() => toggleSelectOne(lead.id)}
                        title={isLeadAssigned(lead) ? 'Click to reassign' : 'Select for assignment'}
                        className="rounded-full w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    {visibleColumns.customerId && <td className={TD_CLASS} title={lead.customerId}><span className="block truncate">{lead.customerId}</span></td>}
                    {visibleColumns.customer && (
                      <td className={TD_CLASS}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-medium truncate block" title={lead.customer}>{lead.customer}</span>
                            {lead.leadSource && lead.leadSource.toUpperCase() === 'TRADEINDIA' && (
                              <span className="px-1 py-0.5 text-[9px] font-semibold text-orange-700 bg-orange-100 rounded flex-shrink-0" title="TradeIndia">TI</span>
                            )}
                          </div>
                          <div className="text-gray-600 text-[10px] truncate" title={lead.phone}>{lead.phone}</div>
                          <div className="flex gap-1.5 flex-wrap">
                            {lead.whatsapp && <a href={`https://wa.me/91${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 text-[9px]">WhatsApp</a>}
                            {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 text-[9px]">Email</a>}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.business && <TruncateCell value={lead.business} title={lead.business} />}
                    {visibleColumns.address && <TruncateCell value={lead.address} title={lead.address} />}
                    {visibleColumns.state && <td className={TD_CLASS}><span className="block truncate" title={lead.state}>{lead.state || '—'}</span></td>}
                    {visibleColumns.division && <td className={TD_CLASS}><span className="block truncate" title={lead.division}>{lead.division || '—'}</span></td>}
                    {visibleColumns.followUpStatus && (
                      <td className={TD_CLASS}>
                        <InlineFollowUpStatusCell
                          value={lead.followUpStatus || lead.connectedStatus || lead.telecallerStatus}
                          leadId={lead.id}
                          followUpDate={lead.followUpDate || lead.follow_up_date}
                          followUpTime={lead.followUpTime || lead.follow_up_time}
                          followUpRemark={lead.followUpRemark || lead.follow_up_remark}
                          onChange={onFollowUpStatusChange}
                          onAppointmentChange={onAppointmentChange}
                        />
                      </td>
                    )}
                    {visibleColumns.salesStatus && (
                      <td className={TD_CLASS}>
                        <div className="space-y-0.5">
                          <InlineStatusDropdown value={lead.salesStatus} leadId={lead.id} onChange={onSalesStatusChange} />
                          {lead.salesStatusRemark && <div className="text-[9px] text-gray-600 italic truncate" title={lead.salesStatusRemark}>"{lead.salesStatusRemark}"</div>}
                        </div>
                      </td>
                    )}
                    {visibleColumns.assignedSalesperson && <td className={TD_CLASS} title={isValueAssigned(lead.assignedSalesperson) ? lead.assignedSalesperson : 'Unassigned'}><span className="block truncate">{isValueAssigned(lead.assignedSalesperson) ? lead.assignedSalesperson : 'Unassigned'}</span></td>}
                    {visibleColumns.assignedTelecaller && <td className={TD_CLASS} title={isValueAssigned(lead.assignedTelecaller) ? lead.assignedTelecaller : 'Unassigned'}><span className="block truncate">{isValueAssigned(lead.assignedTelecaller) ? lead.assignedTelecaller : 'Unassigned'}</span></td>}
                    {visibleColumns.gstNo && <td className={TD_CLASS} title={lead.gstNo}><span className="block truncate">{lead.gstNo || '—'}</span></td>}
                    {visibleColumns.leadSource && <td className={TD_CLASS} title={lead.leadSource}><span className="block truncate">{lead.leadSource || '—'}</span></td>}
                    {visibleColumns.productNames && <td className={TD_CLASS} title={lead.productNamesText}><span className="block truncate">{lead.productNamesText || '—'}</span></td>}
                    {visibleColumns.category && <td className={TD_CLASS} title={lead.category}><span className="block truncate">{lead.category || '—'}</span></td>}
                    {visibleColumns.createdAt && <td className={TD_CLASS}>{lead.createdAt}</td>}
                    {visibleColumns.telecallerStatus && <td className={TD_CLASS}>{getStatusBadge(lead.telecallerStatus, 'telecaller')}</td>}
                    {visibleColumns.paymentStatus && <td className={TD_CLASS}>{getStatusBadge(lead.paymentStatus, 'payment')}</td>}
                    {visibleColumns.updatedAt && <td className={TD_CLASS}>{lead.updated_at || lead.createdAt}</td>}
                    <td className={`${TD_CLASS} text-right`}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => onEdit(lead)} className="p-0.5 text-blue-600 hover:text-blue-900" title="Edit"><Edit className="w-3 h-3" /></button>
                        <button onClick={() => onViewTimeline(lead)} className="p-0.5 text-green-600 hover:text-green-900" title="Timeline"><Eye className="w-3 h-3" /></button>
                        {isLeadAssigned(lead) ? (
                          <span className="px-1 py-0.5 text-[9px] font-semibold text-green-700 bg-green-100 rounded" title="Assigned">Assigned</span>
                        ) : (
                          <button onClick={() => onAssign(lead)} className="text-indigo-600 hover:text-indigo-900 text-[10px]" title="Assign">Assign</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;

