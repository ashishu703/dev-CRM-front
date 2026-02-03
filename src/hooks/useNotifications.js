import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const NOTIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

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
      return 'http://localhost:4500/api';
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4500/api';
};

const BASE_URL = getBaseURL();

let sharedSocket = null;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => n.unread !== false).length;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const notificationIdsRef = useRef(new Set());
  const expiryTimersRef = useRef(new Map());

  const removeExpired = useCallback(() => {
    const now = Date.now();
    setNotifications(prev => {
      const filtered = prev.filter(n => {
        const time = n.time ? (new Date(n.time)).getTime() : 0;
        return (now - time) < NOTIFICATION_TTL_MS;
      });
      return filtered;
    });
  }, []);

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

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const apiPath = BASE_URL.includes('/api') ? `${BASE_URL}/notifications/${notificationId}/read` : `${BASE_URL}/api/notifications/${notificationId}/read`;
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, unread: false } : n));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const markAsUnread = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const apiPath = BASE_URL.includes('/api') ? `${BASE_URL}/notifications/${notificationId}/unread` : `${BASE_URL}/api/notifications/${notificationId}/unread`;
      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, unread: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const apiPath = BASE_URL.includes('/api') ? `${BASE_URL}/notifications/mark-all-read` : `${BASE_URL}/api/notifications/mark-all-read`;
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const cleanupInterval = setInterval(removeExpired, 60 * 60 * 1000);

    let socket = sharedSocket;
    const isDisconnected = socket && !socket.connected && !socket.connecting;
    const shouldCreateSocket = !socket;

    if (shouldCreateSocket) {
      let socketURL;
      if (BASE_URL.includes('/api')) {
        socketURL = BASE_URL.split('/api')[0].trim();
      } else if (BASE_URL.includes('localhost:4500')) {
        socketURL = 'http://localhost:4500';
      } else {
        socketURL = typeof window !== 'undefined' ? window.location.origin : BASE_URL;
      }
      if (!socketURL || socketURL.endsWith('/')) {
        socketURL = socketURL.replace(/\/$/, '');
      }
      socket = io(socketURL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        timeout: 20000,
      });
      sharedSocket = socket;
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
      if (!notificationIdsRef.current.has(notification.id)) {
        notificationIdsRef.current.add(notification.id);
        const nWithUnread = { ...notification, unread: notification.unread !== false };
        setNotifications(prev => [nWithUnread, ...prev]);
        playNotificationSound();
        const timer = setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
          notificationIdsRef.current.delete(notification.id);
          expiryTimersRef.current.delete(notification.id);
        }, NOTIFICATION_TTL_MS);
        expiryTimersRef.current.set(notification.id, timer);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(notification.title, { body: notification.message, icon: '/logo.png' });
        }
      } else {
        console.log('⚠️ Duplicate notification ignored:', notification.id);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
      clearInterval(cleanupInterval);
      expiryTimersRef.current.forEach(t => clearTimeout(t));
      expiryTimersRef.current.clear();
      socketRef.current = null;
    };
  }, [removeExpired, playNotificationSound]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAsUnread,
    markAllAsRead
  };
};

