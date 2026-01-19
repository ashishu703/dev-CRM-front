import React, { useState, useEffect } from 'react';
import { 
  Download, RefreshCw, Calendar, TrendingUp, Award, BarChart3, 
  AlertCircle, FileText, Users, Target, DollarSign, CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import reportService from '../../api/admin_api/reportService';
import CSVExport from '../../utils/csvExport';

/**
 * Top Performer Comparison Report Component
 * Compares all salespersons and shows detailed analysis
 */
const TopPerformerComparisonReport = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departmentType, setDepartmentType] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, departmentType]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getTopPerformerComparison({
        startDate,
        endDate,
        departmentType: departmentType || undefined
      });
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch top performer comparison');
      console.error('Error fetching top performer comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.comparison) return;

    const headers = [
      { key: 'salesperson', label: 'Salesperson' },
      { key: 'totalLeads', label: 'Total Leads' },
      { key: 'convertedLeads', label: 'Converted Leads' },
      { key: 'conversionRate', label: 'Conversion Rate %' },
      { key: 'revenue', label: 'Revenue' },
      { key: 'paid', label: 'Paid' },
      { key: 'due', label: 'Due' },
      { key: 'target', label: 'Target' },
      { key: 'achieved', label: 'Achieved' },
      { key: 'achievementPercentage', label: 'Achievement %' },
      { key: 'closedWon', label: 'Closed/Won' },
      { key: 'lost', label: 'Lost' }
    ];

    const csvData = reportData.comparison.map(item => ({
      salesperson: item.salesperson,
      totalLeads: item.metrics.totalLeads,
      convertedLeads: item.metrics.convertedLeads,
      conversionRate: item.metrics.conversionRate.toFixed(2),
      revenue: item.metrics.revenue,
      paid: item.metrics.paid,
      due: item.metrics.due,
      target: item.metrics.target,
      achieved: item.metrics.achieved,
      achievementPercentage: item.metrics.achievementPercentage.toFixed(2),
      closedWon: item.metrics.closedWon,
      lost: item.metrics.lost
    }));

    CSVExport.export(csvData, headers, 'top_performer_comparison');
  };

  // Prepare chart data
  const barChartData = reportData?.comparison?.slice(0, 10).map(item => ({
    name: item.salesperson.split('@')[0].substring(0, 10),
    fullName: item.salesperson,
    revenue: item.metrics.revenue,
    paid: item.metrics.paid,
    target: item.metrics.target,
    achievement: item.metrics.achievementPercentage
  })) || [];

  const radarData = reportData?.topPerformers?.slice(0, 5).map(item => ({
    salesperson: item.salesperson.split('@')[0].substring(0, 10),
    leads: (item.metrics.totalLeads / Math.max(...(reportData.comparison.map(c => c.metrics.totalLeads) || [1]))) * 100,
    conversion: item.metrics.conversionRate,
    revenue: (item.metrics.revenue / Math.max(...(reportData.comparison.map(c => c.metrics.revenue) || [1]))) * 100,
    achievement: item.metrics.achievementPercentage
  })) || [];

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
          <h1 className="text-3xl font-bold text-gray-900">Top Performer Comparison</h1>
          <p className="text-gray-600 mt-1">Compare all salespersons performance and identify top performers</p>
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
            <select
              value={departmentType}
              onChange={(e) => setDepartmentType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Departments</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="office">Office</option>
            </select>
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
          <p className="text-gray-600">Loading comparison report...</p>
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
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Salespersons</p>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.totalSalespersons}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg Leads</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportData.averages.avgLeads}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg Revenue</p>
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ₹{reportData.averages.avgRevenue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Avg Achievement</p>
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {reportData.averages.avgAchievement.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Revenue Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'achievement') return `${value.toFixed(1)}%`;
                      return `₹${value.toLocaleString('en-IN')}`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="paid" fill="#10b981" name="Paid" />
                  <Bar dataKey="target" fill="#8b5cf6" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Achievement %</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="achievement" fill="#f59e0b" name="Achievement %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Top Performers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Salesperson</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Converted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Conv. Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Achieved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Achievement %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.comparison.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        index < 3 ? 'bg-yellow-50' : ''
                      }`}
                      onClick={() => setSelectedSalesperson(
                        selectedSalesperson === item.salesperson ? null : item.salesperson
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index < 3 && <Award className="w-4 h-4 text-yellow-600 inline mr-1" />}
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.salesperson}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.metrics.totalLeads}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.metrics.convertedLeads}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.metrics.conversionRate.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{item.metrics.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600">
                        ₹{item.metrics.paid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{item.metrics.target.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600">
                        ₹{item.metrics.achieved.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.metrics.achievementPercentage >= 100 ? 'bg-green-100 text-green-800' :
                          item.metrics.achievementPercentage >= 75 ? 'bg-blue-100 text-blue-800' :
                          item.metrics.achievementPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.metrics.achievementPercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed View for Selected Salesperson */}
          {selectedSalesperson && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detailed View: {selectedSalesperson}
                </h3>
                <button
                  onClick={() => setSelectedSalesperson(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportData.comparison
                  .find(item => item.salesperson === selectedSalesperson)
                  ?.metrics && Object.entries(
                    reportData.comparison.find(item => item.salesperson === selectedSalesperson).metrics
                  ).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof value === 'number' && key.includes('Rate') || key.includes('Percentage')
                          ? `${value.toFixed(2)}%`
                          : typeof value === 'number' && (key.includes('revenue') || key.includes('paid') || key.includes('due') || key.includes('target') || key.includes('achieved'))
                          ? `₹${value.toLocaleString('en-IN')}`
                          : value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopPerformerComparisonReport;

