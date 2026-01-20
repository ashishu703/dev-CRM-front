import React, { useState, useEffect } from 'react'
import Sidebar from './salespersonsidebar.jsx'
import DashboardContent from './salespersondashboard.jsx'
import CustomerListContent from './salespersonleads.jsx'
import StockManagement from './salespersonstock.jsx'
import ProductsPage from './salespersonproducts.jsx'
import SalespersonRfpRequests from './SalespersonRfpRequests.jsx'
import LeadStatusPage from './LeadStatus.jsx'
import ScheduledCallPage from './ScheduledCall.jsx'
import LastCallPage from './LastCall.jsx'
import DuePaymentPage from './DuePayment.jsx'
import AdvancePaymentPage from './AdvancePayment.jsx'
import ToolboxInterface from './ToolboxInterface.jsx'
import NotificationsPage from './Notifications.jsx'
import FixedHeader from '../../Header.jsx'
import AshvayChat from '../../components/AshvayChat'
import CreateQuotationForm from './salespersoncreatequotation.jsx'
import CreatePIForm from './CreatePIForm.jsx'
import quotationService from '../../api/admin_api/quotationService'
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService'
// Marketing Salesperson Pages
import GenerateLead from '../MarketingSalesperson/GenerateLead'
import Tasks from '../MarketingSalesperson/Tasks'
import FollowUps from '../MarketingSalesperson/FollowUps'
import Reimbursement from '../MarketingSalesperson/Reimbursement'
import MarketingSalespersonSidebar from '../MarketingSalesperson/MarketingSalespersonSidebar'

import { SharedDataProvider } from './SharedDataContext';

