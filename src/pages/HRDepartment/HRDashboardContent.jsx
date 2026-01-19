import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  UserPlus,
  Building2,
  BarChart3
} from 'lucide-react';

const HRDashboardContent = ({ setActiveView }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Sample data for HR dashboard
  const hrStats = {
    totalEmployees: 156,
    activeEmployees: 142,
    onLeave: 8,
    newHires: 12,
    pendingApprovals: 5,
    trainingSessions: 8,
    departments: 6,
    attendanceRate: 94.2
  };

  const recentActivities = [
    { id: 1, type: 'hire', message: 'John Smith joined as Software Engineer', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'leave', message: 'Sarah Johnson applied for vacation leave', time: '4 hours ago', status: 'pending' },
    { id: 3, type: 'training', message: 'New training session scheduled for next week', time: '1 day ago', status: 'scheduled' },
    { id: 4, type: 'performance', message: 'Monthly performance reviews completed', time: '2 days ago', status: 'completed' }
  ];

  const quickActions = [
    { 
      title: 'Add Employee', 
      description: 'Add new employee to the system', 
      icon: UserPlus, 
      color: 'bg-blue-500',
      action: () => setActiveView('add-employee')
    },
    { 
      title: 'Manage Departments', 
      description: 'View and manage departments', 
      icon: Building2, 
      color: 'bg-green-500',
      action: () => setActiveView('department-management')
    },
    { 
      title: 'View Reports', 
      description: 'Generate HR reports', 
      icon: BarChart3, 
      color: 'bg-purple-500',
      action: () => setActiveView('reports')
    },
    { 
      title: 'Pending Approvals', 
      description: 'Review pending requests', 
      icon: AlertCircle, 
      color: 'bg-orange-500',
      action: () => setActiveView('approval')
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Welcome to Human Resources Management System</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveView('employee-management')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Employees
          </button>
          <button
            onClick={() => setActiveView('add-employee')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={hrStats.totalEmployees}
          icon={Users}
          color="bg-blue-500"
          change="5.2"
          changeType="positive"
        />
        <StatCard
          title="Active Employees"
          value={hrStats.activeEmployees}
          icon={CheckCircle}
          color="bg-green-500"
          change="2.1"
          changeType="positive"
        />
        <StatCard
          title="On Leave"
          value={hrStats.onLeave}
          icon={Calendar}
          color="bg-orange-500"
        />
        <StatCard
          title="New Hires"
          value={hrStats.newHires}
          icon={UserPlus}
          color="bg-purple-500"
          change="15.3"
          changeType="positive"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'completed' ? 'bg-green-500' : 
                  activity.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  activity.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Department Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Human Resources</span>
              <span className="text-sm font-semibold text-gray-900">12 employees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Information Technology</span>
              <span className="text-sm font-semibold text-gray-900">25 employees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Finance</span>
              <span className="text-sm font-semibold text-gray-900">8 employees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Marketing</span>
              <span className="text-sm font-semibold text-gray-900">15 employees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sales</span>
              <span className="text-sm font-semibold text-gray-900">32 employees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operations</span>
              <span className="text-sm font-semibold text-gray-900">18 employees</span>
            </div>
          </div>
          <button
            onClick={() => setActiveView('department-management')}
            className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Departments →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardContent;
