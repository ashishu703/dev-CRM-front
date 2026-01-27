import React, { useState, useEffect } from "react"
import { Calculator, ArrowLeft, RefreshCw, Zap } from "lucide-react"
import { io } from "socket.io-client"
import { ACSR_PRODUCTS, calculateAllProducts, DEFAULT_RATES } from "../../constants/acsrProducts"

export default function AcsrCalculator({ setActiveView, rates: externalRates, onBack }) {
  const [products, setProducts] = useState([])
  const [rates, setRates] = useState(DEFAULT_RATES)
  const [customNoOfWiresAluminium, setCustomNoOfWiresAluminium] = useState("")
  const [customNoOfWiresSteel, setCustomNoOfWiresSteel] = useState("")
  const [customSizeAluminium, setCustomSizeAluminium] = useState("")
  const [customSizeSteel, setCustomSizeSteel] = useState("")
  const [customCalculations, setCustomCalculations] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [rateUpdateNotification, setRateUpdateNotification] = useState(null)

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4500'

  // Initialize calculator - fetch rates from backend API
  useEffect(() => {
    const fetchRatesFromBackend = async () => {
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
          if (data.success && data.data) {
            const fetchedRates = {
              aluminium_cg_grade: parseFloat(data.data.aluminium_cg_grade),
              aluminium_ec_grade: parseFloat(data.data.aluminium_ec_grade),
              steel_rate: parseFloat(data.data.steel_rate)
            };
            setRates(fetchedRates);
            calculateAndSetProducts(fetchedRates);
            localStorage.setItem('acsrCurrentRates', JSON.stringify(fetchedRates));
            return;
          }
        }
      } catch (error) {
        console.warn('Error fetching rates from backend:', error);
      }
      
      const storedRates = localStorage.getItem('acsrCurrentRates');
      let initialRates = DEFAULT_RATES;
      
      if (storedRates) {
        try {
          const parsed = JSON.parse(storedRates);
          if (parsed.aluminium_cg_grade && parsed.aluminium_ec_grade && parsed.steel_rate) {
            initialRates = {
              aluminium_cg_grade: parseFloat(parsed.aluminium_cg_grade),
              aluminium_ec_grade: parseFloat(parsed.aluminium_ec_grade),
              steel_rate: parseFloat(parsed.steel_rate)
            };
          }
        } catch (error) {
          console.warn('Error parsing stored rates:', error);
        }
      }
      
      setRates(initialRates);
      calculateAndSetProducts(initialRates);
    };
    
    fetchRatesFromBackend();
  }, [])

  // Update rates from external source
  useEffect(() => {
    if (externalRates && (externalRates.aluminium_cg_grade || externalRates.aluminium_ec_grade || externalRates.steel_rate)) {
      const newRates = {
        aluminium_cg_grade: parseFloat(externalRates.aluminium_cg_grade) || rates.aluminium_cg_grade,
        aluminium_ec_grade: parseFloat(externalRates.aluminium_ec_grade) || rates.aluminium_ec_grade,
        steel_rate: parseFloat(externalRates.steel_rate) || rates.steel_rate
      }
      setRates(newRates)
      calculateAndSetProducts(newRates)
    }
  }, [externalRates])

  // Socket.io listener for real-time rate updates
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
      console.log('✅ Socket.IO connected - ACSR rates')
      setSocketConnected(true)
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
    })

    socket.on('acsr:rates:updated', (data) => {
      const updatedRates = {
        aluminium_cg_grade: parseFloat(data.aluminium_cg_grade) || rates.aluminium_cg_grade,
        aluminium_ec_grade: parseFloat(data.aluminium_ec_grade) || rates.aluminium_ec_grade,
        steel_rate: parseFloat(data.steel_rate) || rates.steel_rate
      }
      setRates(updatedRates)
      calculateAndSetProducts(updatedRates)
      setRateUpdateNotification(`Rates updated by ${data.updated_by}`)
      setTimeout(() => setRateUpdateNotification(null), 3000)
    })

    return () => {
      socket.disconnect()
    }
  }, [rates])

  // Calculate all products with current rates
  const calculateAndSetProducts = (currentRates) => {
    const aluminiumCgRate = parseFloat(currentRates.aluminium_cg_grade) || 0;
    const aluminiumEcRate = parseFloat(currentRates.aluminium_ec_grade) || 0;
    const steelRate = parseFloat(currentRates.steel_rate) || 0;
    
    const calculatedProducts = calculateAllProducts(aluminiumCgRate, aluminiumEcRate, steelRate)
    setProducts(calculatedProducts)
  }

  const handleRefresh = () => {
    calculateAndSetProducts(rates)
  }

  const handleCustomCalculate = () => {
    if (!customNoOfWiresAluminium || !customNoOfWiresSteel || !customSizeAluminium || !customSizeSteel) {
      alert('Please enter all values for custom calculation')
      return
    }

    const noOfWiresAluminium = parseInt(customNoOfWiresAluminium)
    const noOfWiresSteel = parseInt(customNoOfWiresSteel)
    const sizeAluminium = parseFloat(customSizeAluminium)
    const sizeSteel = parseFloat(customSizeSteel)

    if (isNaN(noOfWiresAluminium) || isNaN(noOfWiresSteel) || isNaN(sizeAluminium) || isNaN(sizeSteel) ||
        noOfWiresAluminium <= 0 || noOfWiresSteel <= 0 || sizeAluminium <= 0 || sizeSteel <= 0) {
      alert('Please enter valid positive numbers')
      return
    }

    try {
      // Calculate weights using your specified formulas
      const aluminiumWeight = sizeAluminium * sizeAluminium * 0.785 * noOfWiresAluminium * 1.02 * 2.703;
      const steelWeight = sizeSteel * sizeSteel * 0.785 * noOfWiresSteel * 1.02 * 7.9;
      const totalWeight = aluminiumWeight + steelWeight;

      // Calculate costs using your specified formulas
      const aluminiumCgRate = parseFloat(rates.aluminium_cg_grade) || 0
      const aluminiumEcRate = parseFloat(rates.aluminium_ec_grade) || 0
      const steelRate = parseFloat(rates.steel_rate) || 0

      const costConductorIsiPerMtr = ((aluminiumWeight * aluminiumEcRate) + (steelWeight * steelRate)) * 1.12 / 1000;
      const costConductorCommercialPerMtr = ((steelWeight * steelRate) + (aluminiumWeight * aluminiumCgRate)) * 1.15 / 1000;
      
      const costConductorIsiPerKg = totalWeight > 0 ? costConductorIsiPerMtr * 1000 / totalWeight : 0;
      const costConductorCommercialPerKg = totalWeight > 0 ? costConductorCommercialPerMtr * 1000 / totalWeight : 0;

      setCustomCalculations({
        weight_aluminium: aluminiumWeight,
        weight_steel: steelWeight,
        total_weight: totalWeight,
        cost_conductor_isi_per_mtr: costConductorIsiPerMtr,
        cost_conductor_commercial_per_mtr: costConductorCommercialPerMtr,
        cost_conductor_isi_per_kg: costConductorIsiPerKg,
        cost_conductor_commercial_per_kg: costConductorCommercialPerKg
      })
    } catch (error) {
      console.error('Error calculating custom product:', error)
      alert('Error calculating custom product')
    }
  }

  return (
    <div className="p-6">
      {/* Real-time Update Notification */}
      {rateUpdateNotification && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded flex items-center gap-2 text-green-700">
          <Zap size={16} className="animate-pulse" />
          <span className="text-sm font-medium">{rateUpdateNotification}</span>
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
            <h1 className="text-2xl font-bold text-gray-900">ACSR Calculator</h1>
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

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100 max-h-96">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
          <h2 className="text-sm font-bold text-white">ACSR Products Pricing</h2>
          <p className="text-blue-100 text-xs">Current rates: Alu CG ₹{(parseFloat(rates.aluminium_cg_grade) || 0).toFixed(2)}/kg | Alu EC ₹{(parseFloat(rates.aluminium_ec_grade) || 0).toFixed(2)}/kg | Steel ₹{(parseFloat(rates.steel_rate) || 0).toFixed(2)}/kg</p>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-80">
          <table className="w-full min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">NAME</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">AL SPECS</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">STEEL SPECS</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">AL WIRES</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">STEEL WIRES</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">AL SIZE</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">STEEL SIZE</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">AL WEIGHT</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">STEEL WEIGHT</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">TOTAL WEIGHT</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">AL CG RATE</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">AL EC RATE</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">STEEL RATE</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ISI/MTR</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">COMM/MTR</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">ISI/KG</th>
                <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">COMM/KG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.filter(p => p.name !== 'CUSTOM').map((product, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-2 py-1 text-xs font-semibold text-gray-900 border-r border-gray-200">{product.name}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200">{product.no_of_wires_aluminium}/{product.size_aluminium}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200">{product.no_of_wires_steel}/{product.size_steel}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-center">{product.no_of_wires_aluminium}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-center">{product.no_of_wires_steel}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-center">{product.size_aluminium}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-center">{product.size_steel}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-right">{(parseFloat(product.weight_aluminium) || 0).toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-right">{(parseFloat(product.weight_steel) || 0).toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-right">{(parseFloat(product.total_weight) || 0).toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs font-semibold text-blue-600 border-r border-gray-200 text-right">{rates.aluminium_cg_grade.toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs font-semibold text-blue-600 border-r border-gray-200 text-right">{rates.aluminium_ec_grade.toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs font-semibold text-blue-600 border-r border-gray-200 text-right">{rates.steel_rate.toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-right">{(parseFloat(product.cost_conductor_isi_per_mtr) || 0).toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-right">{(parseFloat(product.cost_conductor_commercial_per_mtr) || 0).toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 border-r border-gray-200 text-right">{(parseFloat(product.cost_conductor_isi_per_kg) || 0).toFixed(2)}</td>
                  <td className="px-2 py-1 text-xs text-gray-700 text-right">{(parseFloat(product.cost_conductor_commercial_per_kg) || 0).toFixed(2)}</td>
                </tr>
              ))}
              {/* Custom Row */}
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <td className="px-2 py-1 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span className="text-xs font-bold text-blue-900">Custom</span>
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200">
                  <div className="text-xs text-gray-900 text-center">
                    {customNoOfWiresAluminium || 0}/{customSizeAluminium || 0}
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200">
                  <div className="text-xs text-gray-900 text-center">
                    {customNoOfWiresSteel || 0}/{customSizeSteel || 0}
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200">
                  <input
                    type="number"
                    value={customNoOfWiresAluminium}
                    onChange={(e) => setCustomNoOfWiresAluminium(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                    placeholder="AL"
                  />
                </td>
                <td className="px-2 py-1 border-r border-gray-200">
                  <input
                    type="number"
                    value={customNoOfWiresSteel}
                    onChange={(e) => setCustomNoOfWiresSteel(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                    placeholder="Steel"
                  />
                </td>
                <td className="px-2 py-1 border-r border-gray-200">
                  <input
                    type="number"
                    step="0.01"
                    value={customSizeAluminium}
                    onChange={(e) => setCustomSizeAluminium(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                    placeholder="AL size"
                  />
                </td>
                <td className="px-2 py-1 border-r border-gray-200">
                  <input
                    type="number"
                    step="0.01"
                    value={customSizeSteel}
                    onChange={(e) => setCustomSizeSteel(e.target.value)}
                    className="w-full px-1 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                    placeholder="Steel size"
                  />
                </td>
                <td className="px-2 py-1 border-r border-gray-200 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.weight_aluminium) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.weight_steel) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.total_weight) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-2 py-1 text-xs font-semibold text-blue-600 border-r border-gray-200 text-right">{rates.aluminium_cg_grade.toFixed(2)}</td>
                <td className="px-2 py-1 text-xs font-semibold text-blue-600 border-r border-gray-200 text-right">{rates.aluminium_ec_grade.toFixed(2)}</td>
                <td className="px-2 py-1 text-xs font-semibold text-blue-600 border-r border-gray-200 text-right">{rates.steel_rate.toFixed(2)}</td>
                <td className="px-2 py-1 border-r border-gray-200 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_conductor_isi_per_mtr) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_conductor_commercial_per_mtr) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-2 py-1 border-r border-gray-200 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_conductor_isi_per_kg) || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-2 py-1 text-right">
                  <div className="text-xs font-mono text-gray-900">
                    {(parseFloat(customCalculations?.cost_conductor_commercial_per_kg) || 0).toFixed(2)}
                  </div>
                </td>
              </tr>
              <tr className="bg-blue-50 border-2 border-t-0 border-blue-200">
                <td colSpan="18" className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">💡 Tip:</span> Enter wire counts and sizes to calculate custom ACSR product pricing instantly
                    </div>
                    <button
                      onClick={handleCustomCalculate}
                      disabled={!customNoOfWiresAluminium || !customNoOfWiresSteel || !customSizeAluminium || !customSizeSteel}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Calculator className="w-3 h-3" />
                      Calculate Custom
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
