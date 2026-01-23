"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Package, Search, CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import apiClient from "../../utils/apiClient"
import { API_ENDPOINTS } from "../../api/admin_api/api"
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton"

// Helper function to get side view image for each product
const getSideViewImage = (productName) => {
  const sideViewMapping = {
    "Aerial Bunch Cable": "/images/products/aerial bunch cable.jpeg",
    "Aluminium Conductor Galvanized Steel Reinforced": "/images/products/Aluminum Conductor Galvanised Steel Reinforced.jpg",
    "All Aluminium Alloy Conductor": "/images/products/all aluminium alloy conductor.jpeg",
    "PVC Insulated Submersible Cable": "/images/products/pvc insulated submersible cable.jpeg",
    "Multi Core XLPE Insulated Aluminium Unarmoured Cable": "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg",
    "Paper Cover Aluminium Conductor": "/images/products/paper covered aluminium conductor.jpeg",
    "Single Core PVC Insulated Aluminium/Copper Armoured/Unarmoured Cable": "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg",
    "Single Core XLPE Insulated Aluminium/Copper Armoured/Unarmoured Cable": "/images/products/single core pvc insulated aluminium copper armoured_unarmoured cable.jpeg",
    "Multi Core PVC Insulated Aluminium Armoured Cable": "/images/products/multi core pvc isulated aluminium armoured cable.jpeg",
    "Multi Core XLPE Insulated Aluminium Armoured Cable": "/images/products/multi core xlpe insulated aluminium armoured cable.jpeg",
    "Multi Core PVC Insulated Aluminium Unarmoured Cable": "/images/products/multi core pvc insulated aluminium unarmoured cable.jpeg",
    "Multistrand Single Core Copper Cable": "/images/products/multistrand single core copper cable.jpeg",
    "Multi Core Copper Cable": "/images/products/multi core copper cable.jpeg",
    "PVC Insulated Single Core Aluminium Cable": "/images/products/pvc insulated single core aluminium cables.jpeg",
    "PVC Insulated Multicore Aluminium Cable": "/images/products/pvc insulated multicore aluminium cable.jpeg",
    "Submersible Winding Wire": "/images/products/submersible winding wire.jpeg",
    "Twin Twisted Copper Wire": "/images/products/twin twisted copper wire.jpeg",
    "Speaker Cable": "/images/products/speaker cable.jpeg",
    "CCTV Cable": "/images/products/cctv cable.jpeg",
    "LAN Cable": "/images/products/LAN Cable.jpg",
    "Automobile Cable": "/images/products/automobile wire.jpeg",
    "PV Solar Cable": "/images/products/pv solar cable.jpeg",
    "Co Axial Cable": "/images/products/co axial cable.jpeg",
    "Uni-tube Unarmoured Optical Fibre Cable": "/images/products/unitube unarmoured optical fibre cable.jpeg",
    "Armoured Unarmoured PVC Insulated Copper Control Cable": "/images/products/armoured unarmoured pvc insulated copper control cable.jpeg",
    "Telecom Switch Board Cables": "/images/products/telecom switch board cables.jpeg"
  };
  return sideViewMapping[productName] || "/images/products/aerial bunch cable.jpeg";
};

