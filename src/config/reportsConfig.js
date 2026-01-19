import {
  TrendingUp,
  Activity,
  ShoppingCart
} from 'lucide-react';

export const REPORT_TYPES = {
  SALES_PERFORMANCE: {
    id: 'sales-performance',
    title: 'Sales Performance Reports',
    description: 'Sales funnel, revenue and performance tracking. View sales by lead source, won vs lost deals, sales by product/region/salesperson, revenue forecast, and conversion rates.',
    icon: TrendingUp,
    color: 'blue',
    category: 'Sales',
    reportCount: 3,
    examples: [
      'Salesperson Performance Report',
      'Top Performer Comparison',
      'Revenue & Target Achievement'
    ]
  },
  ACTIVITY: {
    id: 'activity',
    title: 'Activity Reports',
    description: 'Monitor sales team daily and weekly activities. Track calls made, emails sent, meetings scheduled vs completed, and tasks completed per user.',
    icon: Activity,
    color: 'purple',
    category: 'Activity',
    reportCount: 3,
    examples: [
      'Salesperson Activity Report',
      'Date-wise Calls & Followups',
      'Activity Status Tracking'
    ]
  },
  ORDERS: {
    id: 'orders',
    title: 'Orders Report',
    description: 'View all orders (quotations with Proforma Invoices) salesperson-wise. Track order status, payment details, and delivery information with date-wise filtering.',
    icon: ShoppingCart,
    color: 'green',
    category: 'Orders',
    reportCount: 1,
    examples: [
      'Salesperson Orders Report',
      'Orders by Date Range',
      'Orders with Payment Status'
    ]
  }
};

export const getReportsByCategory = (category) => {
  return Object.values(REPORT_TYPES).filter(report => report.category === category);
};

export const getAllReports = () => {
  return Object.values(REPORT_TYPES);
};

export const getReportById = (id) => {
  const report = Object.values(REPORT_TYPES).find(report => report.id === id);
  return report || null;
};

