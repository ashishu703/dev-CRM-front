import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, ShoppingCart } from 'lucide-react';
import reportService from '../../api/admin_api/reportService';
import { exportToCSV } from '../../utils/csvExport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const OrdersReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [salespersons, setSalespersons] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSalespersons();
    fetchReport();
  }, []);

  const fetchSalespersons = async () => {
    try {
      const response = await reportService.getSalespersonsWithOrders();
      // Handle different response structures
      const data = Array.isArray(response) 
        ? response 
        : (response?.data || response?.salespersons || []);
      setSalespersons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching salespersons:', error);
      setSalespersons([]);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSalesperson) params.salesperson = selectedSalesperson;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await reportService.getOrdersReport(params);
      setReportData(response?.data || response);
    } catch (error) {
      console.error('Error fetching orders report:', error);
      alert('Failed to fetch orders report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData?.orders || reportData.orders.length === 0) {
      alert('No data to export');
      return;
    }

    const csvData = [];
    reportData.orders.forEach(order => {
      const products = Array.isArray(order.products) ? order.products : [];
      if (products.length > 0) {
        products.forEach((product, idx) => {
          csvData.push({
            'Quotation Number': idx === 0 ? order.quotation_number : '',
            'Quotation Date': idx === 0 ? order.quotation_date : '',
            'Customer Name': idx === 0 ? order.customer_name : '',
            'Customer Business': idx === 0 ? order.customer_business : '',
            'Customer Phone': idx === 0 ? order.customer_phone : '',
            'Customer Email': idx === 0 ? order.customer_email : '',
            'Customer State': idx === 0 ? order.customer_state : '',
            'Salesperson': idx === 0 ? (order.salesperson_name || order.salesperson_username) : '',
            'Product Name': product.product_name || '',
            'Product Description': product.description || '',
            'Quantity': product.quantity || 0,
            'Unit': product.unit || 'Nos',
            'Unit Price (Rate)': product.unit_price || 0,
            'Product Total': product.total_amount || 0,
            'Quotation Total': idx === 0 ? order.quotation_total : '',
            'PI Count': idx === 0 ? order.pi_count : '',
            'Latest PI Number': idx === 0 ? order.latest_pi_number : '',
            'Latest PI Date': idx === 0 ? order.latest_pi_date : '',
            'Latest PI Amount': idx === 0 ? order.latest_pi_amount : '',
            'Latest PI Status': idx === 0 ? order.latest_pi_status : '',
            'Total Paid': idx === 0 ? order.total_paid : '',
            'Remaining Due': idx === 0 ? order.remaining_due : '',
            'Quotation Status': idx === 0 ? order.quotation_status : ''
          });
        });
      } else {
        csvData.push({
          'Quotation Number': order.quotation_number,
          'Quotation Date': order.quotation_date,
          'Customer Name': order.customer_name,
          'Customer Business': order.customer_business,
          'Customer Phone': order.customer_phone,
          'Customer Email': order.customer_email,
          'Customer State': order.customer_state,
          'Salesperson': order.salesperson_name || order.salesperson_username,
          'Product Name': '',
          'Product Description': '',
          'Quantity': '',
          'Unit': '',
          'Unit Price (Rate)': '',
          'Product Total': '',
          'Quotation Total': order.quotation_total,
          'PI Count': order.pi_count,
          'Latest PI Number': order.latest_pi_number,
          'Latest PI Date': order.latest_pi_date,
          'Latest PI Amount': order.latest_pi_amount,
          'Latest PI Status': order.latest_pi_status,
          'Total Paid': order.total_paid,
          'Remaining Due': order.remaining_due,
          'Quotation Status': order.quotation_status
        });
      }
    });

    exportToCSV(csvData, `orders-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredOrders = reportData?.orders?.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.quotation_number?.toLowerCase().includes(search) ||
      order.customer_name?.toLowerCase().includes(search) ||
      order.customer_business?.toLowerCase().includes(search) ||
      order.salesperson_name?.toLowerCase().includes(search) ||
      order.salesperson_username?.toLowerCase().includes(search)
    );
  }) || [];

  const chartData = reportData?.bySalesperson?.map(sp => ({
    name: sp.salesperson?.name || sp.salesperson?.username || 'Unknown',
    orders: sp.totalOrders,
    value: sp.totalValue,
    paid: sp.totalPaid,
    due: sp.totalDue
  })) || [];

  const statusData = reportData?.orders?.reduce((acc, order) => {
    const status = order.quotation_status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800">Orders Report</h1>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salesperson
              </label>
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Salespersons</option>
                {Array.isArray(salespersons) && salespersons.map((sp) => (
                  <option key={sp.id || sp.username || sp.email} value={sp.username || sp.email}>
                    {sp.name || sp.username} ({sp.order_count || 0} orders)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchReport}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by quotation number, customer name, or salesperson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading orders report...</p>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{reportData.summary?.totalOrders || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{Number(reportData.summary?.totalQuotationValue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{Number(reportData.summary?.totalPaid || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{Number(reportData.summary?.totalDue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">Total PIs</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.summary?.totalPIs || 0}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Orders by Salesperson</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10b981" name="Orders" />
                    <Bar dataKey="value" fill="#3b82f6" name="Value (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Orders List ({filteredOrders.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotation #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesperson</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIs</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const products = Array.isArray(order.products) ? order.products : [];
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.quotation_number}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {order.quotation_date ? new Date(order.quotation_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-gray-500 text-xs">{order.customer_business}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {order.salesperson_name || order.salesperson_username || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {products.length > 0 ? (
                                <div className="space-y-1">
                                  {products.map((product, idx) => (
                                    <div key={product.id || idx} className="text-xs">
                                      <div className="font-medium">{product.product_name}</div>
                                      <div className="text-gray-500">
                                        Qty: {Number(product.quantity || 0).toLocaleString('en-IN')} {product.unit || 'Nos'}
                                      </div>
                                      <div className="text-gray-500">
                                        Rate: ₹{Number(product.unit_price || 0).toLocaleString('en-IN')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">No products</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{Number(order.quotation_total || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {order.pi_count || 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                              ₹{Number(order.total_paid || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                              ₹{Number(order.remaining_due || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                order.quotation_status === 'approved' ? 'bg-green-100 text-green-800' :
                                order.quotation_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.quotation_status || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersReport;