export default function StockManagement({ isDarkMode = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tallyConnected, setTallyConnected] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Load stock data and check Tally connection
  useEffect(() => {
    loadStockData();
    checkTallyConnection();
  }, []);

  const isFinishedGoodsGroup = (groupName) =>
    String(groupName || '').trim().toLowerCase() === 'finished goods';

  const loadStockData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.STOCK_GET_ALL());
      
      if (response.success && response.data) {
        // Set flat products list with proper structure
        const productsFromDB = response.data
          .filter(stockData => stockData && stockData.product_name) // Filter out null/undefined
          .filter(stockData => isFinishedGoodsGroup(stockData.group)) // ONLY Finished Goods
          .map(stockData => ({
            name: stockData.product_name,
            product_name: stockData.product_name, // Keep for compatibility
            description: 'Cable product',
            sideViewImage: getSideViewImage(stockData.product_name),
            availability: {
              status: String(stockData.status || 'out_of_stock').toLowerCase(),
              quantity: stockData.quantity || 0,
              unit: stockData.unit || 'meters',
              rate: parseFloat(stockData.rate) || 0,
              value: parseFloat(stockData.value) || 0
            },
            group: stockData.group || '',
            subgroup: stockData.subgroup || ''
          }));
        
        setProducts(productsFromDB);
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const checkTallyConnection = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STOCK_TALLY_STATUS());
      setTallyConnected(response.connected || false);
    } catch (error) {
      console.error('Error checking Tally connection:', error);
      setTallyConnected(false);
    }
  };

  const syncWithTally = async () => {
    try {
      setSyncing(true);
      setSyncMessage('Syncing with Tally...');
      
      const response = await apiClient.post(API_ENDPOINTS.STOCK_TALLY_SYNC());
      
      if (response.success) {
        setSyncMessage(response.message || 'Stock synced successfully!');
        await loadStockData();
        await checkTallyConnection();
        setTimeout(() => setSyncMessage(''), 3000);
      } else {
        setSyncMessage(response.message || 'Sync failed');
        setTimeout(() => setSyncMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error syncing with Tally:', error);
      setSyncMessage(error.message || 'Failed to sync with Tally');
      setTimeout(() => setSyncMessage(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  // Filter flat products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(product => String(product?.availability?.status || '').toLowerCase() === selectedFilter);
    }
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [searchTerm, selectedFilter, products]);

  // Count products by status
  const statusCounts = useMemo(() => {
    return {
      available: products.filter(p => String(p?.availability?.status || '').toLowerCase() === 'available').length,
      limited: products.filter(p => String(p?.availability?.status || '').toLowerCase() === 'limited').length,
      out_of_stock: products.filter(p => String(p?.availability?.status || 'out_of_stock').toLowerCase() === 'out_of_stock').length
    };
  }, [products]);

  const getAvailabilityBadge = (availability) => {
    // Handle null/undefined availability
    if (!availability) {
      return {
        Icon: AlertCircle,
        text: 'Unknown',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        iconColor: 'text-gray-600'
      };
    }

    const status = String(availability.status || 'out_of_stock').toLowerCase();
    switch (status) {
      case 'available':
        return {
          Icon: CheckCircle,
          text: 'Available',
          className: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600'
        };
      case 'limited':
        return {
          Icon: AlertCircle,
          text: 'Limited',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'out_of_stock':
        return {
          Icon: XCircle,
          text: 'Out of Stock',
          className: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600'
        };
      default:
        return {
          Icon: AlertCircle,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={`min-h-screen p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} pb-24 sm:pb-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Tally Connection Status and Sync Button */}
        <div className={`mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-4`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {tallyConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  Tally: {tallyConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {syncMessage && (
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {syncMessage}
                </span>
              )}
            </div>
            <button
              onClick={syncWithTally}
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                syncing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : tallyConnected
                    ? isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync with Tally'}
            </button>
          </div>
        </div>

        {/* Search Bar and View Toggle */}
        <div className={`mb-4 sm:mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-4`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
              />
            </div>
          </div>
        </div>

        {/* Three Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'available' ? 'all' : 'available')}
            className={`rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
              selectedFilter === 'available'
                ? isDarkMode ? 'bg-blue-900 border-blue-700 ring-2 ring-blue-500' : 'bg-blue-50 border-blue-300 ring-2 ring-blue-500'
                : isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-base sm:text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Availables</h3>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{statusCounts.available}</p>
              </div>
              <CheckCircle className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>

          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'limited' ? 'all' : 'limited')}
            className={`rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
              selectedFilter === 'limited'
                ? isDarkMode ? 'bg-yellow-900 border-yellow-700 ring-2 ring-yellow-500' : 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-500'
                : isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-base sm:text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Limiteds</h3>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{statusCounts.limited}</p>
              </div>
              <AlertCircle className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>

          <div 
            onClick={() => setSelectedFilter(selectedFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
            className={`rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
              selectedFilter === 'out_of_stock'
                ? isDarkMode ? 'bg-red-900 border-red-700 ring-2 ring-red-500' : 'bg-red-50 border-red-300 ring-2 ring-red-500'
                : isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-base sm:text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Out of Stocks</h3>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{statusCounts.out_of_stock}</p>
              </div>
              <XCircle className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Finished Goods Flat View */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Package className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No products found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product, index) => {
              const availabilityBadge = getAvailabilityBadge(product.availability);
              return (
                <div
                  key={index}
                  className={`rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg flex items-center justify-center overflow-hidden`}>
                      <img
                        src={product.sideViewImage}
                        alt={product.name}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-xs sm:text-sm mb-1 line-clamp-2 sm:line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h3>
                        {product.subgroup && (
                          <p className={`text-[11px] sm:text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {product.subgroup}
                          </p>
                        )}
                        {String(product.availability.status || '').toLowerCase() !== 'out_of_stock' && (
                          <div className="mt-1 space-y-0.5">
                            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">Qty:</span> {product.availability.quantity.toLocaleString()} {product.availability.unit}
                            </p>
                            {product.availability.rate > 0 && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-medium">Rate:</span> ₹{product.availability.rate.toLocaleString()}
                              </p>
                            )}
                            {product.availability.value > 0 && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-medium">Value:</span> ₹{product.availability.value.toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 self-start sm:self-auto">
                        <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-medium ${availabilityBadge.className}`}>
                          <span className={availabilityBadge.iconColor}>
                            <availabilityBadge.Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </span>
                          <span>{availabilityBadge.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
