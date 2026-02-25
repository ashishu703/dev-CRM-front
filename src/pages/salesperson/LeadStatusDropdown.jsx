"use client"

import React, { useState } from 'react'
import { BarChart3, ChevronDown, ChevronRight, Calendar, Clock, Users } from 'lucide-react'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function LeadStatusDropdown({ currentPage, onNavigate, sidebarOpen, isDarkMode = false }) {
  const [isOpen, setIsOpen] = useState(false)

  const isLeadStatusActive = currentPage === 'lead-status' || currentPage === 'scheduled-call' || currentPage === 'last-call' || currentPage === 'customers' || currentPage === '/customers'
  const subActiveCls = 'bg-indigo-600/30 text-indigo-200 shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_0_8px_rgba(99,102,241,0.15)]'
  const subInactiveCls = 'text-slate-400 hover:text-white hover:bg-slate-700/60'

  return (
    <li>
      <div>
        <div
          className={cx(
            "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
            isLeadStatusActive ? 'bg-indigo-600 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_0_14px_rgba(99,102,241,0.3)]' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
          )}
          onClick={() => setIsOpen((p) => !p)}
          style={{ transform: isLeadStatusActive ? 'translateX(4px)' : 'none' }}
        >
          <div className="flex items-center space-x-3">
            <div className={isLeadStatusActive ? 'text-white' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
              <BarChart3 className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Lead Status</span>
            )}
          </div>
          {sidebarOpen && (
            <div className={isLeadStatusActive ? 'text-white' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          )}
        </div>

        {isOpen && sidebarOpen && (
          <ul className="ml-8 mt-1 space-y-1">
            <li>
              <div
                className={cx("flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm", currentPage === 'customers' || currentPage === '/customers' ? subActiveCls : subInactiveCls)}
                onClick={() => onNavigate('/customers')}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Leads</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx("flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm", currentPage === 'scheduled-call' ? subActiveCls : subInactiveCls)}
                onClick={() => onNavigate('scheduled-call')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled Call</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx("flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm", currentPage === 'last-call' ? subActiveCls : subInactiveCls)}
                onClick={() => onNavigate('last-call')}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Call</span>
                </div>
              </div>
            </li>
          </ul>
        )}
      </div>
    </li>
  )
}
