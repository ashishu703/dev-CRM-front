import React, { useState, useEffect } from 'react';
import { Download, QrCode as QrCodeIcon } from 'lucide-react';
import DataTable from './DataTable';
import inventoryService from '../../services/inventoryService';
import BarcodeModal from './BarcodeModal';

const BatchCodeManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 1000
      };
      const response = await inventoryService.getItems(params);
      if (response.success) {
        const formattedItems = response.data.data.map(item => ({
          id: item.id,
          barcode: item.item_id || `BC-${item.id}`,
          itemId: item.item_id,
          itemName: item.item_name,
          itemInQuantity: parseFloat(item.current_stock) || 0,
          itemOutQuantity: 0,
          consumedQuantity: 0,
          store: item.store_name || 'N/A',
          balanceQuantity: parseFloat(item.current_stock) || 0,
          uom: item.uom_code || item.uom_name || 'N/A',
          hsn: item.hsn || 'N/A',
          quantity: parseFloat(item.current_stock) || 0,
          noOfPacking: 1
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBarcode = (item) => {
    setSelectedItem(item);
    setShowBarcodeModal(true);
  };

  const columns = [
    {
      key: 'barcode',
      label: 'Barcode/Batchcode Number',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <QrCodeIcon className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">{row.barcode}</span>
          <button
            onClick={() => handleDownloadBarcode(row)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Download QR Code"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      key: 'itemId',
      label: 'Item Id',
      sortable: true
    },
    {
      key: 'itemName',
      label: 'Item Name',
      sortable: true
    },
    {
      key: 'itemInQuantity',
      label: 'Item In Quantity',
      sortable: true,
      render: (row) => `${row.itemInQuantity} ${row.uom}`
    },
    {
      key: 'itemOutQuantity',
      label: 'Item Out Quantity',
      sortable: true,
      render: (row) => `${row.itemOutQuantity} ${row.uom}`
    },
    {
      key: 'consumedQuantity',
      label: 'Consumed Quantity',
      sortable: true,
      render: (row) => `${row.consumedQuantity} ${row.uom}`
    },
    {
      key: 'store',
      label: 'Store',
      sortable: true
    },
    {
      key: 'balanceQuantity',
      label: 'Balance Quantity',
      sortable: true,
      render: (row) => `${row.balanceQuantity} ${row.uom}`
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Data Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500">Loading items...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search batch codes..."
          emptyMessage="No data"
        />
      )}

      {/* Barcode Modal */}
      <BarcodeModal
        isOpen={showBarcodeModal}
        onClose={() => {
          setShowBarcodeModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
};

export default BatchCodeManagement;

