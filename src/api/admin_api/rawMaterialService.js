import apiClient from '../../utils/apiClient';

const RAW_MATERIAL_BASE = '/api/raw-materials';

export const rawMaterialService = {
  getAllRawMaterials: async () => {
    const response = await apiClient.get(`${RAW_MATERIAL_BASE}/rates`);
    return response.data;
  },

  /**
   * FIXED: Update raw material rates with partial update support
   * Only sends changed fields to prevent accidental overwrites
   */
  updateRawMaterialRates: async (rates) => {
    // Validate that rates is an object with at least one field
    if (!rates || typeof rates !== 'object' || Object.keys(rates).length === 0) {
      throw new Error('No valid rates provided for update');
    }
    
    console.log('Sending partial update:', rates);
    
    const response = await apiClient.put(`${RAW_MATERIAL_BASE}/rates`, { rates });
    return response.data;
  },

  getCurrentRates: async () => {
    const response = await apiClient.get(`${RAW_MATERIAL_BASE}/rates`);
    // Backend returns: { success: true, data: {...rates} }
    // We need to return the actual rates data
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }
};

export default rawMaterialService;
