import React, { useState } from 'react';
import { Wrench, FileText, Clock, Settings, Plus, AlertTriangle } from 'lucide-react';

const Maintenance = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState(activeView || 'maintenance-orders');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    equipment: '',
    type: 'Repair',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });

  const tabs = [
    { id: 'maintenance-orders', label: 'Maintenance Orders', icon: <FileText className="w-4 h-4" /> },
    { id: 'preventive-maintenance', label: 'Preventive Maintenance', icon: <Clock className="w-4 h-4" /> },
    { id: 'equipment-status', label: 'Equipment Status', icon: <Settings className="w-4 h-4" /> }
  ];

  const maintenanceOrders = [
    { id: 1, orderId: 'MO-2024-001', equipment: 'Assembly Machine 1', type: 'Repair', priority: 'High', status: 'Open', assignedTo: 'Tech Team A', dueDate: '2024-01-20' },
    { id: 2, orderId: 'MO-2024-002', equipment: 'Packaging Machine 2', type: 'Preventive', priority: 'Medium', status: 'In Progress', assignedTo: 'Tech Team B', dueDate: '2024-01-22' }
  ];

  const preventivePlans = [
    { id: 1, planId: 'PM-2024-001', equipment: 'Assembly Machine 1', frequency: 'Monthly', nextDue: '2024-02-15', lastDone: '2024-01-15', responsible: 'Tech Team A', risk: 'Medium' },
    { id: 2, planId: 'PM-2024-002', equipment: 'Conveyor Line 3', frequency: 'Weekly', nextDue: '2024-01-25', lastDone: '2024-01-18', responsible: 'Tech Team C', risk: 'Low' }
  ];

  const equipmentStatuses = [
    { id: 1, equipment: 'Assembly Machine 1', status: 'Running', utilization: 92, downtimeHrs: 1.5, lastMaintenance: '2024-01-15' },
    { id: 2, equipment: 'Packaging Machine 2', status: 'Maintenance', utilization: 40, downtimeHrs: 6.0, lastMaintenance: '2024-01-18' },
    { id: 3, equipment: 'Conveyor Line 3', status: 'Idle', utilization: 15, downtimeHrs: 0.5, lastMaintenance: '2024-01-10' }
  ];

  const renderMaintenanceOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance Orders</h2>
        <button onClick={() => setShowCreateOrder(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {maintenanceOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.equipment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assignedTo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPreventiveMaintenance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Preventive Maintenance</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Done</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {preventivePlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.planId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.equipment}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.frequency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.lastDone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.nextDue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.responsible}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.risk === 'High'
                      ? 'bg-red-100 text-red-800'
                      : plan.risk === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {plan.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEquipmentStatus = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Equipment Status</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Running</p>
          <p className="text-2xl font-semibold text-gray-900">{
            equipmentStatuses.filter(e => e.status === 'Running').length
          }</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-2xl font-semibold text-gray-900">{
            equipmentStatuses.filter(e => e.status === 'Maintenance').length
          }</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Idle</p>
          <p className="text-2xl font-semibold text-gray-900">{
            equipmentStatuses.filter(e => e.status === 'Idle').length
          }</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downtime (hrs)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Maintenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {equipmentStatuses.map((eq) => (
              <tr key={eq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{eq.equipment}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    eq.status === 'Running'
                      ? 'bg-green-100 text-green-800'
                      : eq.status === 'Maintenance'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {eq.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{eq.utilization}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{eq.downtimeHrs}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{eq.lastMaintenance}</td>
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
          <Wrench className="w-7 h-7 text-orange-600" />
          Maintenance
        </h1>
        <p className="text-gray-600 mt-1">Manage equipment maintenance and repairs</p>
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

      {selectedTab === 'maintenance-orders' && renderMaintenanceOrders()}
      {selectedTab === 'preventive-maintenance' && renderPreventiveMaintenance()}
      {selectedTab === 'equipment-status' && renderEquipmentStatus()}
      {showCreateOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                Create Maintenance Order
              </h3>
              <button onClick={() => setShowCreateOrder(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Placeholder submit. Wire to API later.
                setShowCreateOrder(false);
                setNewOrder({ equipment: '', type: 'Repair', priority: 'Medium', assignedTo: '', dueDate: '' });
              }}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                <input
                  type="text"
                  value={newOrder.equipment}
                  onChange={(e) => setNewOrder({ ...newOrder, equipment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Assembly Machine 1"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newOrder.type}
                    onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Repair</option>
                    <option>Preventive</option>
                    <option>Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={newOrder.assignedTo}
                    onChange={(e) => setNewOrder({ ...newOrder, assignedTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Tech Team A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateOrder(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
