import React from 'react'
import DynamicTemplateRenderer from './DynamicTemplateRenderer'
import templateService from '../services/TemplateService'
import { PDFDownloader } from '../utils/PDFDownloader'
import Toast from '../utils/Toast'
import { Download, X, Printer } from 'lucide-react'
import { QuotationDataMapper } from '../utils/QuotationDataMapper'

export default function QuotationPreview({ quotationData, companyBranches, user, onClose }) {
  const [templateHtml, setTemplateHtml] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const templateKey = quotationData?.template || quotationData?.templateKey
    console.log('🎨 QuotationPreview - Loading template with key:', templateKey)
    console.log('📋 QuotationPreview - Full quotationData:', quotationData)
    
    if (!templateKey) {
      console.error('❌ No template key found in quotationData')
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
  }, [quotationData?.template, quotationData?.templateKey])

  const handleDownload = async () => {
    try {
      const customerName = quotationData.billTo?.business || quotationData.customer?.name || 'Customer'
      await PDFDownloader.downloadQuotation(quotationData.quotationNumber, customerName)
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
            <title>Quotation - ${quotationData.quotationNumber || 'Draft'}</title>
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
  // This ensures consistent data mapping across create/edit/view modes
  const templateData = QuotationDataMapper.prepareContext(
    quotationData,
    companyBranches,
    user,
    quotationData.template || quotationData.templateKey
  )

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="p-2 sm:p-4 flex-1 overflow-y-auto overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Quotation - {quotationData.billTo?.business || quotationData.customer?.name || 'Customer'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 self-end sm:self-auto"><X className="h-5 w-5" /></button>
          </div>
          <div id="quotation-preview-content">
            <DynamicTemplateRenderer html={templateHtml} data={templateData} containerId="quotation-preview-content" />
          </div>
        </div>
        <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-600">
            Quotation #{quotationData.quotationNumber || 'Draft'}
          </div>
          <div className="flex gap-2 sm:gap-3">
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
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
