import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Edit, Eye, Trash2, ChevronDown } from 'lucide-react';
import DataTable from './DataTable';
import AddStoreModal from './AddStoreModal';
import EditStoreModal from './EditStoreModal';
import ViewStoreModal from './ViewStoreModal';
import inventoryService from '../../services/inventoryService';

const StoresManagement = () => {
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [showViewStoreModal, setShowViewStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const downloadDropdownRef = useRef(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalInStoreValue = stores.length;
  const totalRejectStoreValue = 0;

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getStores({ limit: 1000 });
      if (response.success) {
        const mapped = (response.data?.data || []).map(store => ({
          id: store.id,
          storeName: store.name,
          storeType: store.store_type || 'In Stock',
          inStockItems: 0,
          rejectItems: 0,
          address: [
            store.address,
            store.city,
            store.state,
            store.pincode,
            store.country
          ].filter(Boolean).join(', ')
        }));
        setStores(mapped);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      alert('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target)) {
        setShowDownloadDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate CSV data
  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data available to download');
      return;
    }

    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle objects and arrays
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          // Escape commas and quotes
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInStock = () => {
    const inStockData = stores.map(store => ({
      'Store Name': store.storeName,
      'Store Type': 'In Stock',
      'Items Count': store.inStockItems,
      'Address': store.address,
      'Total Value': totalInStoreValue
    }));
    generateCSV(inStockData, 'in_stock_data.csv');
    setShowDownloadDropdown(false);
  };

  const handleDownloadOutStock = () => {
    const outStockData = stores.map(store => ({
      'Store Name': store.storeName,
      'Store Type': 'Reject',
      'Items Count': store.rejectItems,
      'Address': store.address,
      'Total Value': totalRejectStoreValue
    }));
    generateCSV(outStockData, 'out_stock_data.csv');
    setShowDownloadDropdown(false);
  };

  const columns = [
    {
      key: 'storeName',
      label: 'Store Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">{row.storeName}</span>
      )
    },
    {
      key: 'storeType',
      label: 'Store Type',
      sortable: true,
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            In Stock {row.inStockItems} Items
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Reject {row.rejectItems} Items
          </span>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Store Address',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-700">{row.address}</span>
      )
    }
  ];

  const handleEdit = (store) => {
    setSelectedStore(store);
    setShowEditStoreModal(true);
  };

  const handleView = (store) => {
    setSelectedStore(store);
    setShowViewStoreModal(true);
  };

  const handleDelete = (store) => {
    if (window.confirm(`Are you sure you want to delete "${store.storeName}"?`)) {
      inventoryService.deleteStore(store.id)
        .then(() => fetchStores())
        .catch(err => {
          console.error('Error deleting store:', err);
          alert('Failed to delete store');
        });
    }
  };

  const renderRowActions = (row) => (
    <div className="flex items-center gap-1 sm:gap-2">
      <button 
        onClick={() => handleEdit(row)}
        className="text-blue-600 hover:text-blue-900 p-1 transition-colors" 
        title="Edit" 
        aria-label="Edit"
      >
        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <button 
        onClick={() => handleView(row)}
        className="text-green-600 hover:text-green-900 p-1 transition-colors" 
        title="View" 
        aria-label="View"
      >
        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <button 
        onClick={() => handleDelete(row)}
        className="text-red-600 hover:text-red-900 p-1 transition-colors" 
        title="Delete" 
        aria-label="Delete"
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-gray-600">
        Dashboard / Store Management
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowAddStoreModal(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Store</span>
            <span className="sm:hidden">Add</span>
          </button>
          <div className="relative" ref={downloadDropdownRef}>
            <button 
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">DL</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {showDownloadDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={handleDownloadInStock}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg"
                >
                  In Stock Data (CSV)
                </button>
                <button
                  onClick={handleDownloadOutStock}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors last:rounded-b-lg"
                >
                  Out Stock Data (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search Stores"
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total In Store value</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">₹ {totalInStoreValue.toLocaleString()}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Reject Store value</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">₹ {totalRejectStoreValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={stores}
        searchPlaceholder="Search stores..."
        renderRowActions={renderRowActions}
        loading={loading}
      />

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={showAddStoreModal}
        onClose={() => setShowAddStoreModal(false)}
        onSubmit={async (data) => {
          try {
            await inventoryService.createStore({
              name: data.storeName,
              address: [data.address1, data.address2].filter(Boolean).join(', '),
              city: data.city || null,
              state: data.state || null,
              country: data.country || 'India',
              pincode: data.pinCode || null,
              store_type: data.storeTypes.inStock && data.storeTypes.reject
                ? 'Both'
                : data.storeTypes.inStock
                  ? 'In Stock'
                  : 'Reject',
              is_active: true
            });
            setShowAddStoreModal(false);
            fetchStores();
          } catch (error) {
            console.error('Error creating store:', error);
            alert('Failed to create store');
          }
        }}
      />

      {/* Edit Store Modal */}
      <EditStoreModal
        isOpen={showEditStoreModal}
        onClose={() => {
          setShowEditStoreModal(false);
          setSelectedStore(null);
        }}
        onSubmit={(data) => {
          inventoryService.updateStore(data.id, {
            name: data.storeName,
            address: [data.address1, data.address2].filter(Boolean).join(', '),
            city: data.city || null,
            state: data.state || null,
            country: data.country || 'India',
            pincode: data.pinCode || null,
            store_type: data.storeTypes.inStock && data.storeTypes.reject
              ? 'Both'
              : data.storeTypes.inStock
                ? 'In Stock'
                : 'Reject',
            is_active: true
          }).then(() => fetchStores())
            .catch(err => {
              console.error('Error updating store:', err);
              alert('Failed to update store');
            });
        }}
        store={selectedStore}
      />

      {/* View Store Modal */}
      <ViewStoreModal
        isOpen={showViewStoreModal}
        onClose={() => {
          setShowViewStoreModal(false);
          setSelectedStore(null);
        }}
        store={selectedStore}
      />
    </div>
  );
};

export default StoresManagement;

