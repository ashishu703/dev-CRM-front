import apiClient from '../../utils/apiClient';

const AAAC_BASE = '/api/aaac-calculator';

export const aaacCalculatorService = {
  // Get all products with calculations
  getAllProducts: async () => {
    const response = await apiClient.get(`${AAAC_BASE}/products`);
    return response.data;
  },

  // Get current variable prices
  getCurrentPrices: async () => {
    const response = await apiClient.get(`${AAAC_BASE}/prices`);
    return response.data;
  },

  // Update variable prices (Account department only)
  updatePrices: async (aluPrice, alloyPrice) => {
    const response = await apiClient.put(`${AAAC_BASE}/prices`, {
      alu_price_per_kg: aluPrice,
      alloy_price_per_kg: alloyPrice
    });
    return response.data;
  },

  // Calculate specific product
  calculateProduct: async (productName, diameter = null, noOfStrands = null) => {
    const response = await apiClient.post(`${AAAC_BASE}/calculate`, {
      product_name: productName,
      diameter: diameter,
      no_of_strands: noOfStrands
    });
    return response.data;
  }
};

export default aaacCalculatorService;
