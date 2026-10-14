"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoLogisticsAuth } from "@/hooks/useDemoLogisticsAuth";

/**
 * Hook điều phối trang Dashboard Logistics (/demo):
 * - Chờ kết quả /demo/logistics/auth/me (loading)
 * - Nếu không có phiên hợp lệ (401 / sai role) -> chuyển về /demo/login
 * - Tính toán quyền hiển thị portal theo role
 */
export function useLogisticsDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useDemoLogisticsAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/demo/login?callbackUrl=${encodeURIComponent("/demo")}`);
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/demo/login");
  };

  const role = user?.roleName;

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role,
    isStation: role === "GHN_STATION",
    isShipper: role === "GHN_SHIPPER",
    handleLogout,
  };
}
