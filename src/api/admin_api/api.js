// Use relative URLs in development to leverage Vite proxy, full URLs in production
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDevelopment ? '' : 'http://localhost:4500');

const ADMIN_BASE = `${API_BASE_URL}/api/admin`;
const DEPT_HEADS_BASE = `${ADMIN_BASE}/department-heads`;
const DEPT_USERS_BASE = `${ADMIN_BASE}/department-users`;
const ORG_BASE = `${API_BASE_URL}/api/organizations`;
const LEADS_BASE = `${API_BASE_URL}/api/leads`;
const PRODUCTION_BASE = `${API_BASE_URL}/api/production`;

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  IMPERSONATE: `${API_BASE_URL}/api/auth/impersonate`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  PROFILE_UPDATE: () => `${API_BASE_URL}/api/auth/profile`,
  CHANGE_PASSWORD: () => `${API_BASE_URL}/api/auth/change-password`,
  
  // Department heads
  DEPARTMENT_HEADS_BASE: DEPT_HEADS_BASE,
  DEPARTMENT_HEADS_LIST: (query = '') => `${DEPT_HEADS_BASE}${query ? `?${query}` : ''}`,
  DEPARTMENT_HEADS_CREATE: () => `${DEPT_HEADS_BASE}`,
  DEPARTMENT_HEADS_STATS: () => `${DEPT_HEADS_BASE}/stats`,
  DEPARTMENT_HEADS_BY_COMPANY_DEPARTMENT: (companyName, departmentType) => `${DEPT_HEADS_BASE}/by-company-department/${encodeURIComponent(companyName)}/${encodeURIComponent(departmentType)}`,
  DEPARTMENT_HEAD_BY_ID: (id) => `${DEPT_HEADS_BASE}/${id}`,
  DEPARTMENT_HEAD_STATUS: (id) => `${DEPT_HEADS_BASE}/${id}/status`,
  
  // Department users
  DEPARTMENT_USERS_BASE: DEPT_USERS_BASE,
  DEPARTMENT_USERS_LIST: (query = '') => `${DEPT_USERS_BASE}${query ? `?${query}` : ''}`,
  DEPARTMENT_USERS_CREATE: () => `${DEPT_USERS_BASE}`,
  DEPARTMENT_USERS_STATS: () => `${DEPT_USERS_BASE}/stats`,
  DEPARTMENT_USERS_BY_HEAD: (headUserId) => `${DEPT_USERS_BASE}/by-head/${encodeURIComponent(headUserId)}`,
  DEPARTMENT_USER_BY_ID: (id) => `${DEPT_USERS_BASE}/${id}`,
  DEPARTMENT_USER_STATUS: (id) => `${DEPT_USERS_BASE}/${id}/status`,

  // Leads
  LEADS_BASE: LEADS_BASE,
  LEADS_LIST: (query = '') => `${LEADS_BASE}${query ? `?${query}` : ''}`,
  LEADS_CREATE: () => `${LEADS_BASE}`,
  LEADS_IMPORT: () => `${LEADS_BASE}/import`,
  LEADS_BATCH_UPDATE: () => `${LEADS_BASE}/batch`,
  LEADS_BATCH_DELETE: () => `${LEADS_BASE}/batch`,
  LEAD_BY_ID: (id) => `${LEADS_BASE}/${id}`,
  LEADS_STATS: () => `${LEADS_BASE}/stats`,
  LEADS_LAST_CALL: (query = '') => `${LEADS_BASE}/last-call${query ? `?${query}` : ''}`,
  LEADS_LAST_CALL_SUMMARY: (query = '') => `${LEADS_BASE}/last-call-summary${query ? `?${query}` : ''}`,
  SALESPERSON_ASSIGNED_LEADS_ME: () => `${LEADS_BASE}/assigned/salesperson`,
  SALESPERSON_ASSIGNED_LEADS_BY_USERNAME: (username) => `${LEADS_BASE}/assigned/salesperson/${encodeURIComponent(username)}`,
  SALESPERSON_LEAD_BY_ID: (id) => `${LEADS_BASE}/assigned/salesperson/lead/${id}`,
  SALESPERSON_LEAD_HISTORY: (id) => `${LEADS_BASE}/assigned/salesperson/lead/${id}/history`,
  SALESPERSON_CREATE_LEAD: () => `${LEADS_BASE}/assigned/salesperson/lead`,
  SALESPERSON_IMPORT_LEADS: () => `${LEADS_BASE}/assigned/salesperson/import`,
  LEAD_TRANSFER: (id) => `${LEADS_BASE}/${id}/transfer`,
  ENQUIRIES_DEPARTMENT_HEAD: () => `${LEADS_BASE}/enquiries/department-head`,
  ENQUIRIES_SUPERADMIN: () => `${LEADS_BASE}/enquiries/superadmin`,
  ENQUIRY_UPDATE: (id) => `${LEADS_BASE}/enquiries/${id}`,
  ENQUIRY_DELETE: (id) => `${LEADS_BASE}/enquiries/${id}`,

  // Production
  PRODUCTION_BASE: PRODUCTION_BASE,
  PRODUCTION_METRICS: (companyName) => `${PRODUCTION_BASE}/metrics${companyName ? `?company=${encodeURIComponent(companyName)}` : ''}`,
  PRODUCTION_SCHEDULE: (query = '') => `${PRODUCTION_BASE}/schedule${query ? `?${query}` : ''}`,
  PRODUCTION_TASKS: (query = '') => `${PRODUCTION_BASE}/tasks${query ? `?${query}` : ''}`,
  PRODUCTION_QC_LOTS: (query = '') => `${PRODUCTION_BASE}/qc/lots${query ? `?${query}` : ''}`,
  PRODUCTION_MAINT_ORDERS: (query = '') => `${PRODUCTION_BASE}/maintenance/orders${query ? `?${query}` : ''}`,
  PRODUCTION_INVENTORY: (query = '') => `${PRODUCTION_BASE}/inventory${query ? `?${query}` : ''}`,

  // RFP Workflow
  RFPS_BASE: `${API_BASE_URL}/api/rfps`,
  RFPS_LIST: (query = '') => `${API_BASE_URL}/api/rfps${query ? `?${query}` : ''}`,
  RFPS_CREATE: () => `${API_BASE_URL}/api/rfps`,
  RFP_BY_ID: (id) => `${API_BASE_URL}/api/rfps/${id}`,
  RFP_APPROVE: (id) => `${API_BASE_URL}/api/rfps/${id}/approve`,
  RFP_REJECT: (id) => `${API_BASE_URL}/api/rfps/${id}/reject`,
  RFP_PRICES: (id) => `${API_BASE_URL}/api/rfps/${id}/prices`,
  RFP_ADD_PRICE: (id) => `${API_BASE_URL}/api/rfps/${id}/prices`,
  RFP_QUOTATION: (id) => `${API_BASE_URL}/api/rfps/${id}/quotation`,
  RFP_SUBMIT_ACCOUNTS: (id) => `${API_BASE_URL}/api/rfps/${id}/submit-accounts`,
  RFP_ACCOUNTS_APPROVAL: (id) => `${API_BASE_URL}/api/rfps/${id}/accounts-approval`,
  RFP_SENIOR_APPROVAL: (id) => `${API_BASE_URL}/api/rfps/${id}/senior-approval`,

  // Product prices
  PRODUCT_PRICE_GET: (productSpec) => `${API_BASE_URL}/api/prices/${encodeURIComponent(productSpec)}`,
  PRODUCT_PRICE_CREATE: () => `${API_BASE_URL}/api/prices`,

  // Stock
  STOCK_BASE: `${API_BASE_URL}/api/stock`,
  STOCK_GET_ALL: () => `${API_BASE_URL}/api/stock`,
  STOCK_GET_BY_PRODUCT: (productName) => `${API_BASE_URL}/api/stock/${encodeURIComponent(productName)}`,
  STOCK_UPDATE: (productName) => `${API_BASE_URL}/api/stock/${encodeURIComponent(productName)}`,
  STOCK_BATCH_UPDATE: () => `${API_BASE_URL}/api/stock/batch`,
  STOCK_TALLY_STATUS: () => `${API_BASE_URL}/api/stock/tally/status`,
  STOCK_TALLY_SYNC: () => `${API_BASE_URL}/api/stock/tally/sync`,
  STOCK_TALLY_ITEMS: () => `${API_BASE_URL}/api/stock/tally/items`,

  // Product images (toolbox interface)
  // GET returns images for a given product; UPLOAD posts a new image.
  PRODUCT_IMAGES_GET: (productName) => `${API_BASE_URL}/api/product-images/${encodeURIComponent(productName)}`,
  PRODUCT_IMAGES_UPLOAD: () => `${API_BASE_URL}/api/product-images`,

  // Tickets
  TICKETS_BASE: `${API_BASE_URL}/api/tickets`,
  TICKETS_CREATE: () => `${API_BASE_URL}/api/tickets`,
  TICKETS_LIST: (query = '') => `${API_BASE_URL}/api/tickets${query ? `?${query}` : ''}`,
  TICKET_BY_ID: (id) => `${API_BASE_URL}/api/tickets/${id}`,
  TICKET_UPDATE: (id) => `${API_BASE_URL}/api/tickets/${id}`,
  TICKET_SEND_BACK: (id) => `${API_BASE_URL}/api/tickets/${id}/send-back`,

  // Security Logs
  SECURITY_LOGS_BASE: `${API_BASE_URL}/api/security-logs`,
  SECURITY_LOGS_LIST: (query = '') => `${API_BASE_URL}/api/security-logs${query ? `?${query}` : ''}`,
  SECURITY_LOG_ASSIGN: (id) => `${API_BASE_URL}/api/security-logs/${id}/assign`,
  SECURITY_LOG_UPDATE_STATUS: (id) => `${API_BASE_URL}/api/security-logs/${id}/status`,
  SECURITY_LOG_SEND_BACK: (id) => `${API_BASE_URL}/api/security-logs/${id}/send-back`,

  // Admin Users
  ADMIN_USERS_LIST: (query = '') => `${ADMIN_BASE}/users${query ? `?${query}` : ''}`,

  // Marketing Meetings & Check-ins
  MARKETING_BASE: `${API_BASE_URL}/api/marketing`,
  MARKETING_MEETINGS_GET_ALL: (query = '') => `${API_BASE_URL}/api/marketing/meetings${query ? `?${query}` : ''}`,
  MARKETING_MEETINGS_CREATE: () => `${API_BASE_URL}/api/marketing/meetings`,
  MARKETING_MEETINGS_ASSIGNED: () => `${API_BASE_URL}/api/marketing/meetings/assigned`,
  MARKETING_MEETING_BY_ID: (id) => `${API_BASE_URL}/api/marketing/meetings/${id}`,
  MARKETING_MEETING_UPDATE: (id) => `${API_BASE_URL}/api/marketing/meetings/${id}`,
  MARKETING_MEETING_DELETE: (id) => `${API_BASE_URL}/api/marketing/meetings/${id}`,
  MARKETING_CHECK_INS_GET_ALL: (query = '') => `${API_BASE_URL}/api/marketing/check-ins${query ? `?${query}` : ''}`,
  MARKETING_CHECK_INS_CREATE: () => `${API_BASE_URL}/api/marketing/check-ins`,
  MARKETING_CHECK_INS_MY_CHECKINS: () => `${API_BASE_URL}/api/marketing/check-ins/my-checkins`,
  MARKETING_CHECK_INS_BY_MEETING: (meetingId) => `${API_BASE_URL}/api/marketing/check-ins/meeting/${meetingId}`,
  MARKETING_CHECK_IN_BY_ID: (id) => `${API_BASE_URL}/api/marketing/check-ins/${id}`,
  MARKETING_CHECK_IN_UPDATE: (id) => `${API_BASE_URL}/api/marketing/check-ins/${id}`,
  
  // Marketing Orders
  MARKETING_ORDERS_GET_ALL: (query = '') => `${API_BASE_URL}/api/marketing/orders${query ? `?${query}` : ''}`,
  MARKETING_ORDERS_CREATE: () => `${API_BASE_URL}/api/marketing/orders`,
  MARKETING_ORDER_BY_ID: (id) => `${API_BASE_URL}/api/marketing/orders/${id}`,
  MARKETING_ORDER_UPDATE: (id) => `${API_BASE_URL}/api/marketing/orders/${id}`,
  MARKETING_ORDER_DELETE: (id) => `${API_BASE_URL}/api/marketing/orders/${id}`,

  // Organizations
  ORGANIZATIONS_BASE: ORG_BASE,
  ORGANIZATIONS_CREATE: () => ORG_BASE,
  ORGANIZATIONS_LIST: (query = '') => `${ORG_BASE}${query ? `?${query}` : ''}`,
  ORGANIZATIONS_ACTIVE: () => `${ORG_BASE}/active`,

  // expose base URL for rare direct uses
  API_BASE_URL,
};

export default API_BASE_URL;
