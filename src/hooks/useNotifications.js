import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const notificationIdsRef = useRef(new Set());

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

  const calculateUnreadCount = useCallback((notifications) => {
    return notifications.filter(n => n.unread !== false).length;
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const apiPath = BASE_URL.includes('/api') ? `${BASE_URL}/notifications` : `${BASE_URL}/api/notifications`;
      
      const res = await fetch(apiPath, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) return;
      
      const json = await res.json();
      
      if (json?.success) {
        const notifications = json.data || [];
        notifications.forEach(n => notificationIdsRef.current.add(n.id));
        
        setNotifications(notifications);
        const count = calculateUnreadCount(notifications);
        setUnreadCount(count);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [calculateUnreadCount]);

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
        setNotifications(prev => {
          const updated = prev.map(n => n.id === notificationId ? { ...n, unread: false } : n);
          setUnreadCount(calculateUnreadCount(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [calculateUnreadCount]);

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
        setNotifications(prev => {
          const updated = prev.map(n => n.id === notificationId ? { ...n, unread: true } : n);
          setUnreadCount(calculateUnreadCount(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  }, [calculateUnreadCount]);

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
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetchNotifications();

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
    
    const socket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket.IO connected');
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket.IO disconnected');
    });

    socket.on('notification', (notification) => {
      console.log('📨 Received real-time notification:', notification);
      
      if (!notification || !notification.id) {
        console.warn('Invalid notification received:', notification);
        return;
      }
      
      if (!notificationIdsRef.current.has(notification.id)) {
        notificationIdsRef.current.add(notification.id);
        setNotifications(prev => {
          const updated = [{ ...notification, unread: notification.unread !== false }, ...prev];
          setUnreadCount(calculateUnreadCount(updated));
          return updated;
        });
        playNotificationSound();

        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png'
          });
        }
      } else {
        console.log('⚠️ Duplicate notification ignored:', notification.id);
      }
    });

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => socket.disconnect();
  }, [fetchNotifications, playNotificationSound, calculateUnreadCount]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};

