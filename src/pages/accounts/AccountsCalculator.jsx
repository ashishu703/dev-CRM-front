import React, { useState, useEffect } from "react"
import { Calculator, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import aaacCalculatorService from "../../api/admin_api/aaacCalculatorService"

export default function AccountsCalculator() {
  const [prices, setPrices] = useState({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
  const [tempPrices, setTempPrices] = useState({ alu: "", alloy: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    loadCurrentPrices()
  }, [])

  const loadCurrentPrices = async () => {
    try {
      setLoading(true)
      const response = await aaacCalculatorService.getCurrentPrices()
      if (response.success && response.data) {
        setPrices({
          alu_price_per_kg: response.data.alu_price_per_kg,
          alloy_price_per_kg: response.data.alloy_price_per_kg
        })
        setTempPrices({
          alu: response.data.alu_price_per_kg.toString(),
          alloy: response.data.alloy_price_per_kg.toString()
        })
        setLastUpdated(response.data.updated_at || response.data.created_at)
        setMessage({ type: '', text: '' })
      } else {
        // No prices found - set default values for initial entry
        setPrices({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
        setTempPrices({ alu: "296.00", alloy: "340.00" })
        setMessage({ type: 'info', text: 'No prices found. Please set initial prices.' })
      }
    } catch (error) {
      console.error('Error loading prices:', error)
      // If no prices found, allow user to set initial prices
      if (error.message?.includes('No active prices found') || error.response?.status === 404) {
        setPrices({ alu_price_per_kg: 0, alloy_price_per_kg: 0 })
        setTempPrices({ alu: "296.00", alloy: "340.00" })
        setMessage({ type: 'info', text: 'No prices found. Please set initial prices below.' })
      } else {
        setMessage({ type: 'error', text: 'Error loading current prices' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrices = async () => {
    if (!tempPrices.alu || !tempPrices.alloy) {
      setMessage({ type: 'error', text: 'Please enter both Alu Price and Alloy Price' })
      return
    }

    const aluPrice = parseFloat(tempPrices.alu)
    const alloyPrice = parseFloat(tempPrices.alloy)

    if (isNaN(aluPrice) || isNaN(alloyPrice) || aluPrice <= 0 || alloyPrice <= 0) {
      setMessage({ type: 'error', text: 'Please enter valid positive numbers' })
      return
    }

    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      const response = await aaacCalculatorService.updatePrices(aluPrice, alloyPrice)
      if (response.success) {
        setPrices({
          alu_price_per_kg: aluPrice,
          alloy_price_per_kg: alloyPrice
        })
        setMessage({ type: 'success', text: 'Prices updated successfully! All calculations will be updated automatically.' })
        setLastUpdated(new Date().toISOString())
        // Clear message after 5 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error('Error updating prices:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating prices. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Calculator className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AAAC Calculator - Price Management</h1>
        </div>
        <p className="text-gray-600 text-sm ml-9">Update daily prices for Aluminium and Alloy (per KG)</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : message.type === 'info'
            ? 'bg-blue-50 border border-blue-200 text-blue-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Current Prices Card */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Prices</h2>
          <button
            onClick={loadCurrentPrices}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Alu Price in KG</label>
            <div className="text-2xl font-bold text-gray-900">
              {prices.alu_price_per_kg > 0 ? `₹${prices.alu_price_per_kg.toFixed(2)}` : 'Not Set'}
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Alloy Price in KG</label>
            <div className="text-2xl font-bold text-gray-900">
              {prices.alloy_price_per_kg > 0 ? `₹${prices.alloy_price_per_kg.toFixed(2)}` : 'Not Set'}
            </div>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}
          </p>
        )}
      </div>

      {/* Update Prices Form */}
      <div className="bg-white border-2 border-indigo-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Prices</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter new prices for Aluminium and Alloy (per KG). These prices will be used for all AAAC calculator calculations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alu Price in KG <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tempPrices.alu}
              onChange={(e) => {
                setTempPrices({ ...tempPrices, alu: e.target.value })
                setMessage({ type: '', text: '' })
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Enter Alu Price"
            />
            <p className="mt-1 text-xs text-gray-500">Current: ₹{prices.alu_price_per_kg.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alloy Price in KG <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tempPrices.alloy}
              onChange={(e) => {
                setTempPrices({ ...tempPrices, alloy: e.target.value })
                setMessage({ type: '', text: '' })
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Enter Alloy Price"
            />
            <p className="mt-1 text-xs text-gray-500">Current: ₹{prices.alloy_price_per_kg.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSavePrices}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Prices
              </>
            )}
          </button>
          <button
            onClick={() => {
              setTempPrices({
                alu: prices.alu_price_per_kg.toString(),
                alloy: prices.alloy_price_per_kg.toString()
              })
              setMessage({ type: '', text: '' })
            }}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> When you update these prices, all AAAC calculator calculations for Department Heads and Salespersons will automatically use the new prices. 
            The changes take effect immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
