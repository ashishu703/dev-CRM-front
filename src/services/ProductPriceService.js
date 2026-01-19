import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

class ProductPriceService {
  async getApprovedPrice(productSpec) {
    return apiClient.get(API_ENDPOINTS.PRODUCT_PRICE_GET(productSpec));
  }

  async createApprovedPrice(data) {
    return apiClient.post(API_ENDPOINTS.PRODUCT_PRICE_CREATE(), data);
  }
}

export default new ProductPriceService();
