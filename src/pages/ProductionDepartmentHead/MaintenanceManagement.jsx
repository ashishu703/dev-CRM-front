import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Settings, Plus, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const MaintenanceManagement = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState('electrical');
  const [selectedSubTab, setSelectedSubTab] = useState('preventive');

  const tabs = [
    { id: 'electrical', label: 'Electrical', icon: <Zap className="w-4 h-4" /> },
    { id: 'mechanical', label: 'Mechanical', icon: <Settings className="w-4 h-4" /> }
  ];

  const subTabs = [
    { id: 'preventive', label: 'Preventive', icon: <Clock className="w-4 h-4" /> },
    { id: 'corrective', label: 'Corrective', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'predictive', label: 'Predictive', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeView && tabs.some(t => t.id === activeView)) {
      setSelectedTab(activeView);
    }
  }, [activeView]);

  const electricalPreventive = [
    { id: 1, orderId: 'EL-PM-001', equipment: 'Motor Control Panel A', frequency: 'Monthly', nextDue: '2024-02-15', lastDone: '2024-01-15', responsible: 'Electrical Team A', status: 'Scheduled' },
    { id: 2, orderId: 'EL-PM-002', equipment: 'Transformer Unit 1', frequency: 'Quarterly', nextDue: '2024-04-01', lastDone: '2024-01-01', responsible: 'Electrical Team B', status: 'Scheduled' }
  ];

  const electricalCorrective = [
    { id: 1, orderId: 'EL-CM-001', equipment: 'Motor Control Panel A', issue: 'Overheating detected', priority: 'High', status: 'Open', assignedTo: 'Electrical Team A', reportedDate: '2024-01-20' },
    { id: 2, orderId: 'EL-CM-002', equipment: 'Distribution Board 2', issue: 'Circuit breaker tripping', priority: 'Medium', status: 'In Progress', assignedTo: 'Electrical Team B', reportedDate: '2024-01-19' }
  ];

  const electricalPredictive = [
    { id: 1, equipment: 'Motor Control Panel A', parameter: 'Temperature', currentValue: 75, threshold: 80, trend: 'Increasing', risk: 'Medium', nextCheck: '2024-01-25' },
    { id: 2, equipment: 'Transformer Unit 1', parameter: 'Vibration', currentValue: 4.2, threshold: 5.0, trend: 'Stable', risk: 'Low', nextCheck: '2024-01-28' }
  ];

  const mechanicalPreventive = [
    { id: 1, orderId: 'MECH-PM-001', equipment: 'Assembly Machine 1', frequency: 'Monthly', nextDue: '2024-02-10', lastDone: '2024-01-10', responsible: 'Mechanical Team A', status: 'Scheduled' },
    { id: 2, orderId: 'MECH-PM-002', equipment: 'Conveyor Belt System', frequency: 'Weekly', nextDue: '2024-01-25', lastDone: '2024-01-18', responsible: 'Mechanical Team B', status: 'Scheduled' }
  ];

  const mechanicalCorrective = [
    { id: 1, orderId: 'MECH-CM-001', equipment: 'Assembly Machine 1', issue: 'Bearing noise', priority: 'High', status: 'Open', assignedTo: 'Mechanical Team A', reportedDate: '2024-01-20' },
    { id: 2, orderId: 'MECH-CM-002', equipment: 'Packaging Machine 2', issue: 'Hydraulic leak', priority: 'Medium', status: 'In Progress', assignedTo: 'Mechanical Team B', reportedDate: '2024-01-19' }
  ];

  const mechanicalPredictive = [
    { id: 1, equipment: 'Assembly Machine 1', parameter: 'Vibration', currentValue: 6.5, threshold: 8.0, trend: 'Increasing', risk: 'Medium', nextCheck: '2024-01-24' },
    { id: 2, equipment: 'Packaging Machine 2', parameter: 'Oil Analysis', currentValue: 'Normal', threshold: 'Alert', trend: 'Stable', risk: 'Low', nextCheck: '2024-01-30' }
  ];

  const renderPreventive = (data) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Preventive Maintenance</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Done</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.equipment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lastDone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nextDue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.responsible}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status}
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

  const renderCorrective = (data) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Corrective Maintenance</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.equipment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.issue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.priority === 'High' ? 'bg-red-100 text-red-800' : 
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'Open' ? 'bg-red-100 text-red-800' : 
                      item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reportedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPredictive = (data) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Predictive Maintenance</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Monitoring
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.equipment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.parameter}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentValue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.threshold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.trend}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.risk === 'High' ? 'bg-red-100 text-red-800' : 
                      item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nextCheck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const getCurrentData = () => {
    if (selectedTab === 'electrical') {
      if (selectedSubTab === 'preventive') return electricalPreventive;
      if (selectedSubTab === 'corrective') return electricalCorrective;
      if (selectedSubTab === 'predictive') return electricalPredictive;
    } else {
      if (selectedSubTab === 'preventive') return mechanicalPreventive;
      if (selectedSubTab === 'corrective') return mechanicalCorrective;
      if (selectedSubTab === 'predictive') return mechanicalPredictive;
    }
    return [];
  };

  return (
    <div className="p-6">
      {/* Main Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTab(tab.id);
                setSelectedSubTab('preventive');
              }}
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

      {/* Sub Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {subTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setSelectedSubTab(subTab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                selectedSubTab === subTab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subTab.icon}
              {subTab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {selectedSubTab === 'preventive' && renderPreventive(getCurrentData())}
      {selectedSubTab === 'corrective' && renderCorrective(getCurrentData())}
      {selectedSubTab === 'predictive' && renderPredictive(getCurrentData())}
    </div>
  );
};

export default MaintenanceManagement;
