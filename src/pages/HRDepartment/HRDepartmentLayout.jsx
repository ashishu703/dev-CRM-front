import React, { useState } from 'react';
import HRDepartmentSidebar from './HRDepartmentSidebar';
import HRDepartmentDashboard from './HRDepartmentDashboard';
import FixedHeader from '../../Header';
import AshvayChat from '../../components/AshvayChat';

const HRDepartmentLayout = ({ onLogout, activeView, setActiveView }) => {
  console.log('HRDepartmentLayout - activeView:', activeView);

  return (
    <div className="flex h-screen bg-gray-100">
      <HRDepartmentSidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FixedHeader userType="hrdepartmenthead" currentPage={activeView} />
        <div className="flex-1 overflow-y-auto">
          <HRDepartmentDashboard activeView={activeView} setActiveView={setActiveView} />
        </div>
      </div>
      <AshvayChat />
    </div>
  );
};

export default HRDepartmentLayout;
