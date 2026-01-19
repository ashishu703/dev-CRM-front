import React, { useState, useEffect } from 'react';
import RightSidebar from './RightSidebar';

const EditStoreModal = ({ isOpen, onClose, onSubmit, store }) => {
  const [formData, setFormData] = useState({
    storeName: '',
    address1: '',
    address2: '',
    pinCode: '',
    city: '',
    state: '',
    country: 'India',
    storeTypes: {
      inStock: false,
      reject: false
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (store) {
      // Parse address
      const addressParts = store.address.split(', ');
      setFormData({
        storeName: store.storeName || '',
        address1: addressParts[0] || '',
        address2: addressParts[1] || '',
        pinCode: addressParts[2] || '',
        city: addressParts[3] || '',
        state: addressParts[4] || '',
        country: addressParts[5] || 'India',
        storeTypes: {
          inStock: store.storeType === 'In Stock' || store.storeType === 'Both',
          reject: store.storeType === 'Reject' || store.storeType === 'Both'
        }
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (type) => {
    setFormData(prev => ({
      ...prev,
      storeTypes: {
        ...prev.storeTypes,
        [type]: !prev.storeTypes[type]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.storeName.trim()) newErrors.storeName = 'Please enter store name';
    if (!formData.address1.trim()) newErrors.address1 = 'Please enter address line 1';
    if (!formData.city.trim()) newErrors.city = 'Please enter city';
    if (!formData.state) newErrors.state = 'Please select a state';
    if (!formData.storeTypes.inStock && !formData.storeTypes.reject) {
      newErrors.storeTypes = 'Please select at least one store type';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ ...formData, id: store.id });
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
        Update
      </button>
    </div>
  );

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Store"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Store Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="Please enter store name"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.storeName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.storeName && (
            <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
          )}
        </div>

        {/* Store Address 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Address 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            placeholder="Please enter address line 1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.address1 ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address1 && (
            <p className="text-red-500 text-xs mt-1">{errors.address1}</p>
          )}
        </div>

        {/* Store Address 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Address 2
          </label>
          <input
            type="text"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            placeholder="Please enter address line 2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Pin Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pin Code
          </label>
          <input
            type="text"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            placeholder="Please enter Pin Code"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Please enter city"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a state</option>
            {indianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
          </select>
        </div>

        {/* Store Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.storeTypes.inStock}
                onChange={() => handleCheckboxChange('inStock')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">In Stock Store</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.storeTypes.reject}
                onChange={() => handleCheckboxChange('reject')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">Reject Store</span>
            </label>
          </div>
          {errors.storeTypes && (
            <p className="text-red-500 text-xs mt-1">{errors.storeTypes}</p>
          )}
        </div>
      </form>
    </RightSidebar>
  );
};

export default EditStoreModal;

