import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, DollarSign, Download, Activity, Settings, Users } from 'lucide-react';

const ReportsManagement = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState('production-reports');

  const tabs = [
    { id: 'production-reports', label: 'Production Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'efficiency-metrics', label: 'Efficiency Metrics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cost-analysis', label: 'Cost Analysis', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'daily-machine-report', label: 'Daily Machine Report', icon: <Activity className="w-4 h-4" /> },
    { id: 'machine-status', label: 'Machine Status', icon: <Settings className="w-4 h-4" /> },
    { id: 'operator-performance', label: 'Operator Performance', icon: <Users className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeView && tabs.some(t => t.id === activeView)) {
      setSelectedTab(activeView);
    }
  }, [activeView]);

  const renderProductionReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Production Reports</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Daily Production Report', description: 'Daily production summary and metrics', lastUpdated: '2024-01-15' },
          { title: 'Weekly Efficiency Report', description: 'Weekly efficiency analysis and trends', lastUpdated: '2024-01-14' },
          { title: 'Monthly Quality Report', description: 'Monthly quality metrics and analysis', lastUpdated: '2024-01-10' },
          { title: 'Equipment Performance', description: 'Equipment utilization and performance', lastUpdated: '2024-01-12' },
          { title: 'Cost Analysis Report', description: 'Production cost breakdown and analysis', lastUpdated: '2024-01-08' },
          { title: 'Inventory Report', description: 'Raw materials and finished goods inventory', lastUpdated: '2024-01-13' }
        ].map((report, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <p className="text-xs text-gray-500">Last updated: {report.lastUpdated}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors">
                View
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const efficiencyMetrics = [
    { metric: 'Overall Equipment Effectiveness (OEE)', value: 87.5, target: 85.0, trend: 'up' },
    { metric: 'Production Efficiency', value: 92.3, target: 90.0, trend: 'up' },
    { metric: 'Machine Utilization', value: 78.5, target: 80.0, trend: 'down' },
    { metric: 'Cycle Time Efficiency', value: 88.2, target: 85.0, trend: 'up' },
    { metric: 'First Pass Yield', value: 94.2, target: 95.0, trend: 'down' },
    { metric: 'Downtime Percentage', value: 5.2, target: 3.0, trend: 'down' }
  ];

  const renderEfficiencyMetrics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Efficiency Metrics</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {efficiencyMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.metric}</h3>
              <div className={`flex items-center ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{metric.value}%</div>
              <div className="text-sm text-gray-500">Target: {metric.target}%</div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metric.value >= metric.target ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Efficiency Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Trend (Last 6 Months)</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Efficiency trend chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const costAnalysis = [
    { category: 'Raw Materials', current: 425000, previous: 410000, variance: 15000, variancePct: 3.7 },
    { category: 'Labor Cost', current: 180000, previous: 175000, variance: 5000, variancePct: 2.9 },
    { category: 'Overhead', current: 95000, previous: 92000, variance: 3000, variancePct: 3.3 },
    { category: 'Maintenance', current: 45000, previous: 48000, variance: -3000, variancePct: -6.3 },
    { category: 'Utilities', current: 32000, previous: 30000, variance: 2000, variancePct: 6.7 },
    { category: 'Total Production Cost', current: 777000, previous: 755000, variance: 22000, variancePct: 2.9 }
  ];

  const renderCostAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Cost Analysis</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Analysis
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {costAnalysis.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.current.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.previous.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    item.variance >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.variance >= 0 ? '+' : ''}₹{item.variance.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    item.variance >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.variance >= 0 ? '+' : ''}{item.variancePct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown (Current Period)</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Cost breakdown chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDailyMachineReport = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Daily Machine Report</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Machine Status</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
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

  const renderOperatorPerformance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Operator Performance</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output (pcs)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downtime (h)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { operator: 'Ravi K.', machine: 'Assembly Machine 1', output: 2450, efficiency: 92, quality: 98.5, downtime: 1.2, rating: 'Excellent' },
                { operator: 'Priya S.', machine: 'Packaging Machine 2', output: 2100, efficiency: 88, quality: 96.2, downtime: 2.1, rating: 'Good' },
                { operator: 'Amit K.', machine: 'Finishing Machine 1', output: 2300, efficiency: 90, quality: 97.8, downtime: 0.8, rating: 'Excellent' },
                { operator: 'Suresh M.', machine: 'Quality Check Machine', output: 1800, efficiency: 85, quality: 95.5, downtime: 3.0, rating: 'Average' }
              ].map((op, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{op.operator}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.machine}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.output}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.efficiency}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.quality}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.downtime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      op.rating === 'Excellent' ? 'bg-green-100 text-green-800' : 
                      op.rating === 'Good' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {op.rating}
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
      {selectedTab === 'production-reports' && renderProductionReports()}
      {selectedTab === 'efficiency-metrics' && renderEfficiencyMetrics()}
      {selectedTab === 'cost-analysis' && renderCostAnalysis()}
      {selectedTab === 'daily-machine-report' && renderDailyMachineReport()}
      {selectedTab === 'machine-status' && renderMachineStatus()}
      {selectedTab === 'operator-performance' && renderOperatorPerformance()}
    </div>
  );
};

export default ReportsManagement;

