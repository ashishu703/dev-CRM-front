import React, { useState } from 'react';
import { DollarSign, Plus, Edit, Trash2, FileText } from 'lucide-react';

const DesignAndCostPlanning = () => {
  const [plans, setPlans] = useState([
    { id: 1, projectName: 'Project Alpha', designCost: 50000, materialCost: 200000, laborCost: 150000, totalCost: 400000, status: 'Active' },
    { id: 2, projectName: 'Project Beta', designCost: 45000, materialCost: 180000, laborCost: 120000, totalCost: 345000, status: 'Active' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-orange-600" />
            Design & Cost Planning
          </h1>
          <p className="text-gray-600 mt-1">Manage design specifications and cost estimates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add New Plan
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Design Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{plan.projectName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{plan.designCost.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{plan.materialCost.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{plan.laborCost.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{plan.totalCost.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {plan.status}
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

export default DesignAndCostPlanning;

