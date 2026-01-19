import React from 'react';
import FixedHeader from '../../Header';
import ItSidebar from './itsidebar';
import AshvayChat from '../../components/AshvayChat';

const ItLayout = ({ children, onLogout, activeView, setActiveView, headerUserType = 'itdepartmenthead' }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <ItSidebar onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FixedHeader userType={headerUserType} currentPage={activeView} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">{children}</main>
      </div>
      <AshvayChat showFloatingButton={false} />
    </div>
  );
};

export default ItLayout;

