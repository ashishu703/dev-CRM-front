import React, { useEffect, useState, useMemo } from 'react'
import html2pdf from 'html2pdf.js'
import { Check, X } from 'lucide-react'
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService'
import DynamicTemplateRenderer from '../../components/DynamicTemplateRenderer'
import templateService from '../../services/TemplateService'

export default function PIPreviewModal({
  open,
  onClose,
  piPreviewData,
  selectedBranch,
  companyBranches,
  approvedQuotationId,
  viewingCustomerId,
  onPICreated
}) {
  const [templateHtml, setTemplateHtml] = useState('')
  const [loadingTemplate, setLoadingTemplate] = useState(false)

  const effectiveTemplateKey =
    piPreviewData?.template || piPreviewData?.data?.template || null

  useEffect(() => {
    const loadTemplate = async () => {
      if (!open || !effectiveTemplateKey) {
        setTemplateHtml('')
        return
      }
      setLoadingTemplate(true)
      try {
        const tpl = await templateService.getTemplateByTypeAndKey('pi', effectiveTemplateKey)
        setTemplateHtml(tpl?.html_content || '')
      } catch (err) {
        console.error('Failed to load PI template for preview modal:', err)
        setTemplateHtml('')
      } finally {
        setLoadingTemplate(false)
      }
    }
    loadTemplate()
  }, [open, effectiveTemplateKey])

  const context = useMemo(() => {
    if (!piPreviewData) return {}

    const branchObj =
      (piPreviewData.selectedBranch &&
        companyBranches?.[piPreviewData.selectedBranch]) ||
      (companyBranches ? Object.values(companyBranches)[0] : {}) ||
      {}

    const baseData = piPreviewData.data || piPreviewData

    return {
      ...baseData,
      branch: branchObj,
      billTo: baseData.billTo,
      templateKey: effectiveTemplateKey,
      templateType: 'pi',
    }
  }, [piPreviewData, companyBranches, effectiveTemplateKey])

  if (!open) return null

  const handleSave = async () => {
    try {
      if (approvedQuotationId) {
        const today = new Date().toISOString().split('T')[0]
        const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const shipping = piPreviewData?.shippingDetails || {}
        
        // Create PI with all data in ONE API call (DRY principle)
        // Include adjusted amounts if available (for remaining amount PIs)
        const piDataPayload = {
          piDate: today,
          validUntil,
          status: 'pending',
          // Include dispatch details directly
          dispatchMode: piPreviewData?.dispatchMode || null,
          transportName: shipping.transportName || null,
          vehicleNumber: shipping.vehicleNumber || null,
          transportId: shipping.transportId || null,
          lrNo: shipping.lrNo || null,
          courierName: shipping.courierName || null,
          consignmentNo: shipping.consignmentNo || null,
          byHand: shipping.byHand || null,
          postService: shipping.postService || null,
          carrierName: shipping.carrierName || null,
          carrierNumber: shipping.carrierNumber || null
        }
        
        // If adjusted amounts are available (for remaining amount PIs), send them
        if (piPreviewData?.data) {
          if (piPreviewData.data.subtotal !== undefined) {
            piDataPayload.subtotal = piPreviewData.data.subtotal
          }
          if (piPreviewData.data.taxAmount !== undefined) {
            piDataPayload.taxAmount = piPreviewData.data.taxAmount
          }
          if (piPreviewData.data.total !== undefined) {
            piDataPayload.totalAmount = piPreviewData.data.total
          }
        }
        
        await proformaInvoiceService.createFromQuotation(approvedQuotationId, piDataPayload)
      }

      // Update lead status
      if (viewingCustomerId) {
        const fd = new FormData()
        fd.append('pi_verification_status', 'pending')
        await apiClient.putFormData(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(viewingCustomerId), fd)
      }

      alert('PI created from quotation and sent for approval!')
      onPICreated?.() // Callback to refresh PI list
      onClose?.()
    } catch (e) {
      console.error('PI creation failed:', e)
      alert('Failed to create PI. Please try again.')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const element = document.getElementById('pi-preview-content')
      if (!element) {
        alert('Unable to find PI content for PDF.')
        return
      }

      const convertImageToBase64 = (imgUrl) => {
        return new Promise((resolve) => {
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              canvas.width = img.width
              canvas.height = img.height
              ctx.drawImage(img, 0, 0)
              resolve(canvas.toDataURL('image/png'))
            }
            img.onerror = () => resolve(imgUrl)
            img.src = imgUrl
          } catch (e) {
            resolve(imgUrl)
          }
        })
      }

      const imgs = Array.from(element.querySelectorAll('img'))
      await Promise.all(
        imgs.map(async (img) => {
          if (img && img.src && !img.src.startsWith('data:')) {
            const b64 = await convertImageToBase64(img.src)
            img.setAttribute('src', b64)
          }
        })
      )

      const originalTransform = element.style.transform
      const originalTransformOrigin = element.style.transformOrigin
      const DPI = 96
      const A4_WIDTH_PX = Math.round(8.27 * DPI)
      const A4_HEIGHT_PX = Math.round(11.69 * DPI)
      const marginPxX = Math.round(0.4 * DPI) * 2
      const marginPxY = Math.round(0.4 * DPI) * 2
      const availableWidth = A4_WIDTH_PX - marginPxX
      const availableHeight = A4_HEIGHT_PX - marginPxY
      const contentWidth = Math.max(element.scrollWidth, element.getBoundingClientRect().width)
      const contentHeight = Math.max(element.scrollHeight, element.getBoundingClientRect().height)
      const scaleFactor = Math.min(1, availableWidth / contentWidth, availableHeight / contentHeight)
      if (scaleFactor < 1) {
        element.style.transform = `scale(${scaleFactor})`
        element.style.transformOrigin = 'top left'
      }

      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `PI-${(piPreviewData?.data?.quotationNumber || 'preview')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', compress: true, putOnlyUsedFonts: true },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }
      await html2pdf().set(opt).from(element).save()

      element.style.transform = originalTransform
      element.style.transformOrigin = originalTransformOrigin
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Failed to generate PDF. Please try again, or use the Print button as a fallback.')
    }
  }

  return (
    <div className="fixed inset-0 z-[110] overflow-auto bg-white flex items-center justify-center">
      <div className="w-full h-full flex flex-col">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {/* Show Save button only when creating new PI (approvedQuotationId exists) */}
          {approvedQuotationId && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center gap-2 shadow-lg"
            >
              <Check className="h-4 w-4" />
              Save PI
            </button>
          )}
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="flex justify-center p-4">
            <div className="bg-white max-w-full" style={{width: '100%', maxWidth: '8.5in'}}>
              <div id="pi-preview-content">
                {!loadingTemplate && templateHtml && (
                  <DynamicTemplateRenderer
                    html={templateHtml}
                    data={context}
                    containerId="pi-content"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


