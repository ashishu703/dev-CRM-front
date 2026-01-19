import React, { useState } from 'react';
import { Factory, Plus, Edit, Trash2, Calendar } from 'lucide-react';

const MachineScheduling = () => {
  const [schedules, setSchedules] = useState([
    { id: 1, machineName: 'Machine A', projectName: 'Project Alpha', startDate: '2024-01-20', endDate: '2024-01-25', shift: 'Day', utilization: '85%', status: 'Scheduled' },
    { id: 2, machineName: 'Machine B', projectName: 'Project Beta', startDate: '2024-01-21', endDate: '2024-01-26', shift: 'Night', utilization: '90%', status: 'Scheduled' },
    { id: 3, machineName: 'Machine C', projectName: 'Project Gamma', startDate: '2024-01-22', endDate: '2024-01-27', shift: 'Day', utilization: '75%', status: 'In Progress' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-7 h-7 text-orange-600" />
            Machine Scheduling
          </h1>
          <p className="text-gray-600 mt-1">Schedule machines for production activities</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.machineName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.projectName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {schedule.startDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {schedule.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.shift}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.utilization}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    schedule.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {schedule.status}
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

export default MachineScheduling;

