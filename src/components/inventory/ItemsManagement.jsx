import React, { useState, useEffect } from 'react';
import { Plus, Settings, Edit, ArrowLeftRight, Clock, Trash2, Filter } from 'lucide-react';
import DataTable from './DataTable';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';
import StockTransferModal from './StockTransferModal';
import ItemHistoryModal from './ItemHistoryModal';
import CategoriesModal from './CategoriesModal';
import UOMModal from './UOMModal';
import StockUpdateModal from './StockUpdateModal';
import ColumnPreferenceModal from './ColumnPreferenceModal';
import FilterModal from './FilterModal';
import inventoryService from '../../services/inventoryService';

const ItemsManagement = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showStockTransferModal, setShowStockTransferModal] = useState(false);
  const [showItemHistoryModal, setShowItemHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
  const [showColumnPreferenceModal, setShowColumnPreferenceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchItems();
  }, [filters, pagination.page, pagination.limit]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await inventoryService.getItems(params);
      if (response.success) {
        const formattedItems = response.data.data.map(item => ({
          id: item.id,
          itemId: item.item_id,
          itemName: item.item_name,
          uom: item.uom_code || item.uom_name,
          hsn: item.hsn,
          type: item.item_type,
          storeWiseStock: item.store_name,
          inStock: parseFloat(item.current_stock) || 0,
          rejectStock: parseFloat(item.reject_stock) || 0,
          category: item.category_name,
          subCategory: item.sub_category_name
        }));
        setItems(formattedItems);
        setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const allColumns = [
    {
      key: 'itemId',
      label: 'Item ID',
      sortable: true,
      visible: visibleColumns.itemId !== false,
      render: (row) => (
        <span className="text-blue-600 font-medium">{row.itemId}</span>
      )
    },
    {
      key: 'itemDetails',
      label: 'Item Details',
      sortable: true,
      visible: visibleColumns.itemDetails !== false,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.itemName}</div>
          <div className="text-xs text-gray-500">UOM: {row.uom}</div>
          <div className="text-xs text-gray-500">HSN: {row.hsn}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      visible: visibleColumns.type !== false,
      render: (row) => {
        const typeColors = {
          'Buy': 'bg-green-100 text-green-800',
          'Sell': 'bg-blue-100 text-blue-800',
          'Both': 'bg-purple-100 text-purple-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[row.type] || 'bg-gray-100 text-gray-800'}`}>
            {row.type}
          </span>
        );
      }
    },
    {
      key: 'storeWiseStock',
      label: 'Store wise Stock',
      sortable: true,
      visible: visibleColumns.storeWiseStock !== false,
      render: (row) => (
        <span className="text-blue-600">{row.storeWiseStock || 'N/A'}</span>
      )
    },
    {
      key: 'totalStocks',
      label: 'Total Stocks',
      sortable: true,
      visible: visibleColumns.totalStocks !== false,
      render: (row) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="inline-block px-2 py-1 rounded bg-green-50 text-green-700">
              In Stock: {row.inStock.toFixed(2)} {row.uom}
            </span>
          </div>
          <div className="text-xs">
            <span className="inline-block px-2 py-1 rounded bg-red-50 text-red-700">
              Reject: {row.rejectStock.toFixed(2)} {row.uom}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      visible: visibleColumns.category !== false,
      render: (row) => (
        <div>
          {row.category && (
            <div className="text-sm text-gray-900">Category: {row.category}</div>
          )}
          {row.subCategory && (
            <div className="text-xs text-gray-500">Sub Category: {row.subCategory}</div>
          )}
          {!row.category && <span className="text-gray-400">N/A</span>}
        </div>
      )
    }
  ];

  // Filter columns based on visibility
  const columns = allColumns.filter(col => col.visible !== false);


  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditItemModal(true);
  };

  const handleTransfer = (item) => {
    setSelectedItem(item);
    setShowStockTransferModal(true);
  };

  const handleHistory = (item) => {
    setSelectedItem(item);
    setShowItemHistoryModal(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      try {
        await inventoryService.deleteItem(item.id);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
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
        onClick={() => handleTransfer(row)}
        className="text-green-600 hover:text-green-900 p-1 transition-colors" 
        title="Transfer" 
        aria-label="Transfer"
      >
        <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <button 
        onClick={() => handleHistory(row)}
        className="text-gray-600 hover:text-gray-900 p-1 transition-colors" 
        title="History" 
        aria-label="History"
      >
        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
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
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button 
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Categories</span>
            <span className="sm:hidden">Cat</span>
          </button>
          <button 
            onClick={() => setShowUOMModal(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Manage UOM</span>
            <span className="sm:hidden">UOM</span>
          </button>
          <button 
            onClick={() => setShowStockUpdateModal(true)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Stock Update</span>
            <span className="sm:hidden">Stock</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowColumnPreferenceModal(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
            title="Column Preference"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
            title="Filter"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={items}
        searchPlaceholder="Search items..."
        renderRowActions={renderRowActions}
        loading={loading}
      />

      {/* Modals */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSubmit={async (data) => {
          try {
            const itemData = {
              item_id: data.itemId || `ITEM${Date.now()}`,
              item_name: data.itemName,
              item_type: data.itemType,
              category_id: data.category ? (isNaN(data.category) ? null : parseInt(data.category)) : null,
              sub_category_id: data.subCategory ? (isNaN(data.subCategory) ? null : parseInt(data.subCategory)) : null,
              micro_category_id: data.microCategory ? (isNaN(data.microCategory) ? null : parseInt(data.microCategory)) : null,
              uom_id: data.unitOfMetrics ? (isNaN(data.unitOfMetrics) ? null : parseInt(data.unitOfMetrics)) : null,
              store_id: data.store ? (isNaN(data.store) ? null : parseInt(data.store)) : null,
              hsn: data.hsn || null,
              price: data.price ? parseFloat(data.price) : null,
              tax_type: data.taxType || null,
              tax: data.tax ? parseFloat(data.tax) : null,
              current_stock: parseFloat(data.currentStock) || 0,
              min_stock: parseFloat(data.minStock) || 0,
              max_stock: parseFloat(data.maxStock) || 0,
              phase_in_insulation: data.phaseInInsulation || null,
              description: data.description || null
            };
            await inventoryService.createItem(itemData);
            setShowAddItemModal(false);
            fetchItems();
          } catch (error) {
            console.error('Error creating item:', error);
            alert('Failed to create item');
          }
        }}
      />

      <EditItemModal
        isOpen={showEditItemModal}
        onClose={() => {
          setShowEditItemModal(false);
          setSelectedItem(null);
        }}
        onSubmit={async (data) => {
          try {
            const itemData = {
              item_name: data.itemName,
              item_type: data.itemType,
              category_id: data.category ? (isNaN(data.category) ? null : parseInt(data.category)) : null,
              sub_category_id: data.subCategory ? (isNaN(data.subCategory) ? null : parseInt(data.subCategory)) : null,
              micro_category_id: data.microCategory ? (isNaN(data.microCategory) ? null : parseInt(data.microCategory)) : null,
              uom_id: data.unitOfMetrics ? (isNaN(data.unitOfMetrics) ? null : parseInt(data.unitOfMetrics)) : null,
              store_id: data.store ? (isNaN(data.store) ? null : parseInt(data.store)) : null,
              hsn: data.hsn || null,
              price: data.price ? parseFloat(data.price) : null,
              tax_type: data.taxType || null,
              tax: data.tax ? parseFloat(data.tax) : null,
              current_stock: parseFloat(data.currentStock) || 0,
              min_stock: parseFloat(data.minStock) || 0,
              max_stock: parseFloat(data.maxStock) || 0,
              phase_in_insulation: data.phaseInInsulation || null,
              description: data.description || null
            };
            await inventoryService.updateItem(data.id, itemData);
            setShowEditItemModal(false);
            fetchItems();
          } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item');
          }
        }}
        item={selectedItem}
      />

      <StockTransferModal
        isOpen={showStockTransferModal}
        onClose={() => {
          setShowStockTransferModal(false);
          setSelectedItem(null);
        }}
        onSubmit={async (transferData) => {
          try {
            await inventoryService.transferStock({
              item_id: parseInt(selectedItem.id),
              from_store_id: parseInt(transferData.fromStore),
              to_store_id: parseInt(transferData.toStore),
              quantity: parseFloat(transferData.quantity),
              comment: transferData.comment || null
            });
            setShowStockTransferModal(false);
            setSelectedItem(null);
            fetchItems();
          } catch (error) {
            console.error('Error transferring stock:', error);
            alert(error.message || 'Failed to transfer stock');
          }
        }}
        item={selectedItem}
      />

      <ItemHistoryModal
        isOpen={showItemHistoryModal}
        onClose={() => {
          setShowItemHistoryModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />

      <CategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
      />

      <UOMModal
        isOpen={showUOMModal}
        onClose={() => setShowUOMModal(false)}
      />

      <StockUpdateModal
        isOpen={showStockUpdateModal}
        onClose={() => setShowStockUpdateModal(false)}
        onSubmit={async (data) => {
          try {
            await inventoryService.batchUpdateStock(data);
            setShowStockUpdateModal(false);
            fetchItems();
          } catch (error) {
            console.error('Error updating stock:', error);
            alert(error.message || 'Failed to update stock');
          }
        }}
      />

      <ColumnPreferenceModal
        isOpen={showColumnPreferenceModal}
        onClose={() => setShowColumnPreferenceModal(false)}
        columns={allColumns}
        onSave={(columns) => {
          setVisibleColumns(columns);
        }}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(appliedFilters) => {
          setFilters(appliedFilters);
        }}
        filters={filters}
      />
    </div>
  );
};

export default ItemsManagement;

