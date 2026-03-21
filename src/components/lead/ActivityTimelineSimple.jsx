import React, { useMemo, useState } from 'react';
import { Clock, Loader, Eye, Mail, FileText, Package, Trash2, Edit, MessageSquare } from 'lucide-react';
import { useActivityTimeline } from './ActivityTimelineBase';

/** API may return metadata as JSON string; lead_activities stores JSON text */
function parseActivityMetadata(activity) {
  let m = activity?.metadata;
  if (m == null) return {};
  if (typeof m === 'string') {
    try {
      const p = JSON.parse(m);
      return typeof p === 'object' && p !== null ? p : {};
    } catch {
      return {};
    }
  }
  return typeof m === 'object' ? m : {};
}

const formatTimeAgo = (dateString) => {
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
    month: 'short'
  });
};

const formatDateHeader = (date) => {
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
};

// Get activity icon and color
const getActivityConfig = (activityType) => {
  const configs = {
    followup_scheduled: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    followup_done: { icon: Clock, color: 'text-green-500', bg: 'bg-green-50' },
    followup_status_changed: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    status_changed: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    sales_status_changed: { icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    quotation_created: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    quotation_edited: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
    quotation_rejected: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
    quotation_approved: { icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
    enquiry_added: { icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    enquiry_edited: { icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    mail_sent: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
    rfp_raised: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
    rfp_approved: { icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
    rfp_rejected: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
    pi_created: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
    payment_added: { icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    remark_added: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50' },
    document_uploaded: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    followup_history_entry: { icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-50' },
    lead_created: { icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    lead_assigned: { icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
    lead_transferred: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    note_added: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  };
  return configs[activityType] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' };
};

// Get activity title
const getActivityTitle = (activity) => {
  const metadata = parseActivityMetadata(activity);

  switch (activity.activity_type) {
    case 'followup_scheduled':
      const date = metadata.date || metadata.followupDate;
      return date ? `Followup Scheduled for ${date}` : 'Followup Scheduled';
    case 'followup_status_changed':
      return `Followup Status: ${metadata.status || 'Updated'}`;
    case 'status_changed':
      return metadata.newValue ? `Status → ${metadata.newValue}` : 'Status Changed';
    case 'sales_status_changed':
      return metadata.newValue ? `Sales Status → ${metadata.newValue}` : 'Sales Status Changed';
    case 'quotation_created':
      return 'Quotation Created';
    case 'quotation_edited':
      return 'Quotation Edited';
    case 'quotation_rejected':
      return 'Quotation Rejected';
    case 'quotation_approved':
      return 'Quotation Approved';
    case 'enquiry_added':
      return 'New Enquiry Added';
    case 'enquiry_edited':
      return 'Enquiry Updated';
    case 'mail_sent':
      return metadata.subject ? `Mail: ${metadata.subject}` : 'Mail Sent';
    case 'rfp_raised':
      return 'Request for Price Sent';
    case 'rfp_approved':
      return 'Request for Price Approved';
    case 'rfp_rejected':
      return 'Request for Price Rejected';
    case 'pi_created':
      return `PI ${metadata.piNumber || 'Created'}`;
    case 'payment_added':
      return `Payment ₹${metadata.amount ? Number(metadata.amount).toLocaleString('en-IN') : '0'}`;
    case 'remark_added':
      return 'Remark Added';
    case 'document_uploaded':
      return `Document: ${metadata.filename || 'Uploaded'}`;
    case 'followup_history_entry': {
      const m = parseActivityMetadata(activity);
      const fu = m.followUpStatus ?? m.follow_up_status;
      const sales = m.salesStatus ?? m.sales_status;
      if (fu && sales) return `Follow-up: ${fu} · Sales: ${sales}`;
      if (fu) return `Follow-up: ${fu}`;
      if (sales) return `Sales: ${sales}`;
      return 'Follow-up & sales snapshot';
    }
    case 'lead_created':
      return 'Lead created';
    case 'lead_assigned':
      return (
        metadata.assigneeName ||
        metadata.assignee ||
        metadata.assignedTo ||
        'Lead assigned'
      );
    case 'lead_transferred':
      return metadata.toName || metadata.to || 'Lead transferred';
    case 'note_added':
      return metadata.title || 'Note added';
    default:
      return activity.activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

// Get activity subtitle/details
const getActivitySubtitle = (activity) => {
  const metadata = parseActivityMetadata(activity);

  switch (activity.activity_type) {
    case 'followup_scheduled': {
      const notes = metadata.notes || metadata.remark;
      if (notes) return String(notes);
      return metadata.description || null;
    }
    case 'followup_status_changed': {
      const parts = [];
      if (metadata.status) parts.push(`Status: ${metadata.status}`);
      if (metadata.remark) parts.push(`Follow-up remark: ${metadata.remark}`);
      return parts.length ? parts.join('\n') : null;
    }
    case 'sales_status_changed': {
      const parts = [];
      if (metadata.oldValue != null && metadata.newValue != null) {
        parts.push(`${metadata.oldValue} → ${metadata.newValue}`);
      }
      if (metadata.remark) parts.push(`Sales remark: ${metadata.remark}`);
      return parts.length ? parts.join('\n') : null;
    }
    case 'status_changed': {
      const parts = [];
      if (metadata.oldValue != null && metadata.newValue != null) {
        parts.push(`${metadata.oldValue} → ${metadata.newValue}`);
      }
      if (metadata.remark) parts.push(`Remark: ${metadata.remark}`);
      return parts.length ? parts.join('\n') : (metadata.description || null);
    }
    case 'enquiry_added':
    case 'enquiry_edited':
      // Show product name, quantity, and remark in same row
      const parts = [];
      if (metadata.productNames) {
        parts.push(metadata.productNames);
      }
      if (metadata.quantities) {
        parts.push(`Qty: ${metadata.quantities}`);
      }
      if (metadata.remark) {
        parts.push(metadata.remark);
      }
      return parts.length > 0 ? parts.join(' • ') : null;
    case 'mail_sent':
      const recipients = metadata.recipients || (Array.isArray(metadata.to) ? metadata.to.join(', ') : metadata.to);
      return recipients ? `To: ${recipients}` : null;
    case 'rfp_raised':
      if (metadata.productNames) {
        return `${metadata.productNames}${metadata.quantities ? ` • Qty: ${metadata.quantities}` : ''}`;
      }
      return null;
    case 'quotation_created':
    case 'quotation_edited':
      return metadata.quotationNumber ? `#${metadata.quotationNumber}` : null;
    case 'pi_created':
      return metadata.quotationNumber ? `For Quotation #${metadata.quotationNumber}` : null;
    case 'payment_added':
      return metadata.mode ? `via ${metadata.mode}${metadata.reference ? ` • ${metadata.reference}` : ''}` : null;
    case 'remark_added':
      return metadata.remark != null && String(metadata.remark).trim() !== ''
        ? String(metadata.remark)
        : null;
    case 'document_uploaded':
      return metadata.type ? `Type: ${metadata.type}` : null;
    case 'followup_history_entry': {
      const m = parseActivityMetadata(activity);
      const fu = m.followUpStatus ?? m.follow_up_status;
      const sales = m.salesStatus ?? m.sales_status;
      const remark = m.followUpRemark ?? m.follow_up_remark;
      const salesRemark =
        m.salesStatusRemark ?? m.salesRemark ?? m.sales_status_remark;
      const parts = [];
      if (fu) parts.push(`Follow-up status: ${fu}`);
      if (sales) parts.push(`Sales status: ${sales}`);
      if (remark != null && String(remark).trim() !== '') {
        parts.push(`Follow-up remark: ${remark}`);
      }
      if (salesRemark != null && String(salesRemark).trim() !== '') {
        parts.push(`Sales remark: ${salesRemark}`);
      }
      return parts.length ? parts.join('\n') : null;
    }
    case 'note_added':
      return (
        metadata.note ||
        metadata.body ||
        metadata.text ||
        metadata.remark ||
        null
      );
    default: {
      const m = metadata;
      if (
        m.followUpStatus ||
        m.follow_up_status ||
        m.salesStatus ||
        m.sales_status ||
        m.followUpRemark ||
        m.follow_up_remark ||
        m.salesStatusRemark ||
        m.sales_status_remark
      ) {
        const parts = [];
        if (m.followUpStatus || m.follow_up_status) {
          parts.push(`Follow-up: ${m.followUpStatus || m.follow_up_status}`);
        }
        if (m.salesStatus || m.sales_status) {
          parts.push(`Sales: ${m.salesStatus || m.sales_status}`);
        }
        if (m.followUpRemark || m.follow_up_remark) {
          parts.push(`Follow-up remark: ${m.followUpRemark || m.follow_up_remark}`);
        }
        if (m.salesStatusRemark || m.sales_status_remark) {
          parts.push(`Sales remark: ${m.salesStatusRemark || m.sales_status_remark}`);
        }
        if (parts.length) return parts.join('\n');
      }
      return metadata.description || metadata.summary || null;
    }
  }
};

// Check if activity has view action
const hasViewAction = (activity) => {
  const viewableTypes = ['quotation_created', 'quotation_edited', 'quotation_rejected', 'quotation_approved', 
                         'mail_sent', 'rfp_raised', 'rfp_approved', 'rfp_rejected', 'pi_created', 'payment_added',
                         'document_uploaded', 'enquiry_added', 'enquiry_edited'];
  return viewableTypes.includes(activity.activity_type);
};

// Check if activity has delete action
const hasDeleteAction = (activity) => {
  const deletableTypes = ['mail_sent', 'document_uploaded'];
  return deletableTypes.includes(activity.activity_type);
};

/**
 * Clean, compact timeline matching enterprise CRM standards
 */
const ActivityTimelineSimple = ({ leadId, onViewActivity, onDeleteActivity, onEditEnquiry }) => {
  const {
    activities,
    loading,
    hasMore,
    observerTarget
  } = useActivityTimeline(leadId);

  const [deletingId, setDeletingId] = useState(null);

  const handleView = (activity) => {
    if (onViewActivity) {
      onViewActivity(activity);
    }
  };

  const handleDelete = async (activity) => {
    if (!onDeleteActivity) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      setDeletingId(activity.id);
      try {
        await onDeleteActivity(activity);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (activity) => {
    if (onEditEnquiry) {
      onEditEnquiry(activity);
    }
  };

  // Group activities by date
  const groupedByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = [];
    const dateMap = new Map();

    activities.forEach(activity => {
      const activityDate = new Date(activity.created_at);
      const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
      
      let label;
      if (activityDay.getTime() === today.getTime()) {
        label = 'TODAY';
      } else if (activityDay.getTime() === yesterday.getTime()) {
        label = 'YESTERDAY';
      } else {
        label = formatDateHeader(activityDay);
      }

      if (!dateMap.has(label)) {
        dateMap.set(label, []);
        groups.push({ label, activities: dateMap.get(label) });
      }
      dateMap.get(label).push(activity);
    });

    return groups;
  }, [activities]);

  if (activities.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Clock className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedByDate.map((group, groupIdx) => (
        <div key={groupIdx}>
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 rounded">
            {group.label}
          </div>
          <div className="relative mt-2">
            {/* Timeline vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-200" />
            
            {group.activities.map((activity, idx) => {
              const config = getActivityConfig(activity.activity_type);
              const Icon = config.icon;
              const title = getActivityTitle(activity);
              const subtitle = getActivitySubtitle(activity);
              const showView = hasViewAction(activity);
              const showDelete = hasDeleteAction(activity);
              const showEdit = activity.activity_type === 'enquiry_added' || activity.activity_type === 'enquiry_edited';
              const performedBy = activity.performed_by_name || 'System';
              const isDeleting = deletingId === activity.id;

              return (
                <div key={activity.id} className="relative flex gap-3 pb-3 group">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {title}
                        </p>
                        {subtitle && (
                          <p
                            className={`text-xs text-gray-600 mt-0.5 ${
                              String(subtitle).includes('\n') ? 'whitespace-pre-line' : 'line-clamp-3'
                            }`}
                          >
                            {subtitle}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          by {performedBy}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {showView && (
                            <button
                              onClick={() => handleView(activity)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                              title="View details"
                              disabled={isDeleting}
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                          )}
                          {showEdit && (
                            <button
                              onClick={() => handleEdit(activity)}
                              className="p-1 hover:bg-orange-100 rounded transition-colors"
                              title="Edit enquiry"
                              disabled={isDeleting}
                            >
                              <Edit className="w-3.5 h-3.5 text-orange-600" />
                            </button>
                          )}
                          {showDelete && (
                            <button
                              onClick={() => handleDelete(activity)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader className="w-3.5 h-3.5 text-red-600 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              )}
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-3">
          {loading && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <div className="text-center py-2 text-xs text-gray-500">
          No more activities
        </div>
      )}
    </div>
  );
};

export default ActivityTimelineSimple;
