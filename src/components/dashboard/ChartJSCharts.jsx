import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Professional CRM color palette
const colors = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#14b8a6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280',
};

// Common chart options
const getCommonOptions = (isDarkMode = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        color: isDarkMode ? '#e5e7eb' : '#374151'
      }
    },
    tooltip: {
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      titleColor: isDarkMode ? '#f3f4f6' : '#111827',
      bodyColor: isDarkMode ? '#d1d5db' : '#374151',
      borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      boxPadding: 6
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        color: isDarkMode ? '#374151' : '#f3f4f6'
      },
      ticks: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        }
      }
    },
    y: {
      grid: {
        color: isDarkMode ? '#374151' : '#f3f4f6',
        drawBorder: false
      },
      ticks: {
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        }
      }
    }
  }
});

// 1. Quotation Trends - Line Chart
export const QuotationTrendsChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Quotation Amount',
        data: data?.values || [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: colors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      title: {
        display: false
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

// 2. Proforma Invoice Distribution - Donut Chart
export const ProformaInvoiceDistributionChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Draft', 'Sent', 'Approved', 'Cancelled'],
    datasets: [
      {
        data: data?.values || [15, 25, 40, 5],
        backgroundColor: [
          colors.gray,
          colors.info,
          colors.success,
          colors.danger
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff'
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    cutout: '70%',
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        ...getCommonOptions(isDarkMode).plugins.legend,
        position: 'bottom'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

// 3. Lead Sources - Donut Chart
export const LeadSourcesChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Website', 'Facebook Ads', 'WhatsApp', 'Referral', 'Direct Call'],
    datasets: [
      {
        data: data?.values || [35, 25, 20, 15, 5],
        backgroundColor: [
          colors.primary,
          colors.purple,
          colors.success,
          colors.warning,
          colors.info
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff'
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    cutout: '70%',
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        ...getCommonOptions(isDarkMode).plugins.legend,
        position: 'bottom'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

// 4. Weekly Leads Activity - Bar Chart
export const WeeklyLeadsActivityChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Leads',
        data: data?.values || [12, 19, 15, 25, 22, 18, 10],
        backgroundColor: colors.primary,
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        display: false
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// 5. Sales Order Progress - Funnel Chart (using Bar Chart)
export const SalesOrderProgressChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Created', 'Approved', 'Dispatched', 'Delivered'],
    datasets: [
      {
        label: 'Orders',
        data: data?.values || [100, 75, 50, 30],
        backgroundColor: [
          colors.primary,
          colors.info,
          colors.warning,
          colors.success
        ],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    indexAxis: 'y',
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        display: false
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// 6. Payments Trend - Area Chart (Line with fill)
export const PaymentsTrendChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Payment Collected',
        data: data?.values || [50000, 75000, 60000, 90000, 85000, 110000],
        borderColor: colors.success,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.success,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      title: {
        display: false
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

// 7. Payment Distribution - Pie Chart
export const PaymentDistributionChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Cash', 'UPI', 'Bank Transfer', 'Cheque'],
    datasets: [
      {
        data: data?.values || [30, 45, 20, 5],
        backgroundColor: [
          colors.success,
          colors.primary,
          colors.info,
          colors.warning
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff'
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        ...getCommonOptions(isDarkMode).plugins.legend,
        position: 'bottom'
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};

// 8. Payment Due Ratio - Donut Chart
export const PaymentDueRatioChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: ['Paid', 'Due'],
    datasets: [
      {
        data: data?.values || [75, 25],
        backgroundColor: [colors.success, colors.warning],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff'
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    cutout: '75%',
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        ...getCommonOptions(isDarkMode).plugins.legend,
        position: 'bottom'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

// 9. Monthly Revenue Trend - Line Chart with Gradient
export const MonthlyRevenueTrendChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: data?.values || [200000, 250000, 220000, 300000, 280000, 350000],
        borderColor: colors.success,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: colors.success,
        pointBorderColor: '#fff',
        pointBorderWidth: 3
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      title: {
        display: false
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

// 10. Revenue Distribution - Donut Chart
export const RevenueDistributionChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Product A', 'Product B', 'Product C', 'Service'],
    datasets: [
      {
        data: data?.values || [40, 30, 20, 10],
        backgroundColor: [
          colors.primary,
          colors.success,
          colors.warning,
          colors.info
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff'
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    cutout: '70%',
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        ...getCommonOptions(isDarkMode).plugins.legend,
        position: 'bottom'
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

// 11. Lead Conversion Funnel - Bar Chart (Horizontal)
export const LeadConversionFunnelChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Leads', 'Qualified', 'Proposal', 'Closed'],
    datasets: [
      {
        label: 'Count',
        data: data?.values || [1000, 600, 300, 150],
        backgroundColor: [
          colors.primary,
          colors.info,
          colors.warning,
          colors.success
        ],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    indexAxis: 'y',
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      legend: {
        display: false
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

// 12. Sales vs Target - Bar Chart
export const SalesVsTargetChart = ({ data, isDarkMode = false }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Actual',
        data: data?.actual || [200000, 250000, 220000, 300000, 280000, 350000],
        backgroundColor: colors.success,
        borderRadius: 6
      },
      {
        label: 'Target',
        data: data?.target || [250000, 250000, 250000, 300000, 300000, 350000],
        backgroundColor: colors.primary,
        borderRadius: 6
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    plugins: {
      ...getCommonOptions(isDarkMode).plugins
    }
  };

  return <Bar data={chartData} options={options} />;
};

// 13. Outstanding Payment Aging - Stacked Bar Chart (Enhanced with gradients, rounded corners, insights)
export const OutstandingPaymentAgingChart = ({ data, isDarkMode = false }) => {
  // Calculate percentage change for 60+ days (last 2 months)
  const calculateOverdueChange = () => {
    if (!data?.days60Plus || data.days60Plus.length < 2) return 0;
    const recent = data.days60Plus[data.days60Plus.length - 1] || 0;
    const previous = data.days60Plus[data.days60Plus.length - 2] || 0;
    if (previous === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - previous) / previous) * 100);
  };

  // Calculate overdue ratio
  const calculateOverdueRatio = () => {
    if (!data) return 0;
    const total = (data.days0_30 || []).reduce((a, b) => a + b, 0) +
                  (data.days31_60 || []).reduce((a, b) => a + b, 0) +
                  (data.days60Plus || []).reduce((a, b) => a + b, 0);
    const overdue = (data.days60Plus || []).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round((overdue / total) * 100);
  };

  const overdueChange = calculateOverdueChange();
  const overdueRatio = calculateOverdueRatio();

  // Create gradient functions for each dataset
  const createGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '0-30 Days',
        data: data?.days0_30 || [50000, 60000, 55000, 70000, 65000, 80000],
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          return createGradient(ctx, 'rgba(34, 197, 94, 0.7)', 'rgba(34, 197, 94, 0.9)');
        },
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: false
      },
      {
        label: '31-60 Days',
        data: data?.days31_60 || [30000, 35000, 30000, 40000, 35000, 45000],
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          return createGradient(ctx, 'rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 1)');
        },
        borderRadius: 0,
        borderSkipped: false
      },
      {
        label: '60+ Days',
        data: data?.days60Plus || [20000, 25000, 20000, 30000, 25000, 35000],
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          return createGradient(ctx, 'rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 1)');
        },
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false
      }
    ]
  };

  const options = {
    ...getCommonOptions(isDarkMode),
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      ...getCommonOptions(isDarkMode).plugins,
      tooltip: {
        ...getCommonOptions(isDarkMode).plugins.tooltip,
        callbacks: {
          title: (items) => {
            return `Month: ${items[0].label}`;
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            
            let tooltipText = `${label}: ₹${value.toLocaleString('en-IN')}`;
            
            if (label === '60+ Days') {
              tooltipText += ' ⚠️';
            }
            
            return tooltipText;
          },
          footer: (items) => {
            if (!items || items.length === 0) return '';
            const monthIndex = items[0].dataIndex;
            const chart = items[0].chart;
            const monthTotal = chart.data.datasets.reduce((sum, dataset) => {
              return sum + (dataset.data[monthIndex] || 0);
            }, 0);
            return `Total Outstanding: ₹${monthTotal.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      ...getCommonOptions(isDarkMode).scales,
      x: {
        ...getCommonOptions(isDarkMode).scales.x,
        stacked: true
      },
      y: {
        ...getCommonOptions(isDarkMode).scales.y,
        stacked: true
      }
    }
  };

  return (
    <div className="relative">
      {/* Insight Layer */}
      {overdueChange !== 0 && (
        <div className={`mb-4 p-3 rounded-lg border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-700/50 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">
              Overdue (60+ days) {overdueChange > 0 ? 'increased' : 'decreased'} by {Math.abs(overdueChange)}% in last 2 months
            </span>
          </div>
        </div>
      )}
      
      {/* KPI Badge */}
      <div className="absolute top-0 right-0 z-10">
        <div className={`px-3 py-1.5 rounded-lg shadow-md ${
          isDarkMode 
            ? overdueRatio > 20 
              ? 'bg-red-900/80 text-red-200 border border-red-700' 
              : overdueRatio > 10 
              ? 'bg-orange-900/80 text-orange-200 border border-orange-700'
              : 'bg-green-900/80 text-green-200 border border-green-700'
            : overdueRatio > 20 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : overdueRatio > 10 
            ? 'bg-orange-100 text-orange-700 border border-orange-300'
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          <span className="text-xs font-semibold">Overdue Ratio: {overdueRatio}%</span>
        </div>
      </div>

      <Bar data={chartData} options={options} />
    </div>
  );
};

