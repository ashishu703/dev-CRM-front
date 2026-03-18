import React, { useEffect, useMemo, useState } from 'react';
import { X, Pencil } from 'lucide-react';
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

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleStateSelect = (isoCode) => {
    const st = indiaStates.find((s) => s.isoCode === isoCode);
    onFormChange({
      ...editFormData,
      state: st?.name || '',
      division: ''
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[120] flex flex-col overflow-hidden transform transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Pencil className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">Edit Lead</h2>
                <p className="text-sm text-gray-600 mt-0.5 truncate">Update lead/customer details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-lg transition-colors text-gray-500 hover:text-gray-700 flex-shrink-0"
              aria-label="Close"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
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
        </div>

        <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditLeadModal;

