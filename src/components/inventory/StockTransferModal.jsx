import React, { useState, useEffect } from 'react';
import RightSidebar from './RightSidebar';
import inventoryService from '../../services/inventoryService';

const StockTransferModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [formData, setFormData] = useState({
    fromStore: '',
    toStore: '',
    quantity: '',
    comment: ''
  });

  const [errors, setErrors] = useState({});
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStores();
      if (item) {
        setFormData(prev => ({
          ...prev,
          fromStore: item.store_id || ''
        }));
      }
    } else {
      setFormData({
        fromStore: '',
        toStore: '',
        quantity: '',
        comment: ''
      });
      setErrors({});
    }
  }, [isOpen, item]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllStores();
      if (response.success) {
        setStores(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fromStore) newErrors.fromStore = 'Please select from store';
    if (!formData.toStore) newErrors.toStore = 'Please select to store';
    if (!formData.quantity) newErrors.quantity = 'Please enter quantity';
    if (formData.fromStore === formData.toStore) {
      newErrors.toStore = 'To store must be different from from store';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      itemId: item.id,
      itemName: item.itemName,
      ...formData
    });
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
      <button
        data-submit-btn
        onClick={handleSubmit}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Transfer
      </button>
    </div>
  );

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Transfer"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Info */}
        {item && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
            <div className="text-xs text-gray-500 mt-1">Item ID: {item.itemId}</div>
            <div className="text-xs text-gray-500">Current Stock: {item.inStock.toFixed(2)} {item.uom}</div>
          </div>
        )}

        {/* From Store */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Store <span className="text-red-500">*</span>
          </label>
          <select
            name="fromStore"
            value={formData.fromStore}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.fromStore ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select from store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          {errors.fromStore && (
            <p className="text-red-500 text-xs mt-1">{errors.fromStore}</p>
          )}
        </div>

        {/* To Store */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Store <span className="text-red-500">*</span>
          </label>
          <select
            name="toStore"
            value={formData.toStore}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.toStore ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select to store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          {errors.toStore && (
            <p className="text-red-500 text-xs mt-1">{errors.toStore}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Enter comment (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </form>
    </RightSidebar>
  );
};

export default StockTransferModal;

