import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Users, X, TrendingUp, Calendar, CheckCircle, MapPin, Award, Package, DollarSign, Moon, Sun, BarChart3, Clock, User, Factory, Wrench, HelpCircle, Activity, Server, Settings, Shield, Link, CheckCheck, Circle, FileText, Menu, ToggleRight, CheckSquare, Calculator, CreditCard, MessageCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import ProfileUpdateModal from './components/ProfileUpdateModal';

const FixedHeader = ({ userType = "superadmin", currentPage = "dashboard", isMobileView = false, isDarkMode = false, onToggleDarkMode, onProfileClick, onToggleSidebar, sidebarOpen, onToggleView, onChatClick }) => {
  const { user, refreshUser } = useAuth();
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    notificationRetentionDays,
    bellMaxItems
  } = useNotifications();
  const chatUnreadCount = useSelector((state) => state.chat?.unreadCount ?? 0);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileAnchorRect, setProfileAnchorRect] = useState(null);
  const profileButtonRef = useRef(null);
  
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type, { muted = false } = {}) => {
    const active = muted
      ? `w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`
      : 'w-3 h-3 text-white';
    const iconMap = {
      lead_assigned: <Users className={active} />,
      lead_transferred: <Users className={active} />,
      lead_activity: <Activity className={active} />,
      payment_activity: <DollarSign className={active} />,
      quotation_activity: <FileText className={active} />,
      meeting_activity: <Calendar className={active} />,
      followup_activity: <Clock className={active} />,
      activity: <Activity className={active} />
    };
    return iconMap[type] || <Bell className={active} />;
  };

  // Format time for display (handles timezone correctly)
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    // Parse timestamp - handles both ISO strings and Date objects
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Get current time in UTC for accurate comparison
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle negative differences (future dates)
    if (diffMs < 0) {
      return 'Just now';
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older dates, show formatted date in local timezone
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Page-specific header content
  const getPageHeaderContent = () => {
    switch (currentPage) {
      // Salesperson pages
      case 'customers':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Leads",
          subtitle: "Manage and track your sales leads"
        };
      case 'dashboard':
        return {
          icon: <TrendingUp className="w-6 h-6 text-white" />,
          title: "Dashboard",
          subtitle: "Monitor sales and metrics"
        };
      case 'profile':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Profile & Attendance",
          subtitle: "Manage your profile information and track attendance"
        };
      case 'stock':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Available Stock",
          subtitle: "Manage inventory and stock levels"
        };
      case 'products':
        return {
          icon: <Package className="w-5 h-5 text-white" />,
          title: "Products",
          subtitle: "Browse and manage products"
        };
      case 'payment-tracking':
        return {
          icon: <CreditCard className="w-5 h-5 text-white" />,
          title: "Payment Tracking",
          subtitle: "Active orders, pending payment, statement"
        };
      case 'chat':
        return {
          icon: <MessageCircle className="w-5 h-5 text-white" />,
          title: "Chat",
          subtitle: "Internal chat, team chat & emails — tag teammates, share images & documents"
        };
        case 'scheduled-call':
          return {
            icon: <Calendar className="w-6 h-6 text-white" />,
            title: "Scheduled Calls",
            subtitle: "Manage and track scheduled call appointments"
          };
        case 'last-call':
          return {
            icon: <Clock className="w-6 h-6 text-white" />,
            title: "Last Call Activity",
            subtitle: "Track recent call activities and follow-ups"
          };
      
      // Follow-up pages with specific titles
      case 'followup-connected':
        return {
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          title: "Connected Follow-ups",
          subtitle: "Manage successfully connected customer follow-ups"
        };
      case 'followup-not-connected':
        return {
          icon: <X className="w-6 h-6 text-white" />,
          title: "Not Connected Follow-ups",
          subtitle: "Follow-ups that could not be connected"
        };
      case 'followup-pending':
        return {
          icon: <Calendar className="w-6 h-6 text-white" />,
          title: "Pending Follow-ups",
          subtitle: "Follow-ups awaiting response"
        };
      case 'followup-next-meeting':
        return {
          icon: <Calendar className="w-6 h-6 text-white" />,
          title: "Today's Meeting Follow-ups",
          subtitle: "Schedule and manage upcoming meetings"
        };
      case 'followup-converted':
        return {
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          title: "Converted Follow-ups",
          subtitle: "View and manage converted leads"
        };
      case 'followup-closed':
        return {
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          title: "Closed Follow-ups",
          subtitle: "Completed and closed follow-up activities"
        };
      
      // SuperAdmin pages
      case 'customer-list':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Customer List",
          subtitle: "View and manage all customers"
        };
      case 'department':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Department Management",
          subtitle: "Manage departments and organizational structure"
        };
      case 'leads':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "",
          subtitle: ""
        };
      case 'all-leads':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "All Leads",
          subtitle: "Comprehensive view of all leads across departments"
        };
      case 'configuration':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Configuration",
          subtitle: "System settings and configuration options"
        };
      case 'performance':
        return {
          icon: <Award className="w-6 h-6 text-white" />,
          title: "Payment Info",
          subtitle: "View payment details from all companies and department heads"
        };
      case 'today-visit':
        return {
          icon: <Calendar className="w-6 h-6 text-white" />,
          title: "Today's Visits",
          subtitle: "Schedule and track today's customer visits"
        };
      
      // TeleSales pages
      case 'tele-sales':
        return {
          icon: <Phone className="w-6 h-6 text-white" />,
          title: "Tele Sales Dashboard",
          subtitle: "Manage tele sales activities and leads"
        };
      
      // Office Sales Person pages
      case 'office-sales-person':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Office Sales Dashboard",
          subtitle: "Manage office sales activities"
        };
      
      // Marketing Salesperson pages
      case 'generate-lead':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Generate Lead",
          subtitle: "Create and manage new leads"
        };
      case 'tasks':
        return {
          icon: <CheckSquare className="w-6 h-6 text-white" />,
          title: "Tasks",
          subtitle: "Manage assigned and completed tasks"
        };
      case 'follow-ups':
        return {
          icon: <MapPin className="w-6 h-6 text-white" />,
          title: "Follow-ups",
          subtitle: "Record customer follow-ups with location and photo"
        };
      case 'reimbursement':
        return {
          icon: <DollarSign className="w-6 h-6 text-white" />,
          title: "Reimbursement",
          subtitle: "Track and submit daily expenses"
        };
      
      // Sales Department Head pages
      case 'sales-dashboard':
        return {
          icon: <TrendingUp className="w-6 h-6 text-white" />,
          title: "Dashboard",
          subtitle: "Sales department overview"
        };
      case 'payment-info':
        return {
          icon: <DollarSign className="w-6 h-6 text-white" />,
          title: "Payment Info",
          subtitle: "Manage payment information and transactions"
        };
      case 'sales-department-users':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Department Users",
          subtitle: "Manage sales department users and permissions"
        };
      case 'stock-update':
        return {
          icon: <Package className="w-6 h-6 text-white" />,
          title: "Stock Update",
          subtitle: "Update and manage inventory stock levels"
        };
      case 'calculator':
        return {
          icon: <Calculator className="w-6 h-6 text-white" />,
          title: "Product Calculator",
          subtitle: "Calculate pricing and specifications for products"
        };
      
      // Accounts Department pages
      
      // Production Department Head pages
      case 'production-dashboard':
        return {
          icon: <Factory className="w-6 h-6 text-white" />,
          title: "Production Dashboard",
          subtitle: ""
        };
      case 'ppc':
        return {
          icon: <Calendar className="w-6 h-6 text-white" />,
          title: "PPC",
          subtitle: "Production Planning & Control"
        };
      case 'qc':
        return {
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          title: "QC",
          subtitle: "Quality Control"
        };
      case 'inventory-management':
        return {
          icon: <Package className="w-6 h-6 text-white" />,
          title: "Inventory",
          subtitle: "Inventory Management"
        };
      case 'maintenance-management':
        return {
          icon: <Wrench className="w-6 h-6 text-white" />,
          title: "Maintenance",
          subtitle: "Maintenance Management"
        };
      case 'reports-management':
        return {
          icon: <BarChart3 className="w-6 h-6 text-white" />,
          title: "Reports",
          subtitle: "Reports & Analytics"
        };
      case 'dispatch':
        return {
          icon: <Package className="w-6 h-6 text-white" />,
          title: "Dispatch",
          subtitle: "Stock Management"
        };
      case 'supervisor':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Supervisor",
          subtitle: "Task Assignment"
        };
      case 'store':
        return {
          icon: <Package className="w-6 h-6 text-white" />,
          title: "Store",
          subtitle: "Store Management"
        };
      case 'production-planning':
      case 'production-schedule':
      case 'design-cost':
      case 'work-orders':
      case 'capacity-planning':
      case 'backload-planning':
        return {
          icon: <Calendar className="w-6 h-6 text-white" />,
          title: "Production Planning",
          subtitle: ""
        };
      case 'quality-control':
      case 'inspection-lots':
      case 'quality-metrics':
      case 'non-conformance':
        return {
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          title: "Quality Control",
          subtitle: ""
        };
      case 'production-execution':
      case 'execution-console':
      case 'machine-status':
      case 'operator-performance':
        return {
          icon: <Factory className="w-6 h-6 text-white" />,
          title: "Production Execution",
          subtitle: ""
        };
      case 'maintenance':
      case 'maintenance-orders':
      case 'preventive-maintenance':
      case 'equipment-status':
        return {
          icon: <Wrench className="w-6 h-6 text-white" />,
          title: "Maintenance",
          subtitle: ""
        };
      case 'inventory':
      case 'raw-materials':
      case 'finished-goods':
      case 'stock-alerts':
        return {
          icon: <Package className="w-6 h-6 text-white" />,
          title: "Inventory",
          subtitle: ""
        };
      case 'production-users':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Production Staff",
          subtitle: ""
        };
      case 'reports':
      case 'production-reports':
      case 'efficiency-metrics':
      case 'cost-analysis':
        return {
          icon: <BarChart3 className="w-6 h-6 text-white" />,
          title: "Reports & Analytics",
          subtitle: ""
        };

      // IT Department pages
      case 'it-dashboard':
        return {
          icon: <Activity className="w-6 h-6 text-white" />,
          title: "IT Operations Command Center",
          subtitle: "Monitor uptime, incidents, and change windows"
        };
      case 'it-systems':
        return {
          icon: <Server className="w-6 h-6 text-white" />,
          title: "System Health & Monitoring",
          subtitle: "Real-time system status and performance metrics"
        };
      case 'it-tickets':
        return {
          icon: <Bell className="w-6 h-6 text-white" />,
          title: "Ticket Management",
          subtitle: "Track, assign, and resolve IT issues"
        };
      case 'it-users':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "User & Access Management",
          subtitle: "Create, manage, and control user access and permissions"
        };
      case 'it-maintenance':
        return {
          icon: <Settings className="w-6 h-6 text-white" />,
          title: "System Maintenance Tools",
          subtitle: "Maintain and manage CRM system operations"
        };
      case 'it-assets':
        return {
          icon: <Package className="w-6 h-6 text-white" />,
          title: "Asset Management",
          subtitle: "Track company hardware and software assets"
        };
      case 'it-security':
        return {
          icon: <Shield className="w-6 h-6 text-white" />,
          title: "Security & Audit Logs",
          subtitle: "Monitor security events and system activity"
        };
      case 'it-integrations':
        return {
          icon: <Link className="w-6 h-6 text-white" />,
          title: "Software & Integration Status",
          subtitle: "Monitor 3rd-party tool integrations and API health"
        };
      case 'it-reports':
        return {
          icon: <BarChart3 className="w-6 h-6 text-white" />,
          title: "Reports & Analytics",
          subtitle: "Technical performance insights and metrics"
        };
      case 'it-notifications':
        return {
          icon: <Bell className="w-6 h-6 text-white" />,
          title: "Notifications & Alerts",
          subtitle: "Real-time alerts and notifications for IT team"
        };
      case 'create-organisation':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          title: "Create Organisation",
          subtitle: "Set up your organization profile and details"
        };
      case 'rfp-workflow':
        return {
          icon: <FileText className="w-5 h-5 text-white" />,
          title: "RFP Workflow",
          subtitle: "Manage RFP requests and workflow"
        };
      case 'toolbox':
        return {
          icon: <Wrench className="w-5 h-5 text-white" />,
          title: "Toolbox Interface",
          subtitle: "Tools and utilities"
        };
      
      default:
        return {
          icon: <TrendingUp className="w-6 h-6 text-white" />,
          title: "Dashboard",
          subtitle: "Monitor performance and metrics"
        };
    }
  };

  const pageContent = getPageHeaderContent();
  const isSalesHeadTheme = userType === 'salesdepartmenthead' || userType === 'salesperson';
  const isSalespersonLight = false;
  const isSuperAdmin = userType === 'superadmin';
  const headerIsDark = isDarkMode || isSuperAdmin || (isSalesHeadTheme && !isSalespersonLight);
  const showToggleViewButton = onToggleView && userType !== 'salesperson';
  const showDarkModeButton = onToggleDarkMode && userType !== 'salesperson';
  const showChatButton = typeof onChatClick === 'function' && !isSuperAdmin;

  const isSalesperson = userType === 'salesperson';
  const headerStyle = isSalesperson
    ? { background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 45%, #0c1222 100%)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)', borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }
    : isSalespersonLight
      ? { background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)' }
      : headerIsDark
        ? { background: 'linear-gradient(90deg, #1f2a44 0%, #141b2f 60%, #0b1020 100%)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)' }
        : undefined;

  return (
    <header className={`sticky top-0 z-[30] border-b shadow-sm transition-all duration-300 backdrop-blur-md ${
      (headerIsDark || isSalesperson) ? 'border-slate-700/50' : 'border-slate-200'
    }`} style={headerStyle ?? (headerIsDark ? {
      background: 'linear-gradient(90deg, #1f2a44 0%, #141b2f 60%, #0b1020 100%)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
    } : {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    })}>
      <div 
        className={`flex items-center justify-between flex-wrap gap-2 sm:gap-3 ${!isSalesHeadTheme ? 'px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3' : ''}`}
        style={isSalesHeadTheme ? { padding: '14px 24px' } : undefined}
      >
        {/* Left Section - Dynamic Page Header */}
        <div className={`flex items-center min-w-0 flex-1 ${!isSalesHeadTheme ? 'space-x-2 sm:space-x-3' : ''}`} style={isSalesHeadTheme ? { gap: '12px' } : undefined}>
          {/* Hamburger Menu for Mobile and when sidebar is closed */}
          {onToggleSidebar && (isMobileView || userType === 'salesdepartmenthead' || userType === 'superadmin' || !sidebarOpen) && (
            <button
              onClick={onToggleSidebar}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                (headerIsDark || isSalesperson)
                  ? 'hover:bg-slate-700 text-slate-200'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md flex-shrink-0" style={isSalespersonLight ? { boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)' } : { boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)' }}>
            <div className={`text-xs sm:text-sm ${isSalespersonLight ? 'text-white' : 'text-white'}`}>
              {pageContent.icon}
            </div>
          </div>
          {(pageContent.title || pageContent.subtitle) && (
            <div 
              className="min-w-0 flex flex-col justify-center"
              style={isSalesHeadTheme && !isSalespersonLight ? { borderLeft: '3px solid #6366F1', paddingLeft: 14 } : isSalespersonLight ? { borderLeft: '3px solid #64748b', paddingLeft: 14 } : undefined}
            >
              <h1 
                className={`truncate ${!isSalesHeadTheme ? (headerIsDark ? 'text-white' : 'text-gray-900') + ' text-sm sm:text-base lg:text-lg font-bold' : ''}`}
                style={isSalespersonLight ? { fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '0.3px', color: '#0f172a', margin: 0 } : isSalesHeadTheme ? { fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '0.3px', color: '#F8FAFC', margin: 0 } : { fontFamily: 'Poppins, sans-serif' }}
              >
                {pageContent.title}
              </h1>
              {pageContent.subtitle && (
                <p 
                  className={`truncate hidden sm:block ${!isSalesHeadTheme ? (headerIsDark ? 'text-slate-300' : 'text-gray-600') + ' text-[10px] sm:text-xs mt-0 sm:mt-0.5' : ''}`}
                  style={isSalespersonLight ? { fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 400, color: '#64748b', margin: '1px 0 0' } : isSalesHeadTheme ? { fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 400, color: '#94A3B8', margin: '1px 0 0' } : { fontFamily: 'Inter, sans-serif' }}
                >
                  {pageContent.subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
          {showToggleViewButton && (
            <button
              onClick={onToggleView}
              className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 shadow-md ${
                isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
              }`}
              title={userType === "marketing-salesperson" ? "Toggle Marketing/Sales View" : "Toggle View"}
            >
              <ToggleRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          {showDarkModeButton && (
            <button
              onClick={onToggleDarkMode}
              className={`p-1 sm:p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                headerIsDark ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}
          {showChatButton && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={onChatClick}
                className={`relative p-1 sm:p-1.5 rounded-lg transition-colors ${
                  (headerIsDark || isSalesperson) ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
                title="Chat"
              >
                <MessageCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${(headerIsDark || isSalesperson) ? 'text-slate-200' : 'text-slate-600'}`} />
                {chatUnreadCount > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] sm:min-w-[16px] sm:h-[16px] px-0.5 bg-red-600 text-white text-[8px] sm:text-[9px] leading-[14px] sm:leading-[16px] rounded-full text-center">
                    {Math.min(99, chatUnreadCount)}
                  </div>
                )}
              </button>
            </div>
          )}
          <div className="relative flex-shrink-0" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-1 sm:p-1.5 rounded-lg transition-colors ${
                (headerIsDark || isSalesperson)
                  ? 'hover:bg-slate-700'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${(headerIsDark || isSalesperson) ? 'text-slate-200' : 'text-slate-600'}`} />
              {unreadCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] sm:min-w-[16px] sm:h-[16px] px-0.5 bg-red-600 text-white text-[8px] sm:text-[9px] leading-[14px] sm:leading-[16px] rounded-full text-center">
                  {Math.min(99, unreadCount)}
                </div>
              )}
              {isConnected && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full border border-white shadow-sm"
                  title="Real-time updates on"
                />
              )}
            </button>

            {showNotifications && (
              <>
                {/* Backdrop for mobile */}
                <div 
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] sm:hidden"
                  onClick={() => setShowNotifications(false)}
                />
                <div className={`fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-[400px] max-w-lg rounded-xl shadow-2xl border z-[1000] max-h-[min(70vh,520px)] sm:max-h-[480px] overflow-hidden flex flex-col ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-700' 
                    : 'bg-white border-slate-200/80'
                }`} style={{
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06)'
                }}>
                <div className={`px-4 py-3 flex items-start justify-between gap-3 flex-shrink-0 border-b ${
                  isDarkMode ? 'border-zinc-800 bg-zinc-900/95' : 'border-slate-100 bg-slate-50/80'
                }`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                        Notifications
                      </h3>
                      {isConnected && (
                        <span
                          className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            isDarkMode ? 'bg-emerald-950/50 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                          }`}
                          title="Connected for instant updates"
                        >
                          Live
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                      Showing recent {bellMaxItems} · older than {notificationRetentionDays} days are removed automatically
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllAsRead()}
                        className={`text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-sky-400 hover:bg-zinc-800'
                            : 'text-sky-700 hover:bg-sky-50'
                        }`}
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                        <Bell className={`w-6 h-6 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>You&apos;re all caught up</p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>New activity will appear here</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`relative pl-3 pr-3 py-3 border-b transition-colors ${
                          isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/60' : 'border-slate-100 hover:bg-slate-50'
                        } ${notification.unread ? (isDarkMode ? 'bg-sky-950/20' : 'bg-sky-50/40') : ''} flex-shrink-0`}
                      >
                        {notification.unread && (
                          <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${isDarkMode ? 'bg-sky-500' : 'bg-sky-600'}`} aria-hidden />
                        )}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              notification.unread
                                ? (isDarkMode ? 'bg-sky-600/90 shadow-sm shadow-sky-900/30' : 'bg-sky-600 text-white shadow-sm')
                                : (isDarkMode ? 'bg-zinc-800' : 'bg-slate-100')
                            }`}>
                              {getNotificationIcon(notification.type, { muted: !notification.unread })}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden pt-0.5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className={`text-[13px] font-semibold leading-snug min-w-0 ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                                {notification.title}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notification.unread) markAsRead(notification.id);
                                  else markAsUnread(notification.id);
                                }}
                                className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                                  isDarkMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-slate-200/80 text-slate-500'
                                }`}
                                title={notification.unread ? 'Mark as read' : 'Mark as unread'}
                              >
                                {notification.unread ? <Circle className="w-3 h-3 text-sky-500 fill-sky-500" /> : <CheckCheck className="w-3 h-3 text-slate-400" />}
                              </button>
                            </div>
                            <p className={`text-xs leading-relaxed break-words line-clamp-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                              {notification.message}
                            </p>
                            {notification.details && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedNotificationId(expandedNotificationId === notification.id ? null : notification.id)}
                                  className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                                    isDarkMode
                                      ? 'bg-zinc-800 text-sky-400 hover:bg-zinc-700'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  {expandedNotificationId === notification.id ? 'Hide details' : 'View details'}
                                </button>
                                {expandedNotificationId === notification.id && (
                                  <div className={`mt-2 text-[11px] space-y-1 break-words p-3 rounded-lg ${isDarkMode ? 'bg-zinc-950/50 text-zinc-400 border border-zinc-800' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                    {notification.details.customer && <div><span className="font-semibold text-slate-500">Customer</span> · {notification.details.customer}</div>}
                                    {notification.details.business && <div><span className="font-semibold text-slate-500">Business</span> · {notification.details.business}</div>}
                                    {notification.details.phone && <div><span className="font-semibold text-slate-500">Phone</span> · {notification.details.phone}</div>}
                                    {notification.details.amount && <div><span className="font-semibold text-slate-500">Amount</span> · ₹{Number(notification.details.amount).toLocaleString()}</div>}
                                  </div>
                                )}
                              </div>
                            )}
                            <p className={`text-[11px] mt-2 flex items-center gap-1 tabular-nums ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              {formatTime(notification.time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className={`px-4 py-2.5 flex-shrink-0 border-t text-[11px] ${isDarkMode ? 'border-zinc-800 text-zinc-500 bg-zinc-900/80' : 'border-slate-100 text-slate-500 bg-slate-50/50'}`}>
                  Unread count reflects only this recent list.
                </div>
              </div>
              </>
            )}
          </div>

          <button
            onClick={() => window.location.href = '/support'}
            className={`p-1 sm:p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              (headerIsDark || isSalesperson) ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
            title="Support & Help"
          >
            <HelpCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${(headerIsDark || isSalesperson) ? 'text-slate-200' : 'text-slate-600'}`} />
          </button>

          <button
            ref={profileButtonRef}
            onClick={() => {
              setProfileAnchorRect(profileButtonRef.current?.getBoundingClientRect() ?? null);
              setShowProfileModal(true);
            }}
            className={`flex items-center space-x-1.5 rounded-lg px-1.5 py-1 transition-colors cursor-pointer flex-shrink-0 ${(headerIsDark || isSalesperson) ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow ${isSalespersonLight ? 'bg-slate-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
              {user?.profile_picture || user?.profilePicture ? (
                <img 
                  src={user.profile_picture || user.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-[10px] sm:text-xs">
                  {user?.username ? user.username.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
                </span>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <p className={`text-[11px] font-medium truncate max-w-[90px] ${(headerIsDark || isSalesperson) ? 'text-white' : 'text-slate-900'}`}>
                {user?.email ? `${user.email.split('@')[0]}@${user.email.split('@')[1]?.substring(0, 2) || ''}...` : 'user'}
              </p>
              <p className={`text-[9px] truncate ${(headerIsDark || isSalesperson) ? 'text-slate-400' : 'text-slate-500'}`}>
                {user?.role ? user.role.toUpperCase().replace('_', ' ') : userType.toUpperCase()}
              </p>
            </div>
          </button>
        </div>
      </div>

      <ProfileUpdateModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        anchorRect={profileAnchorRect}
        user={user}
        onUpdate={async (updatedUser) => {
          if (updatedUser) {
            // Refresh user data from the API to get the latest profile picture
            await refreshUser();
          }
        }}
      />
    </header>
  );
};

export default FixedHeader;
