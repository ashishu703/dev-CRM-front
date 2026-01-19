import React, { useState } from 'react';
import { 
  Phone, 
  Clock, 
  UserCheck, 
  Calendar, 
  CheckCircle, 
  XCircle,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  CalendarCheck,
  AlertCircle,
  Percent,
  ChevronDown,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users,
  Mail,
  Headphones
} from 'lucide-react';

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function Card({ className, children }) {
  return <div className={cx("rounded-lg border bg-white transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1", className)}>{children}</div>
}

function CardHeader({ className, children }) {
  return <div className={cx("p-4", className)}>{children}</div>
}

function CardTitle({ className, children }) {
  return <div className={cx("text-base font-semibold", className)}>{children}</div>
}

function CardContent({ className, children }) {
  return <div className={cx("p-4 pt-0", className)}>{children}</div>
}

const TeleSalesDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const teleSalesCards = [
    {
      title: 'Total Calls Made',
      value: '156',
      description: 'Calls made this month',
      icon: <Phone className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Connected Calls',
      value: '89',
      description: 'Successfully connected calls',
      icon: <UserCheck className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      title: 'Call Duration',
      value: '24h',
      description: 'Average call duration',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'Conversion Rate',
      value: '31.6%',
      description: 'Call to sale conversion',
      icon: <Percent className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      title: 'Revenue Generated',
      value: '₹1,25,000',
      description: 'Revenue from tele sales',
      icon: <IndianRupee className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      title: 'Follow-up Calls',
      value: '9',
      description: 'Pending follow-up calls',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'bg-red-50 text-red-600 border-red-200'
    }
  ];

  const teleSalesTeam = [
    {
      id: 1,
      name: 'Alex Rodriguez',
      role: 'Senior Tele Sales Rep',
      calls: 45,
      connected: 32,
      conversions: 8,
      revenue: 28000,
      performance: 'Excellent',
      avatar: 'AR'
    },
    {
      id: 2,
      name: 'Lisa Wang',
      role: 'Tele Sales Rep',
      calls: 38,
      connected: 25,
      conversions: 5,
      revenue: 18000,
      performance: 'Good',
      avatar: 'LW'
    },
    {
      id: 3,
      name: 'David Kumar',
      role: 'Junior Tele Sales Rep',
      calls: 32,
      connected: 20,
      conversions: 3,
      revenue: 12000,
      performance: 'Average',
      avatar: 'DK'
    }
  ];

  const callLogs = [
    {
      id: 1,
      customer: 'Global Tech Solutions',
      phone: '+91 98765 43210',
      duration: '12:30',
      status: 'Connected',
      outcome: 'Follow-up scheduled',
      salesperson: 'Alex Rodriguez',
      timestamp: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      customer: 'Innovation Hub',
      phone: '+91 87654 32109',
      duration: '8:45',
      status: 'Connected',
      outcome: 'Proposal sent',
      salesperson: 'Lisa Wang',
      timestamp: '2024-01-15 11:15 AM'
    },
    {
      id: 3,
      customer: 'Digital Enterprises',
      phone: '+91 76543 21098',
      duration: '5:20',
      status: 'No Answer',
      outcome: 'Callback scheduled',
      salesperson: 'David Kumar',
      timestamp: '2024-01-15 2:45 PM'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Tele Sales Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {teleSalesCards.map((card, index) => (
          <Card key={index} className={cx("border-2 group shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50", card.color)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium transition-all duration-300 group-hover:text-gray-800 group-hover:font-semibold">{card.title}</CardTitle>
              <div className="p-2 rounded-full bg-white shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1 transition-all duration-300 group-hover:scale-110">{card.value}</div>
              <p className="text-xs text-gray-500 transition-all duration-300 group-hover:text-gray-700">{card.description}</p>
              <div className="w-full bg-gradient-to-r from-current to-transparent opacity-30 h-2 rounded-full transition-all duration-300 group-hover:opacity-50 group-hover:h-2.5 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call Logs Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Phone className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-green-600">Recent Call Logs</h2>
        </div>
        <Card className="border-2 group shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesperson</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callLogs.map((call) => (
                  <tr key={call.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-md group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 transition-colors duration-300 group-hover:text-green-800">
                      {call.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-green-700">
                      {call.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-green-700">
                      {call.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-green-700">
                      {call.salesperson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-300 group-hover:scale-105 ${
                        call.status === 'Connected' ? 'bg-green-100 text-green-800' :
                        call.status === 'No Answer' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {call.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-green-700">
                      {call.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Tele Sales Team Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-green-600">Tele Sales Team Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teleSalesTeam.map((member) => (
            <Card key={member.id} className="border-2 group shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <span className="text-lg font-bold text-green-600">{member.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-green-800">{member.name}</h3>
                    <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-green-700">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Calls Made</span>
                    <span className="text-sm font-medium text-gray-900 transition-all duration-300 group-hover:scale-110">{member.calls}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Connected</span>
                    <span className="text-sm font-medium text-gray-900 transition-all duration-300 group-hover:scale-110">{member.connected}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Conversions</span>
                    <span className="text-sm font-medium text-gray-900 transition-all duration-300 group-hover:scale-110">{member.conversions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Revenue</span>
                    <span className="text-sm font-medium text-green-600 transition-all duration-300 group-hover:scale-110">₹{member.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Performance</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full transition-all duration-300 group-hover:scale-105 ${
                      member.performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                      member.performance === 'Good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.performance}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeleSalesDashboard;
