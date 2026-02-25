import React, { useState, useEffect } from 'react';
import { useMonth } from '../../context/MonthContext';
import ReportsService from '../../services/ReportsService';
import MonthSelector from '../../components/MonthSelector';

const PaymentApprovalQueue = () => {
  const { selectedMonth, monthDisplay } = useMonth();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, [selectedMonth]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would need a new API endpoint for pending payments
      // For now, we'll simulate with existing data
      const response = await ReportsService.getCustomerLedger(null);
      
      if (response.success) {
        // Filter for pending payments from ledger data
        const pending = [];
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(customerLedger => {
            if (customerLedger.ledger) {
              customerLedger.ledger.forEach(entry => {
                if (entry.approval_status === 'pending' && entry.entry_type === 'PAYMENT') {
                  pending.push({
                    ...entry,
                    customer_name: customerLedger.customer_name || 'Unknown Customer',
                    customer_id: customerLedger.customer_id
                  });
                }
              });
            }
          });
        }
        
        setPendingPayments(pending);
      } else {
        setError(response.message || 'Failed to fetch pending payments');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payment) => {
    if (!payment) return;
    
    setProcessing(true);
    try {
      // This would call an approval API
      // For now, we'll simulate the approval
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update local state to reflect approval
      setPendingPayments(prev => 
        prev.filter(p => p.id !== payment.id)
      );
      
      setSelectedPayment(null);
    } catch (err) {
      setError('Failed to approve payment: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (payment) => {
    if (!payment) return;
    
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    setProcessing(true);
    try {
      // This would call a rejection API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update local state to reflect rejection
      setPendingPayments(prev => 
        prev.filter(p => p.id !== payment.id)
      );
      
      setSelectedPayment(null);
    } catch (err) {
      setError('Failed to reject payment: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getTotalPendingAmount = () => {
    return pendingPayments.reduce((sum, payment) => 
      sum + Number(payment.amount || 0), 0
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 h-16 bg-gray-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button 
            onClick={fetchPendingPayments}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Approval Queue</h1>
          <p className="text-gray-600">Approve or reject pending payments for {monthDisplay}</p>
        </div>
        <MonthSelector />
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-600">Pending Payments</div>
            <div className="text-2xl font-bold text-orange-600">
              {pendingPayments.length}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalPendingAmount())}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Status</div>
            <div className="text-2xl font-bold text-green-600">
              Ready for Review
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
        </div>
        
        {pendingPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending payments for this month
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPayments.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_date || new Date(payment.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.customer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {payment.customer_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.quotation_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleApprove(payment)}
                          disabled={processing}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(payment)}
                          disabled={processing}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedPayment.customer_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 text-sm font-medium text-blue-600">
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedPayment.payment_date || new Date(selectedPayment.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedPayment.payment_method || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedPayment.quotation_number || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedPayment.remarks || '-'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprove(selectedPayment)}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Approve Payment'}
                </button>
                <button
                  onClick={() => handleReject(selectedPayment)}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentApprovalQueue;
