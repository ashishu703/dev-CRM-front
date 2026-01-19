import html2pdf from 'html2pdf.js'

export class PDFDownloader {
  static defaultOptions = {
    margin: [0.4, 0.4, 0.4, 0.4], // Fixed margins: top, right, bottom, left (in inches)
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2, 
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement('style');
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * {
            font-family: 'Inter', 'Arial', 'Helvetica', sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            box-sizing: border-box !important;
          }
          /* Remove all height constraints that might clip text */
          * {
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
          }
          /* Ensure content stays within bounds - no horizontal overflow */
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            overflow-y: visible !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
          }
          /* Container constraints - content must stay within margins */
          #pi-preview-content, #quotation-preview-content, #pi-content {
            box-sizing: border-box !important;
            overflow-x: hidden !important;
            overflow-y: visible !important;
            max-width: 100% !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            height: auto !important;
            min-height: auto !important;
            padding-bottom: 30px !important;
            margin-bottom: 20px !important;
          }
          /* Prevent horizontal overflow but allow vertical flow for text */
          * {
            max-width: 100% !important;
            overflow-x: hidden !important;
            overflow-y: visible !important;
          }
          /* All divs and containers must allow content to expand */
          div {
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
            overflow: visible !important;
            overflow-y: visible !important;
          }
          /* Text elements - ensure overflow visible and prevent top clipping */
          p, div, span, li, label, input, textarea, h1, h2, h3, h4, h5, h6 {
            overflow: visible !important;
            overflow-y: visible !important;
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
            line-height: 1.4 !important;
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          /* Bold text needs extra padding to prevent top clipping */
          b, strong, .font-bold, [style*="font-weight: bold"], [style*="font-weight: 700"], [style*="font-weight: 600"] {
            padding-top: 6px !important;
            padding-bottom: 4px !important;
            line-height: 1.4 !important;
            overflow: visible !important;
          }
          /* Tables should respect container width */
          table, .table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
            page-break-inside: auto !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            height: auto !important;
          }
          /* Table cells - ensure overflow visible and prevent top clipping */
          td, th {
            overflow: visible !important;
            vertical-align: top !important;
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            box-sizing: border-box !important;
            line-height: 1.4 !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
          /* Table rows should expand naturally - avoid breaking at page end */
          tr {
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          /* Prevent text from being cut at page bottom */
          p, div, span, td, th, li, label {
            page-break-inside: avoid !important;
            orphans: 3 !important;
            widows: 3 !important;
          }
          /* Images should not exceed container */
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          /* Only prevent page breaks for specific elements that should stay together */
          .no-break, [class*="no-break"] {
            page-break-inside: avoid !important;
          }
          thead tr, .table thead tr {
            page-break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
        
        // Remove height constraints from all elements - preserve original appearance
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          // Remove fixed heights that might clip text
          if (el.style.height && el.style.height !== 'auto') {
            el.style.height = 'auto';
          }
          if (el.style.maxHeight && el.style.maxHeight !== 'none') {
            el.style.maxHeight = 'none';
          }
          // Ensure overflow is visible for all text elements
          if (el.tagName === 'DIV' || el.tagName === 'P' || el.tagName === 'SPAN' || el.tagName === 'TD' || el.tagName === 'TH') {
            el.style.overflow = 'visible';
            el.style.overflowY = 'visible';
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
            
            // Table cells - ensure proper line-height and padding to prevent top clipping
            if (el.tagName === 'TD' || el.tagName === 'TH') {
              el.style.verticalAlign = 'top';
              el.style.boxSizing = 'border-box';
              el.style.lineHeight = '1.4';
              el.style.paddingTop = '8px';
              el.style.paddingBottom = '8px';
            }
            // Bold text elements - extra padding for top clipping
            else if (el.tagName === 'B' || el.tagName === 'STRONG' || 
                     window.getComputedStyle(el).fontWeight >= '600' ||
                     el.classList.contains('font-bold')) {
              el.style.lineHeight = '1.4';
              el.style.paddingTop = '6px';
              el.style.paddingBottom = '4px';
              el.style.overflow = 'visible';
            }
            // Text elements - add padding to prevent top clipping
            else if (el.tagName === 'P' || el.tagName === 'DIV' || el.tagName === 'SPAN' || el.tagName === 'LABEL') {
              el.style.lineHeight = '1.4';
              el.style.paddingTop = '4px';
              el.style.paddingBottom = '4px';
            }
            // For all elements - preserve original styles, just ensure overflow visible
          }
        });
        
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (!img.complete) {
            img.style.display = 'none';
          }
        });
      }
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      putOnlyUsedFonts: false,
      precision: 16
    },
    pagebreak: { 
      mode: ['css', 'legacy'], // Allow natural page breaks for multi-page support
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.no-break'] // Only avoid specific no-break elements
    }
  }

  static async download(elementId, filename, options = {}) {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Store original styles
    const originalDisplay = element.style.display
    const originalVisibility = element.style.visibility
    const originalTransform = element.style.transform
    const originalTransformOrigin = element.style.transformOrigin
    const originalWidth = element.style.width
    const originalMaxWidth = element.style.maxWidth
    
    // Make element visible for measurement
    element.style.display = 'block'
    element.style.visibility = 'visible'
    
    // Calculate A4 dimensions in pixels (at 96 DPI)
    const DPI = 96
    const A4_WIDTH_IN = 8.27 // A4 width in inches
    const A4_WIDTH_PX = Math.round(A4_WIDTH_IN * DPI) // ~794px
    
    // Get margins - ensure equal margins on all sides
    const margins = options.margin || this.defaultOptions.margin || [0.4, 0.4, 0.4, 0.4]
    const marginLeft = Math.round(margins[3] * DPI)
    const marginRight = Math.round(margins[1] * DPI)
    const marginTop = Math.round(margins[0] * DPI)
    const marginBottom = Math.round(margins[2] * DPI)
    
    // Calculate available width for content (A4 width minus left and right margins)
    // Account for borders by using box-sizing: border-box
    // Subtract 2px to ensure borders don't overflow (border width typically 1-2px)
    const availableWidth = A4_WIDTH_PX - marginLeft - marginRight - 2
    
    // Set content width to A4 available width (no scaling, let it flow to multiple pages)
    // Ensure content stays within fixed margins - no border crossing
    // Use border-box to include borders in width calculation
    element.style.width = `${availableWidth}px`
    element.style.maxWidth = `${availableWidth}px`
    element.style.minWidth = `${availableWidth}px`
    element.style.transform = 'none'
    element.style.transformOrigin = 'top left'
    element.style.boxSizing = 'border-box'
    element.style.overflowX = 'hidden' // Prevent horizontal overflow
    element.style.overflowY = 'visible' // Allow vertical flow for multi-page
    element.style.wordWrap = 'break-word'
    element.style.overflowWrap = 'break-word'
    element.style.padding = '0'
    element.style.paddingBottom = '30px' // Add bottom padding to prevent text cutting at page end
    element.style.margin = '0'
    element.style.marginBottom = '20px' // Extra margin to prevent cutting
    
    // Ensure all child elements also use border-box and respect width
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      el.style.boxSizing = 'border-box'
      el.style.maxWidth = '100%'
      // Ensure fixed width elements don't exceed container
      if (el.style.width && el.style.width !== 'auto' && !el.style.width.includes('%')) {
        const currentWidth = parseFloat(el.style.width)
        if (currentWidth > availableWidth) {
          el.style.maxWidth = `${availableWidth}px`
          el.style.width = '100%'
        }
      }
      // Ensure tables don't exceed container
      if (el.tagName === 'TABLE') {
        el.style.width = '100%'
        el.style.maxWidth = '100%'
        el.style.boxSizing = 'border-box'
      }
    })
    
    // Ensure all child elements respect container width but allow text to render fully
    const allChildren = element.querySelectorAll('*')
    allChildren.forEach(child => {
      // Remove all height constraints
      child.style.height = 'auto'
      child.style.maxHeight = 'none'
      child.style.minHeight = 'auto'
      
      if (child.tagName !== 'TABLE' && child.tagName !== 'IMG') {
        child.style.maxWidth = '100%'
        child.style.boxSizing = 'border-box'
        // Allow text elements to overflow vertically to prevent clipping
        if (['P', 'DIV', 'SPAN', 'TD', 'TH', 'LI', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(child.tagName)) {
          child.style.overflow = 'visible'
          child.style.overflowX = 'hidden'
          child.style.overflowY = 'visible'
          child.style.height = 'auto'
          child.style.maxHeight = 'none'
          
          // Table cells - ensure proper line-height and padding to prevent top clipping
          if (child.tagName === 'TD' || child.tagName === 'TH') {
            child.style.paddingTop = '8px'
            child.style.paddingBottom = '8px'
            child.style.lineHeight = '1.4'
            child.style.verticalAlign = 'top'
            child.style.whiteSpace = 'normal'
            child.style.boxSizing = 'border-box'
          }
          // Bold text elements - extra padding for top clipping
          else if (child.tagName === 'B' || child.tagName === 'STRONG' || 
                   child.classList.contains('font-bold') ||
                   window.getComputedStyle(child).fontWeight >= '600') {
            child.style.lineHeight = '1.4'
            child.style.paddingTop = '6px'
            child.style.paddingBottom = '4px'
            child.style.overflow = 'visible'
          }
          // Text elements - ensure line-height and padding to prevent top clipping
          else if (['P', 'DIV', 'SPAN', 'LI', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(child.tagName)) {
            child.style.lineHeight = '1.4'
            child.style.paddingTop = '4px'
            child.style.paddingBottom = '4px'
          }
          // For all elements - preserve original styles, just ensure overflow visible
        }
      }
    })
    
    // Wait for layout to update - longer wait to ensure all styles are applied
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Force a reflow to ensure all styles are calculated
    element.offsetHeight
    
    // Get actual content dimensions - use multiple methods to ensure full capture
    const scrollHeight = element.scrollHeight
    const offsetHeight = element.offsetHeight
    const boundingRect = element.getBoundingClientRect()
    const boundingHeight = boundingRect.height
    const clientHeight = element.clientHeight
    
    // Use the maximum of all height measurements to ensure full content is captured
    // Add minimal buffer to ensure text is fully visible without creating blank pages
    const contentWidth = availableWidth
    const baseHeight = Math.max(scrollHeight, offsetHeight, boundingHeight, clientHeight)
    // Use actual height with minimal buffer to avoid blank pages
    const contentHeight = baseHeight + 30 // Minimal buffer (20px for text + 10px safety)
    
    const opt = {
      ...this.defaultOptions,
      filename,
      margin: margins,
      html2canvas: {
        ...this.defaultOptions.html2canvas,
        scale: 2, // High scale for quality
        width: contentWidth,
        height: contentHeight > 20000 ? undefined : contentHeight, // Don't set if too large to avoid blank pages
        windowWidth: contentWidth,
        windowHeight: contentHeight > 20000 ? undefined : contentHeight, // Don't set if too large
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false, // Keep container for proper rendering
        foreignObjectRendering: false, // Better text rendering
        imageTimeout: 0, // No timeout for images
        onclone: (clonedDoc) => {
          // Apply default styles first
          const defaultOnClone = this.defaultOptions.html2canvas.onclone
          if (defaultOnClone) {
            defaultOnClone(clonedDoc)
          }
          
          // Inject CSS to prevent right border overflow and bottom text cutting
          const style = clonedDoc.createElement('style');
          const elementSelector = `#${elementId}`;
          style.textContent = `
            ${elementSelector}, ${elementSelector} * {
              box-sizing: border-box !important;
              max-width: 100% !important;
            }
            ${elementSelector} {
              width: ${contentWidth}px !important;
              max-width: ${contentWidth}px !important;
              overflow-x: hidden !important;
              padding-bottom: 30px !important;
              margin-bottom: 20px !important;
              box-sizing: border-box !important;
              border: none !important;
            }
            /* Ensure all borders are within container */
            ${elementSelector} * {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            /* Ensure tables and containers stretch to borders */
            table, .table {
              width: 100% !important;
              max-width: 100% !important;
              table-layout: auto !important;
              box-sizing: border-box !important;
            }
            td, th {
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              box-sizing: border-box !important;
            }
            /* Prevent text from being cut at page bottom */
            p, div, span, td, th, li, label {
              page-break-inside: avoid !important;
              orphans: 3 !important;
              widows: 3 !important;
            }
            tr {
              page-break-inside: avoid !important;
              page-break-after: auto !important;
            }
            table {
              page-break-inside: avoid !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Ensure all text elements are fully visible - don't modify appearance
          const mainElement = clonedDoc.getElementById(elementId);
          if (mainElement) {
            mainElement.style.width = `${contentWidth}px`;
            mainElement.style.maxWidth = `${contentWidth}px`;
            mainElement.style.overflowX = 'hidden';
            mainElement.style.boxSizing = 'border-box';
          }
          
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach(el => {
            try {
              // Ensure box-sizing for all elements
              el.style.boxSizing = 'border-box';
              
              // Remove all height constraints that might clip text
              el.style.height = 'auto'
              el.style.maxHeight = 'none'
              el.style.minHeight = 'auto'
              
              // For all text-containing elements - just ensure overflow visible
              if (['P', 'DIV', 'SPAN', 'TD', 'TH', 'LI', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
                // Ensure text can overflow vertically - preserve all other styles
                el.style.overflow = 'visible'
                el.style.overflowX = 'hidden'
                el.style.overflowY = 'visible'
                el.style.height = 'auto'
                el.style.maxHeight = 'none'
                
                // Table cells - ensure proper line-height and padding to prevent top clipping
                if (el.tagName === 'TD' || el.tagName === 'TH') {
                  el.style.verticalAlign = 'top'
                  el.style.whiteSpace = 'normal'
                  el.style.wordWrap = 'break-word'
                  el.style.boxSizing = 'border-box'
                  el.style.lineHeight = '1.4'
                  el.style.paddingTop = '8px'
                  el.style.paddingBottom = '8px'
                }
                // Bold text elements - extra padding for top clipping
                else if (el.tagName === 'B' || el.tagName === 'STRONG' || 
                         window.getComputedStyle(el).fontWeight >= '600' ||
                         el.classList.contains('font-bold')) {
                  el.style.lineHeight = '1.4'
                  el.style.paddingTop = '6px'
                  el.style.paddingBottom = '4px'
                  el.style.overflow = 'visible'
                }
                // Text elements - ensure line-height and padding to prevent top clipping
                else {
                  el.style.lineHeight = '1.4'
                  el.style.paddingTop = '4px'
                  el.style.paddingBottom = '4px'
                }
              }
            } catch (e) {
              // Fallback - ensure line-height and padding to prevent clipping
              if (el.tagName === 'TD' || el.tagName === 'TH') {
                el.style.overflow = 'visible'
                el.style.height = 'auto'
                el.style.maxHeight = 'none'
                el.style.verticalAlign = 'top'
                el.style.boxSizing = 'border-box'
                el.style.lineHeight = '1.4'
                el.style.paddingTop = '8px'
                el.style.paddingBottom = '8px'
              } else if (el.tagName === 'B' || el.tagName === 'STRONG') {
                el.style.overflow = 'visible'
                el.style.height = 'auto'
                el.style.maxHeight = 'none'
                el.style.lineHeight = '1.4'
                el.style.paddingTop = '6px'
                el.style.paddingBottom = '4px'
              } else if (['P', 'DIV', 'SPAN', 'LI', 'LABEL'].includes(el.tagName)) {
                el.style.overflow = 'visible'
                el.style.height = 'auto'
                el.style.maxHeight = 'none'
                el.style.lineHeight = '1.4'
                el.style.paddingTop = '4px'
                el.style.paddingBottom = '4px'
              }
            }
          })
        }
      },
      jsPDF: {
        unit: 'in',
        format: 'a4', // Force A4 format
        orientation: 'portrait',
        compress: true,
        putOnlyUsedFonts: false,
        precision: 16
      },
      pagebreak: {
        mode: ['css', 'legacy'], // Allow natural page breaks, don't force everything on one page
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.no-break', 'tr', 'table', 'td', 'th', 'p', 'div'] // Avoid breaking elements to prevent text cutting at page end
      },
      ...options
    }

    try {
      await html2pdf().set(opt).from(element).save()
    } finally {
      // Restore original styles
      element.style.display = originalDisplay
      element.style.visibility = originalVisibility
      element.style.transform = originalTransform
      element.style.transformOrigin = originalTransformOrigin
      element.style.width = originalWidth
      element.style.maxWidth = originalMaxWidth
    }
  }

  static async downloadQuotation(quotationNumber, customerName = 'Customer') {
    const elementId = 'quotation-preview-content'
    const filename = `Quotation-${quotationNumber}-${customerName.replace(/\s+/g, '-')}.pdf`
    return this.download(elementId, filename)
  }

  static async downloadPI(piNumber, customerName = 'Customer') {
    const elementId = document.getElementById('pi-content') ? 'pi-content' : 'pi-preview-content'
    const filename = `PI-${piNumber}-${customerName.replace(/\s+/g, '-')}.pdf`
    
    // Ensure A4 format with best fit for invoices
    return this.download(elementId, filename, {
      margin: [0.4, 0.4, 0.4, 0.4], // Slightly larger margins for better appearance
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.no-break']
      },
      jsPDF: {
        unit: 'in',
        format: 'a4', // Force A4
        orientation: 'portrait',
        compress: true,
        putOnlyUsedFonts: true,
        precision: 16
      }
    })
  }

  static async downloadAsBlob(elementId, options = {}) {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    const opt = {
      ...this.defaultOptions,
      ...options
    }

    return await html2pdf().set(opt).from(element).outputPdf('blob')
  }
}
