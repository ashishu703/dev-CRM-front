import React, { useEffect, useState } from 'react';
import { Bell, Users, Calendar, CheckCircle, AlertTriangle, ArrowRightLeft } from 'lucide-react';

const typeIcon = (type) => {
  switch(type) {
    case 'transfer': return <ArrowRightLeft className="w-4 h-4 text-purple-500" />;
    case 'lead': return <Users className="w-4 h-4 text-blue-500" />;
    case 'reminder': return <Calendar className="w-4 h-4 text-orange-500" />;
    case 'payment': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default: return <Bell className="w-4 h-4 text-gray-500" />;
  }
}

export default function NotificationsPage({ isDarkMode = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/notifications', { headers: { 'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined } });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.message || 'Failed');
      setItems(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-5xl mx-auto rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <Bell className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} w-5 h-5`} />
            </div>
            <div>
              <h2 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>Notifications</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-sm`}>Real-time updates for payments, lead assignments, and reminders</p>
            </div>
            <div className="ml-auto">
              <button onClick={load} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md">Refresh</button>
            </div>
          </div>
        </div>

        {loading && <div className={`p-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</div>}
        {error && <div className="p-6 text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="divide-y divide-gray-200">
            {items.length === 0 && (
              <div className={`p-6 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>No notifications yet</div>
            )}
            {items.map(n => (
              <div key={n.id} className={`p-4 flex flex-col gap-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start gap-3">
                <div className="mt-1">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>{n.title}</div>
                    <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-xs`}>{new Date(n.time).toLocaleString()}</div>
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{n.message}</div>
                </div>
                </div>
                {n.details && (
                  <div className="pl-7">
                    <button
                      onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      {expandedId === n.id ? 'Hide Details' : 'View Details'}
                    </button>
                    {expandedId === n.id && (
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1`}>
                        <div><span className="font-semibold">Customer:</span> {n.details.customer || 'N/A'}</div>
                        <div><span className="font-semibold">Business:</span> {n.details.business || 'N/A'}</div>
                        <div><span className="font-semibold">Product:</span> {n.details.product || 'N/A'}</div>
                        <div><span className="font-semibold">Phone:</span> {n.details.phone || 'N/A'}</div>
                        <div><span className="font-semibold">Email:</span> {n.details.email || 'N/A'}</div>
                        <div><span className="font-semibold">State:</span> {n.details.state || 'N/A'}</div>
                        <div className="sm:col-span-2"><span className="font-semibold">Address:</span> {n.details.address || 'N/A'}</div>
                        <div className="sm:col-span-2"><span className="font-semibold">Transferred From:</span> {n.details.transferredFrom || 'N/A'}</div>
                        <div className="sm:col-span-2"><span className="font-semibold">Transferred At:</span> {n.details.transferredAt ? new Date(n.details.transferredAt).toLocaleString() : 'N/A'}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


