import React from 'react';
import Dashboard from './Dashboard';
import DesignAndCostPlanning from './DesignAndCostPlanning';
import RawMaterialPlan from './RawMaterialPlan';
import MachineScheduling from './MachineScheduling';
import ManPowerAllotment from './ManPowerAllotment';
import InventoryControl from './InventoryControl';
import RfpWorkflow from '../../shared/RfpWorkflow';

const PPCDashboard = ({ activeView, setActiveView }) => {
  // Set default view to ppc-dashboard if not set
  React.useEffect(() => {
    if (!activeView || activeView === 'dashboard') {
      setActiveView('ppc-dashboard');
    }
  }, [activeView, setActiveView]);

  const renderContent = () => {
    console.log('PPCDashboard - activeView:', activeView);
    switch (activeView) {
      case 'ppc-dashboard':
        return <Dashboard />;
      case 'design-cost-planning':
        return <DesignAndCostPlanning />;
      case 'raw-material-plan':
        return <RawMaterialPlan />;
      case 'machine-scheduling':
        return <MachineScheduling />;
      case 'manpower-allotment':
        return <ManPowerAllotment />;
      case 'inventory-control':
      case 'inventory-items':
      case 'inventory-stores':
      case 'inventory-batch-code':
      case 'inventory-approval':
        return <InventoryControl activeView={activeView} setActiveView={setActiveView} />;
      case 'rfp-workflow':
        return <RfpWorkflow />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default PPCDashboard;

