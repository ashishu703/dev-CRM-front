import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const RawMaterialPlan = () => {
  const [materials, setMaterials] = useState([
    { id: 1, materialName: 'Steel Sheet', requiredQty: 100, availableQty: 80, unit: 'Kg', status: 'Shortage', priority: 'High' },
    { id: 2, materialName: 'Copper Wire', requiredQty: 50, availableQty: 60, unit: 'Meter', status: 'Available', priority: 'Medium' },
    { id: 3, materialName: 'Aluminum Rod', requiredQty: 200, availableQty: 250, unit: 'Kg', status: 'Available', priority: 'Low' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-orange-600" />
            Raw Material Plan
          </h1>
          <p className="text-gray-600 mt-1">Manage raw material requirements and availability</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.materialName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.requiredQty}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.availableQty}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {material.status === 'Available' ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      {material.status}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      {material.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    material.priority === 'High' ? 'bg-red-100 text-red-800' :
                    material.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {material.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default RawMaterialPlan;

