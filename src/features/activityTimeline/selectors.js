'use strict';

export const EVENT_TYPE = {
  LEAD_CREATED: 'lead_created',
  FOLLOW_UP: 'follow_up',
  SALES_STATUS: 'sales_status',
  ORDER_CANCEL: 'order_cancel',
  QUOTATION: 'quotation',
  PI: 'pi',
  PHOTO: 'photo',
  DOC: 'doc',
  EMAIL: 'email',
};

function historyItemToEvents(historyItem) {
  const date = historyItem.follow_up_date || historyItem.created_at;
  const events = [];
  if (historyItem.sales_status) {
    events.push({
      id: `h-${historyItem.id}-sales`,
      type: EVENT_TYPE.SALES_STATUS,
      at: date,
      title: `Sales Status: ${String(historyItem.sales_status).replace(/_/g, ' ')}`,
      subtitle: historyItem.sales_status_remark || null,
      status: (historyItem.sales_status || '').toLowerCase(),
      raw: historyItem,
    });
  }
  if (historyItem.follow_up_status || historyItem.follow_up_remark) {
    events.push({
      id: `h-${historyItem.id}-fu`,
      type: EVENT_TYPE.FOLLOW_UP,
      at: date,
      title: `Follow-up Status: ${(historyItem.follow_up_status || 'Updated').toString().replace(/_/g, ' ')}`,
      subtitle: historyItem.follow_up_remark || null,
      status: (historyItem.follow_up_status || 'pending').toLowerCase(),
      raw: historyItem,
    });
  }
  if (events.length === 0) {
    events.push({
      id: `h-${historyItem.id}`,
      type: EVENT_TYPE.FOLLOW_UP,
      at: date,
      title: 'Follow up',
      subtitle: historyItem.follow_up_remark || null,
      status: 'pending',
      raw: historyItem,
    });
  }
  return events;
}

function toEvent(historyItem) {
  return historyItemToEvents(historyItem)[0];
}

function cancelToEvent(cancel) {
  return {
    id: `c-${cancel.id}`,
    type: EVENT_TYPE.ORDER_CANCEL,
    at: cancel.created_at,
    title: 'Order cancel request',
    subtitle: cancel.reason || null,
    status: (cancel.status || 'pending').toLowerCase(),
    raw: cancel,
  };
}

/** Merge history + order cancels into one list, newest first. Use with useMemo(history, orderCancels). */
export function getUnifiedActivities(history, orderCancels) {
  const list = [];
  (Array.isArray(history) ? history : []).forEach((h) => historyItemToEvents(h).forEach((ev) => list.push(ev)));
  (Array.isArray(orderCancels) ? orderCancels : []).forEach((c) => list.push(cancelToEvent(c)));
  list.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  return list;
}

function quotationToEvent(q) {
  return { id: `q-${q.id}`, type: EVENT_TYPE.QUOTATION, at: q.quotationDate || q.created_at || q.createdAt, title: 'Quotation', subtitle: q.quotationNumber || `Quotation #${q.id}`, status: (q.status || 'draft').toLowerCase(), raw: q };
}
function piToEvent(pi) {
  return { id: `pi-${pi.id}`, type: EVENT_TYPE.PI, at: pi.pi_date || pi.piDate || pi.created_at, title: 'Proforma Invoice', subtitle: pi.pi_number || `PI #${pi.id}`, status: (pi.status || 'draft').toLowerCase(), raw: pi };
}
function docToEvent(d) {
  return { id: `d-${d.id}`, type: EVENT_TYPE.DOC, at: d.uploadedAt, title: 'Document', subtitle: d.filename, status: null, raw: d };
}
function photoToEvent(p) {
  return { id: `ph-${p.id}`, type: EVENT_TYPE.PHOTO, at: p.uploadedAt, title: 'Photo', subtitle: p.reason || p.filename, status: null, raw: p };
}
function emailToEvent(e) {
  let payload = {};
  try {
    payload = typeof e.payload === 'string' ? (JSON.parse(e.payload || '{}') || {}) : (e.payload || {});
  } catch (_) {}
  const sub = payload.subject || (Array.isArray(payload.to) ? payload.to[0] : payload.to) || '';
  return { id: `em-${e.id}`, type: EVENT_TYPE.EMAIL, at: e.sentAt, title: 'Email sent', subtitle: sub, status: null, raw: e };
}

/** Merge all event sources into one list, newest first. */
export function getFullUnifiedActivities(history, orderCancels, quotations = [], pis = [], docs = [], photos = [], emails = []) {
  const list = [];
  (Array.isArray(history) ? history : []).forEach((h) => historyItemToEvents(h).forEach((ev) => list.push(ev)));
  (Array.isArray(orderCancels) ? orderCancels : []).forEach((c) => list.push(cancelToEvent(c)));
  (Array.isArray(quotations) ? quotations : []).forEach((q) => list.push(quotationToEvent(q)));
  (Array.isArray(pis) ? pis : []).forEach((pi) => list.push(piToEvent(pi)));
  (Array.isArray(docs) ? docs : []).forEach((d) => list.push(docToEvent(d)));
  (Array.isArray(photos) ? photos : []).forEach((p) => list.push(photoToEvent(p)));
  (Array.isArray(emails) ? emails : []).forEach((e) => list.push(emailToEvent(e)));
  list.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  return list;
}

/** Group events by date (YYYY-MM-DD). Use with useMemo(activities). */
export function getActivitiesGroupedByDate(activities) {
  const groups = {};
  (activities || []).forEach((ev) => {
    const d = ev.at ? new Date(ev.at) : new Date();
    const key = d.toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });
  return groups;
}

const TODAY = 'Today';
const THIS_WEEK = 'This Week';
const LAST_WEEK = 'Last Week';

function getWeekStart(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getMonthKey(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Group activities into Today, This Week, Last Week, and by Month. Returns { sections: [{ key, label, events }] }. */
export function getActivitiesGroupedByTodayWeekMonth(activities) {
  const list = activities || [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = getWeekStart(now);
  const lastWeekStart = weekStart - 7 * 24 * 60 * 60 * 1000;

  const today = [];
  const thisWeek = [];
  const lastWeek = [];
  const byMonth = {};

  list.forEach((ev) => {
    const t = ev.at ? new Date(ev.at).getTime() : 0;
    const dateKey = ev.at ? new Date(ev.at).toISOString().slice(0, 10) : '';
    if (t >= todayStart) {
      today.push(ev);
    } else if (t >= weekStart) {
      thisWeek.push(ev);
    } else if (t >= lastWeekStart) {
      lastWeek.push(ev);
    } else {
      const mk = getMonthKey(ev.at || now);
      if (!byMonth[mk]) byMonth[mk] = [];
      byMonth[mk].push(ev);
    }
  });

  const sections = [];
  if (today.length) sections.push({ key: 'today', label: TODAY, events: today });
  if (thisWeek.length) sections.push({ key: 'thisWeek', label: THIS_WEEK, events: thisWeek });
  if (lastWeek.length) sections.push({ key: 'lastWeek', label: LAST_WEEK, events: lastWeek });
  const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));
  monthKeys.forEach((mk) => {
    const date = new Date(mk + '-01');
    const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    sections.push({ key: `month-${mk}`, label, events: byMonth[mk], collapsible: true });
  });
  return sections;
}
