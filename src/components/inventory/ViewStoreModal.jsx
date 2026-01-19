import React from 'react';
import { Package, MapPin, Building } from 'lucide-react';
import RightSidebar from './RightSidebar';

const ViewStoreModal = ({ isOpen, onClose, store }) => {
  if (!store) return null;

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Store Details"
    >
      <div className="space-y-4">
        {/* Store Info Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-900">{store.storeName}</div>
              <div className="text-sm text-gray-500">Store Information</div>
            </div>
          </div>
        </div>

        {/* Store Details */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Store Name</label>
            <div className="mt-1 text-sm text-gray-900">{store.storeName}</div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Store Type</label>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock {store.inStockItems} Items
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Reject {store.rejectItems} Items
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Address
            </label>
            <div className="mt-1 text-sm text-gray-900">{store.address}</div>
          </div>
        </div>

        {/* Store Statistics */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Store Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-gray-600">In Stock Items</div>
              <div className="text-lg font-bold text-gray-900">{store.inStockItems}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-xs text-gray-600">Reject Items</div>
              <div className="text-lg font-bold text-gray-900">{store.rejectItems}</div>
            </div>
          </div>
        </div>
      </div>
    </RightSidebar>
  );
};

export default ViewStoreModal;

