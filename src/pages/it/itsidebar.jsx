import React, { useState } from 'react';
import { Activity, HelpCircle, Ticket, Users, Shield, Server, ChevronRight, X, CheckSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png";

// IT Head Menu - Merged and simplified
const itHeadMenu = [
  { id: 'it-dashboard', label: 'Dashboard', icon: Activity },
  { id: 'it-tickets', label: 'Tickets', icon: Ticket },
  { id: 'it-users', label: 'Users & Access', icon: Users },
  { id: 'it-security', label: 'Security & Logs', icon: Shield }
];

// IT User Menu (Simplified)
const itUserMenu = [
  { id: 'it-dashboard', label: 'Dashboard', icon: Activity },
  { id: 'it-assigned-tickets', label: 'Assigned Tickets', icon: Ticket },
  { id: 'it-assigned-tasks', label: 'Assigned Tasks', icon: CheckSquare }
];

const ItSidebar = ({ activeView, setActiveView, onLogout }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const isHead = user?.role === 'department_head' || user?.uiUserType === 'itdepartmenthead';
  const menu = isHead ? itHeadMenu : itUserMenu;
  
  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <img 
              src={ANOCAB_LOGO} 
              alt="ANOCAB Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="font-bold text-gray-800 text-lg">ANOCAB</h1>
              <p className="text-xs text-gray-500">IT Department</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 hover:bg-gray-100 rounded transition-colors ${!isExpanded ? 'mx-auto' : ''}`}
        >
          {isExpanded ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
              </span>
              {isExpanded && isActive && (
                <ChevronRight className="w-4 h-4 text-blue-600" />
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Support */}
      <div className="px-3 py-4 border-t border-slate-200 space-y-1">
        <button
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-gray-500" />
          {isExpanded && <span className="text-sm font-medium">Support</span>}
        </button>
      </div>
    </aside>
  );
};

export default ItSidebar;

