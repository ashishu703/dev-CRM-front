import React, { useState, useEffect, useCallback } from "react"
import { Calculator, ArrowRight, Upload } from "lucide-react"
import AaacCalculator from "./AaacCalculator"
import AcsrCalculator from "./AcsrCalculator"
import AbCableCalculator from "./AbCableCalculator"
import McXlpeArmouredCalculator from "./McXlpeArmouredCalculator"
import * as DhPriceListService from "../../services/DhPriceListService"
import { PRICE_TYPE_LABEL, RATE_TYPE_LABEL } from "../../constants/dhPriceList"
import Toast from "../../utils/Toast"

const formatPrice = (v) => (v != null && Number.isFinite(Number(v))) ? `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function CalculatorProductList({ setActiveView }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rfpContext, setRfpContext] = useState(null)
  const [priceList, setPriceList] = useState([])
  const [priceListLoading, setPriceListLoading] = useState(false)
  const [excelFile, setExcelFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchPriceList = useCallback(async () => {
    setPriceListLoading(true)
    try {
      const res = await DhPriceListService.list()
      setPriceList(Array.isArray(res?.data) ? res.data : [])
    } catch {
      setPriceList([])
    } finally {
      setPriceListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    fetchPriceList()
  }, [fetchPriceList])

  useEffect(() => {
    try {
      const fromRfp = window.sessionStorage.getItem('calculatorFromRfp')
      if (!fromRfp) return
      window.sessionStorage.removeItem('calculatorFromRfp')
      const raw = window.localStorage.getItem('rfpCalculatorRequest')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || !parsed.family) return
      setRfpContext(parsed)
      if (parsed.family === 'AAAC') {
        setSelectedProduct('aaac')
      } else if (parsed.family === 'ACSR') {
        setSelectedProduct('acsr')
      } else       if (parsed.family === 'AB_CABLE') {
        setSelectedProduct('ab_cable')
      } else if (parsed.family === 'MC_XLPE_ARMOURED') {
        setSelectedProduct('mc_xlpe_armoured')
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  const loadProducts = () => {
    try {
      setLoading(true)
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

      const mcXlpeArmouredProduct = {
        id: 'mc_xlpe_armoured',
        name: 'Multi Core XLPE Insulated Aluminium Armoured Cable',
        image: "/images/products/multi core xlpe insulated aluminium armoured cable.jpeg",
        hsn: '8544',
        defaultUnit: 'KM',
        description: '1 Strand MC Armoured Cable (Wire & Strip) – Excel-based formulas, raw material from Account'
      }
      
      setProducts([aaacProduct, acsrProduct, abCableProduct, mcXlpeArmouredProduct])
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
    } else if (product.id === 'mc_xlpe_armoured') {
      setSelectedProduct('mc_xlpe_armoured')
    }
  }

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
    return (
      <AbCableCalculator
        setActiveView={setActiveView}
        onBack={() => setSelectedProduct(null)}
        rfpContext={rfpContext}
      />
    )
  }

  if (selectedProduct === 'mc_xlpe_armoured') {
    return (
      <McXlpeArmouredCalculator
        setActiveView={setActiveView}
        onBack={() => setSelectedProduct(null)}
        rfpContext={rfpContext}
      />
    )
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
    <div className="min-h-full bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {products.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Select product</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/images/products/all aluminium alloy conductor.jpeg"
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Calculator</span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mb-4 line-clamp-2 flex-1 text-xs text-slate-500">{product.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs">
                      {product.hsn && (
                        <>
                          <span className="text-slate-400">HSN Code</span>
                          <span className="font-medium text-slate-700">{product.hsn}</span>
                        </>
                      )}
                      {product.defaultUnit && (
                        <>
                          <span className="text-slate-400">Unit</span>
                          <span className="font-medium text-slate-700">{product.defaultUnit}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">All specs included</span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white group-hover:bg-blue-700">
                        Calculate <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">Price list (Excel)</h2>
              <p className="mt-1 text-sm text-slate-500">
                Product Name, Price Type (ISI/Commercial), Rate Type (Rate/Mtr, Rate/Kg), Price, Price Date — all optional.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => DhPriceListService.downloadTemplate().then(() => Toast.success('Template downloaded'))}
                  className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Download Template
                </button>
                <label className="inline-flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-100">
                  <Upload className="h-4 w-4" />
                  {excelFile ? (excelFile.name.length > 18 ? excelFile.name.slice(0, 15) + '…' : excelFile.name) : 'Choose Excel'}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  disabled={!excelFile || uploading}
                  onClick={async () => {
                    if (!excelFile) return
                    setUploading(true)
                    try {
                      const res = await DhPriceListService.upload(excelFile)
                      setPriceList(Array.isArray(res?.data) ? res.data : [])
                      setExcelFile(null)
                      const input = document.querySelector('input[type="file"][accept=".xlsx,.xls"]')
                      if (input) input.value = ''
                      Toast.success(`Applied ${res?.applied ?? 0} row(s)`)
                    } catch (e) {
                      Toast.error(e?.message || 'Upload failed')
                    } finally {
                      setUploading(false)
                    }
                  }}
                  className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading…' : 'Upload & Apply'}
                </button>
              </div>
            </div>
            <div className="overflow-hidden border-t border-slate-200">
              {(() => {
                if (priceListLoading) return <div className="px-6 py-12 text-center text-sm text-slate-500">Loading…</div>
                if (priceList.length === 0) return <div className="px-6 py-12 text-center text-sm text-slate-500">No rows. Upload Excel to see daily prices.</div>
                return (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Price Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Rate Type</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {priceList.slice(0, 100).map((row, i) => (
                            <tr key={row.id || i} className="hover:bg-slate-50/50">
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800">{row.product_spec ?? '—'}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{PRICE_TYPE_LABEL(row.price_type)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{RATE_TYPE_LABEL(row.rate_type)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-slate-800">{formatPrice(row.price)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatDate(row.price_date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {priceList.length > 100 && (
                      <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">Showing first 100 of {priceList.length}</div>
                    )}
                  </>
                )
              })()}
            </div>
          </section>
        )}

        {products.length === 0 && !loading && (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Calculator className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No products available</h3>
              <p className="mt-1 text-sm text-slate-500">Products will be added soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
