import React, { useState, useMemo } from "react"
import {
  Target,
  Phone,
  RefreshCw,
  Calendar,
  UserPlus,
  CheckCircle,
  XCircle,
  BarChart3,
  IndianRupee,
  Flame,
  Clock,
  MapPin,
  ChevronRight,
  Trophy,
  TrendingUp
} from "lucide-react"
import { motion } from "framer-motion"

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

// ─── 1. Target Progress ─────────────────────────────────────────────────────
function TargetProgress({ monthlyTarget, achieved, isDarkMode }) {
  const percent = monthlyTarget > 0 ? Math.min(100, Math.round((achieved / monthlyTarget) * 100)) : 0
  const barColor =
    percent >= 70 ? "bg-emerald-500"
    : percent >= 30 ? "bg-amber-500"
    : "bg-red-500"

  return (
    <div className={cx(
      "rounded-xl border-2 p-4 sm:p-5 transition-all duration-300",
      isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white/90 border-gray-200 shadow-md"
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cx(
          "p-2.5 rounded-xl",
          isDarkMode ? "bg-amber-500/20" : "bg-amber-50"
        )}>
          <Target className={cx("h-5 w-5 sm:h-6 sm:w-6", isDarkMode ? "text-amber-400" : "text-amber-600")} />
        </div>
        <div>
          <h3 className={cx("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
            Monthly Target
          </h3>
          <p className={cx("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
            ₹{achieved.toLocaleString("en-IN")} / ₹{monthlyTarget.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Progress</span>
          <span className={cx(
            percent >= 70 ? "text-emerald-600" : percent >= 30 ? "text-amber-600" : "text-red-600",
            isDarkMode && (percent >= 70 ? "text-emerald-400" : percent >= 30 ? "text-amber-400" : "text-red-400")
          )}>
            {percent}%
          </span>
        </div>
        <div className={cx(
          "h-3 rounded-full overflow-hidden",
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        )}>
          <motion.div
            className={cx("h-full rounded-full", barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── 2. Activity Cards ──────────────────────────────────────────────────────
function ActivityCards({ isDarkMode, onNavigate, callsToday = 0, followupsDue = 0, meetingsToday = 0, newLeads = 0 }) {
  const cards = [
    {
      id: "calls",
      label: "Calls Today",
      icon: Phone,
      count: callsToday,
      path: "last-call",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "followups",
      label: "Followups Due",
      icon: RefreshCw,
      count: followupsDue,
      path: "/customers",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10"
    },
    {
      id: "meetings",
      label: "Meetings",
      icon: Calendar,
      count: meetingsToday,
      path: "scheduled-call",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10"
    },
    {
      id: "leads",
      label: "New Leads",
      icon: UserPlus,
      count: newLeads,
      path: "/customers?createdToday=true",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10"
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.(item.path)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cx(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200",
              isDarkMode
                ? "bg-gray-800/60 border-gray-700 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
                : "bg-white/90 border-gray-200 hover:border-indigo-300 hover:shadow-lg"
            )}
          >
            <div className={cx(
              "p-2.5 rounded-xl",
              isDarkMode ? "bg-gray-700/80" : item.bgColor
            )}>
              <Icon className={cx(
                "h-5 w-5 sm:h-6 sm:w-6",
                isDarkMode ? "text-indigo-400" : item.color
              )} />
            </div>
            <span className={cx(
              "text-xs font-medium text-center line-clamp-2",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              {item.label}
            </span>
            <span className={cx(
              "text-lg font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              {item.count}
            </span>
            <ChevronRight className={cx(
              "h-4 w-4 opacity-50",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )} />
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── 3. Conversion Snapshot ─────────────────────────────────────────────────
function ConversionStats({ leadsAssigned, converted, lost, conversionRate, isDarkMode }) {
  const total = leadsAssigned || 1
  const convertedPct = Math.round((converted / total) * 100)
  const lostPct = Math.round((lost / total) * 100)
  const otherPct = 100 - convertedPct - lostPct

  const segments = [
    { value: converted, color: "#10b981", label: "Converted" },
    { value: lost, color: "#ef4444", label: "Lost" },
    { value: Math.max(0, leadsAssigned - converted - lost), color: "#6b7280", label: "Open" }
  ].filter(s => s.value > 0)

  const circumference = 2 * Math.PI * 36
  let offset = 0
  const strokeDashArrays = segments.map(s => {
    const pct = (s.value / total) * 100
    const length = (pct / 100) * circumference
    const dashArray = `${length} ${circumference - length}`
    const dashOffset = -offset
    offset += length
    return { ...s, dashArray, dashOffset }
  })

  return (
    <div className={cx(
      "rounded-xl border-2 p-4 transition-all duration-300",
      isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white/90 border-gray-200 shadow-md"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className={cx("h-4 w-4", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
        <h3 className={cx("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
          Conversion Snapshot
        </h3>
      </div>
      <div className="flex gap-4 items-start">
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
            {strokeDashArrays.map((seg, i) => (
              <circle
                key={i}
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cx(
              "text-sm font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              {conversionRate}%
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserPlus className={cx("h-4 w-4 flex-shrink-0", isDarkMode ? "text-gray-400" : "text-gray-500")} />
              <span className={cx("text-xs", isDarkMode ? "text-gray-300" : "text-gray-600")}>Assigned</span>
            </div>
            <span className={cx("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
              {leadsAssigned}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              <span className={cx("text-xs", isDarkMode ? "text-gray-300" : "text-gray-600")}>Converted</span>
            </div>
            <span className="text-sm font-semibold text-emerald-600">{converted}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span className={cx("text-xs", isDarkMode ? "text-gray-300" : "text-gray-600")}>Lost</span>
            </div>
            <span className="text-sm font-semibold text-red-600">{lost}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Revenue Snapshot ────────────────────────────────────────────────────
function RevenueStats({ todayCollection, monthRevenue, pendingPayment, isDarkMode }) {
  const items = [
    {
      label: "Today Collection",
      value: todayCollection,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10"
    },
    {
      label: "This Month Revenue",
      value: monthRevenue,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-500/10"
    },
    {
      label: "Pending Payment",
      value: pendingPayment,
      icon: IndianRupee,
      color: "text-amber-600",
      bg: "bg-amber-500/10"
    }
  ]

  const formatAmount = (n) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Number(n).toLocaleString("en-IN")}`

  return (
    <div className={cx(
      "rounded-xl border-2 p-4 transition-all duration-300",
      isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white/90 border-gray-200 shadow-md"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <IndianRupee className={cx("h-4 w-4", isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
        <h3 className={cx("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
          Revenue Snapshot
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={cx(
                "flex items-center justify-between p-2.5 rounded-lg",
                isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cx(
                  "p-1.5 rounded-lg",
                  isDarkMode ? "bg-gray-600/50" : item.bg
                )}>
                  <Icon className={cx(
                    "h-3.5 w-3.5",
                    isDarkMode ? "text-gray-300" : item.color
                  )} />
                </div>
                <span className={cx("text-xs font-medium", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                  {item.label}
                </span>
              </div>
              <span className={cx(
                "text-sm font-bold",
                item.label.includes("Pending") ? "text-amber-600" : "text-emerald-600",
                isDarkMode && (item.label.includes("Pending") ? "text-amber-400" : "text-emerald-400")
              )}>
                {formatAmount(item.value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 5. Today Focus Tasks ───────────────────────────────────────────────────
const getTodayLocalStr = () => {
  const d = new Date()
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
}

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

function TodayFocusList({ isDarkMode, leads = [], todayStr }) {
  const todayLocal = todayStr || getTodayLocalStr()

  const todayTasks = useMemo(() => {
    return (leads || [])
      .filter((l) => {
        const fd = l.follow_up_date || l.followUpDate || null
        if (!fd) return false
        const fdStr = typeof fd === "string" ? (fd.includes("T") ? fd.split("T")[0] : fd.slice(0, 10)) : new Date(fd).toISOString().split("T")[0]
        if (fdStr !== todayLocal) return false
        const s = String(l.sales_status || "").toLowerCase()
        const isClosed = ["win/closed", "win", "closed", "lost"].includes(s) || s.includes("lost")
        if (isClosed) return false
        const priority = (l.lead_priority || l.leadPriority || "LOW").toUpperCase()
        return priority === "CRITICAL" || priority === "HIGH"
      })
      .sort((a, b) => {
        const pa = (a.lead_priority || a.leadPriority || "LOW").toUpperCase()
        const pb = (b.lead_priority || b.leadPriority || "LOW").toUpperCase()
        return (PRIORITY_ORDER[pa] ?? 99) - (PRIORITY_ORDER[pb] ?? 99)
      })
      .map((l) => ({
        id: `lead-${l.id}`,
        text: `Follow up with ${l.name || "lead"}`,
        priority: (l.lead_priority || l.leadPriority || "LOW").toUpperCase() === "CRITICAL" ? "high" : "medium",
        done: false
      }))
  }, [leads, todayLocal])

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <Flame className="h-3.5 w-3.5 text-red-500" />
      case "medium":
        return <Clock className="h-3.5 w-3.5 text-amber-500" />
      default:
        return <MapPin className="h-3.5 w-3.5 text-gray-500" />
    }
  }

  return (
    <div className={cx(
      "rounded-xl border-2 p-4 transition-all duration-300",
      isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white/90 border-gray-200 shadow-md"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Trophy className={cx("h-4 w-4", isDarkMode ? "text-amber-400" : "text-amber-600")} />
        <h3 className={cx("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
          Today&apos;s Focus
        </h3>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {todayTasks.length === 0 ? (
          <p className={cx("text-xs py-4 text-center", isDarkMode ? "text-gray-400" : "text-gray-500")}>
            No high-priority leads due for today
          </p>
        ) : (
          todayTasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ x: 4 }}
              className={cx(
                "flex items-center gap-3 p-2.5 rounded-lg",
                isDarkMode ? "bg-gray-700/30" : "bg-gray-50"
              )}
            >
              <span className="flex-shrink-0">{getPriorityIcon(task.priority)}</span>
              <span className={cx("text-xs flex-1", isDarkMode ? "text-gray-300" : "text-gray-700")}>
                {task.text}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
export default function MyPerformancePanel({
  isDarkMode = false,
  onNavigate,
  userTarget = {},
  businessMetrics = {},
  leads = [],
  allPayments = []
}) {
  const monthlyTarget = Number(userTarget.target || 0) || 100000
  const achieved = Number(userTarget.achievedTarget || businessMetrics.totalReceivedPayment || 0)

  const metrics = useMemo(() => {
    const filtered = leads
    const total = filtered.length
    const converted = filtered.filter((l) => {
      const s = String(l.sales_status || "").toLowerCase()
      return s === "win/closed" || s === "win" || s === "closed"
    }).length
    const lost = filtered.filter((l) =>
      String(l.sales_status || "").toLowerCase().includes("lost")
    ).length
    const convRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0
    return { leadsAssigned: total, converted, lost, conversionRate: convRate }
  }, [leads])

  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)

  const todayCollection = (allPayments || [])
    .filter((p) => {
      const status = String(p.payment_status || p.status || "").toLowerCase()
      const approved = String(p.approval_status || "").toLowerCase() === "approved"
      const isRefund = p.is_refund === true || p.is_refund === 1
      if (
        !approved ||
        isRefund ||
        !["completed", "paid", "success", "advance"].includes(status)
      )
        return false
      const pd = p.payment_date ? new Date(p.payment_date) : null
      if (!pd) return false
      const d = pd.toISOString().split("T")[0]
      return d === todayStr
    })
    .reduce((sum, p) => sum + Number(p.installment_amount || p.paid_amount || p.amount || 0), 0)

  const monthRevenue = Number(businessMetrics.totalReceivedPayment || 0)
  const pendingPayment = Number(businessMetrics.duePayment || 0)

  const leadsCreatedToday = (leads || []).filter((l) => {
    const d = l.created_at ? new Date(l.created_at).toISOString().split("T")[0] : null
    return d === todayStr
  }).length
  const getLocalDateStr = (d) => {
    if (!d) return null
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return null
    return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0")
  }
  const todayLocal = getLocalDateStr(new Date()) || todayStr
  const followupsWithDate = (leads || []).filter((l) => {
    const fd = l.follow_up_date || l.followUpDate || null
    if (!fd) return false
    const fdStr = getLocalDateStr(fd)
    if (!fdStr || fdStr > todayLocal) return false
    const s = String(l.sales_status || "").toLowerCase()
    const isClosed = ["win/closed", "win", "closed", "lost"].includes(s) || s.includes("lost")
    return !isClosed
  })
  const followupsDueCount = followupsWithDate.length > 0
    ? followupsWithDate.length
    : (leads || []).filter((l) => {
        const s = String(l.sales_status || "").toLowerCase()
        const needsFollowup = ["pending", "running", "interested"].includes(s) || s.includes("interested")
        const isClosed = ["win/closed", "win", "closed", "lost"].includes(s) || s.includes("lost")
        return needsFollowup && !isClosed
      }).length

  return (
    <div className="space-y-6">
      {/* Target Progress */}
      <TargetProgress
        monthlyTarget={monthlyTarget}
        achieved={achieved}
        isDarkMode={isDarkMode}
      />

      {/* Activity Cards */}
      <div>
        <h3 className={cx(
          "text-xs font-semibold uppercase tracking-wider mb-3",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          Today&apos;s Activity
        </h3>
        <ActivityCards
          isDarkMode={isDarkMode}
          onNavigate={onNavigate}
          newLeads={leadsCreatedToday}
          followupsDue={followupsDueCount}
          callsToday={0}
          meetingsToday={0}
        />
      </div>

      {/* Conversion & Revenue side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConversionStats
          leadsAssigned={metrics.leadsAssigned}
          converted={metrics.converted}
          lost={metrics.lost}
          conversionRate={metrics.conversionRate}
          isDarkMode={isDarkMode}
        />
        <RevenueStats
          todayCollection={todayCollection}
          monthRevenue={monthRevenue}
          pendingPayment={pendingPayment}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Today Focus */}
      <TodayFocusList isDarkMode={isDarkMode} leads={leads} todayStr={todayStr} />
    </div>
  )
}
