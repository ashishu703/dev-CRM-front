import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useAuth } from './useAuth';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    let baseURL = import.meta.env.VITE_API_BASE_URL;
    if (baseURL.startsWith('http')) {
      // Ensure it ends with /api if not already
      if (!baseURL.endsWith('/api')) {
        baseURL = baseURL.endsWith('/') ? `${baseURL}api` : `${baseURL}/api`;
      }
      return baseURL;
    }
    if (typeof window !== 'undefined') {
      const url = baseURL.startsWith('/') ? baseURL : `/${baseURL}`;
      return `${window.location.origin}${url}`;
    }
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4500/api';
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4500/api';
};

const BASE_URL = getBaseURL();

export const useFirebasePush = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState(null);
  const { user } = useAuth();

  const getVapidKey = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        console.warn('[useFirebasePush] No auth token found, skipping VAPID key fetch');
        return null;
      }

      // Ensure the URL is correctly formatted
      const url = `${BASE_URL}/configuration/push-notification/vapid-key`;
      console.log('[useFirebasePush] Fetching VAPID key from:', url);

      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.enabled && json.vapid_key) {
          console.log('[useFirebasePush] VAPID key fetched successfully');
          return json.vapid_key;
        } else {
          console.warn('[useFirebasePush] Push notifications not enabled or VAPID key not available');
          return null;
        }
      } else {
        console.warn(`[useFirebasePush] Failed to fetch VAPID key: ${res.status} ${res.statusText}`);
        return null;
      }
    } catch (error) {
      console.error('[useFirebasePush] Error fetching VAPID key:', error);
      return null;
    }
  }, []);

  const saveTokenToBackend = useCallback(async (token) => {
    try {
      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!authToken || !user?.email) return;

      const browser = navigator.userAgentData?.brands?.[0]?.brand || 'Unknown';
      const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';

      const res = await fetch(`${BASE_URL}/notification/save-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token,
          browser,
          device_type: deviceType,
          user_agent: navigator.userAgent
        })
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn('Failed to save FCM token:', res.status, text);
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }, [user]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setIsSupported(false);
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);
    return permission === 'granted';
  }, []);

  const initializeFirebase = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const vapidKey = await getVapidKey();
    if (!vapidKey) {
      return;
    }

    try {
      const firebaseConfig = {
        apiKey: "AIzaSyBY2AnonQnUUqz14ldrtw2VS2yI1VmjMxc",
        authDomain: "messaging-5fc1b.firebaseapp.com",
        projectId: "messaging-5fc1b",
        storageBucket: "messaging-5fc1b.firebasestorage.app",
        messagingSenderId: "12068341296",
        appId: "1:12068341296:web:56bc9bfdde286b58900ff5",
        measurementId: "G-V8MSGTKLW1"
      };

      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      if ('serviceWorker' in navigator) {
        try {
          let registration = await navigator.serviceWorker.getRegistration();
          
          if (!registration) {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service Worker registered for Firebase');
          }
          
          await navigator.serviceWorker.ready;
          
          if (registration.active) {
            registration.active.postMessage({
              type: 'INIT_FIREBASE',
              vapidKey: vapidKey
            });
            console.log('✅ Firebase config sent to service worker');
          }
        } catch (error) {
          console.error('Service worker error:', error);
        }
      }

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });

      if (token) {
        setFcmToken(token);
        await saveTokenToBackend(token);

        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
        });
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, [getVapidKey, requestPermission, saveTokenToBackend]);

  useEffect(() => {
    if (user?.email) {
      initializeFirebase();
    }
  }, [user, initializeFirebase]);

  return {
    fcmToken,
    isSupported,
    permission,
    requestPermission,
    initializeFirebase
  };
};

