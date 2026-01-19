import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

const InventoryManagement = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState('raw-materials');

  const tabs = [
    { id: 'raw-materials', label: 'Raw Materials', icon: <Package className="w-4 h-4" /> },
    { id: 'finished-goods', label: 'Finished Goods', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'stock-alerts', label: 'Stock Alerts', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeView && tabs.some(t => t.id === activeView)) {
      setSelectedTab(activeView);
    }
  }, [activeView]);

  const rawMaterials = [
    { id: 1, item: 'Copper Wire', currentStock: 1500, minLevel: 200, maxLevel: 2000, unit: 'meters', status: 'Good' },
    { id: 2, item: 'Insulation Material', currentStock: 800, minLevel: 100, maxLevel: 1000, unit: 'kg', status: 'Good' },
    { id: 3, item: 'Connectors', currentStock: 50, minLevel: 100, maxLevel: 500, unit: 'pieces', status: 'Low' },
    { id: 4, item: 'Aluminium Conductor', currentStock: 1200, minLevel: 300, maxLevel: 1500, unit: 'meters', status: 'Good' },
    { id: 5, item: 'PVC Sheathing', currentStock: 90, minLevel: 150, maxLevel: 800, unit: 'kg', status: 'Low' }
  ];

  const finishedGoods = [
    { id: 1, product: 'Cable Assembly A', currentStock: 450, minLevel: 100, maxLevel: 500, unit: 'units', status: 'Good' },
    { id: 2, product: 'Cable Assembly B', currentStock: 320, minLevel: 150, maxLevel: 400, unit: 'units', status: 'Good' },
    { id: 3, product: 'Power Cable X1', currentStock: 85, minLevel: 100, maxLevel: 300, unit: 'units', status: 'Low' },
    { id: 4, product: 'Data Cable Y2', currentStock: 200, minLevel: 50, maxLevel: 250, unit: 'units', status: 'Good' }
  ];

  const stockAlerts = [
    { id: 1, item: 'Connectors', currentStock: 50, minLevel: 100, type: 'Low Stock', priority: 'High', unit: 'pieces' },
    { id: 2, item: 'PVC Sheathing', currentStock: 90, minLevel: 150, type: 'Low Stock', priority: 'High', unit: 'kg' },
    { id: 3, item: 'Power Cable X1', currentStock: 85, minLevel: 100, type: 'Low Stock', priority: 'Medium', unit: 'units' },
    { id: 4, item: 'Steel Braid', currentStock: 25, minLevel: 50, type: 'Critical', priority: 'High', unit: 'meters' }
  ];

  const renderRawMaterials = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Raw Materials Inventory</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rawMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.minLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.maxLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      material.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {material.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinishedGoods = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Finished Goods Inventory</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {finishedGoods.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.minLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.maxLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStockAlerts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alert.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.minLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.type === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                selectedTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {selectedTab === 'raw-materials' && renderRawMaterials()}
      {selectedTab === 'finished-goods' && renderFinishedGoods()}
      {selectedTab === 'stock-alerts' && renderStockAlerts()}
    </div>
  );
};

export default InventoryManagement;

