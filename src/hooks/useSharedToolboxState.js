import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for shared toolbox state that persists to localStorage
 * and syncs across all toolbox instances using custom events
 */
export const useSharedToolboxState = (key, defaultValue) => {
  // Load initial value from localStorage
  const loadValue = useCallback(() => {
    try {
      const stored = localStorage.getItem(`toolbox_${key}`);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(`Error loading toolbox state for ${key}:`, e);
    }
    return defaultValue;
  }, [key, defaultValue]);

  const [value, setValueState] = useState(() => loadValue());

  // Save to localStorage and dispatch event
  const setValue = useCallback((newValue) => {
    try {
      localStorage.setItem(`toolbox_${key}`, JSON.stringify(newValue));
      // Dispatch custom event to notify other instances
      window.dispatchEvent(new CustomEvent('toolboxStateUpdated', {
        detail: { key, value: newValue }
      }));
      setValueState(newValue);
    } catch (e) {
      console.error(`Error saving toolbox state for ${key}:`, e);
      setValueState(newValue); // Still update local state even if save fails
    }
  }, [key]);

  // Sync with localStorage on mount (in case it was updated while component was unmounted)
  useEffect(() => {
    const stored = loadValue();
    if (JSON.stringify(stored) !== JSON.stringify(value)) {
      setValueState(stored);
    }
  }, []); // Only run on mount

  // Listen for updates from other instances
  useEffect(() => {
    const handleStateUpdate = (event) => {
      if (event.detail.key === key) {
        setValueState(event.detail.value);
      }
    };

    window.addEventListener('toolboxStateUpdated', handleStateUpdate);
    return () => {
      window.removeEventListener('toolboxStateUpdated', handleStateUpdate);
    };
  }, [key, loadValue]);

  return [value, setValue];
};

