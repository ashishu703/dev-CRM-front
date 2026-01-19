import React from 'react';
import ColorfulPieChart from './ColorfulPieChart';

const BusinessMetrics = ({ quotations, proformaInvoices, payments }) => {
  
  const quotationChartDataAll = [
    { label: 'Approved', value: quotations?.approved ?? 0, color: '#10b981' },
    { label: 'Pending', value: quotations?.pending ?? 0, color: '#f59e0b' },
    { label: 'Rejected', value: quotations?.rejected ?? 0, color: '#ef4444' }
  ];
  const quotationChartData = quotationChartDataAll.filter(item => item.value > 0);

 
  const piChartDataAll = [
    { label: 'Approved', value: proformaInvoices?.approved ?? 0, color: '#10b981' },
    { label: 'Pending', value: proformaInvoices?.pending ?? 0, color: '#f59e0b' },
    { label: 'Rejected', value: proformaInvoices?.rejected ?? 0, color: '#ef4444' }
  ];
  const piChartData = piChartDataAll.filter(item => item.value > 0);


  const totalReceived = payments?.totalReceived ?? 0;
  const totalAdvance = payments?.totalAdvance ?? 0;
  const duePayment = payments?.duePayment ?? 0;
  
  const paymentChartData = [
    { label: 'Total Received', value: totalReceived, color: '#10b981' },
    { label: 'Due Payment', value: duePayment, color: '#ef4444' }
  ].filter(item => item.value > 0);
  
  const paymentChartDataAll = [
    { label: 'Total Received', value: totalReceived, color: '#10b981' },
    { label: 'Advance Payment', value: totalAdvance, color: '#3b82f6' },
    { label: 'Due Payment', value: duePayment, color: '#ef4444' }
  ];

  const quotationTotal = quotations?.total ?? 0;
  const piTotal = proformaInvoices?.total ?? 0;
  const paymentTotal = totalReceived + duePayment;
  
  const quotationChartTotal = quotationChartData.length > 0 
    ? quotationChartData.reduce((sum, item) => sum + item.value, 0)
    : quotationTotal;
  const piChartTotal = piChartData.length > 0
    ? piChartData.reduce((sum, item) => sum + item.value, 0)
    : piTotal;
  const paymentChartTotal = paymentChartData.length > 0
    ? paymentChartData.reduce((sum, item) => sum + item.value, 0)
    : paymentTotal;

  // Format large numbers for display
  const formatAmount = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Business Metrics</h3>
        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Track your quotations, PIs, payments, and orders</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ColorfulPieChart
          title="Quotations"
          data={quotationChartData}
          allData={quotationChartDataAll}
          total={quotationChartTotal || quotationTotal}
        />
        <ColorfulPieChart
          title="Proforma Invoices"
          data={piChartData}
          allData={piChartDataAll}
          total={piChartTotal || piTotal}
        />
        <ColorfulPieChart
          title="Payments Overview"
          data={paymentChartData}
          allData={paymentChartDataAll}
          total={paymentChartTotal || paymentTotal}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total Quotation</div>
          <div className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{quotations?.total ?? 0}</div>
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>All quotations created</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total PI</div>
          <div className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{proformaInvoices?.total ?? 0}</div>
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>All proforma invoices</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total Sale Order</div>
          <div className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{payments?.totalSaleOrder ?? 0}</div>
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Leads with advance payment</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total Received Payment</div>
          <div className="text-xl font-bold text-gray-800 mb-1 break-words" style={{ fontFamily: 'Inter, sans-serif' }}>{formatAmount(payments?.totalReceived ?? 0)}</div>
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Total payments received</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Due Payment</div>
          <div className="text-xl font-bold text-gray-800 mb-1 break-words" style={{ fontFamily: 'Inter, sans-serif' }}>{formatAmount(payments?.duePayment ?? 0)}</div>
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Pending payment amount</div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetrics;

