import React, { useState } from 'react';
import FixedHeader from '../../Header';
import SalesDepartmentHeadSidebar from './SalesDepartmentHeadSidebar';
import AshvayChat from '../../components/AshvayChat';

const SalesDepartmentHeadLayout = ({ children, onLogout, activeView, setActiveView }) => {
  // Start with sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // md breakpoint
    }
    return false;
  });
  
  return (
    <div className="min-h-screen relative transition-colors bg-gray-50">
      {/* Sidebar */}
      <SalesDepartmentHeadSidebar 
        onLogout={onLogout} 
        activeView={activeView} 
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen 
          ? "ml-0 sm:ml-16 md:ml-64" 
          : "ml-0 sm:ml-16"
      }`}>
        {/* Header */}
        <FixedHeader 
          userType="salesdepartmenthead" 
          currentPage={activeView} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Main Content */}
        <div className="flex-1 transition-colors bg-gray-50">
          {children}
        </div>
      </div>
      <AshvayChat showFloatingButton={false} />
    </div>
  );
};

export default SalesDepartmentHeadLayout;
