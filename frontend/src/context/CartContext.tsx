"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cartController } from "@/controllers/cart-controller";
import { CartItem, CartSummary } from "@/types/cart";
import { toast } from "sonner";

interface CartContextType {
  cartSummary: CartSummary | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isMiniCartOpen: boolean;
  selectedItemIds: Set<number>;
  selectedItems: CartItem[];
  selectedTotalPrice: number;
  selectedTotalItems: number;
  isAllSelected: boolean;

  // Actions
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
  toggleSelectItem: (cartItemId: number) => void;
  toggleSelectAll: () => void;
  addToCart: (
    productId: number,
    variantId?: number | null,
    quantity?: number,
  ) => Promise<boolean>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);

  const openMiniCart = useCallback(() => setIsMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setIsMiniCartOpen(false), []);
  const toggleMiniCart = useCallback(
    () => setIsMiniCartOpen((prev) => !prev),
    [],
  );

  // Refresh cart from backend
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartSummary(null);
      setSelectedItemIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const res = await cartController.getCart();
      if (res.data) {
        setCartSummary(res.data);
        // Default: select all items when loaded if selectedItemIds is empty or sync existing
        setSelectedItemIds((prevSelected) => {
          const newSet = new Set<number>();
          res.data?.items.forEach((item) => {
            // Keep previously selected status, or select by default if initial load
            if (prevSelected.size === 0 || prevSelected.has(item.id)) {
              newSet.add(item.id);
            }
          });
          return newSet;
        });
      }
    } catch {
      // Handled by apiClient suppressErrorToast
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  // Derived computations
  const items = useMemo(() => cartSummary?.items || [], [cartSummary]);
  const totalItems = useMemo(() => cartSummary?.totalItems || 0, [cartSummary]);
  const totalPrice = useMemo(() => cartSummary?.totalPrice || 0, [cartSummary]);

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedItemIds.has(item.id));
  }, [items, selectedItemIds]);

  const selectedTotalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [selectedItems]);

  const selectedTotalItems = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [selectedItems]);

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedItems.length === items.length;
  }, [items, selectedItems]);

  // Select / Deselect actions
  const toggleSelectItem = useCallback((cartItemId: number) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartItemId)) {
        next.delete(cartItemId);
      } else {
        next.add(cartItemId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedItemIds((prev) => {
      if (items.length > 0 && prev.size === items.length) {
        return new Set(); // Unselect all
      } else {
        return new Set(items.map((i) => i.id)); // Select all
      }
    });
  }, [items]);

  // Add to cart action with Auth Guard
  const addToCart = useCallback(
    async (
      productId: number,
      variantId?: number | null,
      quantity = 1,
    ): Promise<boolean> => {
      if (!user) {
        // toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "/cart";
        router.push(
          `/login?callbackUrl=${encodeURIComponent(currentPath)}&reason=login_required`,
        );
        return false;
      }

      try {
        const res = await cartController.addToCart({
          productId,
          variantId: variantId || null,
          quantity,
        });

        if (res.data) {
          // Add newly created/updated item to selected items
          setSelectedItemIds((prev) => {
            const next = new Set(prev);
            next.add(res.data!.id);
            return next;
          });

          await refreshCart();
          openMiniCart();
          return true;
        }
        return false;
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng";
        // toast.error(errorMsg);
        return false;
      }
    },
    [user, router, refreshCart, openMiniCart],
  );

  // Update quantity action
  const updateQuantity = useCallback(
    async (cartItemId: number, newQuantity: number): Promise<boolean> => {
      if (newQuantity <= 0) {
        return removeItem(cartItemId);
      }

      try {
        const res = await cartController.updateCartItem(cartItemId, {
          quantity: newQuantity,
        });
        if (res.data) {
          await refreshCart();
          return true;
        }
        return false;
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Không thể cập nhật số lượng";
        // toast.error(errorMsg);
        return false;
      }
    },
    [refreshCart],
  );

  // Remove item action
  const removeItem = useCallback(
    async (cartItemId: number): Promise<boolean> => {
      try {
        await cartController.removeCartItem(cartItemId);
        setSelectedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(cartItemId);
          return next;
        });
        await refreshCart();
        return true;
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Không thể xóa sản phẩm khỏi giỏ hàng";
        // toast.error(errorMsg);
        return false;
      }
    },
    [refreshCart],
  );

  // Clear cart action
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      await cartController.clearCart();
      setSelectedItemIds(new Set());
      await refreshCart();
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể dọn dẹp giỏ hàng";
      // toast.error(errorMsg);
      return false;
    }
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartSummary,
        items,
        totalItems,
        totalPrice,
        isLoading,
        isMiniCartOpen,
        selectedItemIds,
        selectedItems,
        selectedTotalPrice,
        selectedTotalItems,
        isAllSelected,
        openMiniCart,
        closeMiniCart,
        toggleMiniCart,
        toggleSelectItem,
        toggleSelectAll,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
