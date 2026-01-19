import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign,
  Target,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Package,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Activity,
  HelpCircle,
  Wrench
} from 'lucide-react';

const ProductionDepartmentHeadSidebar = ({ onLogout, activeView, setActiveView }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const sidebarItems = [
    {
      id: 'production-dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'ppc',
      label: 'PPC',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'qc',
      label: 'QC',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      id: 'inventory-management',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'maintenance-management',
      label: 'Maintenance',
      icon: <Wrench className="w-5 h-5" />
    },
    {
      id: 'reports-management',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'dispatch',
      label: 'Dispatch',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'supervisor',
      label: 'Supervisor',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'store',
      label: 'Store',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'production-users',
      label: 'Department Users',
      icon: <Users className="w-5 h-5" />
    },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} h-screen flex flex-col border-r border-gray-200 shrink-0`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
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
                <p className="text-xs text-gray-500">Production Department Head</p>
              </div>
            </div>
          )}
          {!isExpanded && (
            <div className="flex justify-center w-full">
              <img 
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" 
                alt="ANOCAB Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
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

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default ProductionDepartmentHeadSidebar;