export default function SalespersonLayout({ onLogout }) {
  // Check URL parameter for page
  const urlParams = new URLSearchParams(window.location.search)
  const urlPage = urlParams.get('page')
  
  // If this is a standalone PI form page, render it full screen without layout
  if (urlPage === 'create-pi') {
    return <CreatePIForm />
  }
  
  // If this is a standalone quotation form page, render it full screen without layout
  if (urlPage === 'create-quotation') {
    const customerData = sessionStorage.getItem('quotationCustomer')
    const userData = sessionStorage.getItem('quotationUser')
    
    if (customerData && userData) {
      const customer = JSON.parse(customerData)
      const user = JSON.parse(userData)
      
      // Handle save quotation
      const handleSaveQuotation = async (quotationData) => {
        try {
          // Get master RFP ID from sessionStorage (validated RFP ID)
          const masterRfpId = sessionStorage.getItem('pricingRfpDecisionId') || null;
          
          const quotationPayload = {
            customerId: customer.id,
            customerName: customer.name,
            customerBusiness: quotationData.billTo?.business || customer.business,
            customerPhone: quotationData.billTo?.phone || customer.phone,
            customerEmail: customer.email,
            customerAddress: quotationData.billTo?.address || customer.address,
            customerGstNo: quotationData.billTo?.gstNo || customer.gstNo,
            customerState: quotationData.billTo?.state || customer.state,
            quotationDate: quotationData.quotationDate,
            validUntil: quotationData.validUpto || quotationData.validUntil,
            branch: quotationData.selectedBranch || 'ANODE',
            subtotal: quotationData.subtotal,
            taxRate: quotationData.taxRate || 18.00,
            taxAmount: quotationData.taxAmount,
            discountRate: quotationData.discountRate || 0,
            discountAmount: quotationData.discountAmount || 0,
            totalAmount: quotationData.total,
            masterRfpId: masterRfpId, // Master RFP ID for tracking
            billTo: quotationData.billTo || {
              business: customer.business,
              address: customer.address,
              phone: customer.phone,
              gstNo: customer.gstNo,
              state: customer.state
            },
            items: quotationData.items.map(item => ({
              productName: item.productName || item.description || 'Product',
              description: item.description || item.productName || 'Product',
              hsnCode: item.hsn || '85446090',
              quantity: item.quantity,
              unit: item.unit || 'Nos',
              unitPrice: item.buyerRate || item.unitPrice,
              gstRate: item.gstRate || 18.00,
              taxableAmount: item.amount,
              gstAmount: (item.amount * (item.gstRate || 18.00) / 100),
              totalAmount: item.amount * (1 + (item.gstRate || 18.00) / 100)
            }))
          }
          const response = await quotationService.createQuotation(quotationPayload)
          if (response.success) {
            // Check if there's a pending PI saved in sessionStorage for this quotation number
            const quotationNumber = response.data.quotation_number || quotationData.quotationNumber
            const pendingPIKey = `pending_pi_${quotationNumber}`
            const pendingPIData = sessionStorage.getItem(pendingPIKey)
            
            if (pendingPIData) {
              try {
                const piData = JSON.parse(pendingPIData)
                // Create PI in database now that quotation is saved
                const today = new Date().toISOString().split('T')[0]
                const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                
                const piPayload = {
                  piDate: today,
                  validUntil: validUntil,
                  status: 'pending',
                  subtotal: piData.piData?.subtotal || quotationData.subtotal,
                  taxAmount: piData.piData?.taxAmount || quotationData.taxAmount,
                  totalAmount: piData.piData?.total || quotationData.total,
                  // Always use the template key that was actually selected
                  // when the PI was prepared. Do NOT hardcode a fallback key.
                  template: piData.template
                }
                
                await proformaInvoiceService.createFromQuotation(response.data.id, piPayload)
                
                // Remove from sessionStorage after creating in database
                sessionStorage.removeItem(pendingPIKey)
                
                alert('Quotation and PI created successfully!')
              } catch (piError) {
                console.error('Error creating PI after quotation save:', piError)
                alert('Quotation saved, but failed to create PI. You can create it manually later.')
              }
            } else {
              alert('Quotation created successfully!')
            }
            
            sessionStorage.removeItem('quotationCustomer')
            sessionStorage.removeItem('quotationUser')
            // Close the tab or navigate back
            if (window.opener) {
              window.close()
            } else {
              window.location.href = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '?page=customers'
            }
          }
        } catch (error) {
          console.error('Error saving quotation:', error)
          alert('Failed to save quotation. Please try again.')
        }
      }
      
      return (
        <div className="min-h-screen w-full bg-gray-50">
          <div className="w-full max-w-7xl mx-auto p-4">
            <CreateQuotationForm
              customer={customer}
              user={user}
              onClose={() => {
                sessionStorage.removeItem('quotationCustomer')
                sessionStorage.removeItem('quotationUser')
                if (window.opener) {
                  window.close()
                } else {
                  window.location.href = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '?page=customers'
                }
              }}
              onSave={handleSaveQuotation}
              standalone={true}
            />
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-700">No customer data found.</p>
          <p className="text-sm text-gray-500 mt-2">Please go back and try again.</p>
        </div>
      </div>
    )
  }
  
  const [currentPage, setCurrentPage] = useState(urlPage || 'dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [isMarketingMode, setIsMarketingMode] = useState(false) // Toggle state for marketing mode
  
  // Check if we should show quotation form (from sessionStorage)
  useEffect(() => {
    const shouldShowQuotation = sessionStorage.getItem('openQuotationForm') === 'true'
    if (shouldShowQuotation) {
      setCurrentPage('create-quotation')
      sessionStorage.removeItem('openQuotationForm')
    }
  }, [])

  // Auto-detect mobile view based on viewport width
  useEffect(() => {
    const updateIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      // On desktop, sidebar open by default; on mobile, closed by default
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);
  const handleNavigation = (page, id) => {
    // Handle customer(s) paths: '/customers' (list) and '/customer/{id}' or '/customers/{id}' (detail)
    if (typeof page === 'string' && (page.startsWith('/customer') || page.startsWith('/customers'))) {
      const parts = page.split('/').filter(Boolean) // ['customer'|'customers', '123']
      const plural = parts[0] === 'customers'
      const cid = parts[1] || id || null
      setCurrentPage('customers')
      setSelectedCustomerId(cid)
      const url = cid ? `/${plural ? 'customers' : 'customer'}/${cid}` : `/${plural ? 'customers' : 'customer'}`
      window.history.pushState({}, '', url)
      return
    }

    if (page === 'customers' || page === 'customer') {
      const cid = id || null
      setCurrentPage('customers')
      setSelectedCustomerId(cid)
      const url = cid ? `/${page}/${cid}` : `/${page}`
      window.history.pushState({}, '', url)
      return
    }

    setSelectedCustomerId(null)
    setCurrentPage(page)
    // Update the URL without a page reload
    window.history.pushState({}, '', `/${page}`)
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleToggleView = () => {
    setIsMarketingMode(!isMarketingMode);
    // Reset to default page when toggling
    if (!isMarketingMode) {
      setCurrentPage('generate-lead');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const renderMarketingContent = () => {
    switch (currentPage) {
      case 'generate-lead':
        return <GenerateLead />;
      case 'tasks':
        return <Tasks />;
      case 'follow-ups':
        return <FollowUps />;
      case 'reimbursement':
        return <Reimbursement />;
      default:
        return <GenerateLead />;
    }
  };

  return (
    <SharedDataProvider>
      <div className={`min-h-screen relative transition-colors ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Mobile overlay */}
        {isMobileView && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Conditional Sidebar - Marketing or Salesperson */}
        {isMarketingMode ? (
          <MarketingSalespersonSidebar 
            currentPage={currentPage} 
            onNavigate={setCurrentPage}
            onLogout={onLogout}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isDarkMode={isDarkMode}
            isMobileView={isMobileView}
          />
        ) : (
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={handleNavigation} 
            onLogout={onLogout} 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            isDarkMode={isDarkMode}
            isMobileView={isMobileView}
          />
        )}
        
        <div className={`flex-1 transition-all duration-300 ${
          isMobileView 
            ? 'ml-0' 
            : sidebarOpen 
              ? 'ml-64' 
              : 'ml-16'
        }`}>
          <FixedHeader 
            userType={isMarketingMode ? "marketing-salesperson" : "salesperson"} 
            currentPage={currentPage} 
            isMobileView={isMobileView}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            onToggleView={handleToggleView}
          />
          <div className={`flex-1 transition-colors ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {isMarketingMode ? (
              // Marketing Pages
              <main className="p-4 sm:p-6 lg:p-8">
                {renderMarketingContent()}
              </main>
            ) : (
              // Salesperson Pages
              <>
                {currentPage === 'dashboard' && <DashboardContent isDarkMode={isDarkMode} />}
                {currentPage === 'customers' && <CustomerListContent isDarkMode={isDarkMode} selectedCustomerId={selectedCustomerId} />}
                {currentPage === 'stock' && <StockManagement isDarkMode={isDarkMode} />}
                {currentPage === 'rfp-requests' && <SalespersonRfpRequests isDarkMode={isDarkMode} />}
                {currentPage === 'products' && <ProductsPage isDarkMode={isDarkMode} />}
                {currentPage === 'lead-status' && <LeadStatusPage isDarkMode={isDarkMode} />}
                {currentPage === 'scheduled-call' && <ScheduledCallPage isDarkMode={isDarkMode} />}
                {currentPage === 'last-call' && <LastCallPage isDarkMode={isDarkMode} />}
                {currentPage === 'due-payment' && <DuePaymentPage isDarkMode={isDarkMode} />}
                {currentPage === 'advance-payment' && <AdvancePaymentPage isDarkMode={isDarkMode} />}
                {currentPage === 'toolbox' && <ToolboxInterface isDarkMode={isDarkMode} />}
                {currentPage === 'notifications' && <NotificationsPage isDarkMode={isDarkMode} />}
              </>
            )}
          </div>
        </div>
      </div>
      <AshvayChat showFloatingButton={false} />
    </SharedDataProvider>
  )
}


