"use client"

import React, { useEffect, useRef, useState } from 'react'
import { BarChart3, ChevronDown, ChevronRight, Calendar, Clock, Users, Search } from 'lucide-react'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function LeadStatusDropdown({ currentPage, onNavigate, sidebarOpen, isDarkMode = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const popupRef = useRef(null)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })

  const isLeadStatusActive = currentPage === 'scheduled-call' || currentPage === 'last-call' || currentPage === 'customers' || currentPage === '/customers'
  const subActiveCls = 'bg-indigo-600/30 text-indigo-200 shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_0_8px_rgba(99,102,241,0.15)]'
  const subInactiveCls = 'text-slate-400 hover:text-white hover:bg-slate-700/60'

  const updatePopupPos = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPopupPos({
      top: rect.top,
      left: rect.right + 8,
    })
  }

  useEffect(() => {
    if (!isOpen) return
    updatePopupPos()
    const onResize = () => updatePopupPos()
    const onDocClick = (e) => {
      if (!popupRef.current || !triggerRef.current) return
      if (
        !popupRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('mousedown', onDocClick)
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousedown', onDocClick)
    }
  }, [isOpen])

  return (
    <li>
      <div>
        <div
          ref={triggerRef}
          className={cx(
            "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
            isLeadStatusActive ? 'bg-indigo-600 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_0_14px_rgba(99,102,241,0.3)]' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
          )}
          onClick={() => {
            setIsOpen((p) => !p)
            setTimeout(updatePopupPos, 0)
          }}
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

        {isOpen && (
          <ul
            ref={popupRef}
            className="fixed z-[220] w-52 space-y-1 rounded-xl border border-slate-700/80 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md"
            style={{ top: `${popupPos.top}px`, left: `${popupPos.left}px` }}
          >
            <li>
              <div
                className={cx("flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm", (currentPage === 'customers' || currentPage === '/customers') && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') !== 'enquiry' ? subActiveCls : subInactiveCls)}
                onClick={() => {
                  onNavigate('/customers')
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Leads</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx("flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm", (currentPage === 'customers' || currentPage === '/customers') && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'enquiry' ? subActiveCls : subInactiveCls)}
                onClick={() => {
                  onNavigate('/customers?tab=enquiry')
                  setIsOpen(false)
                }}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Enquiries</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx("flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm", currentPage === 'scheduled-call' ? subActiveCls : subInactiveCls)}
                onClick={() => {
                  onNavigate('scheduled-call')
                  setIsOpen(false)
                }}
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
                onClick={() => {
                  onNavigate('last-call')
                  setIsOpen(false)
                }}
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
