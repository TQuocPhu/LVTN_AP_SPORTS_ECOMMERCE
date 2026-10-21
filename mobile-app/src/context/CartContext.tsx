import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { CartItem } from '../types';
import { API_CONFIG } from '../config/api.config';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Tải giỏ hàng từ AsyncStorage khi mở app
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.CART_DATA);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch {
        // Bỏ qua lỗi đọc cache
      }
    };
    loadCart();
  }, []);

  const saveCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      await AsyncStorage.setItem(
        API_CONFIG.STORAGE_KEYS.CART_DATA,
        JSON.stringify(newItems)
      );
    } catch {
      // Bỏ qua lỗi ghi cache
    }
  };

  const addToCart = useCallback(async (newItem: CartItem) => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === newItem.id);
      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = [...prev];
        const newQty = Math.min(
          updated[existingIdx].quantity + newItem.quantity,
          newItem.stockQuantity || 99
        );
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
      } else {
        updated = [newItem, ...prev];
      }
      AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.CART_DATA, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.CART_DATA, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const updateQuantity = useCallback(async (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch {}

    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === itemId) {
          const finalQty = Math.min(qty, item.stockQuantity || 99);
          return { ...item, quantity: finalQty };
        }
        return item;
      });
      AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.CART_DATA, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    await saveCart([]);
  }, []);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
