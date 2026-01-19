import React, { useState } from 'react';
import { Mail, Save, Loader, Upload, Code, Eye } from 'lucide-react';
import RightSidebar from './RightSidebar';
import HTMLTemplatePreviewer from './HTMLTemplatePreviewer';

/**
 * Email Template Form Sidebar Component
 * Reusable component following DRY and OOPS principles
 */
const EmailTemplateFormSidebar = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSave,
  onCancel,
  saving = false
}) => {
  const handleFieldChange = (field, value) => {
    onFormChange(field, value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleFieldChange('htmlContent', e.target.result);
        handleFieldChange('content', file);
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.htmlContent) {
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
          <Mail className="w-5 h-5 text-blue-600" />
          <span>Email Templates</span>
        </div>
      }
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.subject || !formData.htmlContent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter template name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject || ''}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            placeholder="Enter email subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template For <span className="text-red-500">*</span>
            <span className="ml-2 w-4 h-4 bg-gray-300 rounded-full inline-flex items-center justify-center text-xs text-gray-600 cursor-help">
              ?
            </span>
          </label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Short description of the template"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* HTML Content Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Content <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.htmlContent ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  HTML file loaded. You can edit the content below.
                </div>
                <button
                  onClick={() => document.getElementById('email-file-upload').click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>Replace HTML File</span>
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">No HTML file uploaded yet</p>
                <button
                  onClick={() => document.getElementById('email-file-upload').click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>Select HTML File</span>
                </button>
              </>
            )}
            <input
              id="email-file-upload"
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* HTML Content Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTML Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.htmlContent || ''}
            onChange={(e) => handleFieldChange('htmlContent', e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Paste or type HTML template content here..."
          />
        </div>

        {/* HTML Preview */}
        {formData.htmlContent && (
          <div>
            <HTMLTemplatePreviewer 
              htmlContent={formData.htmlContent} 
              title="Email Template Preview"
            />
          </div>
        )}
      </div>
    </RightSidebar>
  );
};

export default EmailTemplateFormSidebar;
