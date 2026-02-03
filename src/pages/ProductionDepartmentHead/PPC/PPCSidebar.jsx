import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  Menu,
  X,
  Calendar,
  Package,
  Settings,
  Users,
  DollarSign,
  HelpCircle,
  Factory,
  Store,
  Barcode,
  ClipboardCheck,
  FileText
} from 'lucide-react';

const PPCSidebar = ({ onLogout, activeView, setActiveView }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});

  // Auto-expand inventory-control dropdown if activeView is an inventory page
  React.useEffect(() => {
    if (activeView?.startsWith('inventory-')) {
      setExpandedDropdowns(prev => ({
        ...prev,
        'inventory-control': true
      }));
    }
  }, [activeView]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleDropdown = (dropdownId) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  const sidebarItems = [
    {
      id: 'ppc-dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'design-cost-planning',
      label: 'Design & Cost Planning',
      icon: <DollarSign className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'raw-material-plan',
      label: 'Raw Material Plan',
      icon: <Package className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'machine-scheduling',
      label: 'Machine Scheduling',
      icon: <Factory className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'manpower-allotment',
      label: 'Manpower Allotment',
      icon: <Users className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'rfp-workflow',
      label: 'RFP Workflow',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'inventory-control',
      label: 'Inventory Control',
      icon: <Settings className="w-5 h-5" />,
      hasDropdown: true,
      dropdownItems: [
        {
          id: 'inventory-items',
          label: 'Items',
          icon: <Package className="w-4 h-4" />
        },
        {
          id: 'inventory-stores',
          label: 'Stores',
          icon: <Store className="w-4 h-4" />
        },
        {
          id: 'inventory-batch-code',
          label: 'Batch/Bar Code',
          icon: <Barcode className="w-4 h-4" />
        },
        {
          id: 'inventory-approval',
          label: 'Inventory Approval',
          icon: <ClipboardCheck className="w-4 h-4" />
        }
      ]
    }
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} h-screen flex flex-col border-r border-gray-200`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div className="flex items-center space-x-3">
              <img 
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" 
                alt="ANOCAB Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="font-bold text-gray-800 text-lg">ANOCAB</h1>
                <p className="text-xs text-gray-500">PPC Department</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 hover:bg-gray-100 rounded transition-colors ${!isExpanded ? 'mx-auto' : ''}`}
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              {item.hasDropdown ? (
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeView.startsWith(item.id) ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={activeView.startsWith(item.id) ? 'text-orange-600' : 'text-gray-500'}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </div>
                    {isExpanded && (
                      <div className={activeView.startsWith(item.id) ? 'text-orange-600' : 'text-gray-500'}>
                        {expandedDropdowns[item.id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                  {expandedDropdowns[item.id] && isExpanded && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.dropdownItems?.map((subItem) => (
                        <li key={subItem.id}>
                          <div
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              activeView === subItem.id ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                            onClick={() => setActiveView(subItem.id)}
                          >
                            <div className={activeView === subItem.id ? 'text-orange-600' : 'text-gray-500'}>
                              {subItem.icon}
                            </div>
                            <span className="text-sm font-medium">{subItem.label}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeView === item.id ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setActiveView(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={activeView === item.id ? 'text-orange-600' : 'text-gray-500'}>
                      {item.icon}
                    </div>
                    {isExpanded && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Support Button */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button 
          onClick={() => window.location.href = '/support'}
          className={`w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors`}
        >
          <HelpCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Support</span>}
        </button>
      </div>
    </div>
  );
};

export default PPCSidebar;

