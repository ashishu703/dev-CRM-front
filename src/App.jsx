import React, { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useFirebasePush } from './hooks/useFirebasePush'
import LoginPage from './pages/Auth/LoginPage.jsx'
import AnocabLanding from './pages/landingpage.jsx'
import SupportPage from './pages/support.jsx'
import DashboardLayout from './pages/DashboardLayout.jsx'
import MainDashboard from './pages/MainDashboard.jsx'
import SalesDepartmentHeadLayout from './pages/SalesDepartmentHead/SalesDepartmentHeadLayout.jsx'
import SalesDepartmentHeadDashboard from './pages/SalesDepartmentHead/SalesDepartmentHeadDashboard.jsx'
import HRDepartmentLayout from './pages/HRDepartment/HRDepartmentLayout.jsx'
import HRDepartmentDashboard from './pages/HRDepartment/HRDepartmentDashboard.jsx'
import SalespersonLayout from './pages/salesperson/salespersonlayout.jsx'
import MarketingSalespersonLayout from './pages/MarketingSalesperson/MarketingSalespersonLayout.jsx'
import OfficeSalesPersonLayout from './pages/OfficeSalesPerson/OfficeSalesPersonLayout.jsx'
import ProductionDepartmentHeadLayout from './pages/ProductionDepartmentHead/ProductionDepartmentHeadLayout.jsx'
import ProductionDepartmentHeadDashboard from './pages/ProductionDepartmentHead/ProductionDepartmentHeadDashboard.jsx'
import PPCLayout from './pages/ProductionDepartmentHead/PPC/PPCLayout.jsx'
import PPCDashboard from './pages/ProductionDepartmentHead/PPC/PPCDashboard.jsx'
import AccountsLayout from './pages/accounts/AccountsLayout.jsx'
import AccountsDashboard from './pages/accounts/accountsdashboard.jsx'
import ItLayout from './pages/it/ItLayout.jsx'
import ItDashboard from './pages/it/itdashboard.jsx'
import { getUserTypeForRole } from './constants/auth'
import RoleGuard from './components/RoleGuard'

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  
  useFirebasePush()
  
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    
    handleLocationChange()
    window.addEventListener('popstate', handleLocationChange)
    const interval = setInterval(handleLocationChange, 100)
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      clearInterval(interval)
    }
  }, [])
  
  const getCurrentUserType = () => {
    if (!user) return 'superadmin';
    
    if (user.uiUserType) {
      return user.uiUserType;
    }
    
    if (user.role && user.departmentType) {
      return getUserTypeForRole(user.role, user.departmentType);
    }
    
    return 'superadmin';
  }
  
  const userType = getCurrentUserType()

  const handleLogout = async () => {
    await logout()
    setActiveView('dashboard')
  }

  const shouldShowDashboard = isAuthenticated
  
  if (!shouldShowDashboard) {
    if (currentPath === '/login' || currentPath.startsWith('/login')) {
      return (
        <div className="App">
          <LoginPage />
        </div>
      )
    }
    if (currentPath === '/support' || currentPath.startsWith('/support')) {
      return (
        <div className="App">
          <LoginPage />
        </div>
      )
    }
    return (
      <div className="App">
        <AnocabLanding />
      </div>
    )
  }
  
  if (shouldShowDashboard && (currentPath === '/support' || currentPath.startsWith('/support'))) {
    return (
      <div className="App">
        <SupportPage />
      </div>
    )
  }
  
  return (
    <div className="App">
      {shouldShowDashboard ? (
        userType === 'salesdepartmenthead' ? (
          <SalesDepartmentHeadLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
            <SalesDepartmentHeadDashboard activeView={activeView} setActiveView={setActiveView} />
          </SalesDepartmentHeadLayout>
        ) : userType === 'hrdepartmenthead' ? (
          <HRDepartmentLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
            <HRDepartmentDashboard activeView={activeView} setActiveView={setActiveView} />
          </HRDepartmentLayout>
        ) : userType === 'salesperson' ? (
          <SalespersonLayout onLogout={handleLogout} />
        ) : userType === 'marketing-salesperson' ? (
          <MarketingSalespersonLayout onLogout={handleLogout} />
        ) : userType === 'productiondepartmenthead' ? (
          <RoleGuard allow={['department_head']} allowDepartmentTypes={['production','Production Department']} fallback={<LoginPage />}>
            <ProductionDepartmentHeadLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
              <ProductionDepartmentHeadDashboard activeView={activeView} setActiveView={setActiveView} />
            </ProductionDepartmentHeadLayout>
          </RoleGuard>
        ) : userType === 'production-staff' ? (
          <RoleGuard allow={['department_user']} allowDepartmentTypes={['production','Production Department']} fallback={<LoginPage />}>
            <PPCLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
              <PPCDashboard activeView={activeView} setActiveView={setActiveView} />
            </PPCLayout>
          </RoleGuard>
        ) : userType === 'tele-sales' ? (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">TeleSales Layout</h1>
            <p className="text-gray-600 mt-2">This feature is under development.</p>
          </div>
        ) : userType === 'office-sales-person' ? (
          <OfficeSalesPersonLayout />
        ) : userType === 'accountsdepartmenthead' || userType === 'accounts-user' ? (
          <AccountsLayout
            onLogout={handleLogout}
            activeView={activeView}
            setActiveView={setActiveView}
            headerUserType={userType}
          >
            <AccountsDashboard activeView={activeView} setActiveView={setActiveView} />
          </AccountsLayout>
        ) : userType === 'itdepartmenthead' || userType === 'it-user' ? (
          <ItLayout
            onLogout={handleLogout}
            activeView={activeView}
            setActiveView={setActiveView}
            headerUserType={userType}
          >
            <ItDashboard activeView={activeView} setActiveView={setActiveView} />
          </ItLayout>
        ) : (
          <DashboardLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
            <MainDashboard activeView={activeView} setActiveView={setActiveView} />
          </DashboardLayout>
        )
      ) : null}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
