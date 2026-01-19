import React, { useEffect, useState, useMemo } from 'react';
import { X, Download } from 'lucide-react';
import DynamicTemplateRenderer from './DynamicTemplateRenderer';
import templateService from '../services/TemplateService';

const QuotationPreviewModal = ({ isOpen, onClose, quotationData, companyBranches, user, onDownloadPDF }) => {
  const [templateHtml, setTemplateHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const templateKey = quotationData?.template;

  useEffect(() => {
    const loadTemplate = async () => {
      if (!isOpen || !templateKey) {
        setTemplateHtml('');
        return;
      }
      setLoading(true);
      try {
        const tpl = await templateService.getTemplateByTypeAndKey('quotation', templateKey);
        setTemplateHtml(tpl?.html_content || '');
      } catch (err) {
        console.error('Failed to load quotation template for preview modal:', err);
        setTemplateHtml('');
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [isOpen, templateKey]);

  const context = useMemo(() => {
    if (!quotationData) return {};
    const branch =
      (quotationData.selectedBranch &&
        companyBranches?.[quotationData.selectedBranch]) ||
      (companyBranches ? Object.values(companyBranches)[0] : {}) ||
      {};

    return {
      ...quotationData,
      branch,
      billTo: quotationData.billTo,
      user,
      templateKey: quotationData.template,
      templateType: 'quotation',
    };
  }, [quotationData, companyBranches, user]);

  if (!isOpen || !quotationData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Quotation Details - {quotationData.quotationNumber}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {!loading && templateHtml && (
            <DynamicTemplateRenderer
              html={templateHtml}
              data={context}
              containerId="quotation-content"
          />
          )}
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationPreviewModal;

