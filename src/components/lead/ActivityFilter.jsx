import React, { useState } from 'react';
import { Filter, Mail, Calendar, TrendingUp, FileText, X } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'mails', label: 'Mails', icon: Mail },
  { id: 'followups', label: 'Followups', icon: Calendar },
  { id: 'status', label: 'Status', icon: TrendingUp },
  { id: 'documents', label: 'Documents', icon: FileText }
];

const ActivityFilter = ({ activeFilter, onFilterChange, stats }) => {
  const [isOpen, setIsOpen] = useState(false);

  const countValue = (v) => {
    if (v == null) return 0;
    if (typeof v === 'object' && v.count != null) return Number(v.count) || 0;
    if (typeof v === 'number') return v;
    return 0;
  };

  const getCount = (filterId) => {
    if (filterId === 'all') {
      if (typeof stats.total === 'number') return stats.total;
      return Object.entries(stats)
        .filter(([k]) => k !== 'total')
        .reduce((sum, [, v]) => sum + countValue(v), 0);
    }

    const typeMap = {
      mails: ['mail_sent', 'mail_opened'],
      followups: [
        'followup_scheduled',
        'followup_done',
        'followup_status_changed',
        'followup_history_entry'
      ],
      status: [
        'status_changed',
        'lead_assigned',
        'lead_transferred',
        'sales_status_changed',
        'followup_history_entry'
      ],
      documents: ['document_uploaded', 'quotation_created', 'rfp_raised']
    };

    return (typeMap[filterId] || []).reduce((sum, type) => sum + countValue(stats[type]), 0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>{FILTERS.find(f => f.id === activeFilter)?.label || 'All'}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2 space-y-1">
              {FILTERS.map(filter => {
                const Icon = filter.icon;
                const count = getCount(filter.id);
                const isActive = activeFilter === filter.id;
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      onFilterChange(filter.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{filter.label}</span>
                    </div>
                    {count > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityFilter;
