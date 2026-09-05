import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import notificationApi from '../api/notificationApi';
import useAuth from '../../auth/hooks/useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications();
      const fetched = res.data?.data?.notifications || [];
      setNotifications(fetched);
      setUnreadCount(fetched.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Initialize Socket.io connection
      // Hardcoded backend URL for local demo purposes
      const socket = io('http://localhost:5000');

      socket.on('connect', () => {
        socket.emit('join', user.id); // Join personal room
      });

      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return { notifications, unreadCount, markAsRead };
}
