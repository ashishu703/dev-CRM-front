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
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or business"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
