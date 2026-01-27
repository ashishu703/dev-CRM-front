import apiClient from '../../utils/apiClient';

const ACSR_BASE = '/api/acsr-calculator';

export const acsrCalculatorService = {
  getAllProducts: async () => {
    const response = await apiClient.get(`${ACSR_BASE}/products`);
    return response.data;
  },

  getCurrentRates: async () => {
    const response = await apiClient.get(`${ACSR_BASE}/rates`);
    return response.data;
  },

  updateRates: async (aluminiumCgRate, aluminiumEcRate, steelRate) => {
    const response = await apiClient.put(`${ACSR_BASE}/rates`, {
      aluminium_cg_grade: aluminiumCgRate,
      aluminium_ec_grade: aluminiumEcRate,
      steel_rate: steelRate
    });
    return response.data;
  },

  calculateProduct: async (productName, customData = null) => {
    const response = await apiClient.post(`${ACSR_BASE}/calculate`, {
      product_name: productName,
      custom_data: customData
    });
    return response.data;
  }
};

export default acsrCalculatorService;
