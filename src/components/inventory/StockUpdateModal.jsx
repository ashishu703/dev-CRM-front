import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Download, Upload, Minus } from 'lucide-react';
import inventoryService from '../../services/inventoryService';

const StockUpdateModal = ({ isOpen, onClose, onSubmit }) => {
  const [stockEntries, setStockEntries] = useState([
    {
      id: 1,
      item: '',
      store: '',
      quantity: '',
      price: '',
      uom: '',
      comment: '',
      action: 'add'
    }
  ]);

  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([]);
  const [stores, setStores] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
    }
  }, [isOpen]);

  const fetchDropdowns = async () => {
    try {
      setLoading(true);
      const [itemsRes, storesRes, uomRes] = await Promise.all([
        inventoryService.getItems({ limit: 1000 }),
        inventoryService.getStores({ limit: 1000 }),
        inventoryService.getAllUOMs()
      ]);

      if (itemsRes.success) {
        const mappedItems = (itemsRes.data?.data || []).map(it => ({
          id: it.id,
          label: `${it.item_id} - ${it.item_name}`
        }));
        setItems(mappedItems);
      }

      if (storesRes.success) {
        const mappedStores = (storesRes.data?.data || []).map(st => ({
          id: st.id,
          label: st.name
        }));
        setStores(mappedStores);
      }

      if (uomRes.success) {
        const mappedUoms = (uomRes.data || []).map(u => ({
          id: u.id,
          label: `${u.code} - ${u.name}`
        }));
        setUoms(mappedUoms);
      }
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
      alert('Failed to load data for stock update');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setStockEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
    // Clear error
    if (errors[`${id}-${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    }
  };

  const addRow = () => {
    setStockEntries(prev => [
      ...prev,
      {
        id: Date.now(),
        item: '',
        store: '',
        quantity: '',
        price: '',
        uom: '',
        comment: '',
        action: 'add'
      }
    ]);
  };

  const removeRow = (id) => {
    if (stockEntries.length > 1) {
      setStockEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    stockEntries.forEach((entry) => {
      if (!entry.item) newErrors[`${entry.id}-item`] = 'Please select an item';
      if (!entry.store) newErrors[`${entry.id}-store`] = 'Please select a from store';
      if (!entry.quantity) newErrors[`${entry.id}-quantity`] = 'Please enter quantity';
      if (!entry.uom) newErrors[`${entry.id}-uom`] = 'Please select a unit of measurement';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = stockEntries.map(entry => ({
        item_id: parseInt(entry.item),
        store_id: parseInt(entry.store),
        quantity: parseFloat(entry.quantity),
        update_type: entry.action === 'reduce' ? 'Reduce' : 'Add',
        comment: entry.comment || null,
        uom_id: parseInt(entry.uom) || null,
        price: entry.price ? parseFloat(entry.price) : null
      }));
      await onSubmit(payload);
      setStockEntries([{
        id: 1,
        item: '',
        store: '',
        quantity: '',
        price: '',
        uom: '',
        comment: '',
        action: 'add'
      }]);
      onClose();
    } catch (error) {
      console.error('Error submitting stock update:', error);
      alert(error.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Right Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[800px] lg:w-[900px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Stock Update</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Template Links */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Download template functionality
                console.log('Download template');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
            <button
              onClick={() => {
                // Upload template functionality
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls,.csv';
                input.onchange = (e) => {
                  console.log('Upload template:', e.target.files[0]);
                };
                input.click();
              }}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Upload Template
            </button>
          </div>
        </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {stockEntries.map((entry, index) => (
                <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                    {/* Item */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        * Item
                      </label>
                      <select
                        value={entry.item}
                        onChange={(e) => handleChange(entry.id, 'item', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors[`${entry.id}-item`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading || submitting}
                      >
                        <option value="">Select item</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                      {errors[`${entry.id}-item`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${entry.id}-item`]}</p>
                      )}
                    </div>

                    {/* Store */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        * Store
                      </label>
                      <select
                        value={entry.store}
                        onChange={(e) => handleChange(entry.id, 'store', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors[`${entry.id}-store`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading || submitting}
                      >
                        <option value="">Select store</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.id}>{store.label}</option>
                        ))}
                      </select>
                      {errors[`${entry.id}-store`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${entry.id}-store`]}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        * Quantity
                      </label>
                      <input
                        type="number"
                        value={entry.quantity}
                        onChange={(e) => handleChange(entry.id, 'quantity', e.target.value)}
                        placeholder="Qua..."
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors[`${entry.id}-quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading || submitting}
                      />
                      {errors[`${entry.id}-quantity`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${entry.id}-quantity`]}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        * Price
                      </label>
                      <input
                        type="number"
                        value={entry.price}
                        onChange={(e) => handleChange(entry.id, 'price', e.target.value)}
                        placeholder="Enter price"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors[`${entry.id}-price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading || submitting}
                      />
                      {errors[`${entry.id}-price`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${entry.id}-price`]}</p>
                      )}
                    </div>

                    {/* UOM */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        * UOM
                      </label>
                      <select
                        value={entry.uom}
                        onChange={(e) => handleChange(entry.id, 'uom', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors[`${entry.id}-uom`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading || submitting}
                      >
                        <option value="">Select UOM</option>
                        {uoms.map(uom => (
                          <option key={uom.id} value={uom.id}>{uom.label}</option>
                        ))}
                      </select>
                      {errors[`${entry.id}-uom`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`${entry.id}-uom`]}</p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comment
                      </label>
                      <input
                        type="text"
                        value={entry.comment}
                        onChange={(e) => handleChange(entry.id, 'comment', e.target.value)}
                        placeholder="Write c..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        disabled={loading || submitting}
                      />
                    </div>

                    {/* Action */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange(entry.id, 'action', 'add')}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors border ${
                            entry.action === 'add'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                          disabled={loading || submitting}
                          title="Add"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange(entry.id, 'action', 'reduce')}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors border ${
                            entry.action === 'reduce'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                          disabled={loading || submitting}
                          title="Reduce"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  {/* Row Action */}
                  <div className="flex items-end">
                    {index === stockEntries.length - 1 ? (
                      // Last row - show Add button
                      <button
                        onClick={addRow}
                        className="w-10 h-10 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-gray-300"
                        disabled={loading || submitting}
                        title="Add row"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      // Not last row - show Remove button
                      <button
                        onClick={() => removeRow(entry.id)}
                        className="w-10 h-10 flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-gray-300"
                        disabled={loading || submitting}
                        title="Remove row"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StockUpdateModal;

