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

const SELECTED_CART_ITEMS_KEY = "ap_selected_cart_item_ids";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(SELECTED_CART_ITEMS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return new Set<number>(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
    return new Set<number>();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState<boolean>(false);

  // Sync selectedItemIds to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          SELECTED_CART_ITEMS_KEY,
          JSON.stringify(Array.from(selectedItemIds)),
        );
      } catch {
        // ignore
      }
    }
  }, [selectedItemIds]);

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
        const newSet = new Set<number>();
        res.data.items.forEach((item) => {
          if (item.isSelected !== false && !item.isDiscontinued) {
            newSet.add(item.id);
          }
        });
        setSelectedItemIds(newSet);
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

  const activeItems = useMemo(() => {
    return items.filter((item) => !item.isDiscontinued);
  }, [items]);

  const selectedItems = useMemo(() => {
    return items.filter(
      (item) => selectedItemIds.has(item.id) && !item.isDiscontinued,
    );
  }, [items, selectedItemIds]);

  const selectedTotalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [selectedItems]);

  const selectedTotalItems = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [selectedItems]);

  const isAllSelected = useMemo(() => {
    return activeItems.length > 0 && selectedItems.length === activeItems.length;
  }, [activeItems, selectedItems]);

  // Select / Deselect actions
  const toggleSelectItem = useCallback(
    async (cartItemId: number) => {
      const targetItem = items.find((i) => i.id === cartItemId);
      if (targetItem?.isDiscontinued) {
        toast.warning("Sản phẩm hoặc phân loại hàng này đã ngừng kinh doanh.");
        return;
      }

      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        if (next.has(cartItemId)) {
          next.delete(cartItemId);
        } else {
          next.add(cartItemId);
        }
        return next;
      });

      try {
        await cartController.toggleSelectItem(cartItemId);
      } catch {
        refreshCart();
      }
    },
    [items, refreshCart],
  );

  const toggleSelectAll = useCallback(async () => {
    const nextIsSelected = !(
      activeItems.length > 0 && selectedItems.length === activeItems.length
    );
    setSelectedItemIds(() => {
      if (nextIsSelected) {
        return new Set(activeItems.map((i) => i.id));
      } else {
        return new Set();
      }
    });

    try {
      await cartController.toggleSelectAll(nextIsSelected);
    } catch {
      refreshCart();
    }
  }, [activeItems, selectedItems, refreshCart]);

  // Add to cart action with Auth Guard
  const addToCart = useCallback(
    async (
      productId: number,
      variantId?: number | null,
      quantity = 1,
    ): Promise<boolean> => {
      if (!user) {
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
          // Add newly created/updated item to selected items if not discontinued
          if (!res.data.isDiscontinued) {
            setSelectedItemIds((prev) => {
              const next = new Set(prev);
              next.add(res.data!.id);
              return next;
            });
          }

          await refreshCart();
          openMiniCart();
          return true;
        }
        return false;
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng";
        return false;
      }
    },
    [user, router, refreshCart, openMiniCart],
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
        return false;
      }
    },
    [refreshCart],
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
        return false;
      }
    },
    [refreshCart, removeItem],
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
