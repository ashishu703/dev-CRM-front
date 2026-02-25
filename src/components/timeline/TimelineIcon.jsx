'use strict';

import React from 'react';
import { FileText, Phone, MessageSquare, Ban, CheckCircle, Clock, Receipt, Image, Send, FileImage, UserPlus, Settings } from 'lucide-react';

const TYPE_ICONS = {
  lead_created: UserPlus,
  follow_up: MessageSquare,
  sales_status: Settings,
  order_cancel: Ban,
  call: Phone,
  document: FileText,
  task: Clock,
  completed: CheckCircle,
  quotation: FileText,
  pi: Receipt,
  photo: Image,
  doc: FileImage,
  email: Send,
};

const TYPE_COLORS = {
  lead_created: 'bg-indigo-100 text-indigo-600',
  follow_up: 'bg-indigo-100 text-indigo-600',
  sales_status: 'bg-violet-100 text-violet-600',
  order_cancel: 'bg-amber-100 text-amber-700',
  call: 'bg-blue-100 text-blue-600',
  document: 'bg-slate-100 text-slate-600',
  task: 'bg-violet-100 text-violet-600',
  completed: 'bg-green-100 text-green-600',
  quotation: 'bg-blue-100 text-blue-600',
  pi: 'bg-emerald-100 text-emerald-600',
  photo: 'bg-pink-100 text-pink-600',
  doc: 'bg-slate-100 text-slate-600',
  email: 'bg-purple-100 text-purple-600',
};

const TimelineIcon = React.memo(function TimelineIcon({ type, icon: CustomIcon, colorClass }) {
  const Icon = CustomIcon ?? TYPE_ICONS[type] ?? FileText;
  const cls = colorClass ?? TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-600';
  return (
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cls}`}
      aria-hidden
    >
      <Icon className="h-4 w-4" />
    </div>
  );
});

export default TimelineIcon;
export { TYPE_ICONS, TYPE_COLORS };
