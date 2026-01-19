import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Filter, X } from 'lucide-react';
import ReportDataView from '../../components/reports/ReportDataView';
import ReportService from '../../services/ReportService';
import { getReportById, getAllReports } from '../../config/reportsConfig';
import { useAuth } from '../../hooks/useAuth';
import SalespersonReportsPage from './SalespersonReportsPage';
import OrdersReport from './OrdersReport';

class DetailedReportController {
  constructor(reportId) {
    this.reportId = reportId;
    this.state = {
      reportData: null,
      loading: false,
      error: null,
      dateRange: {
        startDate: this.getDefaultStartDate(),
        endDate: this.getDefaultEndDate()
      },
      filters: {},
      selectedSubReport: null
    };
  }

  getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  getDefaultEndDate() {
    return new Date().toISOString().split('T')[0];
  }

  async loadReportData(params = {}) {
    this.state.loading = true;
    this.state.error = null;

    const report = getReportById(this.reportId);
    if (!report) {
      this.state.error = { message: 'Report not found' };
      this.state.loading = false;
      return;
    }

    const requestParams = {
      ...this.state.dateRange,
      ...this.state.filters,
      ...params
    };

    const methodMap = {
      'sales-performance': 'fetchSalesReport',
      'leads-pipeline': 'fetchLeadsReport',
      'activity': 'fetchActivityReport',
      'revenue-financial': 'fetchRevenueReport',
      'forecasting': 'fetchForecastReport',
      'custom-analytical': 'fetchCustomReport',
      'dashboard': 'fetchDashboardReport',
      'organisation': 'fetchOrganisationReport',
      'call': 'fetchCallReport'
    };

    const method = methodMap[this.reportId];
    if (!method) {
      this.state.error = { message: 'Report method not found' };
      this.state.loading = false;
      return;
    }

    try {
      let data;
      if (this.reportId === 'custom-analytical') {
        data = await ReportService[method]('analytical', requestParams);
      } else {
        data = await ReportService[method](requestParams);
      }

      this.state.reportData = this.transformReportData(data, this.reportId);
    } catch (error) {
      this.state.error = {
        message: error.response?.data?.message || error.message || 'Failed to load report data'
      };
    } finally {
      this.state.loading = false;
    }
  }

  transformReportData(data, reportId) {
    if (!data) {
      return null;
    }

    if (data.type) {
      return data;
    }

    if (Array.isArray(data)) {
      return {
        type: 'table',
        columns: Object.keys(data[0] || {}),
        rows: data.map(item => Object.values(item))
      };
    }

    if (data.metrics) {
      return {
        type: 'summary',
        metrics: data.metrics
      };
    }

    return {
      type: 'default',
      raw: data
    };
  }

  handleRefresh() {
    this.loadReportData();
  }

  handleDateRangeChange(startDate, endDate) {
    this.state.dateRange = { startDate, endDate };
    this.loadReportData();
  }

  handleExport() {
    const { reportData } = this.state;
    if (!reportData) {
      return;
    }

    const report = getReportById(this.reportId);
    const filename = `${report?.title || 'report'}_${new Date().toISOString().split('T')[0]}.json`;
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

const DetailedReportPage = ({ activeView, setActiveView }) => {
  const { user } = useAuth();
  const reportId = activeView?.startsWith('detailed-report-') ? activeView.replace('detailed-report-', '') : null;
  const [controller] = useState(() => {
    if (reportId) {
      return new DetailedReportController(reportId);
    }
    return null;
  });
  const [state, setState] = useState(controller?.state || {
    reportData: null,
    loading: false,
    error: null,
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    filters: {},
    selectedSubReport: null
  });
  const [showFilters, setShowFilters] = useState(false);

  const updateState = useCallback((updates) => {
    if (controller) {
      Object.assign(controller.state, updates);
      setState({ ...controller.state });
    }
  }, [controller]);

  useEffect(() => {
    const isAuthorized = user?.role === 'superadmin' || 
                        (user?.role === 'department_head' && user?.departmentType === 'sales');
    
    if (!isAuthorized && setActiveView) {
      setActiveView('dashboard');
      return;
    }

    if (reportId && controller) {
      controller.loadReportData().then(() => {
        updateState({});
      });
    }
  }, [reportId, user, setActiveView, controller, updateState]);

  const handleRefresh = useCallback(async () => {
    await controller.handleRefresh();
    updateState({});
  }, [controller, updateState]);

  const handleExport = useCallback(() => {
    controller.handleExport();
  }, [controller]);

  const handleDateRangeChange = useCallback((startDate, endDate) => {
    controller.handleDateRangeChange(startDate, endDate);
    updateState({});
  }, [controller, updateState]);

  const handleBack = useCallback(() => {
    if (setActiveView) {
      setActiveView('reports');
    }
  }, [setActiveView]);

  const reportConfig = reportId ? getReportById(reportId) : null;

  // Show salesperson reports page for activity and sales-performance
  if (reportId === 'activity' || reportId === 'sales-performance') {
    return (
      <SalespersonReportsPage
        reportType={reportId === 'activity' ? 'activity' : reportId === 'sales-performance' ? 'performance' : null}
        onBack={handleBack}
      />
    );
  }

  // Show orders report
  if (reportId === 'orders') {
    return <OrdersReport />;
  }

  if (!reportId || !reportConfig) {
    return (
      <div className="h-full bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Report not found</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{reportConfig.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{reportConfig.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Date Range</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={state.dateRange.startDate}
                  onChange={(e) => handleDateRangeChange(e.target.value, state.dateRange.endDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={state.dateRange.endDate}
                  onChange={(e) => handleDateRangeChange(state.dateRange.startDate, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ReportDataView
              title={reportConfig.title}
              data={state.reportData}
              loading={state.loading}
              error={state.error}
              onRefresh={handleRefresh}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedReportPage;

