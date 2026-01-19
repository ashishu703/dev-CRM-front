import React, { useState, useEffect } from 'react';
import { Factory, Activity, Settings, Play, Pause, Square, Plus } from 'lucide-react';

const ProductionExecution = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState(activeView || 'execution-console');

  const tabs = [
    { id: 'execution-console', label: 'Daily Machine Report', icon: <Activity className="w-4 h-4" /> },
    { id: 'machine-status', label: 'Machine Status', icon: <Settings className="w-4 h-4" /> }
  ];


  useEffect(() => {
    if (activeView && tabs.some(t => t.id === activeView)) {
      setSelectedTab(activeView);
    }
  }, [activeView]);

  const renderExecutionConsole = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Daily Machine Report</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Shift Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: 'Total Runtime', value: '19.5 h' }, { label: 'Total Downtime', value: '2.1 h' }, { label: 'Total Output', value: '3,450 pcs' }, { label: 'Scrap', value: '1.8 %' }].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Machine Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Runtime (h)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downtime (h)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output (pcs)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scrap %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OEE %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Assembly Machine 1', shift: 'Day', runtime: 7.5, downtime: 0.5, output: 980, scrap: 1.2, oee: 86, operator: 'Ravi K.', notes: 'Normal operation' },
                { name: 'Packaging Machine 2', shift: 'Day', runtime: 6.0, downtime: 1.2, output: 820, scrap: 2.5, oee: 78, operator: 'Priya S.', notes: 'Intermittent jams' },
                { name: 'Finishing Machine 1', shift: 'Night', runtime: 6.0, downtime: 0.4, output: 920, scrap: 1.6, oee: 84, operator: 'Amit K.', notes: 'All good' }
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.shift}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.runtime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.downtime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.output}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.scrap}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.oee}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.operator}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMachineStatus = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Machine Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Assembly Machine 1', status: 'Running', efficiency: 89, nextMaintenance: '2 days' },
          { name: 'Packaging Machine 1', status: 'Running', efficiency: 92, nextMaintenance: '5 days' },
          { name: 'Quality Check Machine', status: 'Stopped', efficiency: 0, nextMaintenance: '1 day' },
          { name: 'Finishing Machine 1', status: 'Running', efficiency: 85, nextMaintenance: '3 days' }
        ].map((machine, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900">{machine.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                machine.status === 'Running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {machine.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efficiency:</span>
                <span className="font-medium">{machine.efficiency}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Maintenance:</span>
                <span className="font-medium">{machine.nextMaintenance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Factory className="w-7 h-7 text-orange-600" />
          Production Execution
        </h1>
        <p className="text-gray-600 mt-1">Monitor and control production operations in real-time</p>
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

      {selectedTab === 'execution-console' && renderExecutionConsole()}
      {selectedTab === 'machine-status' && renderMachineStatus()}
    </div>
  );
};

export default ProductionExecution;
