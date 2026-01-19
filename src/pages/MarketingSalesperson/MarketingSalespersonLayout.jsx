import React, { useState, useEffect } from 'react';
import MarketingSalespersonSidebar from './MarketingSalespersonSidebar';
import GenerateLead from './GenerateLead';
import Tasks from './Tasks';
import FollowUps from './FollowUps';
import Reimbursement from './Reimbursement';
import FixedHeader from '../../Header';

export default function MarketingSalespersonLayout({ onLogout }) {
  const [currentPage, setCurrentPage] = useState('generate-lead');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('marketing'); // 'marketing' or 'sales'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleView = () => {
    setViewMode(prev => prev === 'marketing' ? 'sales' : 'marketing');
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'generate-lead':
        return <GenerateLead />;
      case 'tasks':
        return <Tasks />;
      case 'follow-ups':
        return <FollowUps />;
      case 'reimbursement':
        return <Reimbursement />;
      default:
        return <GenerateLead />;
    }
  };

  return (
    <div className={`min-h-screen relative transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Mobile overlay */}
      {isMobileView && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <MarketingSalespersonSidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        isMobileView={isMobileView}
      />
      
      <div className={`transition-all duration-300 ${
        isMobileView 
          ? 'w-full' 
          : sidebarOpen 
            ? 'lg:ml-64' 
            : 'lg:ml-16'
      }`}>
        <FixedHeader 
          userType="marketing-salesperson" 
          currentPage={currentPage}
          isMobileView={isMobileView}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onToggleView={handleToggleView}
        />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
