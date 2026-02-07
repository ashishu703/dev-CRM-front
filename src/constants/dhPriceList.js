export const PRICE_TYPES = ['ISI', 'Commercial'];
export const RATE_TYPES = ['Rate/Mtr', 'Rate/Kg'];

export const PRICE_TYPE_LABEL = (v) => (v && (v === 'ISI' || v === 'Commercial')) ? v : (v || '—');
export const RATE_TYPE_LABEL = (v) => (v && (v === 'Rate/Mtr' || v === 'Rate/Kg' || v === 'rate_mtr' || v === 'rate_kg')) 
  ? (v === 'rate_mtr' ? 'Rate/Mtr' : v === 'rate_kg' ? 'Rate/Kg' : v) 
  : (v || '—');
