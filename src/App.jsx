import React, { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/Auth/LoginPage.jsx'
import AnocabLanding from './pages/landingpage.jsx'
import SupportPage from './pages/support.jsx'
import PrivacyPolicyPage from './pages/privacy-policy.jsx'
import TermsAndConditionPage from './pages/terms-and-condition.jsx'
import DashboardLayout from './pages/DashboardLayout.jsx'
import MainDashboard from './pages/MainDashboard.jsx'
import SalesDepartmentHeadLayout from './pages/SalesDepartmentHead/SalesDepartmentHeadLayout.jsx'
import SalesDepartmentHeadDashboard from './pages/SalesDepartmentHead/SalesDepartmentHeadDashboard.jsx'
import SalespersonLayout from './pages/salesperson/salespersonlayout.jsx'
import AccountsLayout from './pages/accounts/AccountsLayout.jsx'
import AccountsDashboard from './pages/accounts/accountsdashboard.jsx'
import ItLayout from './pages/it/ItLayout.jsx'
import ItDashboard from './pages/it/itdashboard.jsx'
import { getUserTypeForRole } from './constants/auth'
import NotificationPrompt from './components/NotificationPrompt'

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  
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

  const isPrivacyPolicyPage = currentPath === '/privacy-policy' || currentPath.startsWith('/privacy-policy')
  const isTermsPage =
    currentPath === '/terms-and-condition' ||
    currentPath.startsWith('/terms-and-condition') ||
    currentPath === '/terms-and-conditions' ||
    currentPath.startsWith('/terms-and-conditions')

  if (isPrivacyPolicyPage) {
    return (
      <div className="App">
        <PrivacyPolicyPage />
      </div>
    )
  }

  if (isTermsPage) {
    return (
      <div className="App">
        <TermsAndConditionPage />
      </div>
    )
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
      {shouldShowDashboard && <NotificationPrompt />}
      {shouldShowDashboard ? (
        userType === 'salesdepartmenthead' ? (
          <SalesDepartmentHeadLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
            <SalesDepartmentHeadDashboard activeView={activeView} setActiveView={setActiveView} />
          </SalesDepartmentHeadLayout>
        ) : userType === 'salesperson' || userType === 'marketing-salesperson' ? (
          <SalespersonLayout onLogout={handleLogout} />
        ) : userType === 'tele-sales' ? (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">TeleSales Layout</h1>
            <p className="text-gray-600 mt-2">This feature is under development.</p>
          </div>
        ) : userType === 'office-sales-person' ? (
          <DashboardLayout onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
            <MainDashboard activeView={activeView} setActiveView={setActiveView} />
          </DashboardLayout>
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
