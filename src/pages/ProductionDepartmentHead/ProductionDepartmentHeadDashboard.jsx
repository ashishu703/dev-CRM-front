import React from 'react';
import ProductionHeadDashboard from './ProductionHeadDashboard';
import ProductionPlanning from './ProductionPlanning';
import PPC from './PPC';
import QC from './QC';
import InventoryManagement from './InventoryManagement';
import MaintenanceManagement from './MaintenanceManagement';
import ReportsManagement from './ReportsManagement';
import Dispatch from './Dispatch';
import Supervisor from './Supervisor';
import Store from './Store';
import QualityControl from './QualityControl';
import ProductionExecution from './ProductionExecution';
import Maintenance from './Maintenance';
import Inventory from './Inventory';
import ProductionUsers from './ProductionUsers';
import Reports from './Reports';

const ProductionDepartmentHeadDashboard = ({ activeView, setActiveView }) => {
  // Set default view to production-dashboard if not set
  React.useEffect(() => {
    if (!activeView || activeView === 'dashboard') {
      setActiveView('production-dashboard');
    }
  }, [activeView, setActiveView]);

  const renderContent = () => {
    console.log('ProductionDepartmentHeadDashboard - activeView:', activeView);
    switch (activeView) {
      case 'production-dashboard':
        return <ProductionHeadDashboard setActiveView={setActiveView} />;
      case 'ppc':
        return <PPC activeView={activeView} setActiveView={setActiveView} />;
      case 'qc':
        return <QC activeView={activeView} setActiveView={setActiveView} />;
      case 'inventory-management':
        return <InventoryManagement activeView={activeView} setActiveView={setActiveView} />;
      case 'maintenance-management':
        return <MaintenanceManagement activeView={activeView} setActiveView={setActiveView} />;
      case 'reports-management':
        return <ReportsManagement activeView={activeView} setActiveView={setActiveView} />;
      case 'dispatch':
        return <Dispatch />;
      case 'supervisor':
        return <Supervisor />;
      case 'store':
        return <Store />;
      case 'production-planning':
      case 'production-schedule':
      case 'design-cost':
      case 'work-orders':
      case 'capacity-planning':
      case 'backload-planning':
        return <ProductionPlanning activeView={activeView} setActiveView={setActiveView} />;
      case 'quality-control':
      case 'inspection-lots':
      case 'quality-metrics':
      case 'non-conformance':
        return <QualityControl activeView={activeView} setActiveView={setActiveView} />;
      case 'production-execution':
      case 'execution-console':
      case 'machine-status':
      case 'operator-performance':
        return <ProductionExecution activeView={activeView} setActiveView={setActiveView} />;
      case 'maintenance':
      case 'maintenance-orders':
      case 'preventive-maintenance':
      case 'equipment-status':
        return <Maintenance activeView={activeView} setActiveView={setActiveView} />;
      case 'inventory':
      case 'raw-materials':
      case 'finished-goods':
      case 'stock-alerts':
        return <Inventory activeView={activeView} setActiveView={setActiveView} />;
      case 'production-users':
        return <ProductionUsers />;
      case 'reports':
      case 'production-reports':
      case 'efficiency-metrics':
      case 'cost-analysis':
        return <Reports activeView={activeView} setActiveView={setActiveView} />;
      default:
        return <ProductionHeadDashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default ProductionDepartmentHeadDashboard;