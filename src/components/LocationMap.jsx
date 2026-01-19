import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Clock, Navigation } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const punchInIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#10B981" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="16" text-anchor="middle" fill="#10B981" font-size="8" font-weight="bold">IN</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const punchOutIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EF4444" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="16" text-anchor="middle" fill="#EF4444" font-size="8" font-weight="bold">OUT</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const locationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle fill="#3B82F6" stroke="#fff" stroke-width="2" cx="10" cy="10" r="6"/>
      <circle fill="#fff" cx="10" cy="10" r="3"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Component to fit map bounds
const FitBounds = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);
  
  return null;
};

const LocationMap = ({ locationHistory, punchInLocation, punchOutLocation, isVisible }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  if (!isVisible || !mapLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Map will load when location tracking is active</p>
      </div>
    );
  }

  // Combine all locations for the path
  const allLocations = [];
  
  if (punchInLocation) {
    allLocations.push({
      ...punchInLocation,
      type: 'punchIn',
      label: 'Punch In'
    });
  }
  
  if (locationHistory && locationHistory.length > 0) {
    allLocations.push(...locationHistory.map(loc => ({
      ...loc,
      type: 'location',
      label: 'Location Update'
    })));
  }
  
  if (punchOutLocation) {
    allLocations.push({
      ...punchOutLocation,
      type: 'punchOut',
      label: 'Punch Out'
    });
  }

  // Default center (Mumbai)
  const defaultCenter = [19.0760, 72.8777];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Navigation className="w-5 h-5 mr-2 text-blue-600" />
          Location Timeline Map
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Punch In</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Locations</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Punch Out</span>
          </div>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={allLocations.length > 0 ? [allLocations[0].latitude, allLocations[0].longitude] : defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Fit bounds to show all locations */}
          <FitBounds locations={allLocations} />
          
          {/* Punch In Marker */}
          {punchInLocation && (
            <Marker
              position={[punchInLocation.latitude, punchInLocation.longitude]}
              icon={punchInIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-green-600 mb-2">📍 Punch In</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Time:</strong> {new Date(punchInLocation.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Coordinates:</strong> {punchInLocation.latitude.toFixed(6)}, {punchInLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Accuracy:</strong> ±{Math.round(punchInLocation.accuracy)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Location History Markers */}
          {locationHistory && locationHistory.map((location, index) => (
            <Marker
              key={`location-${index}`}
              position={[location.latitude, location.longitude]}
              icon={locationIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-blue-600 mb-2">📍 Location #{index + 1}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Time:</strong> {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Punch Out Marker */}
          {punchOutLocation && (
            <Marker
              position={[punchOutLocation.latitude, punchOutLocation.longitude]}
              icon={punchOutIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-red-600 mb-2">📍 Punch Out</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Time:</strong> {new Date(punchOutLocation.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Coordinates:</strong> {punchOutLocation.latitude.toFixed(6)}, {punchOutLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Accuracy:</strong> ±{Math.round(punchOutLocation.accuracy)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Path Line */}
          {allLocations.length > 1 && (
            <Polyline
              positions={allLocations.map(loc => [loc.latitude, loc.longitude])}
              color="#3B82F6"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* Location Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {punchInLocation ? '1' : '0'}
          </p>
          <p className="text-sm text-gray-600">Punch In</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {locationHistory ? locationHistory.length : 0}
          </p>
          <p className="text-sm text-gray-600">Locations Tracked</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">
            {punchOutLocation ? '1' : '0'}
          </p>
          <p className="text-sm text-gray-600">Punch Out</p>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
