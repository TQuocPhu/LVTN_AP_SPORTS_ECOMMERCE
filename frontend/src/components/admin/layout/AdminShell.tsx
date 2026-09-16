'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAdminAuth();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // useEffect chỉ chạy sau khi hydration hoàn tất → router luôn sẵn sàng
    // Chỉ redirect khi loading=false để tránh vòng lặp vô tận
    if (loading) return;
    if (!user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, isLoginPage, router]);

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

  // Chưa đăng nhập hoặc vai trò CUSTOMER -> Trả về null trong lúc router redirecting
  if (!user || user.roleName === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Đang chuyển hướng về trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
