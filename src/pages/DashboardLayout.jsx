import React from 'react';
import FixedHeader from '../Header';
import { CompanyProvider } from '../context/CompanyContext';
import SuperAdminSidebar from './SuperAdmin/SuperAdminSidebar';
import AshvayChat from '../components/AshvayChat';

const DashboardLayout = ({ children, onLogout, activeView, setActiveView }) => {
  return (
    <CompanyProvider>
      <div className="flex h-screen" style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Sidebar */}
        <SuperAdminSidebar onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <FixedHeader userType="superadmin" currentPage={activeView} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto" style={{ 
            background: 'transparent'
          }}>
            {children}
          </main>
        </div>
      </div>
      <AshvayChat />
    </CompanyProvider>
  );
};

export default DashboardLayout;
