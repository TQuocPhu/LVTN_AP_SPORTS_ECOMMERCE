import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '403 - Access Denied | AP Sports',
  description: 'Bạn không có quyền truy cập vào tài nguyên này.',
};

export default function ForbiddenPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        {/* Animated Badge & Icon */}
        <div className="flex justify-center">
          <div className="relative p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
            <ShieldAlert className="w-16 h-16 stroke-[1.5]" />
            <span className="absolute -top-2 -right-2 px-2.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full uppercase tracking-wider">
              403
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Truy Cập Bị Từ Chối
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Bạn không có vai trò hoặc quyền hạn phù hợp để truy cập vào trang quản trị này. Nếu bạn nghĩ đây là sự nhầm lẫn, vui lòng liên hệ quản trị viên AP Sports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-red-600/30 hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Trang Chủ
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-all duration-200 hover:scale-[1.02]"
          >
            <LogIn className="w-4 h-4 text-slate-400" />
            Đăng Nhập Lại
          </Link>
        </div>
      </div>
    </main>
  );
}
