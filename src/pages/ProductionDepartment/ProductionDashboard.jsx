import React from 'react';

// Mount the standalone Production module using its MemoryRouter to avoid interfering with the app router
// Note: path contains a space: "Production department". Vite can import via relative path with quotes.
import { ProductionModuleApp } from '../../../Production department/frontend/src/module/ProductionModuleApp';

const ProductionDashboard = () => {
  return (
    <div className="h-full">
      <ProductionModuleApp useMemoryRouter={true} initialPath="/" renderShell={false} />
    </div>
  );
};

export default ProductionDashboard;


