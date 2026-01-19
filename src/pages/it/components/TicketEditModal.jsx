import React from 'react';
import { X, Upload } from 'lucide-react';
import API_BASE_URL from '../../../api/admin_api/api';

const TicketEditModal = ({ ticket, editFormData, setEditFormData, onClose, onSave, STATUSES }) => {
  if (!ticket) return null;

  // Get all images from status history
  const getAllImages = () => {
    const images = [];
    if (ticket.statusHistory) {
      ticket.statusHistory.forEach((history, idx) => {
        if (history.imageUrl) {
          images.push({
            url: history.imageUrl,
            name: history.imageName || `Image ${idx + 1}`,
            timestamp: history.timestamp
          });
        }
      });
    }
    return images;
  };

  const existingImages = getAllImages();

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setEditFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Edit Ticket - {ticket.id}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Resolution Notes</label>
            <textarea
              value={editFormData.resolution}
              onChange={(e) => setEditFormData(prev => ({ ...prev, resolution: e.target.value }))}
              placeholder="Enter resolution details..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px]"
            />
          </div>
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Uploaded Images</label>
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((img, idx) => {
                  // Cloudinary URLs are already full URLs (https://...), local paths need API_BASE_URL
                  const imageUrl = img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`;
                  return (
                    <div key={idx} className="relative border border-slate-200 rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={img.name}
                        className="w-full h-32 object-cover cursor-pointer hover:opacity-80"
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden p-2 text-xs text-slate-500 bg-slate-50">
                        Image not available
                      </div>
                      <p className="text-xs text-slate-600 p-1 truncate" title={img.name}>{img.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload New Photo</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer flex items-center gap-2 text-slate-600 hover:text-cyan-600">
                <Upload className="w-4 h-4" />
                <span>Click to upload photo</span>
              </label>
              {editFormData.photos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {editFormData.photos.map((photo, idx) => (
                    <p key={idx} className="text-xs text-slate-600">{photo.name}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketEditModal;

