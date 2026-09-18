import { useWishlist as useWishlistFromContext } from '@/context/WishlistContext';

export function useWishlist() {
  return useWishlistFromContext();
}
