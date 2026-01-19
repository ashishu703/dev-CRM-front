import React, { useEffect, useMemo, useState } from 'react';
import departmentUserService from '../../api/admin_api/departmentUserService';
import { findIndiaStateByName, getIndiaDivisionsForStateIso, getIndiaStates } from '../../utils/indiaLocation';

const TagInput = ({ values, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = inputValue.trim();
      if (!value) return;
      if (!values.includes(value)) onAdd(value);
      setInputValue('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((val, idx) => (
          <span key={`${val}-${idx}`} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs">
            {val}
            <button type="button" className="text-blue-600 hover:text-blue-800" onClick={() => onRemove(idx)}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type and press Enter'}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default function AddCustomerModal({ onClose, onSave, editingCustomer }) {
  const [formData, setFormData] = useState({
    customerName: editingCustomer?.name || '',
    mobileNumber: editingCustomer?.phone || '',
    whatsappNumber: editingCustomer?.whatsapp?.replace('+91', '') || '',
    email: editingCustomer?.email === 'N/A' ? '' : editingCustomer?.email || '',
    gstNumber: editingCustomer?.gstNo === 'N/A' ? '' : editingCustomer?.gstNo || '',
    address: editingCustomer?.address || '',
    state: editingCustomer?.state || '',
    businessType: editingCustomer?.business || '',
    businessCategory: editingCustomer?.category || '',
    leadSource: editingCustomer?.enquiryBy || '',
    assignedSalesperson: editingCustomer?.assigned || '',
    assignedTelecaller: editingCustomer?.telecaller || '',
    productNames: Array.isArray(editingCustomer?.productNames)
      ? editingCustomer.productNames
      : (editingCustomer?.productName ? [editingCustomer.productName] : []),
    date: editingCustomer?.date || '',
    division: editingCustomer?.division || ''
  });

  const indiaStates = useMemo(() => getIndiaStates(), []);
  const [selectedStateIso, setSelectedStateIso] = useState(() => {
    const found = findIndiaStateByName(editingCustomer?.state);
    return found?.isoCode || '';
  });

  const divisionOptions = useMemo(() => {
    return getIndiaDivisionsForStateIso(selectedStateIso);
  }, [selectedStateIso]);

  // Keep selectedStateIso in sync when editingCustomer changes
  useEffect(() => {
    const found = findIndiaStateByName(editingCustomer?.state);
    setSelectedStateIso(found?.isoCode || '');
  }, [editingCustomer?.state]);

  const [usernames, setUsernames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError('');
        const res = await departmentUserService.listUsers({ page: 1, limit: 100 });
        const payload = res.data || res;
        const names = (payload.users || []).map(u => u.username).filter(Boolean);
        setUsernames(names);
      } catch (err) {
        setUsersError(err?.message || 'Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStateSelect = (isoCode) => {
    const stateObj = indiaStates.find((s) => s.isoCode === isoCode);
    const stateName = stateObj?.name || '';
    setSelectedStateIso(isoCode || '');
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      // Reset division if state changes
      division: ''
    }));
  };

  const addProduct = (value) => handleChange('productNames', [...formData.productNames, value]);
  const removeProduct = (index) => {
    const next = formData.productNames.slice();
    next.splice(index, 1);
    handleChange('productNames', next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      // Only close if save was successful (no error thrown)
      onClose();
    } catch (error) {
      // Keep modal open on error so user can see the error and retry
      console.error('Error saving customer:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
            <p className="text-sm text-gray-600">Fill in the customer details below</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input type="text" value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input type="tel" value={formData.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="tel" value={formData.whatsappNumber} onChange={(e) => handleChange('whatsappNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input type="text" value={formData.gstNumber} onChange={(e) => handleChange('gstNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" value={formData.businessType} onChange={(e) => handleChange('businessType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Category</label>
              <input type="text" value={formData.businessCategory} onChange={(e) => handleChange('businessCategory', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
              <input type="text" value={formData.leadSource} onChange={(e) => handleChange('leadSource', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Names (add many)</label>
              <TagInput values={formData.productNames} onAdd={addProduct} onRemove={removeProduct} placeholder="Type a product and press Enter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Salesperson</label>
              <select
                value={formData.assignedSalesperson}
                onChange={(e) => handleChange('assignedSalesperson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{loadingUsers ? 'Loading...' : 'Select username'}</option>
                {usersError && <option value="" disabled>{usersError}</option>}
                {usernames.map(name => (
                  <option key={`sp-${name}`} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Telecaller</label>
              <select
                value={formData.assignedTelecaller}
                onChange={(e) => handleChange('assignedTelecaller', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{loadingUsers ? 'Loading...' : 'Select username'}</option>
                {usersError && <option value="" disabled>{usersError}</option>}
                {usernames.map(name => (
                  <option key={`tc-${name}`} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea rows="3" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={selectedStateIso}
                onChange={(e) => handleStateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select state</option>
                {indiaStates.map((s) => (
                  <option key={`st-${s.isoCode}`} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
              <select
                value={formData.division}
                onChange={(e) => handleChange('division', e.target.value)}
                disabled={!selectedStateIso}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">{selectedStateIso ? 'Select division' : 'Select state first'}</option>
                {divisionOptions.map((d) => (
                  <option key={`dv-${selectedStateIso}-${d.name}`} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}


