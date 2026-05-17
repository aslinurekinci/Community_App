import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { NotificationItem, NotificationType } from '../types';

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (type: NotificationType, text?: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const NOTIFICATION_TEXT: Record<NotificationType, string> = {
  like: 'Gönderiyi beğendiniz.',
  comment: 'Gönderiye yorum yaptınız.',
  post: 'Gönderiniz paylaşıldı.',
  bookmark: 'Gönderi yer imlerine eklendi.',
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  const addNotification = useCallback(
    (type: NotificationType, text?: string) => {
      const item: NotificationItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        text: text ?? NOTIFICATION_TEXT[type],
        read: false,
        timestamp: Date.now(),
      };
      setNotifications(prev => [item, ...prev]);
    },
    [],
  );

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
