"use client";

import { useAdminAuth as useAdminAuthFromContext } from "@/context/AdminAuthContext";

/**
 * Custom hook lấy trạng thái xác thực Admin Portal từ AdminAuthProvider.
 */
export function useAdminAuth() {
  return useAdminAuthFromContext();
}
