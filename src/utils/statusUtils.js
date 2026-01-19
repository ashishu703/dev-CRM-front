import React from 'react';

export const getStatusBadge = (status, type) => {
  const normalized = (status || '').toString();
  const upper = normalized.toUpperCase();
  const lower = normalized.toLowerCase();

  const salesMap = {
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDING' },
    'IN_PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'IN PROGRESS' },
    'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'COMPLETED' },
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDING' },
    'running': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'RUNNING' },
    'converted': { bg: 'bg-green-100', text: 'text-green-800', label: 'CONVERTED' },
    'interested': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'INTERESTED' },
    'loose': { bg: 'bg-red-100', text: 'text-red-800', label: 'LOOSE' },
    'win/closed': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'WIN/CLOSED' },
    'win lead': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'WIN LEAD' },
    'lost': { bg: 'bg-red-100', text: 'text-red-800', label: 'LOST' },
    'closed': { bg: 'bg-red-100', text: 'text-red-800', label: 'CLOSED' },
    'lost/closed': { bg: 'bg-red-100', text: 'text-red-800', label: 'LOST/CLOSED' }
  };

  const followUpMap = {
    'ACTIVE': { bg: 'bg-green-100', text: 'text-green-800', label: 'ACTIVE' },
    'INACTIVE': { bg: 'bg-red-100', text: 'text-red-800', label: 'INACTIVE' },
    'appointment scheduled': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'APPOINTMENT SCHEDULED' },
    'not interested': { bg: 'bg-red-100', text: 'text-red-800', label: 'NOT INTERESTED' },
    'interested': { bg: 'bg-green-100', text: 'text-green-800', label: 'INTERESTED' },
    'quotation sent': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'QUOTATION SENT' },
    'negotiation': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'NEGOTIATION' },
    'close order': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'CLOSE ORDER' },
    'closed/lost': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'CLOSED/LOST' },
    'call back request': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'CALL BACK REQUEST' },
    'unreachable/call not connected': { bg: 'bg-red-100', text: 'text-red-800', label: 'UNREACHABLE' },
    'currently not required': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'NOT REQUIRED' },
    'not relevant': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'NOT RELEVANT' },
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDING' }
  };

  const paymentMap = {
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDING' },
    'IN_PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'IN PROGRESS' },
    'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'COMPLETED' }
  };

  const typeMap = type === 'telecaller' ? followUpMap : type === 'payment' ? paymentMap : salesMap;
  const config = typeMap[upper] || typeMap[lower] || typeMap['PENDING'] || { bg: 'bg-gray-100', text: 'text-gray-800', label: normalized || 'PENDING' };
  
  return React.createElement(
    'span',
    {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`
    },
    config.label
  );
};

