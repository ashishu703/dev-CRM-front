import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FileText, 
  Target, 
  Plus, 
  Filter, 
  Search,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import salesOrderService from '../../services/SalesOrderService';

const PPC = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState('production-schedule');
  const [showAddModal, setShowAddModal] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const tabs = [
    { id: 'production-schedule', label: 'Sales Orders', icon: <FileText className="w-4 h-4" /> },
    { id: 'design-cost', label: 'Design & Cost', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'raw-material-planning', label: 'Raw Material Planning', icon: <Package className="w-4 h-4" /> },
    { id: 'work-orders', label: 'Work Orders', icon: <FileText className="w-4 h-4" /> },
    { id: 'capacity-planning', label: 'Shop Floor', icon: <Target className="w-4 h-4" /> },
    { id: 'backload-planning', label: 'Backload Planning', icon: <Clock className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeView && tabs.some(t => t.id === activeView)) {
      setSelectedTab(activeView);
    }
  }, [activeView]);

  // Fetch sales orders when component mounts or filters change
  useEffect(() => {
    if (selectedTab === 'production-schedule') {
      fetchSalesOrders();
    }
  }, [selectedTab, statusFilter, searchTerm]);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await salesOrderService.getAllSalesOrders(filters);
      if (response.success) {
        setSalesOrders(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching sales orders:', err);
      setError(err.message || 'Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSalesOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this sales order?')) return;
    
    try {
      await salesOrderService.deleteSalesOrder(id);
      fetchSalesOrders(); // Refresh list
    } catch (err) {
      console.error('Error deleting sales order:', err);
      alert('Failed to delete sales order');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await salesOrderService.updateSalesOrder(id, { status: newStatus });
      fetchSalesOrders(); // Refresh list
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const workOrders = [
    {
      id: 1,
      orderId: 'WO-2024-001',
      product: 'Cable Assembly A',
      quantity: 500,
      assignedTo: 'John Smith',
      startTime: '08:00',
      endTime: '16:00',
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 2,
      orderId: 'WO-2024-002',
      product: 'Cable Assembly B',
      quantity: 300,
      assignedTo: 'Jane Doe',
      startTime: '09:00',
      endTime: '17:00',
      status: 'Pending',
      priority: 'Medium'
    }
  ];

  // Shop floor sample data (machines, WIP, operators)
  const machines = [
    { id: 1, name: 'Assembly Machine 1', status: 'Running', uptime: 92, currentOrder: 'SO-2024-001', operator: 'Ravi K.', lastDowntime: '1.5h' },
    { id: 2, name: 'Packaging Machine 2', status: 'Maintenance', uptime: 40, currentOrder: '—', operator: '—', lastDowntime: '6.0h' },
    { id: 3, name: 'Conveyor Line 3', status: 'Idle', uptime: 15, currentOrder: '—', operator: 'Priya S.', lastDowntime: '0.5h' }
  ];
  const shopFloorSummary = {
    wipOrders: 18,
    activeOperators: 12,
    runningMachines: machines.filter(m => m.status === 'Running').length,
    downtimeIncidents: 2
  };

  // Backload Planning sample (backlog/backorder management)
  const backloadOrders = [
    { id: 1, orderId: 'SO-2024-004', customer: 'Nova Industries', product: 'Cable Assembly D', qty: 250, promisedDate: '2024-01-18', agingDays: 6, reason: 'Material Shortage', priority: 'High', suggestedLine: 'Line 2 - Packaging', suggestedStartDate: '2024-01-21' },
    { id: 2, orderId: 'SO-2024-005', customer: 'Orion Tech', product: 'Cable Assembly E', qty: 400, promisedDate: '2024-01-16', agingDays: 8, reason: 'Capacity Limit', priority: 'Medium', suggestedLine: 'Line 1 - Assembly', suggestedStartDate: '2024-01-22' },
    { id: 3, orderId: 'SO-2024-006', customer: 'Prime Automation', product: 'Cable Assembly F', qty: 180, promisedDate: '2024-01-15', agingDays: 9, reason: 'Machine Down', priority: 'High', suggestedLine: 'Line 3 - Quality Control', suggestedStartDate: '2024-01-23' }
  ];

  // Design & Cost sample (common industrial quoting/bom breakdown)
  const designSummary = {
    designRevision: 'REV-B',
    engineer: 'A. Verma',
    estimatedLeadDays: 10,
    materialCost: 425000,
    laborCost: 78000,
    overheadCost: 52000,
    marginPct: 18
  };

  const designBom = [
    { id: 1, sku: 'MAT-AL-6SQ', description: 'Aluminium Conductor 6 sq.mm', material: 'Aluminium', qty: 1200, unit: 'm', unitCost: 85, process: 'Cutting', cycleTimeMin: 0.3 },
    { id: 2, sku: 'INS-PVC-6SQ', description: 'PVC Insulation 6 sq.mm', material: 'PVC', qty: 1200, unit: 'm', unitCost: 22, process: 'Extrusion', cycleTimeMin: 0.5 },
    { id: 3, sku: 'BRAID-SS', description: 'Stainless Steel Braid', material: 'SS304', qty: 400, unit: 'm', unitCost: 110, process: 'Braiding', cycleTimeMin: 0.6 },
    { id: 4, sku: 'SHEATH-PVC', description: 'Outer Sheath PVC', material: 'PVC', qty: 400, unit: 'm', unitCost: 35, process: 'Sheathing', cycleTimeMin: 0.4 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackloadReasonColor = (reason) => {
    switch (reason) {
      case 'Material Shortage': return 'bg-yellow-100 text-yellow-800';
      case 'Capacity Limit': return 'bg-blue-100 text-blue-800';
      case 'Machine Down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProductionSchedule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Sales Orders</h2>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_production">In Production</option>
            <option value="quality_check">Quality Check</option>
            <option value="completed">Completed</option>
            <option value="shipped">Shipped</option>
            <option value="revised">Revised</option>
            <option value="deleted">Deleted</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchSalesOrders}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales orders...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchSalesOrders}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      ) : salesOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sales orders found</p>
          <p className="text-sm text-gray-500 mt-2">Sales orders will appear here automatically when work orders are created</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesOrders.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{item.sales_order_number}</span>
                        {item.status === 'revised' && item.revised_at && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            REVISED
                          </span>
                        )}
                        {item.status === 'deleted' && item.deleted_at && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            DELETED
                          </span>
                        )}
                      </div>
                      {item.revised_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Revised: {new Date(item.revised_at).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.work_order_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(item.quantity).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salesOrderService.formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.order_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        disabled={item.status === 'deleted'}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${salesOrderService.getStatusColor(item.status)} border-0 cursor-pointer ${item.status === 'deleted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="in_production">In Production</option>
                        <option value="quality_check">Quality Check</option>
                        <option value="completed">Completed</option>
                        <option value="shipped">Shipped</option>
                        <option value="revised">Revised</option>
                        <option value="deleted">Deleted</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${salesOrderService.getPaymentStatusColor(item.payment_status)}`}>
                        {salesOrderService.formatPaymentStatus(item.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert('Edit functionality coming soon')}
                          className="text-orange-600 hover:text-orange-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSalesOrder(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
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
      )}
    </div>
  );

  const renderWorkOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Work Orders</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Work Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{order.orderId}</h3>
                <p className="text-sm text-gray-600">{order.product}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assigned To:</span>
                <span className="text-sm font-medium">{order.assignedTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time:</span>
                <span className="text-sm font-medium">{order.startTime} - {order.endTime}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                {order.priority}
              </span>
              <div className="flex space-x-2">
                <button className="text-orange-600 hover:text-orange-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShopFloor = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Shop Floor</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          View Shift Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">WIP Orders</p>
          <p className="text-2xl font-semibold text-gray-900">{shopFloorSummary.wipOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Active Operators</p>
          <p className="text-2xl font-semibold text-gray-900">{shopFloorSummary.activeOperators}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Running Machines</p>
          <p className="text-2xl font-semibold text-gray-900">{shopFloorSummary.runningMachines}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Downtime Incidents</p>
          <p className="text-2xl font-semibold text-gray-900">{shopFloorSummary.downtimeIncidents}</p>
        </div>
      </div>

      {/* Machines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Downtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      m.status === 'Running'
                        ? 'bg-green-100 text-green-800'
                        : m.status === 'Maintenance'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>{m.status}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{m.uptime}%</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{m.currentOrder}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{m.operator}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{m.lastDowntime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBackloadPlanning = () => {
    const totalBacklog = backloadOrders.length;
    const agingOver7 = backloadOrders.filter(o => o.agingDays > 7).length;
    const highPriority = backloadOrders.filter(o => o.priority === 'High').length;
    const materialIssues = backloadOrders.filter(o => o.reason === 'Material Shortage').length;

    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Backlog</p>
            <p className="text-2xl font-semibold text-gray-900">{totalBacklog}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Aging {'>'} 7 days</p>
            <p className="text-2xl font-semibold text-gray-900">{agingOver7}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">High Priority</p>
            <p className="text-2xl font-semibold text-gray-900">{highPriority}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Material Issues</p>
            <p className="text-2xl font-semibold text-gray-900">{materialIssues}</p>
          </div>
        </div>

        {/* Backload Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promised Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aging (days)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Line</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backloadOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{o.orderId}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.customer}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.product}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.qty}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.promisedDate}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.agingDays}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getBackloadReasonColor(o.reason)}`}>{o.reason}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(o.priority)}`}>{o.priority}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.suggestedLine}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{o.suggestedStartDate}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-orange-600 hover:text-orange-900">Schedule</button>
                        <button className="text-blue-600 hover:text-blue-900">Details</button>
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
  };
  const renderDesignCost = () => {
    const materialSubtotal = designBom.reduce((sum, i) => sum + (i.qty * i.unitCost), 0);
    const laborSubtotal = designBom.reduce((sum, i) => sum + (i.cycleTimeMin * 5 /* per-minute labor Rs */), 0) * 100; // example scaling
    const overheadSubtotal = Math.round((materialSubtotal + laborSubtotal) * 0.12);
    const baseCost = materialSubtotal + laborSubtotal + overheadSubtotal;
    const marginValue = Math.round(baseCost * (designSummary.marginPct / 100));
    const quotePrice = baseCost + marginValue;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Design & Cost</h2>
          <div className="text-sm text-gray-600">Revision: <span className="font-medium text-gray-900">{designSummary.designRevision}</span> • Engineer: <span className="font-medium text-gray-900">{designSummary.engineer}</span></div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Material Cost</p>
            <p className="text-lg font-semibold text-gray-900">₹{materialSubtotal.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Labor Cost</p>
            <p className="text-lg font-semibold text-gray-900">₹{laborSubtotal.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Overhead</p>
            <p className="text-lg font-semibold text-gray-900">₹{overheadSubtotal.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Margin</p>
            <p className="text-lg font-semibold text-gray-900">{designSummary.marginPct}%</p>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm">Estimated Lead Time:</span>
            <span className="text-sm font-medium text-gray-900">{designSummary.estimatedLeadDays} days</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Quote Price (incl. margin)</p>
            <p className="text-2xl font-bold text-green-600">₹{quotePrice.toLocaleString()}</p>
          </div>
        </div>

        {/* BOM and Cost Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle Time (min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {designBom.map((row) => {
                  const materialCost = row.qty * row.unitCost;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.sku}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.description}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.material}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.qty}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.unit}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">₹{row.unitCost.toLocaleString()}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">₹{materialCost.toLocaleString()}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.process}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.cycleTimeMin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const rawMaterialPlanning = [
    { id: 1, material: 'Copper Wire', requiredQty: 1200, unit: 'meters', currentStock: 1500, shortfall: 0, supplier: 'ABC Suppliers', leadTime: 5, orderDate: '2024-01-25', status: 'Planned' },
    { id: 2, material: 'Insulation Material', requiredQty: 800, unit: 'kg', currentStock: 500, shortfall: 300, supplier: 'XYZ Industries', leadTime: 7, orderDate: '2024-01-23', status: 'Ordered' },
    { id: 3, material: 'Connectors', requiredQty: 200, unit: 'pieces', currentStock: 50, shortfall: 150, supplier: 'DEF Components', leadTime: 3, orderDate: '2024-01-22', status: 'Pending' },
    { id: 4, material: 'Aluminium Conductor', requiredQty: 1000, unit: 'meters', currentStock: 1200, shortfall: 0, supplier: 'GHI Metals', leadTime: 6, orderDate: '—', status: 'Available' }
  ];

  const renderRawMaterialPlanning = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Raw Material Planning</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Material Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Materials</p>
          <p className="text-2xl font-semibold text-gray-900">{rawMaterialPlanning.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Materials with Shortfall</p>
          <p className="text-2xl font-semibold text-red-600">
            {rawMaterialPlanning.filter(m => m.shortfall > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Orders Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {rawMaterialPlanning.filter(m => m.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Orders Placed</p>
          <p className="text-2xl font-semibold text-green-600">
            {rawMaterialPlanning.filter(m => m.status === 'Ordered').length}
          </p>
        </div>
      </div>

      {/* Material Planning Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortfall</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time (days)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rawMaterialPlanning.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{material.material}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{material.requiredQty} {material.unit}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{material.currentStock} {material.unit}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                    {material.shortfall > 0 ? (
                      <span className="text-red-600 font-medium">{material.shortfall} {material.unit}</span>
                    ) : (
                      <span className="text-green-600">0 {material.unit}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{material.supplier}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{material.leadTime} days</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{material.orderDate}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      material.status === 'Available' ? 'bg-green-100 text-green-800' :
                      material.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                      material.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {material.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <FileText className="w-4 h-4" />
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
      {selectedTab === 'production-schedule' && renderProductionSchedule()}
      {selectedTab === 'design-cost' && renderDesignCost()}
      {selectedTab === 'raw-material-planning' && renderRawMaterialPlanning()}
      {selectedTab === 'work-orders' && renderWorkOrders()}
      {selectedTab === 'capacity-planning' && renderShopFloor()}
      {selectedTab === 'backload-planning' && renderBackloadPlanning()}
    </div>
  );
};

export default PPC;

