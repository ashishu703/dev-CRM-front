import React from 'react'
import { Filter, X, ArrowUpDown } from 'lucide-react'

export default function EnquiryFilters({ 
  showFilterPanel, setShowFilterPanel, enabledFilters, advancedFilters, 
  getUniqueFilterOptions, handleAdvancedFilterChange, toggleFilterSection, clearAdvancedFilters,
  sortBy, setSortBy, sortOrder, setSortOrder, handleSortChange, handleSortOrderChange
}) {
  if (!showFilterPanel) return null

  const filterLabels = {
    state: 'State',
    division: 'Division',
    product: 'Product',
    followUpStatus: 'Follow Up Status',
    salesStatus: 'Sales Status',
    salesperson: 'Salesperson',
    telecaller: 'Telecaller',
    dateRange: 'Date Range'
  }

  // Map filter keys to their corresponding option keys in getUniqueFilterOptions
  const filterOptionsMap = {
    state: 'states',
    division: 'divisions',
    product: 'products',
    followUpStatus: 'followUpStatuses',
    salesStatus: 'salesStatuses',
    salesperson: 'salespersons',
    telecaller: 'telecallers'
  }

  return (
    <div id="enquiry-filter-panel" className="fixed right-4 top-32 z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-[calc(100vh-150px)] overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" /> Filters
        </h3>
        <button onClick={() => setShowFilterPanel(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {['state', 'division', 'product', 'followUpStatus', 'salesStatus', 'salesperson', 'telecaller', 'dateRange'].map(filterKey => (
          <div key={filterKey} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-2 bg-gray-50">
              <input 
                type="checkbox" 
                checked={enabledFilters[filterKey]} 
                onChange={() => toggleFilterSection(filterKey)} 
                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-1 focus:ring-blue-500" 
              />
              <label className="text-xs font-medium text-gray-700 cursor-pointer">{filterLabels[filterKey]}</label>
            </div>
            {enabledFilters[filterKey] && (
              <div className="p-2 bg-white">
                {filterKey === 'dateRange' ? (
                  <div className="space-y-1.5">
                    <input 
                      type="date" 
                      value={advancedFilters.dateFrom} 
                      onChange={(e) => handleAdvancedFilterChange('dateFrom', e.target.value)} 
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                    <input 
                      type="date" 
                      value={advancedFilters.dateTo} 
                      onChange={(e) => handleAdvancedFilterChange('dateTo', e.target.value)} 
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                ) : (
                  <select 
                    value={advancedFilters[filterKey] || ''} 
                    onChange={(e) => handleAdvancedFilterChange(filterKey, e.target.value)} 
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    {(() => {
                      const optionsKey = filterOptionsMap[filterKey]
                      const options = (getUniqueFilterOptions && optionsKey && getUniqueFilterOptions[optionsKey]) || []
                      
                      return options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))
                    })()}
                  </select>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Sorting Section */}
      <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-blue-600" />
          <label className="text-xs font-semibold text-gray-900">Sort By</label>
        </div>
        <div className="space-y-2">
          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange ? handleSortChange(e.target.value) : setSortBy(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="none">No Sorting</option>
            <option value="customer_name">Customer Name (A-Z / Z-A)</option>
            <option value="business">Business (A-Z / Z-A)</option>
            <option value="state">State (A-Z / Z-A)</option>
            <option value="division">Division (A-Z / Z-A)</option>
            <option value="enquired_product">Product (A-Z / Z-A)</option>
            <option value="enquiry_date">Date (Newest / Oldest)</option>
          </select>
          {sortBy !== 'none' && (
            <select 
              value={sortOrder} 
              onChange={(e) => handleSortOrderChange ? handleSortOrderChange(e.target.value) : setSortOrder(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="asc">
                {sortBy === 'enquiry_date' ? 'Oldest First' : 'A to Z'}
              </option>
              <option value="desc">
                {sortBy === 'enquiry_date' ? 'Newest First' : 'Z to A'}
              </option>
            </select>
          )}
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={clearAdvancedFilters} 
          className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}
