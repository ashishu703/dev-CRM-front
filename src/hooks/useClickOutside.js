import { useEffect } from 'react';

/**
 * Listens for mousedown outside the given ref and calls onClose when detected.
 * @param {React.RefObject} ref - Ref to the element to detect clicks outside
 * @param {() => void} onClose - Callback when click outside occurs
 * @param {boolean} enabled - Whether the listener is active
 */
export function useClickOutside(ref, onClose, enabled = true) {
  useEffect(() => {
    if (!enabled || !onClose) return;
    const handler = (e) => {
      if (ref?.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose, enabled]);
}
