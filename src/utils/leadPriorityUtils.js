

const PRIORITY_CONFIG = {
  workStatus: { NOT_STARTED: 3, WORKING: 2, DONE: 0 },
  scoreCap: 20,
  normalizationThreshold: 15,
  normalizationFactor: 0.5,
  tierCriticalMin: 10,
  tierHighMin: 8,
  tierMediumMin: 5,
  tierLowMin: 1
}

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
  'FOLLOW UP / IN PROGRESS': 3,
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

const WORK_STATUS_WEIGHTS = { ...PRIORITY_CONFIG.workStatus }

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

/** True when lead has high engagement (e.g. Negotiation/Appointment); used so delay boost is not applied. */
export function isHighEngagementLead(followWeight, salesWeight) {
  return followWeight > 3 || salesWeight > 3
}

/** Align with backend: score/priority only applies when both sales + follow-up are meaningfully set. */
export function hasBothStatusesForPriority(lead) {
  const s = norm(lead?.salesStatus ?? lead?.sales_status ?? '')
  const f = norm(lead?.followUpStatus ?? lead?.follow_up_status ?? '')
  if (!s || s === 'PENDING') return false
  if (!f || f === 'PENDING') return false
  return true
}

function storedLeadScore(lead) {
  const raw = lead?.leadScore ?? lead?.lead_score
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function storedLeadPriority(lead) {
  const p = (lead?.leadPriority ?? lead?.lead_priority ?? 'LOW').toString().toUpperCase()
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'IGNORE'].includes(p)) return p
  return 'LOW'
}

function isSalesClosed(salesStatus) {
  const k = norm(salesStatus)
  const lower = k.toLowerCase()
  return lower.includes('closed') || lower.includes('converted') || lower.includes('lost') || lower.includes('loose') || lower.includes('completed') || lower === 'win' || k === 'WIN/CLOSED'
}

function getWorkStatusWeight(lead) {
  if (!lead) return WORK_STATUS_WEIGHTS.NOT_STARTED
  if (isSalesClosed(lead.salesStatus || lead.sales_status || '')) return WORK_STATUS_WEIGHTS.DONE
  if (lead.first_worked_at) return WORK_STATUS_WEIGHTS.WORKING
  return WORK_STATUS_WEIGHTS.NOT_STARTED
}

function getDelayEscalationBoost(assignedAt) {
  if (!assignedAt) return 0
  const assigned = new Date(assignedAt)
  const now = new Date()
  const days = Math.floor((now - assigned) / (24 * 60 * 60 * 1000))
  if (days <= 1) return 0
  if (days <= 3) return 1
  if (days <= 7) return 2
  return 3
}

function normalizeScore(score) {
  if (score <= PRIORITY_CONFIG.normalizationThreshold) return score
  const compressed = PRIORITY_CONFIG.normalizationThreshold +
    (score - PRIORITY_CONFIG.normalizationThreshold) * PRIORITY_CONFIG.normalizationFactor
  return Math.min(PRIORITY_CONFIG.scoreCap, Math.round(compressed * 100) / 100)
}

export function getLeadPriorityFromStatuses(salesStatus, followUpStatus) {
  const s = norm(salesStatus)
  if (!s || s === 'PENDING') return { priority: 'LOW', score: 2 }
  const fw = getFollowUpWeight(followUpStatus)
  const sw = getSalesWeight(salesStatus)
  const score = Math.min(10, fw + sw)
  if (score >= 8) return { priority: 'HIGH', score }
  if (score >= 5) return { priority: 'MEDIUM', score }
  if (score >= 1) return { priority: 'LOW', score }
  return { priority: 'IGNORE', score: 0 }
}

function computeDisplayScore(lead) {
  if (!hasBothStatusesForPriority(lead)) {
    const stored = storedLeadScore(lead)
    if (stored != null) return Math.min(PRIORITY_CONFIG.scoreCap, stored)
    return 2
  }
  const sales = lead.salesStatus || lead.sales_status || ''
  const followUp = lead.followUpStatus || lead.follow_up_status || ''
  const s = norm(sales)
  if (!s || s === 'PENDING') {
    let lowScore = getWorkStatusWeight(lead) + getFollowUpWeight(followUp)
    lowScore = normalizeScore(Math.min(PRIORITY_CONFIG.scoreCap, lowScore))
    return Math.min(5, lowScore)
  }
  const fw = getFollowUpWeight(followUp)
  const sw = getSalesWeight(sales)
  const work = getWorkStatusWeight(lead)
  const rawBoost = getDelayEscalationBoost(lead.assigned_at || lead.assignedAt)
  const delayBoost = isHighEngagementLead(fw, sw) ? 0 : rawBoost
  let score = fw + sw + work + delayBoost
  score = normalizeScore(score)
  return Math.min(PRIORITY_CONFIG.scoreCap, score)
}

export function getDisplayPriority(lead) {
  if (!hasBothStatusesForPriority(lead)) {
    return storedLeadPriority(lead)
  }
  const sales = lead.salesStatus || lead.sales_status || ''
  if (!norm(sales) || norm(sales) === 'PENDING') return 'LOW'
  const score = computeDisplayScore(lead)

  if (score < 5 && lead.followUpDate) {
    const d = new Date(lead.followUpDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    if (!Number.isNaN(d.getTime()) && d < today) return 'MEDIUM'
  }

  if (score >= PRIORITY_CONFIG.tierCriticalMin) return 'CRITICAL'
  if (score >= PRIORITY_CONFIG.tierHighMin) return 'HIGH'
  if (score >= PRIORITY_CONFIG.tierMediumMin) return 'MEDIUM'
  if (score >= PRIORITY_CONFIG.tierLowMin) return 'LOW'
  return 'IGNORE'
}

export function getDisplayScore(lead) {
  return computeDisplayScore(lead)
}
