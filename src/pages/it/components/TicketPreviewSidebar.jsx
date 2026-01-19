import React from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../../api/admin_api/api';

const TicketPreviewSidebar = ({ ticket, onClose, getStatusColor, getPriorityColor }) => {
  if (!ticket) return null;

  const formatTimelineMessage = (message, status) => {
    if (!message) {
      if (status === 'Resolved') return 'resolved';
      if (status === 'Closed') return 'Status changed to Closed';
      return `Status changed to ${status}`;
    }
    
    if (message.includes('sent back to')) {
      return message;
    }
    
    if (message.includes('assigned to')) {
      return message;
    }
    
    if (message.includes('Status changed to')) {
      return message;
    }
    
    if (message.includes('Ticket created and submitted')) {
      return 'Ticket created and submitted';
    }
    
    if (status === 'Resolved' && message.toLowerCase() === 'resolved') {
      return 'resolved';
    }
    
    return message;
  };

  const timelineEvents = [
    {
      id: 'ticket-created',
      title: 'Ticket Created',
      date: ticket.createdAt,
      status: 'completed',
      description: 'Ticket created and submitted',
      type: 'created',
      imageUrl: ticket.statusHistory?.[0]?.imageUrl || null,
      imageName: ticket.statusHistory?.[0]?.imageName || null
    },
    ...(ticket.statusHistory || []).map((history, idx) => {
      let message = history.message;
      if (history.internalNote) {
        message = history.message;
      } else {
        message = formatTimelineMessage(history.message, history.status);
      }
      
      let title = `Status: ${history.status}`;
      if (history.status === 'Open' && message.includes('sent back')) {
        title = 'Ticket Reopened';
      } else if (history.status === 'In Progress' && message.includes('assigned')) {
        title = 'Ticket Assigned';
      } else if (history.status === 'Resolved') {
        title = 'Ticket Resolved';
      } else if (history.status === 'Closed') {
        title = 'Ticket Closed';
      }
      
      return {
        id: `history-${idx}`,
        title,
        date: new Date(history.timestamp).toLocaleString(),
        status: history.status.toLowerCase(),
        description: message,
        type: 'status',
        imageUrl: history.imageUrl || null,
        imageName: history.imageName || null
      };
    })
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'in progress':
      case 'inprogress':
        return <Clock className="h-3 w-3 text-amber-600" />;
      case 'open':
        return <AlertCircle className="h-3 w-3 text-blue-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getBubbleColor = (type, status) => {
    if (type === 'created') return 'bg-green-50 border-green-200';
    if (type === 'resolution') return 'bg-emerald-50 border-emerald-200';
    if (status === 'in progress' || status === 'inprogress') return 'bg-amber-50 border-amber-200';
    if (status === 'open') return 'bg-blue-50 border-blue-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="fixed top-0 right-0 h-screen z-50" style={{ right: 0, width: 'fit-content', maxWidth: '349px', minWidth: '244px' }}>
      <div className="bg-white h-screen flex flex-col shadow-xl border-l border-gray-200" style={{ width: 'fit-content', maxWidth: '349px', minWidth: '244px' }}>
        {/* Sticky Header */}
        <div className="flex justify-between items-center p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-semibold text-gray-900">Ticket Timeline</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 50px)', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '4px' }}>
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Ticket Details */}
          <div style={{ marginBottom: '4px' }}>
            <h4 className="text-xs font-bold text-gray-900" style={{ marginBottom: '2px' }}>Ticket Details</h4>
            <div className="text-[11px]" style={{ gap: '1px' }}>
              <div>
                <span className="font-medium text-gray-600">Ticket ID:</span>
                <span className="ml-1.5 text-gray-900">{ticket.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Title:</span>
                <span className="ml-1.5 text-gray-900">{ticket.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created By:</span>
                <span className="ml-1.5 text-gray-900">{ticket.createdBy}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Assigned To:</span>
                <span className="ml-1.5 text-gray-900">{ticket.assignedTo || 'Unassigned'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Priority:</span>
                <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold rounded border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold rounded ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">SLA:</span>
                <span className="ml-1.5 text-gray-900">{ticket.sla}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div style={{ marginBottom: '4px', marginTop: '4px' }}>
              <h4 className="text-xs font-bold text-gray-900" style={{ marginBottom: '2px' }}>Description</h4>
              <div className="text-[11px] text-gray-700">{ticket.description}</div>
            </div>
          )}

          {/* Resolution */}
          {ticket.resolution && (
            <div style={{ marginBottom: '4px', marginTop: '4px' }}>
              <h4 className="text-xs font-bold text-gray-900" style={{ marginBottom: '2px' }}>Resolution</h4>
              <div className="text-[11px] text-gray-700">{ticket.resolution}</div>
            </div>
          )}

          {/* Timeline */}
          <div style={{ marginTop: '4px' }}>
            <h4 className="text-xs font-bold text-gray-900" style={{ marginBottom: '2px' }}>Ticket progress and updates</h4>

            {timelineEvents.map((event, idx) => {
              const eventDate = new Date(event.date);
              const dateKey = eventDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
              const timeKey = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              const prevEvent = idx > 0 ? timelineEvents[idx - 1] : null;
              const prevDate = prevEvent ? new Date(prevEvent.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
              const showDate = !prevDate || dateKey !== prevDate;

              return (
                <div key={event.id}>
                  {showDate && (
                    <div className="flex justify-center" style={{ marginTop: idx > 0 ? '4px' : '2px' }}>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {dateKey}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-start" style={{ marginTop: '2px' }}>
                    <div className={`max-w-[85%] rounded-lg rounded-tl-none p-1.5 border ${getBubbleColor(event.type, event.status)}`}>
                      <div className="flex items-center gap-1.5" style={{ marginBottom: '1px' }}>
                        {getStatusIcon(event.status)}
                        <span className="text-[11px] font-medium text-gray-900">{event.title}</span>
                        <span className={`ml-auto px-1.5 py-0.5 text-[9px] font-medium rounded ${
                          event.status === 'completed' || event.status === 'resolved' || event.status === 'closed' 
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'in progress' || event.status === 'inprogress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-600">{event.description}</div>
                      {event.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={event.imageUrl.startsWith('http') ? event.imageUrl : `${API_BASE_URL}${event.imageUrl}`}
                            alt={event.imageName || 'Uploaded image'}
                            className="max-w-full h-auto rounded border border-gray-200 cursor-pointer hover:opacity-80"
                            onClick={() => {
                              const fullUrl = event.imageUrl.startsWith('http') ? event.imageUrl : `${API_BASE_URL}${event.imageUrl}`;
                              window.open(fullUrl, '_blank');
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {event.imageName && (
                            <p className="text-[9px] text-gray-500 mt-1">Attachment: {event.imageName}</p>
                          )}
                        </div>
                      )}
                      <div className="text-[9px] text-gray-500 mt-1">
                        {timeKey}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewSidebar;

