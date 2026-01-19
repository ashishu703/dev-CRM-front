import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  Users, 
  UserCheck, 
  DollarSign,
  Target,
  Menu,
  X,
  LogOut,
  Calendar,
  TrendingUp,
  Package,
  HelpCircle,
  FileText
} from 'lucide-react';

const SalesDepartmentHeadSidebar = ({ onLogout, activeView, setActiveView, sidebarOpen, setSidebarOpen }) => {
  const [isExpanded, setIsExpanded] = useState(sidebarOpen !== undefined ? sidebarOpen : true);
  
  // Update parent state when internal state changes
  const updateExpanded = useCallback((newValue) => {
    setIsExpanded(newValue);
    if (setSidebarOpen) {
      setSidebarOpen(newValue);
    }
  }, [setSidebarOpen]);
  
  // Sync internal state with prop if provided
  useEffect(() => {
    if (sidebarOpen !== undefined && sidebarOpen !== isExpanded) {
      setIsExpanded(sidebarOpen);
    }
  }, [sidebarOpen, isExpanded]);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const collapseTimerRef = useRef(null);
  const isManuallyToggledRef = useRef(false);

  // Auto-collapse on mouse leave
  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (!isManuallyToggledRef.current) {
      updateExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    // Only auto-collapse if not manually toggled
    if (!isManuallyToggledRef.current) {
      collapseTimerRef.current = setTimeout(() => {
        updateExpanded(false);
        setExpandedDropdowns({});
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

  const toggleSidebar = () => {
    isManuallyToggledRef.current = !isExpanded; // If expanding manually, set flag; if collapsing, clear flag
    updateExpanded(!isExpanded);
    // Clear any pending auto-collapse
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const toggleDropdown = (dropdownId) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  const sidebarItems = [
    {
      id: 'sales-dashboard',
      label: 'Sales Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <UserCheck className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'rfp-workflow',
      label: 'RFP Workflow',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'user-performance',
      label: 'User Performance',
      icon: <Target className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'payment-info',
      label: 'Payment Info',
      icon: <DollarSign className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'sales-department-users',
      label: 'Department Users',
      icon: <Users className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'stock-update',
      label: 'Stock Update',
      icon: <Package className="w-5 h-5" />,
      hasDropdown: false
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] md:hidden"
          onClick={() => updateExpanded(false)}
        />
      )}
      <div 
        className={`fixed top-0 left-0 h-screen z-[110] shadow-2xl border-r transition-all duration-300 flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-slate-700/50 ${
          isExpanded 
            ? 'w-64 translate-x-0' 
            : 'w-16 -translate-x-full md:translate-x-0'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
        }}
      >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 relative z-[120]">
        <div className="flex items-center justify-between">
          {isExpanded ? (
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 shadow-lg flex-shrink-0">
                <img
                  src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
                  alt="ANOCAB Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-white text-lg tracking-tight truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>ANOCAB</h1>
                <p className="text-xs text-slate-400 truncate">Sales Department Head</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={toggleSidebar}
            className={`p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white flex-shrink-0 relative z-[130] ${!isExpanded ? 'mx-auto' : 'ml-2'}`}
            aria-label="Toggle sidebar"
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1.5">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              {item.hasDropdown ? (
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      activeView.startsWith(item.id) 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    }`}
                    onClick={() => toggleDropdown(item.id)}
                    style={{
                      transform: activeView.startsWith(item.id) ? 'translateX(4px)' : 'none',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={activeView.startsWith(item.id) ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                      )}
                    </div>
                    {isExpanded && (
                      <div className={activeView.startsWith(item.id) ? 'text-white' : 'text-slate-400'}>
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
                      {item.dropdownItems.map((subItem) => (
                        <li key={subItem.id}>
                          <div
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              activeView === subItem.id 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                                : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                            }`}
                            onClick={() => setActiveView(subItem.id)}
                          >
                            <div className={activeView === subItem.id ? 'text-white' : 'text-slate-400'}>
                              {subItem.icon}
                            </div>
                            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{subItem.label}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeView === item.id || (item.id === 'reports' && activeView?.startsWith('detailed-report-')) 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                  }`}
                  onClick={() => {
                    console.log('Sidebar click - setting activeView to:', item.id);
                    setActiveView(item.id);
                  }}
                  style={{
                    transform: activeView === item.id || (item.id === 'reports' && activeView?.startsWith('detailed-report-')) ? 'translateX(4px)' : 'none',
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={activeView === item.id || (item.id === 'reports' && activeView?.startsWith('detailed-report-')) ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </div>
                    {isExpanded && (
                      <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

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
    </>
  );
};

export default SalesDepartmentHeadSidebar;
