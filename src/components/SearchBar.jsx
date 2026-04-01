import React from 'react';
import { Search, Plus, Upload, RefreshCw, Trash2, FileSpreadsheet, UserPlus } from 'lucide-react';

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  onImportClick, 
  onAddCustomer, 
  onAssignSelected,
  onDeleteSelected,
  onBulkDelete,
  onExportExcel,
  selectedCount,
  onRefresh 
}) => {
  const iconButtonBase = "p-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const iconButtonStyles = {
    import: `${iconButtonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`,
    add: `${iconButtonBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`,
    assign: `${iconButtonBase} ${selectedCount === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'}`,
    delete: `${iconButtonBase} ${selectedCount === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}`,
    export: `${iconButtonBase} bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`,
    refresh: `${iconButtonBase} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`
  };

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
        <div className="flex shadow-lg rounded-xl overflow-hidden flex-1 sm:flex-initial">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white border-gray-200 text-gray-900 placeholder-gray-500"
          />
          <button
            type="button"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onImportClick}
          className={iconButtonStyles.import}
          title="Import CSV"
        >
          <Upload className="w-5 h-5" />
        </button>
        
        <button
          onClick={onAddCustomer}
          className={iconButtonStyles.add}
          title="Add Customer"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={onAssignSelected}
          disabled={selectedCount === 0}
          className={iconButtonStyles.assign}
          title={selectedCount > 0 ? `Assign ${selectedCount} selected lead(s)` : 'Select leads to assign'}
        >
          <UserPlus className="w-5 h-5" />
        </button>

        {onDeleteSelected && (
          <button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${selectedCount === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
            title={selectedCount > 0 ? `Delete ${selectedCount} selected lead(s)` : 'Select leads to delete'}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected{selectedCount ? ` (${selectedCount})` : ''}</span>
          </button>
        )}

        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            disabled={selectedCount === 0}
            className={iconButtonStyles.delete}
            title={selectedCount > 0 ? `Delete ${selectedCount} selected lead(s)` : 'Select leads to delete'}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className={iconButtonStyles.export}
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>
        )}
          
        <button
          onClick={onRefresh}
          className={iconButtonStyles.refresh}
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
