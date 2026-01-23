import React, { useState, useEffect } from "react"
import { Calculator, ArrowLeft, RefreshCw, Zap } from "lucide-react"
import { io } from "socket.io-client"
import aaacCalculatorService from "../../api/admin_api/aaacCalculatorService"

export default function AaacCalculator({ setActiveView }) {
  const [products, setProducts] = useState([])
  const [prices, setPrices] = useState({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
  const [loading, setLoading] = useState(true)
  const [customDiameter, setCustomDiameter] = useState("")
  const [customNoOfStrands, setCustomNoOfStrands] = useState("")
  const [customCalculations, setCustomCalculations] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [priceUpdateNotification, setPriceUpdateNotification] = useState(null)

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4500'

  useEffect(() => {
    loadCalculatorData()
  }, [])

  // Initialize Socket.io listener for real-time price updates
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
      setPriceUpdateNotification(`Prices updated by ${data.updated_by}`)
      // Auto-reload calculator with new prices
      loadCalculatorData()
      setTimeout(() => setPriceUpdateNotification(null), 3000)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const loadCalculatorData = async () => {
    try {
      setLoading(true)
      const response = await aaacCalculatorService.getAllProducts()
      console.log('AAAC Calculator Response:', response) // Debug log
      
      // Response structure: {success: true, data: {prices: {...}, products: [...]}}
      // OR direct: {prices: {...}, products: [...]}
      let data = response
      if (response.success && response.data) {
        data = response.data
      }
      
      if (data && (data.products || data.prices)) {
        setProducts(data.products || [])
        if (data.prices) {
          setPrices({
            alu_price_per_kg: parseFloat(data.prices.alu_price_per_kg) || 0,
            alloy_price_per_kg: parseFloat(data.prices.alloy_price_per_kg) || 0
          })
        } else {
          console.warn('No prices found in response')
          setPrices({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
        }
      } else {
        console.error('Invalid response structure:', response)
        setPrices({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
      }
    } catch (error) {
      console.error('Error loading calculator data:', error)
      alert('Error loading calculator data: ' + (error.message || 'Unknown error'))
      setPrices({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCalculatorData()
    setRefreshing(false)
  }

  // Calculate nominal area: diameter² × 0.785 × no_of_strands × 1.02
  const calculateNominalArea = (diameter, noOfStrands) => {
    return diameter * diameter * 0.785 * noOfStrands * 1.02
  }

  const handleCustomCalculate = async () => {
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
      const response = await aaacCalculatorService.calculateProduct(
        'Custom',
        diameter,
        noOfStrands
      )
      console.log('Custom Product Full Response:', JSON.stringify(response, null, 2)) // Debug log
      
      // Service returns response.data from apiClient
      // API returns: {success: true, data: {product: {...}, prices: {...}, calculations: {...}}}
      // Service returns: {product: {...}, prices: {...}, calculations: {...}}
      
      let calculations = null
      
      // Check for calculations in different possible locations
      if (response && response.calculations) {
        // Direct: {calculations: {...}}
        calculations = response.calculations
      } else if (response && response.success && response.data && response.data.calculations) {
        // Wrapped: {success: true, data: {calculations: {...}}}
        calculations = response.data.calculations
      } else if (response && response.data && response.data.calculations) {
        // Nested: {data: {calculations: {...}}}
        calculations = response.data.calculations
      }
      
      // If calculations don't have nominal_area, calculate it on frontend
      if (calculations && !calculations.nominal_area) {
        calculations.nominal_area = calculateNominalArea(diameter, noOfStrands)
      }
      
      console.log('Extracted calculations:', calculations)
      
      if (calculations) {
        setCustomCalculations(calculations)
        console.log('✅ Custom calculations set successfully')
        console.log('Nominal Area:', calculations.nominal_area)
        console.log('Aluminium Weight:', calculations.aluminium_weight)
      } else {
        console.error('❌ No calculations found in response')
        console.error('Full response:', response)
        alert('Error: No calculations returned. Check browser console for details.')
      }
    } catch (error) {
      console.error('Error calculating custom product:', error)
      alert('Error calculating custom product: ' + (error.message || 'Please check your inputs.'))
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
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
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>


      {/* Products Table - Enhanced Design */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">AAAC Products Pricing</h2>
          <p className="text-blue-100 text-sm">Current market prices: Alu ₹{prices.alu_price_per_kg.toFixed(2)}/kg | Alloy ₹{prices.alloy_price_per_kg.toFixed(2)}/kg</p>
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
