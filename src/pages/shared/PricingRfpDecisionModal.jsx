import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Copy, CheckCircle } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../../utils/globalImports';
import Toast from '../../utils/Toast';
import rfpService from '../../services/RfpService';
import productPriceService from '../../services/ProductPriceService';
import { validateRfpForm } from '../../utils/rfpValidation';
import { filterProductsNeedingRfp, transformProductsArrayForRfp } from '../../utils/rfpHelpers';
import { validateProductsArray } from '../../utils/rfpValidation';
import { getProducts } from '../../constants/products';

/**
 * Pricing & RFP Decision content (used inside customer sidebar RFP tab).
 * Goal: allow SuperAdmin to raise RFP from the same place/flow as salesperson.
 */
export default function PricingRfpDecisionModal({ customer, user, onClose }) {
  const productsCatalog = useMemo(() => getProducts(), []);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef(null);

  const [pricingLoading, setPricingLoading] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);
  const [pricingError, setPricingError] = useState('');
  const [savedRfpId, setSavedRfpId] = useState(null);

  const [rfpValidationErrors, setRfpValidationErrors] = useState({
    products: {},
    deliveryTimeline: '',
    general: ''
  });

  const [rfpForm, setRfpForm] = useState({
    products: [],
    deliveryTimeline: '',
    specialRequirements: ''
  });

  // init catalog once
  useEffect(() => {
    setProducts(productsCatalog);
  }, [productsCatalog]);

  // init form from lead
  useEffect(() => {
    if (!customer) return;

    const rawSpec = String(
      customer?.productName ||
        customer?.product_type ||
        customer?.productType ||
        customer?.productNames ||
        customer?.product_names ||
        ''
    ).trim();

    const productSpec = rawSpec && rawSpec.toLowerCase() !== 'n/a' ? rawSpec : '';

    setSavedRfpId(null);
    setPricingError('');
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' });
    setProductSearch('');
    setShowProductDropdown(false);

    setRfpForm({
      products: productSpec
        ? [
          {
            productSpec,
            quantity: '',
            quantityUnit: 'Mtr',
            targetPrice: '',
            stockStatus: null,
            stockLoading: true,
            approvedPrice: null
          }
        ]
        : [],
      deliveryTimeline: '',
      specialRequirements: ''
    });
  }, [customer?.id]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 150);
    const searchLower = productSearch.toLowerCase();
    return products.filter((p) => (p?.name || '').toLowerCase().includes(searchLower)).slice(0, 80);
  }, [productSearch, products]);

  const isCustomProduct = (productSpec) => {
    return !products.some((p) => String(p?.name || '').toLowerCase() === String(productSpec || '').toLowerCase());
  };

  const checkProductStock = async (productName) => {
    try {
      const stockRes = await apiClient.get(API_ENDPOINTS.STOCK_GET_BY_PRODUCT(productName)).catch(() => null);
      return stockRes?.data || null;
    } catch {
      return null;
    }
  };

  const handleAddProduct = async (productName = null) => {
    const productToAdd = (productName || productSearch || '').trim();
    if (!productToAdd || productToAdd.toLowerCase() === 'n/a') return;

    if (rfpForm.products.some((p) => String(p.productSpec || '').toLowerCase() === productToAdd.toLowerCase())) {
      setProductSearch('');
      setShowProductDropdown(false);
      return;
    }

    const newProduct = {
      productSpec: productToAdd,
      quantity: '',
      quantityUnit: 'Mtr',
      targetPrice: '',
      stockStatus: null,
      stockLoading: true,
      approvedPrice: null
    };

    setRfpForm((prev) => ({ ...prev, products: [...prev.products, newProduct] }));
    setProductSearch('');
    setShowProductDropdown(false);

    try {
      const [stockRes, priceRes] = await Promise.all([
        checkProductStock(productToAdd),
        productPriceService.getApprovedPrice(productToAdd).catch(() => null)
      ]);

      setRfpForm((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.productSpec === productToAdd
            ? { ...p, stockStatus: stockRes, approvedPrice: priceRes?.data || null, stockLoading: false }
            : p
        )
      }));
    } catch {
      setRfpForm((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.productSpec === productToAdd ? { ...p, stockStatus: null, approvedPrice: null, stockLoading: false } : p
        )
      }));
    }
  };

  const handleProductSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProduct();
    } else if (e.key === 'Escape') {
      setShowProductDropdown(false);
    }
  };

  const handleRemoveProduct = (index) => {
    setRfpForm((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
  };

  const handleProductQuantityChange = (index, quantity) => {
    setRfpForm((prev) => ({ ...prev, products: prev.products.map((p, i) => (i === index ? { ...p, quantity } : p)) }));
  };

  const handleProductQuantityUnitChange = (index, quantityUnit) => {
    setRfpForm((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === index ? { ...p, quantityUnit } : p))
    }));
  };

  const handleProductTargetPriceChange = (index, targetPrice) => {
    // keep only integers (matches existing UI behavior)
    const value = targetPrice;
    if (value !== '' && !/^\d+$/.test(String(value))) return;
    setRfpForm((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === index ? { ...p, targetPrice: value } : p))
    }));
  };

  const canSaveDecision = useMemo(() => {
    if (rfpForm.products.length === 0 || savedRfpId) return false;
    return rfpForm.products.every((product) => {
      const isCustom = isCustomProduct(product.productSpec);
      if (isCustom) return false;
      return !!product.approvedPrice;
    });
  }, [rfpForm.products, savedRfpId, products]);

  const canRaiseRfp = useMemo(() => {
    if (rfpForm.products.length === 0) return false;
    return rfpForm.products.some((product) => {
      const isCustom = isCustomProduct(product.productSpec);
      if (isCustom) return true;
      const hasPrice = !!product.approvedPrice;
      return !hasPrice;
    });
  }, [rfpForm.products, products]);

  const validateSaveDecision = () => {
    const errors = { products: {}, deliveryTimeline: '', general: '' };
    let hasErrors = false;

    if (!customer || rfpForm.products.length === 0) {
      errors.general = 'Please add at least one product';
      hasErrors = true;
    }

    // all products should have pricing for Save Decision
    const productsToSave = rfpForm.products.filter((product) => {
      const isCustom = isCustomProduct(product.productSpec);
      if (isCustom) return false;
      return !!product.approvedPrice;
    });

    if (productsToSave.length === 0) {
      errors.general = 'Cannot save decision. No products have approved pricing. Please raise RFP for pricing approval.';
      hasErrors = true;
    }

    // validate each product being saved
    productsToSave.forEach((product) => {
      const index = rfpForm.products.findIndex((p) => p.productSpec === product.productSpec);
      const quantity = String(product.quantity ?? '').trim();
      if (!quantity || parseFloat(quantity) <= 0) {
        errors.products[index] = { ...(errors.products[index] || {}), quantity: 'Quantity is required' };
        hasErrors = true;
      }
      const targetPrice = String(product.targetPrice ?? '').trim();
      if (targetPrice && (parseFloat(targetPrice) <= 0 || Number.isNaN(parseFloat(targetPrice)))) {
        errors.products[index] = { ...(errors.products[index] || {}), targetPrice: 'Target Price must be greater than 0' };
        hasErrors = true;
      }
    });

    const deliveryTimeline = String(rfpForm.deliveryTimeline ?? '').trim();
    if (!deliveryTimeline) {
      errors.deliveryTimeline = 'Delivery Timeline is required';
      hasErrors = true;
    } else {
      const selectedDate = new Date(deliveryTimeline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today || Number.isNaN(selectedDate.getTime())) {
        errors.deliveryTimeline = 'Delivery date cannot be in the past';
        hasErrors = true;
      }
    }

    return { isValid: !hasErrors, errors };
  };

  const handleSaveDecision = async () => {
    setPricingError('');
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' });

    const validation = validateSaveDecision();
    if (!validation.isValid) {
      setPricingError(validation.errors.general || 'Please fill all required fields');
      setRfpValidationErrors(validation.errors);
      return;
    }

    setSavingDecision(true);
    try {
      const productsToSave = rfpForm.products.filter((product) => {
        const isCustom = isCustomProduct(product.productSpec);
        if (isCustom) return false;
        return !!product.approvedPrice;
      });

      const response = await apiClient.post(API_ENDPOINTS.PRICING_RFP_DECISION_CREATE(), {
        leadId: customer.id,
        products: productsToSave.map((p) => ({
          productSpec: p.productSpec,
          quantity: p.quantity || '',
          quantityUnit: p.quantityUnit || 'Mtr',
          targetPrice: p.targetPrice || ''
        })),
        deliveryTimeline: rfpForm.deliveryTimeline,
        specialRequirements: rfpForm.specialRequirements
      });

      if (response?.success && response?.data) {
        setSavedRfpId(response.data.rfp_id);
        Toast.success('Pricing & RFP Decision saved successfully! RFP ID generated.');
        window.dispatchEvent(new CustomEvent('rfpRecordUpdated', { detail: { type: 'saved', rfpId: response.data.rfp_id } }));
      }
    } catch (error) {
      setPricingError(error?.message || 'Failed to save pricing decision');
    } finally {
      setSavingDecision(false);
    }
  };

  const handleCopyRfpId = () => {
    if (!savedRfpId) return;
    navigator.clipboard.writeText(savedRfpId).then(() => {
      Toast.success('RFP ID copied to clipboard!');
    }).catch(() => {
      Toast.error('Failed to copy');
    });
  };

  const handleRaiseRfp = async () => {
    setPricingError('');
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' });

    const hasPrice = (product) => !!product.approvedPrice;

    const validation = validateRfpForm(
      { deliveryTimeline: rfpForm.deliveryTimeline, specialRequirements: rfpForm.specialRequirements },
      rfpForm.products,
      isCustomProduct,
      hasPrice
    );

    if (!validation.isValid) {
      setRfpValidationErrors(validation.errors);
      setPricingError(validation.errors.general || 'Validation failed');
      return;
    }

    setPricingLoading(true);
    try {
      const productsToRaise = filterProductsNeedingRfp(rfpForm.products, isCustomProduct, (p) => !!p.approvedPrice);
      const productsArray = transformProductsArrayForRfp(productsToRaise, isCustomProduct);

      const productsValidation = validateProductsArray(productsArray);
      if (!productsValidation.isValid) {
        setPricingError(productsValidation.error || 'Invalid product set for RFP');
        return;
      }

      await rfpService.create({
        leadId: customer.id,
        products: productsArray,
        deliveryTimeline: rfpForm.deliveryTimeline,
        specialRequirements: rfpForm.specialRequirements || '',
        source: 'pricing_rfp_decision',
        sourcePayload: {
          lead: {
            id: customer?.id,
            name: customer?.name,
            business: customer?.business,
            phone: customer?.phone,
            email: customer?.email
          },
          form: {
            deliveryTimeline: rfpForm.deliveryTimeline,
            specialRequirements: rfpForm.specialRequirements || '',
            allProducts: rfpForm.products || []
          },
          workflowProducts: productsArray || []
        }
      });

      Toast.success('Successfully raised RFP to Department Head. RFP ID will be generated after approval.');
      window.dispatchEvent(new CustomEvent('rfpRecordUpdated', { detail: { type: 'raised' } }));
      window.dispatchEvent(new CustomEvent('rfpUpdated', { detail: { type: 'raised' } }));
      onClose?.();
    } catch (error) {
      setPricingError(error?.data?.message || error?.message || 'Failed to raise RFP');
    } finally {
      setPricingLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <>
      <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold">Pricing &amp; RFP Decision</h2>
          <p className="text-sm text-gray-500">Lead: {customer.name || customer.business || '—'}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/10" title="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(pricingError || rfpValidationErrors.general) && (
          <div className={`px-4 py-3 rounded-lg border bg-rose-50 text-rose-700 border-rose-200`}>
            <p className="font-semibold text-sm mb-1">Validation Errors:</p>
            <p className="text-sm">{pricingError || rfpValidationErrors.general}</p>
            {Object.keys(rfpValidationErrors.products || {}).length > 0 && (
              <p className="text-xs mt-2 opacity-90">Please check the highlighted fields below for specific errors.</p>
            )}
          </div>
        )}

        {/* Product Combobox */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Add Products</label>
          <div className="relative" ref={productDropdownRef}>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onFocus={() => setShowProductDropdown(true)}
                  onKeyDown={handleProductSearchKeyPress}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white border-gray-200"
                  placeholder="Click to see all products or type to search..."
                />

                {showProductDropdown && (
                  <div className="absolute z-50 w-full mt-1 rounded-lg shadow-xl max-h-80 overflow-y-auto bg-white border border-gray-200">
                    {filteredProducts.length > 0 ? (
                      <div className="py-1">
                        {filteredProducts.map((product, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAddProduct(product.name)}
                            className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm"
                          >
                            {product.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 text-sm text-gray-500">No products found. Press Enter to add as custom product.</div>
                    )}
                    {productSearch.trim() && !filteredProducts.some((p) => String(p?.name || '').toLowerCase() === productSearch.toLowerCase()) && (
                      <div className="border-t border-gray-200 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddProduct()}
                          className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm font-medium text-emerald-600"
                        >
                          + Add &quot;{productSearch}&quot; as custom product
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAddProduct()}
                disabled={!productSearch.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        {rfpForm.products.length > 0 && (
          <div className="space-y-3">
            {rfpForm.products.map((product, index) => {
              const inStock =
                product.stockStatus &&
                (product.stockStatus.status === 'available' ||
                  product.stockStatus.status === 'limited' ||
                  Number(product.stockStatus.quantity || 0) > 0);
              const hasPrice = !!product.approvedPrice;
              const needsRfpForProduct = isCustomProduct(product.productSpec) || !hasPrice;

              return (
                <div key={index} className="rounded-xl border bg-gray-50 border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">{product.productSpec}</h4>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        {product.stockLoading ? (
                          <span className="text-gray-500">Checking stock...</span>
                        ) : product.stockStatus ? (
                          <span className={`font-medium ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
                            Stock: {inStock ? 'Available' : 'Not Available'}
                            {product.stockStatus.quantity && ` (${product.stockStatus.quantity} ${product.stockStatus.unit || ''})`}
                          </span>
                        ) : (
                          <span className="font-medium text-orange-600">Stock: Not Found</span>
                        )}
                        {product.approvedPrice ? (
                          <span className="font-medium text-emerald-600">
                            Price: ₹{Number(product.approvedPrice.unit_price || 0).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-medium text-red-600">Price: Not Available</span>
                        )}
                        {needsRfpForProduct && <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="ml-2 px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                            rfpValidationErrors.products?.[index]?.quantity
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'bg-white border-gray-200'
                          }`}
                          placeholder="Quantity *"
                          value={product.quantity}
                          onChange={(e) => handleProductQuantityChange(index, e.target.value)}
                        />
                        <select
                          className="w-32 rounded-lg border px-3 py-2 text-sm bg-white border-gray-200"
                          value={product.quantityUnit || 'Mtr'}
                          onChange={(e) => handleProductQuantityUnitChange(index, e.target.value)}
                        >
                          <option value="Mtr">Meters</option>
                          <option value="Ft">Feet</option>
                          <option value="In">Inches</option>
                          <option value="Yd">Yards</option>
                          <option value="Km">Kilometers</option>
                          <option value="Cm">Centimeters</option>
                          <option value="Mm">Millimeters</option>
                          <option value="Miles">Miles</option>
                          <option value="Kg">Kg</option>
                          <option value="Nos">Nos</option>
                        </select>
                      </div>
                      {rfpValidationErrors.products?.[index]?.quantity && (
                        <p className="mt-1 text-xs text-red-600">{rfpValidationErrors.products[index].quantity}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${
                          rfpValidationErrors.products?.[index]?.targetPrice
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'bg-white border-gray-200'
                        }`}
                        placeholder="Target Price (₹) (optional)"
                        value={product.targetPrice}
                        onChange={(e) => handleProductTargetPriceChange(index, e.target.value)}
                      />
                      {rfpValidationErrors.products?.[index]?.targetPrice && (
                        <p className="mt-1 text-xs text-red-600">{rfpValidationErrors.products[index].targetPrice}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Common Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Delivery Timeline (Required By Date) *</label>
            <input
              type="date"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                rfpValidationErrors.deliveryTimeline
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'bg-white border-gray-200'
              }`}
              value={rfpForm.deliveryTimeline}
              onChange={(e) => {
                const v = e.target.value;
                setRfpForm((prev) => ({ ...prev, deliveryTimeline: v }));
                if (rfpValidationErrors.deliveryTimeline) setRfpValidationErrors((prev) => ({ ...prev, deliveryTimeline: '' }));
              }}
              min={new Date().toISOString().split('T')[0]}
            />
            {rfpValidationErrors.deliveryTimeline && (
              <p className="mt-1 text-xs text-red-600">{rfpValidationErrors.deliveryTimeline}</p>
            )}
          </div>

          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm bg-white border-gray-200"
            rows={3}
            placeholder="Special Requirements"
            value={rfpForm.specialRequirements}
            onChange={(e) => setRfpForm((prev) => ({ ...prev, specialRequirements: e.target.value }))}
          />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0 space-y-3">
        {savedRfpId && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">RFP ID:</p>
                <p className="text-sm font-mono font-bold text-emerald-900">{savedRfpId}</p>
              </div>
              <button
                onClick={handleCopyRfpId}
                className="p-2 rounded-lg hover:bg-emerald-100 transition-colors"
                title="Copy RFP ID"
              >
                <Copy className="h-4 w-4 text-emerald-600" />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSaveDecision}
            disabled={savingDecision || !canSaveDecision}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white ${
              savingDecision || !canSaveDecision ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {savingDecision ? 'Saving...' : savedRfpId ? 'Saved' : 'Save Decision'}
          </button>
          <button
            onClick={handleRaiseRfp}
            disabled={pricingLoading || !canRaiseRfp}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white ${
              pricingLoading || !canRaiseRfp ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {pricingLoading ? 'Raising RFP...' : `Raise RFP${rfpForm.products.length > 1 ? ` (${rfpForm.products.length} products)` : ''}`}
          </button>
        </div>
      </div>
    </>
  );
}

