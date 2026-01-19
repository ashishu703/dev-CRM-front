import React from 'react';
import StatCard from './StatCard';
import { Users, Clock, Play, CheckCircle, UserCheck, Trophy, FileCheck, XCircle, Calendar, FileText, ArrowRight } from 'lucide-react';

const LeadStatusCards = ({ leads }) => {
  const cards = [
    { title: 'Total Leads', value: leads.total, icon: Users, color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', value: 'text-blue-600' }, description: 'All leads in your pipeline' },
    { title: 'Pending', value: leads.pending, icon: Clock, color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', value: 'text-purple-600' }, description: 'Leads awaiting response' },
    { title: 'Running', value: leads.running, icon: Play, color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', value: 'text-indigo-600' }, description: 'In progress' },
    { title: 'Converted', value: leads.converted, icon: CheckCircle, color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', value: 'text-green-600' }, description: 'Successful conversions' },
    { title: 'Interested', value: leads.interested, icon: UserCheck, color: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', value: 'text-yellow-600' }, description: 'Warm leads' },
    { title: 'Win/Closed', value: leads.winClosed, icon: Trophy, color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', value: 'text-emerald-600' }, description: 'Won or closed' },
    { title: 'Closed', value: leads.closed, icon: FileCheck, color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', value: 'text-blue-600' }, description: 'Closed deals' },
    { title: 'Lost', value: leads.lost, icon: XCircle, color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', value: 'text-red-600' }, description: 'Declined/failed' },
    { title: 'Meeting Scheduled', value: leads.meetingScheduled, icon: Calendar, color: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', value: 'text-pink-600' }, description: 'Upcoming meetings' },
    { title: 'Quotation Sent', value: leads.quotationSent, icon: FileText, color: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', value: 'text-cyan-600' }, description: 'Proposals shared' },
    { title: 'Closed/Lost (Follow-up)', value: leads.closedLostFollowup, icon: ArrowRight, color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', value: 'text-orange-600' }, description: 'Follow-up outcome' }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Leads</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default LeadStatusCards;

