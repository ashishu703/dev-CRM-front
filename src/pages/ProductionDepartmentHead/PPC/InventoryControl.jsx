import React from 'react';
import Items from './Items';
import Stores from './Stores';
import BatchCode from './BatchCode';
import InventoryApproval from './InventoryApproval';

const InventoryControl = ({ activeView, setActiveView }) => {
  React.useEffect(() => {
    if (!activeView || activeView === 'inventory-control') {
      setActiveView('inventory-items');
    }
  }, [activeView, setActiveView]);

  const renderContent = () => {
    switch (activeView) {
      case 'inventory-items':
        return <Items />;
      case 'inventory-stores':
        return <Stores />;
      case 'inventory-batch-code':
        return <BatchCode />;
      case 'inventory-approval':
        return <InventoryApproval />;
      default:
        return <Items />;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default InventoryControl;

