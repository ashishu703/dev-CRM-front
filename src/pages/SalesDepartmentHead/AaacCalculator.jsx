import React, { useState, useEffect } from "react"
import { Calculator, ArrowLeft, RefreshCw } from "lucide-react"
import aaacCalculatorService from "../../api/admin_api/aaacCalculatorService"

export default function AaacCalculator({ setActiveView }) {
  const [products, setProducts] = useState([])
  const [prices, setPrices] = useState({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
  const [loading, setLoading] = useState(true)
  const [customDiameter, setCustomDiameter] = useState("")
  const [customNoOfStrands, setCustomNoOfStrands] = useState("")
  const [customCalculations, setCustomCalculations] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCalculatorData()
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

      {/* Variable Prices Section (Orange) - Read Only */}
      <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Variable Prices (Updated Daily by Account Department)</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Alu Price in KG:</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">₹{prices.alu_price_per_kg.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Alloy Price in KG:</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">₹{prices.alloy_price_per_kg.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 italic">
          Note: Prices are updated by Account Department. Click "Refresh Prices" button above to get the latest prices.
        </p>
      </div>

      {/* Products Table - Exact Excel Structure */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-yellow-50 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">NAME</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Nominal Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">No of Strands</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Diameter</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Aluminium Weight</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-orange-300 bg-orange-50">Alu Price in Kg</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-orange-300 bg-orange-50">Alloy Price in KG</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Cost of Conductor (Aluminium) Per Mtr</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Cost of Conductor (Alloy) Per Mtr</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300">Cost of Conductor (Aluminium) Per KG</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Cost of Conductor (Alloy) Per KG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                    {(parseFloat(product.calculated_nominal_area) || parseFloat(product.nominal_area) || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{product.no_of_strands}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{(parseFloat(product.diameter) || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{(parseFloat(product.aluminium_weight) || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-orange-200 bg-orange-50">{prices.alu_price_per_kg.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-orange-200 bg-orange-50">{prices.alloy_price_per_kg.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{(parseFloat(product.cost_alu_per_mtr) || 0).toFixed(8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{(parseFloat(product.cost_alloy_per_mtr) || 0).toFixed(8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{(parseFloat(product.cost_alu_per_kg) || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(parseFloat(product.cost_alloy_per_kg) || 0).toFixed(2)}</td>
                </tr>
              ))}
              {/* Custom Row */}
              <tr className="bg-blue-50 hover:bg-blue-100">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">Custom</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {customCalculations?.nominal_area ? (parseFloat(customCalculations.nominal_area) || 0).toFixed(2) : '0.00'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {customNoOfStrands || '0.00'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {customDiameter || '0.00'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {(parseFloat(customCalculations?.aluminium_weight) || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-orange-200 bg-orange-50">{prices.alu_price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-orange-200 bg-orange-50">{prices.alloy_price_per_kg.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {(parseFloat(customCalculations?.cost_alu_per_mtr) || 0).toFixed(8)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {(parseFloat(customCalculations?.cost_alloy_per_mtr) || 0).toFixed(8)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                  {(parseFloat(customCalculations?.cost_alu_per_kg) || (prices.alu_price_per_kg ? prices.alu_price_per_kg * 1.1 : 0)).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {(parseFloat(customCalculations?.cost_alloy_per_kg) || (prices.alloy_price_per_kg ? prices.alloy_price_per_kg * 1.1 : 0)).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Product Input Section */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Product Calculator</h2>
        <p className="text-sm text-gray-600 mb-4">Enter No of Strands and Diameter to calculate custom product pricing</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No of Strands</label>
            <input
              type="number"
              step="0.01"
              value={customNoOfStrands}
              onChange={(e) => setCustomNoOfStrands(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of strands"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diameter</label>
            <input
              type="number"
              step="0.01"
              value={customDiameter}
              onChange={(e) => setCustomDiameter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter diameter"
            />
          </div>
        </div>
        <button
          onClick={handleCustomCalculate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Calculate Custom Product
        </button>
      </div>
    </div>
  )
}
