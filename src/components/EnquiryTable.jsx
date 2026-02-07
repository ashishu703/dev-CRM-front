import React from 'react';
import { Calendar, User, Building2, MapPin, FileText, Package, Users, Edit, Trash2, RefreshCw, Settings, Hash } from 'lucide-react';

const EnquiryTable = ({ enquiries, loading, groupedByDate, onRefresh, onEdit, onDelete, visibleColumns = {}, onToggleColumnVisibility }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // If grouped by date, render grouped view
  if (groupedByDate && Object.keys(groupedByDate).length > 0) {
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div
            key={date}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Date Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-white/70 text-blue-600 shadow-sm w-7 h-7 sm:w-8 sm:h-8">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                    {new Date(date).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 sm:ml-auto">
                  {groupedByDate[date].length} enquiry{groupedByDate[date].length !== 1 ? 'ies' : ''}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full min-w-[700px] sm:min-w-0" style={{ tableLayout: 'auto' }}>
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {(visibleColumns.customer_name !== false) && (
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[90px] sm:min-w-[120px]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span>Customer</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.business !== false) && (
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                          <span>Business</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.address !== false) && (
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] sm:min-w-[120px]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          <span>Address</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.state !== false) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                          <span>State</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.division !== false) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                          <span>Division</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.follow_up_status === true) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Follow Up Status
                      </th>
                    )}
                    {(visibleColumns.follow_up_remark === true) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Follow Up Remark
                      </th>
                    )}
                    {(visibleColumns.sales_status === true) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales Status
                      </th>
                    )}
                    {(visibleColumns.enquired_product !== false) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span>Enquired Product</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.product_quantity !== false) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                          <span>Quantity</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.product_remark !== false) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                          <span>Product Remark</span>
                        </div>
                      </th>
                    )}
                    {(visibleColumns.salesperson === true) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salesperson
                      </th>
                    )}
                    {(visibleColumns.telecaller === true) && (
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telecaller
                      </th>
                    )}
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {onToggleColumnVisibility && (
                          <button
                            onClick={onToggleColumnVisibility}
                            className="text-gray-600 hover:text-gray-900"
                            title="Column Visibility"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedByDate[date].map((enquiry, index) => (
                    <tr key={enquiry.id || index} className="hover:bg-gray-50">
                      {(visibleColumns.customer_name !== false) && (
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 max-w-[90px] sm:max-w-[120px] md:max-w-none truncate" title={enquiry.customer_name}>
                          {enquiry.customer_name || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.business !== false) && (
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[100px] sm:max-w-[150px] md:max-w-none truncate" title={enquiry.business || 'N/A'}>
                          {enquiry.business || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.address !== false) && (
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[80px] sm:max-w-[120px] md:max-w-xs truncate" title={enquiry.address || 'N/A'}>
                          {enquiry.address || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.state !== false) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {enquiry.state || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.division !== false) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {enquiry.division || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.follow_up_status === true) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {enquiry.follow_up_status || 'N/A'}
                          </span>
                        </td>
                      )}
                      {(visibleColumns.follow_up_remark === true) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-xs truncate" title={enquiry.follow_up_remark}>
                          {enquiry.follow_up_remark || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.sales_status === true) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {enquiry.sales_status || 'N/A'}
                          </span>
                        </td>
                      )}
                      {(visibleColumns.enquired_product !== false) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-xs truncate" title={enquiry.enquired_product}>
                          {enquiry.enquired_product || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.product_quantity !== false) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {enquiry.product_quantity || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.product_remark !== false) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-xs truncate" title={enquiry.product_remark}>
                          {enquiry.product_remark || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.salesperson === true) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {enquiry.salesperson || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.telecaller === true) && (
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                          {enquiry.telecaller || 'N/A'}
                        </td>
                      )}
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(enquiry)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this enquiry?')) {
                                  onDelete(enquiry.id);
                                }
                              }}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback: render flat list if no grouping
  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No enquiries found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[700px] sm:min-w-0" style={{ tableLayout: 'auto' }}>
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {(visibleColumns.enquiry_date === true) && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span>Date</span>
                  </div>
                </th>
              )}
              {(visibleColumns.customer_name !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[90px] sm:min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span>Customer</span>
                  </div>
                </th>
              )}
              {(visibleColumns.business !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sm:min-w-[150px]">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span>Business</span>
                  </div>
                </th>
              )}
              {(visibleColumns.address !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    <span>Address</span>
                  </div>
                </th>
              )}
              {(visibleColumns.state !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                    <span>State</span>
                  </div>
                </th>
              )}
              {(visibleColumns.division !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                    <span>Division</span>
                  </div>
                </th>
              )}
              {(visibleColumns.follow_up_status === true) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follow Up Status
                </th>
              )}
              {(visibleColumns.follow_up_remark === true) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follow Up Remark
                </th>
              )}
              {(visibleColumns.sales_status === true) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Status
                </th>
              )}
              {(visibleColumns.enquired_product !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span>Enquired Product</span>
                  </div>
                </th>
              )}
              {(visibleColumns.product_quantity !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                    <span>Quantity</span>
                  </div>
                </th>
              )}
              {(visibleColumns.product_remark !== false) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                    <span>Product Remark</span>
                  </div>
                </th>
              )}
              {(visibleColumns.salesperson === true) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salesperson
                </th>
              )}
              {(visibleColumns.telecaller === true) && (
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telecaller
                </th>
              )}
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  {onToggleColumnVisibility && (
                    <button
                      onClick={onToggleColumnVisibility}
                      className="text-gray-600 hover:text-gray-900"
                      title="Column Visibility"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enquiries.map((enquiry, index) => (
              <tr key={enquiry.id || index} className="hover:bg-gray-50">
                {(visibleColumns.enquiry_date === true) && (
                  <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                    {enquiry.enquiry_date ? new Date(enquiry.enquiry_date).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                )}
                      {(visibleColumns.customer_name !== false) && (
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 max-w-[90px] sm:max-w-[120px] md:max-w-none truncate" title={enquiry.customer_name || 'N/A'}>
                          {enquiry.customer_name || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.business !== false) && (
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[100px] sm:max-w-[150px] md:max-w-none truncate" title={enquiry.business || 'N/A'}>
                          {enquiry.business || 'N/A'}
                        </td>
                      )}
                      {(visibleColumns.address !== false) && (
                        <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[80px] sm:max-w-[120px] md:max-w-xs truncate" title={enquiry.address || 'N/A'}>
                          {enquiry.address || 'N/A'}
                        </td>
                      )}
                {(visibleColumns.state !== false) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                    {enquiry.state || 'N/A'}
                  </td>
                )}
                {(visibleColumns.division !== false) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                    {enquiry.division || 'N/A'}
                  </td>
                )}
                {(visibleColumns.follow_up_status === true) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {enquiry.follow_up_status || 'N/A'}
                    </span>
                  </td>
                )}
                {(visibleColumns.follow_up_remark === true) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-xs truncate" title={enquiry.follow_up_remark}>
                    {enquiry.follow_up_remark || 'N/A'}
                  </td>
                )}
                {(visibleColumns.sales_status === true) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {enquiry.sales_status || 'N/A'}
                    </span>
                  </td>
                )}
                {(visibleColumns.enquired_product !== false) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-xs truncate" title={enquiry.enquired_product}>
                    {enquiry.enquired_product || 'N/A'}
                  </td>
                )}
                {(visibleColumns.product_quantity !== false) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                    {enquiry.product_quantity || 'N/A'}
                  </td>
                )}
                {(visibleColumns.product_remark !== false) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-xs truncate" title={enquiry.product_remark}>
                    {enquiry.product_remark || 'N/A'}
                  </td>
                )}
                {(visibleColumns.salesperson === true) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                    {enquiry.salesperson || 'N/A'}
                  </td>
                )}
                {(visibleColumns.telecaller === true) && (
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                    {enquiry.telecaller || 'N/A'}
                  </td>
                )}
                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(enquiry)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this enquiry?')) {
                            onDelete(enquiry.id);
                          }
                        }}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnquiryTable;

