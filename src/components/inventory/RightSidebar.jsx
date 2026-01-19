import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Right Sidebar Component
 * Smooth slide-in animation from right
 */
const RightSidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width = 'w-full sm:w-[600px] lg:w-[700px]'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full ${width} bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out translate-x-0`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {footer && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Submit handler will be passed via footer
                    const submitBtn = document.querySelector('[data-submit-btn]');
                    if (submitBtn) submitBtn.click();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors ml-2"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default RightSidebar;

