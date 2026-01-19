import React, { useState, useEffect } from 'react';
import TemplateService from '../../services/TemplateService';
import workOrderService from '../../services/WorkOrderService';

/**
 * DynamicWorkOrderRenderer Component
 * Renders work orders using templates from document_templates configuration
 */
const DynamicWorkOrderRenderer = ({ workOrderId, workOrderData, templateKey, onClose }) => {
  const [template, setTemplate] = useState(null);
  const [workOrder, setWorkOrder] = useState(workOrderData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch work order if ID is provided
        if (workOrderId && !workOrderData) {
          const response = await workOrderService.getWorkOrderById(workOrderId);
          if (response.success) {
            setWorkOrder(response.data);
          }
        }

        // Fetch template - try both 'Work_order' and 'work_order' for backward compatibility
        let templates = await TemplateService.getTemplatesByType('Work_order');
        if (!templates || templates.length === 0) {
          templates = await TemplateService.getTemplatesByType('work_order');
        }
        if (!templates || templates.length === 0) {
          templates = await TemplateService.getTemplatesByType('Work Order');
        }
        
        let selectedTemplate = null;
        if (templateKey) {
          // Use specified template
          selectedTemplate = templates.find(t => t.template_key === templateKey);
        } else {
          // Use default template
          selectedTemplate = templates.find(t => t.is_default) || templates[0];
        }

        if (!selectedTemplate) {
          throw new Error('No work order template found');
        }

        setTemplate(selectedTemplate);
      } catch (err) {
        console.error('Error loading work order data:', err);
        setError(err.message || 'Failed to load work order');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [workOrderId, workOrderData, templateKey]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a blob and download
    const element = document.getElementById('work-order-content');
    if (!element) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Work Order - ${workOrder?.work_order_number || 'Document'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading work order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!workOrder || !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No work order data available</p>
      </div>
    );
  }

  // Render HTML template - no fallback, template must be configured
  if (!template.html_content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-orange-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Template Content</h2>
          <p className="text-gray-600 mb-4">
            The work order template is configured but has no HTML content.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 text-left">
            <p className="text-sm text-blue-800 font-semibold mb-2">How to fix:</p>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Login as SuperAdmin</li>
              <li>Go to Configuration → Document Templates</li>
              <li>Edit the work order template</li>
              <li>Add HTML content with template variables</li>
              <li>Save and try again</li>
            </ol>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="work-order-container">
      <div className="no-print bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Work Order - {workOrder.work_order_number}</h1>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        id="work-order-content"
        className="max-w-4xl mx-auto p-8 bg-white"
        dangerouslySetInnerHTML={{
          __html: renderTemplate(template.html_content, workOrder)
        }}
      />
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .work-order-container { padding: 0; }
        }
      `}</style>
    </div>
  );
};

/**
 * Render template with work order data
 * Simple template variable replacement
 */
const renderTemplate = (htmlTemplate, workOrder) => {
  let rendered = htmlTemplate;

  // Replace template variables
  const variables = {
    '{{work_order_number}}': workOrder.work_order_number || '',
    '{{quotation_id}}': workOrder.bna_number || workOrder.quotation_id || '',
    '{{date}}': formatDate(workOrder.date),
    '{{delivery_date}}': formatDate(workOrder.delivery_date),
    '{{contact}}': workOrder.contact || '',
    '{{from_company_name}}': workOrder.from_company_name || '',
    '{{from_address}}': workOrder.from_address || '',
    '{{from_email}}': workOrder.from_email || '',
    '{{from_gstin}}': workOrder.from_gstin || '',
    '{{to_company_name}}': workOrder.to_company_name || '',
    '{{to_address}}': workOrder.to_address || '',
    '{{to_email}}': workOrder.to_email || '',
    '{{order_title}}': workOrder.order_title || '',
    '{{order_description}}': workOrder.order_description || '',
    '{{order_quantity}}': workOrder.order_quantity || '',
    '{{order_type}}': workOrder.order_type || '',
    '{{order_length}}': workOrder.order_length || '',
    '{{order_colour}}': workOrder.order_colour || '',
    '{{order_print}}': workOrder.order_print || '',
    '{{order_total}}': formatCurrency(workOrder.order_total),
    '{{unit_rate}}': workOrder.unit_rate || '',
    '{{prepared_by}}': workOrder.prepared_by || '',
    '{{received_by}}': workOrder.received_by || '',
    '{{terms}}': renderTerms(workOrder.terms)
  };

  Object.keys(variables).forEach(key => {
    rendered = rendered.replace(new RegExp(key, 'g'), variables[key]);
  });

  return rendered;
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  if (!amount) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Render terms list
 */
const renderTerms = (terms) => {
  if (!terms) return '';
  
  try {
    const termsList = typeof terms === 'string' ? JSON.parse(terms) : terms;
    if (Array.isArray(termsList)) {
      return '<ul>' + termsList.map(term => `<li>${term}</li>`).join('') + '</ul>';
    }
  } catch (e) {
    console.error('Error rendering terms:', e);
  }
  
  return terms;
};

export default DynamicWorkOrderRenderer;

