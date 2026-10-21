import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authController } from '../controllers/auth-controller';
import { API_CONFIG } from '../config/api.config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khôi phục session khi mở app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          const res = await authController.getMe();
          setUser(res.data);
        }
      } catch (err) {

        // Token hết hạn hoặc không hợp lệ -> xóa sạch
        await SecureStore.deleteItemAsync(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authController.login(email, pass);
      const data = res.data;
      if (data.tokens?.accessToken) {
        await SecureStore.setItemAsync(
          API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          data.tokens.accessToken
        );
        if (data.tokens.refreshToken) {
          await SecureStore.setItemAsync(
            API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
            data.tokens.refreshToken
          );
        }
      }
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authController.logout();
    } finally {
      await SecureStore.deleteItemAsync(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authController.getMe();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
