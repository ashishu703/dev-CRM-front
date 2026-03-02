import React, { useState, useEffect } from 'react';
import FixedHeader from '../Header';
import { CompanyProvider } from '../context/CompanyContext';
import SuperAdminSidebar from './SuperAdmin/SuperAdminSidebar';

const MOBILE_BREAKPOINT = 768;

const DashboardLayout = ({ children, onLogout, activeView, setActiveView }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    if (window.innerWidth < MOBILE_BREAKPOINT && sidebarOpen) setSidebarOpen(false);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <CompanyProvider>
      <div className="flex h-screen overflow-hidden" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <SuperAdminSidebar
          onLogout={onLogout}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          isMobileView={isMobileView}
        />
        {isMobileView && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[35] md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
        <div
          className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-[margin] duration-300 ${
            isMobileView ? 'ml-0' : sidebarOpen ? 'md:ml-64' : 'md:ml-16'
          }`}
        >
          <FixedHeader
            userType="superadmin"
            currentPage={activeView}
            onToggleSidebar={() => setSidebarOpen((p) => !p)}
            sidebarOpen={sidebarOpen}
            isMobileView={isMobileView}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-3 sm:p-4 md:p-6" style={{ background: 'transparent' }}>
            {children}
          </main>
        </div>
      </div>
    </CompanyProvider>
  );
};

export default DashboardLayout;
