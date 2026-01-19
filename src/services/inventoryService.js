import apiClient from '../utils/apiClient';

const INVENTORY_BASE = '/api/inventory';

class InventoryService {
  async getItems(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(`${INVENTORY_BASE}/items?${query.toString()}`);
  }

  async getItemById(id) {
    return apiClient.get(`${INVENTORY_BASE}/items/${id}`);
  }

  async createItem(data) {
    return apiClient.post(`${INVENTORY_BASE}/items`, data);
  }

  async updateItem(id, data) {
    return apiClient.put(`${INVENTORY_BASE}/items/${id}`, data);
  }

  async deleteItem(id) {
    return apiClient.delete(`${INVENTORY_BASE}/items/${id}`);
  }

  async getItemHistory(id, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(`${INVENTORY_BASE}/items/${id}/history?${query.toString()}`);
  }

  async getCategories(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(`${INVENTORY_BASE}/categories?${query.toString()}`);
  }

  async getCategoryTree() {
    return apiClient.get(`${INVENTORY_BASE}/categories/tree`);
  }

  async createCategory(data) {
    return apiClient.post(`${INVENTORY_BASE}/categories`, data);
  }

  async updateCategory(id, data) {
    return apiClient.put(`${INVENTORY_BASE}/categories/${id}`, data);
  }

  async deleteCategory(id) {
    return apiClient.delete(`${INVENTORY_BASE}/categories/${id}`);
  }

  async getUOMs(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(`${INVENTORY_BASE}/uom?${query.toString()}`);
  }

  async getAllUOMs() {
    return apiClient.get(`${INVENTORY_BASE}/uom/all`);
  }

  async createUOM(data) {
    return apiClient.post(`${INVENTORY_BASE}/uom`, data);
  }

  async updateUOM(id, data) {
    return apiClient.put(`${INVENTORY_BASE}/uom/${id}`, data);
  }

  async deleteUOM(id) {
    return apiClient.delete(`${INVENTORY_BASE}/uom/${id}`);
  }

  async setDefaultUOM(id) {
    return apiClient.put(`${INVENTORY_BASE}/uom/${id}/set-default`);
  }

  async getStores(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(`${INVENTORY_BASE}/stores?${query.toString()}`);
  }

  async getStoreById(id) {
    return apiClient.get(`${INVENTORY_BASE}/stores/${id}`);
  }

  async getAllStores() {
    return apiClient.get(`${INVENTORY_BASE}/stores/all`);
  }

  async createStore(data) {
    return apiClient.post(`${INVENTORY_BASE}/stores`, data);
  }

  async updateStore(id, data) {
    return apiClient.put(`${INVENTORY_BASE}/stores/${id}`, data);
  }

  async deleteStore(id) {
    return apiClient.delete(`${INVENTORY_BASE}/stores/${id}`);
  }

  async updateStock(itemId, data) {
    return apiClient.put(`${INVENTORY_BASE}/stock/${itemId}`, data);
  }

  async batchUpdateStock(updates) {
    return apiClient.put(`${INVENTORY_BASE}/stock/batch`, { updates });
  }

  async transferStock(data) {
    return apiClient.post(`${INVENTORY_BASE}/stock/transfer`, data);
  }

  async getStockUpdates(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(`${INVENTORY_BASE}/stock-updates?${query.toString()}`);
  }
}

export default new InventoryService();

