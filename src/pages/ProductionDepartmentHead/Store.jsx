import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Warehouse, Box, AlertTriangle, CheckCircle } from 'lucide-react';

const Store = () => {
  const [selectedTab, setSelectedTab] = useState('items');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newItem, setNewItem] = useState({
    itemCode: '',
    itemName: '',
    category: '',
    unit: '',
    minLevel: '',
    maxLevel: '',
    location: '',
    description: ''
  });
  const [newLocation, setNewLocation] = useState({
    locationCode: '',
    locationName: '',
    address: '',
    type: 'Warehouse'
  });

  const tabs = [
    { id: 'items', label: 'Items', icon: <Package className="w-4 h-4" /> },
    { id: 'locations', label: 'Locations', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'stock-levels', label: 'Stock Levels', icon: <Box className="w-4 h-4" /> }
  ];

  const items = [
    { id: 1, itemCode: 'ITM-001', itemName: 'Copper Wire', category: 'Raw Material', unit: 'meters', minLevel: 200, maxLevel: 2000, location: 'Warehouse A', currentStock: 1500, status: 'Good' },
    { id: 2, itemCode: 'ITM-002', itemName: 'Insulation Material', category: 'Raw Material', unit: 'kg', minLevel: 100, maxLevel: 1000, location: 'Warehouse B', currentStock: 800, status: 'Good' },
    { id: 3, itemCode: 'ITM-003', itemName: 'Connectors', category: 'Component', unit: 'pieces', minLevel: 100, maxLevel: 500, location: 'Warehouse A', currentStock: 50, status: 'Low' },
    { id: 4, itemCode: 'ITM-004', itemName: 'Cable Assembly A', category: 'Finished Goods', unit: 'units', minLevel: 100, maxLevel: 500, location: 'Warehouse C', currentStock: 450, status: 'Good' },
    { id: 5, itemCode: 'ITM-005', itemName: 'PVC Sheathing', category: 'Raw Material', unit: 'kg', minLevel: 150, maxLevel: 800, location: 'Warehouse B', currentStock: 90, status: 'Low' }
  ];

  const locations = [
    { id: 1, locationCode: 'WH-A', locationName: 'Warehouse A', type: 'Warehouse', address: 'Building 1, Floor 2', capacity: '5000 sq ft', status: 'Active' },
    { id: 2, locationCode: 'WH-B', locationName: 'Warehouse B', type: 'Warehouse', address: 'Building 2, Floor 1', capacity: '3000 sq ft', status: 'Active' },
    { id: 3, locationCode: 'WH-C', locationName: 'Warehouse C', type: 'Warehouse', address: 'Building 3, Ground Floor', capacity: '4000 sq ft', status: 'Active' },
    { id: 4, locationCode: 'ST-01', locationName: 'Store Room 1', type: 'Store', address: 'Building 1, Basement', capacity: '1000 sq ft', status: 'Active' }
  ];

  const stockLevels = [
    { itemCode: 'ITM-001', itemName: 'Copper Wire', location: 'Warehouse A', currentStock: 1500, minLevel: 200, maxLevel: 2000, status: 'Good', lastUpdated: '2024-01-20' },
    { itemCode: 'ITM-002', itemName: 'Insulation Material', location: 'Warehouse B', currentStock: 800, minLevel: 100, maxLevel: 1000, status: 'Good', lastUpdated: '2024-01-19' },
    { itemCode: 'ITM-003', itemName: 'Connectors', location: 'Warehouse A', currentStock: 50, minLevel: 100, maxLevel: 500, status: 'Low', lastUpdated: '2024-01-18' },
    { itemCode: 'ITM-004', itemName: 'Cable Assembly A', location: 'Warehouse C', currentStock: 450, minLevel: 100, maxLevel: 500, status: 'Good', lastUpdated: '2024-01-20' },
    { itemCode: 'ITM-005', itemName: 'PVC Sheathing', location: 'Warehouse B', currentStock: 90, minLevel: 150, maxLevel: 800, status: 'Low', lastUpdated: '2024-01-19' }
  ];

  const renderItems = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Store Items</h2>
        <button
          onClick={() => setShowItemModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.minLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.maxLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
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

  const renderLocations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Store Locations</h2>
        <button
          onClick={() => setShowLocationModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{location.locationName}</h3>
                <p className="text-sm text-gray-600">{location.locationCode}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                location.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {location.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Warehouse className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">{location.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium text-gray-900">{location.capacity}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                <p className="font-medium">Address:</p>
                <p>{location.address}</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button className="text-orange-600 hover:text-orange-900">
                <Edit className="w-4 h-4" />
              </button>
              <button className="text-red-600 hover:text-red-900">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStockLevels = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Stock Levels</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockLevels.map((stock, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.itemCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.minLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.maxLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      stock.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {stock.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handleCreateItem = (e) => {
    e.preventDefault();
    // Handle item creation logic here
    setShowItemModal(false);
    setNewItem({
      itemCode: '',
      itemName: '',
      category: '',
      unit: '',
      minLevel: '',
      maxLevel: '',
      location: '',
      description: ''
    });
  };

  const handleCreateLocation = (e) => {
    e.preventDefault();
    // Handle location creation logic here
    setShowLocationModal(false);
    setNewLocation({
      locationCode: '',
      locationName: '',
      address: '',
      type: 'Warehouse'
    });
  };

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
      {selectedTab === 'items' && renderItems()}
      {selectedTab === 'locations' && renderLocations()}
      {selectedTab === 'stock-levels' && renderStockLevels()}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Item</h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleCreateItem} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                  <input
                    type="text"
                    required
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., ITM-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={newItem.itemName}
                    onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter item name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Component">Component</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Spare Parts">Spare Parts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., meters, kg, pieces"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
                  <input
                    type="number"
                    required
                    value={newItem.minLevel}
                    onChange={(e) => setNewItem({ ...newItem, minLevel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Level</label>
                  <input
                    type="number"
                    required
                    value={newItem.maxLevel}
                    onChange={(e) => setNewItem({ ...newItem, maxLevel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Max"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    required
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.locationName}>{loc.locationName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Item description..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleCreateLocation} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Code</label>
                  <input
                    type="text"
                    required
                    value={newLocation.locationCode}
                    onChange={(e) => setNewLocation({ ...newLocation, locationCode: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., WH-A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                  <input
                    type="text"
                    required
                    value={newLocation.locationName}
                    onChange={(e) => setNewLocation({ ...newLocation, locationName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Warehouse A"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  required
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Warehouse">Warehouse</option>
                  <option value="Store">Store</option>
                  <option value="Stock Room">Stock Room</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  required
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="2"
                  placeholder="Enter location address"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;

