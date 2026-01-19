import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  Calendar,
  FileText,
  Menu,
  X,
  LogOut,
  UserCheck,
  FileSignature,
  Monitor,
  Phone,
  Activity,
  HelpCircle
} from 'lucide-react';

const OfficeSalesPersonSidebar = ({ activeView, setActiveView }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'calls',
      label: 'Calls',
      icon: <Phone className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: <Calendar className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'proposals',
      label: 'Proposals',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: <FileSignature className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Activity className="w-5 h-5" />,
      hasDropdown: false
    }
  ];

  const handleItemClick = (item) => {
    setActiveView(item.id);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">ANOCAB</h1>
              <p className="text-xs text-gray-500">Office Sales Department</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isExpanded ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            {isExpanded && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Support Button */}
      <div className="absolute bottom-20 left-4 right-4">
        <button
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Support</span>}
        </button>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => {
            // Handle logout logic here
            window.close();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default OfficeSalesPersonSidebar;
