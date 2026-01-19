"use client"

import React, { useState, useEffect } from 'react'
import { BarChart3, ChevronDown, ChevronRight, Calendar, Clock, Users } from 'lucide-react'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function LeadStatusDropdown({ currentPage, onNavigate, sidebarOpen, isDarkMode = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scheduledLeads, setScheduledLeads] = useState([])
  const [lastCallLeads, setLastCallLeads] = useState([])
  const [expandedStatus, setExpandedStatus] = useState(null)
  const [leads, setLeads] = useState([])

  // trigger fetching when a status is expanded
  useFetchLeads(isOpen, expandedStatus, setScheduledLeads, setLastCallLeads, setLeads)

  const isLeadStatusActive = currentPage === 'lead-status' || currentPage === 'scheduled-call' || currentPage === 'last-call' || currentPage === 'customers' || currentPage === '/customers'

  return (
    <li>
      <div>
        {/* Main Lead Status Button */}
        <div
          className={cx(
            "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
            isLeadStatusActive
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
              : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
          )}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false)
            } else {
              setIsOpen(true)
              // onNavigate("lead-status") // Commented out - dropdown should open without redirecting
            }
          }}
          style={{
            transform: isLeadStatusActive ? 'translateX(4px)' : 'none',
          }}
        >
          <div className="flex items-center space-x-3">
            <div className={isLeadStatusActive ? 'text-white' : 'text-slate-400'}>
              <BarChart3 className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Lead Status</span>
            )}
          </div>
          {sidebarOpen && (
            <div className={isLeadStatusActive ? 'text-white' : 'text-slate-400'}>
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && sidebarOpen && (
            <ul className="ml-8 mt-1 space-y-1">
            <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  expandedStatus === 'leads' || currentPage === 'customers'
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                )}
                onClick={() => {
                  setExpandedStatus(prev => prev === 'leads' ? null : 'leads')
                  onNavigate('/customers')
                }}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Leads</span>
                </div>
              </div>

              {expandedStatus === 'leads' && (
                <ul className="mt-1 ml-4 space-y-1">
                  {leads.length > 0 && (
                    leads.map(lead => (
                      <li key={lead.id}>
                        <div
                          className="flex items-center px-2 py-1 rounded-md cursor-pointer text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          onClick={() => onNavigate(`/customers/${lead.id}`)}
                        >
                          <span className="truncate" style={{ maxWidth: 160 }}>{lead.name || lead.title || lead.company || lead.phone}</span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
            {/* <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentPage === "lead-status"
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                )}
                onClick={() => onNavigate("lead-status")}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>All Leads</span>
                </div>
              </div>
            </li> */}
            <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentPage === "scheduled-call"
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                )}
                onClick={() => {
                  onNavigate("scheduled-call")
                  setExpandedStatus(prev => prev === 'scheduled-call' ? null : 'scheduled-call')
                }}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled Call</span>
                </div>
              </div>

              {expandedStatus === 'scheduled-call' && (
                <ul className="mt-1 ml-4 space-y-1">
                      {scheduledLeads.length > 0 && (
                    scheduledLeads.map(lead => (
                      <li key={lead.id}>
                        <div
                          className="flex items-center px-2 py-1 rounded-md cursor-pointer text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          onClick={() => onNavigate(`/customers/${lead.id}`)}
                        >
                          <span className="truncate" style={{ maxWidth: 160 }}>{lead.name || lead.title || lead.company || lead.phone}</span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentPage === "last-call"
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                )}
                onClick={() => {
                  onNavigate("last-call")
                  setExpandedStatus(prev => prev === 'last-call' ? null : 'last-call')
                }}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Call</span>
                </div>
              </div>

              {expandedStatus === 'last-call' && (
                <ul className="mt-1 ml-4 space-y-1">
                  {lastCallLeads.length > 0 && (
                    lastCallLeads.map(lead => (
                      <li key={lead.id}>
                        <div
                          className="flex items-center px-2 py-1 rounded-md cursor-pointer text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
                          onClick={() => onNavigate(`/customers/${lead.id}`)}
                        >
                          <span className="truncate" style={{ maxWidth: 160 }}>{lead.name || lead.title || lead.company || lead.phone}</span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          </ul>
        )}
      </div>
    </li>
  )
}

// Hook: fetch leads when a specific status is expanded
function useFetchLeads(isOpen, expandedStatus, setScheduledLeads, setLastCallLeads, setLeads) {
  useEffect(() => {
    if (!isOpen || !expandedStatus) return

    const controller = new AbortController()

    async function fetchLeadsFor(status) {
      try {
        const res = await fetch(`/api/leads?filter=${encodeURIComponent(status)}`, { signal: controller.signal })
        if (!res.ok) return []
        const data = await res.json()
        return Array.isArray(data) ? data : (data.leads || [])
      } catch (e) {
        return []
      }
    }

    (async () => {
      if (expandedStatus === 'scheduled-call') {
        const leads = await fetchLeadsFor('scheduled-call')
        setScheduledLeads(leads)
      } else if (expandedStatus === 'last-call') {
        const leads = await fetchLeadsFor('last-call')
        setLastCallLeads(leads)
      } else if (expandedStatus === 'leads') {
        // fetch the leads that used to live in the sidebar (customers)
        const leads = await fetchLeadsFor('customers')
        setLeads && setLeads(leads)
      }
    })()

    return () => controller.abort()
  }, [isOpen, expandedStatus, setScheduledLeads, setLastCallLeads, setLeads])
}

// call the fetch hook from component by exporting a small wrapper
// (we call it inside the component via direct invocation below)
