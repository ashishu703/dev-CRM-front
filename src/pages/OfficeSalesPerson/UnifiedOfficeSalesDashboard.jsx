import React, { useState } from 'react';
import { 
  Phone, 
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
  Headphones,
  MapPin,
  FileText,
  FileSignature,
  Monitor
} from 'lucide-react';

const UnifiedOfficeSalesDashboard = ({ activeView }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <UnifiedDashboardContent selectedTab={selectedTab} setSelectedTab={setSelectedTab} />;
      case 'calls':
        return <CallsContent />;
      case 'meetings':
        return <MeetingsContent />;
      case 'proposals':
        return <ProposalsContent />;
      case 'contracts':
        return <ContractsContent />;
      case 'performance':
        return <PerformanceContent />;
      default:
        return <UnifiedDashboardContent selectedTab={selectedTab} setSelectedTab={setSelectedTab} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {renderContent()}
    </div>
  );
};

// Unified Dashboard Content
const UnifiedDashboardContent = ({ selectedTab, setSelectedTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'tele-sales', label: 'Tele Sales', icon: <Phone className="w-4 h-4" /> },
    { id: 'office-sales', label: 'Office Sales', icon: <Building2 className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Office Sales Department Dashboard</h1>
            <p className="text-gray-600">Unified dashboard for tele sales and office sales operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live Updates</span>
            </div>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && <OverviewContent />}
      {selectedTab === 'tele-sales' && <TeleSalesContent />}
      {selectedTab === 'office-sales' && <OfficeSalesContent />}
    </div>
  );
};

// Overview Content
const OverviewContent = () => {
  const overviewCards = [
    {
      title: 'Total Calls Made',
      value: '1,245',
      description: 'Calls made this month',
      icon: <Phone className="w-5 h-5" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Office Meetings',
      value: '45',
      description: 'Meetings conducted this month',
      icon: <Building2 className="w-5 h-5" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Proposals Sent',
      value: '28',
      description: 'Business proposals submitted',
      icon: <FileText className="w-5 h-5" />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Contracts Signed',
      value: '12',
      description: 'Contracts finalized',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Revenue',
      value: '₹5,10,000',
      description: 'Combined revenue generated',
      icon: <IndianRupee className="w-5 h-5" />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Success Rate',
      value: '32.5%',
      description: 'Overall conversion rate',
      icon: <Percent className="w-5 h-5" />,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {overviewCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} ${card.borderColor} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${card.textColor}`}>{card.title}</h3>
              <div className={card.textColor}>
                {card.icon}
              </div>
            </div>
            <div className={`text-2xl font-bold ${card.textColor} mb-1`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Phone className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <h3 className="font-medium text-blue-800">Make Call</h3>
              <p className="text-sm text-blue-600">Start a new sales call</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Calendar className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <h3 className="font-medium text-purple-800">Schedule Meeting</h3>
              <p className="text-sm text-purple-600">Plan a client meeting</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <FileText className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <h3 className="font-medium text-orange-800">Create Proposal</h3>
              <p className="text-sm text-orange-600">Draft a business proposal</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <FileSignature className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <h3 className="font-medium text-green-800">Finalize Contract</h3>
              <p className="text-sm text-green-600">Complete contract details</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

// Tele Sales Content
const TeleSalesContent = () => {
  const teleSalesCards = [
    {
      title: 'Total Calls Made',
      value: '1,245',
      description: 'Calls made this month',
      icon: <Phone className="w-5 h-5" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Connected Calls',
      value: '892',
      description: 'Successfully connected calls',
      icon: <UserCheck className="w-5 h-5" />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Call Duration',
      value: '2.5 hrs',
      description: 'Average call duration',
      icon: <Clock className="w-5 h-5" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Conversion Rate',
      value: '18.7%',
      description: 'Call to sale conversion',
      icon: <Percent className="w-5 h-5" />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ];

  const callLogs = [
    { id: 1, customer: 'ABC Corporation', phone: '+1 (555) 123-4567', duration: '12:45', status: 'Completed', outcome: 'Sale Made', time: '09:30 AM' },
    { id: 2, customer: 'XYZ Industries', phone: '+1 (555) 234-5678', duration: '08:20', status: 'Completed', outcome: 'Follow-up Required', time: '10:15 AM' },
    { id: 3, customer: 'Tech Solutions Ltd', phone: '+1 (555) 345-6789', duration: '15:30', status: 'Completed', outcome: 'Sale Made', time: '11:00 AM' }
  ];

  return (
    <>
      {/* Tele Sales Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {teleSalesCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} ${card.borderColor} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${card.textColor}`}>{card.title}</h3>
              <div className={card.textColor}>
                {card.icon}
              </div>
            </div>
            <div className={`text-2xl font-bold ${card.textColor} mb-1`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Call Logs Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Call Logs</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {callLogs.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {call.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      call.outcome === 'Sale Made' ? 'bg-green-100 text-green-800' :
                      call.outcome === 'Follow-up Required' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {call.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Office Sales Content
const OfficeSalesContent = () => {
  const officeSalesCards = [
    {
      title: 'Office Meetings',
      value: '45',
      description: 'Meetings conducted this month',
      icon: <Building2 className="w-5 h-5" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Proposals Sent',
      value: '28',
      description: 'Business proposals submitted',
      icon: <FileText className="w-5 h-5" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Contracts Signed',
      value: '12',
      description: 'Contracts finalized',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Success Rate',
      value: '42.8%',
      description: 'Proposal to contract rate',
      icon: <Percent className="w-5 h-5" />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ];

  const upcomingMeetings = [
    { id: 1, company: 'Global Tech Corp', contact: 'Mr. James Anderson', time: '10:00 AM', date: 'Today', location: 'Conference Room A', status: 'Scheduled' },
    { id: 2, company: 'Innovation Solutions', contact: 'Ms. Sarah Miller', time: '02:30 PM', date: 'Today', location: 'Meeting Room B', status: 'Confirmed' },
    { id: 3, company: 'Enterprise Systems', contact: 'Mr. Robert Johnson', time: '11:00 AM', date: 'Tomorrow', location: 'Board Room', status: 'Scheduled' }
  ];

  return (
    <>
      {/* Office Sales Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {officeSalesCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} ${card.borderColor} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${card.textColor}`}>{card.title}</h3>
              <div className={card.textColor}>
                {card.icon}
              </div>
            </div>
            <div className={`text-2xl font-bold ${card.textColor} mb-1`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Meetings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingMeetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {meeting.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{meeting.date}</div>
                      <div className="text-xs text-gray-400">{meeting.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {meeting.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      meeting.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {meeting.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Calls Content
const CallsContent = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Call Management</h1>
      {/* Call management content */}
    </div>
  );
};

// Meetings Content
const MeetingsContent = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meeting Management</h1>
      {/* Meeting management content */}
    </div>
  );
};

// Proposals Content
const ProposalsContent = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Proposals</h1>
      {/* Proposals content */}
    </div>
  );
};

// Contracts Content
const ContractsContent = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contracts</h1>
      {/* Contracts content */}
    </div>
  );
};

// Performance Content
const PerformanceContent = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Performance Analytics</h1>
      {/* Performance content */}
    </div>
  );
};

export default UnifiedOfficeSalesDashboard;
