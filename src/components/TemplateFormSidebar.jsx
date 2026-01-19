import React from 'react';
import { FileText, Save, Loader } from 'lucide-react';
import RightSidebar from './RightSidebar';
import HTMLTemplatePreviewer from './HTMLTemplatePreviewer';

/**
 * Document Template Form Sidebar Component
 * Reusable component following DRY and OOPS principles
 */
const TemplateFormSidebar = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSave,
  onClear,
  saving = false,
  isEditing = false
}) => {
  const handleFieldChange = (field, value) => {
    onFormChange(field, value);
  };

  const handleSave = () => {
    const { templateType, name, templateKey } = formData;
    if (!templateType || !name || !templateKey) {
      return;
    }
    onSave();
  };

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Document Templates</span>
        </div>
      }
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.templateType || !formData.name || !formData.templateKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : isEditing ? 'Update Template' : 'Save Template'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.templateType || 'quotation'}
              onChange={(e) => handleFieldChange('templateType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="quotation">Quotation</option>
              <option value="pi">Proforma Invoice</option>
              <option value="work_order">Work Order</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Classic, Modern, Minimal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.templateKey || ''}
              onChange={(e) => handleFieldChange('templateKey', e.target.value)}
              placeholder="template1, template2, template3..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              This key should match the frontend component mapping for the layout.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Short description for internal reference"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* HTML Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTML Content (optional)
          </label>
          <textarea
            value={formData.htmlContent || ''}
            onChange={(e) => handleFieldChange('htmlContent', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Paste HTML template here if you want a pure-HTML layout."
          />
        </div>

        {/* HTML Preview */}
        {formData.htmlContent && (
          <div>
            <HTMLTemplatePreviewer 
              htmlContent={formData.htmlContent} 
              title="Template Preview"
            />
          </div>
        )}

        {/* Checkboxes */}
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isDefault || false}
              onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Default template for this type</span>
          </label>
          <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Active</span>
          </label>
        </div>
      </div>
    </RightSidebar>
  );
};

export default TemplateFormSidebar;
