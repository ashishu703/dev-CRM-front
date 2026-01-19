// Utility class for status conversion
export class StatusConverter {
  static toTitleStatus(value) {
    if (!value) return 'Pending'
    const v = String(value).toLowerCase()
    const statusMap = {
      'connected': 'Connected',
      'not_connected': 'Not Connected',
      'follow_up': 'Follow Up',
      'not_interested': 'Not Interested',
      'next_meeting': 'Next Meeting',
      'order_confirmed': 'Order Confirmed',
      'closed': 'Closed',
      'open': 'Open'
    }
    return statusMap[v] || value
  }

  static toMachineStatus(label) {
    const l = String(label).toLowerCase()
    if (l.includes('not connected')) return 'not_connected'
    if (l.includes('connected')) return 'connected'
    if (l.includes('follow')) return 'follow_up'
    if (l.includes('not interested')) return 'not_interested'
    if (l.includes('next') || l.includes('meeting')) return 'next_meeting'
    if (l.includes('order')) return 'order_confirmed'
    if (l.includes('closed')) return 'closed'
    if (l.includes('open')) return 'open'
    return l.replace(/\s+/g, '_')
  }
}
