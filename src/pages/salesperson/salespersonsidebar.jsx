"use client"

import { useRef, useEffect, useState } from "react"
import { LayoutDashboard, Menu, X, Package, Wrench, HelpCircle, FileText, CreditCard } from "lucide-react"
import LeadStatusDropdown from './LeadStatusDropdown'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Sidebar({ currentPage, onNavigate, onLogout, sidebarOpen, setSidebarOpen, isDarkMode = false, isMobileView = false }) {
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const collapseTimerRef = useRef(null);
  const isManuallyToggledRef = useRef(false);

  const handleMouseEnter = () => {
  };

  const handleMouseLeave = () => {
    // No auto-collapse on hover
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

  return (
    <>
      {!sidebarOpen && (
        <div
          className="fixed top-0 left-0 w-8 h-screen z-30"
          onMouseEnter={handleMouseEnter}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {/* Sidebar — gradient depth + shadow */}
      <div
        className={cx(
          "fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-out",
          "border-r border-slate-700/60",
          "shadow-[4px_0_24px_rgba(0,0,0,0.15)]",
          isMobileView 
            ? (sidebarOpen ? "w-60" : "-translate-x-full w-60")
            : (sidebarOpen ? "w-60" : "w-[72px]"),
        )}
        style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 45%, #0c1222 100%)' }}
        onMouseEnter={!isMobileView ? handleMouseEnter : undefined}
        onMouseLeave={!isMobileView ? handleMouseLeave : undefined}
      >
        <div className="p-4 border-b border-slate-700/60 min-h-[64px]">
          <div className="flex items-center justify-between gap-2">
            {sidebarOpen && (
              <div className="min-w-0 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/95 border border-white/40 p-1 shadow-md overflow-hidden flex-shrink-0">
                  {!logoLoadFailed ? (
                    <img
                      src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
                      alt="ANOCAB Logo"
                      onError={() => setLogoLoadFailed(true)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-[11px] font-bold text-slate-700">A</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="font-semibold text-white text-base truncate">ANOCAB</h1>
                  <p className="text-[11px] text-[var(--sidebar-text-muted)] truncate">Salesperson</p>
                </div>
              </div>
            )}
            <button onClick={handleToggle} className="p-2 hover:bg-[var(--sidebar-hover)] rounded-lg transition-colors text-[var(--sidebar-text)] hover:text-white flex-shrink-0" type="button" aria-label="Toggle sidebar">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1.5">
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "dashboard"
                    ? 'bg-[var(--sidebar-active)] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_0_12px_rgba(37,99,235,0.25)]'
                    : 'hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] hover:text-white'
                )}
                onClick={() => onNavigate("dashboard")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "dashboard" ? 'text-white' : 'text-[var(--sidebar-text)]'}>
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard</span>
                  )}
                </div>
              </div>
            </li>
            {/* Lead Status (Leads, Enquiries, Scheduled Call, Last Call) */}
            <LeadStatusDropdown 
              currentPage={currentPage} 
              onNavigate={onNavigate} 
              sidebarOpen={sidebarOpen} 
              isDarkMode={isDarkMode}
            />
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "rfp-requests"
                    ? 'bg-[var(--sidebar-active)] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_0_12px_rgba(37,99,235,0.25)]'
                    : 'hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] hover:text-white'
                )}
                onClick={() => onNavigate("rfp-requests")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "rfp-requests" ? 'text-white' : 'text-[var(--sidebar-text)]'}>
                    <FileText className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>RFP</span>
                  )}
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "payment-tracking"
                    ? 'bg-[var(--sidebar-active)] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_0_12px_rgba(37,99,235,0.25)]'
                    : 'hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] hover:text-white'
                )}
                onClick={() => onNavigate("payment-tracking")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "payment-tracking" ? 'text-white' : 'text-[var(--sidebar-text)]'}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Payment Tracking</span>
                  )}
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "toolbox"
                    ? 'bg-[var(--sidebar-active)] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_0_12px_rgba(37,99,235,0.25)]'
                    : 'hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] hover:text-white'
                )}
                onClick={() => onNavigate("toolbox")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "toolbox" ? 'text-white' : 'text-[var(--sidebar-text)]'}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Toolbox Interface</span>
                  )}
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "stock"
                    ? 'bg-[var(--sidebar-active)] text-white shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_0_12px_rgba(37,99,235,0.25)]'
                    : 'hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] hover:text-white'
                )}
                onClick={() => onNavigate("stock")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "stock" ? 'text-white' : 'text-[var(--sidebar-text)]'}>
                    <Package className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Available Stock</span>
                  )}
                </div>
              </div>
            </li>
          </ul>
        </nav>
        
        {/* Support */}
        <div className="p-2 border-t border-slate-800/80">
          <button 
            onClick={() => window.location.href = '/support'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-white transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Support</span>}
          </button>
          {sidebarOpen && (
            <p className="mt-2 text-[11px] text-[var(--sidebar-text-muted)] text-center">
              © {new Date().getFullYear()} ANOCAB. All rights reserved.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
