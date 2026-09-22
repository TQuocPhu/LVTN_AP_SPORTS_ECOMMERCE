"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { wishlistController } from "@/controllers/wishlist-controller";
import { WishlistResponse } from "@/types/wishlist";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistProductIds: Set<number>;
  wishlistItems: WishlistResponse[];
  wishlistCount: number;
  isLoading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (
    productId: number,
    productDetails?: Partial<WishlistResponse>,
  ) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

const LOCAL_STORAGE_WISHLIST_KEY = "ap_sports_guest_wishlist_ids";
const LOCAL_STORAGE_WISHLIST_ITEMS = "ap_sports_guest_wishlist_items";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(
    new Set(),
  );
  const [wishlistItems, setWishlistItems] = useState<WishlistResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Read LocalStorage for guest users
  const loadGuestWishlist = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const savedIds = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
      const savedItems = localStorage.getItem(LOCAL_STORAGE_WISHLIST_ITEMS);
      if (savedIds) {
        const parsedIds: number[] = JSON.parse(savedIds);
        setWishlistProductIds(new Set(parsedIds));
      }
      if (savedItems) {
        setWishlistItems(JSON.parse(savedItems));
      }
    } catch {
      // Fallback
    }
  }, []);

  // Fetch from backend for authenticated users
  const loadBackendWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const idsRes = await wishlistController.getWishlistProductIds();
      if (idsRes.data) {
        setWishlistProductIds(new Set(idsRes.data));
      }
      const res = await wishlistController.getWishlist(0, 50);
      if (res.data?.content) {
        setWishlistItems(res.data.content);
      }
    } catch {
      // Fallback to guest wishlist if API fails
      loadGuestWishlist();
    } finally {
      setIsLoading(false);
    }
  }, [loadGuestWishlist]);

  useEffect(() => {
    if (user) {
      loadBackendWishlist();
    } else {
      loadGuestWishlist();
      setIsLoading(false);
    }
  }, [user, loadBackendWishlist, loadGuestWishlist]);

  const isInWishlist = useCallback(
    (productId: number): boolean => {
      return wishlistProductIds.has(productId);
    },
    [wishlistProductIds],
  );

  const toggleWishlist = async (
    productId: number,
    productDetails?: Partial<WishlistResponse>,
  ): Promise<boolean> => {
    const isCurrentlyFav = wishlistProductIds.has(productId);
    const newFavState = !isCurrentlyFav;

    if (user) {
      // API sync via wishlistController
      try {
        const res = await wishlistController.toggleWishlist(productId);
        const statusData = res.data;
        const updatedIds = new Set(wishlistProductIds);

        if (statusData?.isFavorite) {
          updatedIds.add(productId);
          // toast.success('Đã thêm sản phẩm vào danh sách yêu thích!');
        } else {
          updatedIds.delete(productId);
          toast.info("Đã xóa sản phẩm khỏi danh sách yêu thích.");
        }
        setWishlistProductIds(updatedIds);

        // Refresh full items list
        const listRes = await wishlistController.getWishlist(0, 50);
        if (listRes.data?.content) {
          setWishlistItems(listRes.data.content);
        }
        return statusData?.isFavorite ?? newFavState;
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Lỗi khi tương tác danh sách yêu thích";
        // toast.error(errorMsg);
        return isCurrentlyFav;
      }
    } else {
      // LocalStorage sync for guest users
      const updatedIds = new Set(wishlistProductIds);
      let updatedItems = [...wishlistItems];

      if (newFavState) {
        updatedIds.add(productId);
        if (productDetails) {
          const newItem: WishlistResponse = {
            id: Date.now(),
            productId,
            name: productDetails.name || "Sản phẩm AP Sports",
            slug: productDetails.slug || "",
            mainImage: productDetails.mainImage || "",
            price: productDetails.price || 0,
            salePrice: productDetails.salePrice,
            unit: productDetails.unit || "sản phẩm",
            inStock: productDetails.inStock !== false,
            primaryCategoryName:
              productDetails.primaryCategoryName || "AP Sports",
            addedAt: new Date().toISOString(),
          };
          updatedItems = [
            newItem,
            ...updatedItems.filter((i) => i.productId !== productId),
          ];
        }
        // toast.success('Đã thêm vào danh sách yêu thích!');
      } else {
        updatedIds.delete(productId);
        updatedItems = updatedItems.filter((i) => i.productId !== productId);
        toast.info("Đã xóa khỏi danh sách yêu thích.");
      }

      setWishlistProductIds(updatedIds);
      setWishlistItems(updatedItems);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          LOCAL_STORAGE_WISHLIST_KEY,
          JSON.stringify(Array.from(updatedIds)),
        );
        localStorage.setItem(
          LOCAL_STORAGE_WISHLIST_ITEMS,
          JSON.stringify(updatedItems),
        );
      }

      return newFavState;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    await toggleWishlist(productId);
  };

  const refreshWishlist = async () => {
    if (user) {
      await loadBackendWishlist();
    } else {
      loadGuestWishlist();
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        wishlistItems,
        wishlistCount: wishlistProductIds.size,
        isLoading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
