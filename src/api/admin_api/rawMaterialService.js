import apiClient from '../../utils/apiClient';

const RAW_MATERIAL_BASE = '/api/raw-materials';

export const rawMaterialService = {
  getAllRawMaterials: async () => {
    const response = await apiClient.get(`${RAW_MATERIAL_BASE}/rates`);
    return response.data;
  },

  updateRawMaterialRates: async (rates) => {
    const response = await apiClient.put(`${RAW_MATERIAL_BASE}/rates`, { rates });
    return response.data;
  },

  getCurrentRates: async () => {
    const response = await apiClient.get(`${RAW_MATERIAL_BASE}/rates`);
    return response.data;
  }
};

export default rawMaterialService;
