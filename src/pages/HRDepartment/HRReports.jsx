import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, TrendingUp, FileText } from 'lucide-react';

const HRReports = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().slice(0, 7) + '-01',
    end: new Date().toISOString().slice(0, 10)
  });

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Calendar },
    { id: 'employee', name: 'Employee Report', icon: Users },
    { id: 'payroll', name: 'Payroll Report', icon: TrendingUp },
    { id: 'performance', name: 'Performance Report', icon: BarChart3 },
    { id: 'leave', name: 'Leave Report', icon: FileText }
  ];

  const generateReport = () => {
    // Simulate report generation
    console.log(`Generating ${selectedReport} report for ${dateRange.start} to ${dateRange.end}`);
    alert(`Report generated successfully! Report type: ${selectedReport}`);
  };

  const downloadReport = () => {
    // Simulate report download
    console.log(`Downloading ${selectedReport} report`);
    alert('Report downloaded successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Reports</h1>
          <p className="text-gray-600">Generate and download HR reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Report
          </button>
          <button
            onClick={downloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 border-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <h3 className={`ml-3 text-lg font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {report.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {report.id === 'attendance' && 'Generate attendance reports for selected period'}
                {report.id === 'employee' && 'Generate employee information and statistics'}
                {report.id === 'payroll' && 'Generate payroll and salary reports'}
                {report.id === 'performance' && 'Generate performance evaluation reports'}
                {report.id === 'leave' && 'Generate leave and absence reports'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {reportTypes.find(r => r.id === selectedReport)?.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Report will be generated for the period: {dateRange.start} to {dateRange.end}
          </p>
          <div className="text-sm text-gray-500">
            <p>• Employee count: 156</p>
            <p>• Department count: 6</p>
            <p>• Date range: {dateRange.start} to {dateRange.end}</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Attendance Report - January 2024</p>
                <p className="text-sm text-gray-500">Generated on 2024-01-31</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Payroll Report - January 2024</p>
                <p className="text-sm text-gray-500">Generated on 2024-01-31</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Performance Report - Q4 2023</p>
                <p className="text-sm text-gray-500">Generated on 2024-01-15</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReports;
