'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

/**
 * UI Component Kích Hoạt Tài Khoản (ActivateAccount).
 * Nhận token từ URL parameter, gọi API kích hoạt và hiển thị trạng thái kết quả.
 */
export default function ActivateAccount() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { activateAccount } = useAuth();
  const hasCalledRef = useRef<boolean>(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Đang xác thực mã kích hoạt tài khoản...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Mã kích hoạt tài khoản không tồn tại trên đường dẫn.');
      return;
    }

    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const verify = async () => {
      try {
        const res = await activateAccount(token);
        setStatus('success');
        setMessage(res.message || 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
      } catch (err: unknown) {
        setStatus('error');
        const msg = err instanceof Error ? err.message : 'Mã kích hoạt không hợp lệ hoặc đã hết hạn.';
        setMessage(msg);
      }
    };

    verify();
  }, [token, activateAccount]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
      {status === 'loading' && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">ĐANG KÍCH HOẠT TÀI KHOẢN</h3>
          <p className="text-sm text-slate-400">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-6 space-y-5">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">KÍCH HOẠT THÀNH CÔNG!</h3>
          <p className="text-sm text-slate-300">{message}</p>

          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/25 mt-4"
          >
            <span>ĐĂNG NHẬP NGAY</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6 space-y-5">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/40">
            <XCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-wider text-red-400">KÍCH HOẠT THẤT BẠI</h3>
          <p className="text-sm text-slate-300">{message}</p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
            >
              Đăng ký lại
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
            >
              Trang đăng nhập
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
