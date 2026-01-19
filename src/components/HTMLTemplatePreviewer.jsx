import React, { useState } from 'react';
import { Eye, Code, RefreshCw } from 'lucide-react';

/**
 * Global HTML Template Previewer Component
 * Can be used anywhere in the application to preview HTML templates
 * Follows OOPS and DRY principles
 */
const HTMLTemplatePreviewer = ({ htmlContent, title = 'HTML Preview' }) => {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Header with mode toggle */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm flex items-center space-x-1 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 text-sm flex items-center space-x-1 transition-colors ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">
        {viewMode === 'preview' ? (
          <div className="p-4 min-h-[300px] max-h-[500px] overflow-auto">
            {htmlContent ? (
              <div 
                key={refreshKey}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="prose max-w-none"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No HTML content to preview</p>
                  <p className="text-xs mt-1">Add HTML content to see the preview</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 min-h-[300px] max-h-[500px] overflow-auto">
            {htmlContent ? (
              <pre className="text-xs font-mono text-gray-800 bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
                <code>{htmlContent}</code>
              </pre>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No HTML code to display</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HTMLTemplatePreviewer;
