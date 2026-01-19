import React from 'react'
import DynamicTemplateRenderer from './DynamicTemplateRenderer'
import templateService from '../services/TemplateService'
import { PDFDownloader } from '../utils/PDFDownloader'
import Toast from '../utils/Toast'
import { Download, X, Printer } from 'lucide-react'
import { QuotationDataMapper } from '../utils/QuotationDataMapper'

export default function QuotationPreviewTemplate3({ data, companyBranches, user, onClose }) {
  const [templateHtml, setTemplateHtml] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const templateKey = data?.template || data?.templateKey || 'template3'
    console.log('🎨 QuotationPreviewTemplate3 - Loading template with key:', templateKey)
    console.log('📋 QuotationPreviewTemplate3 - Full data:', data)
    
    if (!templateKey) {
      console.error('❌ No template key found in data')
      Toast.error('No template key specified for this quotation')
      return
    }
    
    setLoading(true)
    templateService.getTemplateByTypeAndKey('quotation', templateKey)
      .then(tpl => {
        console.log('✅ Template fetched successfully:', tpl)
        setTemplateHtml(tpl?.html_content || '')
      })
      .catch(e => {
        console.error('❌ Failed to load quotation template:', e)
        Toast.error(`Failed to load quotation template: ${e.message}`)
      })
      .finally(() => setLoading(false))
  }, [data?.template, data?.templateKey])

  const handleDownload = async () => {
    try {
      const customerName = data.billTo?.business || data.customer?.name || 'Customer'
      await PDFDownloader.downloadQuotation(data.quotationNumber, customerName)
      Toast.success('Quotation PDF downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      Toast.error('Failed to download PDF')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const quotationContent = document.getElementById('quotation-preview-content')
    if (quotationContent && printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Quotation - ${data.quotationNumber || 'Draft'}</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            ${quotationContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  if (loading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (!templateHtml) return null

  // Use the centralized QuotationDataMapper to prepare context
  const templateData = QuotationDataMapper.prepareContext(
    data,
    companyBranches,
    user,
    data.template || data.templateKey || 'template3'
  )

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Quotation - {data.billTo?.business || data.customer?.name || 'Customer'}</h3>
            {onClose && (
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"><X className="h-5 w-5" /></button>
            )}
          </div>
          <div id="quotation-preview-content">
            <DynamicTemplateRenderer html={templateHtml} data={templateData} containerId="quotation-preview-content" />
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Quotation #{data.quotationNumber || 'Draft'}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button 
              onClick={handleDownload} 
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            {onClose && (
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

