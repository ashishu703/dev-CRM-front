/**
 * Global Cache Busting Utility
 * Provides cache-busting functionality for API calls across the application
 * DRY Principle: Single source of truth for cache busting
 */

class CacheBuster {
  /**
   * Add cache busting parameter to URL
   * @param {string} url - Original URL
   * @param {boolean} forceRefresh - Force refresh even if cache is valid (default: true)
   * @returns {string} - URL with cache busting parameter
   */
  static addCacheBuster(url, forceRefresh = true) {
    if (!url || typeof url !== 'string') {
      return url;
    }

    // If URL already has query parameters, append with &, otherwise use ?
    const separator = url.includes('?') ? '&' : '?';
    
    // Use timestamp for cache busting
    const timestamp = forceRefresh ? Date.now() : this.getCacheTimestamp();
    
    return `${url}${separator}_t=${timestamp}`;
  }

  /**
   * Get cache timestamp (can be used for conditional cache busting)
   * @returns {number} - Current timestamp
   */
  static getCacheTimestamp() {
    return Date.now();
  }

  /**
   * Check if URL needs cache busting based on cache age
   * @param {number} cacheAge - Cache age in milliseconds
   * @param {number} maxAge - Maximum cache age in milliseconds (default: 5 minutes)
   * @returns {boolean} - True if cache should be busted
   */
  static shouldBustCache(cacheAge, maxAge = 5 * 60 * 1000) {
    return cacheAge > maxAge;
  }
}

export default CacheBuster;

