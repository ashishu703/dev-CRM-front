import React, { useState } from 'react';
import { 
  Building2, 
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
  Phone,
  MapPin,
  FileText
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

const OfficeSalesPersonDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const officeSalesCards = [
    {
      title: 'Office Meetings',
      value: '12',
      description: 'Meetings conducted this month',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'Proposals Sent',
      value: '18',
      description: 'Business proposals submitted',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Contracts Signed',
      value: '10',
      description: 'Contracts finalized',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      title: 'Success Rate',
      value: '35.7%',
      description: 'Proposal to contract rate',
      icon: <Percent className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      title: 'Revenue Generated',
      value: '₹95,000',
      description: 'Revenue from office sales',
      icon: <IndianRupee className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      title: 'Pending Follow-ups',
      value: '8',
      description: 'Meetings requiring follow-up',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-red-50 text-red-600 border-red-200'
    }
  ];

  const officeSalesTeam = [
    {
      id: 1,
      name: 'Robert Smith',
      role: 'Senior Office Sales Rep',
      meetings: 8,
      proposals: 12,
      contracts: 5,
      revenue: 55000,
      performance: 'Excellent',
      avatar: 'RS'
    },
    {
      id: 2,
      name: 'Jennifer Lee',
      role: 'Office Sales Rep',
      meetings: 6,
      proposals: 9,
      contracts: 3,
      revenue: 32000,
      performance: 'Good',
      avatar: 'JL'
    },
    {
      id: 3,
      name: 'Michael Brown',
      role: 'Junior Office Sales Rep',
      meetings: 4,
      proposals: 6,
      contracts: 2,
      revenue: 18000,
      performance: 'Average',
      avatar: 'MB'
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      client: 'Enterprise Solutions Ltd',
      time: '10:00 AM',
      location: 'Conference Room A',
      salesperson: 'Robert Smith',
      status: 'Completed',
      outcome: 'Proposal sent'
    },
    {
      id: 2,
      client: 'Tech Innovations Inc',
      time: '2:00 PM',
      location: 'Conference Room B',
      salesperson: 'Jennifer Lee',
      status: 'Scheduled',
      outcome: 'Pending'
    },
    {
      id: 3,
      client: 'Digital Systems Corp',
      time: '4:30 PM',
      location: 'Conference Room C',
      salesperson: 'Michael Brown',
      status: 'In Progress',
      outcome: 'Follow-up required'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Office Sales Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {officeSalesCards.map((card, index) => (
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

      {/* Upcoming Meetings Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-purple-600">Upcoming Meetings</h2>
        </div>
        <Card className="border-2 group shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesperson</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingMeetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 hover:shadow-md group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 transition-colors duration-300 group-hover:text-purple-800">
                      {meeting.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-purple-700">
                      {meeting.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-purple-700">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        {meeting.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-purple-700">
                      {meeting.salesperson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-300 group-hover:scale-105 ${
                        meeting.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition-colors duration-300 group-hover:text-purple-700">
                      {meeting.outcome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Office Sales Team Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-purple-600">Office Sales Team Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {officeSalesTeam.map((member) => (
            <Card key={member.id} className="border-2 group shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <span className="text-lg font-bold text-purple-600">{member.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-800">{member.name}</h3>
                    <p className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-purple-700">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Meetings</span>
                    <span className="text-sm font-medium text-gray-900 transition-all duration-300 group-hover:scale-110">{member.meetings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Proposals</span>
                    <span className="text-sm font-medium text-gray-900 transition-all duration-300 group-hover:scale-110">{member.proposals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-800">Contracts</span>
                    <span className="text-sm font-medium text-gray-900 transition-all duration-300 group-hover:scale-110">{member.contracts}</span>
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

export default OfficeSalesPersonDashboard;
