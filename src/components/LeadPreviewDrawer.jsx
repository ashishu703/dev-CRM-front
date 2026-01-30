import React from 'react';
import { X, RefreshCw, FileText } from 'lucide-react';

const LeadPreviewDrawer = ({
  isOpen,
  onClose,
  previewLead,
  loadingQuotations,
  quotations,
  proformaInvoices,
  isValueAssigned,
  onViewQuotation,
  onDownloadPDF,
  onApproveQuotation,
  onRejectQuotation,
  onViewPI,
  onApprovePI,
  onRejectPI
}) => {
  if (!isOpen || !previewLead) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_verification':
      case 'pending':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'sent':
        return 'text-blue-600';
      case 'accepted':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_verification':
      case 'pending':
        return 'Pending Verification';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'sent':
        return 'Sent';
      case 'accepted':
        return 'Accepted';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex z-50">
      <div className="bg-white h-full w-full max-w-md ml-auto shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Lead Details - {previewLead.customerId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 md:px-5 py-4 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Customer Details</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Customer Name</label>
                <p className="text-gray-900 font-semibold">{previewLead.customer}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Business</label>
                <p className="text-gray-900 font-semibold">{previewLead.business || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Address</label>
                <p className="text-gray-900 font-semibold">{previewLead.address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">State</label>
                <p className="text-gray-900 font-semibold">{previewLead.state || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Sales Status</label>
                <p className="text-gray-900 font-semibold">{previewLead.salesStatus}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Follow Up Status</label>
                <p className="text-gray-900 font-semibold">{previewLead.followUpStatus || previewLead.telecallerStatus || 'N/A'}</p>
                {previewLead.followUpRemark && (
                  <p className="text-xs text-gray-600 italic mt-0.5">"{previewLead.followUpRemark}"</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Assigned Salesperson</label>
                <p className="text-gray-900 font-semibold">{isValueAssigned(previewLead.assignedSalesperson) ? previewLead.assignedSalesperson : 'Unassigned'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Assigned Telecaller</label>
                <p className="text-gray-900 font-semibold">{isValueAssigned(previewLead.assignedTelecaller) ? previewLead.assignedTelecaller : 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Payment & Quotation</h3>
            {loadingQuotations ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading quotations...</span>
              </div>
            ) : quotations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No quotations found for this lead</p>
                <p className="text-xs text-gray-400 mt-1">Quotations will appear here once created</p>
              </div>
            ) : (
              quotations.map((quotation) => (
                <div key={quotation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {getStatusLabel(quotation.status)} Quotation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Quotation #{quotation.quotation_number}</p>
                        <p className="text-xs text-gray-600">
                          {quotation.customer_name} - {quotation.customer_business}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${getStatusColor(quotation.status)}`}>
                          {formatCurrency(quotation.total_amount)} - {getStatusLabel(quotation.status)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Valid Until: {formatDate(quotation.valid_until)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Prepared by: {quotation.created_by}
                      </p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onViewQuotation(quotation.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                        >
                          View Quotation
                        </button>
                        <button 
                          onClick={() => onDownloadPDF(quotation.id)}
                          className="px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-xs"
                        >
                          Download PDF
                        </button>
                        {/* Quotation approval is not required anymore (pricing decided upstream) */}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const quotationPIs = proformaInvoices.filter(pi => pi.quotation_id === quotation.id);
                    if (quotationPIs.length === 0) return null;

                    return (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Proforma Invoices:</p>
                        <div className="space-y-2">
                          {quotationPIs.map((pi) => (
                            <div key={pi.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-900">{pi.pi_number}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(pi.created_at).toLocaleDateString()} • ₹{Number(pi.total_amount || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    pi.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    pi.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    pi.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {pi.status === 'approved' ? '✅ Approved' :
                                     pi.status === 'rejected' ? '❌ Rejected' :
                                     pi.status === 'pending_approval' ? '⏳ Pending' :
                                     '📄 ' + (pi.status || 'Draft')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onViewPI(pi.id)}
                                    className="text-blue-600 text-xs hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                                  >
                                    View
                                  </button>
                                  {pi.status === 'pending_approval' && (
                                    <>
                                      <button
                                        onClick={() => onApprovePI(pi.id)}
                                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => onRejectPI(pi.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadPreviewDrawer;

