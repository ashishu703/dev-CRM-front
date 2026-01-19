import React, { useState } from 'react'
import { Play, ClipboardList, Boxes, LogOut, HelpCircle } from 'lucide-react'

export default function ProductionStaffSidebar({ currentPage, onNavigate, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const items = [
    { id: 'console', label: 'Execution Console', icon: <Play className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-5 h-5" /> },
  ]

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} h-screen flex flex-col border-r border-gray-200`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {isExpanded && <div className="font-bold text-gray-800 text-lg">Production</div>}
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-gray-100 rounded transition-colors">
          {isExpanded ? '⟨' : '⟩'}
        </button>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${currentPage === item.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                onClick={() => onNavigate(item.id)}
              >
                <div className={currentPage === item.id ? 'text-blue-600' : 'text-gray-500'}>
                  {item.icon}
                </div>
                {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Support Button */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Support</span>}
        </button>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}


