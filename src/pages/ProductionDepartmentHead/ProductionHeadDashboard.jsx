import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  Factory, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingDown, 
  Filter, 
  BarChart3, 
  PieChart, 
  RefreshCw, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Wrench,
  Package,
  Activity,
  DollarSign,
  Settings
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Pie } from 'recharts';

const ProductionHeadDashboard = ({ setActiveView }) => {
  const [selectedProductionLine, setSelectedProductionLine] = useState('All Production Lines');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCharts, setShowCharts] = useState(false);

  // Sample data for different production lines
  const sampleData = {
    'All Production Lines': {
      totalOrders: 156,
      completedOrders: 128,
      inProgressOrders: 18,
      delayedOrders: 8,
      qualityPassed: 125,
      qualityFailed: 3,
      overallEfficiency: 87.5,
      currentEfficiency: 89.2,
      monthGrowth: 12.3,
      oee: 78.4,
      defectRate: 2.1,
      maintenanceAlerts: 3,
      productionValue: 2450000,
      costSavings: 125000,
      rawMaterialStock: 85,
      finishedGoodsStock: 92,
      line1Efficiency: 89.2,
      line2Efficiency: 85.7,
      line3Efficiency: 91.1,
      line4Efficiency: 88.9
    },
    'Line 1 - Assembly': {
      totalOrders: 45,
      completedOrders: 38,
      inProgressOrders: 5,
      delayedOrders: 2,
      qualityPassed: 37,
      qualityFailed: 1,
      overallEfficiency: 89.2,
      currentEfficiency: 91.5,
      monthGrowth: 8.7,
      oee: 82.1,
      defectRate: 1.8,
      maintenanceAlerts: 1,
      productionValue: 720000,
      costSavings: 35000,
      rawMaterialStock: 88,
      finishedGoodsStock: 95,
      line1Efficiency: 91.5,
      line2Efficiency: 0,
      line3Efficiency: 0,
      line4Efficiency: 0
    },
    'Line 2 - Packaging': {
      totalOrders: 38,
      completedOrders: 32,
      inProgressOrders: 4,
      delayedOrders: 2,
      qualityPassed: 31,
      qualityFailed: 1,
      overallEfficiency: 85.7,
      currentEfficiency: 87.2,
      monthGrowth: 15.2,
      oee: 75.8,
      defectRate: 2.5,
      maintenanceAlerts: 2,
      productionValue: 580000,
      costSavings: 28000,
      rawMaterialStock: 82,
      finishedGoodsStock: 89,
      line1Efficiency: 0,
      line2Efficiency: 87.2,
      line3Efficiency: 0,
      line4Efficiency: 0
    },
    'Line 3 - Quality Control': {
      totalOrders: 35,
      completedOrders: 30,
      inProgressOrders: 3,
      delayedOrders: 2,
      qualityPassed: 29,
      qualityFailed: 1,
      overallEfficiency: 91.1,
      currentEfficiency: 93.4,
      monthGrowth: 18.9,
      oee: 85.2,
      defectRate: 1.2,
      maintenanceAlerts: 0,
      productionValue: 650000,
      costSavings: 42000,
      rawMaterialStock: 90,
      finishedGoodsStock: 96,
      line1Efficiency: 0,
      line2Efficiency: 0,
      line3Efficiency: 93.4,
      line4Efficiency: 0
    },
    'Line 4 - Finishing': {
      totalOrders: 38,
      completedOrders: 28,
      inProgressOrders: 6,
      delayedOrders: 2,
      qualityPassed: 28,
      qualityFailed: 0,
      overallEfficiency: 88.9,
      currentEfficiency: 86.7,
      monthGrowth: 5.4,
      oee: 79.1,
      defectRate: 2.8,
      maintenanceAlerts: 0,
      productionValue: 500000,
      costSavings: 20000,
      rawMaterialStock: 78,
      finishedGoodsStock: 88,
      line1Efficiency: 0,
      line2Efficiency: 0,
      line3Efficiency: 0,
      line4Efficiency: 86.7
    }
  };

  const [currentData, setCurrentData] = useState(sampleData['All Production Lines']);

  const productionLines = ['All Production Lines', 'Line 1 - Assembly', 'Line 2 - Packaging', 'Line 3 - Quality Control', 'Line 4 - Finishing'];

  const handleProductionLineChange = (line) => {
    setSelectedProductionLine(line);
    setCurrentData(sampleData[line] || sampleData['All Production Lines']);
  };

  // Chart data
  const efficiencyData = [
    { name: 'Line 1', efficiency: currentData.line1Efficiency, color: '#3B82F6' },
    { name: 'Line 2', efficiency: currentData.line2Efficiency, color: '#10B981' },
    { name: 'Line 3', efficiency: currentData.line3Efficiency, color: '#F59E0B' },
    { name: 'Line 4', efficiency: currentData.line4Efficiency, color: '#EF4444' }
  ].filter(item => item.efficiency > 0);

  const qualityData = [
    { name: 'Passed', value: currentData.qualityPassed, color: '#10B981' },
    { name: 'Failed', value: currentData.qualityFailed, color: '#EF4444' }
  ];

  const orderStatusData = [
    { name: 'Completed', value: currentData.completedOrders, color: '#10B981' },
    { name: 'In Progress', value: currentData.inProgressOrders, color: '#3B82F6' },
    { name: 'Delayed', value: currentData.delayedOrders, color: '#EF4444' }
  ];

  const monthlyTrendData = [
    { month: 'Jan', efficiency: 82, quality: 95, orders: 140 },
    { month: 'Feb', efficiency: 85, quality: 97, orders: 145 },
    { month: 'Mar', efficiency: 87, quality: 96, orders: 150 },
    { month: 'Apr', efficiency: 89, quality: 98, orders: 155 },
    { month: 'May', efficiency: 88, quality: 97, orders: 152 },
    { month: 'Jun', efficiency: 91, quality: 99, orders: 160 }
  ];

  const StatCard = ({ title, value, icon, color, description, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-50')}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '+' : ''}{trendValue}%
          </span>
          <span className="text-xs text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="px-6 pb-6 space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Production Line</label>
            <select
              value={selectedProductionLine}
              onChange={(e) => handleProductionLineChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {productionLines.map((line) => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                aria-label="Start date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                aria-label="End date"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              aria-pressed={showCharts}
            >
              <BarChart3 className="w-4 h-4" />
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Refresh dashboard data">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={currentData.totalOrders}
          icon={<Package className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
          description="All production orders"
        />
        <StatCard
          title="Completed Orders"
          value={currentData.completedOrders}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          description="Successfully completed"
        />
        <StatCard
          title="In Progress"
          value={currentData.inProgressOrders}
          icon={<Clock className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          description="Currently processing"
        />
        <StatCard
          title="Delayed Orders"
          value={currentData.delayedOrders}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="text-red-600"
          description="Behind schedule"
        />
        <StatCard
          title="Quality Passed"
          value={currentData.qualityPassed}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          description="Passed quality checks"
        />
        <StatCard
          title="Quality Failed"
          value={currentData.qualityFailed}
          icon={<XCircle className="w-6 h-6 text-red-600" />}
          color="text-red-600"
          description="Failed quality checks"
        />
        <StatCard
          title="Overall Efficiency"
          value={`${currentData.overallEfficiency}%`}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          description="Production efficiency"
          trend="up"
          trendValue={currentData.monthGrowth}
        />
        <StatCard
          title="OEE"
          value={`${currentData.oee}%`}
          icon={<Target className="w-6 h-6 text-purple-600" />}
          color="text-purple-600"
          description="Overall Equipment Effectiveness"
        />
      </div>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Line Efficiency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Production Line Efficiency
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quality Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Quality Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <PieChart
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </PieChart>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} name="Efficiency %" />
                <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} name="Quality %" />
                <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Order Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <PieChart
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </PieChart>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Production Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Financial Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Production Value</span>
              <span className="font-semibold text-green-600">₹{currentData.productionValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost Savings</span>
              <span className="font-semibold text-blue-600">₹{currentData.costSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Defect Rate</span>
              <span className="font-semibold text-red-600">{currentData.defectRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Inventory Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Raw Materials</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${currentData.rawMaterialStock}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-blue-600">{currentData.rawMaterialStock}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Finished Goods</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${currentData.finishedGoodsStock}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-green-600">{currentData.finishedGoodsStock}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            Maintenance Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Alerts</span>
              <span className="font-semibold text-red-600">{currentData.maintenanceAlerts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Next Maintenance</span>
              <span className="font-semibold text-blue-600">2 days</span>
            </div>
            <button 
              onClick={() => setActiveView('maintenance-orders')}
              className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              View Maintenance Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionHeadDashboard;
