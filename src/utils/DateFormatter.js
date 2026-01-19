/**
 * DateFormatter utility class for consistent date formatting across the application.
 * Follows OOP principles and DRY to centralize date formatting logic.
 */
class DateFormatter {
  /**
   * Formats a date string to Indian locale format (DD MMM YYYY)
   * @param {string|Date} dateInput - Date string or Date object
   * @returns {string} Formatted date string
   */
  static formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'N/A';
    }
  }

  /**
   * Formats a date string to Indian locale format with time (DD MMM YYYY, HH:mm)
   * @param {string|Date} dateInput - Date string or Date object
   * @param {string} timeStr - Optional time string (HH:mm format)
   * @returns {string} Formatted date-time string
   */
  static formatDateTime(dateInput, timeStr = null) {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      
      if (timeStr) {
        const [hh, mm] = String(timeStr).split(':');
        date.setHours(Number(hh || 0), Number(mm || 0), 0, 0);
      }
      
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date-time:', error);
      return 'N/A';
    }
  }

  /**
   * Formats a date string to short format (DD MMM)
   * @param {string|Date} dateInput - Date string or Date object
   * @returns {string} Formatted date string
   */
  static formatDateShort(dateInput) {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
      });
    } catch (error) {
      console.warn('Error formatting short date:', error);
      return 'N/A';
    }
  }

  /**
   * Formats a date string to ISO format (YYYY-MM-DD)
   * @param {string|Date} dateInput - Date string or Date object
   * @returns {string} ISO formatted date string
   */
  static formatDateISO(dateInput) {
    if (!dateInput) return '';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error formatting ISO date:', error);
      return '';
    }
  }
}

export default DateFormatter;

