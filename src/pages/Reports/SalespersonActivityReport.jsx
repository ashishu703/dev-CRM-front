import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, Filter, RefreshCw, Phone, MapPin, FileText, 
  TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import reportService from '../../api/admin_api/reportService';
import CSVExport from '../../utils/csvExport';

/**
 * Salesperson Activity Report Component
 * Shows date-wise calls with followup status, sales status, remarks, address, division, state, requirements
 */
const SalespersonActivityReport = ({ salespersonUsername, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (salespersonUsername) {
      fetchReport();
    }
  }, [salespersonUsername, startDate, endDate]);

  const fetchReport = async () => {
    if (!salespersonUsername) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getActivityReport(salespersonUsername, {
        startDate,
        endDate
      });
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch activity report');
      console.error('Error fetching activity report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.activities) return;

    const headers = [
      { key: 'call_date', label: 'Call Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'address', label: 'Address' },
      { key: 'state', label: 'State' },
      { key: 'division', label: 'Division' },
      { key: 'follow_up_status', label: 'Follow Up Status' },
      { key: 'follow_up_remark', label: 'Follow Up Remark' },
      { key: 'sales_status', label: 'Sales Status' },
      { key: 'sales_status_remark', label: 'Sales Status Remark' },
      { key: 'requirement', label: 'Requirement' },
      { key: 'requirement_detail', label: 'Requirement Detail' },
      { key: 'enquired_product', label: 'Enquired Product' },
      { key: 'product_quantity', label: 'Product Quantity' },
      { key: 'product_remark', label: 'Product Remark' }
    ];

    CSVExport.export(reportData.activities, headers, `activity_report_${salespersonUsername}`);
  };

  // Filter activities
  const filteredActivities = reportData?.activities?.filter(activity => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      activity.customer_name?.toLowerCase().includes(search) ||
      activity.phone?.includes(search) ||
      activity.email?.toLowerCase().includes(search) ||
      activity.address?.toLowerCase().includes(search) ||
      activity.follow_up_status?.toLowerCase().includes(search) ||
      activity.sales_status?.toLowerCase().includes(search)
    );
  }) || [];

  // Group by date for chart
  const chartData = React.useMemo(() => {
    if (!reportData?.groupedByDate) return [];
    
    return Object.entries(reportData.groupedByDate)
      .map(([date, activities]) => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        calls: activities.length,
        followups: activities.filter(a => a.follow_up_status).length,
        converted: activities.filter(a => ['won', 'closed', 'converted'].includes((a.sales_status || '').toLowerCase())).length
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [reportData]);

  // Status counts for summary
  const statusCounts = React.useMemo(() => {
    if (!reportData?.activities) return {};
    
    return {
      total: reportData.activities.length,
      followup: reportData.activities.filter(a => a.follow_up_status).length,
      won: reportData.activities.filter(a => ['won', 'closed'].includes((a.sales_status || '').toLowerCase())).length,
      lost: reportData.activities.filter(a => ['lost', 'rejected'].includes((a.sales_status || '').toLowerCase())).length,
      pending: reportData.activities.filter(a => !a.sales_status || a.sales_status === 'pending').length
    };
  }, [reportData]);

  const displayActivities = selectedDate 
    ? (reportData?.groupedByDate?.[selectedDate] || []).filter(a => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          a.customer_name?.toLowerCase().includes(search) ||
          a.phone?.includes(search) ||
          a.email?.toLowerCase().includes(search)
        );
      })
    : filteredActivities;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Back to Reports
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Activity Report</h1>
          <p className="text-gray-600 mt-1">
            Salesperson: <span className="font-semibold">{salespersonUsername}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!reportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer, phone, email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <select
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Dates</option>
              {Object.keys(reportData?.groupedByDate || {}).map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-GB')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Followups</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.followup}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Won/Closed</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.won}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lost</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.lost}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls by Date</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="#3b82f6" name="Total Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Followups & Conversions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="followups" stroke="#f59e0b" name="Followups" />
                <Line type="monotone" dataKey="converted" stroke="#10b981" name="Converted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Activities ({displayActivities.length})
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading activities...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : displayActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p>No activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">State/Division</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Follow Up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sales Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayActivities.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.call_date ? new Date(activity.call_date).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{activity.customer_name || 'N/A'}</div>
                      {activity.business && (
                        <div className="text-xs text-gray-500">{activity.business}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{activity.phone || 'N/A'}</div>
                      {activity.email && (
                        <div className="text-xs text-gray-500">{activity.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {activity.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{activity.state || 'N/A'}</div>
                      {activity.division && (
                        <div className="text-xs text-gray-500">{activity.division}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.follow_up_status 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.follow_up_status || 'No Followup'}
                        </span>
                        {activity.follow_up_remark && (
                          <span className="text-xs text-gray-600">{activity.follow_up_remark}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ['won', 'closed'].includes((activity.sales_status || '').toLowerCase())
                          ? 'bg-green-100 text-green-800'
                          : ['lost', 'rejected'].includes((activity.sales_status || '').toLowerCase())
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.sales_status || 'Pending'}
                      </span>
                      {activity.sales_status_remark && (
                        <div className="text-xs text-gray-600 mt-1">{activity.sales_status_remark}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{activity.requirement || activity.enquired_product || 'N/A'}</div>
                      {activity.requirement_detail && (
                        <div className="text-xs text-gray-500 mt-1">{activity.requirement_detail}</div>
                      )}
                      {activity.product_quantity && (
                        <div className="text-xs text-gray-500">Qty: {activity.product_quantity}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {activity.product_remark || activity.follow_up_remark || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalespersonActivityReport;

