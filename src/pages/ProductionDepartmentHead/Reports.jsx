import React, { useState } from 'react';
import { BarChart3, FileText, TrendingUp, DollarSign, Download } from 'lucide-react';

const Reports = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState(activeView || 'production-reports');

  const tabs = [
    { id: 'production-reports', label: 'Production Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'efficiency-metrics', label: 'Efficiency Metrics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cost-analysis', label: 'Cost Analysis', icon: <DollarSign className="w-4 h-4" /> }
  ];

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-orange-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1">Generate and view production reports and analytics</p>
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

      {selectedTab === 'production-reports' && renderProductionReports()}
    </div>
  );
};

export default Reports;
