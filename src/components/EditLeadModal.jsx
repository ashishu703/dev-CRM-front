import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { findIndiaStateByName, getIndiaDivisionsForStateIso, getIndiaStates } from '../utils/indiaLocation';

const EditLeadModal = ({
  isOpen,
  onClose,
  editFormData,
  onFormChange,
  onSave,
  usernames,
  loadingUsers,
  usersError
}) => {
  if (!isOpen) return null;

  const indiaStates = useMemo(() => getIndiaStates(), []);
  const selectedStateIso = useMemo(() => {
    const found = findIndiaStateByName(editFormData?.state);
    return found?.isoCode || '';
  }, [editFormData?.state]);

  const divisionOptions = useMemo(() => {
    return getIndiaDivisionsForStateIso(selectedStateIso);
  }, [selectedStateIso]);

  const handleStateSelect = (isoCode) => {
    const st = indiaStates.find((s) => s.isoCode === isoCode);
    onFormChange({
      ...editFormData,
      state: st?.name || '',
      division: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                value={editFormData.customer}
                onChange={(e) => onFormChange({ ...editFormData, customer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => onFormChange({ ...editFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
              <input
                type="text"
                value={editFormData.business}
                onChange={(e) => onFormChange({ ...editFormData, business: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={editFormData.address}
                onChange={(e) => onFormChange({ ...editFormData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
              <input
                type="text"
                value={editFormData.gstNo}
                onChange={(e) => onFormChange({ ...editFormData, gstNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
              <input
                type="text"
                value={editFormData.leadSource}
                onChange={(e) => onFormChange({ ...editFormData, leadSource: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                value={editFormData.productNames}
                onChange={(e) => onFormChange({ ...editFormData, productNames: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={editFormData.category}
                onChange={(e) => onFormChange({ ...editFormData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Status</label>
              <select
                value={editFormData.salesStatus}
                onChange={(e) => onFormChange({ ...editFormData, salesStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Salesperson</label>
              <select
                value={editFormData.assignedSalesperson}
                onChange={(e) => onFormChange({ ...editFormData, assignedSalesperson: e.target.value })}
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
                value={editFormData.assignedTelecaller}
                onChange={(e) => onFormChange({ ...editFormData, assignedTelecaller: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{loadingUsers ? 'Loading...' : 'Select username'}</option>
                {usersError && <option value="" disabled>{usersError}</option>}
                {usernames.map(name => (
                  <option key={`tc-${name}`} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telecaller Status</label>
              <select
                value={editFormData.telecallerStatus}
                onChange={(e) => onFormChange({ ...editFormData, telecallerStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={editFormData.paymentStatus}
                onChange={(e) => onFormChange({ ...editFormData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => onFormChange({ ...editFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                value={editFormData.division || ''}
                onChange={(e) => onFormChange({ ...editFormData, division: e.target.value })}
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
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeadModal;

