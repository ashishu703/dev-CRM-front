import React from 'react';
import { 
  UserPlus, Calendar, CheckCircle, Edit, FileText, 
  ThumbsUp, ThumbsDown, Mail, MailOpen, Upload, 
  StickyNote, ArrowRight, TrendingUp, MessageSquare,
  DollarSign, Receipt, Eye, Package
} from 'lucide-react';

const ACTIVITY_CONFIG = {
  lead_created: {
    icon: UserPlus,
    color: 'bg-green-100 text-green-600',
    label: 'Lead Created'
  },
  followup_scheduled: {
    icon: Calendar,
    color: 'bg-blue-100 text-blue-600',
    label: 'Followup Scheduled'
  },
  followup_done: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600',
    label: 'Followup Completed'
  },
  followup_status_changed: {
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-600',
    label: 'Followup Status Updated'
  },
  status_changed: {
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600',
    label: 'Status Changed'
  },
  sales_status_changed: {
    icon: TrendingUp,
    color: 'bg-indigo-100 text-indigo-600',
    label: 'Sales Status Changed'
  },
  remark_added: {
    icon: Edit,
    color: 'bg-gray-100 text-gray-600',
    label: 'Remark Added'
  },
  quotation_created: {
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-600',
    label: 'Quotation Created'
  },
  quotation_edited: {
    icon: Edit,
    color: 'bg-orange-100 text-orange-600',
    label: 'Quotation Edited'
  },
  quotation_approved: {
    icon: ThumbsUp,
    color: 'bg-green-100 text-green-600',
    label: 'Quotation Approved'
  },
  quotation_rejected: {
    icon: ThumbsDown,
    color: 'bg-red-100 text-red-600',
    label: 'Quotation Rejected'
  },
  enquiry_added: {
    icon: Package,
    color: 'bg-yellow-100 text-yellow-600',
    label: 'Enquiry Added'
  },
  enquiry_edited: {
    icon: Edit,
    color: 'bg-amber-100 text-amber-600',
    label: 'Enquiry Edited'
  },
  enquiry_deleted: {
    icon: ThumbsDown,
    color: 'bg-red-100 text-red-600',
    label: 'Enquiry Deleted'
  },
  rfp_raised: {
    icon: FileText,
    color: 'bg-orange-100 text-orange-600',
    label: 'RFP Sent'
  },
  rfp_approved: {
    icon: ThumbsUp,
    color: 'bg-green-100 text-green-600',
    label: 'RFP Approved'
  },
  rfp_rejected: {
    icon: ThumbsDown,
    color: 'bg-red-100 text-red-600',
    label: 'RFP Rejected'
  },
  pi_created: {
    icon: Receipt,
    color: 'bg-purple-100 text-purple-600',
    label: 'Proforma Invoice Created'
  },
  payment_added: {
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    label: 'Payment Added'
  },
  mail_sent: {
    icon: Mail,
    color: 'bg-blue-100 text-blue-600',
    label: 'Mail Sent'
  },
  mail_opened: {
    icon: MailOpen,
    color: 'bg-cyan-100 text-cyan-600',
    label: 'Mail Opened'
  },
  document_uploaded: {
    icon: Upload,
    color: 'bg-teal-100 text-teal-600',
    label: 'Document Uploaded'
  },
  note_added: {
    icon: StickyNote,
    color: 'bg-amber-100 text-amber-600',
    label: 'Note Added'
  },
  lead_assigned: {
    icon: ArrowRight,
    color: 'bg-indigo-100 text-indigo-600',
    label: 'Lead Assigned'
  },
  lead_transferred: {
    icon: ArrowRight,
    color: 'bg-purple-100 text-purple-600',
    label: 'Lead Transferred'
  },
  followup_history_entry: {
    icon: MessageSquare,
    color: 'bg-sky-100 text-sky-700',
    label: 'Follow-up & sales snapshot'
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Single activity detail component
const ActivityDetail = ({ activity }) => {
  const config = ACTIVITY_CONFIG[activity.activity_type] || {
    icon: FileText,
    color: 'bg-gray-100 text-gray-600',
    label: activity.activity_type
  };

  const Icon = config.icon;
  const metadata = activity.metadata || {};

  // Render specific content based on activity type
  const renderActivityContent = () => {
    switch (activity.activity_type) {
      case 'followup_status_changed':
        return (
          <>
            <p className="text-sm text-gray-600 mt-0.5">
              Status: <span className="font-medium">{metadata.status}</span>
            </p>
            {metadata.remark && (
              <p className="text-sm text-gray-600 mt-0.5">
                Remark: {metadata.remark}
              </p>
            )}
          </>
        );

      case 'followup_history_entry':
        return (
          <>
            <p className="text-sm text-gray-600 mt-0.5">
              Follow-up:{' '}
              <span className="font-medium">{metadata.followUpStatus || '—'}</span>
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              Sales: <span className="font-medium">{metadata.salesStatus || '—'}</span>
            </p>
            {metadata.followUpRemark && (
              <p className="text-sm text-gray-600 mt-0.5">Remark: {metadata.followUpRemark}</p>
            )}
          </>
        );

      case 'sales_status_changed':
        return (
          <>
            {metadata.oldValue && metadata.newValue && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded">{metadata.oldValue}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">{metadata.newValue}</span>
              </div>
            )}
            {metadata.remark && (
              <p className="text-sm text-gray-600 mt-1">
                Remark: {metadata.remark}
              </p>
            )}
          </>
        );

      case 'enquiry_added':
      case 'enquiry_edited':
        return (
          <>
            {metadata.productNames && (
              <p className="text-sm text-gray-600 mt-0.5">
                Products: <span className="font-medium">{metadata.productNames}</span>
              </p>
            )}
            {metadata.quantities && (
              <p className="text-sm text-gray-600 mt-0.5">
                Quantity: {metadata.quantities}
              </p>
            )}
          </>
        );

      case 'enquiry_deleted':
        return (
          <>
            {metadata.productNames && (
              <p className="text-sm text-gray-600 mt-0.5">
                Deleted: <span className="font-medium">{metadata.productNames}</span>
              </p>
            )}
          </>
        );

      case 'mail_sent':
        return (
          <>
            {metadata.subject && (
              <p className="text-sm text-gray-600 mt-0.5">
                Subject: <span className="font-medium">{metadata.subject}</span>
              </p>
            )}
            {metadata.recipients && (
              <p className="text-sm text-gray-600 mt-0.5">
                To: {metadata.recipients}
              </p>
            )}
            {metadata.to && !metadata.recipients && (
              <p className="text-sm text-gray-600 mt-0.5">
                To: {Array.isArray(metadata.to) ? metadata.to.join(', ') : metadata.to}
              </p>
            )}
            {metadata.cc && (
              <p className="text-sm text-gray-500 mt-0.5 text-xs">
                CC: {Array.isArray(metadata.cc) ? metadata.cc.join(', ') : metadata.cc}
              </p>
            )}
            {metadata.bcc && (
              <p className="text-sm text-gray-500 mt-0.5 text-xs">
                BCC: {Array.isArray(metadata.bcc) ? metadata.bcc.join(', ') : metadata.bcc}
              </p>
            )}
          </>
        );

      case 'rfp_raised':
        return (
          <>
            {metadata.productNames && (
              <p className="text-sm text-gray-600 mt-0.5">
                Products: <span className="font-medium">{metadata.productNames}</span>
              </p>
            )}
            {metadata.quantities && (
              <p className="text-sm text-gray-600 mt-0.5">
                Quantity: {metadata.quantities}
              </p>
            )}
            {metadata.targetPrice && (
              <p className="text-sm text-gray-600 mt-0.5">
                Target Price: ₹{metadata.targetPrice}
              </p>
            )}
            {metadata.specialRequirements && (
              <p className="text-sm text-gray-600 mt-0.5">
                Special Requirements: {metadata.specialRequirements}
              </p>
            )}
          </>
        );

      case 'rfp_approved':
      case 'rfp_rejected':
        return (
          <>
            {metadata.reason && (
              <p className="text-sm text-gray-600 mt-0.5">
                {metadata.reason}
              </p>
            )}
          </>
        );

      case 'quotation_created':
      case 'quotation_edited':
        return (
          <>
            {metadata.quotationNumber && (
              <p className="text-sm text-gray-600 mt-0.5">
                Quotation: <span className="font-medium">{metadata.quotationNumber}</span>
              </p>
            )}
            {activity.activity_type === 'quotation_edited' && (
              <span className="text-xs text-orange-600 font-medium">Edited</span>
            )}
          </>
        );

      case 'pi_created':
        return (
          <>
            {metadata.piNumber && (
              <p className="text-sm text-gray-600 mt-0.5">
                PI: <span className="font-medium">{metadata.piNumber}</span>
              </p>
            )}
            {metadata.quotationNumber && (
              <p className="text-sm text-gray-600 mt-0.5">
                For Quotation: {metadata.quotationNumber}
              </p>
            )}
            {metadata.totalAmount && (
              <p className="text-sm text-gray-600 mt-0.5">
                Amount: ₹{Number(metadata.totalAmount).toLocaleString('en-IN')}
              </p>
            )}
          </>
        );

      case 'payment_added':
        return (
          <>
            {metadata.amount && (
              <p className="text-sm text-gray-600 mt-0.5">
                Amount: <span className="font-medium text-green-600">₹{Number(metadata.amount).toLocaleString('en-IN')}</span>
              </p>
            )}
            {metadata.mode && (
              <p className="text-sm text-gray-600 mt-0.5">
                Mode: {metadata.mode}
              </p>
            )}
            {metadata.reference && (
              <p className="text-sm text-gray-600 mt-0.5">
                Reference: {metadata.reference}
              </p>
            )}
            {metadata.documentUrl && (
              <button
                onClick={() => window.open(metadata.documentUrl, '_blank')}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View Document
              </button>
            )}
          </>
        );

      default:
        return (
          <>
            {metadata.description && (
              <p className="text-sm text-gray-600 mt-0.5">
                {metadata.description}
              </p>
            )}
            {metadata.oldValue && metadata.newValue && (
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded">{metadata.oldValue}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">{metadata.newValue}</span>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex items-start gap-2">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">
          {config.label}
        </p>
        {renderActivityContent()}
      </div>
    </div>
  );
};

// Grouped activity card (Salesforce style)
const GroupedActivityCard = ({ activities }) => {
  if (activities.length === 0) return null;

  const firstActivity = activities[0];
  const performedBy = firstActivity.performed_by_name || 'System';
  const timestamp = formatDate(firstActivity.created_at);

  // If only one activity, show simple card
  if (activities.length === 1) {
    const config = ACTIVITY_CONFIG[firstActivity.activity_type] || {
      icon: FileText,
      color: 'bg-gray-100 text-gray-600',
      label: firstActivity.activity_type
    };
    const Icon = config.icon;
    const metadata = firstActivity.metadata || {};

    return (
      <div className="flex gap-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {config.label}
              </p>
              {metadata.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {metadata.description}
                </p>
              )}
              {firstActivity.activity_type === 'followup_history_entry' && (
                <p className="text-sm text-gray-600 mt-1">
                  Follow-up: <span className="font-medium">{metadata.followUpStatus || '—'}</span>
                  {' · '}
                  Sales: <span className="font-medium">{metadata.salesStatus || '—'}</span>
                </p>
              )}
              {metadata.oldValue && metadata.newValue && (
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{metadata.oldValue}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{metadata.newValue}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {timestamp}
            </span>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            by {performedBy}
          </p>
        </div>
      </div>
    );
  }

  // Multiple activities - show grouped card
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Edit className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Lead Updated</p>
            <p className="text-xs text-gray-500">
              by {performedBy} • {timestamp}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {activities.length} changes
        </span>
      </div>

      <div className="space-y-2 pl-12">
        {activities.map((activity, index) => (
          <ActivityDetail key={`${activity.id}-${index}`} activity={activity} />
        ))}
      </div>
    </div>
  );
};

const ActivityItem = ({ activity, groupedActivities }) => {
  // If this is a grouped activity, render the grouped card
  if (groupedActivities && groupedActivities.length > 0) {
    return <GroupedActivityCard activities={groupedActivities} />;
  }

  // Otherwise render single activity (fallback)
  return <GroupedActivityCard activities={[activity]} />;
};

export default React.memo(ActivityItem);
