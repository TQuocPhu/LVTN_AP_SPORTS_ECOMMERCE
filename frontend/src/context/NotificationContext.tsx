"use client";

import React, { createContext, useContext } from 'react';
import { useWebSocket, NotificationPayload } from '@/hooks/useWebSocket';

interface NotificationContextType {
  isConnected: boolean;
  notifications: NotificationPayload[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  isConnected: false,
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const wsState = useWebSocket();

  return (
    <NotificationContext.Provider
      value={{
        isConnected: wsState.isConnected,
        notifications: wsState.notifications,
        unreadCount: wsState.unreadCount,
        markAsRead: wsState.markAsRead,
        markAllAsRead: wsState.markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}
