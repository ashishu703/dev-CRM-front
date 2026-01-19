/**
 * CSV Export Utility
 * Converts data to CSV format and downloads
 * Uses DRY principle
 */
class CSVExport {
  /**
   * Convert array of objects to CSV string
   * @param {Array} data - Array of objects
   * @param {Array} headers - Array of header objects {key, label}
   * @returns {string} CSV string
   */
  static toCSV(data, headers) {
    if (!data || data.length === 0) {
      return '';
    }

    // Create header row
    const headerRow = headers.map(h => this.escapeCSV(h.label || h.key)).join(',');
    
    // Create data rows
    const dataRows = data.map(row => {
      return headers.map(h => {
        const value = this.getNestedValue(row, h.key);
        return this.escapeCSV(value);
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to get value from
   * @param {string} path - Dot notation path (e.g., 'customer.name')
   * @returns {any} Value or empty string
   */
  static getNestedValue(obj, path) {
    if (!path) return '';
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '';
      }
    }
    return value !== null && value !== undefined ? String(value) : '';
  }

  /**
   * Escape CSV value (handles commas, quotes, newlines)
   * @param {string} value - Value to escape
   * @returns {string} Escaped value
   */
  static escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Download CSV file
   * @param {string} csvContent - CSV string content
   * @param {string} filename - Filename (without extension)
   */
  static download(csvContent, filename = 'export') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export data to CSV and download
   * @param {Array} data - Array of objects
   * @param {Array} headers - Array of header objects
   * @param {string} filename - Filename
   */
  static export(data, headers, filename) {
    const csv = this.toCSV(data, headers);
    this.download(csv, filename);
  }
}

/**
 * Simple export function for array of objects
 * Automatically generates headers from object keys
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename (without extension)
 */
export function exportToCSV(data, filename = 'export') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Generate headers from first object keys
  const headers = Object.keys(data[0]).map(key => ({
    key,
    label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));

  CSVExport.export(data, headers, filename);
}

export default CSVExport;

