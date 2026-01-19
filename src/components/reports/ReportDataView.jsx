import React from 'react';
import { X, Download, RefreshCw, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

class ReportDataView {
  constructor({ title, data, loading, error, onClose, onRefresh, onExport }) {
    this.title = title;
    this.data = data;
    this.loading = loading;
    this.error = error;
    this.onClose = onClose;
    this.onRefresh = onRefresh;
    this.onExport = onExport;
  }

  render() {
    const { title, data, loading, error, onClose, onRefresh, onExport } = this;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                disabled={loading || !data}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Export"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {this.renderContent()}
        </div>
      </div>
    );
  }

  renderContent() {
    const { loading, error, data } = this;

    if (loading) {
      return this.renderLoading();
    }

    if (error) {
      return this.renderError(error);
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderEmpty();
    }

    return this.renderData(data);
  }

  renderLoading() {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  renderError(error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold mb-2">Error loading report</p>
          <p className="text-gray-600 text-sm">{error.message || 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  renderEmpty() {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">No data available</p>
          <p className="text-gray-500 text-sm mt-1">Try selecting a different date range or filter</p>
        </div>
      </div>
    );
  }

  renderData(data) {
    if (data.type === 'table') {
      return this.renderTable(data);
    }

    if (data.type === 'chart') {
      return this.renderChart(data);
    }

    if (data.type === 'summary') {
      return this.renderSummary(data);
    }

    return this.renderDefault(data);
  }

  renderTable(data) {
    const { columns, rows } = data;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderChart(data) {
    return (
      <div className="space-y-6">
        {data.charts && data.charts.map((chart, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">Chart visualization will be rendered here</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderSummary(data) {
    const { metrics } = data;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics && metrics.map((metric, index) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-700">{metric.label}</p>
              {this.renderTrendIcon(metric.trend)}
            </div>
            <p className="text-3xl font-bold text-blue-900">{metric.value}</p>
            {metric.change && (
              <p className={`text-sm mt-2 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% from last period
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  renderTrendIcon(trend) {
    const trendMap = {
      up: <TrendingUp className="w-5 h-5 text-green-600" />,
      down: <TrendingDown className="w-5 h-5 text-red-600" />,
      neutral: <Minus className="w-5 h-5 text-gray-600" />
    };

    return trendMap[trend] || null;
  }

  renderDefault(data) {
    return (
      <div className="space-y-4">
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }
}

const ReportDataViewComponent = ({ title, data, loading, error, onClose, onRefresh, onExport }) => {
  const view = new ReportDataView({ title, data, loading, error, onClose, onRefresh, onExport });
  return view.render();
};

export default ReportDataViewComponent;

