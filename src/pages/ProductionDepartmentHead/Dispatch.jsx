import React, { useState } from 'react';
import { Package, ArrowRight, ArrowLeft, Plus, Search, Edit, Trash2 } from 'lucide-react';

const Dispatch = () => {
  const [selectedTab, setSelectedTab] = useState('stock-in');
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('in');
  const [newTransaction, setNewTransaction] = useState({
    material: '',
    quantity: '',
    unit: '',
    location: '',
    remarks: '',
    issuedTo: ''
  });

  const tabs = [
    { id: 'stock-in', label: 'Stock In', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'stock-out', label: 'Stock Out', icon: <ArrowLeft className="w-4 h-4" /> },
    { id: 'stock-list', label: 'Stock List', icon: <Package className="w-4 h-4" /> }
  ];

  const stockList = [
    { id: 1, material: 'Copper Wire', currentStock: 1500, unit: 'meters', location: 'Warehouse A', minLevel: 200, maxLevel: 2000, status: 'Good' },
    { id: 2, material: 'Insulation Material', currentStock: 800, unit: 'kg', location: 'Warehouse B', minLevel: 100, maxLevel: 1000, status: 'Good' },
    { id: 3, material: 'Connectors', currentStock: 50, unit: 'pieces', location: 'Warehouse A', minLevel: 100, maxLevel: 500, status: 'Low' },
    { id: 4, material: 'Aluminium Conductor', currentStock: 1200, unit: 'meters', location: 'Warehouse C', minLevel: 300, maxLevel: 1500, status: 'Good' },
    { id: 5, material: 'PVC Sheathing', currentStock: 90, unit: 'kg', location: 'Warehouse B', minLevel: 150, maxLevel: 800, status: 'Low' }
  ];

  const stockInHistory = [
    { id: 1, date: '2024-01-20', material: 'Copper Wire', quantity: 500, unit: 'meters', location: 'Warehouse A', receivedBy: 'John Doe', remarks: 'New shipment' },
    { id: 2, date: '2024-01-19', material: 'Insulation Material', quantity: 200, unit: 'kg', location: 'Warehouse B', receivedBy: 'Jane Smith', remarks: 'Restock' },
    { id: 3, date: '2024-01-18', material: 'Connectors', quantity: 100, unit: 'pieces', location: 'Warehouse A', receivedBy: 'Mike Johnson', remarks: 'Bulk order' }
  ];

  const stockOutHistory = [
    { id: 1, date: '2024-01-20', material: 'Copper Wire', quantity: 200, unit: 'meters', location: 'Warehouse A', issuedBy: 'John Doe', issuedTo: 'Production Line 1', remarks: 'For production' },
    { id: 2, date: '2024-01-19', material: 'Insulation Material', quantity: 50, unit: 'kg', location: 'Warehouse B', issuedBy: 'Jane Smith', issuedTo: 'Production Line 2', remarks: 'Regular issue' },
    { id: 3, date: '2024-01-18', material: 'Aluminium Conductor', quantity: 300, unit: 'meters', location: 'Warehouse C', issuedBy: 'Mike Johnson', issuedTo: 'Production Line 1', remarks: 'Urgent requirement' }
  ];

  const handleTransaction = (e) => {
    e.preventDefault();
    // Handle transaction logic here
    setShowModal(false);
    setNewTransaction({
      material: '',
      quantity: '',
      unit: '',
      location: '',
      remarks: '',
      issuedTo: ''
    });
  };

  const renderStockIn = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Stock In</h2>
        <button
          onClick={() => {
            setTransactionType('in');
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Stock In
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockInHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.material}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.receivedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.remarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
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
    </div>
  );

  const renderStockOut = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Stock Out</h2>
        <button
          onClick={() => {
            setTransactionType('out');
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Stock Out
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockOutHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.material}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.issuedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.issuedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.remarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
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
    </div>
  );

  const renderStockList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Stock List</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search materials..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.material}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.minLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.maxLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
      {selectedTab === 'stock-in' && renderStockIn()}
      {selectedTab === 'stock-out' && renderStockOut()}
      {selectedTab === 'stock-list' && renderStockList()}

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {transactionType === 'in' ? 'Stock In' : 'Stock Out'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleTransaction} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <select
                  required
                  value={newTransaction.material}
                  onChange={(e) => setNewTransaction({ ...newTransaction, material: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Material</option>
                  {stockList.map(item => (
                    <option key={item.id} value={item.material}>{item.material}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newTransaction.unit}
                    onChange={(e) => setNewTransaction({ ...newTransaction, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., meters, kg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  required
                  value={newTransaction.location}
                  onChange={(e) => setNewTransaction({ ...newTransaction, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Location</option>
                  <option value="Warehouse A">Warehouse A</option>
                  <option value="Warehouse B">Warehouse B</option>
                  <option value="Warehouse C">Warehouse C</option>
                </select>
              </div>
              {transactionType === 'out' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                  <input
                    type="text"
                    required
                    value={newTransaction.issuedTo || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, issuedTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Production Line 1"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={newTransaction.remarks}
                  onChange={(e) => setNewTransaction({ ...newTransaction, remarks: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  {transactionType === 'in' ? 'Record Stock In' : 'Record Stock Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;

