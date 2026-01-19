import React, { useRef, useEffect, useState } from 'react';
import { X, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

const BarcodeModal = ({ isOpen, onClose, item }) => {
  const canvasRef = useRef(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);

  useEffect(() => {
    if (isOpen && item) {
      generateQRCode();
    }
  }, [isOpen, item]);

  const generateQRCode = async () => {
    if (!item) return;

    try {
      const productData = {
        itemId: item.itemId || item.id,
        itemName: item.itemName,
        productUnit: item.uom || 'N/A',
        quantity: item.quantity || 0,
        noOfPacking: item.noOfPacking || 1,
        hsnCode: item.hsn || 'N/A',
        barcode: item.barcode || item.itemId
      };

      const qrData = JSON.stringify(productData, null, 2);
      
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(dataUrl);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = 300;
          canvas.height = 300;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !item) return;

    const link = document.createElement('a');
    link.download = `qrcode_${item.itemId || item.id}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  if (!isOpen || !item) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">QR Code Details</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* QR Code Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center">
              {qrCodeDataUrl ? (
                <>
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="mb-4 border border-gray-300 bg-white rounded"
                    style={{ width: '300px', height: '300px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="w-[300px] h-[300px] flex items-center justify-center border border-gray-300 bg-white rounded">
                  <div className="text-gray-400">Generating QR Code...</div>
                </div>
              )}
              <button
                onClick={downloadQRCode}
                disabled={!qrCodeDataUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Scan this QR code to view product details
              </p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Product Name</div>
                <div className="text-base font-semibold text-gray-900">{item.itemName || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Item ID</div>
                <div className="text-base font-semibold text-gray-900">{item.itemId || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Product Unit</div>
                <div className="text-base font-semibold text-gray-900">{item.uom || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Quantity</div>
                <div className="text-base font-semibold text-gray-900">{item.quantity || 0} {item.uom || ''}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">No. of Packing</div>
                <div className="text-base font-semibold text-gray-900">{item.noOfPacking || 1}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">HSN Code</div>
                <div className="text-base font-semibold text-gray-900">{item.hsn || 'N/A'}</div>
              </div>
            </div>

            {/* QR Code Data Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-700 mb-1">QR Code Contains:</div>
              <div className="text-xs text-blue-900 space-y-1 mt-2">
                <div>• Product Name: {item.itemName}</div>
                <div>• Item ID: {item.itemId}</div>
                <div>• Unit: {item.uom || 'N/A'}</div>
                <div>• Quantity: {item.quantity || 0}</div>
                <div>• No. of Packing: {item.noOfPacking || 1}</div>
                <div>• HSN Code: {item.hsn || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarcodeModal;
