import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Building2,
  UserCheck,
  Settings,
  TrendingUp,
  Menu,
  X,
  Calendar,
  HelpCircle,
  PlusCircle,
  FileText,
  Wrench,
} from 'lucide-react';

const Sidebar = ({ onLogout, activeView, setActiveView, sidebarOpen, onToggleSidebar, isMobileView = false }) => {
  const [internalOpen, setInternalOpen] = useState(true);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    department: false,
    salesDepartment: false
  });

  const isExpanded = onToggleSidebar != null ? (sidebarOpen ?? true) : internalOpen;
  const toggleSidebar = (e) => {
    e?.stopPropagation();
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      setInternalOpen((prev) => !prev);
    }
    setOpenDropdowns({ department: false, salesDepartment: false, marketingSalesperson: false });
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  // Order: Dashboard, Leads, Payment Info, RFP Workflow, Department, Configuration, Toolbox Interface (Chat & Reports deprecated)
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" />, hasDropdown: false },
    { id: 'leads', label: 'Leads', icon: <UserCheck className="w-5 h-5" />, hasDropdown: false },
    { id: 'performance', label: 'Payment Info', icon: <TrendingUp className="w-5 h-5" />, hasDropdown: false },
    { id: 'rfp-workflow', label: 'RFP Workflow', icon: <FileText className="w-5 h-5" />, hasDropdown: false },
    { id: 'department', label: 'Department', icon: <Building2 className="w-5 h-5" />, hasDropdown: false },
    { id: 'configuration', label: 'Configuration', icon: <Settings className="w-5 h-5" />, hasDropdown: false },
    { id: 'toolbox', label: 'Toolbox Interface', icon: <Wrench className="w-5 h-5" />, hasDropdown: false },
  ];

  // Debug: Log the sidebar items structure
  // console.log('Sidebar items structure:', JSON.stringify(sidebarItems, null, 2));

  return (
    <div 
      className={`fixed left-0 top-0 z-[40] h-screen flex flex-col border-r border-slate-700/50 bg-gradient-to-b from-[#1f2a44] via-[#141b2f] to-[#0b1020] shadow-2xl transition-all duration-300 ease-out
        ${isMobileView ? (isExpanded ? 'w-64 translate-x-0' : '-translate-x-full w-64') : (isExpanded ? 'w-64 translate-x-0' : 'w-16 translate-x-0')}`}
      style={{
        background: 'linear-gradient(180deg, #1f2a44 0%, #141b2f 52%, #0b1020 100%)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-indigo-500/20 via-blue-500/10 to-violet-500/20">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-lg border border-white/40 overflow-hidden flex items-center justify-center">
              {!logoLoadFailed ? (
                <img 
                  src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" 
                  alt="ANOCAB Logo"
                  onError={() => setLogoLoadFailed(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-slate-700">A</span>
              )}
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>ANOCAB</h1>
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
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/20">
        <button 
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200"
        >
          <HelpCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Support</span>}
        </button>
        {isExpanded && (
          <p className="mt-3 text-[11px] text-slate-400 text-center">
            © {new Date().getFullYear()} ANOCAB. All rights reserved.
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
