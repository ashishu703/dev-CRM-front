import React, { useState } from 'react'
import { ProductionModuleApp } from '../../../Production department/frontend/src/module/ProductionModuleApp'
import PermissionGuard from '../../components/PermissionGuard'
import { Permissions } from '../../constants/permissions'
import ProductionStaffSidebar from './ProductionStaffSidebar'
import AshvayChat from '../../components/AshvayChat'

export default function ProductionStaffLayout({ onLogout }) {
  const [currentPage, setCurrentPage] = useState('console')
  const routeFor = (page) => {
    switch (page) {
      case 'console':
        return '/production/console'
      case 'tasks':
        return '/ppc/plans'
      case 'inventory':
        return '/stock/inventory'
      default:
        return '/'
    }
  }
  return (
    <PermissionGuard anyOf={[Permissions.VIEW_PRODUCTION_DASHBOARD]} departmentType="production" fallback={<div className="p-6">Access denied.</div>}>
      <div className="h-screen flex bg-gray-50">
        <ProductionStaffSidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout} />
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            <ProductionModuleApp useMemoryRouter={true} initialPath={routeFor(currentPage)} renderShell={false} />
          </div>
        </main>
      </div>
      <AshvayChat showFloatingButton={false} />
    </PermissionGuard>
  )
}


