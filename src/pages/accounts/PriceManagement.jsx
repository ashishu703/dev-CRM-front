import React, { useState, useEffect } from "react"
import { Calculator, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import rawMaterialService from "../../api/admin_api/rawMaterialService"

export default function PriceManagement() {
  // Single source of truth: rates from backend
  const [rates, setRates] = useState({})
  // Separate state for user edits only
  const [editedRates, setEditedRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Material definitions
  const materialDefinitions = [
    { id: 'aluminium_ec_grade', name: 'ALUMINIUM EC GRADE' },
    { id: 'aluminium_cg_grade', name: 'ALUMINIUM CG GRADE' },
    { id: 'pvc_rp_inner', name: 'PVC RP INNER' },
    { id: 'pvc_rp_outer', name: 'PVC RP OUTER' },
    { id: 'aluminium_alloy', name: 'ALUMINIUM ALLOY' },
    { id: 'copper_lme_grade', name: 'COPPER LME GRADE' },
    { id: 'xlpe', name: 'XLPE' },
    { id: 'pvc_st1_type_a', name: 'PVC ST1/TYPE A' },
    { id: 'pvc_st2', name: 'PVC ST2' },
    { id: 'fr_pvc', name: 'FR PVC' },
    { id: 'frlsh_pvc', name: 'FRLSH PVC' },
    { id: 'gi_wire_0_6mm', name: 'G.I WIRE 0.6 MM' },
    { id: 'gi_wire_1_4mm', name: 'G.I WIRE 1.4 MM' },
    { id: 'gi_armouring_strip', name: 'G.I ARMOURING STRIP' },
    { id: 'ld', name: 'LD' },
    { id: 'steel_rate', name: 'STEEL RATE' },
    { id: 'pvc_st1_st2', name: 'PVC ST1 + PVC ST2' },
    { id: 'aluminium_alloy_grade_t4', name: 'ALUMINIUM ALLOY GRADE T4' }
  ]

  useEffect(() => {
    loadCurrentRates()
  }, [])

  /**
   * Load current rates from backend
   * rawMaterialService already unwraps response.data, so response IS the data
   */
  const loadCurrentRates = async () => {
    try {
      setLoading(true)
      const response = await rawMaterialService.getCurrentRates()
      
      console.log('📥 Full API response:', response)
      
      // The service returns data directly (not wrapped in { success, data: {...} })
      if (response && response.aluminium_ec_grade !== undefined) {
        const parsedRates = {}
        Object.keys(response).forEach(key => {
          const value = response[key]
          // Convert string prices to numbers, keep lastUpdated as-is
          if (key === 'lastUpdated') {
            parsedRates[key] = value
          } else {
            parsedRates[key] = parseFloat(value) || 0
          }
        })
        
        console.log('✅ Parsed rates:', parsedRates)
        setRates(parsedRates)
        setEditedRates({})
      } else {
        console.warn('⚠️ Invalid response:', response)
      }
    } catch (error) {
      console.error('❌ Error loading raw material rates:', error)
      showMessage('error', 'Failed to load current rates')
    } finally {
      setLoading(false)
    }
  }

  /**
   * SAFE: Only track actual user changes, never overwrite with empty values
   */
  const handlePriceChange = (materialId, newValue) => {
    const numericValue = parseFloat(newValue)
    
    if (newValue === '' || newValue === null || newValue === undefined) {
      // User cleared the field - remove from editedRates to preserve original
      const updatedEdited = { ...editedRates }
      delete updatedEdited[materialId]
      setEditedRates(updatedEdited)
    } else if (!isNaN(numericValue) && numericValue >= 0) {
      // Valid numeric input - track the change
      setEditedRates(prev => ({
        ...prev,
        [materialId]: numericValue
      }))
    }
  }

  /**
   * Safe payload builder - ONLY changed fields, no empty values
   */
  const buildSafePayload = () => {
    const payload = {}
    
    Object.keys(editedRates).forEach(materialId => {
      const newValue = editedRates[materialId]
      const currentValue = rates[materialId]
      
      // Only send if: value exists AND (changed OR wasn't set before)
      if (newValue !== '' && newValue !== null && newValue !== undefined) {
        if (newValue !== currentValue) {
          payload[materialId] = parseFloat(newValue)
        }
      }
    })
    
    return payload
  }

  /**
   * Save only changed fields, then refresh from server
   */
  const saveAllRates = async () => {
    try {
      setSaving(true)
      const payload = buildSafePayload()
      
      if (Object.keys(payload).length === 0) {
        showMessage('info', 'No changes to save')
        return
      }

      const response = await rawMaterialService.updateRawMaterialRates(payload)
      
      console.log('💾 Save response:', response)
      
      if (response && response.success) {
        showMessage('success', 'Rates updated!')
        // Refresh all rates from server to ensure UI shows latest
        await loadCurrentRates()
      } else {
        showMessage('error', 'Failed to save')
      }
    } catch (error) {
      console.error('❌ Error saving:', error)
      showMessage('error', 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Get input value - show edited OR current rate
   */
  const getInputValue = (materialId) => {
    if (editedRates.hasOwnProperty(materialId)) {
      return editedRates[materialId]
    }
    return rates[materialId] || ''
  }

  /**
   * Get effective current value for display
   */
  const getCurrentValue = (materialId) => {
    return editedRates.hasOwnProperty(materialId)
      ? editedRates[materialId]
      : (rates[materialId] || 0)
  }

  /**
   * Check if field was modified by user
   */
  const isFieldModified = (materialId) => {
    return editedRates.hasOwnProperty(materialId) &&
           editedRates[materialId] !== rates[materialId]
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
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Raw Material Rates</h2>
            <div className="mt-2 text-sm text-gray-600">
              Modified fields: {Object.keys(editedRates).length} of {materialDefinitions.length} materials
            </div>
          </div>
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
              disabled={saving || Object.keys(editedRates).length === 0}
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
                  Save Changes ({Object.keys(editedRates).length})
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialDefinitions.map((material) => {
            const currentValue = getCurrentValue(material.id)
            const displayValue = rates[material.id] || 0
            const isModified = isFieldModified(material.id)
            
            return (
              <div key={material.id} className={`border rounded-lg p-4 transition-colors ${
                isModified ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {material.name}
                  {isModified && <span className="ml-2 text-indigo-600 text-xs">• Modified</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={getInputValue(material.id)}
                    onChange={(e) => handlePriceChange(material.id, e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Current: ${displayValue.toFixed(2)}`}
                  />
                </div>
                
                {/* Updated Price Display */}
                <div className="mt-2 text-xs">
                  {isModified ? (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Previous: ₹{displayValue.toFixed(2)}</span>
                      <span className={`font-medium ${
                        currentValue > displayValue 
                          ? 'text-green-600' 
                          : currentValue < displayValue 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`}>
                        Updated: ₹{currentValue.toFixed(2)}
                        {currentValue > displayValue && ' ↗'}
                        {currentValue < displayValue && ' ↘'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Current: ₹{displayValue.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {rates.lastUpdated && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(rates.lastUpdated).toLocaleString('en-IN', { 
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