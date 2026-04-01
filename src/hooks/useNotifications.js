import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import Toast from '../utils/Toast';

/** Align with backend NOTIFICATION_RETENTION_DAYS (default 30) */
const RETENTION_DAYS = Math.max(
  7,
  Math.min(365, parseInt(import.meta.env.VITE_NOTIFICATION_RETENTION_DAYS || '30', 10) || 30)
);
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Recent-only list in header (enterprise-style cap) */
const BELL_MAX_ITEMS = 15;
const UNREAD_REFRESH_MS = 5 * 60 * 1000;

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    if (baseURL.startsWith('http')) {
      return baseURL;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${baseURL}`;
    }
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3232';
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3232';
};

const BASE_URL = getBaseURL();

/** Socket must connect to backend (same host as API), not frontend dev server */
const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
  const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
  const origin = (socketUrl || apiUrl).trim();
  if (origin && (origin.startsWith('http') || origin.startsWith('//'))) {
    return origin.replace(/\/api.*$/, '').replace(/\/$/, '');
  }
  if (BASE_URL && BASE_URL.startsWith('http')) {
    return BASE_URL.replace(/\/api.*$/, '').replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3232';
};

let sharedSocket = null;
let sharedSocketToken = null;
const ANOCAB_LOGO_URL = 'https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png';

function normalizeBellList(list) {
  const now = Date.now();
  const byId = new Map();
  const bySignature = new Map();
  const DEDUPE_WINDOW_MS = 2 * 60 * 1000;
  const getSignature = (n) => {
    const message = String(n?.message || '').trim().toLowerCase();
    const title = String(n?.title || '').trim().toLowerCase();
    const refId = n?.referenceId ?? n?.reference_id ?? '';
    const refType = n?.referenceType ?? n?.reference_type ?? '';
    return `${n?.type || ''}|${refType}|${refId}|${title}|${message}`;
  };
  for (const n of list) {
    if (!n || n.id == null) continue;
    const t = n.time ? new Date(n.time).getTime() : now;
    if (Number.isNaN(t) || now - t > RETENTION_MS) continue;
    const normalized = { ...n, unread: n.unread !== false };
    byId.set(n.id, normalized);

    const signature = getSignature(normalized);
    if (!signature) continue;
    const existing = bySignature.get(signature);
    if (!existing) {
      bySignature.set(signature, normalized);
      continue;
    }

    const existingTime = existing.time ? new Date(existing.time).getTime() : 0;
    const withinWindow =
      Number.isFinite(existingTime) &&
      Math.abs(existingTime - t) <= DEDUPE_WINDOW_MS;

    if (withinWindow && t > existingTime) {
      bySignature.set(signature, normalized);
    }
  }
  const dedupedBySignatureIds = new Set(
    Array.from(bySignature.values()).map((n) => n.id)
  );
  const merged = Array.from(byId.values()).filter((n) => dedupedBySignatureIds.has(n.id));
  const sorted = merged.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  return sorted.slice(0, BELL_MAX_ITEMS);
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);
  // Header badge should match the same capped list that auto-expires.
  const unreadCount = notifications.filter((n) => n.unread !== false).length;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const notificationIdsRef = useRef(new Set());

  const authToken = (() => {
    try {
      if (typeof window === 'undefined') return null;
      return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    } catch {
      return null;
    }
  })();

  const syncIdSetFromList = useCallback((list) => {
    notificationIdsRef.current = new Set(list.map((n) => n.id));
  }, []);

  const removeExpired = useCallback(() => {
    setNotifications((prev) => {
      const next = normalizeBellList(prev);
      syncIdSetFromList(next);
      return next;
    });
  }, [syncIdSetFromList]);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);

      setTimeout(() => ctx.close(), 500);
    } catch (error) {
      console.warn('Notification sound failed:', error);
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const token = authToken;
        if (!token) return;

        let wasUnread = false;
        setNotifications((prev) => {
          wasUnread = prev.some((n) => n.id === notificationId && n.unread !== false);
          const next = normalizeBellList(
            prev.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
          );
          syncIdSetFromList(next);
          return next;
        });
        if (wasUnread) {
          setServerUnreadCount((c) => Math.max(0, c - 1));
        }

        const apiPath = BASE_URL.includes('/api')
          ? `${BASE_URL}/notifications/${notificationId}/read`
          : `${BASE_URL}/api/notifications/${notificationId}/read`;
        const res = await fetch(apiPath, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          let rollbackUnread = false;
          setNotifications((prev) => {
            rollbackUnread = prev.some((n) => n.id === notificationId && n.unread === false);
            const next = normalizeBellList(
              prev.map((n) => (n.id === notificationId ? { ...n, unread: true } : n))
            );
            syncIdSetFromList(next);
            return next;
          });
          if (rollbackUnread) setServerUnreadCount((c) => c + 1);
        }
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    },
    [authToken, syncIdSetFromList]
  );

  const markAsUnread = useCallback(
    async (notificationId) => {
      try {
        const token = authToken;
        if (!token) return;

        const apiPath = BASE_URL.includes('/api')
          ? `${BASE_URL}/notifications/${notificationId}/unread`
          : `${BASE_URL}/api/notifications/${notificationId}/unread`;
        const res = await fetch(apiPath, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          let wasRead = false;
          setNotifications((prev) => {
            wasRead = prev.some((n) => n.id === notificationId && n.unread === false);
            const next = normalizeBellList(
              prev.map((n) => (n.id === notificationId ? { ...n, unread: true } : n))
            );
            syncIdSetFromList(next);
            return next;
          });
          if (wasRead) setServerUnreadCount((c) => c + 1);
        }
      } catch (error) {
        console.error('Failed to mark as unread:', error);
      }
    },
    [authToken, syncIdSetFromList]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const token = authToken;
      if (!token) return;

      const apiPath = BASE_URL.includes('/api')
        ? `${BASE_URL}/notifications/mark-all-read`
        : `${BASE_URL}/api/notifications/mark-all-read`;
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications((prev) => {
          const next = normalizeBellList(prev.map((n) => ({ ...n, unread: false })));
          syncIdSetFromList(next);
          return next;
        });
        setServerUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [authToken, syncIdSetFromList]);

  useEffect(() => {
    if (!authToken) {
      if (sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        sharedSocketToken = null;
      }
      setServerUnreadCount(0);
      setNotifications([]);
      syncIdSetFromList([]);
      return;
    }

    const apiPathForUnreadCount = () =>
      BASE_URL.includes('/api')
        ? `${BASE_URL}/notifications/unread-count`
        : `${BASE_URL}/api/notifications/unread-count`;

    const refreshUnreadCount = async () => {
      try {
        const res = await fetch(apiPathForUnreadCount(), {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          // API returns: { success: true, count }.
          if (json?.count != null) setServerUnreadCount(Number(json.count) || 0);
          return;
        }
        setServerUnreadCount(Number(json.count) || 0);
      } catch {
        // keep silent (bell UI should never break the app)
      }
    };

    // Keep bell list and badge aligned as items expire in the backend.
    const cleanupInterval = setInterval(removeExpired, 5 * 60 * 1000);
    const unreadRefreshInterval = setInterval(refreshUnreadCount, UNREAD_REFRESH_MS);

    const fetchInitialNotifications = async () => {
      try {
        const apiBase = BASE_URL.includes('/api') ? BASE_URL : `${BASE_URL}/api`;
        const apiPath = `${apiBase}/notifications?limit=${BELL_MAX_ITEMS}&offset=0`;
        const res = await fetch(apiPath, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) return;
        const initial = Array.isArray(json.data) ? json.data : [];
        const normalized = normalizeBellList(
          initial.map((n) => ({ ...n, unread: n.unread !== false }))
        );
        syncIdSetFromList(normalized);
        setNotifications(normalized);
        if (typeof json.unreadCount === 'number') {
          setServerUnreadCount(json.unreadCount);
        } else {
          setServerUnreadCount(normalized.filter((n) => n.unread !== false).length);
        }
      } catch (e) {
        // notifications UI should never break the app
      }
    };

    fetchInitialNotifications();
    refreshUnreadCount();

    let socket = sharedSocket;
    if (socket && sharedSocketToken !== authToken) {
      socket.disconnect();
      sharedSocket = null;
      sharedSocketToken = null;
      socket = null;
    }
    const isDisconnected = socket && !socket.connected && !socket.connecting;
    const shouldCreateSocket = !socket;

    if (shouldCreateSocket) {
      let socketURL = getSocketURL();
      if (!socketURL || socketURL.endsWith('/')) {
        socketURL = (socketURL || '').replace(/\/$/, '');
      }
      socket = io(socketURL, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        timeout: 20000
      });
      sharedSocket = socket;
      sharedSocketToken = authToken;
      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
      });
    } else if (isDisconnected && typeof socket.connect === 'function') {
      socket.connect();
    }

    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      console.log('✅ Socket.IO connected');
    };
    const onDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Socket.IO disconnected');
    };
    const onNotification = (notification) => {
      if (!notification || !notification.id) {
        console.warn('Invalid notification received:', notification);
        return;
      }
      if (notificationIdsRef.current.has(notification.id)) {
        console.log('⚠️ Duplicate notification ignored:', notification.id);
        return;
      }
      notificationIdsRef.current.add(notification.id);
      const nWithUnread = { ...notification, unread: notification.unread !== false };
      setNotifications((prev) => {
        const next = normalizeBellList([nWithUnread, ...prev]);
        syncIdSetFromList(next);
        return next;
      });
      if (nWithUnread.unread) {
        setServerUnreadCount((c) => c + 1);
      }
      playNotificationSound();
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(notification.title, { body: notification.message, icon: ANOCAB_LOGO_URL });
      }
    };

    const onReminderDue = (data) => {
      const msg = data?.message || 'Aapka follow-up due hai';
      Toast.info(msg);
      playNotificationSound();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);
    socket.on('reminder-due', onReminderDue);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
      socket.off('reminder-due', onReminderDue);
      clearInterval(cleanupInterval);
      clearInterval(unreadRefreshInterval);
      socketRef.current = null;
    };
  }, [removeExpired, playNotificationSound, authToken, syncIdSetFromList]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    notificationRetentionDays: RETENTION_DAYS,
    bellMaxItems: BELL_MAX_ITEMS
  };
};
