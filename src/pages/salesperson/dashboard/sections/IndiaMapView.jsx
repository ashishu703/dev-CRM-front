import React, { memo, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_HEIGHT = 320;

const INDIA_GEOJSON_URL =
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

function normalizeStateName(name) {
  return (name || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

const HEATMAP_COLORS = [
  '#93c5fd', 
  '#2dd4bf', 
  '#22c55e', 
  '#fb923c', 
  '#ef4444', 
];
const BASE_FILL = '#f8fafc';

function getHeatmapColor(intensity) {
  if (intensity <= 0) return BASE_FILL;
  const idx = Math.min(
    HEATMAP_COLORS.length - 1,
    Math.floor(intensity * (HEATMAP_COLORS.length + 0.99))
  );
  return HEATMAP_COLORS[idx];
}

function IndiaGeoJSONLayer({ stateCountMap, stateMetaMap, onStateClick }) {
  const map = useMap();
  useEffect(() => {
    let layer = null;
    fetch(INDIA_GEOJSON_URL)
      .then((r) => r.json())
      .then((geojson) => {
        if (!map || !geojson) return;
        const maxCount = Math.max(1, ...Object.values(stateCountMap || {}));
        layer = L.geoJSON(geojson, {
          style: (feature) => {
            const name = feature?.properties?.ST_NM;
            const key = normalizeStateName(name);
            const count = stateCountMap ? (Number(stateCountMap[key] ?? 0) || 0) : 0;
            const intensity = maxCount > 0 ? count / maxCount : 0;
            const fill = count > 0 ? getHeatmapColor(intensity) : BASE_FILL;
            return {
              fillColor: fill,
              weight: 1.2,
              opacity: 1,
              color: 'rgba(255,255,255,0.4)',
              fillOpacity: 0.85,
            };
          },
          onEachFeature: (feature, layerInstance) => {
            const name = feature?.properties?.ST_NM || 'Unknown';
            const key = normalizeStateName(name);
            const count = stateCountMap ? (Number(stateCountMap[key] ?? 0) || 0) : 0;
            const meta = stateMetaMap?.[key] || {};
            const orders = meta.orders ?? 0;
            const revenue = meta.revenue ?? 0;
            const conv = meta.conversionPct ?? 0;
            const revStr = revenue >= 1e5 ? `₹${(revenue / 1e5).toFixed(1)}L` : revenue >= 1e3 ? `₹${(revenue / 1e3).toFixed(0)}K` : `₹${revenue}`;
            layerInstance.bindTooltip(
              `<div class="text-left text-xs font-medium text-slate-700 p-1.5 min-w-[140px]">
                <div class="font-semibold text-slate-900">${name}</div>
                <div>Leads: <strong>${count}</strong></div>
                <div>Orders: ${orders} · ${revStr}</div>
                <div>Conversion: ${Number(conv).toFixed(1)}%</div>
              </div>`,
              { direction: 'top', offset: [0, -8], className: 'leaflet-tooltip-geo' }
            );
            layerInstance.on('click', () => {
              onStateClick?.(name, key);
            });
          },
        });
        layer.addTo(map);
      })
      .catch(() => {});
    return () => {
      if (layer && map) map.removeLayer(layer);
    };
  }, [map, stateCountMap, stateMetaMap, onStateClick]);
  return null;
}

const IndiaMapView = memo(function IndiaMapView({ stateCountMap = {}, stateMetaMap = {}, onStateClick }) {
  return (
    <div
      className="w-full min-w-0 relative isolate rounded-lg overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]"
      style={{ height: MAP_HEIGHT }}
    >
      <MapContainer
        className="h-full w-full"
        center={[20.5937, 78.9629]}
        zoom={4.2}
        minZoom={3}
        maxZoom={8}
        style={{ height: '100%', width: '100%', background: 'var(--surface-secondary)' }}
        zoomControl={false}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        attributionControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="" />
        <IndiaGeoJSONLayer stateCountMap={stateCountMap} stateMetaMap={stateMetaMap} onStateClick={onStateClick} />
      </MapContainer>
    </div>
  );
});

export default IndiaMapView;
