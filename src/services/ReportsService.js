import apiClient from '../utils/apiClient';

class ReportsService {
  /**
   * Get monthly stats for current user
   */
  static async getMonthlyStats(month) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    
    const response = await apiClient.get(`/api/reports/monthly-stats?${params}`);
    return response.data;
  }

  /**
   * Get team summary for sales department head
   */
  static async getTeamSummary(month) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    
    const response = await apiClient.get(`/api/reports/team-summary?${params}`);
    return response.data;
  }

  /**
   * Get salesperson ledger (customer-wise)
   */
  static async getSalespersonLedger(month, salespersonId = null) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (salespersonId) params.append('salespersonId', salespersonId);
    
    const response = await apiClient.get(`/api/reports/salesperson-ledger?${params}`);
    return response.data;
  }

  /**
   * Get customer ledger
   */
  static async getCustomerLedger(customerId) {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    
    const response = await apiClient.get(`/api/reports/customer-ledger?${params}`);
    return response.data;
  }
}

export default ReportsService;
