import React, { useState, useEffect } from 'react';
import ProductionDepartmentHeadSidebar from './ProductionDepartmentHeadSidebar';
import FixedHeader from '../../Header';
import AshvayChat from '../../components/AshvayChat';

export default function ProductionDepartmentHeadLayout({ onLogout, activeView, setActiveView, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col h-screen">
          <FixedHeader
            userType="productiondepartmenthead"
            currentPage={activeView}
            onToggleMobileView={() => setIsMobileView(!isMobileView)}
            isMobileView={isMobileView}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
          <div className="flex-1 overflow-hidden">
            <ProductionDepartmentHeadSidebar
              onLogout={onLogout}
              activeView={activeView}
              setActiveView={setActiveView}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen relative transition-colors flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      <ProductionDepartmentHeadSidebar
        onLogout={onLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
      />
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0 overflow-hidden">
        <FixedHeader
          userType="productiondepartmenthead"
          currentPage={activeView}
          onToggleMobileView={() => setIsMobileView(!isMobileView)}
          isMobileView={isMobileView}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <div className={`flex-1 overflow-y-auto transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {children}
        </div>
      </div>
      <AshvayChat showFloatingButton={false} />
    </div>
  );
}