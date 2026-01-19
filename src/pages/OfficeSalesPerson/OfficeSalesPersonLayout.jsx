import React, { useState } from 'react';
import OfficeSalesPersonSidebar from './OfficeSalesPersonSidebar';
import OfficeSalesPersonDashboard from './OfficeSalesPersonDashboard';
import FixedHeader from '../../Header';
import AshvayChat from '../../components/AshvayChat';

const OfficeSalesPersonLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      <OfficeSalesPersonSidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
      />
      <div className="flex-1 overflow-hidden">
        <FixedHeader userType="office-sales-person" currentPage={activeView} />
        <OfficeSalesPersonDashboard activeView={activeView} />
      </div>
      <AshvayChat showFloatingButton={false} />
    </div>
  );
};

export default OfficeSalesPersonLayout;
