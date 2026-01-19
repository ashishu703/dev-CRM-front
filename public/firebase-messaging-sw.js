importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

let firebaseInitialized = false;
let messaging = null;
let vapidKey = null;

// Register event handlers immediately (required by Firebase)
// These must be registered on initial script evaluation

// Push event handler - must be registered immediately
self.addEventListener('push', (event) => {
  if (!messaging || !firebaseInitialized) {
    console.warn('[SW] Firebase not initialized yet, ignoring push event');
    return;
  }
  
  // Firebase messaging will handle this
  // This is just a placeholder to satisfy Firebase requirements
});

// Push subscription change handler - must be registered immediately
self.addEventListener('pushsubscriptionchange', (event) => {
  if (!messaging || !firebaseInitialized) {
    console.warn('[SW] Firebase not initialized yet, ignoring subscription change');
    return;
  }
  
  // Firebase messaging will handle this
  // This is just a placeholder to satisfy Firebase requirements
});

// Notification click handler - must be registered immediately
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

// Initialize Firebase when VAPID key is received
self.addEventListener('message', async (event) => {
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
        
        // Register background message handler
        messaging.onBackgroundMessage((payload) => {
          console.log('[SW] Background message received:', payload);
          
          const notificationTitle = payload.notification?.title || 'New Notification';
          const notificationOptions = {
            body: payload.notification?.body || '',
            icon: '/logo.png',
            badge: '/logo.png',
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

