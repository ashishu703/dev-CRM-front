import toastManager from './ToastManager';

export const downloadCSVTemplate = () => {
  const headers = [
    'Customer Name',
    'Mobile Number', 
    'WhatsApp Number',
    'Email',
    'Address',
    'GST Number',
    'Business Name',
    'Business Category',
    'Lead Source',
    'Product Names (comma separated)',
    'Assigned Salesperson',
    'Assigned Telecaller',
    'State',
    'Division',
    'Date (DD/MM/YYYY or YYYY-MM-DD)'
  ];
  
  // Demo data as provided by user for Marketing Department Head
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    '"saurabh jhariya","9876549874","9876547564","jhariya@gmail.com","right town jabalpur","23FDGT546GF54","samriddhi","business","social media","acsr","NA","NA","MP","jabalpur","06/12/2025"'
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'leads_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toastManager.success('CSV template downloaded successfully');
};

export const parseCSV = (csvText) => {
  if (!csvText || !csvText.trim()) return [];
  
  const parseCSVRows = (text) => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < text.length) {
      const char = text[i];
      const nextChar = i < text.length - 1 ? text[i + 1] : null;
      
      if (char === '"') {
        if (inQuotes) {
          if (nextChar === '"') {
            currentField += '"';
            i += 2;
            continue;
          } else if (nextChar === ',' || nextChar === '\r' || nextChar === '\n' || nextChar === null) {
            inQuotes = false;
            i++;
            continue;
          }
        } else {
          inQuotes = true;
          i++;
          continue;
        }
      }
      
      if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      }
      
      if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
        
        if (currentField !== '' || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        }
        continue;
      }
      
      currentField += char;
      i++;
    }
    
    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  };
  
  // Parse CSV into rows
  const rawRows = parseCSVRows(csvText);
  if (rawRows.length === 0) return [];
  
  // First row is headers
  const headerRow = rawRows[0];
  const headers = headerRow.map(h => h.trim());
  
  const headerMap = {
    'customer name': 'Customer Name',
    'mobile number': 'Mobile Number',
    'whatsapp number': 'WhatsApp Number',
    'email': 'Email',
    'address': 'Address',
    'gst number': 'GST Number',
    'business name': 'Business Name',
    'lead source': 'Lead Source',
    'business category': 'Business Category',
    'category': 'Category',
    'state': 'State',
    'division': 'Division',
    'date (dd/mm/yyyy or yyyy-mm-dd)': 'Date (DD/MM/YYYY or YYYY-MM-DD)',
    'date (yyyy-mm-dd)': 'Date (DD/MM/YYYY or YYYY-MM-DD)',
    'date (dd/mm/yyyy)': 'Date (DD/MM/YYYY or YYYY-MM-DD)',
    'date': 'Date (DD/MM/YYYY or YYYY-MM-DD)',
    'assigned salesperson': 'Assigned Salesperson',
    'assigned telecaller': 'Assigned Telecaller',
    'product names (comma separated)': 'Product Names (comma separated)',
    'product names': 'Product Names'
  };
  
  const normalizedHeaders = headers.map(h => {
    const lower = h.toLowerCase().trim();
    return headerMap[lower] || h;
  });
  
  const expectedColumnCount = normalizedHeaders.length;
  const data = [];
  const seenPhones = new Set();
  const isBlank = (v) => {
    const s = (v || '').toString().trim().toLowerCase();
    return s === '' || s === 'n/a' || /^-+$/.test(s);
  };
  
  const trimField = (value, maxLength = 100) => {
    if (!value || typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
  };
  
  const getMaxLength = (header) => {
    if (header === 'Customer Name' || header === 'Business Name') return 100;
    if (header === 'Address') return 1000;
    if (header === 'Email') return 255;
    if (header === 'Mobile Number' || header === 'WhatsApp Number') return 10;
    if (header === 'State' || header === 'Division' || header === 'Lead Source' || header === 'Business Category' || header === 'Category') return 100;
    if (header === 'GST Number') return 50;
    if (header === 'Product Names (comma separated)') return 500;
    return 255;
  };
  
  for (let i = 1; i < rawRows.length; i++) {
    try {
      const values = rawRows[i];
      
      if (values.length !== expectedColumnCount) {
        console.warn(`Row ${i + 1}: Column count mismatch (expected ${expectedColumnCount}, found ${values.length}). Skipping row.`);
        continue;
      }
      
      const row = {};
      let hasValidData = false;
      
      normalizedHeaders.forEach((header, index) => {
        const value = trimField((values[index] || '').trim(), getMaxLength(header));
        row[header] = value;
        if (!isBlank(value)) {
          hasValidData = true;
        }
      });
      
      if (!hasValidData) {
        continue;
      }
      
      const phone = row['Mobile Number'] || '';
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits && phoneDigits.length === 10) {
        if (seenPhones.has(phoneDigits)) {
          console.warn(`Row ${i + 1}: Duplicate phone number ${phoneDigits}. Skipping row.`);
          continue;
        }
        seenPhones.add(phoneDigits);
      }
      
      const name = row['Customer Name'] || '';
      const mobile = row['Mobile Number'] || '';
      if (isBlank(name) && isBlank(mobile)) {
        continue;
      }
      
      data.push(row);
    } catch (error) {
      console.warn(`Row ${i + 1}: Error processing row - ${error.message}. Skipping row.`);
      continue;
    }
  }
  
  return data;
};

