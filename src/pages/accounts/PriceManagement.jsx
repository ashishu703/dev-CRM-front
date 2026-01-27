import React, { useState, useEffect } from "react"
import { Calculator, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import rawMaterialService from "../../api/admin_api/rawMaterialService"

export default function PriceManagement() {
  const [rawMaterials, setRawMaterials] = useState([
    { id: 'aluminium_ec_grade', name: 'ALUMINIUM EC GRADE', price: 0 },
    { id: 'aluminium_cg_grade', name: 'ALUMINIUM CG GRADE', price: 0 },
    { id: 'pvc_rp_inner', name: 'PVC RP INNER', price: 0 },
    { id: 'pvc_rp_outer', name: 'PVC RP OUTER', price: 0 },
    { id: 'aluminium_alloy', name: 'ALUMINIUM ALLOY', price: 0 },
    { id: 'copper_lme_grade', name: 'COPPER LME GRADE', price: 0 },
    { id: 'xlpe', name: 'XLPE', price: 0 },
    { id: 'pvc_st1_type_a', name: 'PVC ST1/TYPE A', price: 0 },
    { id: 'pvc_st2', name: 'PVC ST2', price: 0 },
    { id: 'fr_pvc', name: 'FR PVC', price: 0 },
    { id: 'frlsh_pvc', name: 'FRLSH PVC', price: 0 },
    { id: 'gi_wire_0_6mm', name: 'G.I WIRE 0.6 MM', price: 0 },
    { id: 'gi_wire_1_4mm', name: 'G.I WIRE 1.4 MM', price: 0 },
    { id: 'gi_armouring_strip', name: 'G.I ARMOURING STRIP', price: 0 },
    { id: 'ld', name: 'LD', price: 0 },
    { id: 'steel_rate', name: 'STEEL RATE', price: 0 },
    { id: 'pvc_st1_st2', name: 'PVC ST1 + PVC ST2', price: 0 },
    { id: 'aluminium_alloy_grade_t4', name: 'ALUMINIUM ALLOY GRADE T4', price: 0 }
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    loadCurrentRates()
  }, [])

  const loadCurrentRates = async () => {
    try {
      setLoading(true)
      const response = await rawMaterialService.getCurrentRates()
      if (response.success) {
        setRawMaterials(prev => 
          prev.map(material => ({
            ...material,
            price: response.data[material.id] || 0
          }))
        )
        setLastUpdated(response.data.lastUpdated || null)
      }
    } catch (error) {
      console.error('Error loading raw material rates:', error)
      showMessage('error', 'Failed to load current rates')
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (materialId, newPrice) => {
    setRawMaterials(prev =>
      prev.map(material =>
        material.id === materialId
          ? { ...material, price: parseFloat(newPrice) || 0 }
          : material
      )
    )
  }

  const saveAllRates = async () => {
    try {
      setSaving(true)
      const rates = {}
      rawMaterials.forEach(material => {
        rates[material.id] = material.price
      })

      const response = await rawMaterialService.updateRawMaterialRates(rates)
      if (response.success) {
        showMessage('success', 'All raw material rates saved successfully!')
        setLastUpdated(new Date())
      } else {
        showMessage('error', 'Failed to save rates')
      }
    } catch (error) {
      console.error('Error saving rates:', error)
      showMessage('error', 'Failed to save rates')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
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
          <h1 className="text-2xl font-bold text-gray-900">RAW MATERIAL</h1>
        </div>
        <p className="text-gray-600 text-sm ml-9">Manage raw material pricing</p>
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

      {/* Raw Materials Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Raw Material Rates</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={loadCurrentRates}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={saveAllRates}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Rates
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rawMaterials.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {material.name}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={material.price}
                  onChange={(e) => handlePriceChange(material.id, e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>

        {lastUpdated && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
