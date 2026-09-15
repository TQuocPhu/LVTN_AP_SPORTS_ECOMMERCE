import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Quên Mật Khẩu | AP Sports',
  description: 'Yêu cầu đặt lại mật khẩu cho tài khoản AP Sports của bạn.',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full relative z-10 py-10">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
