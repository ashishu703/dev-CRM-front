import React, { useState, useEffect } from "react"
import { Calculator, ArrowRight, Sparkles } from "lucide-react"
import AaacCalculator from "./AaacCalculator"
import AcsrCalculator from "./AcsrCalculator"
import AbCableCalculator from "./AbCableCalculator"

export default function CalculatorProductList({ setActiveView }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rfpContext, setRfpContext] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('rfpCalculatorRequest')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || !parsed.family) return
      setRfpContext(parsed)
      if (parsed.family === 'AAAC') {
        setSelectedProduct('aaac')
      } else if (parsed.family === 'ACSR') {
        setSelectedProduct('acsr')
      } else if (parsed.family === 'AB_CABLE') {
        setSelectedProduct('ab_cable')
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  const loadProducts = () => {
    try {
      setLoading(true)
      // Create AAAC and ACSR products
      const aaacProduct = {
        id: 'aaac',
        name: 'All Aluminium Alloy Conductor (AAAC)',
        image: "/images/products/all aluminium alloy conductor.jpeg",
        hsn: '7614',
        defaultUnit: 'KM',
        description: 'Calculate pricing and specifications for all AAAC models and variants'
      }
      
      const acsrProduct = {
        id: 'acsr',
        name: 'Aluminium Conductor Galvanised Steel Reinforced',
        image: "/images/products/Aluminum Conductor Galvanised Steel Reinforced.jpg",
        hsn: '7614',
        defaultUnit: 'KM',
        description: 'Calculate pricing and specifications for all ACSR cable types and variants'
      }

      const abCableProduct = {
        id: 'ab_cable',
        name: 'Aerial Bunched Cable (AB Cable)',
        image: "/images/products/aerial bunch cable.jpeg",
        hsn: '8544',
        defaultUnit: 'KM',
        description: 'Calculate pricing for AB Cable (ISI + COMM variants) using Excel-based formulas'
      }
      
      setProducts([aaacProduct, acsrProduct, abCableProduct])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product) => {
    if (product.id === 'aaac') {
      setSelectedProduct('aaac')
    } else if (product.id === 'acsr') {
      setSelectedProduct('acsr')
    } else if (product.id === 'ab_cable') {
      setSelectedProduct('ab_cable')
    }
  }

  // If calculator is selected, show calculator component
  if (selectedProduct === 'aaac') {
    return (
      <AaacCalculator
        setActiveView={setActiveView}
        onBack={() => setSelectedProduct(null)}
        rfpContext={rfpContext}
      />
    )
  }

  if (selectedProduct === 'acsr') {
    return (
      <AcsrCalculator
        setActiveView={setActiveView}
        onBack={() => setSelectedProduct(null)}
        rfpContext={rfpContext}
      />
    )
  }

  if (selectedProduct === 'ab_cable') {
    return <AbCableCalculator setActiveView={setActiveView} onBack={() => setSelectedProduct(null)} />
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Product Calculator</h1>
        </div>
      </div>

      {/* Product Cards */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-6 justify-start">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group relative w-full sm:w-80 md:w-96"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                {/* Product Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "/images/products/all aluminium alloy conductor.jpeg"
                    }}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-900">Calculator</span>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    {product.hsn && (
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-0.5">HSN Code</span>
                        <span className="text-sm font-semibold text-gray-900">{product.hsn}</span>
                      </div>
                    )}
                    {product.defaultUnit && (
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-0.5">Unit</span>
                        <span className="text-sm font-semibold text-gray-900">{product.defaultUnit}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Calculator className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-900">Open Calculator</span>
                        <span className="block text-xs text-gray-500">All specs included</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
                      <span className="text-xs font-semibold">Calculate</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600">Products will be added soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
