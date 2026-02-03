import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X } from 'lucide-react';

/**
 * Shows "Allow notifications" popup every time user opens the CRM (when permission is not granted).
 * No persistence - popup appears on every load until user allows or dismisses for this session.
 */
const NotificationPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    // Show popup every time CRM is opened when permission is not granted
    if (Notification.permission !== 'granted') {
      setVisible(true);
    }
  }, []);

  const handleAllow = async () => {
    if (!('Notification' in window)) {
      setVisible(false);
      return;
    }
    setRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' || permission === 'denied') {
        setVisible(false);
      }
    } catch (_) {
      setVisible(false);
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={handleDismiss}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-5 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Allow notifications</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Get alerts for new leads and updates even when the tab is in background.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleAllow}
                disabled={requesting}
                className="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-60"
              >
                {requesting ? '...' : 'Allow'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationPrompt;
