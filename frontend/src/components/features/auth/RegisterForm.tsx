'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

/**
 * UI Component Form Đăng Ký Tài Khoản Khách Hàng (RegisterForm).
 * Tuân thủ Clean Page Rule: Toàn bộ JSX Form & State xử lý ở Component này, file page.tsx chỉ gọi nhúng.
 */
export default function RegisterForm() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validation cơ bản phía Client
    if (!formData.name.trim()) {
      setFormError('Họ và tên không được để trống.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email không được để trống.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const res = await register(formData);
      setSuccessMessage(res.message || 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
      
      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        router.push('/login');
      }, 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký không thành công. Vui lòng thử lại.';
      setFormError(msg);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">
          TẠO TÀI KHOẢN MỚI
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Trở thành thành viên AP Sports để nhận ưu đãi thể thao độc quyền
        </p>
      </div>

      {/* Thông báo Lỗi */}
      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{formError}</span>
        </div>
      )}

      {/* Thông báo Thành công */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Đăng ký thành công!</p>
            <p className="mt-0.5">{successMessage}</p>
            <p className="text-xs text-emerald-400/80 mt-2">Đang tự động chuyển hướng đến trang Đăng nhập...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input Họ và Tên */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Họ và tên <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Input Email */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Địa chỉ Email <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Input Mật khẩu */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Mật khẩu <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Input Xác nhận mật khẩu */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Xác nhận mật khẩu <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1"
              title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nút Submit */}
        {(() => {
          const hasInput = Boolean(
            formData.name.trim() &&
            formData.email.trim() &&
            formData.password.trim() &&
            formData.confirmPassword.trim()
          );
          return (
            <button
              type="submit"
              disabled={loading || !hasInput}
              className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ĐANG XỬ LÝ...</span>
                </>
              ) : (
                <>
                  <span>ĐĂNG KÝ TÀI KHOẢN</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          );
        })()}
      </form>

      {/* Footer Chuyển hướng */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          Đã có tài khoản AP Sports?{' '}
          <Link href="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
