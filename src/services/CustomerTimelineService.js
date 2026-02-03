import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';
import quotationService from '../api/admin_api/quotationService';
import proformaInvoiceService from '../api/admin_api/proformaInvoiceService';
import DateFormatter from '../utils/DateFormatter';

/**
 * Service class for fetching and aggregating customer timeline data.
 * Follows OOP principles and DRY to centralize timeline data fetching logic.
 */
class CustomerTimelineService {
  /**
   * Fetches all timeline data for a lead including:
   * - Follow-up history
   * - All quotations
   * - All PIs grouped by quotation
   * - Payment data and summary
   * 
   * @param {number|string} leadId - The lead ID
   * @returns {Promise<Object>} Timeline data object
   */
  async getTimelineData(leadId) {
    try {
      // Fetch all data in parallel where possible
      const [historyRes, quotationsRes, leadRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.SALESPERSON_LEAD_HISTORY(leadId)),
        quotationService.getQuotationsByCustomer(leadId),
        apiClient.get(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(leadId)).catch(() => ({ status: 'rejected' }))
      ]);

      const history = historyRes.status === 'fulfilled' 
        ? (historyRes.value?.data?.data || historyRes.value?.data || [])
        : [];

      const quotations = quotationsRes.status === 'fulfilled'
        ? (quotationsRes.value?.data || [])
        : [];

      // Extract transfer information from lead data
      const leadData = leadRes.status === 'fulfilled' 
        ? (leadRes.value?.data?.data || leadRes.value?.data || {})
        : {};
      
      const transferInfo = {
        transferredFrom: leadData.transferred_from || leadData.transferredFrom || null,
        transferredTo: leadData.transferred_to || leadData.transferredTo || null,
        transferredAt: leadData.transferred_at || leadData.transferredAt || null,
        transferReason: leadData.transfer_reason || leadData.transferReason || null
      };

      // Fetch PIs for all quotations
      const pisByQuotationId = {};
      const piPromises = quotations.map(async (q) => {
        try {
          const piRes = await proformaInvoiceService.getPIsByQuotation(q.id);
          const pis = piRes?.data || [];
          pisByQuotationId[q.id] = pis;
        } catch (error) {
          console.warn(`Failed to fetch PIs for quotation ${q.id}:`, error);
          pisByQuotationId[q.id] = [];
        }
      });
      await Promise.allSettled(piPromises);

      // Filter quotations to only those that have at least one PI
      const quotationsWithPI = quotations.filter(q => {
        const pis = pisByQuotationId[q.id] || [];
        return pis.length > 0;
      });

      // Fetch payments and summary for quotations that have PIs
      const payments = [];
      let paymentSummary = null;

      // Get payments from quotations that have PIs, with PI and quotation info
      const paymentPromises = quotationsWithPI.map(async (q) => {
        try {
          const payRes = await apiClient.get(`/api/payments/quotation/${q.id}`);
          const pays = payRes?.data || [];
          // Enrich payments with quotation and PI info
          return pays.map(pay => ({
            ...pay,
            quotation_id: q.id,
            quotation_number: q.quotation_number || `QT-${String(q.id).slice(-4)}`,
            pi_id: pay.pi_id,
            pi_number: pay.pi_id ? (pisByQuotationId[q.id]?.find(pi => pi.id === pay.pi_id)?.pi_number || `PI-${String(pay.pi_id).slice(-4)}`) : null
          }));
        } catch (error) {
          console.warn(`Failed to fetch payments for quotation ${q.id}:`, error);
          return [];
        }
      });
      const paymentResults = await Promise.allSettled(paymentPromises);
      paymentResults.forEach(result => {
        if (result.status === 'fulfilled') {
          payments.push(...result.value);
        }
      });

      // Aggregate payment summary from all quotations that have PIs
      if (quotationsWithPI.length > 0) {
        const summaryPromises = quotationsWithPI.map(async (q) => {
          try {
            const sumRes = await apiClient.get(`/api/quotations/${q.id}/summary`);
            return sumRes?.data || null;
          } catch (error) {
            console.warn(`Failed to fetch payment summary for quotation ${q.id}:`, error);
            return null;
          }
        });
        
        const summaries = await Promise.allSettled(summaryPromises);
        const validSummaries = summaries
          .filter(s => s.status === 'fulfilled' && s.value !== null)
          .map(s => s.value);

        if (validSummaries.length > 0) {
          // Aggregate totals from all quotations with PIs (only approved payments count)
          let total = 0;
          let paid = 0;
          let remaining = 0;

          validSummaries.forEach(summary => {
            total += Number(summary.total || 0);
            paid += Number(summary.paid || 0);
            remaining += Number(summary.remaining || 0);
          });

          // Determine overall approval status
          let approvalStatus = 'pending';
          if (paid === 0 && remaining > 0) {
            approvalStatus = 'pending';
          } else if (paid > 0 && remaining > 0) {
            approvalStatus = 'partial';
          } else if (paid > 0 && remaining === 0) {
            approvalStatus = 'completed';
          }

          paymentSummary = {
            total,
            paid,
            remaining,
            approvalStatus
          };
        }
      }

      // Fetch order cancel requests for this lead/customer
      let cancelRequests = [];
      try {
        const cancelRes = await apiClient.get(API_ENDPOINTS.ORDER_CANCEL_BY_CUSTOMER(leadId));
        cancelRequests = cancelRes?.data || [];
      } catch (error) {
        console.warn('Failed to fetch cancel requests:', error);
      }

      return {
        history,
        quotations,
        pisByQuotationId,
        payments: payments.sort((a, b) => 
          new Date(b.payment_date || 0) - new Date(a.payment_date || 0)
        ),
        paymentSummary,
        transferInfo,
        cancelRequests
      };
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      throw error;
    }
  }

  /**
   * Formats date and time in Indian locale format.
   * Delegates to DateFormatter utility class (DRY principle).
   * 
   * @param {string} dateStr - Date string
   * @param {string} timeStr - Time string (HH:mm format)
   * @param {string} createdAt - Fallback created_at timestamp
   * @returns {string} Formatted date-time string
   */
  formatIndianDateTime(dateStr, timeStr, createdAt) {
    const dateInput = dateStr || createdAt;
    if (!dateInput) return '';
    return DateFormatter.formatDateTime(dateInput, timeStr);
  }
}

// Export singleton instance
const customerTimelineService = new CustomerTimelineService();
export default customerTimelineService;

