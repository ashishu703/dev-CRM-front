import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, UserCheck } from 'lucide-react';

const ManPowerAllotment = () => {
  const [allotments, setAllotments] = useState([
    { id: 1, employeeName: 'John Doe', projectName: 'Project Alpha', role: 'Supervisor', startDate: '2024-01-20', endDate: '2024-01-25', status: 'Active' },
    { id: 2, employeeName: 'Jane Smith', projectName: 'Project Beta', role: 'Operator', startDate: '2024-01-21', endDate: '2024-01-26', status: 'Active' },
    { id: 3, employeeName: 'Mike Johnson', projectName: 'Project Gamma', role: 'Technician', startDate: '2024-01-22', endDate: '2024-01-27', status: 'Pending' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-orange-600" />
            Manpower Allotment
          </h1>
          <p className="text-gray-600 mt-1">Assign employees to projects and tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-4 h-4" />
          Assign Employee
        </button>
      </div>

      {/* Allotment Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allotments.map((allotment) => (
              <tr key={allotment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{allotment.employeeName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allotment.projectName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {allotment.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allotment.startDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allotment.endDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    allotment.status === 'Active' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {allotment.status}
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

export default ManPowerAllotment;

