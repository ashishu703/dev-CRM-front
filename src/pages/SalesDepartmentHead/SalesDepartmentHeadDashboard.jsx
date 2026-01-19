import React from 'react';
import SalesHeadDashboard from './salesHeadDashboard';
import Leads from './Leads';
import UserPerformance from './UserPerformance';
import PaymentInfo from './PaymentInfo';
import SalesDepartmentUser from './SalesDepartmentUser';
import StockUpdate from './StockUpdate';
import ReportsPage from '../Reports/ReportsPage';
import DetailedReportPage from '../Reports/DetailedReportPage';

const SalesDepartmentHeadDashboard = ({ activeView, setActiveView }) => {
  // Set default view to sales-dashboard if not set (only on initial mount, once)
  const hasInitializedRef = React.useRef(false);
  
  React.useEffect(() => {
    // Only set default once on initial mount if activeView is not set
    if (!hasInitializedRef.current) {
      if (!activeView || activeView === 'dashboard') {
        setActiveView('sales-dashboard');
      }
      hasInitializedRef.current = true;
    }
  }, []); // Empty array - only run once on mount

  const renderContent = () => {
    console.log('SalesDepartmentHeadDashboard - activeView:', activeView);
    
    if (activeView?.startsWith('detailed-report-')) {
      console.log('Rendering DetailedReportPage');
      return <DetailedReportPage activeView={activeView} setActiveView={setActiveView} />;
    }
    
    switch (activeView) {
      case 'sales-dashboard':
        return <SalesHeadDashboard setActiveView={setActiveView} />;
      case 'leads':
        return <Leads />;
      case 'user-performance':
        return <UserPerformance />;
      case 'payment-info':
        return <PaymentInfo />;
      case 'sales-department-users':
        return <SalesDepartmentUser setActiveView={setActiveView} />;
      case 'stock-update':
        return <StockUpdate />;
      case 'reports':
        console.log('✅ Rendering ReportsPage component');
        return <ReportsPage setActiveView={setActiveView} />;
      default:
        // Handle default case - if it's 'dashboard' or empty, show sales dashboard
        // Otherwise show sales dashboard as fallback
        if (!activeView || activeView === 'dashboard') {
          return <SalesHeadDashboard setActiveView={setActiveView} />;
        }
        console.log('⚠️ Unknown activeView:', activeView, '- showing SalesHeadDashboard');
        return <SalesHeadDashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default SalesDepartmentHeadDashboard;

