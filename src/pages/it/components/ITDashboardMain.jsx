import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Server, Database, Cpu, Users, Ticket, TrendingUp, TrendingDown, WifiOff } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const ITDashboardMain = () => {
  const statusCards = [
    { label: 'Critical Alerts', value: 3, trend: '+1', icon: AlertTriangle, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: 'Active Tickets', value: 18, trend: '6 high', icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Resolved Today', value: 27, trend: '+8', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'System Uptime', value: '99.8%', trend: '+0.2%', icon: Server, color: 'bg-blue-50 text-blue-700 border-blue-200' }
  ];

  const systemCards = [
    { name: 'CRM Cluster', status: 'Healthy', uptime: '99.96%', responseTime: '210ms', color: 'emerald' },
    { name: 'MongoDB', status: 'Connected', uptime: '99.98%', responseTime: '45ms', color: 'emerald' },
    { name: 'Payment Gateway', status: 'Degraded', uptime: '98.5%', responseTime: '450ms', color: 'amber' },
    { name: 'Analytics', status: 'Maintenance', uptime: '95.2%', responseTime: 'N/A', color: 'slate' },
    { name: 'Telephony', status: 'Down', uptime: '92.1%', responseTime: 'N/A', color: 'rose' }
  ];

  const metricCards = [
    { label: 'API Response', value: '210ms', trend: 'down', change: '-5%', icon: Activity },
    { label: 'Active Users', value: '247', trend: 'up', change: '+12', icon: Users },
    { label: 'Error Rate', value: '0.02%', trend: 'down', change: '-0.01%', icon: AlertTriangle },
    { label: 'DB Connections', value: '45/100', trend: 'stable', change: '0', icon: Database }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
      case 'Connected':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'Degraded':
        return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'Maintenance':
        return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
      default:
        return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-xl border-2 p-4 ${card.color} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{card.label}</span>
              </div>
              <p className="text-2xl font-bold mb-1">{card.value}</p>
              <p className="text-[10px] font-semibold opacity-80">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {systemCards.map((system) => {
          const colors = getStatusColor(system.status);
          return (
            <div key={system.name} className={`border-2 rounded-xl p-4 ${colors.bg} ${colors.border} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <Server className={`w-4 h-4 ${colors.text}`} />
                {system.status === 'Healthy' || system.status === 'Connected' ? (
                  <CheckCircle className={`w-4 h-4 ${colors.text}`} />
                ) : (
                  <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
                )}
              </div>
              <p className="text-xs font-semibold text-slate-900 mb-2">{system.name}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-600">Status</span>
                  <span className={`text-[10px] font-semibold ${colors.text}`}>{system.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-600">Uptime</span>
                  <span className="text-[10px] font-semibold text-slate-900">{system.uptime}</span>
                </div>
                {system.responseTime !== 'N/A' && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-600">Response</span>
                    <span className="text-[10px] font-semibold text-slate-900">{system.responseTime}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-slate-600" />
                <p className="text-[10px] font-semibold text-slate-600">{metric.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-600" />}
                <span className={`text-[10px] font-semibold ${
                  metric.trend === 'up' ? 'text-emerald-600' : 
                  metric.trend === 'down' ? 'text-rose-600' : 
                  'text-slate-600'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Usage Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-900">MongoDB</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-600">Connected</span>
          </div>
          <p className="text-[10px] text-slate-600">Latency: 210ms</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900">Server Resources</p>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>CPU</span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>Memory</span>
                <span className="font-semibold">62%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>Disk</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-semibold text-slate-900">Active Sessions</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">247</p>
          <p className="text-[10px] text-slate-600">+12 in last hour</p>
        </div>
      </div>

      {/* Network & Change Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-600" />
            <p className="text-sm font-semibold text-slate-900">Network Status</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-xs font-medium">Datacenter WAN</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Operational</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-xs font-medium">VPN Gateway</span>
              <span className="text-[10px] text-amber-600 font-semibold">Monitoring</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-xs font-medium">Field connectivity</span>
              <span className="text-[10px] text-rose-600 font-semibold inline-flex items-center gap-1">
                Partial <WifiOff className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-cyan-600" />
            <p className="text-sm font-semibold text-slate-900">Change Windows</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-900">Tonight 11:30 PM</p>
              <p className="text-[10px] text-slate-600">CRM patch rollout</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-900">Tomorrow 02:00 AM</p>
              <p className="text-[10px] text-slate-600">Database maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900">Ticket Trends</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { name: 'Mon', open: 12, resolved: 8 },
              { name: 'Tue', open: 15, resolved: 10 },
              { name: 'Wed', open: 18, resolved: 12 },
              { name: 'Thu', open: 16, resolved: 14 },
              { name: 'Fri', open: 18, resolved: 15 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="open" stroke="#ef4444" strokeWidth={2} name="Open" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-900">System Performance</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'CPU', usage: 45 },
              { name: 'Memory', usage: 62 },
              { name: 'Disk', usage: 78 },
              { name: 'Network', usage: 32 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }} formatter={(value) => `${value}%`} />
              <Bar dataKey="usage" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ITDashboardMain;
