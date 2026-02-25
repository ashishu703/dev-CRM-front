import React, { memo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

const INDIA_GEOJSON_URL =
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

function normalizeStateName(name) {
  return (name || '').toString().trim().toLowerCase();
}

function IndiaGeoJSONLayer({ stateCountMap }) {
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
            const count = stateCountMap ? (stateCountMap[key] ?? 0) : 0;
            const intensity = maxCount > 0 ? count / maxCount : 0;
            let fill = '#334155';
            if (count > 0) {
              if (intensity >= 0.6) fill = '#14b8a6';
              else if (intensity >= 0.3) fill = '#eab308';
              else fill = '#22c55e';
            }
            return {
              fillColor: fill,
              weight: 1.2,
              opacity: 0.95,
              color: 'rgba(255,255,255,0.25)',
              fillOpacity: 0.75,
            };
          },
          onEachFeature: (feature, layerInstance) => {
            const name = feature?.properties?.ST_NM || 'Unknown';
            const key = normalizeStateName(name);
            const count = stateCountMap ? (stateCountMap[key] ?? 0) : 0;
            layerInstance.bindPopup(`<strong>${name}</strong><br/>Leads: ${count}`);
          },
        });
        layer.addTo(map);
      })
      .catch(() => {});
    return () => {
      if (layer && map) map.removeLayer(layer);
    };
  }, [map, stateCountMap]);
  return null;
}

const formatLac = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num) || num === 0) return '—';
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}K`;
  return `₹${num}`;
};

function getStateColor(st) {
  if ((st.overdue || 0) > 0) return 'bg-red-500/10 border-red-500/30 text-red-300';
  const rev = st.revenue || 0;
  if (rev >= 1e5) return 'bg-teal-500/10 border-teal-500/30 text-teal-300';
  if (rev >= 1e3) return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
  return 'bg-white/[0.04] border-white/5 text-slate-400';
}

const IndiaGeoIntelligence = memo(function IndiaGeoIntelligence({ indiaGeo }) {
  const [selectedState, setSelectedState] = useState(null);
  const [stateCountMap, setStateCountMap] = useState({});

  const { states = [], summaryCards = [] } = indiaGeo || {};
  useEffect(() => {
    const map = {};
    states.forEach((st) => {
      map[normalizeStateName(st.state)] = st.customerCount || 0;
    });
    setStateCountMap(map);
  }, [states]);

  const hasData = states.length > 0 || summaryCards.length > 0;

  if (!indiaGeo) return null;

  if (!hasData) {
    return (
      <div className="dashboard-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <h3 className="text-xl font-semibold text-white">Geographic Distribution</h3>
          <p className="text-slate-400 text-sm mt-1">Leads per state</p>
        </div>
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <MapPin className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const legendItems = [
    { label: 'High', color: 'bg-teal-500', desc: '60%+ of max' },
    { label: 'Medium', color: 'bg-amber-500', desc: '30–60%' },
    { label: 'Low', color: 'bg-emerald-500', desc: '&lt;30%' },
    { label: 'None', color: 'bg-slate-600', desc: 'No leads' },
  ];

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <h3 className="text-xl font-semibold text-white">Geographic Distribution</h3>
        <p className="text-slate-400 text-sm mt-1">Leads per state · Click state for count</p>
      </div>
      <div className="p-6">
        {summaryCards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {summaryCards.map((card, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                <div className="text-xl font-semibold text-slate-100">{card.value} {card.label}</div>
                {card.subLabel && <div className="text-xs text-slate-400 mt-0.5">{card.subLabel}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-white/5 bg-[rgba(30,41,59,0.6)] backdrop-blur-sm shadow-[0_0_40px_rgba(99,102,241,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(20,184,166,0.06),transparent)] pointer-events-none z-[1]" />
            <div className="relative z-0 h-[400px] min-h-[400px]">
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <IndiaGeoJSONLayer stateCountMap={stateCountMap} />
              </MapContainer>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-400">Leads by state</span>
              <div className="flex flex-wrap gap-2 justify-end">
                {legendItems.map((item) => (
                  <span key={item.label} className="flex items-center gap-1 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            {states.length === 0 ? (
              <p className="text-sm text-slate-500">No state data</p>
            ) : (
              <ul className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {states.map((st) => {
                  const style = getStateColor(st);
                  const dotClass = style.includes('red') ? 'bg-red-500' : style.includes('teal') ? 'bg-teal-500' : style.includes('amber') ? 'bg-amber-500' : 'bg-slate-500';
                  return (
                    <li key={st.state}>
                      <button
                        type="button"
                        onClick={() => setSelectedState(selectedState === st.state ? null : st.state)}
                        className={`w-full text-left flex items-center gap-3 py-2.5 px-4 rounded-xl border transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] ${style} ${selectedState === st.state ? 'ring-2 ring-indigo-400/50' : ''}`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                        <span className="font-medium truncate text-slate-200">{st.state}</span>
                        <span className="text-xs shrink-0 ml-auto text-slate-400">
                          <strong className="text-slate-300">{st.customerCount}</strong> leads · {formatLac(st.revenue)}
                          {(st.overdue || 0) > 0 && <span className="text-red-400"> · Overdue</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        {selectedState && (
          <div className="mt-6 p-4 rounded-xl bg-white/[0.04] border border-white/5">
            <h4 className="font-semibold text-white mb-1">{selectedState}</h4>
            <p className="text-sm text-slate-400">Leads · Revenue · Overdue</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default IndiaGeoIntelligence;
