import React, { useState } from 'react';
import { BarChart3, CreditCard, LogOut, Shield, HelpCircle, Menu, X, DollarSign } from 'lucide-react';

const menuItems = [
  {
    id: 'accounts-dashboard',
    label: 'Accounts Dashboard',
    icon: BarChart3,
    description: 'Overview & insights'
  },
  {
    id: 'accounts-payments',
    label: 'Payment Info',
    icon: CreditCard,
    description: 'Approvals & history'
  },
  {
    id: 'price-updation',
    label: 'Price Management',
    icon: DollarSign,
    description: 'Manage all product pricing'
  }
];

const AccountsSidebar = ({ activeView, setActiveView, onLogout, userType = 'accountsdepartmenthead' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const departmentLabel = userType.includes('it') ? 'IT Department' : 'Accounts Department';

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[101] p-2 bg-white border border-slate-200 rounded-lg shadow-lg hover:bg-slate-50 transition"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[100]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-[101] md:z-auto w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="px-5 py-6 border-b border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">ANOCAB</p>
              <p className="text-sm font-semibold text-slate-900">{departmentLabel}</p>
              <p className="text-xs text-slate-500">{userType.includes('head') ? 'Department Head' : 'Team Workspace'}</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-2">
        {menuItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ItemIcon className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>{item.description}</p>
              </div>
            </button>
          );
        })}
      </nav>
      
      {/* Support Button */}
      <div className="px-4 py-3 border-t border-slate-200">
        <button
          onClick={() => {
            window.location.href = '/support';
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-slate-600 hover:bg-slate-100"
        >
          <HelpCircle className="w-5 h-5" />
          <div>
            <p className="text-sm font-semibold">Support</p>
            <p className="text-xs text-slate-500">Get help & assistance</p>
          </div>
        </button>
      </div>

      <div className="px-4 py-5 border-t border-slate-200">
        <button
          onClick={() => {
            setIsMobileOpen(false);
            onLogout();
          }}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default AccountsSidebar;

