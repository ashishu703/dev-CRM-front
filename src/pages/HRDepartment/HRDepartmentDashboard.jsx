import React from 'react';
import HRDashboardContent from './HRDashboardContent';
import EmployeeManagement from './EmployeeManagement';
import AttendanceManagement from './AttendanceManagement';
import LeaveManagement from './LeaveManagement';
import PayrollManagement from './PayrollManagement';
import PerformanceManagement from './PerformanceManagement';
import HRReports from './HRReports';
import TrainingManagement from './TrainingManagement';
import ApprovalManagement from './ApprovalManagement';
import DepartmentManagement from './DepartmentManagement';
import AddEmployee from './AddEmployee';
import Settings from './Settings';
import Profile from './Profile';

const HRDepartmentDashboard = ({ activeView, setActiveView }) => {
  const renderContent = () => {
    console.log('HRDepartmentDashboard - activeView:', activeView);
    switch (activeView) {
      case 'hr-dashboard':
        return <HRDashboardContent setActiveView={setActiveView} />;
      case 'employee-management':
        return <EmployeeManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'leave-management':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'performance':
        return <PerformanceManagement />;
      case 'reports':
        return <HRReports />;
      case 'training':
        return <TrainingManagement />;
      case 'approval':
        return <ApprovalManagement />;
      case 'department-management':
        return <DepartmentManagement />;
      case 'add-employee':
        return <AddEmployee />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <HRDashboardContent setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default HRDepartmentDashboard;
