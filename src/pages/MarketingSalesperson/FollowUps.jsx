import React, { useState } from 'react';
import { MapPin, Camera, Calendar, User, Phone, Building, X, Save, Search } from 'lucide-react';

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    business: '',
    followUpDate: '',
    followUpTime: '',
    remarks: '',
    location: '',
    photo: null,
    photoPreview: null
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Photo size should be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, photo: 'Please select an image file' });
        return;
      }
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      });
      if (errors.photo) setErrors({ ...errors, photo: '' });
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handlePhotoChange({ target: { files: [file] } });
      }
    };
    input.click();
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ ...errors, location: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({ ...formData, location: `${latitude}, ${longitude}` });
        if (errors.location) setErrors({ ...errors, location: '' });
      },
      () => setErrors({ ...errors, location: 'Unable to get location. Please allow location access.' })
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Required';
    if (!formData.followUpDate) newErrors.followUpDate = 'Required';
    if (!formData.location.trim()) newErrors.location = 'Location is mandatory';
    if (!formData.photo) newErrors.photo = 'Photo is mandatory';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const newFollowUp = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    setFollowUps([...followUps, newFollowUp]);
    setFormData({
      customerName: '', phone: '', business: '', followUpDate: '', followUpTime: '',
      remarks: '', location: '', photo: null, photoPreview: null
    });
    setErrors({});
    setShowModal(false);
  };

  const filteredFollowUps = followUps.filter(fu =>
    fu.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fu.business?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fu.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Follow-ups</h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg text-sm sm:text-base"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Follow-up</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex shadow-lg rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white border-gray-200 text-gray-900 placeholder-gray-500"
            />
            <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md flex-shrink-0">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Follow-ups List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredFollowUps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">No follow-ups recorded yet</p>
            </div>
          ) : (
            filteredFollowUps.map((fu) => (
              <div key={fu.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{fu.customerName}</h3>
                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {fu.business && <p><Building className="w-4 h-4 inline mr-1" />{fu.business}</p>}
                      {fu.phone && <p><Phone className="w-4 h-4 inline mr-1" />{fu.phone}</p>}
                      <p><Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(fu.followUpDate).toLocaleDateString()}
                        {fu.followUpTime && ` at ${fu.followUpTime}`}
                      </p>
                      <p><MapPin className="w-4 h-4 inline mr-1" />{fu.location}</p>
                    </div>
                    {fu.remarks && <p className="mt-2 text-xs sm:text-sm text-gray-700">{fu.remarks}</p>}
                  </div>
                  {fu.photoPreview && (
                    <div>
                      <img
                        src={fu.photoPreview}
                        alt="Follow-up"
                        className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Follow-up Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col my-auto">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add Follow-up</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    Business
                  </label>
                  <input
                    type="text"
                    name="business"
                    value={formData.business}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Follow-up Date *
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.followUpDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.followUpDate && <p className="text-red-500 text-xs mt-1">{errors.followUpDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Time</label>
                  <input
                    type="time"
                    name="followUpTime"
                    value={formData.followUpTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1 text-red-500" />
                    Current Location * <span className="text-red-500">(Mandatory)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={formData.location}
                      readOnly
                      placeholder="Click button to get location"
                      className={`flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Get Location</span>
                    </button>
                  </div>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Camera className="w-4 h-4 inline mr-1 text-red-500" />
                    Photo * <span className="text-red-500">(Mandatory)</span>
                  </label>
                  {formData.photoPreview ? (
                    <div className="relative">
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: null, photoPreview: null })}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-3">Take photo from camera</p>
                        <button
                          type="button"
                          onClick={handleCameraCapture}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 mx-auto"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Take Photo</span>
                        </button>
                      </div>
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 underline">
                          Or upload from gallery
                        </label>
                      </div>
                    </div>
                  )}
                  {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      customerName: '', phone: '', business: '', followUpDate: '', followUpTime: '',
                      remarks: '', location: '', photo: null, photoPreview: null
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
