import React from 'react';
import { X } from 'lucide-react';

const ColumnFilterModal = ({ isOpen, onClose, visibleColumns, onToggleColumn, onResetColumns, onShowAllColumns, columnLabels: customColumnLabels }) => {
  if (!isOpen) return null;

  const defaultColumnLabels = {
    customerId: 'Customer ID',
    customer: 'Customer',
    business: 'Business',
    address: 'Address',
    state: 'State',
    division: 'Division',
    followUpStatus: 'Follow Up Status',
    salesStatus: 'Sales Status',
    assignedSalesperson: 'Assigned Salesperson',
    assignedTelecaller: 'Assigned Telecaller',
    gstNo: 'GST No',
    leadSource: 'Lead Source',
    productNames: 'Product Name',
    category: 'Category',
    createdAt: 'Created',
    telecallerStatus: 'Telecaller Status',
    paymentStatus: 'Payment Status',
    updatedAt: 'Updated At',
    // Enquiry specific columns
    customer_name: 'Customer Name',
    enquired_product: 'Enquired Product',
    product_quantity: 'Quantity',
    product_remark: 'Product Remark',
    follow_up_status: 'Follow Up Status',
    follow_up_remark: 'Follow Up Remark',
    sales_status: 'Sales Status',
    sales_status_remark: 'Sales Status Remark',
    salesperson: 'Salesperson',
    telecaller: 'Telecaller',
    enquiry_date: 'Enquiry Date'
  };

  const columnLabels = customColumnLabels || defaultColumnLabels;

  // Ensure division is in visibleColumns if it's missing (for backward compatibility)
  const safeVisibleColumns = {
    ...visibleColumns,
    division: visibleColumns.division !== undefined ? visibleColumns.division : false
  };

  // Define the order of columns to ensure consistent display
  const columnOrder = [
    'customerId', 'customer', 'customer_name', 'business', 'address', 'state', 'division',
    'followUpStatus', 'follow_up_status', 'follow_up_remark', 'salesStatus', 'sales_status', 'sales_status_remark',
    'assignedSalesperson', 'assignedTelecaller', 'salesperson', 'telecaller',
    'gstNo', 'leadSource', 'productNames', 'enquired_product', 'product_quantity', 'product_remark',
    'category', 'createdAt', 'enquiry_date', 'telecallerStatus', 'paymentStatus', 'updatedAt'
  ];

  // Sort entries by predefined order
  const sortedColumns = columnOrder
    .filter(key => safeVisibleColumns.hasOwnProperty(key))
    .map(key => [key, safeVisibleColumns[key]])
    .concat(
      Object.entries(safeVisibleColumns)
        .filter(([key]) => !columnOrder.includes(key))
    );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Column Filter</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Show/Hide Columns</span>
              <div className="flex space-x-2">
                <button
                  onClick={onResetColumns}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Reset
                </button>
                <button
                  onClick={onShowAllColumns}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Show All
                </button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sortedColumns.map(([key, value]) => (
                <label key={key} className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors">
                  <span className="text-sm text-gray-700 flex-1 select-none">{columnLabels[key] || key}</span>
                  <input
                    type="checkbox"
                    checked={value || false}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleColumn(key);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                    style={{ 
                      minWidth: '20px',
                      minHeight: '20px',
                      accentColor: '#2563eb',
                      cursor: 'pointer'
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnFilterModal;

