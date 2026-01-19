"use client"

import { useState, useRef, useEffect } from "react"
import { LayoutDashboard, Users, LogOut, Menu, X, FileText, CheckSquare, MapPin, DollarSign } from "lucide-react"

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function MarketingSalespersonSidebar({ 
  currentPage, 
  onNavigate, 
  onLogout, 
  sidebarOpen, 
  setSidebarOpen, 
  isDarkMode = false, 
  isMobileView = false 
}) {
  const collapseTimerRef = useRef(null);
  const isManuallyToggledRef = useRef(false);

  const handleMouseEnter = () => {
    if (isManuallyToggledRef.current && !sidebarOpen) {
      return;
    }
    
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    
    if (!sidebarOpen) {
      if (!isManuallyToggledRef.current) {
        setSidebarOpen(true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isManuallyToggledRef.current && !sidebarOpen) {
      setTimeout(() => {
        isManuallyToggledRef.current = false;
      }, 300);
    }
    
    if (!isManuallyToggledRef.current) {
      collapseTimerRef.current = setTimeout(() => {
        setSidebarOpen(false);
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const handleToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newState = !sidebarOpen;
    isManuallyToggledRef.current = !newState;
    
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    
    setSidebarOpen(newState);
  };

  const menuItems = [
    { id: 'generate-lead', label: 'Generate Lead', icon: <Users className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'follow-ups', label: 'Follow-ups', icon: <MapPin className="w-5 h-5" /> },
    { id: 'reimbursement', label: 'Reimbursement', icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <>
      {!sidebarOpen && !isMobileView && (
        <div
          className="fixed top-0 left-0 w-8 h-screen z-30"
          onMouseEnter={handleMouseEnter}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      <div
        className={cx(
          "fixed top-0 left-0 h-screen z-50 shadow-2xl border-r transition-all duration-300 flex flex-col",
          "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-slate-700/50",
          isMobileView 
            ? (sidebarOpen ? "w-64" : "-translate-x-full w-64")
            : (sidebarOpen ? "w-64" : "w-16"),
        )}
        onMouseEnter={!isMobileView ? handleMouseEnter : undefined}
        onMouseLeave={!isMobileView ? handleMouseLeave : undefined}
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
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
                  <p className="text-xs text-slate-400">Marketing Salesperson</p>
                </div>
              </div>
            )}
            <button
              onClick={handleToggle}
              className={`p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 text-slate-300 hover:text-white ${!sidebarOpen ? 'mx-auto' : ''}`}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cx(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                  )}
                  style={{
                    transform: currentPage === item.id ? 'translateX(4px)' : 'none',
                  }}
                >
                  <div className={currentPage === item.id ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
