import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  Users, 
  Building2, 
  UserCheck, 
  Settings, 
  TrendingUp,
  Menu,
  X,
  LogOut,
  Calendar,
  HelpCircle,
  PlusCircle,
  FileText
} from 'lucide-react';

const Sidebar = ({ onLogout, activeView, setActiveView }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    department: false,
    salesDepartment: false
  });
  const collapseTimerRef = useRef(null);
  const isManuallyToggledRef = useRef(false);

  // Auto-collapse on mouse leave
  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    // Only auto-expand if sidebar is not manually closed
    if (!isManuallyToggledRef.current && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    // Only auto-collapse if not manually toggled
    if (!isManuallyToggledRef.current) {
      collapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
        setOpenDropdowns({ department: false, salesDepartment: false });
      }, 2000); // Collapse after 2 seconds
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const toggleSidebar = (e) => {
    e?.stopPropagation(); // Prevent event bubbling if event exists
    const newState = !isExpanded;
    
    // Set flag based on new state:
    // - If closing (newState = false), set flag to true (manually closed)
    // - If opening (newState = true), set flag to false (can auto-collapse again)
    isManuallyToggledRef.current = !newState;
    
    setIsExpanded(newState);
    
    // Reset dropdowns when toggling
    setOpenDropdowns({ department: false, salesDepartment: false, marketingSalesperson: false });
    
    // Clear any pending auto-collapse
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'department',
      label: 'Department',
      icon: <Building2 className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <UserCheck className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'performance',
      label: 'Payment Info',
      icon: <TrendingUp className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'rfp-workflow',
      label: 'RFP Workflow',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false
    }
  ];

  // Debug: Log the sidebar items structure
  // console.log('Sidebar items structure:', JSON.stringify(sidebarItems, null, 2));

  return (
    <div 
      className={`bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} h-screen flex flex-col border-r border-slate-700/50`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 shadow-lg">
              <img 
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" 
                alt="ANOCAB Logo" 
                  className="w-full h-full object-contain rounded-lg"
              />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>ANOCAB</h1>
                <p className="text-xs text-slate-400">CRM Platform</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white ${!isExpanded ? 'mx-auto' : ''}`}
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

    

      {/* Navigation Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1.5">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`}
                onClick={() => {
                  if (item.hasDropdown) {
                    toggleDropdown(item.id);
                  } else {
                    setActiveView(item.id);
                  }
                }}
                style={{
                  transform: activeView === item.id ? 'translateX(4px)' : 'none',
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={activeView === item.id ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                  )}
                </div>
                {isExpanded && item.hasDropdown && (
                  <div className={activeView === item.id ? 'text-white' : 'text-slate-400'}>
                    {openDropdowns[item.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Dropdown Items */}
              {isExpanded && item.hasDropdown && openDropdowns[item.id] && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.dropdownItems.map((subItem, index) => (
                    <li key={index}>
                      <div className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 text-gray-600`}
                      onClick={() => {
                        if (subItem.hasSubDropdown) {
                          toggleDropdown('salesDepartment');
                        } else {
                          setActiveView(subItem.label.toLowerCase().replace(/\s+/g, '-'));
                        }
                      }}>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                          <span className="text-sm">{subItem.label}</span>
                        </div>
                        {subItem.hasSubDropdown && (
                          <div className="text-gray-400">
                            {(subItem.label === 'Marketing Salesperson' ? openDropdowns.marketingSalesperson : openDropdowns.salesDepartment) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Sub-dropdown Items */}
                      {subItem.hasSubDropdown && openDropdowns.salesDepartment && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {subItem.subDropdownItems.map((subSubItem, subIndex) => {
                            const IconComponent = subSubItem.icon === 'UserCheck' ? UserCheck : 
                                                 subSubItem.icon === 'Calendar' ? Calendar : 
                                                 UserCheck;
                            return (
                              <li key={subIndex}>
                                <div className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  subSubItem.active ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-600'
                                }`}
                                onClick={() => {
                                  const viewName = subSubItem.route || subSubItem.label.toLowerCase().replace(/\s+/g, '-');
                                  setActiveView(viewName);
                                }}>
                                  <div className="flex items-center space-x-2">
                                    <IconComponent className={`w-4 h-4 ${
                                      subSubItem.active ? 'text-white' : 'text-gray-500'
                                    }`} />
                                    <span className="text-sm">{subSubItem.label}</span>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Create Organisation Button */}
      <div className="p-3 border-t border-slate-700/50 mt-auto bg-slate-800/30">
        <button 
          onClick={() => setActiveView('create-organisation')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            activeView === 'create-organisation' 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Create Organisation</span>}
        </button>
      </div>

      {/* Support Button */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <button 
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200"
        >
          <HelpCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Support</span>}
        </button>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
