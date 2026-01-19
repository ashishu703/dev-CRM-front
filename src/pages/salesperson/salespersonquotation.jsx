import { Printer } from "lucide-react"
import { useEffect, useState } from "react"
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'

const Quotation = ({ quotationData, customer, selectedBranch = 'ANODE' }) => {
  const [salespersonName, setSalespersonName] = useState(null)

  // Fetch user data directly - more reliable approach
  useEffect(() => {
    const fetchSalespersonName = async () => {
      let name = null;

      // Method 1: Try to fetch from API first
      try {
        const response = await apiClient.get(API_ENDPOINTS.PROFILE);
        if (response && response.data && response.data.user) {
          const apiUser = response.data.user;
          name = apiUser.username || apiUser.name;
          if (name) {
            setSalespersonName(name);
            return;
          }
        }
      } catch (error) {
        console.log('API fetch failed, trying localStorage...', error);
      }

      // Method 2: Fallback to localStorage
      try {
        const localUserData = JSON.parse(localStorage.getItem('user') || '{}');
        name = localUserData.username || localUserData.name;
        if (name && name !== 'User') {
          setSalespersonName(name);
          return;
        }
      } catch (e) {
        console.error('Error reading user from localStorage:', e);
      }

      // If still no name found, set to null
      setSalespersonName(null);
    };

    fetchSalespersonName();
  }, []);
  // Company branch configuration
  const companyBranches = {
    ANODE: {
      name: 'ANODE ELECTRIC PRIVATE LIMITED',
      gstNumber: '(23AANCA7455R1ZX)',
      description: 'MANUFACTURING & SUPPLY OF ELECTRICAL CABLES & WIRES.',
      address: 'KHASRA NO. 805/5, PLOT NO. 10, IT PARK, BARGI HILLS, JABALPUR - 482003, MADHYA PRADESH, INDIA.',
      tel: '6262002116, 6262002113',
      web: 'www.anocab.com',
      email: 'info@anocab.com',
      logo: 'Anocab - A Positive Connection.....'
    },
    SAMRIDDHI_CABLE: {
      name: 'SAMRIDDHI CABLE INDUSTRIES PRIVATE LIMITED',
      gstNumber: '(23ABPCS7684F1ZT)',
      description: 'MANUFACTURING & SUPPLY OF ELECTRICAL CABLES & WIRES.',
      address: 'KHASRA NO. 805/5, PLOT NO. 10, IT PARK, BARGI HILLS, JABALPUR - 482003, MADHYA PRADESH, INDIA.',
      tel: '6262002116, 6262002113',
      web: 'www.samriddhicable.com',
      email: 'info@samriddhicable.com',
      logo: 'Samriddhi Cable - Quality & Excellence.....'
    },
    SAMRIDDHI_INDUSTRIES: {
      name: 'SAMRIDDHI INDUSTRIES',
      gstNumber: '(23ABWFS1117M1ZT)',
      description: 'MANUFACTURING & SUPPLY OF ELECTRICAL CABLES & WIRES.',
      address: 'KHASRA NO. 805/5, PLOT NO. 10, IT PARK, BARGI HILLS, JABALPUR - 482003, MADHYA PRADESH, INDIA.',
      tel: '6262002116, 6262002113',
      web: 'www.samriddhiindustries.com',
      email: 'info@samriddhiindustries.com',
      logo: 'Samriddhi Industries - Innovation & Trust.....'
    }
  }
  
  const currentCompany = companyBranches[selectedBranch] || companyBranches.ANODE
  const handlePrint = async () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    const quotationElement = document.getElementById('quotation-content')
    
    if (printWindow && quotationElement) {
      // Convert image to base64 to ensure it loads in PDF
      const convertImageToBase64 = (imgUrl) => {
        return new Promise((resolve) => {
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
          img.onerror = () => resolve(imgUrl) // Fallback to original URL
          img.src = imgUrl
        })
      }

      const logoUrl = 'https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png'
      const base64Logo = await convertImageToBase64(logoUrl)
      
      // Clone the content and replace the image src
      const clonedContent = quotationElement.cloneNode(true)
      const logoImg = clonedContent.querySelector('img')
      if (logoImg) {
        logoImg.src = base64Logo
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Quotation - ${quotationData?.quotationNumber || 'ANO/25-26/458'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                font-size: 14px;
                line-height: 1.4;
                color: #000;
              }
              .border-2 { border: 2px solid #000; }
              .border { border: 1px solid #000; }
              .border-black { border-color: #000; }
              .border-gray-300 { border-color: #d1d5db; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-8 { margin-bottom: 2rem; }
              .p-2 { padding: 0.5rem; }
              .p-3 { padding: 0.75rem; }
              .p-6 { padding: 1.5rem; }
              .pt-1 { padding-top: 0.25rem; }
              .text-xl { font-size: 1.25rem; }
              .text-xs { font-size: 0.75rem; }
              .text-sm { font-size: 0.875rem; }
              .font-bold { font-weight: bold; }
              .font-semibold { font-weight: 600; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-center { align-items: center; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
              .gap-2 { gap: 0.5rem; }
              .gap-4 { gap: 1rem; }
              .bg-gray-50 { background-color: #f9fafb; }
              .bg-gray-100 { background-color: #f3f4f6; }
              .space-y-1 > * + * { margin-top: 0.25rem; }
              .space-y-2 > * + * { margin-top: 0.5rem; }
              .w-full { width: 100%; }
              .h-12 { height: 3rem; }
              .w-auto { width: auto; }
              .w-24 { width: 6rem; }
              .rounded { border-radius: 0.25rem; }
              .flex-col { flex-direction: column; }
              .bg-blue-600 { background-color: #2563eb; }
              .text-white { color: white; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .border-t { border-top: 1px solid #000; }
              .no-print { display: none !important; }
              img { max-width: 100%; height: auto; }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none !important; }
                * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              }
            </style>
          </head>
          <body>
            ${clonedContent.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }
    return (
      <div className="max-w-4xl mx-auto bg-white font-sans text-sm">        
        {/* Quotation Content */}
        <div id="quotation-content" className="p-6">
        {/* Header */}
        <div className="border-2 border-black mb-4">
          {/* Removed header background color and updated company name and tagline */}
          <div className="p-2 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{currentCompany.name}</h1>
              <p className="text-sm font-semibold text-gray-700">{currentCompany.gstNumber}</p>
              <p className="text-xs">{currentCompany.description}</p>
            </div>
            <div className="text-right">
              <img
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
                alt="Anode Electric Logo"
                className="h-12 w-auto bg-white p-1 rounded"
              />
            </div>
          </div>
  
          <div className="p-3 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p>
                  <strong>KHASRA NO. 805/5, PLOT NO. 10, IT PARK</strong>
                </p>
                <p>BARGI HILLS, JABALPUR - 482003</p>
                <p>MADHYA PRADESH, INDIA</p>
              </div>
              <div className="text-right">
                <p>Tel: 6262002116, 6262002113</p>
                <p>Web: www.anocab.com</p>
                <p>Email: info@anocab.com</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Quotation Details */}
        <div className="border border-black mb-4">
          <div className="bg-gray-100 p-2 text-center font-bold">
            <h2>Quotation Details</h2>
          </div>
          <div className="grid grid-cols-4 gap-2 p-2 text-xs border-b">
            <div>
              <strong>Quotation Date</strong>
            </div>
            <div>
              <strong>Quotation Number</strong>
            </div>
            <div>
              <strong>Valid Upto</strong>
            </div>
            <div>
              <strong>Voucher Number</strong>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 p-2 text-xs">
            <div>{quotationData?.quotationDate || new Date().toLocaleDateString()}</div>
            <div>{quotationData?.quotationNumber || `ANO/${new Date().getFullYear().toString().slice(-2)}-${(new Date().getFullYear() + 1).toString().slice(-2)}/${Math.floor(1000 + Math.random() * 9000)}`}</div>
            <div>{quotationData?.validUpto || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
            <div>{`VOUCH-${Math.floor(1000 + Math.random() * 9000)}`}</div>
          </div>
        </div>
  
        {/* Customer Information */}
        <div className="border border-black mb-4">
          <div className="grid grid-cols-2 gap-4 p-3 text-xs">
            <div>
              <h3 className="font-bold mb-2">BILL TO:</h3>
              <p>
                <strong>{quotationData?.billTo?.business || customer?.business || 'Das Industrial Controls'}</strong>
              </p>
              <p>{quotationData?.billTo?.address || customer?.address || 'Panvel, Maharashtra, India'}</p>
              <p>
                <strong>PHONE:</strong> {quotationData?.billTo?.phone || customer?.phone || '7039542259'}
              </p>
              <p>
                <strong>GSTIN:</strong> {quotationData?.billTo?.gstNo || customer?.gstNo || '27DVTPS2973B1Z0'}
              </p>
              <p>
                <strong>State:</strong> {quotationData?.billTo?.state || customer?.state || 'Maharashtra'}
              </p>
            </div>
            <div>
              <p>
                <strong>L.R. No:</strong> -
              </p>
              <p>
                <strong>Transport:</strong> STAR TRANSPORTS
              </p>
              <p>
                <strong>Transport ID:</strong> 562345
              </p>
              <p>
                <strong>Vehicle Number:</strong> GJ01HJ2520
              </p>
            </div>
          </div>
        </div>
  
        {/* Product Details Table */}
        <div className="border border-black mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 text-center w-10">Sr.</th>
                <th className="border border-gray-300 p-2 text-left w-2/3">Name of Product / Service</th>
                <th className="border border-gray-300 p-1 text-center w-16">HSN / SAC</th>
                <th className="border border-gray-300 p-1 text-center w-12">Qty</th>
                <th className="border border-gray-300 p-1 text-center w-12">Unit</th>
                <th className="border border-gray-300 p-1 text-right w-20">Taxable Value</th>
                <th className="border border-gray-300 p-0.5 text-center w-8 text-[10px] whitespace-nowrap">GST%</th>
                <th className="border border-gray-300 p-1 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotationData?.items?.length > 0 ? (
                quotationData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-1 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2">{item.description}</td>
                    <td className="border border-gray-300 p-1 text-center">85446090</td>
                    <td className="border border-gray-300 p-1 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-1 text-center">{item.unit}</td>
                    <td className="border border-gray-300 p-1 text-right">{parseFloat(item.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border border-gray-300 p-0 text-center text-xs">18%</td>
                    <td className="border border-gray-300 p-1 text-right">{parseFloat(item.amount * 1.18).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td className="border border-gray-300 p-1 text-center">1</td>
                    <td className="border border-gray-300 p-2">ACSR Dog Conductor</td>
                    <td className="border border-gray-300 p-1 text-center">76042910</td>
                    <td className="border border-gray-300 p-1 text-center">120,000</td>
                    <td className="border border-gray-300 p-1 text-center">MTR</td>
                    <td className="border border-gray-300 p-1 text-right">9,840,000.00</td>
                    <td className="border border-gray-300 p-0 text-center text-xs">18%</td>
                    <td className="border border-gray-300 p-1 text-right">11,612,400.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1 text-center">2</td>
                    <td className="border border-gray-300 p-2">AAAC Panther 232 SQMM</td>
                    <td className="border border-gray-300 p-1 text-center">85446090</td>
                    <td className="border border-gray-300 p-1 text-center">120,000</td>
                    <td className="border border-gray-300 p-1 text-center">MTR</td>
                    <td className="border border-gray-300 p-1 text-right">24,600,000.00</td>
                    <td className="border border-gray-300 p-0 text-center text-xs">18%</td>
                    <td className="border border-gray-300 p-1 text-right">29,028,000.00</td>
                  </tr>
                </>
              )}
              {/* Empty rows for spacing */}
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="h-8">
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 p-2" colSpan="5">
                  Total
                </td>
                <td className="border border-gray-300 p-2">{quotationData?.subtotal?.toFixed(2) || '34,440,000'}</td>
                <td className="border border-gray-300 p-2">{quotationData?.taxAmount?.toFixed(2) || '6,200,400'}</td>
                <td className="border border-gray-300 p-2">{quotationData?.total?.toFixed(2) || '40,640,400'}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        {/* Amount Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-black p-3">
            <h3 className="font-bold text-xs mb-2">Bank Details</h3>
            <div className="text-xs space-y-1">
              <p>
                <strong>Bank Name:</strong> ICICI Bank
              </p>
              <p>
                <strong>Branch Name:</strong> WRIGHT TOWN JABALPUR
              </p>
              <p>
                <strong>Bank Account Number:</strong> 657605601783
              </p>
              <p>
                <strong>Bank Branch IFSC:</strong> ICIC0006576
              </p>
            </div>
          </div>
          <div className="border border-black p-3">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>{quotationData?.subtotal?.toFixed(2) || '34,440,000'}</span>
              </div>
              <div className="flex justify-between">
                <span>Add: Total GST (18%)</span>
                <span>{quotationData?.taxAmount?.toFixed(2) || '6,200,400'}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total Amount After Tax</span>
                <span>₹ {quotationData?.total?.toFixed(2) || '40,640,400'}</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-xs">(Rupees Four Crore Six Lakh Forty Thousand Four Hundred Only)</span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Terms and Conditions */}
        <div className="border border-black mb-4">
          <div className="bg-gray-100 p-2 font-bold text-xs">
            <h3>Terms and Conditions</h3>
          </div>
          <div className="p-3 text-xs space-y-2">
            <div>
              <h4 className="font-bold">PRICING & VALIDITY</h4>
              <p>
                • Prices are valid for 3 days only from the date of the final quotation/PI unless otherwise specified
                terms.
              </p>
              <p>• The order will be considered confirmed only upon receipt of the advance payment.</p>
            </div>
            <div>
              <h4 className="font-bold">PAYMENT TERMS</h4>
              <p>• 30% advance payment upon order confirmation</p>
              <p>• Remaining Balance at time of final dispatch / against LC / Bank Guarantee (if applicable).</p>
              <p>
                • Liquidated Damages @ 0.5% to 1% per WEEK will be charged on delayed payments beyond the agreed terms.
              </p>
            </div>
            <div>
              <h4 className="font-bold">DELIVERY & DISPATCH</h4>
              <p>• Standard delivery period as per the telecommunication with customer.</p>
              <p>
                • Any delays due to unforeseen circumstances (force majeure, strikes, and transportation issues) will be
                communicated.
              </p>
            </div>
            <div>
              <h4 className="font-bold">QUALITY & WARRANTY</h4>
              <p>
                • Cables will be supplied as per IS and other applicable BIS standards/or as per the agreed specifications
                mentioned/special demand by the customer.
              </p>
              <p>• Any manufacturing defects should be reported immediately, within 3 working days of receipt.</p>
              <p>• Warranty: 12 months from the date of dispatch for manufacturing defects only in ISI mark products.</p>
            </div>
          </div>
        </div>
  
        {/* Footer */}
        <div className="text-right text-xs">
          <p className="mb-4">
            For <strong>{currentCompany.name}</strong>
          </p>
          <p className="mb-8">This is computer generated invoice no signature required.</p>
          <div>
            <p className="font-bold">Authorized Signatory</p>
            {salespersonName ? (
              <>
                <p className="mt-2 text-sm font-semibold text-gray-800">{salespersonName}</p>
                <p className="mt-1 text-xs text-gray-600">Salesperson</p>
              </>
            ) : (
              <p className="mt-2 text-sm font-semibold text-gray-800">Salesperson</p>
            )}
          </div>
        </div>
        </div>
        
        {/* Print Button - Bottom Left */}
        <div className="flex justify-start mt-4 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print PDF
          </button>
        </div>
      </div>
    )
  }
  
  export default Quotation
  