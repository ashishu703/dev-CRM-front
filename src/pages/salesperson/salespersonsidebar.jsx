"use client"

import { useRef, useEffect } from "react"
import { LayoutDashboard, Menu, X, Package, Wrench, HelpCircle, FileText } from "lucide-react"
import LeadStatusDropdown from './LeadStatusDropdown'
import PaymentTrackingDropdown from './PaymentTrackingDropdown'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function Sidebar({ currentPage, onNavigate, onLogout, sidebarOpen, setSidebarOpen, isDarkMode = false, isMobileView = false }) {
  const collapseTimerRef = useRef(null);
  const isManuallyToggledRef = useRef(false);

  // Auto-expand on mouse enter - immediate response
  const handleMouseEnter = () => {
    // Don't auto-expand if manually closed
    if (isManuallyToggledRef.current && !sidebarOpen) {
      return;
    }
    
    // Clear any pending collapse timer immediately
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    
    // Auto-expand immediately if sidebar is closed
    if (!sidebarOpen) {
      // Only auto-expand if not manually closed
      if (!isManuallyToggledRef.current) {
        setSidebarOpen(true);
      }
    }
  };

  const handleMouseLeave = () => {
    // Reset manual toggle flag when mouse leaves (allows auto-expand on next hover)
    if (isManuallyToggledRef.current && !sidebarOpen) {
      // If sidebar was manually closed and mouse leaves, reset flag after a short delay
      setTimeout(() => {
        isManuallyToggledRef.current = false;
      }, 300);
    }
    
    // Only auto-collapse if not manually toggled to stay open
    if (!isManuallyToggledRef.current) {
      collapseTimerRef.current = setTimeout(() => {
        setSidebarOpen(false);
      }, 1500); // Collapse after 1.5 seconds (reduced from 2 seconds for faster response)
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

  // Handle manual toggle
  const handleToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newState = !sidebarOpen;
    
    // Set flag based on new state:
    // - If closing (newState = false), set flag to true (manually closed - prevent auto-expand)
    // - If opening (newState = true), set flag to false (can auto-collapse again)
    isManuallyToggledRef.current = !newState;
    
    // Clear any pending timers first
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    
    // Set the new state
    setSidebarOpen(newState);
  };

  return (
    <>
      {/* Hover trigger zone when sidebar is collapsed - makes it easier to expand */}
      {!sidebarOpen && (
        <div
          className="fixed top-0 left-0 w-8 h-screen z-30"
          onMouseEnter={handleMouseEnter}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cx(
          "fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-out",
          "bg-slate-900 border-r border-slate-800/80",
          isMobileView 
            ? (sidebarOpen ? "w-60" : "-translate-x-full w-60")
            : (sidebarOpen ? "w-60" : "w-[72px]"),
        )}
        onMouseEnter={!isMobileView ? handleMouseEnter : undefined}
        onMouseLeave={!isMobileView ? handleMouseLeave : undefined}
      >
        <div className="p-4 border-b border-slate-800/80 min-h-[64px]">
          <div className="flex items-center justify-between gap-2">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-semibold text-white text-base truncate">ANOCAB</h1>
                  <p className="text-[11px] text-slate-400 truncate">Salesperson</p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
            )}
            <button onClick={handleToggle} className="p-2 hover:bg-slate-800/60 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0" type="button" aria-label="Toggle sidebar">
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
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("dashboard")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "dashboard" ? 'text-white' : 'text-slate-400'}>
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard</span>
                  )}
                </div>
              </div>
            </li>
            {/* Leads moved into LeadStatusDropdown - standalone entry removed intentionally */}
            <LeadStatusDropdown 
              currentPage={currentPage} 
              onNavigate={onNavigate} 
              sidebarOpen={sidebarOpen} 
              isDarkMode={isDarkMode}
            />
            <PaymentTrackingDropdown 
              currentPage={currentPage} 
              onNavigate={onNavigate} 
              sidebarOpen={sidebarOpen} 
              isDarkMode={isDarkMode}
            />
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "toolbox"
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("toolbox")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "toolbox" ? 'text-white' : 'text-slate-400'}>
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
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("stock")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "stock" ? 'text-white' : 'text-slate-400'}>
                    <Package className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Available Stock</span>
                  )}
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentPage === "rfp-requests"
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("rfp-requests")}
              >
                <div className="flex items-center space-x-3">
                  <div className={currentPage === "rfp-requests" ? 'text-white' : 'text-slate-400'}>
                    <FileText className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>RFP Raise & Approved</span>
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Support</span>}
          </button>
        </div>
      </div>
    </>
  )
}
