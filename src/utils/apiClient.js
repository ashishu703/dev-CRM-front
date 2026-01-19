import CacheBuster from './cacheBuster';

class ApiClient {
  constructor() {
    // In development, use relative URLs to leverage Vite proxy (avoids CORS)
    // In production or when explicitly set, use full URLs
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    // If no explicit API URL is set in dev, use relative URLs (proxy will handle it)
    // Otherwise, use the configured URL
    if (!apiBaseUrl && isDevelopment) {
      this.baseURL = ''; // Empty means relative URLs - will use Vite proxy
    } else if (apiBaseUrl && apiBaseUrl.includes('http')) {
      this.baseURL = apiBaseUrl.replace(/\/api.*$/, '');
    } else {
      this.baseURL = ''; // Default to relative URLs
    }
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Set authentication token in localStorage
   */
  setAuthToken(token) {
    
    try { sessionStorage.setItem('authToken', token); } catch {}
    localStorage.removeItem('token');
    localStorage.setItem('authToken', token);
  }

  /**
   * Completely clear authentication artifacts from both storage scopes
   */
  clearStoredAuth() {
    try {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('impersonating');
      sessionStorage.removeItem('user');
    } catch (_) {}

    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // Legacy key used by older components
    localStorage.removeItem('user');
  }

  /**
   * Remove authentication token from storage (wrapper maintained for backwards compatibility)
   */
  removeAuthToken() {
    this.clearStoredAuth();
  }

  /**
   * Get headers with authentication token if available
   */
  getHeaders() {
    // Prefer session token (per-tab) if available, fallback to localStorage
    const token = sessionStorage.getItem('authToken') || this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Handle API response and errors
   */
  async handleResponse(response) {
    // Gracefully handle empty bodies and non-JSON
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    let data = null;
    if (response.status === 204 || contentLength === '0') {
      data = {};
    } else if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }
    } else {
      try {
        const text = await response.text();
        data = text ? { message: text } : {};
      } catch (_) {
        data = {};
      }
    }
    
    if (!response.ok) {
      // Extract error message from response - check both 'error' and 'message' fields
      const errorMessage = data.error || data.message || 'An error occurred';

      // If authentication failed (expired / invalid token), proactively clear stored auth
      if (response.status === 401 && errorMessage.toLowerCase().includes('not authorized')) {
        this.clearStoredAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
          if (!window.location.pathname.toLowerCase().includes('login')) {
            window.location.href = '/login';
          }
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.message = errorMessage; // Ensure message is set
      throw error;
    }
    
    return data;
  }

  /**
   * Make HTTP request
   */
  async request(url, options = {}) {
    try {
      // Validate URL parameter
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided to API request');
      }

      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      // Use relative URLs for proxy (when baseURL is empty), or full URLs if baseURL is set
      // If URL already starts with http, use it as-is
      // If baseURL is empty, use relative URL (Vite proxy will handle it)
      // Otherwise, prepend baseURL
      const fullUrl = url.startsWith('http') 
        ? url 
        : (this.baseURL ? `${this.baseURL}${url}` : url);
      const response = await fetch(fullUrl, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * GET request with automatic cache busting
   * @param {string} url - API endpoint URL
   * @param {boolean} useCacheBusting - Whether to add cache busting (default: true)
   * @returns {Promise} - API response
   */
  async get(url, useCacheBusting = true) {
    // Apply global cache busting utility (DRY principle)
    if (useCacheBusting) {
      url = CacheBuster.addCacheBuster(url, true);
    }
    return this.request(url, { method: 'GET' });
  }

  /**
   * PUT request
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(url, data = {}) {
    return this.request(url, {
      method: 'DELETE',
      body: Object.keys(data).length > 0 ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * POST FormData request
   */
  async postFormData(url, formData) {
    try {
      // Validate URL parameter
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided to postFormData request');
      }

      const token = sessionStorage.getItem('authToken') || this.getAuthToken();
      const fullUrl = url.startsWith('http') 
        ? url 
        : (this.baseURL ? `${this.baseURL}${url}` : url);
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Do NOT set Content-Type for FormData; browser sets boundary
        },
        body: formData,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Request Error (postFormData):', error);
      throw error;
    }
  }

  async putFormData(url, formData) {
    try {
      // Validate URL parameter
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided to putFormData request');
      }

      const token = sessionStorage.getItem('authToken') || this.getAuthToken();
      const fullUrl = url.startsWith('http') 
        ? url 
        : (this.baseURL ? `${this.baseURL}${url}` : url);
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Do NOT set Content-Type for FormData; browser sets boundary
        },
        body: formData,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API Request Error (putFormData):', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }
}

// Export singleton instance
export default new ApiClient();
