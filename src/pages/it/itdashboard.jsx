import React, { useEffect } from 'react';
import ITDashboardRouter from './ITDashboardRouter';

const ItDashboard = ({ activeView, setActiveView }) => {
  useEffect(() => {
    if (!activeView || activeView === 'dashboard') {
      setActiveView('it-dashboard');
    }
  }, [activeView, setActiveView]);

  return <ITDashboardRouter activeView={activeView} setActiveView={setActiveView} />;
};

export default ItDashboard;

