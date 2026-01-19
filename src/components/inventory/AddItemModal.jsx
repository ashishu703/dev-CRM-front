import React, { useState, useEffect } from 'react';
import RightSidebar from './RightSidebar';
import inventoryService from '../../services/inventoryService';

const AddItemModal = ({ isOpen, onClose, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    itemId: 'RM2',
    itemName: '',
    itemType: '',
    category: '',
    subCategory: '',
    microCategory: '',
    unitOfMetrics: '',
    store: '',
    hsn: '',
    price: '',
    taxType: '',
    tax: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    itemImage: null,
    phaseInInsulation: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, uomsRes, storesRes] = await Promise.all([
        inventoryService.getCategories({ limit: 1000 }),
        inventoryService.getAllUOMs(),
        inventoryService.getStores({ limit: 1000, is_active: true })
      ]);
      
      if (categoriesRes.success) setCategories(categoriesRes.data.data || []);
      if (uomsRes.success) setUoms(uomsRes.data || []);
      if (storesRes.success) setStores(storesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'itemImage') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => {
        const updates = { [name]: value };
        if (name === 'category') {
          updates.subCategory = '';
          updates.microCategory = '';
        } else if (name === 'subCategory') {
          updates.microCategory = '';
        }
        return { ...prev, ...updates };
      });
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validation
    if (!formData.itemName) newErrors.itemName = 'Please enter item name';
    if (!formData.itemType) newErrors.itemType = 'Please select item type';
    if (!formData.unitOfMetrics) newErrors.unitOfMetrics = 'Please choose the UOM';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    
    // Reset form after submission
    setFormData({
      itemId: `RM${Date.now().toString().slice(-3)}`,
      itemName: '',
      itemType: '',
      category: '',
      subCategory: '',
      microCategory: '',
      unitOfMetrics: '',
      store: '',
      hsn: '',
      price: '',
      taxType: '',
      tax: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      itemImage: null,
      phaseInInsulation: '',
      description: ''
    });
    setErrors({});
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
        Submit
      </button>
    </div>
  );

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Add an Item"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item ID <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              className="text-blue-600 text-sm hover:text-blue-700"
            >
              Customize
            </button>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Please enter item name"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.itemName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.itemName && (
            <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
          )}
        </div>

        {/* Item Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {['Buy', 'Sell', 'Both'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="itemType"
                  value={type}
                  checked={formData.itemType === type}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          {errors.itemType && (
            <p className="text-red-500 text-xs mt-1">{errors.itemType}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Please choose the category</option>
            {categories.filter(cat => !cat.parent_id).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub Category
          </label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Please choose the sub category</option>
            {categories.filter(cat => {
              const parentId = parseInt(formData.category);
              return cat.parent_id === parentId || (formData.category && cat.parent_id === parseInt(formData.category));
            }).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Micro Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Micro Category
          </label>
          <select
            name="microCategory"
            value={formData.microCategory}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Please choose the micro category</option>
            {categories.filter(cat => {
              const parentId = parseInt(formData.subCategory);
              return cat.parent_id === parentId || (formData.subCategory && cat.parent_id === parseInt(formData.subCategory));
            }).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Unit of Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit of Metrics <span className="text-red-500">*</span>
          </label>
          <select
            name="unitOfMetrics"
            value={formData.unitOfMetrics}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.unitOfMetrics ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Please choose the UOM</option>
            {uoms.map(uom => (
              <option key={uom.id} value={uom.id}>{uom.code} - {uom.name}</option>
            ))}
          </select>
          {errors.unitOfMetrics && (
            <p className="text-red-500 text-xs mt-1">{errors.unitOfMetrics}</p>
          )}
        </div>

        {/* Store */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store
          </label>
          <select
            name="store"
            value={formData.store}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Please choose store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>

        {/* HSN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HSN (Harmonised System)
          </label>
          <input
            type="text"
            name="hsn"
            value={formData.hsn}
            onChange={handleChange}
            placeholder="Please enter HSN code"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Please enter price"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Tax Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax type
          </label>
          <select
            name="taxType"
            value={formData.taxType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Please choose the tax</option>
            <option value="gst">GST</option>
            <option value="vat">VAT</option>
          </select>
        </div>

        {/* Tax */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax
          </label>
          <select
            name="tax"
            value={formData.tax}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Please select tax</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        {/* Current Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Stock
          </label>
          <input
            type="number"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            placeholder="Please enter current stock"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Min Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Stock
          </label>
          <input
            type="number"
            name="minStock"
            value={formData.minStock}
            onChange={handleChange}
            placeholder="Please enter min stock"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Max Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Stock
          </label>
          <input
            type="number"
            name="maxStock"
            value={formData.maxStock}
            onChange={handleChange}
            placeholder="Please enter max stock"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Item Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Image
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              name="itemImage"
              onChange={handleChange}
              accept="image/*"
              className="hidden"
              id="itemImage"
            />
            <label
              htmlFor="itemImage"
              className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
            >
              Choose File
            </label>
            <span className="text-sm text-gray-500">
              {formData.itemImage ? formData.itemImage.name : 'No file chosen'}
            </span>
          </div>
        </div>

        {/* PHASE IN INSULATION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PHASE IN INSULATION
          </label>
          <input
            type="text"
            name="phaseInInsulation"
            value={formData.phaseInInsulation}
            onChange={handleChange}
            placeholder="Please enter PHASE IN INSULATION"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please enter description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </form>
    </RightSidebar>
  );
};

export default AddItemModal;

