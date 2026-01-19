import React, { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, Award, ArrowLeft, Search, ShoppingCart } from 'lucide-react';
import SalespersonActivityReport from './SalespersonActivityReport';
import SalespersonPerformanceReport from './SalespersonPerformanceReport';
import TopPerformerComparisonReport from './TopPerformerComparisonReport';
import OrdersReport from './OrdersReport';
import reportService from '../../api/admin_api/reportService';

/**
 * Main Salesperson Reports Page
 * Provides interface to select and view different salesperson reports
 */
const SalespersonReportsPage = ({ reportType, onBack }) => {
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState(reportType || 'select');

  useEffect(() => {
    fetchSalespersons();
  }, []);

  const fetchSalespersons = async () => {
    setLoading(true);
    try {
      const data = await reportService.getSalespersonsList();
      setSalespersons(data.salespersons || []);
    } catch (error) {
      console.error('Error fetching salespersons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (type, salesperson = null) => {
    setSelectedSalesperson(salesperson);
    setCurrentView(type);
  };

  const handleBack = () => {
    if (currentView !== 'select') {
      setCurrentView('select');
      setSelectedSalesperson(null);
    } else if (onBack) {
      onBack();
    }
  };

  const filteredSalespersons = salespersons.filter(sp => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (sp.username || '').toLowerCase().includes(search) ||
      (sp.email || '').toLowerCase().includes(search) ||
      (sp.name || '').toLowerCase().includes(search)
    );
  });

  // Render specific report view
  if (currentView === 'activity' && selectedSalesperson) {
    return (
      <SalespersonActivityReport
        salespersonUsername={selectedSalesperson}
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'performance' && selectedSalesperson) {
    return (
      <SalespersonPerformanceReport
        salespersonUsername={selectedSalesperson}
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'top-performers') {
    return (
      <TopPerformerComparisonReport
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'orders') {
    return (
      <OrdersReport />
    );
  }

  // Main selection view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Salesperson Reports</h1>
          <p className="text-gray-600">View detailed reports for salesperson activities, performance, and comparisons</p>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => handleReportSelect('top-performers')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 text-yellow-600" />
              <span className="text-sm text-gray-500">No selection needed</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Top Performer Comparison</h3>
            <p className="text-gray-600 text-sm">
              Compare all salespersons, analyze performance metrics, and identify top performers
            </p>
          </div>

          <div
            onClick={() => {
              const firstSp = filteredSalespersons[0];
              if (firstSp) {
                handleReportSelect('activity', firstSp.username || firstSp.email);
              }
            }}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-10 h-10 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Select salesperson</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Report</h3>
            <p className="text-gray-600 text-sm">
              View date-wise calls, followup status, sales status, remarks, address, division, state, and requirements
            </p>
          </div>

          <div
            onClick={() => {
              const firstSp = filteredSalespersons[0];
              if (firstSp) {
                handleReportSelect('performance', firstSp.username || firstSp.email);
              }
            }}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Select salesperson</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Report</h3>
            <p className="text-gray-600 text-sm">
              View total assigned leads, followup leads, converted, revenue, quotations, products, payments, targets, and achievements
            </p>
          </div>

          <div
            onClick={() => handleReportSelect('orders')}
            className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-10 h-10 text-green-600" />
              <span className="text-sm text-gray-500">No selection needed</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Orders Report</h3>
            <p className="text-gray-600 text-sm">
              View all orders (quotations with PIs) salesperson-wise with date filtering, payment status, and delivery details
            </p>
          </div>
        </div>

        {/* Salesperson Selection for Activity and Performance Reports */}
        {(currentView === 'select' || !currentView) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Salesperson for Activity or Performance Report
              </h3>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, username, or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading salespersons...</p>
              </div>
            ) : filteredSalespersons.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No salespersons found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSalespersons.map((sp) => (
                  <div
                    key={sp.id || sp.username || sp.email}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {sp.name || sp.username || sp.email}
                      </h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {sp.username && <p>Username: {sp.username}</p>}
                      {sp.email && <p>Email: {sp.email}</p>}
                      {sp.department_type && <p>Dept: {sp.department_type}</p>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleReportSelect('activity', sp.username || sp.email)}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Activity
                      </button>
                      <button
                        onClick={() => handleReportSelect('performance', sp.username || sp.email)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Performance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalespersonReportsPage;

