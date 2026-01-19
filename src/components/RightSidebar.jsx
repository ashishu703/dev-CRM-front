import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Right Sidebar Component
 * Follows DRY principle - can be used across the application
 */
const RightSidebar = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full ${width} bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
