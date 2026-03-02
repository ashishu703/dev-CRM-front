import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import AllcustomerList from './SuperAdmin/AllcustomerList';
import SuperAdminDepartmentList from './SuperAdmin/SuperAdminDepartmentList';
import Leads from './SalesDepartmentHead/Leads';
import Configuration from './SuperAdmin/Configuration';
import PaymentInfo from './SuperAdmin/PaymentInfo';
import TodayVisit from './SalesDepartmentHead/TodayVisit';
import TeleSalesDashboard from './SuperAdmin/TeleSalesDashboard';
import OfficeSalesPersonDashboard from './SuperAdmin/OfficeSalesPersonDashboard';
import CreateOrganisation from './SuperAdmin/CreateOrganisation';
import DetailedReportPage from './Reports/DetailedReportPage';
import RfpWorkflow from './shared/RfpWorkflow';
import ToolboxInterface from './salesperson/ToolboxInterface';
import SalesIntelligenceDashboard from './salesperson/dashboard/SalesIntelligenceDashboard';

const MainDashboard = ({ activeView, setActiveView }) => {
  const { selectedCompany } = useCompany();

  // If any child widgets need to re-fetch on company change, key the tree by company
  useEffect(() => {
    // placeholder to trigger effects/data refetch in children via props/context if needed
  }, [selectedCompany]);
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <SalesIntelligenceDashboard mode="superadmin" onNavigate={setActiveView} />;
      case 'leads':
        return <Leads />;
      case 'today-visit':
        try {
          return <TodayVisit />;
        } catch (error) {
          console.error('Error rendering TodayVisit:', error);
          return <div className="p-6 bg-red-100 text-red-800">Error loading Today Visit component: {error.message}</div>;
        }
      case 'customer-list':
        return <AllcustomerList />;
      case 'department':
        return <SuperAdminDepartmentList />;
      case 'all-leads':
        return <Leads />;
      case 'configuration':
        return <Configuration />;
      case 'performance':
        return <PaymentInfo />;
      case 'tele-sales':
        return <TeleSalesDashboard />;
      case 'office-sales-person':
        return <OfficeSalesPersonDashboard />;
      case 'create-organisation':
        return <CreateOrganisation />;
      case 'rfp-workflow':
        return <RfpWorkflow />;
      case 'toolbox':
        return <ToolboxInterface />;
      default:
        if (activeView?.startsWith('detailed-report-')) {
          return <DetailedReportPage activeView={activeView} setActiveView={setActiveView} />;
        }
        return <SalesIntelligenceDashboard mode="superadmin" onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="h-full">
      <div key={`${activeView}-${selectedCompany}`} className="animate-fade-up">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainDashboard;