export const formatDate = (dateString) => {
  if (!dateString || !dateString.trim()) {
    return new Date().toISOString().split('T')[0];
  }
  
  const trimmed = dateString.trim().toUpperCase();
  if (trimmed === 'NA' || trimmed === 'N/A' || trimmed === '-') {
    return new Date().toISOString().split('T')[0];
  }
  
  // Try DD/MM/YYYY format first
  const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const ddmmyyyyMatch = dateString.trim().match(ddmmyyyyRegex);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    // Validate date
    const dateObj = new Date(`${year}-${month}-${day}`);
    if (dateObj.getFullYear() == year && dateObj.getMonth() + 1 == parseInt(month) && dateObj.getDate() == parseInt(day)) {
      return `${year}-${month}-${day}`;
    }
  }
  
  // Try YYYY-MM-DD format
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY format
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
        // YYYY-MM-DD format
        return dateString;
      }
    }
  }
  
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('Invalid date format:', dateString);
  }
  
  return new Date().toISOString().split('T')[0];
};

export const exportToExcel = (leads, filename = 'leads_export') => {
  if (!leads || leads.length === 0) {
    toastManager.error('No data to export');
    return;
  }

  const headers = [
    'Customer Name',
    'Phone',
    'Email',
    'Business',
    'Address',
    'State',
    'GST Number',
    'Product Type',
    'Lead Source',
    'Customer Type',
    'Sales Status',
    'Follow Up Status',
    'Assigned Salesperson',
    'Assigned Telecaller',
    'Date',
    'Created At'
  ];

  // Escape CSV values (handles commas, quotes, newlines)
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV content
  const rows = leads.map(lead => [
    escapeCSV(lead.customer || lead.name || 'N/A'),
    escapeCSV(lead.phone || 'N/A'),
    escapeCSV(lead.email || 'N/A'),
    escapeCSV(lead.business || 'N/A'),
    escapeCSV(lead.address || 'N/A'),
    escapeCSV(lead.state || 'N/A'),
    escapeCSV(lead.gst_no || lead.gstNo || 'N/A'),
    escapeCSV(lead.product_names || lead.productNames || lead.product_type || 'N/A'),
    escapeCSV(lead.lead_source || lead.leadSource || 'N/A'),
    escapeCSV(lead.customer_type || lead.customerType || 'N/A'),
    escapeCSV(lead.sales_status || lead.salesStatus || 'N/A'),
    escapeCSV(lead.follow_up_status || lead.followUpStatus || 'N/A'),
    escapeCSV(lead.assigned_salesperson || lead.assignedSalesperson || 'Unassigned'),
    escapeCSV(lead.assigned_telecaller || lead.assignedTelecaller || 'Unassigned'),
    escapeCSV(lead.date || 'N/A'),
    escapeCSV(lead.created_at || lead.createdAt || 'N/A')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toastManager.success(`Exported ${leads.length} lead(s) to Excel`);
};

