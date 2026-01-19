import React from 'react'
import { X, Eye, Package, Send, Trash2 } from 'lucide-react'
import { QuotationHelper } from '../../utils/QuotationHelper'
import { PDFDownloader } from '../../utils/PDFDownloader'
import Toast from '../../utils/Toast'

export default function CustomerDetailModal({ 
  customer, onClose, onEdit, onQuotation, quotations, 
  onViewQuotation, onSendQuotation, onDeleteQuotation, 
  onViewPI, quotationPIs, piHook 
}) {
  if (!customer) return null

  const isApprovedQuotation = QuotationHelper.isApproved
  const isPaymentCompleted = QuotationHelper.isPaymentCompleted

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><strong>Name:</strong> {customer.name}</div>
            <div><strong>Phone:</strong> {customer.phone}</div>
            <div><strong>Email:</strong> {customer.email}</div>
            <div><strong>Business:</strong> {customer.business}</div>
            <div><strong>Address:</strong> {customer.address}</div>
            <div><strong>State:</strong> {customer.state}</div>
            <div><strong>GST No:</strong> {customer.gstNo}</div>
            <div><strong>Type:</strong> {customer.customerType}</div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quotations</h3>
              <button onClick={() => onQuotation(customer)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Package className="h-4 w-4" /> Create Quotation
              </button>
            </div>
            <div className="space-y-2">
              {quotations.filter(q => q.customerId === customer.id).map((quotation, index) => (
                <div key={quotation.id || index} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{quotation.quotationNumber}</div>
                    <div className="text-sm text-gray-500">{quotation.quotationDate}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${quotation.status === 'approved' ? 'bg-green-100 text-green-800' : quotation.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {quotation.status || 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onViewQuotation(quotation)} className="p-1 text-blue-600 hover:text-blue-700"><Eye className="h-4 w-4" /></button>
                    {quotation.status !== 'approved' && <button onClick={() => onSendQuotation(quotation)} className="p-1 text-green-600 hover:text-green-700"><Send className="h-4 w-4" /></button>}
                    {isApprovedQuotation(quotation) && !isPaymentCompleted(quotation) && (
                      <button onClick={() => {}} className="p-1 text-purple-600 hover:text-purple-700"><Package className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => onDeleteQuotation(quotation)} className="p-1 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onEdit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Edit</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  )
}
