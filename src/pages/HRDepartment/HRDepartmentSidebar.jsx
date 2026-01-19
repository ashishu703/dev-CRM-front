import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  CheckCircle,
  BookOpen,
  Building2,
  UserPlus,
  HelpCircle
} from 'lucide-react';

const HRDepartmentSidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'hr-dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
    { id: 'employee-management', label: 'Employee Management', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave-management', label: 'Leave Management', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'reports', label: 'HR Reports', icon: BarChart3 },
    { id: 'training', label: 'Training', icon: BookOpen },
    { id: 'approval', label: 'Approval', icon: CheckCircle },
    { id: 'department-management', label: 'Department', icon: Building2 },
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus }
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">HR Department</h1>
        <p className="text-sm text-gray-500">Human Resources Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Support Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <HelpCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">Support</span>
        </button>
      </div>
    </div>
  );
};

export default HRDepartmentSidebar;
