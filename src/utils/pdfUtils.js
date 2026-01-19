import html2pdf from 'html2pdf.js';
import toastManager from './ToastManager';

export const generateQuotationPDF = async (quotationData) => {
  const tempDiv = document.createElement('div');
  tempDiv.id = 'quotation-pdf-content';
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '0';
  tempDiv.style.top = '0';
  tempDiv.style.width = '750px';
  tempDiv.style.maxWidth = '750px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.fontSize = '12px';
  tempDiv.style.color = 'black';
  tempDiv.style.zIndex = '9999';
  tempDiv.style.visibility = 'visible';
  tempDiv.style.opacity = '1';
  
  tempDiv.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { 
          font-family: 'Inter', 'Arial', 'Helvetica', sans-serif; 
          font-size: 11px; 
          line-height: 1.4; 
          margin: 0; 
          padding: 15px; 
          background: white; 
          color: black;
          width: 100%;
          max-width: 750px;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .header { border: 2px solid black; margin-bottom: 20px; padding: 15px; }
        .company-name { font-size: 20px; font-weight: bold; margin: 0; }
        .gst-number { font-size: 10px; font-weight: bold; margin: 5px 0; }
        .company-desc { font-size: 10px; margin: 5px 0; }
        .address-section { padding: 10px; background-color: #f5f5f5; margin-top: 10px; }
        .address-grid { display: table; width: 100%; }
        .address-left, .address-right { display: table-cell; width: 50%; }
        .address-right { text-align: right; }
        .section { border: 1px solid black; margin-bottom: 20px; }
        .section-header { padding: 10px; background-color: #f5f5f5; font-weight: bold; }
        .section-content { padding: 10px; }
        .quotation-grid { display: table; width: 100%; }
        .quotation-cell { display: table-cell; width: 25%; padding: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9px; table-layout: fixed; page-break-inside: avoid; }
        .table th, .table td { border: 1px solid black; padding: 4px; word-wrap: break-word; }
        .table th { background-color: #f5f5f5; text-align: center; font-weight: bold; }
        .table td { text-align: center; }
        .table tr { page-break-inside: avoid; }
        .table td:first-child { text-align: left; width: 5%; }
        .table td:nth-child(2) { text-align: left; width: 25%; }
        .table td:nth-child(3) { width: 12%; }
        .table td:nth-child(4), .table td:nth-child(5) { width: 8%; }
        .table td:nth-child(6), .table td:nth-child(7), .table td:nth-child(9) { text-align: right; width: 12%; }
        .table td:nth-child(8) { width: 8%; }
        .totals-grid { display: table; width: 100%; }
        .bank-details, .totals { display: table-cell; width: 50%; padding: 15px; border: 1px solid black; }
        .totals-row { display: table; width: 100%; margin-bottom: 5px; }
        .totals-label, .totals-value { display: table-cell; width: 50%; }
        .totals-value { text-align: right; }
        .total-row { font-weight: bold; border-top: 1px solid black; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: table; width: 100%;">
          <div style="display: table-cell; width: 70%;">
            <div class="company-name">ANODE ELECTRIC PVT. LTD.</div>
            <div class="gst-number">22ABCDE1234F1Z5</div>
            <div class="company-desc">MANUFACTURING & SUPPLY OF ELECTRICAL CABLES & WIRES</div>
          </div>
          <div style="display: table-cell; width: 30%; text-align: right;">
            <img src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png" alt="Company Logo" style="height: 40px; width: auto; background: white; padding: 5px; border-radius: 4px;" />
          </div>
        </div>
        <div class="address-section">
          <div class="address-grid">
            <div class="address-left">
              <div style="font-weight: bold;">KHASRA NO. 805/5, PLOT NO. 10, IT PARK</div>
              <div>BARGI HILLS, JABALPUR - 482003</div>
              <div>MADHYA PRADESH, INDIA</div>
            </div>
            <div class="address-right">
              <div>Tel: 6262002116, 6262002113</div>
              <div>Web: www.anocab.com</div>
              <div>Email: info@anocab.com</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">Quotation Details</div>
        <div class="section-content">
          <div class="quotation-grid">
            <div class="quotation-cell">
              <strong>Quotation Date</strong><br/>
              ${new Date(quotationData.quotation_date).toLocaleDateString()}
            </div>
            <div class="quotation-cell">
              <strong>Quotation Number</strong><br/>
              ${quotationData.quotation_number}
            </div>
            <div class="quotation-cell">
              <strong>Valid Upto</strong><br/>
              ${new Date(quotationData.valid_until).toLocaleDateString()}
            </div>
            <div class="quotation-cell">
              <strong>Voucher Number</strong><br/>
              VOUCH-${Math.floor(1000 + Math.random() * 9000)}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">Bill To:</div>
        <div class="section-content">
          <div style="font-weight: bold;">${quotationData.customer_name}</div>
          <div>${quotationData.customer_address || 'N/A'}</div>
          <div><strong>Phone:</strong> ${quotationData.customer_phone}</div>
          <div><strong>GST:</strong> ${quotationData.customer_gst_no || 'N/A'}</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Description</th>
            <th>HSN Code</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>GST %</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${quotationData.items ? quotationData.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.product_name}</td>
              <td>${item.hsn_code}</td>
              <td>${item.quantity}</td>
              <td>${item.unit}</td>
              <td>₹${parseFloat(item.unit_price).toFixed(2)}</td>
              <td>₹${parseFloat(item.taxable_amount).toFixed(2)}</td>
              <td>${item.gst_rate}%</td>
              <td>₹${parseFloat(item.total_amount).toFixed(2)}</td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align: center;">No items found</td></tr>'}
        </tbody>
      </table>

      <div class="totals-grid">
        <div class="bank-details">
          <h3 style="font-weight: bold; font-size: 12px; margin-bottom: 10px;">Bank Details</h3>
          <div style="font-size: 10px;">
            <div><strong>Bank Name:</strong> ICICI Bank</div>
            <div><strong>Branch Name:</strong> WRIGHT TOWN JABALPUR</div>
            <div><strong>Bank Account Number:</strong> 657605601783</div>
            <div><strong>Bank Branch IFSC:</strong> ICIC0006576</div>
          </div>
        </div>
        <div class="totals">
          <div class="totals-row">
            <div class="totals-label">Subtotal</div>
            <div class="totals-value">₹${parseFloat(quotationData.subtotal).toFixed(2)}</div>
          </div>
          <div class="totals-row">
            <div class="totals-label">Less: Discount (0%)</div>
            <div class="totals-value">₹0.00</div>
          </div>
          <div class="totals-row">
            <div class="totals-label">Taxable Amount</div>
            <div class="totals-value">₹${parseFloat(quotationData.subtotal).toFixed(2)}</div>
          </div>
          <div class="totals-row">
            <div class="totals-label">Add: Total GST (${quotationData.tax_rate || 18}%)</div>
            <div class="totals-value">₹${parseFloat(quotationData.tax_amount).toFixed(2)}</div>
          </div>
          <div class="totals-row total-row">
            <div class="totals-label">Total Amount</div>
            <div class="totals-value">₹${parseFloat(quotationData.total_amount).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  document.body.appendChild(tempDiv);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  tempDiv.offsetHeight;
  
  try {
    // OPTIMIZED: Wait for fonts and content to fully render
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Ensure element dimensions are calculated
    const elementHeight = tempDiv.scrollHeight;
    const elementWidth = tempDiv.scrollWidth || 750;
    
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `Quotation-${quotationData.quotation_number}-${quotationData.customer_name.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2, // Higher scale for better quality and font rendering
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: elementWidth,
        height: elementHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: elementWidth,
        windowHeight: elementHeight,
        onclone: (clonedDoc) => {
          // Ensure fonts are properly loaded
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * {
              font-family: 'Inter', 'Arial', 'Helvetica', sans-serif !important;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        putOnlyUsedFonts: false, // Include all fonts
        precision: 16
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Prevent unwanted page breaks
    };
    
    await html2pdf().set(opt).from(tempDiv).save();
    toastManager.success('PDF downloaded successfully');
  } catch (error) {
    console.error('PDF generation error:', error);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${quotationData.quotation_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${tempDiv.innerHTML}
      </body>
      </html>
    `);
    newWindow.document.close();
    toastManager.success('Quotation opened in new tab');
  }
  
  document.body.removeChild(tempDiv);
};

