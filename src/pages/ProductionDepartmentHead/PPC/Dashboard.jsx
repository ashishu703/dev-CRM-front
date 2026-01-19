import React from 'react';
import { BarChart3, TrendingUp, Package, Factory, Users, Calendar } from 'lucide-react';

const PPCDashboard = () => {
  const stats = [
    {
      title: 'Total Plans',
      value: '24',
      change: '+12%',
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Projects',
      value: '18',
      change: '+5%',
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Raw Material Requests',
      value: '42',
      change: '+8%',
      icon: <Package className="w-8 h-8 text-green-600" />,
      bgColor: 'bg-green-50'
    },
    {
      title: 'Machine Utilization',
      value: '78%',
      change: '+3%',
      icon: <Factory className="w-8 h-8 text-purple-600" />,
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-orange-600" />
          PPC Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Production Planning & Control Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">New production plan created</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Raw material request approved</p>
                <p className="text-sm text-gray-600">5 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Factory className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Machine schedule updated</p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPCDashboard;

