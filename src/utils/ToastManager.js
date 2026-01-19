/**
 * ToastManager - OOP-based toast notification utility
 * Follows DRY principles and provides centralized toast management
 */
class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    if (typeof document !== 'undefined') {
      this.createContainer();
    }
  }

  /**
   * Create toast container element
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {number} duration - Auto-close duration in ms (default: 3000)
   */
  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {number} duration - Auto-close duration in ms (default: 5000)
   */
  error(message, duration = 5000) {
    this.show(message, 'error', duration);
  }

  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {number} duration - Auto-close duration in ms (default: 4000)
   */
  warning(message, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {number} duration - Auto-close duration in ms (default: 3000)
   */
  info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }

  /**
   * Core method to show toast
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Auto-close duration in ms
   */
  show(message, type = 'info', duration = 3000) {
    if (!this.container) {
      this.init();
    }

    const toast = this.createToastElement(message, type);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    setTimeout(() => {
      toast.classList.add('toast-visible');
    }, 10);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * Create toast element with styling
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   * @returns {HTMLElement} Toast element
   */
  createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.style.cssText = `
      background: white;
      border-left: 4px solid ${colors[type]};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px 20px;
      margin-bottom: 8px;
      max-width: 400px;
      transform: translateX(100%);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;

    toast.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${colors[type]};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        flex-shrink: 0;
      ">${icons[type]}</div>
      <div style="flex: 1; color: #374151;">${message}</div>
      <button class="toast-close-btn" style="
        background: none;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        margin-left: 8px;
        flex-shrink: 0;
      ">×</button>
    `;

    const closeButton = toast.querySelector('.toast-close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.remove(toast);
      });
    }

    return toast;
  }

  /**
   * Remove specific toast
   * @param {HTMLElement} toast - Toast element to remove
   */
  remove(toast) {
    if (toast && toast.parentElement) {
      toast.classList.add('toast-removing');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
          this.toasts.splice(index, 1);
        }
      }, 300);
    }
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(toast => this.remove(toast));
  }

  /**
   * Handle API errors with proper formatting
   * @param {Error|Object} error - Error object or API response
   */
  handleApiError(error) {
    let message = 'An unexpected error occurred';
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        message = errors.map(err => err.msg || err.message).join(', ');
      } else {
        message = Object.values(errors).join(', ');
      }
    } else if (error.message) {
      message = error.message;
    }

    this.error(message);
  }

  /**
   * Handle API success with proper formatting
   * @param {string} action - Action performed (e.g., 'created', 'updated', 'deleted')
   * @param {string} entity - Entity name (e.g., 'Lead', 'Customer')
   */
  handleApiSuccess(action, entity = 'Item') {
    const messages = {
      created: `${entity} created successfully`,
      updated: `${entity} updated successfully`,
      deleted: `${entity} deleted successfully`,
      imported: `${entity}s imported successfully`,
      saved: `${entity} saved successfully`
    };
    
    this.success(messages[action] || `${entity} ${action} successfully`);
  }
}

const toastManager = new ToastManager();

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .toast-visible {
      transform: translateX(0) !important;
    }
    .toast-removing {
      transform: translateX(100%) !important;
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}

export default toastManager;
