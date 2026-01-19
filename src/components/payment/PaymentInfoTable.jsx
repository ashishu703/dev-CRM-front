import React from 'react';
import { 
  Search, Filter, Download, User, DollarSign, Clock, Calendar, Link, Copy, Eye, 
  MoreHorizontal, CreditCard, AlertCircle, CheckCircle, XCircle, ChevronDown, 
  Edit, Package, FileText, RotateCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';

/**
 * Reusable PaymentInfoTable Component
 * Uses DRY principle and OOP concepts
 */
class PaymentInfoTable {
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static getStatusColor(status) {
    const statusMap = {
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Advance': 'bg-purple-100 text-purple-800 border-purple-200',
      'Due': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Rejected': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  static getStatusIcon(status) {
    const iconMap = {
      'Paid': CheckCircle,
      'Advance': Clock,
      'Due': XCircle,
      'Pending': Clock,
      'Rejected': XCircle
    };
    return iconMap[status] || AlertCircle;
  }

  static calculateStats(payments) {
    // Group payments by quotation_id to avoid counting same quotation multiple times
    // One quotation can have multiple payment installments, but should be counted once
    const quotationMap = new Map();
    
    payments.forEach(payment => {
      // Use quotation_id if available, otherwise use quotationId as fallback
      const quotationKey = payment.quotationIdRaw || payment.quotationId || payment.id;
      
      if (!quotationMap.has(quotationKey)) {
        quotationMap.set(quotationKey, {
          quotationId: quotationKey,
          quotationTotal: Number(payment.quotationTotal || payment.totalAmount || 0),
          quotationTotalPaid: Number(payment.quotationTotalPaid || payment.paidAmount || 0),
          quotationRemainingDue: Number(payment.quotationRemainingDue || payment.dueAmount || 0),
          status: payment.status || '',
          paymentCount: 0
        });
      }
      
      // Update with latest values (in case different installments have different totals)
      const quotation = quotationMap.get(quotationKey);
      quotation.quotationTotal = Math.max(quotation.quotationTotal, Number(payment.quotationTotal || payment.totalAmount || 0));
      quotation.quotationTotalPaid = Math.max(quotation.quotationTotalPaid, Number(payment.quotationTotalPaid || payment.paidAmount || 0));
      quotation.quotationRemainingDue = Math.max(quotation.quotationRemainingDue, Number(payment.quotationRemainingDue || payment.dueAmount || 0));
      quotation.paymentCount += 1;
      
      // Update status based on latest payment status
      if (payment.status && payment.status !== 'Rejected') {
        if (payment.status === 'Paid') {
          quotation.status = 'Paid';
        } else if (payment.status === 'Advance' && quotation.status !== 'Paid') {
          quotation.status = 'Advance';
        } else if (payment.status === 'Due' && quotation.status !== 'Paid' && quotation.status !== 'Advance') {
          quotation.status = 'Due';
        }
      }
    });
    
    // Convert map to array for counting
    const uniqueQuotations = Array.from(quotationMap.values());
    
    // Count unique quotations with due amount > 0 (not individual payments)
    const dueQuotations = uniqueQuotations.filter(q => {
      const dueAmount = Number(q.quotationRemainingDue || 0);
      const status = q.status || '';
      // Count if there's a due amount and status is not 'Paid' or 'Rejected'
      return dueAmount > 0 && status !== 'Paid' && status !== 'Rejected';
    });
    
    // Count unique quotations by status
    const paidQuotations = uniqueQuotations.filter(q => q.status === 'Paid').length;
    const advanceQuotations = uniqueQuotations.filter(q => q.status === 'Advance').length;
    const rejectedQuotations = uniqueQuotations.filter(q => q.status === 'Rejected').length;
    
    return {
      allPayments: payments.length, // Total payment installments
      totalValue: payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
      paid: paidQuotations, // Unique quotations that are fully paid
      advance: advanceQuotations, // Unique quotations with advance payments
      due: dueQuotations.length, // Unique quotations with due amount
      rejected: rejectedQuotations // Unique quotations that are rejected
    };
  }
}

export default PaymentInfoTable;

