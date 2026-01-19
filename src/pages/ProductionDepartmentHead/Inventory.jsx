import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

const Inventory = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState(activeView || 'raw-materials');

  const tabs = [
    { id: 'raw-materials', label: 'Raw Materials', icon: <Package className="w-4 h-4" /> },
    { id: 'finished-goods', label: 'Finished Goods', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'stock-alerts', label: 'Stock Alerts', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  const rawMaterials = [
    { id: 1, item: 'Copper Wire', currentStock: 1500, minLevel: 200, maxLevel: 2000, unit: 'meters', status: 'Good' },
    { id: 2, item: 'Insulation Material', currentStock: 800, minLevel: 100, maxLevel: 1000, unit: 'kg', status: 'Good' },
    { id: 3, item: 'Connectors', currentStock: 50, minLevel: 100, maxLevel: 500, unit: 'pieces', status: 'Low' }
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
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-7 h-7 text-orange-600" />
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-1">Manage raw materials, finished goods, and stock levels</p>
      </div>

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

      {selectedTab === 'raw-materials' && renderRawMaterials()}
    </div>
  );
};

export default Inventory;
