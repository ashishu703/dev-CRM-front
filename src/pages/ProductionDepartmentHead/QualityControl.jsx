import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Plus, 
  Filter, 
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3
} from 'lucide-react';

const QualityControl = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState(activeView || 'inspection-lots');
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: 'inspection-lots', label: 'Inspection Lots', icon: <Package className="w-4 h-4" /> },
    { id: 'quality-metrics', label: 'Quality Metrics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'non-conformance', label: 'Non-Conformance', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  // Sample data
  const inspectionLots = [
    {
      id: 1,
      lotNumber: 'IL-2024-001',
      product: 'Cable Assembly A',
      quantity: 500,
      inspector: 'John Smith',
      inspectionDate: '2024-01-15',
      status: 'Passed',
      defectCount: 0,
      qualityScore: 98.5
    },
    {
      id: 2,
      lotNumber: 'IL-2024-002',
      product: 'Cable Assembly B',
      quantity: 300,
      inspector: 'Jane Doe',
      inspectionDate: '2024-01-16',
      status: 'Failed',
      defectCount: 5,
      qualityScore: 85.2
    },
    {
      id: 3,
      lotNumber: 'IL-2024-003',
      product: 'Cable Assembly C',
      quantity: 800,
      inspector: 'Mike Johnson',
      inspectionDate: '2024-01-17',
      status: 'In Progress',
      defectCount: 0,
      qualityScore: 0
    },
    {
      id: 4,
      lotNumber: 'IL-2024-004',
      product: 'Power Cable X1',
      quantity: 250,
      inspector: 'Sarah Wilson',
      inspectionDate: '2024-01-18',
      status: 'Passed',
      defectCount: 1,
      qualityScore: 96.8
    },
    {
      id: 5,
      lotNumber: 'IL-2024-005',
      product: 'Data Cable Y2',
      quantity: 400,
      inspector: 'David Brown',
      inspectionDate: '2024-01-19',
      status: 'Pending',
      defectCount: 0,
      qualityScore: 0
    }
  ];

  const qualityMetrics = [
    { metric: 'First Pass Yield', value: 94.2, target: 95.0, trend: 'up' },
    { metric: 'Defect Rate', value: 2.1, target: 1.5, trend: 'down' },
    { metric: 'Customer Returns', value: 0.8, target: 1.0, trend: 'up' },
    { metric: 'Rework Rate', value: 3.2, target: 2.0, trend: 'down' }
  ];

  const nonConformance = [
    {
      id: 1,
      ncNumber: 'NC-2024-001',
      product: 'Cable Assembly B',
      description: 'Dimensional deviation in connector',
      severity: 'High',
      status: 'Open',
      reportedBy: 'Jane Doe',
      reportedDate: '2024-01-16',
      assignedTo: 'Quality Team'
    },
    {
      id: 2,
      ncNumber: 'NC-2024-002',
      product: 'Cable Assembly A',
      description: 'Color mismatch in insulation',
      severity: 'Medium',
      status: 'In Progress',
      reportedBy: 'John Smith',
      reportedDate: '2024-01-15',
      assignedTo: 'Production Team'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Open': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderInspectionLots = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Inspection Lots</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Inspection Lot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOT NUMBER</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QUANTITY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INSPECTOR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INSPECTION DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DEFECTS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QUALITY SCORE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspectionLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lot.lotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.inspector}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.inspectionDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lot.status)}`}>
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.defectCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.qualityScore}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
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

  const renderQualityMetrics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Quality Metrics</h2>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualityMetrics.map((metric, index) => (
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

      {/* Quality Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Trend (Last 6 Months)</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Quality trend chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNonConformance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Non-Conformance Reports</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create NC Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nonConformance.map((nc) => (
          <div key={nc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{nc.ncNumber}</h3>
                <p className="text-sm text-gray-600">{nc.product}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(nc.severity)}`}>
                  {nc.severity}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(nc.status)}`}>
                  {nc.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700">{nc.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reported by:</span>
                <span className="font-medium">{nc.reportedBy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{nc.reportedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assigned to:</span>
                <span className="font-medium">{nc.assignedTo}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button className="text-blue-600 hover:text-blue-900">
                <Eye className="w-4 h-4" />
              </button>
              <button className="text-orange-600 hover:text-orange-900">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-6 pt-2 pb-6 border-l-4 border-orange-500">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-orange-600" />
          Quality Control
        </h1>
        <p className="text-gray-600 mt-1">Manage quality inspections, metrics, and non-conformance reports</p>
      </div>

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
      {selectedTab === 'inspection-lots' && renderInspectionLots()}
      {selectedTab === 'quality-metrics' && renderQualityMetrics()}
      {selectedTab === 'non-conformance' && renderNonConformance()}
    </div>
  );
};

export default QualityControl;
