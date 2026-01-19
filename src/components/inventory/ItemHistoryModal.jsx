import React from 'react';
import { X, Package, ArrowLeftRight, Plus, Minus, Calendar } from 'lucide-react';
import RightSidebar from './RightSidebar';

const ItemHistoryModal = ({ isOpen, onClose, item }) => {
  // Mock history data - in real app, this would come from API
  const [history] = React.useState([
    {
      id: 1,
      type: 'transfer',
      action: 'Stock Transferred',
      from: 'UNIT 1',
      to: 'UNIT 2',
      quantity: 50,
      date: '2025-01-15 10:30 AM',
      user: 'Admin User'
    },
    {
      id: 2,
      type: 'add',
      action: 'Stock Added',
      quantity: 100,
      date: '2025-01-14 02:15 PM',
      user: 'Admin User'
    },
    {
      id: 3,
      type: 'reduce',
      action: 'Stock Reduced',
      quantity: 25,
      date: '2025-01-13 09:45 AM',
      user: 'Admin User'
    },
    {
      id: 4,
      type: 'created',
      action: 'Item Created',
      date: '2025-01-10 11:00 AM',
      user: 'Admin User'
    }
  ]);

  if (!item) return null;

  const getHistoryIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
      case 'add':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'reduce':
        return <Minus className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHistoryColor = (type) => {
    switch (type) {
      case 'transfer':
        return 'bg-blue-50 border-blue-200';
      case 'add':
        return 'bg-green-50 border-green-200';
      case 'reduce':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Item History"
    >
      <div className="space-y-4">
        {/* Item Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{item.itemName}</div>
              <div className="text-sm text-gray-500">Item ID: {item.itemId}</div>
              <div className="text-sm text-gray-500">Current Stock: {item.inStock.toFixed(2)} {item.uom}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Activity Timeline</h3>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className={`border-l-4 pl-4 py-3 ${getHistoryColor(entry.type)} rounded-r-lg`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getHistoryIcon(entry.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-gray-900">
                        {entry.action}
                        {entry.quantity && (
                          <span className="ml-2 text-gray-600">
                            ({entry.quantity} {item.uom})
                          </span>
                        )}
                        {entry.from && entry.to && (
                          <span className="ml-2 text-gray-600">
                            from {entry.from} to {entry.to}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{entry.date}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{entry.user}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RightSidebar>
  );
};

export default ItemHistoryModal;

