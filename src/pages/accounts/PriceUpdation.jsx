import React, { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle, CheckCircle, Loader, Zap } from 'lucide-react';
import { io } from 'socket.io-client';

const PriceUpdation = () => {
  const [formData, setFormData] = useState({
    alu_price_per_kg: '',
    alloy_price_per_kg: ''
  });
  const [pricesData, setPricesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4500/api';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4500';

  // Ensure API_BASE_URL has /api if it doesn't
  const normalizedAPIBase = API_BASE_URL.endsWith('/api') ? API_BASE_URL : (
    API_BASE_URL.includes('/api') ? API_BASE_URL : `${API_BASE_URL}/api`
  );

  // Fetch prices function
  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${normalizedAPIBase}/aaac-calculator/prices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch prices');
      const data = await response.json();
      setPricesData(data.data);
      if (data.data) {
        setFormData({
          alu_price_per_kg: data.data.alu_price_per_kg || '',
          alloy_price_per_kg: data.data.alloy_price_per_kg || ''
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch prices on mount
  useEffect(() => {
    fetchPrices();
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setSocketConnected(false);
    });

    // Listen for real-time price updates from other accounts users
    socket.on('aaac:prices:updated', (data) => {
      console.log('📡 Real-time price update received:', data);
      // Refetch prices when they change
      fetchPrices();
      setLastSyncedTime(new Date().toLocaleTimeString());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.alu_price_per_kg || !formData.alloy_price_per_kg) {
      setErrorMessage('Both prices are required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const alu = parseFloat(formData.alu_price_per_kg);
    const alloy = parseFloat(formData.alloy_price_per_kg);

    if (isNaN(alu) || isNaN(alloy) || alu <= 0 || alloy <= 0) {
      setErrorMessage('Prices must be valid positive numbers');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${normalizedAPIBase}/aaac-calculator/prices`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update prices');
      }

      setSuccessMessage('Prices updated successfully! ✓ Syncing to Sales Department...');
      setLastSyncedTime(new Date().toLocaleTimeString());
      await fetchPrices();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update prices');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (pricesData) {
      setFormData({
        alu_price_per_kg: pricesData.alu_price_per_kg || '',
        alloy_price_per_kg: pricesData.alloy_price_per_kg || ''
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-slate-600">Loading prices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-800">Failed to load prices. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Update Product Prices</h1>
              <p className="text-slate-600 text-sm">Manage pricing for all products in the sales calculator</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${socketConnected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs font-semibold">{socketConnected ? 'Live Sync' : 'Offline'}</span>
          </div>
        </div>
        {lastSyncedTime && <p className="text-xs text-slate-500 mt-3">Last synced: {lastSyncedTime}</p>}
      </div>

      <div className="px-6 pb-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{errorMessage}</span>
          </div>
        )}

        {/* Price Table */}
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Price (₹/kg)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Current</th>
              </tr>
            </thead>
            <tbody>
              {/* Aluminum Row */}
              <tr className="border-b border-slate-200 hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">Al</div>
                    <span className="font-medium text-slate-900">Aluminum</span>
                  </div>
                </td>
                <td className="px-4 py-3 w-40">
                  <input
                    type="number"
                    name="alu_price_per_kg"
                    value={formData.alu_price_per_kg}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3 text-slate-600 font-semibold text-sm">
                  ₹{parseFloat(formData.alu_price_per_kg || 0).toFixed(2)}/kg
                </td>
              </tr>

              {/* Alloy Row */}
              <tr className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">Ay</div>
                    <span className="font-medium text-slate-900">Alloy</span>
                  </div>
                </td>
                <td className="px-4 py-3 w-40">
                  <input
                    type="number"
                    name="alloy_price_per_kg"
                    value={formData.alloy_price_per_kg}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3 text-slate-600 font-semibold text-sm">
                  ₹{parseFloat(formData.alloy_price_per_kg || 0).toFixed(2)}/kg
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Prices
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            How it works
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Update prices for any product (Aluminum, Alloy, etc.)</li>
            <li>Prices instantly sync to Sales Department calculator</li>
            <li>All calculations update automatically with new prices</li>
            <li>Live sync indicator shows real-time connection status</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PriceUpdation;
