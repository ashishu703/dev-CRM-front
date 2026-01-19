import React from 'react';
import { X } from 'lucide-react';

const AssignLeadModal = ({
  isOpen,
  onClose,
  assigningLead,
  selectedLeadIds,
  assignForm,
  onFormChange,
  onAssign,
  usernames,
  loadingUsers,
  usersError
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {assigningLead 
              ? `${(assigningLead.assignedSalesperson || assigningLead.assignedTelecaller) ? 'Reassign' : 'Assign'} Lead - ${assigningLead.customer || assigningLead.name || 'N/A'}` 
              : `Reassign ${selectedLeadIds.length} Selected Leads`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson (username)</label>
            <select
              value={assignForm.salesperson}
              onChange={(e) => onFormChange({ ...assignForm, salesperson: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">{loadingUsers ? 'Loading...' : 'Unassigned'}</option>
              {usersError && <option value="" disabled>{usersError}</option>}
              {usernames.map((name) => (
                <option key={`sp-${name}`} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telecaller (optional)</label>
            <select
              value={assignForm.telecaller}
              onChange={(e) => onFormChange({ ...assignForm, telecaller: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">{loadingUsers ? 'Loading...' : 'Unassigned'}</option>
              {usersError && <option value="" disabled>{usersError}</option>}
              {usernames.map((name) => (
                <option key={`tc-${name}`} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={onAssign}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {assigningLead && (assigningLead.assignedSalesperson || assigningLead.assignedTelecaller) ? 'Reassign' : 'Assign'}
            {!assigningLead && selectedLeadIds.length > 0 ? 'Reassign' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;

