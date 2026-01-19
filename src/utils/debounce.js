/**
 * Debounce utility for performance optimization
 * Delays function execution until after a specified time has passed
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility for performance optimization
 * Limits function execution to once per specified time period
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Chunk processing utility for large arrays
 * Processes array in chunks to prevent UI blocking
 */
export async function processInChunks(array, chunkSize = 100, processor) {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
    
    // Yield to UI thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return results;
}

