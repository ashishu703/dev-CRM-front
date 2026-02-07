import React, { useState } from 'react'
import { CreditCard, ChevronDown, ChevronRight, DollarSign, Clock } from 'lucide-react'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function PaymentTrackingDropdown({ currentPage, onNavigate, sidebarOpen, isDarkMode = false }) {
  const [isOpen, setIsOpen] = useState(false)

  const isPaymentTrackingActive = currentPage === 'products' || currentPage === 'due-payment' || currentPage === 'advance-payment'

  return (
    <li>
      <div>
        <div
          className={cx(
            "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
            isPaymentTrackingActive
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
          )}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false)
            } else {
              setIsOpen(true)
              onNavigate("products")
            }
          }}
          style={{
            transform: isPaymentTrackingActive ? 'translateX(4px)' : 'none',
          }}
        >
          <div className="flex items-center space-x-3">
            <div className={isPaymentTrackingActive ? 'text-white' : 'text-slate-400'}>
              <CreditCard className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Payment Tracking</span>
            )}
          </div>
          {sidebarOpen && (
            <div className={isPaymentTrackingActive ? 'text-white' : 'text-slate-400'}>
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
        {isOpen && sidebarOpen && (
          <ul className="ml-8 mt-1 space-y-1">
            <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentPage === "products"
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("products")}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>All Payments</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentPage === "due-payment"
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("due-payment")}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Due Payment</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  "flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                  currentPage === "advance-payment"
                    ? 'bg-slate-700/70 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                )}
                onClick={() => onNavigate("advance-payment")}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Advance Payment</span>
                </div>
              </div>
            </li>
          </ul>
        )}
      </div>
    </li>
  )
}
