import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DropdownSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownSection;

