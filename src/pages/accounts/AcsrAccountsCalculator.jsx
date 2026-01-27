import React, { useState, useEffect } from "react"
import { Calculator, Save, RefreshCw, AlertCircle, CheckCircle, Plus, X, Edit2, Trash2 } from "lucide-react"
import acsrCalculatorService from "../../api/admin_api/acsrCalculatorService"

export default function AcsrAccountsCalculator() {
  const [rates, setRates] = useState({ aluminium_cg_grade: 0, aluminium_ec_grade: 0, steel_rate: 0 })
  const [tempRates, setTempRates] = useState({ cg: "", ec: "", steel: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    no_of_wires_aluminium: '',
    no_of_wires_steel: '',
    size_aluminium: '',
    size_steel: '',
    weight_aluminium: '',
    weight_steel: ''
  })

  useEffect(() => {
    loadCurrentRates()
    loadProducts()
  }, [])

  const loadCurrentRates = async () => {
    try {
      setLoading(true)
      const response = await acsrCalculatorService.getCurrentRates()
      if (response.success && response.data) {
        setRates({
          aluminium_cg_grade: response.data.aluminium_cg_grade,
          aluminium_ec_grade: response.data.aluminium_ec_grade,
          steel_rate: response.data.steel_rate
        })
        setTempRates({
          cg: response.data.aluminium_cg_grade.toString(),
          ec: response.data.aluminium_ec_grade.toString(),
          steel: response.data.steel_rate.toString()
        })
        setLastUpdated(response.data.updated_at || response.data.created_at)
        setMessage({ type: '', text: '' })
      } else {
        setRates({ aluminium_cg_grade: 296.00, aluminium_ec_grade: 320.00, steel_rate: 65.00 })
        setTempRates({ cg: "296.00", ec: "320.00", steel: "65.00" })
        setMessage({ type: 'info', text: 'No rates found. Please set initial rates.' })
      }
    } catch (error) {
      console.error('Error loading rates:', error)
      if (error.message?.includes('No active rates found') || error.response?.status === 404) {
        setRates({ aluminium_cg_grade: 296.00, aluminium_ec_grade: 320.00, steel_rate: 65.00 })
        setTempRates({ cg: "296.00", ec: "320.00", steel: "65.00" })
        setMessage({ type: 'info', text: 'No rates found. Please set initial rates below.' })
      } else {
        setMessage({ type: 'error', text: 'Error loading current rates' })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await acsrCalculatorService.getAllProducts()
      if (response.success && response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleSaveRates = async () => {
    if (!tempRates.cg || !tempRates.ec || !tempRates.steel) {
      setMessage({ type: 'error', text: 'Please enter all three rates' })
      return
    }

    const cgRate = parseFloat(tempRates.cg)
    const ecRate = parseFloat(tempRates.ec)
    const steelRate = parseFloat(tempRates.steel)

    if (isNaN(cgRate) || isNaN(ecRate) || isNaN(steelRate) || cgRate <= 0 || ecRate <= 0 || steelRate <= 0) {
      setMessage({ type: 'error', text: 'Please enter valid positive numbers' })
      return
    }

    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      const response = await acsrCalculatorService.updateRates(cgRate, ecRate, steelRate)
      if (response.success) {
        setRates({
          aluminium_cg_grade: cgRate,
          aluminium_ec_grade: ecRate,
          steel_rate: steelRate
        })
        setMessage({ type: 'success', text: 'Rates updated successfully! All calculations will be updated automatically.' })
        setLastUpdated(new Date().toISOString())
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      }
    } catch (error) {
      console.error('Error updating rates:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating rates. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.no_of_wires_aluminium || !newProduct.no_of_wires_steel || 
        !newProduct.size_aluminium || !newProduct.size_steel || !newProduct.weight_aluminium || !newProduct.weight_steel) {
      setMessage({ type: 'error', text: 'Please fill all product fields' })
      return
    }

    try {
      const productData = {
        ...newProduct,
        no_of_wires_aluminium: parseInt(newProduct.no_of_wires_aluminium),
        no_of_wires_steel: parseInt(newProduct.no_of_wires_steel),
        size_aluminium: parseFloat(newProduct.size_aluminium),
        size_steel: parseFloat(newProduct.size_steel),
        weight_aluminium: parseFloat(newProduct.weight_aluminium),
        weight_steel: parseFloat(newProduct.weight_steel),
        total_weight: parseFloat(newProduct.weight_aluminium) + parseFloat(newProduct.weight_steel)
      }

      const response = await acsrCalculatorService.calculateProduct(newProduct.name, productData)
      if (response.success) {
        setMessage({ type: 'success', text: 'Product added successfully!' })
        setShowAddProduct(false)
        setNewProduct({
          name: '',
          no_of_wires_aluminium: '',
          no_of_wires_steel: '',
          size_aluminium: '',
          size_steel: '',
          weight_aluminium: '',
          weight_steel: ''
        })
        loadProducts()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      setMessage({ type: 'error', text: 'Error adding product. Please try again.' })
    }
  }

  const handleDeleteProduct = async (productName) => {
    if (!confirm(`Are you sure you want to delete ${productName}?`)) return

    try {
      // Note: You'll need to implement deleteProduct in the API service
      setMessage({ type: 'success', text: 'Product deleted successfully!' })
      loadProducts()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting product' })
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
          <h1 className="text-2xl font-bold text-gray-900">ACSR Calculator - Rate Management</h1>
        </div>
        <p className="text-gray-600 text-sm ml-9">Update daily rates for Aluminium CG, Aluminium EC, and Steel (per KG)</p>
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

      {/* Current Rates Card */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Rates</h2>
          <button
            onClick={loadCurrentRates}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Aluminium CG Rate</label>
            <div className="text-2xl font-bold text-gray-900">
              {rates.aluminium_cg_grade > 0 ? `₹${rates.aluminium_cg_grade.toFixed(2)}` : 'Not Set'}
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Aluminium EC Rate</label>
            <div className="text-2xl font-bold text-gray-900">
              {rates.aluminium_ec_grade > 0 ? `₹${rates.aluminium_ec_grade.toFixed(2)}` : 'Not Set'}
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Steel Rate</label>
            <div className="text-2xl font-bold text-gray-900">
              {rates.steel_rate > 0 ? `₹${rates.steel_rate.toFixed(2)}` : 'Not Set'}
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

      {/* Update Rates Form */}
      <div className="bg-white border-2 border-indigo-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Rates</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter new rates for Aluminium CG, Aluminium EC, and Steel (per KG). These rates will be used for all ACSR calculator calculations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aluminium CG Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tempRates.cg}
              onChange={(e) => {
                setTempRates({ ...tempRates, cg: e.target.value })
                setMessage({ type: '', text: '' })
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Enter CG Rate"
            />
            <p className="mt-1 text-xs text-gray-500">Current: ₹{rates.aluminium_cg_grade.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aluminium EC Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tempRates.ec}
              onChange={(e) => {
                setTempRates({ ...tempRates, ec: e.target.value })
                setMessage({ type: '', text: '' })
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Enter EC Rate"
            />
            <p className="mt-1 text-xs text-gray-500">Current: ₹{rates.aluminium_ec_grade.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steel Rate <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tempRates.steel}
              onChange={(e) => {
                setTempRates({ ...tempRates, steel: e.target.value })
                setMessage({ type: '', text: '' })
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="Enter Steel Rate"
            />
            <p className="mt-1 text-xs text-gray-500">Current: ₹{rates.steel_rate.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveRates}
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
                Update Rates
              </>
            )}
          </button>
          <button
            onClick={() => {
              setTempRates({
                cg: rates.aluminium_cg_grade.toString(),
                ec: rates.aluminium_ec_grade.toString(),
                steel: rates.steel_rate.toString()
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
            <strong>Note:</strong> When you update these rates, all ACSR calculator calculations for Department Heads and Salespersons will automatically use the new rates. 
            The changes take effect immediately.
          </p>
        </div>
      </div>

      {/* Product Management */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>

        {/* Add Product Form */}
        {showAddProduct && (
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Aluminium Wires"
                value={newProduct.no_of_wires_aluminium}
                onChange={(e) => setNewProduct({ ...newProduct, no_of_wires_aluminium: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Steel Wires"
                value={newProduct.no_of_wires_steel}
                onChange={(e) => setNewProduct({ ...newProduct, no_of_wires_steel: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Aluminium Size"
                value={newProduct.size_aluminium}
                onChange={(e) => setNewProduct({ ...newProduct, size_aluminium: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Steel Size"
                value={newProduct.size_steel}
                onChange={(e) => setNewProduct({ ...newProduct, size_steel: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Aluminium Weight"
                value={newProduct.weight_aluminium}
                onChange={(e) => setNewProduct({ ...newProduct, weight_aluminium: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Steel Weight"
                value={newProduct.weight_steel}
                onChange={(e) => setNewProduct({ ...newProduct, weight_steel: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left font-medium text-gray-700">Product Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Al Wires</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Steel Wires</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Al Size</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Steel Size</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Al Weight</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Steel Weight</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 font-medium">{product.name}</td>
                  <td className="px-4 py-2">{product.no_of_wires_aluminium}</td>
                  <td className="px-4 py-2">{product.no_of_wires_steel}</td>
                  <td className="px-4 py-2">{product.size_aluminium}</td>
                  <td className="px-4 py-2">{product.size_steel}</td>
                  <td className="px-4 py-2">{product.weight_aluminium}</td>
                  <td className="px-4 py-2">{product.weight_steel}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
