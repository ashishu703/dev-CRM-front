import React, { useState, useEffect } from 'react';
import { 
  Download, RefreshCw, Calendar, TrendingUp, DollarSign, Target, 
  CheckCircle, XCircle, AlertCircle, FileText, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import reportService from '../../api/admin_api/reportService';
import CSVExport from '../../utils/csvExport';

/**
 * Salesperson Performance Report Component
 * Shows total assigned leads, followup leads, converted, revenue, quotations, products, payments, targets, achievements
 */
const SalespersonPerformanceReport = ({ salespersonUsername, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expandedQuotation, setExpandedQuotation] = useState(null);

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
      const data = await reportService.getPerformanceReport(salespersonUsername, {
        startDate,
        endDate
      });
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch performance report');
      console.error('Error fetching performance report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    // Export summary
    const summaryHeaders = [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' }
    ];
    const summaryData = [
      { metric: 'Total Assigned Leads', value: reportData.summary.totalAssignedLeads },
      { metric: 'Followup Leads', value: reportData.summary.followupLeads },
      { metric: 'Converted Leads', value: reportData.summary.convertedLeads },
      { metric: 'Closed/Won Leads', value: reportData.summary.closedWonLeads },
      { metric: 'Lost Leads', value: reportData.summary.lostLeads },
      { metric: 'Total Revenue', value: reportData.summary.totalRevenue },
      { metric: 'Total Paid', value: reportData.summary.totalPaid },
      { metric: 'Total Due', value: reportData.summary.totalDue },
      { metric: 'Total Advance', value: reportData.summary.totalAdvance },
      { metric: 'Target Amount', value: reportData.summary.targetAmount },
      { metric: 'Achieved', value: reportData.summary.achieved },
      { metric: 'Remaining', value: reportData.summary.remaining },
      { metric: 'Achievement %', value: `${reportData.summary.achievementPercentage}%` }
    ];
    CSVExport.export(summaryData, summaryHeaders, `performance_summary_${salespersonUsername}`);

    // Export quotations
    if (reportData.quotations && reportData.quotations.length > 0) {
      const quotationHeaders = [
        { key: 'quotation_number', label: 'Quotation ID' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'totalPaid', label: 'Paid' },
        { key: 'totalDue', label: 'Due' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Date' }
      ];
      CSVExport.export(reportData.quotations, quotationHeaders, `performance_quotations_${salespersonUsername}`);
    }
  };

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Prepare chart data
  const revenueChartData = reportData?.quotations?.map(q => ({
    quotation: q.quotation_number || `QT-${q.id}`,
    total: Number(q.total_amount || 0),
    paid: q.totalPaid || 0,
    due: q.totalDue || 0
  })) || [];

  const statusData = reportData ? [
    { name: 'Won/Closed', value: reportData.summary.closedWonLeads, color: '#10b981' },
    { name: 'Lost', value: reportData.summary.lostLeads, color: '#ef4444' },
    { name: 'Pending', value: reportData.summary.totalAssignedLeads - reportData.summary.closedWonLeads - reportData.summary.lostLeads, color: '#f59e0b' }
  ] : [];

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
          <h1 className="text-3xl font-bold text-gray-900">Performance Report</h1>
          <p className="text-gray-600 mt-1">
            Salesperson: <span className="font-semibold">{salespersonUsername}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
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

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading performance report...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : !reportData ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <p>No data available</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Assigned Leads</p>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.summary.totalAssignedLeads}</p>
              <p className="text-xs text-gray-500 mt-1">
                Followup: {reportData.summary.followupLeads} | Converted: {reportData.summary.convertedLeads}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ₹{reportData.summary.totalRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Paid: ₹{reportData.summary.totalPaid.toLocaleString('en-IN')} | 
                Due: ₹{reportData.summary.totalDue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Target Achievement</p>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {reportData.summary.achievementPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Achieved: ₹{reportData.summary.achieved.toLocaleString('en-IN')} / 
                Target: ₹{reportData.summary.targetAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Lead Status</p>
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
                  <span className="text-sm font-semibold">{reportData.summary.closedWonLeads}</span>
                </div>
                <div>
                  <XCircle className="w-4 h-4 text-red-600 inline mr-1" />
                  <span className="text-sm font-semibold">{reportData.summary.lostLeads}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Quotation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quotation" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" />
                  <Bar dataKey="paid" fill="#10b981" name="Paid" />
                  <Bar dataKey="due" fill="#ef4444" name="Due" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quotations Details */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Quotations ({reportData.quotations?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quotation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.quotations?.map((quotation) => (
                    <React.Fragment key={quotation.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quotation.quotation_number || `QT-${quotation.id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {quotation.customer_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₹{Number(quotation.total_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600">
                          ₹{Number(quotation.totalPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          ₹{Number(quotation.totalDue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            quotation.status === 'approved' ? 'bg-green-100 text-green-800' :
                            quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quotation.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setExpandedQuotation(
                              expandedQuotation === quotation.id ? null : quotation.id
                            )}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {expandedQuotation === quotation.id ? 'Hide' : 'View'} Details
                          </button>
                        </td>
                      </tr>
                      {expandedQuotation === quotation.id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Products */}
                              {quotation.products && quotation.products.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Products:</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-3 py-2 text-left">Product</th>
                                          <th className="px-3 py-2 text-left">Qty</th>
                                          <th className="px-3 py-2 text-left">Rate</th>
                                          <th className="px-3 py-2 text-left">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {quotation.products.map((product, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-2">{product.product_name || 'N/A'}</td>
                                            <td className="px-3 py-2">{product.quantity || 'N/A'}</td>
                                            <td className="px-3 py-2">₹{Number(product.rate || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-2">₹{Number(product.amount || 0).toLocaleString('en-IN')}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Payments */}
                              {quotation.payments && quotation.payments.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Payment Installments:</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-3 py-2 text-left">Installment</th>
                                          <th className="px-3 py-2 text-left">Amount</th>
                                          <th className="px-3 py-2 text-left">Date</th>
                                          <th className="px-3 py-2 text-left">Status</th>
                                          <th className="px-3 py-2 text-left">Approval</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {quotation.payments.map((payment, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-2">#{payment.installment_number || idx + 1}</td>
                                            <td className="px-3 py-2">₹{Number(payment.installment_amount || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-2">
                                              {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className={`px-2 py-1 rounded text-xs ${
                                                payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                              }`}>
                                                {payment.payment_status || 'pending'}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className={`px-2 py-1 rounded text-xs ${
                                                payment.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                payment.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                {payment.approval_status || 'pending'}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalespersonPerformanceReport;

