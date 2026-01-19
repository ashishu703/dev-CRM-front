import toastManager from './ToastManager';

/**
 * ApiErrorHandler - OOP-based API error handling utility
 * Follows DRY principles and provides centralized error management
 */
class ApiErrorHandler {
  constructor() {
    this.errorMessages = {
      NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
      TIMEOUT_ERROR: 'Request timed out. Please try again.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      SERVER_ERROR: 'Server error occurred. Please try again later.',
      UNAUTHORIZED: 'You are not authorized to perform this action.',
      FORBIDDEN: 'Access denied. Please contact administrator.',
      NOT_FOUND: 'The requested resource was not found.',
      CONFLICT: 'A conflict occurred. Please refresh and try again.'
    };
  }

  /**
   * Handle API response errors
   * @param {Object} error - Error object from API call
   * @param {string} context - Context of the error (e.g., 'creating lead', 'updating customer')
   * @returns {Object} Processed error information
   */
  handleError(error, context = 'operation') {
    const errorInfo = this.analyzeError(error);
    this.showErrorNotification(errorInfo, context);
    return errorInfo;
  }

  /**
   * Analyze error and extract meaningful information
   * @param {Object} error - Error object
   * @returns {Object} Analyzed error information
   */
  analyzeError(error) {
    const errorInfo = {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: null,
      statusCode: null,
      fieldErrors: []
    };

    // Handle different error structures
    if (error.response) {
      // Axios response error
      errorInfo.statusCode = error.response.status;
      errorInfo.type = this.getErrorType(error.response.status);
      
      const data = error.response.data;
      if (data) {
        if (data.message) {
          errorInfo.message = data.message;
        } else if (data.errors && Array.isArray(data.errors)) {
          errorInfo.fieldErrors = data.errors;
          errorInfo.message = this.formatFieldErrors(data.errors);
        } else if (typeof data === 'string') {
          errorInfo.message = data;
        }
      }
    } else if (error.request) {
      // Network error
      errorInfo.type = 'NETWORK_ERROR';
      errorInfo.message = this.errorMessages.NETWORK_ERROR;
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      errorInfo.type = 'TIMEOUT_ERROR';
      errorInfo.message = this.errorMessages.TIMEOUT_ERROR;
    } else if (error.message) {
      // Generic error
      errorInfo.message = error.message;
    }

    return errorInfo;
  }

  /**
   * Get error type based on status code
   * @param {number} statusCode - HTTP status code
   * @returns {string} Error type
   */
  getErrorType(statusCode) {
    const statusMap = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'SERVER_ERROR',
      502: 'SERVER_ERROR',
      503: 'SERVER_ERROR'
    };
    
    return statusMap[statusCode] || 'UNKNOWN_ERROR';
  }

  /**
   * Format field validation errors
   * @param {Array} errors - Array of field errors
   * @returns {string} Formatted error message
   */
  formatFieldErrors(errors) {
    if (!Array.isArray(errors)) return 'Validation failed';
    
    const fieldMessages = errors.map(err => {
      if (err.path && err.msg) {
        return `${err.path}: ${err.msg}`;
      }
      return err.msg || err.message || 'Invalid value';
    });
    
    return fieldMessages.join(', ');
  }

  /**
   * Show error notification using toast manager
   * @param {Object} errorInfo - Analyzed error information
   * @param {string} context - Context of the error
   */
  showErrorNotification(errorInfo, context) {
    let message = errorInfo.message;
    
    // Add context if not already included
    if (context && !message.toLowerCase().includes(context.toLowerCase())) {
      message = `Failed to ${context}: ${message}`;
    }
    
    // Show appropriate toast based on error type
    switch (errorInfo.type) {
      case 'VALIDATION_ERROR':
        toastManager.warning(message);
        break;
      case 'UNAUTHORIZED':
      case 'FORBIDDEN':
        toastManager.error(message);
        break;
      case 'NETWORK_ERROR':
      case 'TIMEOUT_ERROR':
        toastManager.error(message);
        break;
      default:
        toastManager.error(message);
    }
  }

  /**
   * Handle success responses
   * @param {Object} response - API response
   * @param {string} action - Action performed
   * @param {string} entity - Entity name
   */
  handleSuccess(response, action, entity = 'Item') {
    toastManager.handleApiSuccess(action, entity);
  }

  /**
   * Create a wrapper for API calls with error handling
   * @param {Function} apiCall - API call function
   * @param {string} context - Context for error messages
   * @param {string} successAction - Success action name
   * @param {string} entity - Entity name
   * @returns {Promise} Wrapped API call
   */
  wrapApiCall(apiCall, context, successAction, entity = 'Item') {
    return async (...args) => {
      try {
        const response = await apiCall(...args);
        this.handleSuccess(response, successAction, entity);
        return response;
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }

  /**
   * Handle bulk operations with detailed error reporting
   * @param {Array} results - Array of operation results
   * @param {string} operation - Operation name
   * @param {string} entity - Entity name
   */
  handleBulkResults(results, operation, entity = 'Items') {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    if (failed === 0) {
      toastManager.success(`All ${entity.toLowerCase()} ${operation} successfully`);
    } else if (successful === 0) {
      toastManager.error(`Failed to ${operation} any ${entity.toLowerCase()}`);
    } else {
      toastManager.warning(`${successful} ${entity.toLowerCase()} ${operation} successfully, ${failed} failed`);
    }
  }
}

// Create singleton instance
const apiErrorHandler = new ApiErrorHandler();

export default apiErrorHandler;
