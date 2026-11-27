import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { CartItem } from '../types';
import { API_CONFIG } from '../config/api.config';
import { useAuth } from './AuthContext';
import { appAlert } from './AlertContext';
import { cartController } from '../controllers/cart-controller';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loadingCart: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (item: CartItem) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

function mapServerCartItem(r: any): CartItem {
  return {
    id: r.id != null ? String(r.id) : `${r.productId}-${r.variantId || 0}`,
    cartItemId: r.id,
    productId: r.productId,
    productName: r.productName,
    productSlug: r.productSlug,
    productImage: r.mainImage,
    variantId: r.variantId,
    variantSku: r.sku,
    variantColor: r.color,
    variantSize: r.size,
    price: Number(r.price || 0),
    quantity: Number(r.quantity || 1),
    stockQuantity: r.stockQuantity != null ? Number(r.stockQuantity) : 99,
    isDiscontinued: Boolean(r.isDiscontinued),
    inStock: r.inStock !== false,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);

  const saveCache = useCallback(async (newItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem(
        API_CONFIG.STORAGE_KEYS.CART_DATA,
        JSON.stringify(newItems)
      );
    } catch {
      // Bỏ qua lỗi ghi cache
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.CART_DATA).catch(() => {});
      return;
    }

    try {
      setLoadingCart(true);
      const res = await cartController.getCart();
      const serverItems = Array.isArray(res.data?.items)
        ? res.data.items.map(mapServerCartItem)
        : [];
      setItems(serverItems);
      await saveCache(serverItems);
    } catch {
      // Fallback cache cục bộ nếu mạng chập chờn khi đã đăng nhập
      try {
        const stored = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.CART_DATA);
        if (stored) setItems(JSON.parse(stored));
      } catch {}
    } finally {
      setLoadingCart(false);
    }
  }, [isAuthenticated, saveCache]);

  // Đồng bộ giỏ hàng theo trạng thái đăng nhập (giống Web)
  useEffect(() => {
    if (authLoading) return;
    refreshCart();
  }, [authLoading, isAuthenticated, refreshCart]);

  const addToCart = useCallback(
    async (newItem: CartItem): Promise<boolean> => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        await cartController.addToCart(newItem.productId, newItem.variantId, newItem.quantity);
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        await refreshCart();
        return true;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng';
        appAlert('Không thể thêm vào giỏ', msg);
        return false;
      }
    },
    [isAuthenticated, refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      const target = items.find((i) => i.id === itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));

      if (isAuthenticated && target?.cartItemId) {
        try {
          await cartController.removeCartItem(target.cartItemId);
          await refreshCart();
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng';
          appAlert('Lỗi', msg);
          await refreshCart();
        }
      }
    },
    [items, isAuthenticated, refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, qty: number) => {
      if (qty <= 0) {
        await removeFromCart(itemId);
        return;
      }

      try {
        await Haptics.selectionAsync();
      } catch {}

      const target = items.find((i) => i.id === itemId);
      const finalQty = Math.min(qty, target?.stockQuantity || 99);

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: finalQty } : item))
      );

      if (isAuthenticated && target?.cartItemId) {
        try {
          await cartController.updateCartItem(target.cartItemId, finalQty);
          await refreshCart();
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'Không thể cập nhật số lượng';
          appAlert('Lỗi', msg);
          await refreshCart();
        }
      }
    },
    [items, isAuthenticated, removeFromCart, refreshCart]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.CART_DATA).catch(() => {});
    if (isAuthenticated) {
      try {
        await cartController.clearCart();
      } catch {}
    }
  }, [isAuthenticated]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        loadingCart,
        refreshCart,
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
