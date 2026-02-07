// FINAL_SCORE = FollowUpWeight + SalesStatusWeight + WorkStatusWeight + DelayPenalty
// 10+ CRITICAL, 8-9 HIGH, 5-7 MEDIUM, 1-4 LOW, 0 IGNORE

function norm(s) {
  if (s == null || typeof s !== 'string') return ''
  return String(s).trim().toUpperCase()
}

const FOLLOW_UP_WEIGHTS = {
  'APPOINTMENT SCHEDULED': 5,
  'INTERESTED': 4,
  'NEGOTIATION': 5,
  'QUOTATION SENT': 4,
  'CALL BACK REQUEST': 3,
  'FOLLOW UP': 3,
  'IN PROGRESS': 3,
  'PENDING': 2,
  'CURRENTLY NOT REQUIRED': 1,
  'NOT INTERESTED': 0,
  'CLOSED': 0,
  'CLOSED LOST': 0,
  'CLOSED/LOST': 0,
  'UNREACHABLE': 1,
  'NOT RELEVANT': 0,
  'CLOSE ORDER': 4
}

const SALES_WEIGHTS = {
  'RUNNING': 4,
  'IN PROGRESS': 3,
  'INTERESTED': 3,
  'NEGOTIATION': 5,
  'WIN LEAD': 5,
  'WIN/CLOSED': 0,
  'WIN': 0,
  'CLOSED': 0,
  'CONVERTED': 0,
  'LOST': 0,
  'LOOSE': 0,
  'LOST/CLOSED': 0,
  'COMPLETED': 0,
  'PENDING': 2
}

const WORK_STATUS_WEIGHTS = { NOT_STARTED: 4, WORKING: 2, DONE: 0 }

function getFollowUpWeight(followUpStatus) {
  const key = norm(followUpStatus)
  if (!key) return 0
  if (FOLLOW_UP_WEIGHTS[key] !== undefined) return FOLLOW_UP_WEIGHTS[key]
  const lower = key.toLowerCase()
  if (lower.includes('appointment') && lower.includes('scheduled')) return 5
  if (lower.includes('quotation') && lower.includes('sent')) return 4
  if (lower.includes('negotiation')) return 5
  if (lower.includes('interested')) return 4
  if (lower.includes('call back')) return 3
  if (lower.includes('follow')) return 3
  if (lower.includes('not interested')) return 0
  if (lower.includes('closed') || lower.includes('lost')) return 0
  if (lower.includes('unreachable')) return 1
  if (lower.includes('currently not required')) return 1
  if (lower === 'pending') return 2
  return 0
}

export function getSalesWeight(salesStatus) {
  const key = norm(salesStatus)
  if (!key) return 0
  if (SALES_WEIGHTS[key] !== undefined) return SALES_WEIGHTS[key]
  const lower = key.toLowerCase()
  if (lower === 'running') return 4
  if (lower.includes('progress')) return 3
  if (lower.includes('interested')) return 3
  if (lower.includes('negotiation')) return 5
  if (lower.includes('win')) return lower.includes('lead') ? 5 : 0
  if (lower.includes('closed') || lower.includes('converted') || lower.includes('lost') || lower.includes('loose') || lower.includes('completed')) return 0
  if (lower === 'pending') return 2
  return 0
}

function isSalesClosed(salesStatus) {
  const k = norm(salesStatus)
  const lower = k.toLowerCase()
  return lower.includes('closed') || lower.includes('converted') || lower.includes('lost') || lower.includes('loose') || lower.includes('completed') || lower === 'win' || k === 'WIN/CLOSED'
}

function getWorkStatusWeight(lead) {
  if (!lead) return WORK_STATUS_WEIGHTS.NOT_STARTED
  if (isSalesClosed(lead.salesStatus || '')) return WORK_STATUS_WEIGHTS.DONE
  if (lead.first_worked_at) return WORK_STATUS_WEIGHTS.WORKING
  return WORK_STATUS_WEIGHTS.NOT_STARTED
}

function getDelayPenalty(assignedAt) {
  if (!assignedAt) return 0
  const assigned = new Date(assignedAt)
  const now = new Date()
  const days = Math.floor((now - assigned) / (24 * 60 * 60 * 1000))
  if (days <= 1) return 0
  if (days <= 3) return 1
  if (days <= 7) return 2
  return 3
}

export function getLeadPriorityFromStatuses(salesStatus, followUpStatus) {
  const fw = getFollowUpWeight(followUpStatus)
  const sw = getSalesWeight(salesStatus)
  const score = Math.min(10, fw + sw)
  if (score >= 8) return { priority: 'HIGH', score }
  if (score >= 5) return { priority: 'MEDIUM', score }
  if (score >= 1) return { priority: 'LOW', score }
  return { priority: 'IGNORE', score: 0 }
}

export function getDisplayPriority(lead) {
  const sales = lead.salesStatus || ''
  const followUp = lead.followUpStatus || ''
  const baseScore = getFollowUpWeight(followUp) + getSalesWeight(sales)
  const workWeight = getWorkStatusWeight(lead)
  const delayPenalty = getDelayPenalty(lead.assigned_at || lead.assignedAt)
  const score = Math.min(20, baseScore + workWeight + delayPenalty)

  if ((score < 5 || score >= 10) && lead.followUpDate) {
    const d = new Date(lead.followUpDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    if (!Number.isNaN(d.getTime()) && d < today && score < 5) return 'MEDIUM'
  }

  if (score >= 10) return 'CRITICAL'
  if (score >= 8) return 'HIGH'
  if (score >= 5) return 'MEDIUM'
  if (score >= 1) return 'LOW'
  return 'IGNORE'
}

export function getDisplayScore(lead) {
  const sales = lead.salesStatus || ''
  const followUp = lead.followUpStatus || ''
  const base = getFollowUpWeight(followUp) + getSalesWeight(sales)
  const work = getWorkStatusWeight(lead)
  const delay = getDelayPenalty(lead.assigned_at || lead.assignedAt)
  return Math.min(20, base + work + delay)
}
