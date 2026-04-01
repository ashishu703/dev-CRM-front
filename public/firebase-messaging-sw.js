importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

let firebaseInitialized = false;
let messaging = null;
let vapidKey = null;
const ANOCAB_LOGO_URL = 'https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png';

self.addEventListener('push', (event) => {
  // Fallback handler so early push events are not dropped before Firebase init.
  try {
    const payload = event.data ? event.data.json() : {};
    const notificationTitle = payload?.notification?.title || payload?.data?.title || 'New Notification';
    const notificationOptions = {
      body: payload?.notification?.body || payload?.data?.body || '',
      icon: payload?.data?.logo || ANOCAB_LOGO_URL,
      badge: payload?.data?.logo || ANOCAB_LOGO_URL,
      data: payload?.data || {},
      requireInteraction: false,
      tag: payload?.data?.notificationId || 'notification'
    };
    event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
  } catch (err) {
    console.warn('[SW] push fallback parse failed:', err);
  }
});

self.addEventListener('pushsubscriptionchange', (event) => {
  if (!messaging || !firebaseInitialized) {
    console.warn('[SW] Firebase not initialized yet, ignoring subscription change');
    return;
  }
  
  
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    try {
      vapidKey = event.data.vapidKey;
      
      if (!vapidKey) {
        console.error('[SW] VAPID key not provided');
        return;
      }

      if (!firebaseInitialized) {
        const firebaseConfig = {
          apiKey: "AIzaSyBY2AnonQnUUqz14ldrtw2VS2yI1VmjMxc",
          authDomain: "messaging-5fc1b.firebaseapp.com",
          projectId: "messaging-5fc1b",
          storageBucket: "messaging-5fc1b.firebasestorage.app",
          messagingSenderId: "12068341296",
          appId: "1:12068341296:web:56bc9bfdde286b58900ff5",
          measurementId: "G-V8MSGTKLW1"
        };
        
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        firebaseInitialized = true;
        
        console.log('[SW] Firebase initialized successfully');
        
        messaging.onBackgroundMessage((payload) => {
          console.log('[SW] Background message received:', payload);
          
          const notificationTitle = payload.notification?.title || 'New Notification';
          const notificationOptions = {
            body: payload.notification?.body || '',
            icon: payload?.data?.logo || ANOCAB_LOGO_URL,
            badge: payload?.data?.logo || ANOCAB_LOGO_URL,
            data: payload.data || {},
            requireInteraction: false,
            tag: payload.data?.notificationId || 'notification'
          };
          
          return self.registration.showNotification(notificationTitle, notificationOptions);
        });
      }
    } catch (error) {
      console.error('[SW] Firebase initialization error:', error);
    }
  }
});

