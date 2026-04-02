import React from 'react';
import SalesIntelligenceDashboard from '../salesperson/dashboard/SalesIntelligenceDashboard';
import Leads from './Leads';
import PaymentInfo from './PaymentInfo';
import StockUpdate from './StockUpdate';
import CalculatorProductList from './CalculatorProductList';
import RfpWorkflow from '../shared/RfpWorkflow';
import ToolboxInterface from '../salesperson/ToolboxInterface';
import SalesDepartmentUser from './SalesDepartmentUser';
import CreatePIForm from '../salesperson/CreatePIForm';

const SalesDepartmentHeadDashboard = ({ activeView, setActiveView }) => {
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      if (!activeView || activeView === 'sales-dashboard') {
        setActiveView('dashboard');
      }
      hasInitializedRef.current = true;
    }
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
      case 'sales-dashboard':
        return <SalesIntelligenceDashboard mode="head" onNavigate={setActiveView} />;
      case 'leads':
        return <Leads />;
      case 'payment-info':
        return <PaymentInfo />;
      case 'rfp-workflow':
        return <RfpWorkflow setActiveView={setActiveView} />;
      case 'calculator':
        return <CalculatorProductList setActiveView={setActiveView} />;
      case 'create-pi':
        return <CreatePIForm />;
      case 'toolbox':
        return <ToolboxInterface />;
      case 'stock-update':
        return <StockUpdate />;
      case 'users':
        return <SalesDepartmentUser setActiveView={setActiveView} />;
      default:
        return <SalesIntelligenceDashboard mode="head" onNavigate={setActiveView} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default SalesDepartmentHeadDashboard;

