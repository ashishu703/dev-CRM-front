import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the shared context
const SharedDataContext = createContext();

// Provider component
export const SharedDataProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load customers data (now empty by default; actual pages fetch from API)
  useEffect(() => {
    setCustomers([]);
    setLoading(false);
  }, []);

  // Filter customers by connection status for follow-up components
  const getCustomersByStatus = (status) => {
    console.log(`SharedDataContext - getCustomersByStatus('${status}') called with ${customers.length} customers`);
    const result = customers.filter(customer => {
      switch (status) {
        case 'connected':
          return customer.connectedStatus === 'Connected';
        case 'not-connected':
          return customer.connectedStatus === 'Not Connected';
        case 'next-meeting':
          return customer.finalStatus === 'next scheduled meeting';
        case 'closed':
          return customer.finalStatus === 'closed';
        default:
          return false;
      }
    });
    console.log(`SharedDataContext - getCustomersByStatus('${status}') returning ${result.length} customers`);
    return result;
  };

  // Get status counts for debugging
  const getStatusCounts = () => {
    const counts = {
      total: customers.length,
      connected: customers.filter(customer => customer.connectedStatus === 'Connected').length,
      notConnected: customers.filter(customer => customer.connectedStatus === 'Not Connected').length,
      followUp: customers.filter(customer => customer.connectedStatus === 'Follow Up').length,
      nextMeeting: customers.filter(customer => customer.finalStatus === 'next scheduled meeting').length,
      closed: customers.filter(customer => customer.finalStatus === 'closed').length
    };
    console.log('Shared Data Status Counts:', counts);
    return counts;
  };

  // Update customer data (for leads interface)
  const updateCustomer = (customerId, updatedData) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => 
        customer.id === customerId 
          ? { ...customer, ...updatedData }
          : customer
      )
    );
  };

  // Add new customer (for leads interface)
  const addCustomer = (newCustomer) => {
    const customerWithId = {
      ...newCustomer,
      id: Math.max(...customers.map(c => c.id)) + 1
    };
    setCustomers(prevCustomers => [...prevCustomers, customerWithId]);
  };

  // Delete customer (for leads interface)
  const deleteCustomer = (customerId) => {
    setCustomers(prevCustomers => 
      prevCustomers.filter(customer => customer.id !== customerId)
    );
  };

  const value = {
    customers,
    loading,
    setCustomers,
    getCustomersByStatus,
    getStatusCounts,
    updateCustomer,
    addCustomer,
    deleteCustomer
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
};

// Custom hook to use the context
export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  return context;
};

export default SharedDataContext;
