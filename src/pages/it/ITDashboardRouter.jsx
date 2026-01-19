import React from 'react';
import ITDashboardMain from './components/ITDashboardMain';
import TicketManagement from './components/TicketManagement';
import UserAccessManagement from './components/UserAccessManagement';
import MergedSecurityManagement from './components/MergedSecurityManagement';
import ITUserDashboard from './components/ITUserDashboard';
import ITUserAssignedTickets from './components/ITUserAssignedTickets';
import ITUserAssignedTasks from './components/ITUserAssignedTasks';
import { useAuth } from '../../hooks/useAuth';

const ITDashboardRouter = ({ activeView, setActiveView }) => {
  const { user } = useAuth();
  const isHead = user?.role === 'department_head' || user?.uiUserType === 'itdepartmenthead';

  // IT User gets simplified view
  if (!isHead) {
    switch (activeView) {
      case 'it-assigned-tickets':
        return <ITUserAssignedTickets />;
      case 'it-assigned-tasks':
        return <ITUserAssignedTasks />;
      case 'it-dashboard':
      default:
        return <ITUserDashboard activeView={activeView} setActiveView={setActiveView} />;
    }
  }

  // IT Head gets full features
  switch (activeView) {
    case 'it-dashboard':
    case 'it-systems':
      return <ITDashboardMain setActiveView={setActiveView} />;
    case 'it-tickets':
      return <TicketManagement />;
    case 'it-users':
      return <UserAccessManagement />;
    case 'it-security':
      return <MergedSecurityManagement />;
    default:
      return <ITDashboardMain setActiveView={setActiveView} />;
  }
};

export default ITDashboardRouter;

