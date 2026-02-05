import React from 'react';
import { 
  Hash, User, Building, Shield, Tag, Clock, Settings,
  Calendar, CheckCircle, XCircle, Edit, Eye, Phone, RefreshCw
} from 'lucide-react';
import InlineStatusDropdown from './InlineStatusDropdown';
import InlineFollowUpStatusCell from './InlineFollowUpStatusCell';

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
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
      style={{
        marginRight: 0,
        marginLeft: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        borderTopRightRadius: showCustomerTimeline ? 0 : '1rem',
        borderBottomRightRadius: showCustomerTimeline ? 0 : '1rem',
        borderRight: showCustomerTimeline ? 'none' : '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div
        className="overflow-x-auto -mx-3 sm:mx-0"
        style={{
          marginRight: 0,
          paddingRight: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <table className="w-full min-w-[800px] sm:min-w-0" style={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse', margin: 0 }}>
          <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-1.5 sm:px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={isAllSelected && filteredLeads.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              {visibleColumns.customerId && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[110px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Hash className="w-3 h-3 text-white" />
                    </div>
                    <span>Customer ID</span>
                  </div>
                </th>
              )}
              {visibleColumns.customer && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[180px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span>Customer</span>
                  </div>
                </th>
              )}
              {visibleColumns.business && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[160px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Building className="w-3 h-3 text-white" />
                    </div>
                    <span>Business</span>
                  </div>
                </th>
              )}
              {visibleColumns.address && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[160px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <Building className="w-3 h-3 text-white" />
                    </div>
                    <span>Address</span>
                  </div>
                </th>
              )}
              {visibleColumns.state && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[100px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Building className="w-3 h-3 text-white" />
                    </div>
                    <span>State</span>
                  </div>
                </th>
              )}
              {visibleColumns.division && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[100px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                      <Building className="w-3 h-3 text-white" />
                    </div>
                    <span>Division</span>
                  </div>
                </th>
              )}
              {visibleColumns.followUpStatus && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[120px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span>Follow Up Status</span>
                  </div>
                </th>
              )}
              {visibleColumns.salesStatus && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[120px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span>Sales Status</span>
                  </div>
                </th>
              )}
              {visibleColumns.assignedSalesperson && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider w-[160px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span>Assigned Salesperson</span>
                  </div>
                </th>
              )}
              {visibleColumns.assignedTelecaller && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[130px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                      <Phone className="w-3 h-3 text-white" />
                    </div>
                    <span>Assigned Telecaller</span>
                  </div>
                </th>
              )}
              {visibleColumns.gstNo && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                  <div className="flex items-center space-x-1.5">
                    <Hash className="w-3 h-3 text-indigo-600" />
                    <span>GST No</span>
                  </div>
                </th>
              )}
              {visibleColumns.leadSource && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[160px]">
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3 h-3 text-orange-600" />
                    <span>Lead Source</span>
                  </div>
                </th>
              )}
              {visibleColumns.productNames && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[180px]">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3 h-3 text-pink-600" />
                    <span>Product Name</span>
                  </div>
                </th>
              )}
              {visibleColumns.category && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3 h-3 text-pink-600" />
                    <span>Category</span>
                  </div>
                </th>
              )}
              {visibleColumns.createdAt && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>Created</span>
                  </div>
                </th>
              )}
              {visibleColumns.telecallerStatus && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>Telecaller Status</span>
                  </div>
                </th>
              )}
              {visibleColumns.paymentStatus && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                  <div className="flex items-center space-x-1.5">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Payment Status</span>
                  </div>
                </th>
              )}
              {visibleColumns.updatedAt && (
                <th className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span>Updated At</span>
                  </div>
                </th>
              )}
              <th className="px-1.5 sm:px-2 py-1.5 text-right text-[10px] font-bold text-gray-800 uppercase tracking-wider w-[90px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="flex items-center justify-end space-x-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                    <Settings className="w-3 h-3 text-white" />
                  </div>
                  <span>Actions</span>
                </div>
              </th>
            </tr>
            {showColumnFilterRow && (
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-2 sm:px-3 md:px-4 py-2"></td>
                {visibleColumns.customerId && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.customerId || ''}
                      onChange={(e) => onColumnFilterChange?.('customerId', e.target.value)}
                      placeholder="Filter ID"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.customer && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.customer || ''}
                      onChange={(e) => onColumnFilterChange?.('customer', e.target.value)}
                      placeholder="Filter Customer"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.business && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.business || ''}
                      onChange={(e) => onColumnFilterChange?.('business', e.target.value)}
                      placeholder="Filter Business"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.address && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.address || ''}
                      onChange={(e) => onColumnFilterChange?.('address', e.target.value)}
                      placeholder="Filter Address"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.state && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.state || ''}
                      onChange={(e) => onColumnFilterChange?.('state', e.target.value)}
                      placeholder="Filter State"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.division && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.division || ''}
                      onChange={(e) => onColumnFilterChange?.('division', e.target.value)}
                      placeholder="Filter Division"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.followUpStatus && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.followUpStatus || ''}
                      onChange={(e) => onColumnFilterChange?.('followUpStatus', e.target.value)}
                      placeholder="Filter Status"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.salesStatus && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.salesStatus || ''}
                      onChange={(e) => onColumnFilterChange?.('salesStatus', e.target.value)}
                      placeholder="Filter Status"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.assignedSalesperson && (
                  <td className="px-1.5 sm:px-2 py-1"></td>
                )}
                {visibleColumns.assignedTelecaller && (
                  <td className="px-1.5 sm:px-2 py-1"></td>
                )}
                {visibleColumns.gstNo && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.gstNo || ''}
                      onChange={(e) => onColumnFilterChange?.('gstNo', e.target.value)}
                      placeholder="Filter GST"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.leadSource && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.leadSource || ''}
                      onChange={(e) => onColumnFilterChange?.('leadSource', e.target.value)}
                      placeholder="Filter Source"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.productNames && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.productNames || ''}
                      onChange={(e) => onColumnFilterChange?.('productNames', e.target.value)}
                      placeholder="Filter Product"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.category && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.category || ''}
                      onChange={(e) => onColumnFilterChange?.('category', e.target.value)}
                      placeholder="Filter Category"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.createdAt && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.createdAt || ''}
                      onChange={(e) => onColumnFilterChange?.('createdAt', e.target.value)}
                      placeholder="Filter Date"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.telecallerStatus && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.telecallerStatus || ''}
                      onChange={(e) => onColumnFilterChange?.('telecallerStatus', e.target.value)}
                      placeholder="Filter Status"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.paymentStatus && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.paymentStatus || ''}
                      onChange={(e) => onColumnFilterChange?.('paymentStatus', e.target.value)}
                      placeholder="Filter Status"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                {visibleColumns.updatedAt && (
                  <td className="px-1.5 sm:px-2 py-1">
                    <input
                      type="text"
                      value={columnFilters.updatedAt || ''}
                      onChange={(e) => onColumnFilterChange?.('updatedAt', e.target.value)}
                      placeholder="Filter Date"
                      className="w-full px-1.5 py-0.5 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                )}
                <td className="px-2 sm:px-3 md:px-4 py-2"></td>
              </tr>
            )}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tableLoading ? (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-4 py-6 text-center text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading leads...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-4 py-6 text-center text-xs text-gray-500">
                  {hasStatusFilter
                    ? 'No leads match this filter. Clear filter to see all leads.'
                    : 'No leads found. Add a new customer to get started.'}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, index) => {
                // Generate unique key: use ID + index to ensure uniqueness even if IDs are duplicated
                const uniqueKey = lead.id != null 
                  ? `lead-${lead.id}-${index}${lead._renderIndex != null ? `-${lead._renderIndex}` : ''}` 
                  : `lead-no-id-${index}`;
                return (
                <tr key={uniqueKey} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 border-b border-gray-100">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={() => toggleSelectOne(lead.id)}
                      title={isLeadAssigned(lead) ? 'Click to reassign' : 'Select for assignment'}
                    />
                  </td>
                  {visibleColumns.customerId && (
                    <td className="px-2 py-2 text-xs text-gray-700">{lead.customerId}</td>
                  )}
                  {visibleColumns.customer && (
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-[180px]">
                      <div>
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="font-medium break-words whitespace-normal">{lead.customer}</span>
                          {lead.leadSource && lead.leadSource.toUpperCase() === 'TRADEINDIA' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 bg-orange-100 border border-orange-300 rounded-full flex-shrink-0" title="Generated from TradeIndia">
                              TRADEINDIA
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 break-words whitespace-normal text-[11px]">{lead.phone}</div>
                        {lead.whatsapp && (
                          <a 
                            href={`https://wa.me/91${lead.whatsapp}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-[10px] flex items-center gap-0.5"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`}
                            className="text-blue-600 hover:text-blue-800 text-[10px] flex items-center gap-0.5"
                          >
                            📧 Email
                          </a>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.business && (
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-[160px] break-words whitespace-normal">{lead.business}</td>
                  )}
                  {visibleColumns.address && (
                    <td className="px-2 py-2 text-xs text-gray-900 max-w-[160px] break-words whitespace-normal">{lead.address}</td>
                  )}
                  {visibleColumns.state && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.state}</td>
                  )}
                  {visibleColumns.division && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.division || '-'}</td>
                  )}
                  {visibleColumns.followUpStatus && (
                    <td className="px-2 py-2">
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
                    <td className="px-2 py-2">
                      <div className="space-y-1">
                        <InlineStatusDropdown
                          value={lead.salesStatus}
                          leadId={lead.id}
                          onChange={onSalesStatusChange}
                        />
                        {lead.salesStatusRemark && (
                          <div className="text-[10px] text-gray-600 italic">"{lead.salesStatusRemark}"</div>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.assignedSalesperson && (
                    <td className="px-2 py-2 text-xs text-gray-900">{isValueAssigned(lead.assignedSalesperson) ? lead.assignedSalesperson : 'Unassigned'}</td>
                  )}
                  {visibleColumns.assignedTelecaller && (
                    <td className="px-2 py-2 text-xs text-gray-900">{isValueAssigned(lead.assignedTelecaller) ? lead.assignedTelecaller : 'Unassigned'}</td>
                  )}
                  {visibleColumns.gstNo && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.gstNo}</td>
                  )}
                  {visibleColumns.leadSource && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.leadSource}</td>
                  )}
                  {visibleColumns.productNames && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.productNamesText}</td>
                  )}
                  {visibleColumns.category && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.category}</td>
                  )}
                  {visibleColumns.createdAt && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.createdAt}</td>
                  )}
                  {visibleColumns.telecallerStatus && (
                    <td className="px-2 py-2">
                      {getStatusBadge(lead.telecallerStatus, 'telecaller')}
                    </td>
                  )}
                  {visibleColumns.paymentStatus && (
                    <td className="px-2 py-2">
                      {getStatusBadge(lead.paymentStatus, 'payment')}
                    </td>
                  )}
                  {visibleColumns.updatedAt && (
                    <td className="px-2 py-2 text-xs text-gray-900">{lead.updated_at || lead.createdAt}</td>
                  )}
                  <td className="px-2 py-2 text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onEdit(lead)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Lead"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewTimeline(lead)}
                        className="text-green-600 hover:text-green-900"
                        title="View Customer Timeline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {isLeadAssigned(lead) ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 rounded" title="Already assigned">
                          Assigned
                        </span>
                      ) : (
                        <button
                          onClick={() => onAssign(lead)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Assign Lead"
                        >
                          Assign
                        </button>
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

