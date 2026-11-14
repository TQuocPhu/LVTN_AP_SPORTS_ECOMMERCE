'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { Loader2, WifiOff, RotateCw } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error, refetchAdmin } = useAdminAuth();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // useEffect chỉ chạy sau khi hydration hoàn tất → router luôn sẵn sàng
    // Chỉ redirect khi loading=false và không phải lỗi kết nối tạm thời
    if (loading || error) return;
    if (!user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, error, isLoginPage, router]);

  // Nếu là trang đăng nhập, render trực tiếp không bọc Header/Sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Đang tải trạng thái xác thực Admin
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu quản trị...</p>
      </div>
    );
  }

  // Lỗi mạng / Backend tạm thời chưa phản hồi -> Không đá về trang đăng nhập, cho phép thử lại
  if (!user && error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <WifiOff className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Không thể kết nối tới máy chủ</h2>
        <p className="text-sm text-slate-600 max-w-md mb-5">{error}</p>
        <button
          type="button"
          onClick={() => refetchAdmin()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Thử kết nối lại</span>
        </button>
      </div>
    );
  }

  // Chưa đăng nhập hoặc vai trò CUSTOMER -> Trả về null trong lúc router redirecting
  if (!user || user.roleName === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Đang chuyển hướng về trang đăng nhập...</p>
      </div>
    );
  }

  const isSupportChat = pathname === '/admin/support-chat';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-slate-900 bg-slate-50">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main
          className={`flex-1 bg-slate-50 ${
            isSupportChat ? 'p-0 overflow-hidden flex flex-col' : 'p-6 overflow-y-auto'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
