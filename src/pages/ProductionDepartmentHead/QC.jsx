import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Package, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckSquare
} from 'lucide-react';

const QC = ({ activeView, setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState('incoming-material-testing');
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: 'incoming-material-testing', label: 'Incoming Material Testing', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'inprocess-testing', label: 'In-Process Testing', icon: <Package className="w-4 h-4" /> },
    { id: 'final-testing-pdi', label: 'Final Testing (PDI)', icon: <CheckSquare className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeView && tabs.some(t => t.id === activeView)) {
      setSelectedTab(activeView);
    }
  }, [activeView]);

  const incomingMaterialTests = [
    {
      id: 1,
      testId: 'IMT-2024-001',
      material: 'Copper Wire',
      batchNumber: 'BATCH-001',
      supplier: 'ABC Suppliers',
      quantity: 1000,
      unit: 'meters',
      testDate: '2024-01-20',
      inspector: 'John Smith',
      status: 'Passed',
      defects: 0,
      qualityScore: 98.5,
      remarks: 'All parameters within specification'
    },
    {
      id: 2,
      testId: 'IMT-2024-002',
      material: 'Insulation Material',
      batchNumber: 'BATCH-002',
      supplier: 'XYZ Industries',
      quantity: 500,
      unit: 'kg',
      testDate: '2024-01-19',
      inspector: 'Jane Doe',
      status: 'Failed',
      defects: 3,
      qualityScore: 85.2,
      remarks: 'Thickness variation detected'
    },
    {
      id: 3,
      testId: 'IMT-2024-003',
      material: 'Connectors',
      batchNumber: 'BATCH-003',
      supplier: 'DEF Components',
      quantity: 200,
      unit: 'pieces',
      testDate: '2024-01-18',
      inspector: 'Mike Johnson',
      status: 'Pending',
      defects: 0,
      qualityScore: 0,
      remarks: 'Testing in progress'
    }
  ];

  const inProcessTests = [
    {
      id: 1,
      testId: 'IPT-2024-001',
      workOrder: 'WO-2024-001',
      product: 'Cable Assembly A',
      stage: 'Assembly',
      testDate: '2024-01-20',
      inspector: 'Sarah Wilson',
      status: 'Passed',
      defects: 0,
      qualityScore: 97.8,
      remarks: 'Assembly quality verified'
    },
    {
      id: 2,
      testId: 'IPT-2024-002',
      workOrder: 'WO-2024-002',
      product: 'Cable Assembly B',
      stage: 'Insulation',
      testDate: '2024-01-19',
      inspector: 'David Brown',
      status: 'In Progress',
      defects: 0,
      qualityScore: 0,
      remarks: 'Testing ongoing'
    },
    {
      id: 3,
      testId: 'IPT-2024-003',
      workOrder: 'WO-2024-003',
      product: 'Cable Assembly C',
      stage: 'Braiding',
      testDate: '2024-01-18',
      inspector: 'Priya S.',
      status: 'Passed',
      defects: 1,
      qualityScore: 96.5,
      remarks: 'Minor defect corrected'
    }
  ];

  const finalTests = [
    {
      id: 1,
      testId: 'PDI-2024-001',
      orderId: 'SO-2024-001',
      product: 'Cable Assembly A',
      quantity: 500,
      testDate: '2024-01-20',
      inspector: 'John Smith',
      status: 'Passed',
      defects: 0,
      qualityScore: 99.2,
      remarks: 'Ready for dispatch',
      certificate: 'CERT-001'
    },
    {
      id: 2,
      testId: 'PDI-2024-002',
      orderId: 'SO-2024-002',
      product: 'Cable Assembly B',
      quantity: 300,
      testDate: '2024-01-19',
      inspector: 'Jane Doe',
      status: 'Failed',
      defects: 2,
      qualityScore: 88.5,
      remarks: 'Rejection - dimensional issues',
      certificate: '—'
    },
    {
      id: 3,
      testId: 'PDI-2024-003',
      orderId: 'SO-2024-003',
      product: 'Cable Assembly C',
      quantity: 800,
      testDate: '2024-01-18',
      inspector: 'Mike Johnson',
      status: 'Pending',
      defects: 0,
      qualityScore: 0,
      remarks: 'PDI scheduled',
      certificate: '—'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Passed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderIncomingMaterialTesting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Incoming Material Testing</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incomingMaterialTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.testId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.material}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.batchNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.quantity} {test.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.testDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.inspector}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.defects}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.qualityScore}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <Edit className="w-4 h-4" />
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

  const renderInProcessTesting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">In-Process Testing</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inProcessTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.testId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.workOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.stage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.testDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.inspector}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.defects}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.qualityScore}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <Edit className="w-4 h-4" />
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

  const renderFinalTestingPDI = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Final Testing (PDI)</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create PDI Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {finalTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.testId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.orderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.testDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.inspector}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.defects}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.qualityScore}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.certificate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <Edit className="w-4 h-4" />
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
      {selectedTab === 'incoming-material-testing' && renderIncomingMaterialTesting()}
      {selectedTab === 'inprocess-testing' && renderInProcessTesting()}
      {selectedTab === 'final-testing-pdi' && renderFinalTestingPDI()}
    </div>
  );
};

export default QC;
