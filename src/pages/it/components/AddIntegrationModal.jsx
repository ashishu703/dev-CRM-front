import React, { useState } from 'react';
import { X, Link } from 'lucide-react';

const AddIntegrationModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.apiKey && formData.endpoint) {
      onAdd(formData);
      setFormData({
        name: '',
        apiKey: '',
        apiSecret: '',
        endpoint: '',
        description: ''
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      apiKey: '',
      apiSecret: '',
      endpoint: '',
      description: ''
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Add Integration</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Integration Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g., IndiaMART API"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">API Endpoint</label>
            <input
              type="url"
              value={formData.endpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="https://api.example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">API Key</label>
            <input
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">API Secret (Optional)</label>
            <input
              type="password"
              value={formData.apiSecret}
              onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter API secret if required"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
              placeholder="Enter integration description..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Link className="w-4 h-4" />
              Add Integration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIntegrationModal;

