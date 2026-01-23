import React, { useState, useEffect } from "react"
import { Calculator, ArrowLeft, RefreshCw, Zap } from "lucide-react"
import { io } from "socket.io-client"
import { AAAC_PRODUCTS, calculateAllProducts, DEFAULT_PRICES } from "../../constants/aaacProducts"

export default function AaacCalculator({ setActiveView, prices: externalPrices }) {
  const [products, setProducts] = useState([])
  const [prices, setPrices] = useState(DEFAULT_PRICES)
  const [customDiameter, setCustomDiameter] = useState("")
  const [customNoOfStrands, setCustomNoOfStrands] = useState("")
  const [customCalculations, setCustomCalculations] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [priceUpdateNotification, setPriceUpdateNotification] = useState(null)

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4500'

  // Initialize calculator - fetch prices from backend API
  useEffect(() => {
    const fetchPricesFromBackend = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4500/api';
        const normalizedAPIBase = API_BASE_URL.endsWith('/api') ? API_BASE_URL : (
          API_BASE_URL.includes('/api') ? API_BASE_URL : `${API_BASE_URL}/api`
        );
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${normalizedAPIBase}/aaac-calculator/prices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Backend returns prices in response
          if (data.data && data.data.alu_price_per_kg && data.data.alloy_price_per_kg) {
            const fetchedPrices = {
              alu_price_per_kg: parseFloat(data.data.alu_price_per_kg),
              alloy_price_per_kg: parseFloat(data.data.alloy_price_per_kg)
            };
            setPrices(fetchedPrices);
            calculateAndSetProducts(fetchedPrices);
            // Store in localStorage for offline access
            localStorage.setItem('aaacCurrentPrices', JSON.stringify(fetchedPrices));
            console.log('✅ Fetched prices from backend:', fetchedPrices);
            return;
          }
        }
      } catch (error) {
        console.warn('Error fetching prices from backend:', error);
      }
      
      // Fallback: Try to get prices from localStorage
      const storedPrices = localStorage.getItem('aaacCurrentPrices');
      let initialPrices = DEFAULT_PRICES;
      
      if (storedPrices) {
        try {
          const parsed = JSON.parse(storedPrices);
          if (parsed.alu_price_per_kg && parsed.alloy_price_per_kg) {
            initialPrices = {
              alu_price_per_kg: parseFloat(parsed.alu_price_per_kg),
              alloy_price_per_kg: parseFloat(parsed.alloy_price_per_kg)
            };
            console.log('📦 Loaded prices from localStorage:', initialPrices);
          }
        } catch (error) {
          console.warn('Error parsing stored prices:', error);
        }
      }
      
      setPrices(initialPrices);
      calculateAndSetProducts(initialPrices);
    };
    
    fetchPricesFromBackend();
  }, [])

  // Update prices from external source (Account section)
  useEffect(() => {
    if (externalPrices && (externalPrices.alu_price_per_kg || externalPrices.alloy_price_per_kg)) {
      const newPrices = {
        alu_price_per_kg: parseFloat(externalPrices.alu_price_per_kg) || prices.alu_price_per_kg,
        alloy_price_per_kg: parseFloat(externalPrices.alloy_price_per_kg) || prices.alloy_price_per_kg
      }
      setPrices(newPrices)
      calculateAndSetProducts(newPrices)
    }
  }, [externalPrices])

  // Initialize Socket.io listener for real-time price updates from Account section
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected - Listening for price updates')
      setSocketConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected')
      setSocketConnected(false)
    })

    // Listen for real-time price updates from Accounts Department
    socket.on('aaac:prices:updated', (data) => {
      console.log('📡 Real-time price update received:', data)
      const updatedPrices = {
        alu_price_per_kg: parseFloat(data.alu_price_per_kg) || prices.alu_price_per_kg,
        alloy_price_per_kg: parseFloat(data.alloy_price_per_kg) || prices.alloy_price_per_kg
      }
      setPrices(updatedPrices)
      calculateAndSetProducts(updatedPrices)
      setPriceUpdateNotification(`Prices updated by ${data.updated_by}`)
      setTimeout(() => setPriceUpdateNotification(null), 3000)
    })

    return () => {
      socket.disconnect()
    }
  }, [prices])

  // Calculate all products with current prices
  const calculateAndSetProducts = (currentPrices) => {
    // Ensure prices are numbers
    const aluPrice = parseFloat(currentPrices.alu_price_per_kg) || 0;
    const alloyPrice = parseFloat(currentPrices.alloy_price_per_kg) || 0;
    
    const calculatedProducts = calculateAllProducts(aluPrice, alloyPrice)
    setProducts(calculatedProducts)
    console.log('✅ Calculator recalculated with prices:', { aluPrice, alloyPrice })
  }

  const handleRefresh = () => {
    calculateAndSetProducts(prices)
    console.log('🔄 Calculator refreshed manually')
  }

  // Calculate nominal area: diameter² × 0.785 × no_of_strands × 1.02
  const calculateNominalAreaLocal = (diameter, noOfStrands) => {
    return diameter * diameter * 0.785 * noOfStrands * 1.02
  }

  const handleCustomCalculate = () => {
    if (!customDiameter || !customNoOfStrands) {
      alert('Please enter both diameter and number of strands for custom calculation')
      return
    }

    const diameter = parseFloat(customDiameter)
    const noOfStrands = parseInt(customNoOfStrands)

    if (isNaN(diameter) || isNaN(noOfStrands) || diameter <= 0 || noOfStrands <= 0) {
      alert('Please enter valid positive numbers for diameter and number of strands')
      return
    }

    try {
      // Calculate with correct formulas
      const nominalArea = calculateNominalAreaLocal(diameter, noOfStrands)
      
      // Aluminium Weight: nominal_area × 2.7
      const aluminiumWeight = nominalArea * 2.7
      
      // Ensure prices are numbers
      const aluPrice = parseFloat(prices.alu_price_per_kg) || 0
      const alloyPrice = parseFloat(prices.alloy_price_per_kg) || 0
      
      // Cost per Meter formulas: (price × weight × 1.1) / 1000
      const costAluPerMtr = (aluPrice * aluminiumWeight * 1.1) / 1000
      const costAlloyPerMtr = (alloyPrice * aluminiumWeight * 1.1) / 1000
      
      // Cost per KG formulas: price × 1.1
      const costAluPerKg = aluPrice * 1.1
      const costAlloyPerKg = alloyPrice * 1.1

      setCustomCalculations({
        nominal_area: nominalArea,
        aluminium_weight: aluminiumWeight,
        cost_alu_per_mtr: costAluPerMtr,
        cost_alloy_per_mtr: costAlloyPerMtr,
        cost_alu_per_kg: costAluPerKg,
        cost_alloy_per_kg: costAlloyPerKg
      })
      console.log('✅ Custom calculations completed:', {
        diameter,
        noOfStrands,
        nominalArea,
        aluminiumWeight,
        costAluPerMtr,
        costAlloyPerMtr
      })
    } catch (error) {
      console.error('Error calculating custom product:', error)
      alert('Error calculating custom product: ' + (error.message || 'Please check your inputs.'))
    }
  }

  return (
    <div className="p-6">
      {/* Real-time Update Notification */}
      {priceUpdateNotification && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded flex items-center gap-2 text-green-700">
          <Zap size={16} className="animate-pulse" />
          <span className="text-sm font-medium">{priceUpdateNotification}</span>
        </div>
      )}

      {/* Socket Connection Status */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={socketConnected ? 'text-green-600' : 'text-red-600'}>
          {socketConnected ? '✓ Live updates enabled' : '✗ Live updates disconnected'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView ? setActiveView('calculator') : window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AAAC Calculator</h1>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Calculations
        </button>
      </div>


      {/* Products Table - Enhanced Design */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">AAAC Products Pricing</h2>
          <p className="text-blue-100 text-sm">Current market prices: Alu ₹{(parseFloat(prices.alu_price_per_kg) || 0).toFixed(2)}/kg | Alloy ₹{(parseFloat(prices.alloy_price_per_kg) || 0).toFixed(2)}/kg</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">NAME</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Nominal Area</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">No of Strands</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Diameter</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Aluminium Weight</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Alu Price in Kg</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Alloy Price in KG</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Cost of Conductor (Aluminium) Per Mtr</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Cost of Conductor (Alloy) Per Mtr</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">Cost of Conductor (Aluminium) Per KG</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cost of Conductor (Alloy) Per KG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200">{product.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 font-mono">
                    {(parseFloat(product.calculated_nominal_area) || parseFloat(product.nominal_area) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 text-center">{product.no_of_strands}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 font-mono">{(parseFloat(product.diameter) || 0).toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 font-mono">{(parseFloat(product.aluminium_weight) || 0).toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-blue-600 border-r border-gray-200 font-mono">{prices.alu_price_per_kg.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-blue-600 border-r border-gray-200 font-mono">{prices.alloy_price_per_kg.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 font-mono">{(parseFloat(product.cost_alu_per_mtr) || 0).toFixed(8)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 font-mono">{(parseFloat(product.cost_alloy_per_mtr) || 0).toFixed(8)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200 font-mono">{(parseFloat(product.cost_alu_per_kg) || 0).toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-mono">{(parseFloat(product.cost_alloy_per_kg) || 0).toFixed(2)}</td>
                </tr>
              ))}
              {/* Custom Row with Integrated Calculator */}
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <td className="px-4 py-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-bold text-blue-900">Custom Product</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <div className="text-sm font-mono text-gray-900">
                    {customCalculations?.nominal_area ? (parseFloat(customCalculations.nominal_area) || 0).toFixed(2) : '0.00'}
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <input
                    type="number"
                    step="1"
                    value={customNoOfStrands}
                    onChange={(e) => setCustomNoOfStrands(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="Strands"
                  />
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <input
                    type="number"
                    step="0.01"
                    value={customDiameter}
                    onChange={(e) => setCustomDiameter(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="Diameter"
                  />
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <div className="text-sm font-mono text-gray-900">
                    {(parseFloat(customCalculations?.aluminium_weight) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-blue-600 border-r border-gray-200 font-mono">{prices.alu_price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-4 text-sm font-semibold text-blue-600 border-r border-gray-200 font-mono">{prices.alloy_price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <div className="text-sm font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_alu_per_mtr) || 0).toFixed(8)}
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <div className="text-sm font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_alloy_per_mtr) || 0).toFixed(8)}
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-200">
                  <div className="text-sm font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_alu_per_kg) || (prices.alu_price_per_kg ? prices.alu_price_per_kg * 1.1 : 0)).toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_alloy_per_kg) || (prices.alloy_price_per_kg ? prices.alloy_price_per_kg * 1.1 : 0)).toFixed(2)}
                  </div>
                </td>
              </tr>
              <tr className="bg-blue-50 border-2 border-t-0 border-blue-200">
                <td colSpan="11" className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">💡 Tip:</span> Enter number of strands and diameter to calculate custom product pricing instantly
                    </div>
                    <button
                      onClick={handleCustomCalculate}
                      disabled={!customDiameter || !customNoOfStrands}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      Calculate Custom Product
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
