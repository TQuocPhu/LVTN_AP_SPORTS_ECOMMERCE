import { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đặt Lại Mật Khẩu | AP Sports',
  description: 'Thiết lập mật khẩu mới cho tài khoản AP Sports của bạn.',
};

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full relative z-10 py-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm">Đang tải trang đặt lại mật khẩu...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
