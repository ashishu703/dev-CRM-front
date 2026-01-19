import React, { useState, useEffect } from 'react';
import { X, RefreshCw, FileText, CheckCircle2, AlertCircle, FileCheck, Users, AlertTriangle } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../utils/globalImports';

const ImportPreviewModal = ({ isOpen, onClose, importPreview, importing, onImport }) => {
  const [duplicateMap, setDuplicateMap] = useState(new Map());
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [existingPhones, setExistingPhones] = useState(new Set());

  // Normalize phone number (extract last 10 digits)
  const normalizePhone = (phone) => {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : null;
  };

  // Check for duplicates when modal opens
  useEffect(() => {
    if (!isOpen || importPreview.length === 0) {
      setDuplicateMap(new Map());
      setExistingPhones(new Set());
      return;
    }

    const checkDuplicates = async () => {
      setCheckingDuplicates(true);
      try {
        // Load existing phone numbers from API
        const existingPhonesSet = new Set();
        let page = 1;
        const limit = 200;
        let hasMore = true;
        let totalLoaded = 0;

        console.log('[Duplicate Check] Starting to load existing phones...');

        while (hasMore && page <= 50) { // Limit to 50 pages to prevent infinite loops
          try {
            const queryString = `page=${page}&limit=${limit}`;
            const endpoint = API_ENDPOINTS.LEADS_LIST(queryString);
            console.log(`[Duplicate Check] Calling API: ${endpoint}`);
            const response = await apiClient.get(endpoint);
            
            console.log(`[Duplicate Check] Page ${page} response structure:`, {
              hasResponse: !!response,
              hasData: !!response?.data,
              dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
              dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
              hasPagination: !!response?.pagination,
              pagination: response?.pagination,
              responseKeys: response ? Object.keys(response) : []
            });
            
            // Handle different response structures
            let leadsData = null;
            if (Array.isArray(response?.data)) {
              leadsData = response.data;
            } else if (response?.data?.data && Array.isArray(response.data.data)) {
              leadsData = response.data.data;
            } else if (response?.data?.leads && Array.isArray(response.data.leads)) {
              leadsData = response.data.leads;
            }
            
            if (leadsData && Array.isArray(leadsData) && leadsData.length > 0) {
              leadsData.forEach(lead => {
                const phone = lead.phone || lead.mobileNumber || lead.mobile || '';
                if (phone) {
                  const normalized = normalizePhone(phone);
                  if (normalized) {
                    existingPhonesSet.add(normalized);
                  }
                }
              });

              totalLoaded += leadsData.length;
              const total = response?.pagination?.total || response?.data?.pagination?.total || response?.total || leadsData.length;
              const currentCount = page * limit;
              
              console.log(`[Duplicate Check] Loaded ${totalLoaded} leads (${leadsData.length} this page), total: ${total}`);
              
              hasMore = currentCount < total && leadsData.length === limit;
              page++;
            } else {
              console.warn('[Duplicate Check] No valid data found in response. Stopping pagination.');
              console.warn('[Duplicate Check] Response sample:', JSON.stringify(response).substring(0, 500));
              hasMore = false;
            }
          } catch (error) {
            console.error(`[Duplicate Check] Error loading page ${page}:`, error);
            console.error('Error details:', error.response?.data || error.message);
            hasMore = false;
          }
        }

        console.log(`[Duplicate Check] Total existing phones loaded: ${existingPhonesSet.size}`);
        console.log(`[Duplicate Check] Sample existing phones (first 5):`, Array.from(existingPhonesSet).slice(0, 5));
        setExistingPhones(existingPhonesSet);

        // Check for duplicates in import preview
        const duplicateMapNew = new Map();
        const seenInPreview = new Map(); // Map to track first occurrence index
        let previewPhones = [];

        importPreview.forEach((row, index) => {
          const phone = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || '';
          const normalizedPhone = normalizePhone(phone);
          
          if (normalizedPhone) {
            previewPhones.push({ index, original: phone, normalized: normalizedPhone });
            
            // Check if duplicate within preview
            if (seenInPreview.has(normalizedPhone)) {
              const firstIndex = seenInPreview.get(normalizedPhone);
              duplicateMapNew.set(index, { type: 'preview', phone: normalizedPhone, firstIndex });
              console.log(`[Duplicate Check] Row ${index + 1}: Duplicate in file (first at row ${firstIndex + 1})`);
              // Also mark the first occurrence if not already marked
              if (!duplicateMapNew.has(firstIndex)) {
                duplicateMapNew.set(firstIndex, { type: 'preview', phone: normalizedPhone, firstIndex: firstIndex });
              }
            } else {
              seenInPreview.set(normalizedPhone, index);
              // Check if exists in database
              if (existingPhonesSet.has(normalizedPhone)) {
                duplicateMapNew.set(index, { type: 'existing', phone: normalizedPhone });
                console.log(`[Duplicate Check] Row ${index + 1}: Phone ${normalizedPhone} already exists in database`);
              }
            }
          } else {
            console.log(`[Duplicate Check] Row ${index + 1}: Invalid or missing phone number: "${phone}"`);
          }
        });

        console.log(`[Duplicate Check] Preview phones (first 5):`, previewPhones.slice(0, 5));
        console.log(`[Duplicate Check] Found ${duplicateMapNew.size} duplicates in preview`);
        console.log(`[Duplicate Check] Duplicate details:`, Array.from(duplicateMapNew.entries()).slice(0, 5));
        setDuplicateMap(duplicateMapNew);
      } catch (error) {
        console.error('[Duplicate Check] Fatal error:', error);
        console.error('Error stack:', error.stack);
        
        // Fallback: At least check for duplicates within preview file
        console.log('[Duplicate Check] Falling back to preview-only duplicate check');
        const duplicateMapNew = new Map();
        const seenInPreview = new Map();
        
        importPreview.forEach((row, index) => {
          const phone = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || '';
          const normalizedPhone = normalizePhone(phone);
          
          if (normalizedPhone) {
            if (seenInPreview.has(normalizedPhone)) {
              const firstIndex = seenInPreview.get(normalizedPhone);
              duplicateMapNew.set(index, { type: 'preview', phone: normalizedPhone, firstIndex });
              if (!duplicateMapNew.has(firstIndex)) {
                duplicateMapNew.set(firstIndex, { type: 'preview', phone: normalizedPhone, firstIndex: firstIndex });
              }
            } else {
              seenInPreview.set(normalizedPhone, index);
            }
          }
        });
        
        setDuplicateMap(duplicateMapNew);
      } finally {
        setCheckingDuplicates(false);
      }
    };

    checkDuplicates();
  }, [isOpen, importPreview]);

  if (!isOpen) return null;

  const validRecords = importPreview.length;
  const hasData = validRecords > 0;
  const duplicateCount = duplicateMap.size;
  const newRecordsCount = validRecords - duplicateCount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-auto max-h-[95vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import Leads Preview</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Review and confirm the data before importing</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            disabled={importing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Records</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{validRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">New Records</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{newRecordsCount}</p>
                </div>
              </div>
            </div>
            <div className={`bg-white rounded-lg p-3 sm:p-4 border shadow-sm ${duplicateCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${duplicateCount > 0 ? 'bg-amber-100' : 'bg-purple-100'}`}>
                  {duplicateCount > 0 ? (
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  ) : (
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600">Duplicates</p>
                  <p className={`text-lg sm:text-xl font-bold ${duplicateCount > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                    {checkingDuplicates ? '...' : duplicateCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
              <p className="text-sm text-gray-600 max-w-md">
                The CSV file doesn't contain any valid records. Please check your file and try again.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-700">
                      Showing all {validRecords} record{validRecords !== 1 ? 's' : ''} to be imported
                    </p>
                    {checkingDuplicates && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Checking duplicates...</span>
                      </div>
                    )}
                    {!checkingDuplicates && duplicateCount > 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} found</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Scroll to view all columns →
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-xs sm:text-sm border-collapse bg-white">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider">#</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[80px]">Status</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">Customer Name</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Mobile</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">WhatsApp</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[140px]">Email</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">Business</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[150px]">Address</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[80px]">State</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Division</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">GST No</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Category</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[150px]">Product</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Lead Source</th>
                      <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importPreview.map((row, index) => {
                      const duplicateInfo = duplicateMap.get(index);
                      const isDuplicate = !!duplicateInfo;
                      const isPreviewDuplicate = duplicateInfo?.type === 'preview';
                      const isExistingDuplicate = duplicateInfo?.type === 'existing';
                      
                      return (
                        <tr 
                          key={index} 
                          className={`transition-colors duration-150 border-b ${
                            isDuplicate 
                              ? 'bg-amber-50/50 hover:bg-amber-100/50 border-amber-200' 
                              : 'hover:bg-blue-50/50 border-gray-100'
                          }`}
                        >
                          <td className="px-3 py-3 text-gray-500 font-medium">{index + 1}</td>
                          <td className="px-3 py-3">
                            {checkingDuplicates ? (
                              <div className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                                <span className="text-xs text-gray-500">Checking...</span>
                              </div>
                            ) : isDuplicate ? (
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  isPreviewDuplicate 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {isPreviewDuplicate ? 'Duplicate in File' : 'Already Exists'}
                                </span>
                                {duplicateInfo?.phone && (
                                  <span className="text-xs text-gray-500 font-mono">{duplicateInfo.phone}</span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 font-semibold text-gray-900">{row['Customer Name'] || row['customer name'] || row.name || <span className="text-gray-400 italic">-</span>}</td>
                        <td className="px-3 py-3 text-gray-700 font-mono text-xs">
                          {(() => {
                            const phone = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || '';
                            const normalized = normalizePhone(phone);
                            return normalized || phone || <span className="text-gray-400 italic">-</span>;
                          })()}
                        </td>
                        <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row['WhatsApp Number'] || row['whatsapp number'] || row.WhatsApp || row.whatsapp || <span className="text-gray-400 italic">-</span>}</td>
                        <td className="px-3 py-3 text-gray-700">{row.Email || row.email || <span className="text-gray-400 italic">-</span>}</td>
                        <td className="px-3 py-3 text-gray-700">{row['Business Name'] || row['business name'] || row.business || <span className="text-gray-400 italic">-</span>}</td>
                        <td className="px-3 py-3 text-gray-700 max-w-[200px] truncate" title={row.Address || row.address || ''}>
                          {row.Address || row.address || <span className="text-gray-400 italic">-</span>}
                        </td>
                        <td className="px-3 py-3">
                          {row.State || row.state ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {row.State || row.state}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {row.Division || row.division ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {row.Division || row.division}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row['GST Number'] || row['gst number'] || row['GST No'] || row.gst_no || <span className="text-gray-400 italic">-</span>}</td>
                        <td className="px-3 py-3">
                          {row['Business Category'] || row['business category'] || row.category ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {row['Business Category'] || row['business category'] || row.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-700 max-w-[200px] truncate" title={row['Product Names (comma separated)'] || row['product names (comma separated)'] || row['Product Name'] || row.product_type || ''}>
                          {row['Product Names (comma separated)'] || row['product names (comma separated)'] || row['Product Name'] || row.product_type || <span className="text-gray-400 italic">-</span>}
                        </td>
                        <td className="px-3 py-3 text-gray-700">{row['Lead Source'] || row['lead source'] || row.lead_source || <span className="text-gray-400 italic">-</span>}</td>
                        <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row['Date (DD/MM/YYYY or YYYY-MM-DD)'] || row['date (dd/mm/yyyy or yyyy-mm-dd)'] || row['Date (YYYY-MM-DD)'] || row.Date || row.date || <span className="text-gray-400 italic">-</span>}</td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Please review all data before confirming the import</span>
            </div>
            {duplicateCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                <AlertTriangle className="h-3 w-3" />
                <span>Note: {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} will be skipped during import</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={importing}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
            >
              Cancel
            </button>
            <button
              onClick={onImport}
              disabled={importing || !hasData}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Import {validRecords} Lead{validRecords !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewModal;

