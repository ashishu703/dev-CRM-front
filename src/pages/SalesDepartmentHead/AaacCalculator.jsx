import React, { useState, useEffect } from "react"
import { Calculator, ArrowLeft, RefreshCw, Zap } from "lucide-react"
import { io } from "socket.io-client"
import { calculateAllProducts, DEFAULT_PRICES } from "../../constants/aaacProducts"
import rfpService from "../../services/RfpService"
import Toast from "../../utils/Toast"

export default function AaacCalculator({ setActiveView, prices: externalPrices, onBack, rfpContext }) {
  const [products, setProducts] = useState([])
  const [prices, setPrices] = useState(DEFAULT_PRICES)
  const [customDiameter, setCustomDiameter] = useState("")
  const [customNoOfStrands, setCustomNoOfStrands] = useState("")
  const [customCalculations, setCustomCalculations] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [priceUpdateNotification, setPriceUpdateNotification] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showChargesModal, setShowChargesModal] = useState(false)
  const [chargesRows, setChargesRows] = useState([{ label: 'Drum', amount: '' }])
  const [hasExtraCharges, setHasExtraCharges] = useState(true)
  const [rateType, setRateType] = useState('alu_per_mtr')

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
        const response = await fetch(`${normalizedAPIBase}/raw-materials/rates`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📥 Full API response from rates endpoint:', data);
          
          // Backend returns: { success: true, data: {...rates} }
          const ratesData = data?.data || data;
          console.log('🔍 Extracted rates data:', ratesData);
          
          // Check for Aluminium CG Grade - required
          const aluCGPrice = ratesData?.aluminium_cg_grade;
          const alloyT4Price = ratesData?.aluminium_alloy_grade_t4;
          
          console.log('🔍 Checking prices:', { aluCGPrice, alloyT4Price });
          
          if (aluCGPrice !== undefined) {
            const fetchedPrices = {
              alu_price_per_kg: parseFloat(aluCGPrice) || 0,
              alloy_price_per_kg: parseFloat(alloyT4Price) || 0  // Use 0 if not found
            };
            setPrices(fetchedPrices);
            calculateAndSetProducts(fetchedPrices);
            // Store in localStorage for offline access
            localStorage.setItem('aaacCurrentPrices', JSON.stringify(fetchedPrices));
            console.log('✅ Fetched prices from backend:', fetchedPrices);
            return;
          } else {
            console.warn('⚠️ Aluminium CG Grade price not found in response');
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

  // Auto-select product based on requested spec (case-sensitive)
  useEffect(() => {
    if (!rfpContext?.productSpec || !products.length) return
    const spec = rfpContext.productSpec
    const match = products.find(p => spec.includes(p.name))
    if (match) {
      setSelectedProductId(match.id)
    }
  }, [rfpContext, products])

  // Initialize Socket.io listener for real-time price updates from Account section
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    let socket
    try {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 3
      })

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected - Listening for price updates')
        setSocketConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected')
        setSocketConnected(false)
      })

      socket.on('connect_error', () => {
        console.warn('Socket.IO connection error for AAAC calculator - disabling live updates')
        setSocketConnected(false)
        socket.disconnect()
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
    } catch (error) {
      console.warn('Socket.IO init failed for AAAC calculator:', error)
      setSocketConnected(false)
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

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

  const selectedProduct = products.find(p => p.id === selectedProductId) || null

  const handleConfirmSelection = () => {
    if (!selectedProduct || !rfpContext) {
      alert('Please select a product row first')
      return
    }
    setShowChargesModal(true)
  }

  const updateChargeRow = (index, key, value) => {
    setChargesRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    )
  }

  const addChargeRow = () => {
    setChargesRows((rows) => [...rows, { label: '', amount: '' }])
  }

  const removeChargeRow = (index) => {
    setChargesRows((rows) => rows.filter((_, i) => i !== index))
  }

  const handleSaveCharges = async () => {
    if (!selectedProduct || !rfpContext) {
      setShowChargesModal(false)
      return
    }

    const {
      cost_alu_per_mtr,
      cost_alloy_per_mtr,
      cost_alu_per_kg,
      cost_alloy_kg
    } = selectedProduct

    let basePerUnit = 0
    if (rateType === 'alu_per_mtr') {
      basePerUnit = parseFloat(cost_alu_per_mtr || 0) || 0
    } else if (rateType === 'alloy_per_mtr') {
      basePerUnit = parseFloat(cost_alloy_per_mtr || 0) || 0
    } else if (rateType === 'alu_per_kg') {
      basePerUnit = parseFloat(cost_alu_kg || cost_alu_per_kg || 0) || 0
    } else if (rateType === 'alloy_per_kg') {
      basePerUnit = parseFloat(cost_alloy_kg || selectedProduct.cost_alloy_kg || 0) || 0
    }

    const lengthValue = parseFloat(rfpContext.length || rfpContext.quantity || 0) || 0
    const baseTotal = basePerUnit * lengthValue

    const extraRows = hasExtraCharges ? chargesRows : []
    const extraCharges = extraRows
      .map((row) => Number.parseFloat(row.amount) || 0)
      .filter((v) => Number.isFinite(v))
    const extraTotal = extraCharges.reduce((sum, v) => sum + v, 0)

    const totalPrice = baseTotal + extraTotal

    try {
      window.localStorage.setItem(
        'rfpCalculatorResult',
        JSON.stringify({
          family: 'AAAC',
          rfpId: rfpContext.rfpId,
          rfpRequestId: rfpContext.rfpRequestId,
          productSpec: rfpContext.productSpec,
          length: lengthValue,
          rateType,
          basePerUnit,
          baseTotal,
          extraCharges: extraRows,
          totalPrice
        })
      )
    } catch {
      // ignore storage failure
    }

    window.dispatchEvent(
      new CustomEvent('rfpCalculatorPriceReady', {
        detail: {
          family: 'AAAC',
          rfpId: rfpContext.rfpId,
          rfpRequestId: rfpContext.rfpRequestId,
          totalPrice
        }
      })
    )

    // Auto-approve the RFP from calculator
    try {
      await rfpService.approve(rfpContext.rfpRequestId, {
        calculatorTotalPrice: totalPrice,
        calculatorDetail: {
          family: 'AAAC',
          rfpId: rfpContext.rfpId,
          rfpRequestId: rfpContext.rfpRequestId,
          productSpec: rfpContext.productSpec,
          length: lengthValue,
          rateType,
          basePerUnit,
          baseTotal,
          extraCharges: extraRows,
          totalPrice
        }
      })
      Toast.success('RFP approved with calculator pricing.')
    } catch (error) {
      console.error('Error auto-approving RFP from calculator:', error)
      Toast.error(error?.message || 'Failed to approve RFP from calculator')
    }

    setShowChargesModal(false)
    if (setActiveView) {
      setActiveView('rfp-workflow')
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
            onClick={() => onBack ? onBack() : (setActiveView ? setActiveView('calculator') : window.history.back())}
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 space-y-2">
          <h2 className="text-lg font-bold text-white">AAAC Products Pricing</h2>
          <p className="text-blue-100 text-sm">
            Current market prices: Aluminium CG Grade ₹{(parseFloat(prices.alu_price_per_kg) || 0).toFixed(2)}/kg | Aluminium Alloy Grade T4 ₹{(parseFloat(prices.alloy_price_per_kg) || 0).toFixed(2)}/kg
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100">
            <span className="font-semibold">Rate type for calculation:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRateType('alu_per_mtr')}
                className={`px-3 py-1 rounded-full border text-xs ${
                  rateType === 'alu_per_mtr' ? 'bg-white text-blue-700 border-white' : 'border-blue-200 text-blue-100'
                }`}
              >
                Aluminium / Mtr
              </button>
              <button
                type="button"
                onClick={() => setRateType('alloy_per_mtr')}
                className={`px-3 py-1 rounded-full border text-xs ${
                  rateType === 'alloy_per_mtr' ? 'bg-white text-blue-700 border-white' : 'border-blue-200 text-blue-100'
                }`}
              >
                Alloy / Mtr
              </button>
              <button
                type="button"
                onClick={() => setRateType('alu_per_kg')}
                className={`px-3 py-1 rounded-full border text-xs ${
                  rateType === 'alu_per_kg' ? 'bg-white text-blue-700 border-white' : 'border-blue-200 text-blue-100'
                }`}
              >
                Aluminium / Kg
              </button>
              <button
                type="button"
                onClick={() => setRateType('alloy_per_kg')}
                className={`px-3 py-1 rounded-full border text-xs ${
                  rateType === 'alloy_per_kg' ? 'bg-white text-blue-700 border-white' : 'border-blue-200 text-blue-100'
                }`}
              >
                Alloy / Kg
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">NAME</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Nominal Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">No of Strands</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Diameter</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Aluminium Weight</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Aluminium CG Grade</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Aluminium Alloy Grade T4</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Cost of Conductor (Aluminium) Per Mtr</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Cost of Conductor (Alloy) Per Mtr</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Cost of Conductor (Aluminium) Per KG</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Cost of Conductor (Alloy) Per KG</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                    selectedProductId === product.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <input
                      type="radio"
                      className="text-blue-600"
                      checked={selectedProductId === product.id}
                      onChange={() => setSelectedProductId(product.id)}
                    />
                    <span>{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {(parseFloat(product.calculated_nominal_area) || parseFloat(product.nominal_area) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.no_of_strands}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.diameter) || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.aluminium_weight) || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{prices.alu_price_per_kg.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{prices.alloy_price_per_kg.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.cost_alu_per_mtr) || 0).toFixed(8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.cost_alloy_per_mtr) || 0).toFixed(8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.cost_alu_per_kg) || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.cost_alloy_per_kg) || 0).toFixed(2)}</td>
                </tr>
              ))}
              {/* Custom Row with Integrated Calculator */}
              <tr className="bg-blue-50 border-b-2 border-gray-300">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-bold text-blue-900">Custom Product</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {customCalculations?.nominal_area ? (parseFloat(customCalculations.nominal_area) || 0).toFixed(2) : '0.00'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="1"
                    value={customNoOfStrands}
                    onChange={(e) => setCustomNoOfStrands(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="Strands"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    value={customDiameter}
                    onChange={(e) => setCustomDiameter(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="Diameter"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {(parseFloat(customCalculations?.aluminium_weight) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-600">{prices.alu_price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-600">{prices.alloy_price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {(parseFloat(customCalculations?.cost_alu_per_mtr) || 0).toFixed(8)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {(parseFloat(customCalculations?.cost_alloy_per_mtr) || 0).toFixed(8)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {(parseFloat(customCalculations?.cost_alu_per_kg) || (prices.alu_price_per_kg ? prices.alu_price_per_kg * 1.1 : 0)).toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {(parseFloat(customCalculations?.cost_alloy_per_kg) || (prices.alloy_price_per_kg ? prices.alloy_price_per_kg * 1.1 : 0)).toFixed(2)}
                  </div>
                </td>
              </tr>
              <tr className="bg-blue-50 border-b border-gray-300">
                <td colSpan="11" className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">💡 Tip:</span> Enter number of strands and diameter to calculate custom product pricing instantly
                    </div>
                    <button
                      onClick={handleConfirmSelection}
                      disabled={!selectedProduct}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      Use Selected Row
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Extra Charges Modal */}
      {showChargesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Additional Charges</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Any other charges (drum, transportation, others)?</span>
                <div className="flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={hasExtraCharges === false}
                      onChange={() => setHasExtraCharges(false)}
                    />
                    No
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={hasExtraCharges === true}
                      onChange={() => setHasExtraCharges(true)}
                    />
                    Yes
                  </label>
                </div>
              </div>
              {hasExtraCharges && (
                <div className="space-y-3 max-h-64 overflow-y-auto border-t border-gray-200 pt-3">
                  {chargesRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Charge label (e.g. Drum, Transportation)"
                        value={row.label}
                        onChange={(e) => updateChargeRow(idx, 'label', e.target.value)}
                      />
                      <input
                        type="number"
                        className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Amount"
                        value={row.amount}
                        onChange={(e) => updateChargeRow(idx, 'amount', e.target.value)}
                      />
                      {chargesRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChargeRow(idx)}
                          className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChargeRow}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    + Add another charge
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChargesModal(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCharges}
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg"
              >
                Save & Return to RFP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}