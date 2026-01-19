import React from 'react';
import FixedHeader from '../../Header';
import AccountsSidebar from './accountssidebar';
import AshvayChat from '../../components/AshvayChat';

const AccountsLayout = ({ children, onLogout, activeView, setActiveView, headerUserType = 'accountsdepartmenthead' }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <AccountsSidebar
        onLogout={onLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        userType={headerUserType}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        <FixedHeader userType={headerUserType} currentPage={activeView} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4 md:p-6 pt-14 md:pt-4">
          {children}
        </main>
      </div>
      <AshvayChat showFloatingButton={false} />
    </div>
  );
};

export default AccountsLayout;

