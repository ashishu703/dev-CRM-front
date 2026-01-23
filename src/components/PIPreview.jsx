import React from 'react'
import DynamicTemplateRenderer from './DynamicTemplateRenderer'
import templateService from '../services/TemplateService'
import { PDFDownloader } from '../utils/PDFDownloader'
import Toast from '../utils/Toast'
import { Download, X } from 'lucide-react'
import { withRfpTemplateFields } from '../utils/withRfpTemplateFields'

export default function PIPreview({ piData, companyBranches, user, onClose }) {
  const [templateHtml, setTemplateHtml] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const templateKey = piData?.template || piData?.templateKey
    
    if (!templateKey) {
      Toast.error('PI template key not found. Please ensure PI was created with a template.')
      return
    }
    
    setLoading(true)
    templateService.getTemplateByTypeAndKey('pi', templateKey)
      .then(tpl => {
        setTemplateHtml(tpl?.html_content || '')
      })
      .catch(() => {
        Toast.error('Failed to load PI template')
      })
      .finally(() => setLoading(false))
  }, [piData?.template, piData?.templateKey])

  const handleDownload = async () => {
    try {
      const piNumber = piData.invoiceNumber || piData.piNumber || 'PI'
      const customerName = piData.billTo?.business || 'Customer'
      await PDFDownloader.downloadPI(piNumber, customerName)
      Toast.success('PI PDF downloaded successfully')
    } catch (error) {
      Toast.error('Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading PI template...</span>
          </div>
        </div>
      </div>
    )
  }
  
  if (!templateHtml) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Template Not Found</h3>
            <p className="text-gray-600 mb-4">
              This PI has no template configured or the template could not be loaded.
              Please ensure the PI was created with a valid PI template.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const branch = piData.selectedBranch && companyBranches?.[piData.selectedBranch]
    ? companyBranches[piData.selectedBranch]
    : (companyBranches ? Object.values(companyBranches)[0] : {})

  return (
    <div className="fixed inset-0 z-[120] overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-2 sm:p-4 flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg font-semibold">PI - {piData.billTo?.business || 'Customer'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 self-end sm:self-auto"><X className="h-5 w-5" /></button>
          </div>
          <div id="pi-preview-content">
            <DynamicTemplateRenderer
              html={templateHtml}
              data={withRfpTemplateFields({
                ...piData,
                branch,
                billTo: piData.billTo,
                user,
                templateKey: piData.template,
                templateType: 'pi'
              })}
              containerId="pi-content"
            />
          </div>
        </div>
        <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3">
          <button onClick={onClose} className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50">Close</button>
          <button onClick={handleDownload} className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 border border-transparent rounded shadow-sm hover:bg-green-700 flex items-center justify-center gap-2"><Download className="w-4 h-4" />Download PDF</button>
        </div>
      </div>
    </div>
  )
}
